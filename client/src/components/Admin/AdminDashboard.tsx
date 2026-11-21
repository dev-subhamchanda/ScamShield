import React, { useEffect, useState } from 'react';
import type { AuditLogEntry, CommunityThreatReport } from '../../types';
import { Badge } from '../UI/Badge';
import { Button } from '../UI/Button';
import {
  FontAwesomeIcon,
  faSliders,
  faCircleCheck,
  faBan,
  faTerminal,
} from '../UI/Icons';

export const AdminDashboard: React.FC = () => {
  const [reports, setReports] = useState<CommunityThreatReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [repRes, logRes] = await Promise.all([
        fetch('/api/v1/admin/moderation'),
        fetch('/api/v1/admin/audit-logs'),
      ]);
      const repData = await repRes.json();
      const logData = await logRes.json();

      if (repData.success) setReports(repData.reports);
      if (logData.success) setAuditLogs(logData.auditLogs);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (reportId: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch('/api/v1/admin/moderation/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, action }),
      });
      const data = await res.json();
      if (data.success) {
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
      <div className="bg-[#11151E] border border-[#30394B] rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold font-display text-[#F1F5F9] flex items-center gap-2.5">
              <FontAwesomeIcon icon={faSliders} className="text-[#818CF8]" />
              Administrative Security & Moderation Console
            </h2>
            <p className="text-xs text-[#94A3B8] mt-1">
              Deterministic engine parameters, pending crowdsourced threat moderation, and immutable audit logs.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchAdminData} isLoading={loading}>
            Refresh Telemetry
          </Button>
        </div>

        {/* Engine Safeguards Status Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#30394B] text-xs font-mono">
          <div className="p-3 rounded-xl bg-[#090B10] border border-[#30394B]">
            <span className="text-[#94A3B8] text-[10px] block">MIME Magic Engine</span>
            <span className="text-[#22C55E] font-bold flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" /> ACTIVE (Zero-Exec)
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#090B10] border border-[#30394B]">
            <span className="text-[#94A3B8] text-[10px] block">SSRF Guardrail</span>
            <span className="text-[#22C55E] font-bold flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" /> RFC1918 Blocked
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#090B10] border border-[#30394B]">
            <span className="text-[#94A3B8] text-[10px] block">Zip Bomb Safeguard</span>
            <span className="text-[#22C55E] font-bold flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" /> 10:1 Ratio Ceiling
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#090B10] border border-[#30394B]">
            <span className="text-[#94A3B8] text-[10px] block">Gemini AI Explainer</span>
            <span className="text-[#818CF8] font-bold flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#818CF8]" /> Structured JSON
            </span>
          </div>
        </div>
      </div>

      {/* Moderation Queue */}
      <div className="bg-[#11151E] border border-[#30394B] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold font-display text-[#F1F5F9] flex items-center gap-2">
            <span>Pending Community Reports Queue</span>
            <span className="px-2 py-0.5 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] text-xs font-mono">
              {pendingReports.length} Pending
            </span>
          </h3>
        </div>

        {pendingReports.length === 0 ? (
          <p className="text-xs text-[#22C55E] py-4 font-mono">
            All submitted community reports have been verified or resolved.
          </p>
        ) : (
          <div className="space-y-3">
            {pendingReports.map((report) => (
              <div
                key={report.id}
                className="p-4 rounded-xl bg-[#1B2230]/40 border border-[#30394B] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#F1F5F9]">{report.title}</span>
                    <Badge severity={report.riskSeverity} />
                  </div>
                  <p className="text-xs font-mono text-[#94A3B8]">"{report.sanitizedSnippet}"</p>
                  <p className="text-[11px] text-[#818CF8]">Reason: {report.reportingReason}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<FontAwesomeIcon icon={faCircleCheck} />}
                    onClick={() => handleReview(report.id, 'approve')}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    icon={<FontAwesomeIcon icon={faBan} />}
                    onClick={() => handleReview(report.id, 'reject')}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* System Audit Logs */}
      <div className="bg-[#11151E] border border-[#30394B] rounded-2xl p-6 space-y-4">
        <h3 className="text-base font-bold font-display text-[#F1F5F9] flex items-center gap-2 font-mono">
          <FontAwesomeIcon icon={faTerminal} className="text-[#818CF8]" />
          Immutable Security Audit Trail (Recent 50 Events)
        </h3>
        <p className="text-xs text-[#94A3B8]">
          Logs API requests, client IP hashes, scan vectors, and moderation actions with tamper-proof timestamps.
        </p>

        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#1B2230]/60 text-[#94A3B8] sticky top-0 border-b border-[#30394B]">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Actor</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">IP Hash</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30394B]/40">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#1B2230]/20">
                  <td className="py-2 px-3 text-[#94A3B8] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-2 px-3 text-[#818CF8]">{log.actorId}</td>
                  <td className="py-2 px-3 text-[#F1F5F9]">{log.action}</td>
                  <td className="py-2 px-3 text-[#94A3B8]">{log.clientIpHash}</td>
                  <td className="py-2 px-3 text-[#94A3B8] truncate max-w-[250px]">
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
