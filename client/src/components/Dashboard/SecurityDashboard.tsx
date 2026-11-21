import React, { useEffect, useState } from 'react';
import type { AnalysisResult } from '../../types';
import { Badge } from '../UI/Badge';
import { Button } from '../UI/Button';
import { Modal } from '../UI/Modal';
import { ThreatResultCard } from '../Scanner/ThreatResultCard';
import {
  FontAwesomeIcon,
  faUserShield,
  faShieldHalved,
  faTriangleExclamation,
  faEye,
} from '../UI/Icons';

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
  const criticalThreats = history.filter((h) => h.riskSeverity === 'CRITICAL' || h.riskSeverity === 'HIGH').length;
  const safeScans = history.filter((h) => h.riskSeverity === 'SAFE').length;

  return (
    <div className="space-y-6">
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#11151E] border border-[#30394B] rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#6366F1]/20 border border-[#818CF8]/30 flex items-center justify-center text-[#818CF8] text-xl">
            <FontAwesomeIcon icon={faShieldHalved} />
          </div>
          <div>
            <span className="text-xs text-[#94A3B8] font-mono block">Personal Scans Audited</span>
            <span className="text-2xl font-bold font-display text-[#F1F5F9]">{totalScans}</span>
          </div>
        </div>

        <div className="bg-[#11151E] border border-[#30394B] rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#EF4444]/20 border border-[#EF4444]/40 flex items-center justify-center text-[#EF4444] text-xl">
            <FontAwesomeIcon icon={faTriangleExclamation} />
          </div>
          <div>
            <span className="text-xs text-[#94A3B8] font-mono block">Threats Neutralized</span>
            <span className="text-2xl font-bold font-display text-[#EF4444]">{criticalThreats}</span>
          </div>
        </div>

        <div className="bg-[#11151E] border border-[#30394B] rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#22C55E]/20 border border-[#22C55E]/40 flex items-center justify-center text-[#22C55E] text-xl">
            <FontAwesomeIcon icon={faUserShield} />
          </div>
          <div>
            <span className="text-xs text-[#94A3B8] font-mono block">Clean Assets Verified</span>
            <span className="text-2xl font-bold font-display text-[#22C55E]">{safeScans}</span>
          </div>
        </div>
      </div>

      {/* Audit History Table */}
      <div className="bg-[#11151E] border border-[#30394B] rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold font-display text-[#F1F5F9]">
              Personal Security Audit Trail
            </h3>
            <p className="text-xs text-[#94A3B8]">
              Chronological log of analyzed communications, documents, and links with deterministic scores.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={fetchHistory}>
            Refresh Log
          </Button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-[#94A3B8] font-mono">
            Loading audit records...
          </div>
        ) : history.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#94A3B8]">
            <p className="text-sm text-[#F1F5F9] font-medium mb-1">No Scans Recorded Yet</p>
            <p>Use the Universal Scanner to analyze suspicious messages, files, or links.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#1B2230]/40 text-[#94A3B8] uppercase border-b border-[#30394B]">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Target Name</th>
                  <th className="py-3 px-4">Threat Category</th>
                  <th className="py-3 px-4">Risk Severity</th>
                  <th className="py-3 px-4">Deterministic Score</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#30394B]/50">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-[#1B2230]/20 transition-colors">
                    <td className="py-3 px-4 text-[#94A3B8] whitespace-nowrap">
                      {new Date(record.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-[#818CF8] uppercase">{record.scanType}</td>
                    <td className="py-3 px-4 text-[#F1F5F9] max-w-[200px] truncate font-medium">
                      {record.targetName}
                    </td>
                    <td className="py-3 px-4 text-[#94A3B8]">{record.threatCategory}</td>
                    <td className="py-3 px-4">
                      <Badge severity={record.riskSeverity} />
                    </td>
                    <td className="py-3 px-4 text-[#F1F5F9]">
                      {record.deterministicScore} / 100
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<FontAwesomeIcon icon={faEye} />}
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
