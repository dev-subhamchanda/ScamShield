import React, { useState } from 'react';
import { Button } from '../UI/Button';
import {
  BookOpen,
  PhoneCall,
  QrCode,
  Link2,
  FileCode,
  ShieldCheck,
  Search,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  X,
} from 'lucide-react';

interface ScamGuide {
  id: string;
  title: string;
  category: string;
  icon: any;
  dangerLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  howItStarts: string;
  psychologicalTrap: string;
  redFlags: string[];
  realExample: string;
  goldenRule: string;
  testPrompt: string;
  promptType: 'text' | 'url';
}

const SCAM_GUIDES: ScamGuide[] = [
  {
    id: 'digital-arrest',
    title: 'Digital Arrest & Police Video Call Extortion',
    category: 'LAW ENFORCEMENT IMPERSONATION',
    icon: PhoneCall,
    dangerLevel: 'CRITICAL',
    howItStarts:
      'You receive a phone call or WhatsApp video call from individuals in mock police uniforms alleging a contraband parcel was seized under your Aadhaar by Customs or CBI.',
    psychologicalTrap:
      'Fear of public humiliation and arrest. Coercers demand you remain on camera in isolation and forbid contacting family or attorneys.',
    redFlags: [
      'Claims you are under "Digital Arrest" (there is no concept of digital arrest under Indian criminal procedure)',
      'Interrogations conducted over WhatsApp, Skype, or consumer video platforms',
      'Forged arrest warrants bearing simulated judicial seals',
      'Demand to wire funds to an "RBI clearance verification / security escrow account"',
    ],
    realExample:
      'CONFIDENTIAL NOTICE FROM CBI: An arrest warrant has been approved under NDPS Act. An illegal parcel seized in customs contains 16 fake passports in your name. Join video call interrogation immediately.',
    goldenRule:
      'Police, CBI, and Customs NEVER interrogate or arrest citizens over WhatsApp video calls, nor do they demand money to settle allegations. Disconnect immediately and visit your local police station.',
    testPrompt:
      'CONFIDENTIAL NOTICE FROM CBI & MUMBAI POLICE: An arrest warrant has been issued against your Aadhaar card number under Section 21 of the NDPS Act. An illegal parcel seized in customs contains contraband. You are under immediate digital arrest. Connect to video call interrogation immediately.',
    promptType: 'text',
  },
  {
    id: 'reverse-upi',
    title: 'Reverse UPI & "Scan to Receive Money" Traps',
    category: 'PAYMENT GATEWAY DECEPTION',
    icon: QrCode,
    dangerLevel: 'CRITICAL',
    howItStarts:
      'A prospective buyer on a classifieds marketplace contacts you to purchase your listed item and offers to send an immediate advance via UPI.',
    psychologicalTrap:
      'Technical confusion and eagerness to close a transaction. The buyer transmits a QR code stating "Scan this and enter your UPI PIN to accept the advance credit."',
    redFlags: [
      'Any instruction demanding you scan a QR code to "receive" funds',
      'Any prompt asking for your 4-digit or 6-digit UPI PIN to "accept" refunds or earnings',
      'Claims that payment is pending clearance until you approve a collect request',
    ],
    realExample:
      'Dear Seller, I am transferring the ₹15,000 advance payment for your sofa. Please scan this QR code and enter your UPI PIN to receive the money directly credited to your Google Pay bank balance.',
    goldenRule:
      'Under the Unified Payments Interface (UPI) standard, entering your secret PIN strictly AUTHORIZES DEBIT. Receiving funds never requires entering a PIN or scanning a code.',
    testPrompt:
      'Dear Seller, I am transferring the ₹15,000 advance payment for your sofa. Please scan this QR code and enter your UPI PIN to receive the money directly credited to your Google Pay bank balance.',
    promptType: 'text',
  },
  {
    id: 'courier-smishing',
    title: 'Postal Courier & "Incomplete Address" Smishing',
    category: 'SMS PHISHING & DOMAIN SPOOFING',
    icon: Link2,
    dangerLevel: 'HIGH',
    howItStarts:
      'An SMS arrives claiming a parcel cannot be delivered due to an invalid postal code, directing you to click an urgent update link.',
    psychologicalTrap:
      'Curiosity and fear of missed delivery. The victim assumes it is an e-commerce order and the link requests a nominal ₹10 fee.',
    redFlags: [
      'Originating from an ordinary 10-digit mobile number rather than registered sender headers',
      'Redirects to newly registered unofficial domains (.top, .info, .xyz, .biz)',
      'Requires credit card details, CVV, or banking OTP to process a nominal re-delivery fee',
    ],
    realExample:
      'Your India Post parcel ID-IN7821 cannot be delivered due to incomplete address. Please update within 12 hours at http://indiapost-parcel-redelivery.top or parcel will be returned.',
    goldenRule:
      'Never tap links in unexpected courier text messages. Navigate directly to the official logistics provider portal (e.g. indiapost.gov.in) and enter your tracking identifier directly.',
    testPrompt: 'http://indiapost-parcel-redelivery.top/update-address?trackId=IN89128',
    promptType: 'url',
  },
  {
    id: 'electricity-apk',
    title: 'Utility Power Cutoff & Malicious APK Trojans',
    category: 'MOBILE SPYWARE & ACCESS FRAUD',
    icon: FileCode,
    dangerLevel: 'CRITICAL',
    howItStarts:
      'An urgent SMS warns: "Your power supply will be disconnected tonight at 9:30 PM due to an unpaid bill. Call the electricity officer immediately."',
    psychologicalTrap:
      'Panic over losing electricity. The victim calls the number, and the fraudster directs them to install an "update application" sent over WhatsApp.',
    redFlags: [
      'Demands you dial an unverified personal phone number instead of a public utility toll-free line',
      'Instructs downloading an Android package (.apk) file directly from a chat thread',
      'The application requests accessibility, SMS read, and remote control permissions',
    ],
    realExample:
      'Dear consumer, your electricity power will be disconnected tonight at 9.30 PM from electricity office because your previous month bill was not updated. Please call electricity officer at 9876543210 immediately.',
    goldenRule:
      'Utility providers never distribute sideloaded APK files or demand same-night settlement via personal telephone calls. Always pay bills through official state power utility portals.',
    testPrompt:
      'Dear consumer, your electricity power will be disconnected tonight at 9.30 PM from electricity office because your previous month bill was not updated. Please call electricity officer at 9876543210 immediately or download QuickSupport app to update bill.',
    promptType: 'text',
  },
  {
    id: 'weaponized-docs',
    title: 'Weaponized Attachments & Macro Payloads',
    category: 'MALICIOUS OFFICE & PDF DOCUMENTS',
    icon: FileCode,
    dangerLevel: 'HIGH',
    howItStarts:
      'An email with an attachment titled "Tax_Assessment_Notice.docx", "Salary_Slip.pdf.exe", or "Ledger_Q3.csv" arrives unexpectedly.',
    psychologicalTrap:
      'Administrative curiosity or workplace duty. Opening prompts a notification to "Enable Editing" or "Enable Macros".',
    redFlags: [
      'Double file extensions designed to deceive (e.g. statement.pdf.exe)',
      'Office documents requiring macro execution to render supposed invoice text',
      'CSV or spreadsheet files initiating DDE command lines (=cmd| or -powershell|)',
    ],
    realExample:
      'Attachment: salary_slip_2026.pdf.exe containing a hidden Windows PE executable disguised by double extension.',
    goldenRule:
      'Never enable macros or embedded scripts on unsolicited attachments. Authentic invoices and legal documents do not require script execution.',
    testPrompt:
      'Financial statement containing embedded CSV DDE formula: =cmd|\'/c calc\'!A1',
    promptType: 'text',
  },
  {
    id: 'telegram-job',
    title: 'Telegram "Like & Earn" Advance Task Scams',
    category: 'ADVANCE-FEE REVENUE FRAUD',
    icon: ShieldCheck,
    dangerLevel: 'HIGH',
    howItStarts:
      'Unsolicited recruiter messages on messaging apps offer part-time income for liking videos or posting hotel ratings.',
    psychologicalTrap:
      'Trust established via small upfront disbursements (₹300). Victims are then enrolled in "VIP merchant groups" requiring ₹10,000 deposits to withdraw accumulated earnings.',
    redFlags: [
      'Hiring conducted exclusively via messaging platforms without formal employment agreements',
      'Requires sending money or cryptocurrency deposits to unlock withdrawal privileges',
      'Withdrawals blocked by sudden demands for "tax compliance deposits"',
    ],
    realExample:
      'Part-time job offer: Earn ₹3,000 to ₹5,000 daily by simply subscribing to YouTube channels. Contact our HR manager on Telegram @GlobalMediaTask_VIP for immediate ₹200 joining bonus.',
    goldenRule:
      'Legitimate employers never demand upfront cash recharges or cryptocurrency payments to release earned wages.',
    testPrompt:
      'Part-time job offer: Earn ₹3,000 to ₹5,000 daily by simply subscribing to YouTube channels. Contact our HR manager on Telegram @GlobalMediaTask_VIP for immediate ₹200 joining bonus.',
    promptType: 'text',
  },
];

interface ScamEncyclopediaProps {
  onTestPrompt: (prompt: string, type: 'text' | 'url') => void;
}

export const ScamEncyclopedia: React.FC<ScamEncyclopediaProps> = ({ onTestPrompt }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGuide, setSelectedGuide] = useState<ScamGuide | null>(null);

  const filteredGuides = SCAM_GUIDES.filter(
    (g) =>
      g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.howItStarts.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-[var(--surface-primary)] border border-[var(--border-color)] rounded-xl p-6 sm:p-7 shadow-xs">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md text-[11px] font-mono border border-[var(--border-color)] bg-[var(--surface-elevated)] text-[var(--accent-primary)] mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Citizen Cyber Defense Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[var(--text-primary)] tracking-tight">
            The Cyber Fraud Encyclopedia
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1.5 leading-relaxed">
            Understand how modern digital fraud operates, identify the psychological levers exploited by syndicates, and apply deterministic rules to protect yourself.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mt-5 relative max-w-lg">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search threats (e.g. Digital Arrest, QR Code, Electricity bill, India Post)..."
            className="w-full bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-lg pl-9 pr-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
          />
        </div>
      </div>

      {/* Grid of Threat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredGuides.map((guide) => {
          const Icon = guide.icon;
          return (
            <div
              key={guide.id}
              className="bg-[var(--surface-primary)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] rounded-xl p-5 flex flex-col justify-between transition-colors shadow-xs group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent-primary)] shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase border ${
                      guide.dangerLevel === 'CRITICAL'
                        ? 'bg-[var(--status-danger-bg)] text-[var(--status-danger)] border-[var(--status-danger)]'
                        : 'bg-[var(--status-warning-bg)] text-[var(--status-warning)] border-[var(--status-warning)]'
                    }`}
                  >
                    {guide.dangerLevel} THREAT
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-[var(--accent-primary)] uppercase tracking-wider block">
                    {guide.category}
                  </span>
                  <h2 className="text-sm font-heading font-bold text-[var(--text-primary)] mt-0.5 leading-snug">
                    {guide.title}
                  </h2>
                </div>

                <div className="p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] space-y-1 text-xs">
                  <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase block">
                    How it starts:
                  </span>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                    {guide.howItStarts}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedGuide(guide)}
                  className="text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                >
                  View Details & Golden Rule
                </button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onTestPrompt(guide.testPrompt, guide.promptType)}
                  icon={<ArrowRight className="w-3 h-3" />}
                >
                  Test Sample
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Guide Detail Modal */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 bg-[var(--bg-canvas)]/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surface-primary)] border border-[var(--border-color)] rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-[var(--border-color)] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent-primary)]">
                  <selectedGuide.icon className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-mono text-[var(--accent-primary)] uppercase">
                    {selectedGuide.category}
                  </span>
                  <h2 className="text-lg font-heading font-bold text-[var(--text-primary)]">
                    {selectedGuide.title}
                  </h2>
                </div>
              </div>
              <button
                onClick={() => setSelectedGuide(null)}
                className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Psychological Trap */}
            <div className="p-3.5 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] space-y-1">
              <span className="text-xs font-mono font-semibold text-[var(--status-warning)] uppercase flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Psychological Manipulation Tactic
              </span>
              <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                {selectedGuide.psychologicalTrap}
              </p>
            </div>

            {/* Red Flags */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-semibold text-[var(--text-primary)] uppercase tracking-wider block">
                Primary Red Flags
              </span>
              <div className="space-y-1.5">
                {selectedGuide.redFlags.map((flag, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] flex items-start gap-2"
                  >
                    <span className="text-[var(--status-danger)] font-bold text-xs shrink-0 mt-0.5">✕</span>
                    <span className="leading-snug">{flag}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Golden Rule */}
            <div className="p-4 rounded-xl bg-[var(--status-success-bg)] border border-[var(--status-success)] space-y-1">
              <span className="text-xs font-mono font-bold text-[var(--status-success)] uppercase flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                The Golden Defensive Rule
              </span>
              <p className="text-xs text-[var(--text-primary)] font-medium leading-relaxed">
                {selectedGuide.goldenRule}
              </p>
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-color)]">
              <Button variant="secondary" size="sm" onClick={() => setSelectedGuide(null)}>
                Close Reference
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  onTestPrompt(selectedGuide.testPrompt, selectedGuide.promptType);
                  setSelectedGuide(null);
                }}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Load into Threat Scanner
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
