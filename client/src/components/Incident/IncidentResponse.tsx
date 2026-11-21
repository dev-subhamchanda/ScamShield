import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { AnalysisResult, ThreatCategory } from '../../types';
import { api } from '../../services/api';
import { Button } from '../UI/Button';
import {
  CheckCircle2,
  ExternalLink,
  FileText,
  Check,
  RotateCcw,
} from 'lucide-react';

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
    formState: { isSubmitting },
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
      desc: 'Dial 1930 within the Golden Hour window. The Citizen Financial Cyber Fraud Reporting System can freeze beneficiary nodal accounts before scammers withdraw cash at ATMs.',
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
      const resData = await api.incident.submitReport({
        threatCategory: data.threatCategory as ThreatCategory,
        financialLossAmount: data.financialLossAmount,
        transactionReference: data.transactionReference?.trim(),
        suspectContactOrHandle: data.suspectContactOrHandle?.trim(),
      });
      if (resData.incident) {
        setCreatedCaseId(resData.incident.id);
      }
    } catch {
      // Handle error
    }
  };

  const completedSteps = checklist.filter((c) => c.done).length;
  const progressPct = Math.round((completedSteps / checklist.length) * 100);

  return (
    <div className="space-y-6">
      {/* Golden Hour Helpline Header */}
      <div className="bg-[var(--surface-primary)] border border-[var(--status-danger)] rounded-xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[var(--status-danger-bg)] text-[var(--status-danger)] border border-[var(--status-danger)]">
              CRITICAL EMERGENCY PROTOCOL
            </span>
            <span className="text-xs font-mono text-[var(--text-muted)]">Golden Hour Window</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-[var(--text-primary)]">
            National Cyber Crime Helpline: <span className="text-[var(--accent-primary)] font-mono">1930</span>
          </h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Dial 1930 immediately if money was transferred. Rapid intervention freezes the fraudulent recipient accounts before fund dispersal.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[var(--surface-elevated)] hover:bg-[var(--surface-hover)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] font-medium transition-colors cursor-pointer"
          >
            <span>cybercrime.gov.in</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Golden Hour Checklist */}
        <div className="lg:col-span-7 bg-[var(--surface-primary)] border border-[var(--border-color)] rounded-xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4">
            <div>
              <h2 className="text-base font-bold font-heading text-[var(--text-primary)]">
                5-Step Financial Recovery Checklist
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Follow these exact steps to maximize your chances of halting illegal debit settlement.
              </p>
            </div>
            <div className="text-right font-mono">
              <span className="text-xs font-bold text-[var(--accent-primary)]">{progressPct}%</span>
              <span className="text-[10px] text-[var(--text-muted)] block">Completed</span>
            </div>
          </div>

          <div className="space-y-3">
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleStep(item.id)}
                className={`p-3.5 rounded-lg border transition-colors cursor-pointer flex items-start gap-3 ${
                  item.done
                    ? 'bg-[var(--status-success-bg)] border-[var(--status-success)] text-[var(--text-primary)]'
                    : 'bg-[var(--surface-elevated)] border-[var(--border-color)] hover:border-[var(--accent-primary)] text-[var(--text-secondary)]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center shrink-0 mt-0.5 border ${
                    item.done
                      ? 'bg-[var(--status-success)] text-white border-[var(--status-success)]'
                      : 'border-[var(--border-color)] bg-[var(--surface-primary)]'
                  }`}
                >
                  {item.done && <Check className="w-3.5 h-3.5" />}
                </div>
                <div className="space-y-0.5">
                  <h3
                    className={`text-xs font-heading font-semibold ${
                      item.done ? 'text-[var(--status-success)] line-through' : 'text-[var(--text-primary)]'
                    }`}
                  >
                    Step {item.id}: {item.title}
                  </h3>
                  <p className="text-[11px] leading-relaxed text-[var(--text-secondary)]">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Case Dossier Generator */}
        <div className="lg:col-span-5 bg-[var(--surface-primary)] border border-[var(--border-color)] rounded-xl p-6 shadow-xs space-y-4">
          <div className="border-b border-[var(--border-color)] pb-3">
            <h2 className="text-base font-bold font-heading text-[var(--text-primary)]">
              Generate Standardized Incident Dossier
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Compiles case telemetry into a format ready for submission to the CyberCell and your bank.
            </p>
          </div>

          {createdCaseId ? (
            <div className="p-4 rounded-xl bg-[var(--status-success-bg)] border border-[var(--status-success)] space-y-3 text-center">
              <CheckCircle2 className="w-8 h-8 text-[var(--status-success)] mx-auto" />
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)] font-heading">
                  Incident Case Dossier Registered
                </h3>
                <p className="text-xs text-[var(--text-secondary)] font-mono mt-1 select-all">
                  Case Identifier: <strong className="text-[var(--status-success)]">{createdCaseId}</strong>
                </p>
              </div>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                Provide this case identifier along with your bank UTR transaction number when contacting the 1930 Cyber Helpline.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setCreatedCaseId(null);
                  reset();
                }}
                icon={<RotateCcw className="w-3 h-3" />}
              >
                Log Another Incident
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Threat Category
                </label>
                <select
                  {...register('threatCategory')}
                  className="w-full bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-lg p-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                >
                  <option value="REVERSE_UPI_QR">Reverse UPI QR Trap</option>
                  <option value="DIGITAL_ARREST">Digital Arrest Video Call Coercion</option>
                  <option value="COURIER_DELIVERY_SMISHING">Courier / India Post Smishing</option>
                  <option value="IMPERSONATION_SOCIAL_ENGINEERING">Electricity Disconnection Threat</option>
                  <option value="MALICIOUS_EXECUTABLE">Malicious APK / Trojan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Financial Loss Incurred (INR ₹)
                </label>
                <input
                  type="number"
                  placeholder="0 if halted in time"
                  {...register('financialLossAmount')}
                  className="w-full bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-lg p-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Bank Reference / UTR / RRN (12 Digits)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 409182749102"
                  {...register('transactionReference')}
                  className="w-full bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-lg p-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                  Suspect Contact Number, UPI ID or Website
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210 or fraud_merchant@okaxis"
                  {...register('suspectContactOrHandle')}
                  className="w-full bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-lg p-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors font-mono"
                />
              </div>

              <Button
                type="submit"
                size="md"
                isLoading={isSubmitting}
                className="w-full mt-2"
                icon={<FileText className="w-3.5 h-3.5" />}
              >
                Compile Case Dossier
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
