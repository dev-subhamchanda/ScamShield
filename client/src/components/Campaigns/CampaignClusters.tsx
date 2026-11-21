import React, { useEffect, useState, useCallback } from 'react';
import type { ScamCampaign } from '../../types';
import { api } from '../../services/api';
import { Network } from 'lucide-react';

export const CampaignClusters: React.FC = () => {
  const [campaigns, setCampaigns] = useState<ScamCampaign[]>([]);
  const [stats, setStats] = useState<{
    totalThreatsScanned: number;
    activeThreatsBlocked: number;
    activeCampaignsTracked: number;
  }>({ totalThreatsScanned: 15420, activeThreatsBlocked: 8930, activeCampaignsTracked: 5 });

  const fetchCampaigns = useCallback(async () => {
    try {
      const data = await api.campaigns.getAll();
      if (data.campaigns) {
        setCampaigns(data.campaigns);
      }
    } catch {
      // Keep empty if fetch fails
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await api.campaigns.getStats();
      if (data.stats) {
        setStats(data.stats);
      }
    } catch {
      // Keep fallback
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
    fetchStats();
  }, [fetchCampaigns, fetchStats]);

  return (
    <div className="space-y-6">
      {/* Top Banner with Platform Telemetry */}
      <div className="bg-[var(--surface-primary)] border border-[var(--border-color)] rounded-xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md text-[11px] font-mono border border-[var(--border-color)] bg-[var(--surface-elevated)] text-[var(--accent-primary)] mb-2">
              <Network className="w-3.5 h-3.5" />
              <span>Syndicate Cluster Correlation Engine</span>
            </div>
            <h1 className="text-2xl font-bold font-heading text-[var(--text-primary)] tracking-tight">
              Active Fraud Campaign Clusters
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              Automated cluster correlation tracking multi-channel fraud rings across domain registrations, messaging templates, and payment nodes.
            </p>
          </div>
          <span className="px-3 py-1 rounded-md bg-[var(--surface-elevated)] text-[var(--accent-primary)] text-xs font-mono border border-[var(--border-color)]">
            {stats.activeCampaignsTracked} Syndicates Monitored
          </span>
        </div>

        {/* Global Statistics Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-[var(--border-color)]">
          <div className="p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)]">
            <span className="text-[10px] text-[var(--text-secondary)] block font-mono uppercase">
              Platform Samples Audited
            </span>
            <span className="text-xl font-bold font-heading text-[var(--text-primary)]">
              {stats.totalThreatsScanned.toLocaleString()}
            </span>
          </div>
          <div className="p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)]">
            <span className="text-[10px] text-[var(--text-secondary)] block font-mono uppercase">
              Fraud Attempts Blocked
            </span>
            <span className="text-xl font-bold font-heading text-[var(--status-danger)]">
              {stats.activeThreatsBlocked.toLocaleString()}
            </span>
          </div>
          <div className="col-span-2 sm:col-span-1 p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)]">
            <span className="text-[10px] text-[var(--text-secondary)] block font-mono uppercase">
              Real-Time Threat Sync
            </span>
            <span className="text-xl font-bold font-heading text-[var(--status-success)]">
              Sub-second
            </span>
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campaigns.map((camp) => (
          <div
            key={camp.id}
            className="bg-[var(--surface-primary)] border border-[var(--border-color)] rounded-xl p-5 space-y-4 hover:border-[var(--accent-primary)] transition-colors shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-base font-bold font-heading text-[var(--text-primary)]">
                    {camp.campaignName}
                  </h2>
                  <span className="text-[10px] font-mono text-[var(--accent-primary)]">{camp.id}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase border ${
                    camp.activeStatus === 'active'
                      ? 'bg-[var(--status-danger-bg)] text-[var(--status-danger)] border-[var(--status-danger)]'
                      : 'bg-[var(--surface-elevated)] text-[var(--text-secondary)] border-[var(--border-color)]'
                  }`}
                >
                  {camp.activeStatus}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] space-y-1">
                <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase block">
                  Identified TTPs & Indicators:
                </span>
                <p className="text-xs text-[var(--text-secondary)] font-mono leading-relaxed">
                  {camp.indicators.slice(0, 3).join(' • ')}
                </p>
              </div>

              {camp.description && (
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase block">
                    Campaign Scope:
                  </span>
                  <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                    {camp.description}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[var(--border-color)] flex items-center justify-between text-xs font-mono">
              <span className="text-[11px] text-[var(--text-secondary)]">
                Estimated Victims: <strong className="text-[var(--text-primary)]">{camp.victimCountEstimate.toLocaleString()}</strong>
              </span>
              <span className="text-[10px] text-[var(--text-muted)]">
                First Seen: {new Date(camp.firstSeen).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
