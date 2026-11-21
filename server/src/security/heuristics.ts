import { DeterministicFlag, RiskSeverity, ThreatCategory } from '../types.js';

export interface HeuristicAnalysisResult {
  score: number; // 0 to 100
  threatCategory: ThreatCategory;
  severity: RiskSeverity;
  flags: DeterministicFlag[];
  matchedKeywords: string[];
}

interface PatternRule {
  id: string;
  category: ThreatCategory;
  label: string;
  keywords: RegExp[];
  weight: number;
  evidenceTemplate: string;
  limitations: string;
}

const RULES: PatternRule[] = [
  {
    id: 'DIGITAL_ARREST_LAW_ENFORCEMENT',
    category: 'DIGITAL_ARREST',
    label: 'Digital Arrest & Law Enforcement Impersonation',
    keywords: [
      /\b(cbi|ed|narcotics control bureau|ncb|mumbai police|delhi police|customs department|interpol)\b/i,
      /\b(arrest warrant|digital arrest|ndps act|money laundering|human trafficking|illegal parcel|sim card suspension)\b/i,
      /\b(video call interrogation|skype statement|dcp|cyber cell officer|court summons|freeze all accounts)\b/i,
    ],
    weight: 95,
    evidenceTemplate: 'Contains phrases simulating law enforcement authority, fake warrants, or coercive digital arrest threats.',
    limitations: 'Keyword match cannot verify real judicial notices without authoritative legal database cross-reference.',
  },
  {
    id: 'REVERSE_UPI_TRAP',
    category: 'REVERSE_UPI_QR',
    label: 'Reverse UPI / QR Code Receive-Money Deception',
    keywords: [
      /\bscan\b.*?\bqr\b.*?\b(receive|credit|get|accept|refund)\b/i,
      /\b(enter|input|type)\b.*?\bupi pin\b.*?\b(receive|get|claim|refund|credit)\b/i,
      /\b(scan to credit|receive payment in your bank|paytm refund request|approve transaction to receive)\b/i,
      /\b(reverse upi|qr code payment request|qr code to accept money)\b/i,
    ],
    weight: 90,
    evidenceTemplate: 'Contains explicit instructions asking the user to scan a QR code or enter a UPI PIN to "receive" funds. In real UPI, entering a PIN strictly *deducts* money.',
    limitations: 'Heuristic identifies phrasing intent; user must confirm whether they were the sender or intended receiver.',
  },
  {
    id: 'ELECTRICITY_DISCONNECTION_URGENCY',
    category: 'IMPERSONATION_SOCIAL_ENGINEERING',
    label: 'Utility Disconnection & Remote Tool Coercion',
    keywords: [
      /\b(electricity (bill|power) (will be )?disconnect(ed)? tonight)\b/i,
      /\b(dear consumer|previous month bill was not updated|contact electricity officer|bses|mseb|tneb)\b/i,
      /\b(call (our )?(executive|officer) at \+?\d{10}|download (quicksupport|anydesk|teamviewer|rustdesk))\b/i,
    ],
    weight: 85,
    evidenceTemplate: 'Features classic utility cutoff extortion with artificial same-day urgency and demands to contact personal phone numbers or install remote access software.',
    limitations: 'Genuine utility companies send automated SMS, but never ask users to call personal mobile numbers or install screen sharing apps.',
  },
  {
    id: 'COURIER_DELIVERY_SMISHING',
    category: 'COURIER_DELIVERY_SMISHING',
    label: 'Courier & Postal Smishing Attack',
    keywords: [
      /\b(india post|speed post|fedex|dhl|bluedart|delhivery)\b/i,
      /\b(package (could not be|failed to) deliver(ed)?|wrong address|incomplete address|held at customs)\b/i,
      /\b(update (your )?address within 24 hours|pay (rs\.?|inr|\$)?\s?\d{1,3}\s?(fee|penalty|redelivery))\b/i,
    ],
    weight: 80,
    evidenceTemplate: 'Pretends to be a logistics or postal provider demanding an immediate link click or micro-payment to resolve a delivery failure.',
    limitations: 'Heuristic evaluates text structure; cannot query private carrier tracking systems directly without tracking numbers.',
  },
  {
    id: 'TELEGRAM_PART_TIME_TASK',
    category: 'TELEGRAM_JOB_TASK',
    label: 'Work-from-Home & Telegram Task Scam',
    keywords: [
      /\b(part[\s-]time job|work from home|earn \d{3,5} daily|daily income)\b/i,
      /\b(like youtube videos|subscribe channels|rate hotels on google map|rate movies)\b/i,
      /\b(contact our hr on telegram|join telegram group|usdt recharge|crypto commission)\b/i,
    ],
    weight: 85,
    evidenceTemplate: 'Matches recruitment fraud involving trivial online tasks that escalate into advance-fee cryptocurrency recharges.',
    limitations: 'Legitimate gig platforms exist, but direct Telegram recruitment with crypto recharges is overwhelmingly fraudulent.',
  },
  {
    id: 'LOTTERY_KYC_PHISHING',
    category: 'PHISHING_CREDENTIAL_HARVEST',
    label: 'Bank KYC & Lottery Phishing',
    keywords: [
      /\b(your (bank|sbi|hdfc|icici|axis) account (has been )?blocked|kyc (is )?expired|pan card link)\b/i,
      /\b(update kyc immediately or account will be suspended|click here to verify)\b/i,
      /\b(you have won (a lucky draw|lottery|kbc lottery|reward points|gift card))\b/i,
    ],
    weight: 85,
    evidenceTemplate: 'Threatens banking service deactivation or promises unreal lottery windfalls to harvest login credentials and OTPs.',
    limitations: 'Banks periodically require KYC, but never solicit credentials or OTPs via SMS links.',
  },
];

export function analyzeMessageHeuristics(messageText: string): HeuristicAnalysisResult {
  if (!messageText || messageText.trim().length === 0) {
    return {
      score: 0,
      threatCategory: 'BENIGN_SAFE',
      severity: 'SAFE',
      flags: [],
      matchedKeywords: [],
    };
  }

  const flags: DeterministicFlag[] = [];
  const matchedKeywords: string[] = [];
  let maxScore = 0;
  let dominantCategory: ThreatCategory = 'BENIGN_SAFE';

  for (const rule of RULES) {
    let matchCount = 0;
    const ruleMatches: string[] = [];

    for (const kw of rule.keywords) {
      const match = messageText.match(kw);
      if (match) {
        matchCount++;
        ruleMatches.push(match[0]);
        if (!matchedKeywords.includes(match[0])) {
          matchedKeywords.push(match[0]);
        }
      }
    }

    if (matchCount > 0) {
      // If multiple sub-patterns in a rule match, confidence increases
      const calculatedWeight = Math.min(100, rule.weight + (matchCount - 1) * 5);
      if (calculatedWeight > maxScore) {
        maxScore = calculatedWeight;
        dominantCategory = rule.category;
      }

      let severity: RiskSeverity = 'LOW';
      if (calculatedWeight >= 85) severity = 'CRITICAL';
      else if (calculatedWeight >= 70) severity = 'HIGH';
      else if (calculatedWeight >= 45) severity = 'MEDIUM';

      flags.push({
        id: rule.id,
        label: rule.label,
        severity,
        evidence: `${rule.evidenceTemplate} (Matched indicators: "${ruleMatches.join('", "')}")`,
        limitations: rule.limitations,
      });
    }
  }

  let overallSeverity: RiskSeverity = 'SAFE';
  if (maxScore >= 85) overallSeverity = 'CRITICAL';
  else if (maxScore >= 70) overallSeverity = 'HIGH';
  else if (maxScore >= 45) overallSeverity = 'MEDIUM';
  else if (maxScore > 15) overallSeverity = 'LOW';

  return {
    score: maxScore,
    threatCategory: dominantCategory,
    severity: overallSeverity,
    flags,
    matchedKeywords,
  };
}
