import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { AnalysisResult, ThreatCategory } from '../../types';
import { Button } from '../UI/Button';
import {
  FontAwesomeIcon,
  faPhoneVolume,
  faCircleCheck,
  faArrowUpRightFromSquare,
} from '../UI/Icons';

const incidentSchema = z.object({
  threatCategory: z.string().min(1),
  financialLossAmount: z.coerce.number().min(0).default(0),
  transactionReference: z.string().optional(),
  suspectContactOrHandle: z.string().optional(),
});

type IncidentFormData = z.infer<typeof incidentSchema>;

interface IncidentResponseProps {
  initialThreat?: AnalysisResult | null;
}

export const IncidentResponse: React.FC<IncidentResponseProps> = ({ initialThreat }) => {
  const [createdCaseId, setCreatedCaseId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema) as any,
    defaultValues: {
      threatCategory: initialThreat ? initialThreat.threatCategory : 'REVERSE_UPI_QR',
      financialLossAmount: 0,
      transactionReference: '',
      suspectContactOrHandle: '',
    },
  });

  const [checklist, setChecklist] = useState([
    {
      id: 1,
      title: 'Call 1930 Cyber Crime Helpline immediately',
      desc: 'Dial 1930 (Golden Hour Window) to instruct the citizen financial cyber fraud reporting system to freeze beneficiary accounts before scammers withdraw cash at ATMs.',
      done: false,
    },
    {
      id: 2,
      title: 'Block Bank Account, Netbanking & UPI Handle',
      desc: 'Use your mobile banking app to temporarily block UPI and debit cards, preventing unauthorized subsequent auto-debit mandates.',
      done: false,
    },
    {
      id: 3,
      title: 'Secure Evidence (Screenshots & UTR / RRN numbers)',
      desc: 'Screenshot the scammer’s phone number, WhatsApp chat transcript, QR code image, and note down the exact 12-digit UTR/RRN transaction reference.',
      done: false,
    },
    {
      id: 4,
      title: 'File Formal Complaint at cybercrime.gov.in',
      desc: 'Submit the formal FIR registration on the national portal with your UTR number and obtain an official acknowledgment number.',
      done: false,
    },
    {
      id: 5,
      title: 'Submit Bank Dispute / Chargeback Form',
      desc: 'Within 24 hours, visit your home branch with the CyberCell complaint acknowledgment to submit the unauthorized transaction dispute form.',
      done: false,
    },
  ]);

  const toggleStep = (id: number) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, done: !item.done } : item))
    );
  };

  const onSubmit = async (data: IncidentFormData) => {
    try {
      const res = await fetch('/api/v1/incident/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          threatCategory: data.threatCategory as ThreatCategory,
          financialLossAmount: data.financialLossAmount,
          transactionReference: data.transactionReference?.trim(),
          suspectContactOrHandle: data.suspectContactOrHandle?.trim(),
        }),
      });
      const resData = await res.json();
      if (resData.success && resData.incident) {
        setCreatedCaseId(resData.incident.id);
      }
    } catch {
      // Handle error
    }
  };

  return (
    <div className="space-y-6">
      {/* 1930 Emergency Banner */}
      <div className="bg-[#EF4444]/15 border border-[#EF4444]/40 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <span className="px-2.5 py-0.5 rounded-full bg-[#EF4444] text-white text-[11px] font-mono font-bold uppercase tracking-wider inline-block">
              Priority Cyber Fraud Response
            </span>
            <h2 className="text-2xl font-bold font-display text-[#F1F5F9]">
              Victim Financial Emergency: Act Within the Golden Hour
            </h2>
            <p className="text-xs sm:text-sm text-[#F1F5F9]/80 leading-relaxed">
              If you scanned a fraudulent QR code, shared an OTP, or transferred money under coercion,
              funds move through multiple mule bank accounts. Calling 1930 immediately gives police the
              highest probability of freezing the beneficiary balance.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-3 shrink-0">
            <a
              href="tel:1930"
              className="px-6 py-3.5 rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white font-bold text-center flex items-center justify-center gap-2.5 shadow-lg shadow-[#EF4444]/30 text-base"
            >
              <FontAwesomeIcon icon={faPhoneVolume} className="text-lg" />
              <span>Dial 1930 Helpline</span>
            </a>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-[#11151E] hover:bg-[#1B2230] border border-[#30394B] text-xs font-semibold text-[#F1F5F9] text-center flex items-center justify-center gap-2"
            >
              <span>National Cyber Crime Portal</span>
              <FontAwesomeIcon icon={faArrowUpRightFromSquare} />
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Step-by-Step Response Checklist */}
        <div className="lg:col-span-7 bg-[#11151E] border border-[#30394B] rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold font-display text-[#F1F5F9] flex items-center gap-2 font-mono">
            <span className="w-2.5 h-2.5 rounded-full bg-[#818CF8]" />
            Immediate 5-Step Recovery Protocol
          </h3>
          <p className="text-xs text-[#94A3B8]">
            Check off each step as you complete it to organize your incident recovery workflow.
          </p>

          <div className="space-y-3 pt-2">
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleStep(item.id)}
                className={`p-4 rounded-xl border transition-all cursor-pointer select-none flex items-start gap-3.5 ${
                  item.done
                    ? 'bg-[#22C55E]/10 border-[#22C55E]/40'
                    : 'bg-[#1B2230]/40 border-[#30394B] hover:border-[#818CF8]/40'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-xs mt-0.5 ${
                    item.done
                      ? 'bg-[#22C55E] text-white'
                      : 'border border-[#94A3B8] text-transparent'
                  }`}
                >
                  <FontAwesomeIcon icon={faCircleCheck} />
                </div>
                <div>
                  <h4
                    className={`text-sm font-semibold ${
                      item.done ? 'line-through text-[#22C55E]' : 'text-[#F1F5F9]'
                    }`}
                  >
                    {item.id}. {item.title}
                  </h4>
                  <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Incident Case Filing Box (React Hook Form + Zod) */}
        <div className="lg:col-span-5 bg-[#11151E] border border-[#30394B] rounded-2xl p-6 space-y-4">
          <h3 className="text-base font-bold font-display text-[#F1F5F9]">
            Log Incident & Generate Audit Dossier
          </h3>
          <p className="text-xs text-[#94A3B8]">
            Records your case details in the local vault to help when preparing bank dispute documents.
          </p>

          {createdCaseId ? (
            <div className="p-4 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 space-y-2">
              <span className="text-xs font-bold text-[#22C55E] font-mono flex items-center gap-1.5">
                <FontAwesomeIcon icon={faCircleCheck} />
                Incident Case Logged Successfully
              </span>
              <p className="text-xs text-[#F1F5F9] font-mono">
                Case Tracking ID: <strong className="text-[#818CF8]">{createdCaseId}</strong>
              </p>
              <p className="text-xs text-[#94A3B8]">
                Provide this ID along with the technical telemetry when filing your cybercell report.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setCreatedCaseId(null);
                  reset();
                }}
              >
                Log Another Incident
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] uppercase font-mono mb-1">
                  Threat Category
                </label>
                <select
                  {...register('threatCategory')}
                  className="w-full bg-[#090B10] border border-[#30394B] rounded-xl px-3.5 py-2.5 text-xs text-[#F1F5F9] focus:outline-none focus:border-[#818CF8]"
                >
                  <option value="REVERSE_UPI_QR">Reverse UPI / QR Code Scam</option>
                  <option value="DIGITAL_ARREST">Digital Arrest / Fake Police Extortion</option>
                  <option value="COURIER_DELIVERY_SMISHING">Courier Redelivery Smishing</option>
                  <option value="MALICIOUS_APK">Malicious Android Banking APK</option>
                  <option value="TELEGRAM_JOB_TASK">Telegram Task / Crypto Scam</option>
                  <option value="IMPERSONATION_SOCIAL_ENGINEERING">Electricity / Utility Fraud</option>
                </select>
                {errors.threatCategory && (
                  <p className="text-[11px] text-[#EF4444] mt-1">{errors.threatCategory.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] uppercase font-mono mb-1">
                  Financial Loss Amount (₹ / INR)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 25000 (leave 0 if blocked in time)"
                  {...register('financialLossAmount')}
                  className="w-full bg-[#090B10] border border-[#30394B] rounded-xl px-3.5 py-2 text-xs text-[#F1F5F9] focus:outline-none focus:border-[#818CF8]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] uppercase font-mono mb-1">
                  Bank Transaction UTR / RRN (12 Digits)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 439281920192"
                  {...register('transactionReference')}
                  className="w-full bg-[#090B10] border border-[#30394B] rounded-xl px-3.5 py-2 text-xs text-[#F1F5F9] focus:outline-none focus:border-[#818CF8] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#94A3B8] uppercase font-mono mb-1">
                  Suspect Contact / UPI ID / Profile Handle
                </label>
                <input
                  type="text"
                  placeholder="e.g. scammer_payee@okhdfcbank or +91 98765..."
                  {...register('suspectContactOrHandle')}
                  className="w-full bg-[#090B10] border border-[#30394B] rounded-xl px-3.5 py-2 text-xs text-[#F1F5F9] focus:outline-none focus:border-[#818CF8]"
                />
              </div>

              <Button type="submit" isLoading={isSubmitting} className="w-full">
                Generate Incident Dossier
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
