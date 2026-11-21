import {
  AnalysisResult,
  CommunityThreatReport,
  IncidentReport,
  ScamCampaign,
} from '../types.js';

// In-Memory store with initial high-fidelity real-world scam campaign data
export const scamCampaigns: ScamCampaign[] = [
  {
    id: 'CAMP-2026-001',
    campaignName: 'Operation Digital Arrest Syndicate',
    threatCategory: 'DIGITAL_ARREST',
    indicators: ['cbi-verification.gov-portal.live', '+91-98765-43210', 'fake_cbi_seal.pdf'],
    victimCountEstimate: 1420,
    activeStatus: 'active',
    firstSeen: '2026-01-14T08:30:00Z',
    lastSeen: '2026-11-20T14:15:00Z',
    description: 'Coordinated video call intimidation impersonating Mumbai Police & CBI with forged Supreme Court digital warrants.',
  },
  {
    id: 'CAMP-2026-002',
    campaignName: 'PostIndia Courier Smishing Ring',
    threatCategory: 'COURIER_DELIVERY_SMISHING',
    indicators: ['indiapost-parcel-redelivery.top', 'track-postal-service.online'],
    victimCountEstimate: 3890,
    activeStatus: 'active',
    firstSeen: '2026-02-01T10:00:00Z',
    lastSeen: '2026-11-21T09:45:00Z',
    description: 'Bulk automated SMS campaign claiming package delivery failure, demanding ₹5 address update fee to steal banking credentials.',
  },
  {
    id: 'CAMP-2026-003',
    campaignName: 'QuickSupport Electricity Disconnection Crew',
    threatCategory: 'IMPERSONATION_SOCIAL_ENGINEERING',
    indicators: ['electricity-officer-update.apk', 'disconnection_notice.apk'],
    victimCountEstimate: 870,
    activeStatus: 'active',
    firstSeen: '2026-03-11T12:00:00Z',
    lastSeen: '2026-11-19T18:20:00Z',
    description: 'Sends threatening SMS stating electricity will be disconnected at 9:30 PM tonight, directing users to install remote-access APKs.',
  },
  {
    id: 'CAMP-2026-004',
    campaignName: 'OLX Marketplace Reverse UPI Trap',
    threatCategory: 'REVERSE_UPI_QR',
    indicators: ['merchant-paytm-refund@okaxis', 'scan-to-receive-funds.png'],
    victimCountEstimate: 2150,
    activeStatus: 'active',
    firstSeen: '2026-04-05T11:20:00Z',
    lastSeen: '2026-11-21T10:10:00Z',
    description: 'Scammers posing as buyers on secondhand marketplaces sending "Receive Money" QR codes that deduct victim bank balances upon PIN entry.',
  },
  {
    id: 'CAMP-2026-005',
    campaignName: 'YouTube Like & Earn Telegram Farm',
    threatCategory: 'TELEGRAM_JOB_TASK',
    indicators: ['t.me/GlobalMediaTask_VIP', 'crypto-usdt-recharge-pool.biz'],
    victimCountEstimate: 5400,
    activeStatus: 'active',
    firstSeen: '2026-05-18T16:00:00Z',
    lastSeen: '2026-11-21T08:00:00Z',
    description: 'Offers work-from-home tasks paying ₹150 for liking videos, escalating into high-value crypto deposit traps.',
  },
];

export const communityReports: CommunityThreatReport[] = [
  {
    id: 'REP-101',
    title: 'Fake CBI Video Call Notice on WhatsApp',
    threatType: 'DIGITAL_ARREST',
    sanitizedSnippet: 'Urgent notice from CBI Headquarters: An illegal parcel containing contraband has been seized under your Aadhaar. Connect immediately on Skype video call or face arrest warrant.',
    riskSeverity: 'CRITICAL',
    verifiedByAdmin: true,
    upvotes: 428,
    tags: ['CBI', 'Digital Arrest', 'WhatsApp', 'Fake Warrant'],
    createdAt: '2026-11-20T16:40:00Z',
    reportingReason: 'Received from an unknown WhatsApp number with police DP threatening digital arrest.',
  },
  {
    id: 'REP-102',
    title: 'India Post "Address Incomplete" SMS with Shortened Link',
    threatType: 'COURIER_DELIVERY_SMISHING',
    sanitizedSnippet: 'Your India Post parcel ID-IN7821 cannot be delivered due to incomplete address. Please update within 12 hours at http://rb.gy/9x82z or parcel will be returned.',
    riskSeverity: 'HIGH',
    verifiedByAdmin: true,
    upvotes: 312,
    tags: ['India Post', 'SMS Phishing', 'Shortened URL'],
    createdAt: '2026-11-21T04:20:00Z',
    reportingReason: 'Standard smishing link leading to a cloned India Post payment gateway.',
  },
  {
    id: 'REP-103',
    title: 'Electricity Bill Disconnection SMS with APK Link',
    threatType: 'MALICIOUS_APK',
    sanitizedSnippet: 'Dear Consumer, Your electricity power will be disconnected tonight at 9.30 pm from electricity office because your previous month bill was not updated. Please download update app immediately.',
    riskSeverity: 'CRITICAL',
    verifiedByAdmin: true,
    upvotes: 285,
    tags: ['Electricity Scam', 'Fake APK', 'Urgency'],
    createdAt: '2026-11-19T14:10:00Z',
    reportingReason: 'Pushes a Trojan APK disguised as electricity board bill payment update.',
  },
  {
    id: 'REP-104',
    title: 'OLX Buyer Sending "Receive Money" QR Code',
    threatType: 'REVERSE_UPI_QR',
    sanitizedSnippet: 'Buyer asked for my sofa on OLX, sent this QR code saying "Scan this with PhonePe to receive ₹15,000 advance directly in your account."',
    riskSeverity: 'CRITICAL',
    verifiedByAdmin: true,
    upvotes: 198,
    tags: ['OLX', 'Reverse UPI', 'QR Code Trap'],
    createdAt: '2026-11-18T11:05:00Z',
    reportingReason: 'Attempt to trigger a debit transaction by deceptive QR label.',
  },
];

export const scanHistory: AnalysisResult[] = [];

export const incidentReports: IncidentReport[] = [
  {
    id: 'INC-2026-881',
    threatCategory: 'REVERSE_UPI_QR',
    financialLossAmount: 25000,
    transactionReference: 'UPI/2026/891238910',
    suspectContactOrHandle: 'fraudster_buyer@paytm',
    cyberCellPortalFiled: true,
    cyberCellAckNumber: 'CC/2026/DEL/910283',
    bankNotified: true,
    status: 'ACKNOWLEDGED',
    checklist: [
      { step: 'Immediate 1930 Cyber Helpline Call', completed: true },
      { step: 'Account & Debit Card Freeze with Bank', completed: true },
      { step: 'Formal Cyber Crime Portal Filing', completed: true },
      { step: 'Bank Chargeback & Dispute Form Submitted', completed: true },
    ],
    createdAt: '2026-11-20T19:30:00Z',
  },
];

export const auditLogs: Array<{
  id: string;
  timestamp: string;
  actorId: string;
  action: string;
  clientIpHash: string;
  details: any;
}> = [];

export function logAuditEvent(actorId: string, action: string, ip: string, details: any) {
  auditLogs.unshift({
    id: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    actorId,
    action,
    clientIpHash: Buffer.from(ip || '127.0.0.1').toString('base64').slice(0, 12),
    details,
  });
  if (auditLogs.length > 500) auditLogs.pop();
}
