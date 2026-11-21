import AdmZip from 'adm-zip';
import { DeterministicFlag, RiskSeverity, SecurityIndicators, ThreatCategory } from '../types.js';

export interface FileGuardResult {
  score: number; // 0 to 100
  threatCategory: ThreatCategory;
  severity: RiskSeverity;
  flags: DeterministicFlag[];
  indicators: SecurityIndicators;
}

// Calculate Shannon entropy of a buffer or slice (0.0 to 8.0)
export function calculateShannonEntropy(buffer: Buffer): number {
  if (buffer.length === 0) return 0;
  const frequencies = new Uint32Array(256);
  for (let i = 0; i < buffer.length; i++) {
    frequencies[buffer[i]]++;
  }
  let entropy = 0;
  const len = buffer.length;
  for (let i = 0; i < 256; i++) {
    if (frequencies[i] > 0) {
      const p = frequencies[i] / len;
      entropy -= p * Math.log2(p);
    }
  }
  return Number(entropy.toFixed(3));
}

export function inspectFileWithFileGuard(
  filename: string,
  buffer: Buffer,
  detectedMime: string
): FileGuardResult {
  const flags: DeterministicFlag[] = [];
  const indicators: SecurityIndicators = {
    fileSizeBytes: buffer.length,
    detectedMime,
    claimedExtension: (filename.split('.').pop() || '').toLowerCase(),
  };

  const ext = indicators.claimedExtension || '';
  let score = 0;
  let category: ThreatCategory = 'BENIGN_SAFE';

  // Calculate overall file entropy
  const entropy = calculateShannonEntropy(buffer);
  indicators.entropyScore = entropy;

  // 1. PDF STATIC ANALYSIS
  if (ext === 'pdf' || detectedMime === 'application/pdf') {
    category = 'MALICIOUS_DOCUMENT';
    const rawPdf = buffer.toString('binary');

    const hasJs = /\/JavaScript|\/JS\b/i.test(rawPdf);
    const hasLaunch = /\/Launch\b/i.test(rawPdf);
    const hasEmbedded = /\/EmbeddedFiles\b/i.test(rawPdf);
    const hasOpenAction = /\/OpenAction|\/AA\b/i.test(rawPdf);
    const hasUri = /\/URI\b/i.test(rawPdf);

    indicators.hasSuspiciousStreams = hasJs || hasLaunch || hasEmbedded;

    if (hasLaunch) {
      score = Math.max(score, 95);
      flags.push({
        id: 'PDF_LAUNCH_ACTION',
        label: 'PDF Launch / Execution Stream Detected',
        severity: 'CRITICAL',
        evidence: 'Found "/Launch" object dictionary in PDF structure. This directive instructs the PDF viewer to execute an external operating system binary or command.',
        limitations: 'Static stream inspection identifies directive presence; modern patched viewers often block execution prompt.',
      });
    }

    if (hasJs) {
      score = Math.max(score, 85);
      flags.push({
        id: 'PDF_EMBEDDED_JAVASCRIPT',
        label: 'PDF Embedded JavaScript Code',
        severity: 'HIGH',
        evidence: 'Found "/JavaScript" or "/JS" object streams. Attackers frequently embed obfuscated JavaScript in PDFs to exploit Adobe Reader or browser sandbox vulnerabilities.',
        limitations: 'Some legitimate interactive PDF forms contain harmless validation scripts.',
      });
    }

    if (hasOpenAction && (hasJs || hasLaunch || hasUri)) {
      score = Math.max(score, 80);
      flags.push({
        id: 'PDF_AUTOMATIC_ACTION',
        label: 'PDF Automatic Execution on Document Open',
        severity: 'HIGH',
        evidence: 'Document contains "/OpenAction" or "/AA" combined with external resources, executing triggers immediately without explicit user click.',
        limitations: 'Used legitimately in some presentation PDFs to auto-navigate to page 1.',
      });
    }

    if (hasEmbedded) {
      score = Math.max(score, 70);
      flags.push({
        id: 'PDF_EMBEDDED_PAYLOAD',
        label: 'PDF Hidden Embedded Files',
        severity: 'MEDIUM',
        evidence: 'Found "/EmbeddedFiles" object dictionary. This mechanism can conceal executable droppers or malicious VBS/batch scripts inside an innocuous document.',
        limitations: 'Portfolios and invoices occasionally attach supplementary raw attachments.',
      });
    }
  }

  // 2. OFFICE DOCUMENTS (DOCX, XLSX)
  else if (['docx', 'xlsx', 'docm', 'xlsm'].includes(ext)) {
    category = 'MALICIOUS_DOCUMENT';
    try {
      const zip = new AdmZip(buffer);
      const entries = zip.getEntries();

      // Check Archive Bomb ratio
      let totalUncompressedSize = 0;
      for (const entry of entries) {
        totalUncompressedSize += entry.header.size;
      }
      const compressionRatio = buffer.length > 0 ? totalUncompressedSize / buffer.length : 1;
      if (compressionRatio > 10 || totalUncompressedSize > 50 * 1024 * 1024) {
        score = Math.max(score, 95);
        flags.push({
          id: 'ZIP_BOMB_ANOMALY',
          label: 'Decompression Bomb / Resource Exhaustion Anomaly',
          severity: 'CRITICAL',
          evidence: `Uncompressed size (${Math.round(totalUncompressedSize / 1024 / 1024)}MB) exceeds safe ratio of ${compressionRatio.toFixed(1)}:1 against raw file size.`,
          limitations: 'Checked via central directory header without extracting payload bytes to memory.',
        });
      }

      // Check VBA Macros
      const hasVba = entries.some(
        (e) =>
          e.entryName.toLowerCase().includes('vbaproject.bin') ||
          e.entryName.toLowerCase().includes('vba/') ||
          e.entryName.toLowerCase().includes('macros/')
      );

      indicators.hasMacros = hasVba;

      if (hasVba) {
        score = Math.max(score, 90);
        flags.push({
          id: 'OFFICE_MACRO_DETECTED',
          label: 'Embedded Visual Basic for Applications (VBA) Macros',
          severity: 'CRITICAL',
          evidence: 'Found "vbaProject.bin" binary stream inside the Office document archive. Macros can execute arbitrary commands via PowerShell or WScript when enabled.',
          limitations: 'Enterprise financial spreadsheets occasionally use legacy VBA for complex automation; user must verify author authenticity.',
        });
      }

      // Check external template injection in relationships
      for (const entry of entries) {
        if (entry.entryName.toLowerCase().includes('_rels/') && entry.entryName.endsWith('.rels')) {
          const content = entry.getData().toString('utf8');
          if (content.includes('TargetMode="External"') && content.includes('http')) {
            score = Math.max(score, 85);
            flags.push({
              id: 'OFFICE_EXTERNAL_TEMPLATE_INJECTION',
              label: 'External Relationship / Remote Template Injection',
              severity: 'HIGH',
              evidence: 'Document relations define external remote targets loaded over HTTP (often used in Follina / CVE-2022-30190 style remote template attacks).',
              limitations: 'Some corporate templates link to official Microsoft Office styles online.',
            });
            break;
          }
        }
      }
    } catch {
      // If parsing fails for claimed docx
      score = Math.max(score, 50);
      flags.push({
        id: 'CORRUPT_ARCHIVE_CONTAINER',
        label: 'Malformed Office OpenXML Container',
        severity: 'MEDIUM',
        evidence: 'Unable to parse file as valid Zip archive container despite claimed Office extension.',
        limitations: 'Could indicate disk corruption or anti-analysis evasion formatting.',
      });
    }
  }

  // 3. CSV FORMULA INJECTION (DDE)
  else if (ext === 'csv') {
    category = 'MALICIOUS_DOCUMENT';
    const text = buffer.toString('utf8');
    const lines = text.split(/\r?\n/).slice(0, 500); // Check first 500 lines

    let ddeCount = 0;
    const suspiciousSamples: string[] = [];

    for (const line of lines) {
      const cells = line.split(',');
      for (const cell of cells) {
        const trimmed = cell.trim().replace(/^["']/, '');
        if (/^[=+\-@|]/.test(trimmed)) {
          if (/\b(cmd|powershell|mshta|rundll32|certutil|curl|calc|wscript|cscript)\b/i.test(trimmed)) {
            ddeCount++;
            if (suspiciousSamples.length < 3) {
              suspiciousSamples.push(trimmed.slice(0, 60));
            }
          }
        }
      }
    }

    if (ddeCount > 0) {
      indicators.hasDDEFormula = true;
      score = Math.max(score, 95);
      flags.push({
        id: 'CSV_DDE_FORMULA_INJECTION',
        label: 'CSV Dynamic Data Exchange (DDE) Formula Injection',
        severity: 'CRITICAL',
        evidence: `Found ${ddeCount} cell formulas containing system execution commands (e.g. "${suspiciousSamples.join('", "')}"). Opening this in Excel can trigger command execution.`,
        limitations: 'CSV is plain text; danger activates only if opened with automated formula calculation enabled.',
      });
    }
  }

  // 4. ANDROID APK STATIC ANALYSIS
  else if (ext === 'apk' || (detectedMime.includes('zip') && ext === 'apk')) {
    category = 'MALICIOUS_APK';
    try {
      const zip = new AdmZip(buffer);
      const entries = zip.getEntries();

      // Look for AndroidManifest.xml
      const manifestEntry = entries.find((e) => e.entryName === 'AndroidManifest.xml');
      const suspiciousPerms: string[] = [];

      if (manifestEntry) {
        // Read raw manifest binary string (Android binary XML still contains ASCII permission names)
        const manifestData = manifestEntry.getData().toString('binary');

        const PERMISSION_WATCHLIST = [
          { name: 'RECEIVE_SMS', severity: 'CRITICAL', label: 'Interception of Incoming SMS (OTP Theft)' },
          { name: 'READ_SMS', severity: 'CRITICAL', label: 'Reading Existing SMS Messages' },
          { name: 'SEND_SMS', severity: 'HIGH', label: 'Sending Premium Rate SMS' },
          { name: 'BIND_ACCESSIBILITY_SERVICE', severity: 'CRITICAL', label: 'Accessibility Abuse (Keylogger & Automated Clicker)' },
          { name: 'SYSTEM_ALERT_WINDOW', severity: 'HIGH', label: 'Drawing Over Other Apps (Fake Banking Overlays)' },
          { name: 'REQUEST_INSTALL_PACKAGES', severity: 'HIGH', label: 'Silent Installation of Secondary Droppers' },
          { name: 'RECORD_AUDIO', severity: 'MEDIUM', label: 'Microphone Audio Recording' },
        ];

        for (const item of PERMISSION_WATCHLIST) {
          if (manifestData.includes(item.name)) {
            suspiciousPerms.push(`android.permission.${item.name}`);
            flags.push({
              id: `APK_PERM_${item.name}`,
              label: `High-Risk APK Permission: ${item.name}`,
              severity: item.severity as RiskSeverity,
              evidence: `Manifest requests permission "${item.name}" - ${item.label}.`,
              limitations: 'Some accessibility utilities or legitimate messaging apps require these; highly suspicious in standalone APKs distributed outside Google Play.',
            });
            score = Math.max(score, item.severity === 'CRITICAL' ? 95 : 80);
          }
        }
      }

      indicators.suspiciousPermissions = suspiciousPerms;

      // Check DEX files count and presence
      const dexEntries = entries.filter((e) => e.entryName.endsWith('.dex'));
      if (dexEntries.length === 0) {
        score = Math.max(score, 60);
        flags.push({
          id: 'APK_MISSING_DEX',
          label: 'Malformed APK Structure (Missing classes.dex)',
          severity: 'MEDIUM',
          evidence: 'Archive lacks standard Dalvik Executable (classes.dex) file.',
          limitations: 'Could be an asset-only expansion bundle or corrupted archive.',
        });
      }
    } catch {
      score = Math.max(score, 65);
      flags.push({
        id: 'APK_UNREADABLE_CONTAINER',
        label: 'Unreadable APK Archive Structure',
        severity: 'MEDIUM',
        evidence: 'Unable to extract APK metadata; file may be obfuscated or corrupted.',
        limitations: 'Static inspection aborted due to malformed ZIP headers.',
      });
    }
  }

  // 5. WINDOWS PORTABLE EXECUTABLE (EXE) STATIC ANALYSIS
  else if (ext === 'exe' || detectedMime === 'application/x-msdownload') {
    category = 'MALICIOUS_EXECUTABLE';
    // Base score for standalone unverified executable sent via web/chat
    score = Math.max(score, 75);

    // Parse PE Header statically (Zero-Execution)
    if (buffer.length > 0x100) {
      const e_magic = buffer.readUInt16LE(0);
      if (e_magic === 0x5a4d) {
        // 'MZ'
        const e_lfanew = buffer.readUInt32LE(0x3c);
        if (e_lfanew < buffer.length - 4) {
          const peSig = buffer.readUInt32LE(e_lfanew);
          if (peSig === 0x00004550) {
            // 'PE\0\0'
            const numSections = buffer.readUInt16LE(e_lfanew + 6);
            flags.push({
              id: 'PE_HEADER_CONFIRMED',
              label: 'Windows Portable Executable (PE) Architecture',
              severity: 'HIGH',
              evidence: `Valid PE structure verified (Number of sections: ${numSections}). Executables possess native operating system execution privileges.`,
              limitations: 'Static inspection verifies binary format; cannot confirm benign installer vs malware without sandbox behavioral traces.',
            });

            // High Section Entropy indicates packing/obfuscation
            if (entropy > 7.1) {
              score = Math.max(score, 95);
              flags.push({
                id: 'PE_HIGH_ENTROPY_PACKED',
                label: 'High Binary Entropy (Packed or Encrypted Executable)',
                severity: 'CRITICAL',
                evidence: `Binary overall Shannon entropy is ${entropy} / 8.0. Entropies above 7.1 indicate compressed or encrypted payloads characteristic of UPX, Themida, or custom malware crypters.`,
                limitations: 'Some legitimate game installers and DRM-protected software use packers.',
              });
            }

            // String scanning for dangerous API imports and commands
            const rawAscii = buffer.toString('binary');
            const DANGEROUS_IMPORTS = [
              'CreateRemoteThread',
              'VirtualAllocEx',
              'WriteProcessMemory',
              'UrlDownloadToFile',
              'IsDebuggerPresent',
              'powershell.exe',
              'cmd.exe',
              'reg add',
            ];

            const foundApis = DANGEROUS_IMPORTS.filter((api) => rawAscii.includes(api));
            if (foundApis.length > 0) {
              score = Math.max(score, 90);
              indicators.peImports = foundApis;
              flags.push({
                id: 'PE_SUSPICIOUS_API_IMPORTS',
                label: 'Process Injection & Network Download APIs',
                severity: 'CRITICAL',
                evidence: `Detected references to critical system injection or download APIs: "${foundApis.join('", "')}". Commonly leveraged by infostealers and remote access trojans (RATs).`,
                limitations: 'API names can appear as raw strings in security utilities or debug symbols.',
              });
            }
          }
        }
      }
    }
  }

  // Derive Overall Severity
  let severity: RiskSeverity = 'SAFE';
  if (score >= 85) severity = 'CRITICAL';
  else if (score >= 70) severity = 'HIGH';
  else if (score >= 45) severity = 'MEDIUM';
  else if (score > 15) severity = 'LOW';

  return {
    score,
    threatCategory: category,
    severity,
    flags,
    indicators,
  };
}
