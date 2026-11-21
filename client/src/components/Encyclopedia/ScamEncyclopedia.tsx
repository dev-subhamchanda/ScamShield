import React, { useState } from 'react';
import { Button } from '../UI/Button';
import {
  FontAwesomeIcon,
  faShieldHalved,
  faPhoneVolume,
  faQrcode,
  faLink,
  faFileShield,
  faMagnifyingGlass,
  faArrowRight,
  faCircleCheck,
} from '../UI/Icons';

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
}

const SCAM_GUIDES: ScamGuide[] = [
  {
    id: 'digital-arrest',
    title: 'Digital Arrest & Police Video Call Extortion',
    category: 'LAW ENFORCEMENT IMPERSONATION',
    icon: faPhoneVolume,
    dangerLevel: 'CRITICAL',
    howItStarts:
      'You receive a call or WhatsApp video call from someone dressed in a police uniform or claiming to be from the CBI/Customs Department, alleging a contraband parcel was seized under your Aadhaar.',
    psychologicalTrap:
      'Fear of arrest and legal shame. Scammers pressure victims into staying on video calls for hours, forbidding them from contacting family or lawyers.',
    redFlags: [
      'Claims you are under "Digital Arrest" (there is no legal concept of digital arrest in India)',
      'Conducts police interrogation over WhatsApp or Skype video call',
      'Sends forged Supreme Court arrest warrants with official-looking stamps',
      'Asks you to transfer funds to an "RBI verification / security escrow account"',
    ],
    realExample:
      'CONFIDENTIAL NOTICE FROM CBI: An arrest warrant has been approved under NDPS Act. An illegal parcel seized in customs contains 16 fake passports in your name. Join video call interrogation immediately.',
    goldenRule:
      'Police, CBI, and Customs NEVER interrogate or arrest citizens over WhatsApp video calls. Never transfer money to any "clearance account". Disconnect immediately and visit your local police station.',
    testPrompt:
      'CONFIDENTIAL NOTICE FROM CBI & MUMBAI POLICE: An arrest warrant has been issued against your Aadhaar card number under Section 21 of the NDPS Act. An illegal parcel seized in customs contains contraband. You are under immediate digital arrest. Connect to video call interrogation immediately.',
  },
  {
    id: 'reverse-upi',
    title: 'Reverse UPI & "Scan to Receive Money" Traps',
    category: 'PAYMENT GATEWAY DECEPTION',
    icon: faQrcode,
    dangerLevel: 'CRITICAL',
    howItStarts:
      'A buyer on OLX, Facebook Marketplace, or an unknown buyer contacts you to buy something you listed, offering to send an advance payment via Google Pay, PhonePe, or Paytm.',
    psychologicalTrap:
      'Greed and technical confusion. The scammer sends a QR code or payment collect request, telling you "Scan this QR code and type your UPI PIN to accept the advance credit."',
    redFlags: [
      'Anyone asking you to scan a QR code to "receive" funds',
      'Any prompt asking for your 4-digit or 6-digit UPI PIN to "accept" a refund or cashback',
      'Claims that payment is stuck until you approve the collect request',
    ],
    realExample:
      'Dear Seller, I am transferring the ₹15,000 advance payment for your sofa. Please scan this QR code and enter your UPI PIN to receive the money directly credited to your Google Pay bank balance.',
    goldenRule:
      'In UPI technology, entering your UPI PIN strictly DEDUCTS money from your account. You NEVER need to enter your PIN to receive money.',
    testPrompt:
      'Dear Seller, I am transferring the ₹15,000 advance payment for your sofa. Please scan this QR code and enter your UPI PIN to receive the money directly credited to your Google Pay bank balance.',
  },
  {
    id: 'courier-smishing',
    title: 'Courier & India Post "Incomplete Address" Smishing',
    category: 'POSTAL SMS PHISHING',
    icon: faLink,
    dangerLevel: 'HIGH',
    howItStarts:
      'You receive an urgent SMS claiming an India Post, FedEx, or DHL package cannot be delivered because your address or PIN code was incomplete.',
    psychologicalTrap:
      'Urgency and curiosity. People frequently order online and assume they might have a pending delivery. The scammer asks for a tiny ₹5 or ₹10 redelivery fee.',
    redFlags: [
      'SMS sent from an ordinary 10-digit mobile number rather than an official courier header (e.g. VK-INDPOST)',
      'Directs you to click an unofficial shortened link (e.g. bit.ly, .top, .online, .biz)',
      'Demands you enter credit card CVV or netbanking OTP to pay a tiny nominal fee',
    ],
    realExample:
      'Your India Post parcel ID-IN7821 cannot be delivered due to incomplete address. Please update within 12 hours at http://indiapost-parcel-redelivery.top or parcel will be returned.',
    goldenRule:
      'Never click tracking links inside SMS messages. Open the official courier app or website directly (e.g. indiapost.gov.in) and enter your tracking number there.',
    testPrompt:
      'http://indiapost-parcel-redelivery.top/update-address?trackId=IN89128',
  },
  {
    id: 'electricity-apk',
    title: 'Electricity Cutoff & Fake Utility APK Trojans',
    category: 'MOBILE SPYWARE / TROJAN',
    icon: faFileShield,
    dangerLevel: 'CRITICAL',
    howItStarts:
      'An SMS arrives warning: "Dear Consumer, your electricity will be disconnected tonight at 9:30 PM because your previous month bill was not updated. Call officer immediately."',
    psychologicalTrap:
      'Panic over losing electricity. When the victim calls the number, the scammer instructs them to download an "update app" via WhatsApp (which is a malicious APK) or install QuickSupport.',
    redFlags: [
      'Demands you call an individual personal mobile number instead of an official toll-free helpline',
      'Asks you to download an Android APK file (.apk) directly from a chat message',
      'The APK asks for permissions to read incoming SMS messages (used to steal bank OTPs)',
    ],
    realExample:
      'Dear consumer, your electricity power will be disconnected tonight at 9.30 PM from electricity office because your previous month bill was not updated. Please call electricity officer at 9876543210 immediately.',
    goldenRule:
      'Electricity boards NEVER send APK files via WhatsApp and never threaten same-night disconnection via personal phone numbers. Always pay bills through official state electricity portals.',
    testPrompt:
      'Dear consumer, your electricity power will be disconnected tonight at 9.30 PM from electricity office because your previous month bill was not updated. Please call electricity officer at 9876543210 immediately or download QuickSupport app to update bill.',
  },
  {
    id: 'weaponized-docs',
    title: 'Weaponized Invoices & Macro Documents',
    category: 'MALICIOUS DOCUMENTS',
    icon: faFileShield,
    dangerLevel: 'HIGH',
    howItStarts:
      'An email arrives with an attachment titled "Tax_Refund_Invoice.docx", "Salary_Slip.pdf.exe", or "Financial_Ledger.csv".',
    psychologicalTrap:
      'Curiosity or corporate routine. Upon opening, Microsoft Office displays a yellow banner prompting you to "Enable Editing" or "Enable Macros".',
    redFlags: [
      'File has a disguised double extension (e.g. invoice.pdf.exe)',
      'Office document prompts you to enable macros or external content to view text',
      'CSV file contains formulas starting with =cmd| or -powershell|',
    ],
    realExample:
      'Attachment: salary_slip_2026.pdf.exe containing a hidden Windows PE executable designed to steal Chrome browser passwords.',
    goldenRule:
      'Never click "Enable Content" or "Enable Macros" on unsolicited attachments. Legitimate invoices never require macro code execution to be readable.',
    testPrompt:
      'Financial statement containing embedded CSV DDE formula: =cmd|\'/c calc\'!A1',
  },
  {
    id: 'telegram-job',
    title: 'Telegram "Like & Earn" Job Task Scams',
    category: 'ADVANCE-FEE TASK FRAUD',
    icon: faShieldHalved,
    dangerLevel: 'HIGH',
    howItStarts:
      'A recruiter messages you on WhatsApp offering a flexible work-from-home job paying ₹150 for every YouTube video you like or hotel you review on Google Maps.',
    psychologicalTrap:
      'Small initial payouts build trust. Scammers pay ₹300-₹500 for the first few tasks. Then, they invite you to a VIP Telegram group requiring a ₹10,000 "crypto recharge" to unlock bigger payouts.',
    redFlags: [
      'Recruitment conducted entirely via WhatsApp and Telegram with no official interview or company contract',
      'Requires you to deposit or "recharge" cryptocurrency/USDT to receive your earnings',
      'Withdrawals are suddenly blocked until you pay heavy "tax penalties"',
    ],
    realExample:
      'Part-time job offer: Earn ₹3,000 to ₹5,000 daily by simply subscribing to YouTube channels. Contact our HR manager on Telegram @GlobalMediaTask_VIP for immediate ₹200 joining bonus.',
    goldenRule:
      'No genuine employer ever asks you to pay money or recharge crypto wallets to receive your earned salary.',
    testPrompt:
      'Part-time job offer: Earn ₹3,000 to ₹5,000 daily by simply subscribing to YouTube channels. Contact our HR manager on Telegram @GlobalMediaTask_VIP for immediate ₹200 joining bonus.',
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
      {/* Hero Banner */}
      <div className="bg-[#11151E] border border-[#30394B] rounded-2xl p-6 sm:p-8">
        <div className="max-w-3xl">
          <span className="px-2.5 py-0.5 rounded-full bg-[#6366F1]/20 text-[#818CF8] text-[11px] font-mono font-semibold uppercase tracking-wider inline-block mb-2">
            Citizen Education & Resource Library
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-[#F1F5F9]">
            The Plain-English Cyber Scam Encyclopedia
          </h2>
          <p className="text-sm text-[#94A3B8] mt-2 leading-relaxed">
            No technical jargon. Learn how modern scammers trick people, what they say, and the exact golden
            rule to stay completely safe online.
          </p>
        </div>

        {/* Search Bar */}
        <div className="mt-6 relative max-w-xl">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
            <FontAwesomeIcon icon={faMagnifyingGlass} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scams by name, e.g. Digital Arrest, QR Code, Electricity bill, India Post..."
            className="w-full bg-[#090B10] border border-[#30394B] rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm text-[#F1F5F9] focus:outline-none focus:border-[#818CF8] transition-all"
          />
        </div>
      </div>

      {/* Scam Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredGuides.map((guide) => (
          <div
            key={guide.id}
            className="bg-[#11151E] border border-[#30394B] hover:border-[#818CF8]/50 rounded-2xl p-5 flex flex-col justify-between transition-all group"
          >
            <div className="space-y-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#1B2230] border border-[#30394B] flex items-center justify-center text-[#818CF8] text-lg group-hover:scale-105 transition-transform">
                  <FontAwesomeIcon icon={guide.icon} />
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wide uppercase ${
                    guide.dangerLevel === 'CRITICAL'
                      ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30'
                      : 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30'
                  }`}
                >
                  {guide.dangerLevel} THREAT
                </span>
              </div>

              <div>
                <span className="text-[10px] font-mono font-semibold text-[#818CF8] uppercase tracking-wider block">
                  {guide.category}
                </span>
                <h3 className="text-base font-bold font-display text-[#F1F5F9] mt-0.5 leading-snug">
                  {guide.title}
                </h3>
              </div>

              <div className="p-3 rounded-xl bg-[#090B10] border border-[#30394B] space-y-1.5 text-xs">
                <span className="text-[#818CF8] font-semibold text-[11px] block font-mono">
                  HOW THE SCAM STARTS:
                </span>
                <p className="text-[#94A3B8] leading-relaxed">{guide.howItStarts}</p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-[#F1F5F9] font-semibold uppercase block">
                  Dead Giveaway Red Flags:
                </span>
                <ul className="space-y-1 text-xs text-[#94A3B8]">
                  {guide.redFlags.slice(0, 2).map((rf, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-[#EF4444] font-bold shrink-0">✕</span>
                      <span>{rf}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#30394B] flex items-center justify-between gap-2">
              <button
                onClick={() => setSelectedGuide(guide)}
                className="text-xs font-semibold text-[#818CF8] hover:text-[#A5B4FC] flex items-center gap-1 transition-colors"
              >
                <span>Read Full Guide</span>
                <FontAwesomeIcon icon={faArrowRight} className="text-[10px]" />
              </button>

              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  onTestPrompt(
                    guide.testPrompt,
                    guide.id === 'courier-smishing' ? 'url' : 'text'
                  )
                }
              >
                Test in Scanner
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Detailed Modal for Full Scam Guide */}
      {selectedGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#090B10]/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-[#11151E] border border-[#30394B] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-[#30394B] flex items-center justify-between bg-[#1B2230]/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#6366F1]/20 text-[#818CF8] flex items-center justify-center text-lg">
                  <FontAwesomeIcon icon={selectedGuide.icon} />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-display text-[#F1F5F9]">
                    {selectedGuide.title}
                  </h3>
                  <span className="text-xs font-mono text-[#818CF8]">
                    {selectedGuide.category}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedGuide(null)}
                className="text-[#94A3B8] hover:text-[#F1F5F9] text-xl font-bold px-2 py-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
              <div>
                <h4 className="text-xs font-bold text-[#818CF8] uppercase font-mono tracking-wider mb-1.5">
                  1. The Deception Strategy
                </h4>
                <p className="text-[#F1F5F9] leading-relaxed">{selectedGuide.howItStarts}</p>
                <p className="text-[#94A3B8] mt-1 leading-relaxed">
                  <strong>The Trap:</strong> {selectedGuide.psychologicalTrap}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#EF4444] uppercase font-mono tracking-wider mb-2">
                  2. All Dead Giveaway Red Flags
                </h4>
                <div className="space-y-2">
                  {selectedGuide.redFlags.map((rf, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-[#090B10] border border-[#30394B] text-xs text-[#F1F5F9] flex items-start gap-2"
                    >
                      <span className="text-[#EF4444] font-bold">✕</span>
                      <span>{rf}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 space-y-1">
                <h4 className="text-xs font-bold text-[#22C55E] uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <FontAwesomeIcon icon={faCircleCheck} />
                  The Golden Rule for 100% Protection
                </h4>
                <p className="text-xs text-[#F1F5F9] font-medium leading-relaxed">
                  {selectedGuide.goldenRule}
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <Button variant="secondary" onClick={() => setSelectedGuide(null)}>
                  Close Guide
                </Button>
                <Button
                  onClick={() => {
                    const prompt = selectedGuide.testPrompt;
                    const type = selectedGuide.id === 'courier-smishing' ? 'url' : 'text';
                    setSelectedGuide(null);
                    onTestPrompt(prompt, type);
                  }}
                >
                  Test Sample in Scanner
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
