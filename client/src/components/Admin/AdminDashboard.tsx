import React, { useEffect, useState, useCallback } from 'react';
import type { AuditLogEntry, CommunityThreatReport } from '../../types';
import { api } from '../../services/api';
import { Badge } from '../UI/Badge';
import { Button } from '../UI/Button';
import {
  SlidersHorizontal,
  CheckCircle2,
  XCircle,
  Terminal,
  RefreshCw,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [reports, setReports] = useState<CommunityThreatReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    try {
      const [repData, logData] = await Promise.all([
        api.admin.getModerationQueue(),
        api.admin.getAuditLogs(),
      ]);

      if (repData.reports) setReports(repData.reports);
      if (logData.auditLogs) setAuditLogs(logData.auditLogs);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleReview = async (reportId: string, action: 'approve' | 'reject') => {
    try {
      const data = await api.admin.reviewReport(reportId, action);
      if (data.report) {
        if (action === 'reject') {
          setReports((prev) => prev.filter((r) => r.id !== reportId));
        } else {
          setReports((prev) =>
            prev.map((r) => (r.id === reportId ? { ...r, verifiedByAdmin: true } : r))
          );
        }
      }
    } catch {
      // Ignore
    }
  };

  const pendingReports = reports.filter((r) => !r.verifiedByAdmin);

  return (
    <div className="space-y-6">
      {/* Top Banner with Engine Health Status */}
      <div className="bg-[var(--surface-primary)] border border-[var(--border-color)] rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md text-[11px] font-mono border border-[var(--border-color)] bg-[var(--surface-elevated)] text-[var(--status-warning)] mb-2">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Restricted Security Operations Console</span>
            </div>
            <h1 className="text-2xl font-bold font-heading text-[var(--text-primary)] tracking-tight">
              Administrative Moderation & Engine Controls
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              Review crowdsourced indicators, inspect engine safeguards, and audit immutable security logs.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchAdminData}
            isLoading={loading}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Telemetry
          </Button>
        </div>

        {/* Engine Safeguards Status Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 border-t border-[var(--border-color)] text-xs font-mono">
          <div className="p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)]">
            <span className="text-[var(--text-muted)] text-[10px] block">MIME Magic Engine</span>
            <span className="text-[var(--status-success)] font-bold flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-success)]" /> ACTIVE (Zero-Exec)
            </span>
          </div>
          <div className="p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)]">
            <span className="text-[var(--text-muted)] text-[10px] block">SSRF Guardrail</span>
            <span className="text-[var(--status-success)] font-bold flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-success)]" /> RFC1918 Blocked
            </span>
          </div>
          <div className="p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)]">
            <span className="text-[var(--text-muted)] text-[10px] block">Zip Bomb Safeguard</span>
            <span className="text-[var(--status-success)] font-bold flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-success)]" /> 10:1 Ratio Ceiling
            </span>
          </div>
          <div className="p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)]">
            <span className="text-[var(--text-muted)] text-[10px] block">Gemini Model</span>
            <span className="text-[var(--accent-primary)] font-bold flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]" /> 3-Flash-Preview
            </span>
          </div>
        </div>
      </div>

      {/* Moderation Queue */}
      <div className="bg-[var(--surface-primary)] border border-[var(--border-color)] rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold font-heading text-[var(--text-primary)]">
              Pending Community Reports ({pendingReports.length})
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Verify crowdsourced threat samples before broadcasting across community defense feeds.
            </p>
          </div>
        </div>

        {pendingReports.length === 0 ? (
          <div className="py-8 text-center text-xs text-[var(--text-muted)]">
            All submitted community threat reports have been reviewed and verified.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingReports.map((report) => (
              <div
                key={report.id}
                className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[var(--text-primary)] font-heading">
                      {report.title}
                    </span>
                    <Badge severity={report.riskSeverity} />
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] font-mono leading-relaxed">
                    "{report.sanitizedSnippet}"
                  </p>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono block">
                    ID: {report.id} • Reason: {report.reportingReason || 'Citizen report'}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleReview(report.id, 'reject')}
                    icon={<XCircle className="w-3.5 h-3.5 text-[var(--status-danger)]" />}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleReview(report.id, 'approve')}
                    icon={<CheckCircle2 className="w-3.5 h-3.5 text-[var(--accent-fg)]" />}
                  >
                    Approve & Verify
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Immutable Audit Logs Table */}
      <div className="bg-[var(--surface-primary)] border border-[var(--border-color)] rounded-xl p-6 shadow-xs">
        <div className="mb-4">
          <h2 className="text-base font-bold font-heading text-[var(--text-primary)] flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[var(--accent-primary)]" />
            Immutable Security Audit Trail
          </h2>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            System tamper-evident log capturing authentication, scans, submissions, and moderation actions.
          </p>
        </div>

        <div className="overflow-x-auto border border-[var(--border-color)] rounded-lg">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[var(--surface-elevated)] text-[var(--text-secondary)] uppercase border-b border-[var(--border-color)] text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Actor ID</th>
                <th className="py-2.5 px-3">IP Hash</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-color)]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[var(--surface-elevated)] transition-colors">
                  <td className="py-2.5 px-3 text-[var(--text-secondary)] whitespace-nowrap text-[11px]">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2.5 px-3 text-[var(--accent-primary)] font-semibold text-[11px]">
                    {log.action}
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-primary)] text-[11px] truncate max-w-[150px]">
                    {log.actorId || 'system'}
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-muted)] text-[11px]">
                    {log.clientIpHash}
                  </td>
                  <td className="py-2.5 px-3 text-[var(--text-secondary)] text-[11px] truncate max-w-[250px]">
                    {JSON.stringify(log.details)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
