export type ScanType = 'universal' | 'file' | 'url' | 'message' | 'qr';

export type RiskSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'SAFE';

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export type ThreatCategory =
  | 'DIGITAL_ARREST'
  | 'REVERSE_UPI_QR'
  | 'COURIER_DELIVERY_SMISHING'
  | 'MALICIOUS_DOCUMENT'
  | 'MALICIOUS_APK'
  | 'MALICIOUS_EXECUTABLE'
  | 'PHISHING_CREDENTIAL_HARVEST'
  | 'TELEGRAM_JOB_TASK'
  | 'IMPERSONATION_SOCIAL_ENGINEERING'
  | 'BENIGN_SAFE';

export interface DeterministicFlag {
  id: string;
  label: string;
  severity: RiskSeverity;
  evidence: string;
  limitations: string;
}

export interface RedirectHop {
  url: string;
  status?: number;
  ip?: string;
  blocked?: boolean;
}

export interface SecurityIndicators {
  sha256?: string;
  detectedMime?: string;
  claimedExtension?: string;
  fileSizeBytes?: number;
  entropyScore?: number;
  suspiciousPermissions?: string[];
  hasMacros?: boolean;
  hasDDEFormula?: boolean;
  hasSuspiciousStreams?: boolean;
  peImports?: string[];
  redirectHops?: RedirectHop[];
  domainAgeDays?: number;
  isPunycode?: boolean;
  isIpv4Direct?: boolean;
  isShortenedUrl?: boolean;
  extractedUrls?: string[];
  extractedPhones?: string[];
  extractedUpiVpas?: string[];
  extractedQrPayload?: string;
}

export interface AiExplanation {
  plainLanguageVerdict: string;
  fishinessScore: number; // 0% (Clean) to 100% (Definite Scam)
  verdictLabel: string;
  redFlags: string[];
  legitimacyCheck: string;
  safeResponseAdvice: string;
  psychologicalTricks: string[];
  attackMechanics: string;
  immediateActionSteps: string[];
  emergencyAdvice: string;
}

export interface AnalysisResult {
  id: string;
  userId?: string;
  timestamp: string;
  scanType: ScanType;
  targetName: string;
  riskSeverity: RiskSeverity;
  confidence: ConfidenceLevel;
  threatCategory: ThreatCategory;
  summary: string;
  deterministicScore: number;
  flags: DeterministicFlag[];
  indicators: SecurityIndicators;
  aiExplanation: AiExplanation;
  quarantineStatus?: 'quarantined' | 'analyzed_safe' | 'ephemeral_purged';
}

export interface CommunityThreatReport {
  id: string;
  userId?: string;
  title: string;
  threatType: ThreatCategory;
  sanitizedSnippet: string;
  riskSeverity: RiskSeverity;
  verifiedByAdmin: boolean;
  upvotes: number;
  tags: string[];
  createdAt: string;
  reportingReason: string;
}

export interface ScamCampaign {
  id: string;
  campaignName: string;
  threatCategory: ThreatCategory;
  indicators: string[];
  victimCountEstimate: number;
  activeStatus: 'active' | 'mitigated' | 'monitoring';
  firstSeen: string;
  lastSeen: string;
  description: string;
}

export interface IncidentReport {
  id: string;
  userId?: string;
  scanId?: string;
  threatCategory: ThreatCategory;
  financialLossAmount?: number;
  transactionReference?: string;
  suspectContactOrHandle?: string;
  cyberCellPortalFiled: boolean;
  cyberCellAckNumber?: string;
  bankNotified: boolean;
  status: 'REPORTED' | 'EVIDENCE_COLLECTED' | 'ACKNOWLEDGED' | 'RESOLVED';
  checklist: Array<{ step: string; completed: boolean }>;
  createdAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  action: string;
  clientIpHash: string;
  details: any;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: 'citizen' | 'security_analyst' | 'admin';
  trustScore: number;
  createdAt: string;
}
