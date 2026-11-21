import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CommunityThreatReport, ThreatCategory } from '../../types';
import { Badge } from '../UI/Badge';
import { Button } from '../UI/Button';
import { Modal } from '../UI/Modal';
import {
  FontAwesomeIcon,
  faUsersViewfinder,
  faThumbsUp,
  faCircleCheck,
  faUpload,
} from '../UI/Icons';

const communityReportSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  threatType: z.string().min(1),
  content: z.string().min(10, 'Message content must be at least 10 characters'),
  reportingReason: z.string().optional(),
});

type CommunityReportFormData = z.infer<typeof communityReportSchema>;

export const CommunityIntel: React.FC = () => {
  const [reports, setReports] = useState<CommunityThreatReport[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<CommunityReportFormData>({
    resolver: zodResolver(communityReportSchema) as any,
    defaultValues: {
      title: '',
      threatType: 'DIGITAL_ARREST',
      content: '',
      reportingReason: '',
    },
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/v1/community/threats');
      const data = await res.json();
      if (data.success && data.reports) {
        setReports(data.reports);
      }
    } catch {
      // Keep empty if fetch fails
    }
  };

  const handleVote = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/community/threats/${id}/vote`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        setReports((prev) =>
          prev.map((r) => (r.id === id ? { ...r, upvotes: data.upvotes } : r))
        );
      }
    } catch {
      // Ignore error
    }
  };

  const onSubmit = async (data: CommunityReportFormData) => {
    setFeedbackMsg(null);
    try {
      const res = await fetch('/api/v1/community/threats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: data.title.trim(),
          threatType: data.threatType as ThreatCategory,
          content: data.content.trim(),
          reportingReason: data.reportingReason?.trim() || 'Reported by community user',
        }),
      });

      const resData = await res.json();
      if (resData.success && resData.report) {
        setReports((prev) => [resData.report, ...prev]);
        setIsReportModalOpen(false);
        reset();
        setFeedbackMsg('Thank you! Your threat report has been recorded and submitted for moderation.');
      }
    } catch {
      setFeedbackMsg('Failed to submit report. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#11151E] border border-[#30394B] rounded-2xl p-6">
        <div>
          <h2 className="text-xl font-bold font-display text-[#F1F5F9] flex items-center gap-2.5">
            <FontAwesomeIcon icon={faUsersViewfinder} className="text-[#818CF8]" />
            Community Threat Intelligence Network
          </h2>
          <p className="text-xs text-[#94A3B8] mt-1">
            Crowdsourced cyber threat indicators, verified phishing campaigns, and early scam alerts.
          </p>
        </div>
        <Button
          onClick={() => setIsReportModalOpen(true)}
          icon={<FontAwesomeIcon icon={faUpload} />}
        >
          Submit Scam Report
        </Button>
      </div>

      {feedbackMsg && (
        <div className="p-3 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-xs text-[#22C55E] flex items-center gap-2">
          <FontAwesomeIcon icon={faCircleCheck} />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Reports Feed */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report) => (
          <div
            key={report.id}
            className="bg-[#11151E] border border-[#30394B] rounded-2xl p-5 flex flex-col justify-between hover:border-[#818CF8]/40 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <span className="font-display font-semibold text-sm text-[#F1F5F9] leading-snug">
                  {report.title}
                </span>
                <Badge severity={report.riskSeverity} />
              </div>

              {/* Sanitized Snippet */}
              <div className="p-3 rounded-xl bg-[#090B10] border border-[#30394B] text-xs font-mono text-[#94A3B8] leading-relaxed">
                "{report.sanitizedSnippet}"
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="accent" label={report.threatType} />
                {report.verifiedByAdmin && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#22C55E]">
                    <FontAwesomeIcon icon={faCircleCheck} /> Verified by Admin
                  </span>
                )}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#30394B] flex items-center justify-between text-xs text-[#94A3B8]">
              <span className="font-mono text-[11px]">
                {new Date(report.createdAt).toLocaleDateString()}
              </span>
              <button
                onClick={() => handleVote(report.id)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1B2230] hover:bg-[#6366F1]/20 hover:text-[#818CF8] border border-[#30394B] transition-colors"
              >
                <FontAwesomeIcon icon={faThumbsUp} />
                <span className="font-mono font-bold text-xs">{report.upvotes}</span>
                <span className="text-[11px]">Helpful</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Report Modal (React Hook Form + Zod) */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Submit New Threat to Community Network"
        subtitle="Automatic PII redaction is applied before data is stored."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] uppercase font-mono mb-1">
              Report Title
            </label>
            <input
              type="text"
              {...register('title')}
              placeholder="e.g. Fake CBI Video Call Notice on WhatsApp"
              className="w-full bg-[#090B10] border border-[#30394B] rounded-xl px-4 py-2.5 text-sm text-[#F1F5F9] focus:outline-none focus:border-[#818CF8]"
            />
            {errors.title && (
              <p className="text-[11px] text-[#EF4444] mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] uppercase font-mono mb-1">
              Threat Category
            </label>
            <select
              {...register('threatType')}
              className="w-full bg-[#090B10] border border-[#30394B] rounded-xl px-4 py-2.5 text-sm text-[#F1F5F9] focus:outline-none focus:border-[#818CF8]"
            >
              <option value="DIGITAL_ARREST">Digital Arrest / Police Impersonation</option>
              <option value="REVERSE_UPI_QR">Reverse UPI / QR Code Trap</option>
              <option value="COURIER_DELIVERY_SMISHING">Courier / Delivery Smishing</option>
              <option value="MALICIOUS_APK">Malicious Android APK</option>
              <option value="MALICIOUS_DOCUMENT">Weaponized Document (PDF/DOCX/CSV)</option>
              <option value="PHISHING_CREDENTIAL_HARVEST">Phishing Link / Website</option>
              <option value="TELEGRAM_JOB_TASK">Telegram / Job Task Fraud</option>
              <option value="IMPERSONATION_SOCIAL_ENGINEERING">Utility / Social Engineering</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] uppercase font-mono mb-1">
              Message Content or Threat Artifact
            </label>
            <textarea
              rows={4}
              {...register('content')}
              placeholder="Paste the suspicious SMS, WhatsApp text, or link..."
              className="w-full bg-[#090B10] border border-[#30394B] rounded-xl p-3 text-sm text-[#F1F5F9] focus:outline-none focus:border-[#818CF8]"
            />
            {errors.content && (
              <p className="text-[11px] text-[#EF4444] mt-1">{errors.content.message}</p>
            )}
            <p className="text-[11px] text-[#22C55E] mt-1 flex items-center gap-1">
              <FontAwesomeIcon icon={faCircleCheck} />
              Any sensitive phone numbers, cards, or bank handles are automatically masked.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#94A3B8] uppercase font-mono mb-1">
              Why do you suspect this is fraudulent?
            </label>
            <input
              type="text"
              {...register('reportingReason')}
              placeholder="e.g. Unknown number claiming to be police officer"
              className="w-full bg-[#090B10] border border-[#30394B] rounded-xl px-4 py-2 text-sm text-[#F1F5F9] focus:outline-none focus:border-[#818CF8]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button variant="secondary" type="button" onClick={() => setIsReportModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Submit for Verification
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
