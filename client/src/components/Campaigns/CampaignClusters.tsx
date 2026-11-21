import React, { useEffect, useState } from 'react';
import type { ScamCampaign } from '../../types';
import { Badge } from '../UI/Badge';
import {
  FontAwesomeIcon,
  faSitemap,
} from '../UI/Icons';

export const CampaignClusters: React.FC = () => {
  const [campaigns, setCampaigns] = useState<ScamCampaign[]>([]);
  const [stats, setStats] = useState<{
    totalThreatsScanned: number;
    activeThreatsBlocked: number;
    activeCampaignsTracked: number;
  }>({ totalThreatsScanned: 15420, activeThreatsBlocked: 8930, activeCampaignsTracked: 5 });

  useEffect(() => {
    fetchCampaigns();
    fetchStats();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/v1/intelligence/campaigns');
      const data = await res.json();
      if (data.success && data.campaigns) {
        setCampaigns(data.campaigns);
      }
    } catch {
      // Keep empty if fetch fails
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/v1/intelligence/stats');
      const data = await res.json();
      if (data.success && data.stats) {
        setStats(data.stats);
      }
    } catch {
      // Keep fallback
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner with Platform Stats */}
      <div className="bg-[#11151E] border border-[#30394B] rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-bold font-display text-[#F1F5F9] flex items-center gap-2.5">
              <FontAwesomeIcon icon={faSitemap} className="text-[#818CF8]" />
              Active Scam Campaign Clusters
            </h2>
            <p className="text-xs text-[#94A3B8] mt-1">
              Automated pattern clustering identifying syndicated fraud rings across domain clusters and payment VPAs.
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#6366F1]/15 text-[#818CF8] text-xs font-mono border border-[#818CF8]/30">
            {stats.activeCampaignsTracked} Syndicates Monitored
          </span>
        </div>

        {/* Global Statistics Counter */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-[#30394B]">
          <div className="p-3 rounded-xl bg-[#090B10] border border-[#30394B]">
            <span className="text-[11px] text-[#94A3B8] block font-mono">Platform Scans Analyzed</span>
            <span className="text-xl font-bold font-display text-[#F1F5F9]">
              {stats.totalThreatsScanned.toLocaleString()}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-[#090B10] border border-[#30394B]">
            <span className="text-[11px] text-[#94A3B8] block font-mono">Fraudulent Attempts Blocked</span>
            <span className="text-xl font-bold font-display text-[#EF4444]">
              {stats.activeThreatsBlocked.toLocaleString()}
            </span>
          </div>
          <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-[#090B10] border border-[#30394B]">
            <span className="text-[11px] text-[#94A3B8] block font-mono">Real-Time Threat Sync</span>
            <span className="text-xl font-bold font-display text-[#22C55E]">Sub-second</span>
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campaigns.map((camp) => (
          <div
            key={camp.id}
            className="bg-[#11151E] border border-[#30394B] rounded-2xl p-6 space-y-4 hover:border-[#818CF8]/40 transition-colors flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold font-display text-[#F1F5F9]">
                    {camp.campaignName}
                  </h3>
                  <span className="text-[11px] font-mono text-[#818CF8]">{camp.id}</span>
                </div>
                <Badge
                  variant={camp.activeStatus === 'active' ? 'danger' : 'neutral'}
                  label={camp.activeStatus.toUpperCase()}
                />
              </div>

              <p className="text-xs text-[#94A3B8] leading-relaxed">{camp.description}</p>

              <div>
                <span className="text-[10px] text-[#94A3B8] uppercase tracking-wider block font-mono mb-1.5">
                  Tracked Indicators of Compromise (IoCs)
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {camp.indicators.map((ioc, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-md bg-[#090B10] text-[#818CF8] text-[10px] font-mono border border-[#30394B]"
                    >
                      {ioc}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#30394B] flex items-center justify-between text-xs text-[#94A3B8] font-mono">
              <span>
                Victims: <strong className="text-[#EF4444]">{camp.victimCountEstimate.toLocaleString()}</strong>
              </span>
              <span>
                First Seen: {new Date(camp.firstSeen).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
