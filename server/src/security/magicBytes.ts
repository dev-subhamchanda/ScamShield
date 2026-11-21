import { fileTypeFromBuffer } from 'file-type';
import crypto from 'crypto';

export interface MagicValidationResult {
  detectedMime: string;
  detectedExt: string;
  claimedExtension: string;
  sha256: string;
  isSpoofed: boolean;
  isExecutableMasquerade: boolean;
  suspicionScore: number; // 0 to 100
  notes: string[];
}

// Byte signatures
const SIG_MZ = Buffer.from([0x4D, 0x5A]); // 'MZ' Windows PE
const SIG_ELF = Buffer.from([0x7F, 0x45, 0x4C, 0x46]); // ELF
const SIG_PDF = Buffer.from([0x25, 0x50, 0x44, 0x46]); // '%PDF'
const SIG_OLE = Buffer.from([0xD0, 0xCF, 0x11, 0xE0, 0xA1, 0xB1, 0x1A, 0xE1]); // OLE2 (doc/xls)

export async function inspectFileMagicAndSignature(
  filename: string,
  buffer: Buffer
): Promise<MagicValidationResult> {
  const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
  const claimedExt = (filename.split('.').pop() || '').toLowerCase();
  const notes: string[] = [];

  let detectedMime = 'application/octet-stream';
  let detectedExt = claimedExt;

  // 1. Try file-type library
  try {
    const ftResult = await fileTypeFromBuffer(buffer);
    if (ftResult) {
      detectedMime = ftResult.mime;
      detectedExt = ftResult.ext;
    }
  } catch {
    // Fall back to manual byte inspection
  }

  // 2. Direct byte-level overrides for precision
  const isMZ = buffer.length >= 2 && buffer[0] === SIG_MZ[0] && buffer[1] === SIG_MZ[1];
  const isELF = buffer.length >= 4 && buffer.subarray(0, 4).equals(SIG_ELF);
  const isPDF = buffer.length >= 4 && buffer.subarray(0, 4).equals(SIG_PDF);
  const isOLE = buffer.length >= 8 && buffer.subarray(0, 8).equals(SIG_OLE);

  if (isMZ) {
    detectedMime = 'application/x-msdownload';
    detectedExt = 'exe';
  } else if (isELF) {
    detectedMime = 'application/x-executable';
    detectedExt = 'elf';
  } else if (isPDF) {
    detectedMime = 'application/pdf';
    detectedExt = 'pdf';
  } else if (isOLE) {
    detectedMime = 'application/x-ole-storage';
  }

  // 3. Masquerade & Spoofing Analysis
  let isSpoofed = false;
  let isExecutableMasquerade = false;
  let suspicionScore = 0;

  // Safe document/image extensions that criminals disguise executables as
  const decoyExtensions = ['pdf', 'docx', 'doc', 'xlsx', 'xls', 'jpg', 'jpeg', 'png', 'webp', 'txt', 'csv'];

  if (isMZ || isELF) {
    if (decoyExtensions.includes(claimedExt)) {
      isSpoofed = true;
      isExecutableMasquerade = true;
      suspicionScore = 100;
      notes.push(
        `CRITICAL: Binary executable masquerade detected! File is claimed as ".${claimedExt}", but its binary header contains executable magic bytes (${isMZ ? 'MZ / PE' : 'ELF'}).`
      );
    }
  }

  // Check double extensions: e.g. "invoice.pdf.exe" or "payment_receipt.png.apk"
  const parts = filename.split('.');
  if (parts.length > 2) {
    const secondaryExt = parts[parts.length - 2].toLowerCase();
    if (decoyExtensions.includes(secondaryExt) && ['exe', 'apk', 'vbs', 'bat', 'cmd', 'ps1', 'js', 'scr'].includes(claimedExt)) {
      suspicionScore = Math.max(suspicionScore, 95);
      notes.push(`Suspicious double-extension detected: ".${secondaryExt}.${claimedExt}". Attackers use this to trick users into clicking executables.`);
    }
  }

  // Check PDF mismatch
  if (claimedExt === 'pdf' && !isPDF && !isMZ) {
    suspicionScore = Math.max(suspicionScore, 60);
    notes.push('File claims to be PDF, but header lacks "%PDF-" magic signature.');
  }

  return {
    detectedMime,
    detectedExt,
    claimedExtension: claimedExt,
    sha256,
    isSpoofed,
    isExecutableMasquerade,
    suspicionScore,
    notes,
  };
}
