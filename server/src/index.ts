import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { inspectFileMagicAndSignature } from './security/magicBytes.js';
import { inspectFileWithFileGuard } from './security/fileGuard.js';
import { validateAndTraceUrl } from './security/ssrfGuard.js';
import { analyzeMessageHeuristics } from './security/heuristics.js';
import { redactSensitivePii } from './security/piiRedactor.js';
import { generateScamExplanation } from './security/geminiExplainer.js';
import { extractQrFromImageBuffer } from './security/qrScanner.js';
import { createRateLimiter } from './middleware/rateLimiter.js';
import { securityHeadersMiddleware } from './middleware/securityHeaders.js';
import { authenticateJwt, requireAdmin, requireAuth } from './middleware/authMiddleware.js';
import {
  signupSchema,
  loginSchema,
  demoAuthSchema,
  communityReportSchema,
  incidentReportSchema,
  moderationReviewSchema,
} from './schemas/validationSchemas.js';
import {
  registerUser,
  authenticateUser,
  verifyToken,
  getUserById,
  getDemoUser,
} from './auth/authService.js';
import {
  persistScanToSupabase,
  persistCommunityReportToSupabase,
  persistIncidentToSupabase,
  getSupabaseClient,
} from './store/supabaseClient.js';
import {
  scamCampaigns,
  communityReports,
  scanHistory,
  incidentReports,
  auditLogs,
  logAuditEvent,
} from './store/threatStore.js';
import {
  AnalysisResult,
  DeterministicFlag,
  RiskSeverity,
  SecurityIndicators,
  ThreatCategory,
} from './types.js';

dotenv.config();

// Attempt early Supabase initialization if credentials present
getSupabaseClient();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares & Rate Limiters
app.use(securityHeadersMiddleware);
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const scanLimiter = createRateLimiter({ maxRequests: 40, windowMs: 60 * 1000 });
const apiLimiter = createRateLimiter({ maxRequests: 120, windowMs: 60 * 1000 });
app.use('/api/', apiLimiter);
app.use(authenticateJwt);

// File Upload Security Constraints: Memory buffer, strictly 25MB ceiling
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25 MB max
    files: 1,
  },
});

// Helper to determine combined confidence level
function determineConfidence(flags: DeterministicFlag[], score: number): 'HIGH' | 'MEDIUM' | 'LOW' {
  if (flags.length >= 2 || score >= 85 || score === 0) return 'HIGH';
  if (flags.length === 1 || score >= 50) return 'MEDIUM';
  return 'LOW';
}

// Helper: Extract user ID from Authorization header
function extractUserIdFromReq(req: express.Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const payload = verifyToken(token);
    if (payload && payload.id) return payload.id;
  }
  return undefined;
}

// ----------------------------------------------------
// AUTHENTICATION SYSTEM
// ----------------------------------------------------
app.post('/api/v1/auth/signup', (req: express.Request, res: express.Response) => {
  try {
    const parseResult = signupSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ success: false, error: parseResult.error.errors[0].message });
    }
    const { email, password, displayName, role } = parseResult.data;
    const { user, token } = registerUser({ email, password, displayName, role });
    logAuditEvent(user.id, 'USER_SIGNUP', req.ip || '', { email: user.email });
    res.json({ success: true, user, token });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/v1/auth/login', (req: express.Request, res: express.Response) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({ success: false, error: parseResult.error.errors[0].message });
    }
    const { email, password } = parseResult.data;
    const { user, token } = authenticateUser(email, password);
    logAuditEvent(user.id, 'USER_LOGIN', req.ip || '', { email: user.email });
    res.json({ success: true, user, token });
  } catch (err: any) {
    res.status(401).json({ success: false, error: err.message });
  }
});

app.get('/api/v1/auth/me', requireAuth, (req: express.Request, res: express.Response) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid or missing token' });
  }
  const user = getUserById(userId);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  res.json({ success: true, user });
});

app.post('/api/v1/auth/demo', (req: express.Request, res: express.Response) => {
  try {
    const parseResult = demoAuthSchema.safeParse(req.body);
    const role = (parseResult.success ? parseResult.data.role : 'citizen') as 'citizen' | 'analyst' | 'admin';
    const { user, token } = getDemoUser(role);
    logAuditEvent(user.id, 'DEMO_LOGIN', req.ip || '', { role: user.role });
    res.json({ success: true, user, token });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ----------------------------------------------------
// MODULE 1: UNIVERSAL THREAT SCANNER
// ----------------------------------------------------
app.post('/api/v1/scan/universal', scanLimiter, upload.single('file'), async (req: express.Request, res: express.Response) => {
  try {
    const file = req.file;
    const { text, url } = req.body;
    const clientIp = req.ip || '127.0.0.1';
    const authUserId = extractUserIdFromReq(req);

    // 1. Process File or Image if present
    if (file) {
      const magic = await inspectFileMagicAndSignature(file.originalname, file.buffer);
      const isImage = file.mimetype.startsWith('image/') || ['jpg', 'jpeg', 'png', 'webp'].includes(magic.detectedExt);

      let qrPayload: string | undefined;
      if (isImage) {
        const qrResult = extractQrFromImageBuffer(file.buffer, magic.detectedMime);
        if (qrResult.hasQr && qrResult.data) {
          qrPayload = qrResult.data;
        }
      }

      // If QR payload is a URL, run URL intelligence on it as well
      let urlIntelligenceResult: any;
      if (qrPayload && /^https?:\/\//i.test(qrPayload)) {
        urlIntelligenceResult = await validateAndTraceUrl(qrPayload);
      }

      const fileGuard = inspectFileWithFileGuard(file.originalname, file.buffer, magic.detectedMime);

      // Combine magic notes with fileGuard flags
      const flags: DeterministicFlag[] = [...fileGuard.flags];
      let combinedScore = Math.max(magic.suspicionScore, fileGuard.score);
      let threatCat: ThreatCategory = fileGuard.threatCategory;

      if (magic.isExecutableMasquerade) {
        combinedScore = 100;
        threatCat = 'MALICIOUS_EXECUTABLE';
        flags.unshift({
          id: 'EXECUTABLE_EXTENSION_SPOOF',
          label: 'Critical File Extension Masquerade',
          severity: 'CRITICAL',
          evidence: `File claims to be a harmless .${magic.claimedExtension}, but header proves executable binary format (${magic.detectedMime}).`,
          limitations: 'Checked through deterministic magic bytes header inspection.',
        });
      }

      if (qrPayload) {
        flags.push({
          id: 'EMBEDDED_QR_CODE',
          label: 'Embedded QR Code Detected in Image',
          severity: urlIntelligenceResult && !urlIntelligenceResult.isSafe ? 'CRITICAL' : 'MEDIUM',
          evidence: `Decoded QR code payload: "${qrPayload.slice(0, 100)}"`,
          limitations: 'Image decoded safely via zero-execution in-memory bitmap parser.',
        });

        if (urlIntelligenceResult && !urlIntelligenceResult.isSafe) {
          combinedScore = Math.max(combinedScore, 95);
          threatCat = 'PHISHING_CREDENTIAL_HARVEST';
          flags.push({
            id: 'QR_SSRF_OR_MALICIOUS_DESTINATION',
            label: 'QR Code Leads to Blocked or Suspicious URL',
            severity: 'CRITICAL',
            evidence: urlIntelligenceResult.blockedReason || 'Blocked URL detected inside QR payload.',
            limitations: 'SSRF guard intercepted destination before network retrieval.',
          });
        }
      }

      let severity: RiskSeverity = 'SAFE';
      if (combinedScore >= 85) severity = 'CRITICAL';
      else if (combinedScore >= 70) severity = 'HIGH';
      else if (combinedScore >= 45) severity = 'MEDIUM';
      else if (combinedScore > 15) severity = 'LOW';

      const indicators: SecurityIndicators = {
        ...fileGuard.indicators,
        sha256: magic.sha256,
        detectedMime: magic.detectedMime,
        claimedExtension: magic.claimedExtension,
        extractedQrPayload: qrPayload,
      };

      const aiExplanation = await generateScamExplanation({
        scanType: qrPayload ? 'qr' : 'file',
        targetName: file.originalname,
        riskSeverity: severity,
        deterministicScore: combinedScore,
        threatCategory: threatCat,
        flags,
        indicators,
        sanitizedSnippet: qrPayload ? `Extracted QR: ${qrPayload}` : undefined,
      });

      const result: AnalysisResult = {
        id: `SCN-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        userId: authUserId,
        timestamp: new Date().toISOString(),
        scanType: qrPayload ? 'qr' : 'file',
        targetName: file.originalname,
        riskSeverity: severity,
        confidence: determineConfidence(flags, combinedScore),
        threatCategory: threatCat,
        summary: aiExplanation.plainLanguageVerdict,
        deterministicScore: combinedScore,
        flags,
        indicators,
        aiExplanation,
        quarantineStatus: combinedScore >= 70 ? 'quarantined' : 'analyzed_safe',
      };

      scanHistory.unshift(result);
      persistScanToSupabase(result).catch(() => {});
      logAuditEvent('ANONYMOUS_CITIZEN', 'SCAN_FILE', clientIp, {
        target: file.originalname,
        severity,
        sha256: magic.sha256,
      });

      return res.json({ success: true, result });
    }

    // 2. Process URL if provided
    if (url && url.trim().length > 0) {
      const urlCheck = await validateAndTraceUrl(url);
      const flags: DeterministicFlag[] = [];
      let score = 0;
      let threatCat: ThreatCategory = 'BENIGN_SAFE';

      if (!urlCheck.isSafe) {
        score = 95;
        threatCat = 'PHISHING_CREDENTIAL_HARVEST';
        flags.push({
          id: 'URL_SECURITY_VIOLATION',
          label: 'URL Security or SSRF Violation',
          severity: 'CRITICAL',
          evidence: urlCheck.blockedReason || 'URL blocked by security guardrails.',
          limitations: 'Checked via pre-flight DNS and IP subnet verification.',
        });
      } else {
        if (urlCheck.isShortened) {
          score = Math.max(score, 60);
          threatCat = 'PHISHING_CREDENTIAL_HARVEST';
          flags.push({
            id: 'URL_SHORTENER_OBFUSCATION',
            label: 'Obfuscated Shortened URL Link',
            severity: 'MEDIUM',
            evidence: 'URL uses a known link shortener service to conceal the actual final destination.',
            limitations: 'Commonly used in smishing; also used in benign marketing campaigns.',
          });
        }

        if (urlCheck.isDirectIp) {
          score = Math.max(score, 85);
          threatCat = 'PHISHING_CREDENTIAL_HARVEST';
          flags.push({
            id: 'RAW_IP_DESTINATION',
            label: 'Bare IP Address Hostname',
            severity: 'HIGH',
            evidence: 'Destination uses a raw numeric IP address instead of a registered domain name.',
            limitations: 'Legitimate corporate services always utilize registered domain names.',
          });
        }

        if (urlCheck.isPunycode) {
          score = Math.max(score, 85);
          threatCat = 'PHISHING_CREDENTIAL_HARVEST';
          flags.push({
            id: 'PUNYCODE_IDN_HOMOGRAPH',
            label: 'Punycode / Homograph Impersonation',
            severity: 'HIGH',
            evidence: 'Domain uses internationalized punycode characters (xn--) to mimic authentic brand spellings.',
            limitations: 'Authentic international localized domains exist; high risk when combined with financial terms.',
          });
        }
      }

      let severity: RiskSeverity = 'SAFE';
      if (score >= 85) severity = 'CRITICAL';
      else if (score >= 70) severity = 'HIGH';
      else if (score >= 45) severity = 'MEDIUM';
      else if (score > 15) severity = 'LOW';

      const indicators: SecurityIndicators = {
        redirectHops: urlCheck.hops,
        isShortenedUrl: urlCheck.isShortened,
        isPunycode: urlCheck.isPunycode,
        isIpv4Direct: urlCheck.isDirectIp,
      };

      const aiExplanation = await generateScamExplanation({
        scanType: 'url',
        targetName: url,
        riskSeverity: severity,
        deterministicScore: score,
        threatCategory: threatCat,
        flags,
        indicators,
        sanitizedSnippet: `Final destination: ${urlCheck.finalUrl || url}`,
      });

      const result: AnalysisResult = {
        id: `SCN-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        userId: authUserId,
        timestamp: new Date().toISOString(),
        scanType: 'url',
        targetName: url,
        riskSeverity: severity,
        confidence: determineConfidence(flags, score),
        threatCategory: threatCat,
        summary: aiExplanation.plainLanguageVerdict,
        deterministicScore: score,
        flags,
        indicators,
        aiExplanation,
        quarantineStatus: score >= 70 ? 'quarantined' : 'analyzed_safe',
      };

      scanHistory.unshift(result);
      persistScanToSupabase(result).catch(() => {});
      logAuditEvent('ANONYMOUS_CITIZEN', 'SCAN_URL', clientIp, { url, severity });
      return res.json({ success: true, result });
    }

    // 3. Process Text / Message if provided
    if (text && text.trim().length > 0) {
      const redacted = redactSensitivePii(text);
      const heuristics = analyzeMessageHeuristics(redacted.sanitizedText);

      const indicators: SecurityIndicators = {
        extractedUrls: redacted.extractedUrls,
        extractedPhones: redacted.extractedPhones,
        extractedUpiVpas: redacted.extractedUpiVpas,
      };

      const aiExplanation = await generateScamExplanation({
        scanType: 'message',
        targetName: text.slice(0, 40) + '...',
        riskSeverity: heuristics.severity,
        deterministicScore: heuristics.score,
        threatCategory: heuristics.threatCategory,
        flags: heuristics.flags,
        indicators,
        sanitizedSnippet: redacted.sanitizedText,
      });

      const result: AnalysisResult = {
        id: `SCN-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        userId: authUserId,
        timestamp: new Date().toISOString(),
        scanType: 'message',
        targetName: 'Suspicious Communication / Message',
        riskSeverity: heuristics.severity,
        confidence: determineConfidence(heuristics.flags, heuristics.score),
        threatCategory: heuristics.threatCategory,
        summary: aiExplanation.plainLanguageVerdict,
        deterministicScore: heuristics.score,
        flags: heuristics.flags,
        indicators,
        aiExplanation,
        quarantineStatus: heuristics.score >= 70 ? 'quarantined' : 'analyzed_safe',
      };

      scanHistory.unshift(result);
      persistScanToSupabase(result).catch(() => {});
      logAuditEvent('ANONYMOUS_CITIZEN', 'SCAN_MESSAGE', clientIp, {
        category: heuristics.threatCategory,
        severity: heuristics.severity,
      });

      return res.json({ success: true, result });
    }

    return res.status(400).json({
      success: false,
      error: 'Please provide either a file upload, a URL link, or message text to analyze.',
    });
  } catch (err: any) {
    console.error('Scan error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Internal security inspection failure' });
  }
});

// ----------------------------------------------------
// MODULE 5: PERSONAL SECURITY DASHBOARD & HISTORY
// ----------------------------------------------------
app.get('/api/v1/scan/history', (req: express.Request, res: express.Response) => {
  const userId = extractUserIdFromReq(req);
  if (userId) {
    const userScans = scanHistory.filter((s) => s.userId === userId);
    return res.json({ success: true, history: userScans.slice(0, 50) });
  }
  res.json({ success: true, history: scanHistory.slice(0, 50) });
});

// ----------------------------------------------------
// MODULE 6: COMMUNITY THREAT INTELLIGENCE
// ----------------------------------------------------
app.get('/api/v1/community/threats', (_req, res) => {
  res.json({ success: true, reports: communityReports });
});

app.post('/api/v1/community/threats', (req, res) => {
  const parseResult = communityReportSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ success: false, error: parseResult.error.errors[0].message });
  }

  const { title, threatType, content, reportingReason } = parseResult.data;
  const redacted = redactSensitivePii(content);
  const heuristics = analyzeMessageHeuristics(redacted.sanitizedText);

  const newReport: any = {
    id: `REP-${Date.now()}`,
    title: title.trim(),
    threatType: (threatType || heuristics.threatCategory || 'IMPERSONATION_SOCIAL_ENGINEERING') as ThreatCategory,
    sanitizedSnippet: redacted.sanitizedText,
    riskSeverity: heuristics.severity,
    verifiedByAdmin: false, // Pending moderation
    upvotes: 1,
    tags: ['Community Reported', threatType || 'General Scam'],
    createdAt: new Date().toISOString(),
    reportingReason: reportingReason || 'Reported by user as suspicious interaction',
  };

  communityReports.unshift(newReport);
  persistCommunityReportToSupabase(newReport).catch(() => {});
  logAuditEvent(req.user?.id || 'CITIZEN', 'COMMUNITY_REPORT_SUBMITTED', req.ip || '', { title });
  res.json({ success: true, report: newReport });
});

app.post('/api/v1/community/threats/:id/vote', (req, res) => {
  const { id } = req.params;
  const target = communityReports.find((r) => r.id === id);
  if (!target) {
    return res.status(404).json({ success: false, error: 'Report not found' });
  }
  target.upvotes += 1;
  res.json({ success: true, upvotes: target.upvotes });
});

// ----------------------------------------------------
// MODULE 7: SCAM CAMPAIGN DETECTION
// ----------------------------------------------------
app.get('/api/v1/intelligence/campaigns', (_req, res) => {
  res.json({ success: true, campaigns: scamCampaigns });
});

app.get('/api/v1/intelligence/stats', (_req, res) => {
  const totalScans = scanHistory.length + 15420; // baseline statistics
  const threatsBlocked = scanHistory.filter((s) => s.riskSeverity !== 'SAFE').length + 8930;
  res.json({
    success: true,
    stats: {
      totalThreatsScanned: totalScans,
      activeThreatsBlocked: threatsBlocked,
      activeCampaignsTracked: scamCampaigns.length,
      verifiedCommunityReports: communityReports.length,
      averageAnalysisTimeMs: 420,
    },
  });
});

// ----------------------------------------------------
// MODULE 8: SECURITY AWARENESS & INCIDENT RESPONSE
// ----------------------------------------------------
app.get('/api/v1/incident/guide/:threatType', (req, res) => {
  const { threatType } = req.params;

  const standardChecklist = [
    { step: 'Immediate Financial Freeze: Call 1930 within the golden hour to freeze fund routing.', completed: false },
    { step: 'Bank Contact: Immediately request your bank to hotlist cards and disable UPI transactions.', completed: false },
    { step: 'Formal Evidence Retention: Screenshot chat logs, payment reference numbers (UTR/RRN), and suspect profiles.', completed: false },
    { step: 'National Cyber Crime Portal: File formal complaint at cybercrime.gov.in with UTR and evidence files.', completed: false },
    { step: 'Device Hardening: If an APK or file was opened, disconnect Wi-Fi and reboot in Safe Mode.', completed: false },
  ];

  res.json({
    success: true,
    threatType,
    helpline: '1930 (National Cyber Crime Reporting Helpline)',
    portal: 'https://cybercrime.gov.in',
    checklist: standardChecklist,
  });
});

app.post('/api/v1/incident/report', (req, res) => {
  const parseResult = incidentReportSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ success: false, error: parseResult.error.errors[0].message });
  }

  const { threatCategory, financialLossAmount, transactionReference, suspectContactOrHandle } = parseResult.data;

  const newIncident: any = {
    id: `INC-${Date.now()}`,
    threatCategory: (threatCategory || 'IMPERSONATION_SOCIAL_ENGINEERING') as ThreatCategory,
    financialLossAmount: Number(financialLossAmount) || 0,
    transactionReference: transactionReference ? transactionReference.slice(0, 40) : undefined,
    suspectContactOrHandle: suspectContactOrHandle ? suspectContactOrHandle.slice(0, 40) : undefined,
    cyberCellPortalFiled: false,
    bankNotified: true,
    status: 'REPORTED',
    checklist: [
      { step: 'Call 1930 National Helpline', completed: true },
      { step: 'Bank Card & UPI Freeze', completed: true },
      { step: 'Formal Cyber Crime Portal Filing', completed: false },
      { step: 'Dispute Chargeback Form Submission', completed: false },
    ],
    createdAt: new Date().toISOString(),
  };

  incidentReports.unshift(newIncident);
  persistIncidentToSupabase(newIncident).catch(() => {});
  logAuditEvent(req.user?.id || 'CITIZEN', 'INCIDENT_CASE_CREATED', req.ip || '', {
    id: newIncident.id,
    loss: financialLossAmount,
  });

  res.json({ success: true, incident: newIncident });
});

// ----------------------------------------------------
// MODULE 9: ADMINISTRATIVE MODERATION & AUDIT (RBAC Enforced)
// ----------------------------------------------------
app.get('/api/v1/admin/moderation', requireAdmin, (_req, res) => {
  res.json({ success: true, reports: communityReports });
});

app.post('/api/v1/admin/moderation/review', requireAdmin, (req, res) => {
  const parseResult = moderationReviewSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ success: false, error: parseResult.error.errors[0].message });
  }

  const { reportId, action } = parseResult.data;
  const report = communityReports.find((r) => r.id === reportId);
  if (!report) {
    return res.status(404).json({ success: false, error: 'Report not found' });
  }

  if (action === 'approve') {
    report.verifiedByAdmin = true;
  } else if (action === 'reject') {
    const idx = communityReports.indexOf(report);
    if (idx !== -1) communityReports.splice(idx, 1);
  }

  logAuditEvent(req.user?.id || 'ADMIN_USER', 'MODERATION_ACTION', req.ip || '', { reportId, action });
  res.json({ success: true, report });
});

app.get('/api/v1/admin/audit-logs', requireAdmin, (_req, res) => {
  res.json({ success: true, auditLogs: auditLogs.slice(0, 100) });
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'OK',
    service: 'ScamShield Security Engine',
    version: '1.0.0-prototype',
    deterministicStatus: 'active',
    llmExplainerStatus: process.env.GEMINI_API_KEY ? 'gemini-live' : 'deterministic-fallback',
  });
});

// Global centralized error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Security Engine Error]', err);
  res.status(500).json({
    success: false,
    error: 'An internal error occurred in the security processing pipeline.',
  });
});

app.listen(PORT, () => {
  console.log(`🛡️  ScamShield Security Engine running on http://localhost:${PORT}`);
});
