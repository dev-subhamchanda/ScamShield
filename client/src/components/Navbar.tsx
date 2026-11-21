import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FontAwesomeIcon,
  faShieldHalved,
  faUserShield,
  faUsersViewfinder,
  faSitemap,
  faPhoneVolume,
  faSliders,
  faBookOpen,
  faRightFromBracket,
  faRightToBracket,
} from './UI/Icons';

export type ActiveTab =
  | 'scanner'
  | 'dashboard'
  | 'community'
  | 'campaigns'
  | 'incident'
  | 'admin'
  | 'encyclopedia';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();

  const navItems: Array<{ id: ActiveTab; label: string; icon: any }> = [
    { id: 'scanner', label: 'Universal Scanner', icon: faShieldHalved },
    { id: 'encyclopedia', label: 'Scam Encyclopedia', icon: faBookOpen },
    { id: 'dashboard', label: 'Personal Dashboard', icon: faUserShield },
    { id: 'community', label: 'Community Intel', icon: faUsersViewfinder },
    { id: 'campaigns', label: 'Scam Campaigns', icon: faSitemap },
    { id: 'incident', label: 'Incident 1930', icon: faPhoneVolume },
    { id: 'admin', label: 'Admin Moderation', icon: faSliders },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#090B10]/90 backdrop-blur-md border-b border-[#30394B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div
          onClick={() => onTabChange('scanner')}
          className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
        >
          <div className="w-9 h-9 rounded-xl bg-[#11151E] border border-[#30394B] flex items-center justify-center text-[#818CF8] group-hover:border-[#818CF8]/50 transition-colors">
            <FontAwesomeIcon icon={faShieldHalved} className="text-lg" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display font-bold text-base text-[#F1F5F9] tracking-tight">
                ScamShield
              </span>
              <span className="px-1.5 py-0.2 bg-[#6366F1]/20 text-[#818CF8] text-[9px] font-mono font-medium rounded border border-[#818CF8]/30 uppercase">
                v1.0 Pro
              </span>
            </div>
            <p className="text-[10px] text-[#94A3B8] -mt-0.5 hidden sm:block">
              Deterministic Security + AI Defense
            </p>
          </div>
        </div>

        {/* Center Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#11151E] p-1 rounded-xl border border-[#30394B]">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#6366F1] text-[#F1F5F9] shadow-sm shadow-[#6366F1]/30 font-semibold'
                    : 'text-[#94A3B8] hover:text-[#F1F5F9] hover:bg-[#1B2230]'
                }`}
              >
                <FontAwesomeIcon icon={item.icon} className="text-xs" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Status Indicator & Auth Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-2">
              <div
                onClick={() => onTabChange('dashboard')}
                className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#11151E] border border-[#30394B] cursor-pointer hover:border-[#818CF8]/50 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-[#6366F1] text-[#F1F5F9] flex items-center justify-center font-bold text-xs uppercase font-mono">
                  {user.displayName.charAt(0)}
                </div>
                <div className="text-left hidden sm:block">
                  <span className="text-xs font-semibold text-[#F1F5F9] block leading-tight truncate max-w-[100px]">
                    {user.displayName}
                  </span>
                  <span className="text-[9px] font-mono text-[#22C55E] block leading-none">
                    Score: {user.trustScore}
                  </span>
                </div>
              </div>
              <button
                onClick={logout}
                title="Sign Out"
                className="p-1.5 rounded-lg bg-[#11151E] hover:bg-[#1B2230] border border-[#30394B] text-[#94A3B8] hover:text-[#EF4444] transition-colors text-xs"
              >
                <FontAwesomeIcon icon={faRightFromBracket} />
              </button>
            </div>
          ) : (
            <button
              onClick={openAuthModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#6366F1] hover:bg-[#4F46E5] text-[#F1F5F9] shadow-sm transition-all"
            >
              <FontAwesomeIcon icon={faRightToBracket} />
              <span>Sign In / Demo</span>
            </button>
          )}

          <button
            onClick={() => onTabChange('incident')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/40 hover:bg-[#EF4444]/25 transition-colors"
          >
            <FontAwesomeIcon icon={faPhoneVolume} />
            <span className="hidden sm:inline">Emergency 1930</span>
            <span className="sm:hidden">1930</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="lg:hidden flex overflow-x-auto px-4 py-2 border-t border-[#30394B] gap-2 bg-[#11151E]">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-[#6366F1] text-[#F1F5F9] font-medium'
                  : 'text-[#94A3B8] hover:text-[#F1F5F9]'
              }`}
            >
              <FontAwesomeIcon icon={item.icon} className="text-xs" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
