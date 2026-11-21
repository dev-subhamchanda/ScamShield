export interface RedactionResult {
  sanitizedText: string;
  extractedPhones: string[];
  extractedUpiVpas: string[];
  extractedUrls: string[];
  hasSensitiveFinancialData: boolean;
}

// Regex patterns
const PHONE_REGEX = /(?:\+?91[-.\s]?)?[6-9]\d{4}[-.\s]?\d{5}|(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b[6-9]\d{9}\b/g;
const CARD_REGEX = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g;
const AADHAAR_REGEX = /\b\d{4}\s\d{4}\s\d{4}\b/g;
const UPI_REGEX = /\b[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}\b/g;
const URL_REGEX = /https?:\/\/[^\s<>"{}|\\^`[\]]+/gi;
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

export function redactSensitivePii(rawText: string): RedactionResult {
  if (!rawText) {
    return {
      sanitizedText: '',
      extractedPhones: [],
      extractedUpiVpas: [],
      extractedUrls: [],
      hasSensitiveFinancialData: false,
    };
  }

  const extractedPhones: string[] = [];
  const extractedUpiVpas: string[] = [];
  const extractedUrls: string[] = [];
  let hasSensitiveFinancialData = false;

  // 1. Extract URLs first before modifying text
  const urlMatches = rawText.match(URL_REGEX);
  if (urlMatches) {
    for (const u of urlMatches) {
      if (!extractedUrls.includes(u)) extractedUrls.push(u);
    }
  }

  // 2. Extract UPI handles (excluding normal emails)
  const upiMatches = rawText.match(UPI_REGEX);
  if (upiMatches) {
    for (const u of upiMatches) {
      // Exclude standard email domains like gmail.com, yahoo.com unless context is UPI
      const lower = u.toLowerCase();
      if (
        lower.endsWith('@okhdfcbank') ||
        lower.endsWith('@okaxis') ||
        lower.endsWith('@oksbi') ||
        lower.endsWith('@okicici') ||
        lower.endsWith('@paytm') ||
        lower.endsWith('@upi') ||
        lower.endsWith('@ybl') ||
        lower.endsWith('@ibl') ||
        lower.endsWith('@axl')
      ) {
        if (!extractedUpiVpas.includes(u)) extractedUpiVpas.push(u);
        hasSensitiveFinancialData = true;
      }
    }
  }

  // 3. Extract Phones
  const phoneMatches = rawText.match(PHONE_REGEX);
  if (phoneMatches) {
    for (const p of phoneMatches) {
      const clean = p.replace(/[\s-]/g, '');
      if (clean.length >= 10 && !extractedPhones.includes(clean)) {
        extractedPhones.push(clean);
      }
    }
  }

  // Check Card Matches
  if (CARD_REGEX.test(rawText)) {
    hasSensitiveFinancialData = true;
  }

  // Redact Text
  let sanitized = rawText
    .replace(CARD_REGEX, '[CARD_REDACTED_XXXX]')
    .replace(AADHAAR_REGEX, '[AADHAAR_REDACTED]')
    .replace(PHONE_REGEX, (match) => {
      const clean = match.replace(/[\s-]/g, '');
      if (clean.length >= 10) {
        return `[PHONE_REDACTED_${clean.slice(-4)}]`;
      }
      return match;
    })
    .replace(UPI_REGEX, (match) => {
      if (extractedUpiVpas.includes(match)) {
        return '[UPI_VPA_REDACTED]';
      }
      return match;
    })
    .replace(EMAIL_REGEX, (match) => {
      const parts = match.split('@');
      if (parts.length === 2) {
        return `${parts[0].slice(0, 2)}***@${parts[1]}`;
      }
      return '[EMAIL_REDACTED]';
    });

  return {
    sanitizedText: sanitized,
    extractedPhones,
    extractedUpiVpas,
    extractedUrls,
    hasSensitiveFinancialData,
  };
}
