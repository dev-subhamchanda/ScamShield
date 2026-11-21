import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { CommunityThreatReport, ThreatCategory } from '../../types';
import { api } from '../../services/api';
import { Badge } from '../UI/Badge';
import { Button } from '../UI/Button';
import { Modal } from '../UI/Modal';
import {
  Users,
  ThumbsUp,
  CheckCircle2,
  Plus,
  Clock,
} from 'lucide-react';

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

  const fetchReports = useCallback(async () => {
    try {
      const data = await api.community.getThreats();
      if (data.reports) {
        setReports(data.reports);
      }
    } catch {
      // Keep empty if fetch fails
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleVote = async (id: string) => {
    try {
      const data = await api.community.vote(id);
      if (data.upvotes !== undefined) {
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
      const resData = await api.community.submitReport({
        title: data.title.trim(),
        threatType: data.threatType as ThreatCategory,
        content: data.content.trim(),
        reportingReason: data.reportingReason?.trim() || 'Reported by community user',
      });

      if (resData.report) {
        setReports((prev) => [resData.report, ...prev]);
        setIsReportModalOpen(false);
        reset();
        setFeedbackMsg('Thank you! Your threat report has been recorded and submitted for moderation.');
      }
    } catch (err: any) {
      setFeedbackMsg(err.message || 'Failed to submit report. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="bg-[var(--surface-primary)] border border-[var(--border-color)] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md text-[11px] font-mono border border-[var(--border-color)] bg-[var(--surface-elevated)] text-[var(--accent-primary)] mb-2">
            <Users className="w-3.5 h-3.5" />
            <span>Crowdsourced Cyber Threat Feed</span>
          </div>
          <h1 className="text-2xl font-bold font-heading text-[var(--text-primary)] tracking-tight">
            Community Threat Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
            Real-time feed of active phishing numbers, UPI merchant traps, and suspicious SMS submitted by citizens.
          </p>
        </div>

        <Button
          onClick={() => setIsReportModalOpen(true)}
          size="md"
          icon={<Plus className="w-4 h-4" />}
        >
          Report New Threat
        </Button>
      </div>

      {/* Feedback banner */}
      {feedbackMsg && (
        <div className="p-3.5 rounded-xl bg-[var(--status-success-bg)] border border-[var(--status-success)] text-xs text-[var(--status-success)] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Report Feed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report) => (
          <div
            key={report.id}
            className="bg-[var(--surface-primary)] border border-[var(--border-color)] hover:border-[var(--accent-primary)] rounded-xl p-5 flex flex-col justify-between transition-colors shadow-xs"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <span className="text-[10px] font-mono text-[var(--accent-primary)] uppercase tracking-wider">
                  {report.threatType}
                </span>
                <div className="flex items-center gap-2">
                  <Badge severity={report.riskSeverity} />
                  {report.verifiedByAdmin && (
                    <span className="flex items-center gap-1 text-[10px] font-mono text-[var(--status-success)] font-semibold border border-[var(--status-success)] px-1.5 py-0.5 rounded-md bg-[var(--status-success-bg)]">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
              </div>

              <h2 className="text-sm font-bold font-heading text-[var(--text-primary)] leading-snug">
                {report.title}
              </h2>

              <div className="p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)]">
                <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase block mb-1">
                  Sanitized Evidence:
                </span>
                <p className="text-xs text-[var(--text-secondary)] font-mono leading-relaxed select-all">
                  "{report.sanitizedSnippet}"
                </p>
              </div>

              {report.tags && report.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {report.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded bg-[var(--surface-elevated)] border border-[var(--border-color)] text-[10px] font-mono text-[var(--text-secondary)]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs">
              <span className="text-[11px] font-mono text-[var(--text-muted)] flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(report.createdAt).toLocaleDateString()}
              </span>

              <button
                onClick={() => handleVote(report.id)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[var(--surface-elevated)] hover:border-[var(--accent-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors font-mono text-xs cursor-pointer"
              >
                <ThumbsUp className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                <span>Confirm Threat ({report.upvotes})</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Submission Modal */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title="Submit New Threat to Community Intelligence"
        subtitle="Shared indicators help protect other citizens from active syndicates."
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Threat Title / Brief Summary
            </label>
            <input
              type="text"
              placeholder="e.g. Courier Redelivery SMS asking for 25 Rs"
              {...register('title')}
              className="w-full bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-lg p-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
            />
            {errors.title && (
              <span className="text-[11px] text-[var(--status-danger)] mt-1 block">
                {errors.title.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Threat Category
            </label>
            <select
              {...register('threatType')}
              className="w-full bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-lg p-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
            >
              <option value="DIGITAL_ARREST">Digital Arrest / Law Enforcement Coercion</option>
              <option value="REVERSE_UPI_QR">Reverse UPI / QR Code Trap</option>
              <option value="COURIER_DELIVERY_SMISHING">Courier / India Post Smishing</option>
              <option value="IMPERSONATION_SOCIAL_ENGINEERING">Electricity / Utility Disconnection</option>
              <option value="MALICIOUS_EXECUTABLE">Malicious APK / Trojan</option>
              <option value="PHISHING_CREDENTIAL_HARVEST">Phishing Link / Credential Harvest</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
              Sample Text / Message / Link
            </label>
            <textarea
              rows={4}
              placeholder="Paste the suspicious content here (sensitive personal info is automatically scrubbed)..."
              {...register('content')}
              className="w-full bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-lg p-2.5 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
            />
            {errors.content && (
              <span className="text-[11px] text-[var(--status-danger)] mt-1 block">
                {errors.content.message}
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border-color)]">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsReportModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isSubmitting}>
              Submit Threat Report
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
