import React, { useEffect, useState } from 'react';
import type { AnalysisResult } from '../../types';
import { Badge } from '../UI/Badge';
import { Button } from '../UI/Button';
import { Modal } from '../UI/Modal';
import { ThreatResultCard } from '../Scanner/ThreatResultCard';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Eye,
  RefreshCw,
} from 'lucide-react';

interface SecurityDashboardProps {
  onStartIncident: (result: AnalysisResult) => void;
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({ onStartIncident }) => {
  const [history, setHistory] = useState<AnalysisResult[]>([]);
  const [selectedScan, setSelectedScan] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/v1/scan/history');
      const data = await res.json();
      if (data.success && data.history) {
        setHistory(data.history);
      }
    } catch {
      // Keep empty if fetch fails
    } finally {
      setLoading(false);
    }
  };

  const totalScans = history.length;
  const criticalThreats = history.filter(
    (h) => h.riskSeverity === 'CRITICAL' || h.riskSeverity === 'HIGH'
  ).length;
  const safeScans = history.filter((h) => h.riskSeverity === 'SAFE').length;

  return (
    <div className="space-y-6">
      {/* Precision Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[var(--surface-primary)] border border-[var(--border-color)] rounded-xl p-5 flex items-center gap-4 shadow-xs">
          <div className="w-11 h-11 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent-primary)] text-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-[var(--text-secondary)] font-mono uppercase block">
              Personal Scans Audited
            </span>
            <span className="text-2xl font-bold font-heading text-[var(--text-primary)]">
              {totalScans}
            </span>
          </div>
        </div>

        <div className="bg-[var(--surface-primary)] border border-[var(--border-color)] rounded-xl p-5 flex items-center gap-4 shadow-xs">
          <div className="w-11 h-11 rounded-lg bg-[var(--status-danger-bg)] border border-[var(--status-danger)] flex items-center justify-center text-[var(--status-danger)] text-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-[var(--text-secondary)] font-mono uppercase block">
              Threats Neutralized
            </span>
            <span className="text-2xl font-bold font-heading text-[var(--status-danger)]">
              {criticalThreats}
            </span>
          </div>
        </div>

        <div className="bg-[var(--surface-primary)] border border-[var(--border-color)] rounded-xl p-5 flex items-center gap-4 shadow-xs">
          <div className="w-11 h-11 rounded-lg bg-[var(--status-success-bg)] border border-[var(--status-success)] flex items-center justify-center text-[var(--status-success)] text-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] text-[var(--text-secondary)] font-mono uppercase block">
              Clean Assets Verified
            </span>
            <span className="text-2xl font-bold font-heading text-[var(--status-success)]">
              {safeScans}
            </span>
          </div>
        </div>
      </div>

      {/* Audit History Table */}
      <div className="bg-[var(--surface-primary)] border border-[var(--border-color)] rounded-xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold font-heading text-[var(--text-primary)]">
              Personal Security Audit Trail
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Immutable record of analyzed messages, documents, and URLs with deterministic telemetry.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={fetchHistory}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Log
          </Button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-[var(--text-muted)] font-mono">
            Loading audit records...
          </div>
        ) : history.length === 0 ? (
          <div className="py-12 text-center text-xs text-[var(--text-secondary)]">
            <p className="text-sm text-[var(--text-primary)] font-medium mb-1">No Scans Recorded Yet</p>
            <p className="text-xs text-[var(--text-muted)]">
              Submit a sample in the Universal Threat Scanner to view your security log.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-[var(--border-color)] rounded-lg">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[var(--surface-elevated)] text-[var(--text-secondary)] uppercase border-b border-[var(--border-color)] text-[10px]">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Target Name</th>
                  <th className="py-2.5 px-3">Threat Category</th>
                  <th className="py-2.5 px-3">Risk Severity</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-[var(--surface-elevated)] transition-colors">
                    <td className="py-2.5 px-3 text-[var(--text-secondary)] whitespace-nowrap text-[11px]">
                      {new Date(record.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-3 text-[var(--accent-primary)] uppercase text-[10px]">
                      {record.scanType}
                    </td>
                    <td className="py-2.5 px-3 text-[var(--text-primary)] max-w-[200px] truncate font-medium">
                      {record.targetName}
                    </td>
                    <td className="py-2.5 px-3 text-[var(--text-secondary)] text-[11px]">
                      {record.threatCategory}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge severity={record.riskSeverity} />
                    </td>
                    <td className="py-2.5 px-3 text-[var(--text-primary)] font-bold">
                      {record.deterministicScore} / 100
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<Eye className="w-3 h-3" />}
                        onClick={() => setSelectedScan(record)}
                      >
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedScan && (
        <Modal
          isOpen={!!selectedScan}
          onClose={() => setSelectedScan(null)}
          title="Threat Audit Detail"
          subtitle={`Audit ID: ${selectedScan.id}`}
          maxWidth="max-w-4xl"
        >
          <ThreatResultCard
            result={selectedScan}
            onStartIncident={onStartIncident}
            onReset={() => setSelectedScan(null)}
          />
        </Modal>
      )}
    </div>
  );
};
