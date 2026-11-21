import React, { useState } from 'react';
import { useAuth } from '../context/useAuth';
import { useTheme } from '../context/useTheme';
import {
  ShieldCheck,
  BookOpen,
  UserCheck,
  Users,
  Network,
  PhoneCall,
  SlidersHorizontal,
  Sun,
  Moon,
  Monitor,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

export type ActiveTab =
  | 'scanner'
  | 'encyclopedia'
  | 'dashboard'
  | 'community'
  | 'campaigns'
  | 'incident'
  | 'admin';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Define nav items - Admin is strictly restricted to user.role === 'admin'
  const baseNavItems: Array<{ id: ActiveTab; label: string; icon: any; adminOnly?: boolean }> = [
    { id: 'scanner', label: 'Universal Scanner', icon: ShieldCheck },
    { id: 'encyclopedia', label: 'Scam Encyclopedia', icon: BookOpen },
    { id: 'dashboard', label: 'Personal Dashboard', icon: UserCheck },
    { id: 'community', label: 'Community Intel', icon: Users },
    { id: 'campaigns', label: 'Scam Campaigns', icon: Network },
    { id: 'incident', label: 'Incident 1930', icon: PhoneCall },
    { id: 'admin', label: 'Admin Moderation', icon: SlidersHorizontal, adminOnly: true },
  ];

  const visibleNavItems = baseNavItems.filter((item) => {
    if (item.adminOnly) {
      return user?.role === 'admin';
    }
    return true;
  });

  return (
    <header className="sticky top-0 z-40 w-full bg-[var(--surface-primary)] border-b border-[var(--border-color)] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div
          onClick={() => onTabChange('scanner')}
          className="flex items-center gap-2.5 cursor-pointer group select-none shrink-0"
        >
          <div className="w-9 h-9 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent-primary)] group-hover:border-[var(--accent-primary)] transition-colors">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-bold text-base text-[var(--text-primary)] tracking-tight">
                ScamShield
              </span>
              <span className="px-1.5 py-0.2 bg-[var(--accent-subtle)] text-[var(--accent-primary)] text-[9px] font-mono font-medium rounded border border-[var(--border-color)] uppercase">
                v1.0 Pro
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-secondary)] -mt-0.5 hidden sm:block">
              Cyber Threat Defense Gateway
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1 bg-[var(--surface-elevated)] p-1 rounded-xl border border-[var(--border-color)]">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[var(--accent-primary)] text-[var(--accent-fg)] font-semibold shadow-xs'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-primary)]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Section: Theme Toggle + User Profile & Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Theme Switcher */}
          <div className="flex items-center gap-0.5 bg-[var(--surface-elevated)] border border-[var(--border-color)] p-1 rounded-lg">
            <button
              onClick={() => setTheme('dark')}
              title="Dark Mode"
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                theme === 'dark'
                  ? 'bg-[var(--surface-primary)] text-[var(--accent-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('light')}
              title="Light Mode"
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                theme === 'light'
                  ? 'bg-[var(--surface-primary)] text-[var(--accent-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTheme('system')}
              title="System Theme"
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                theme === 'system'
                  ? 'bg-[var(--surface-primary)] text-[var(--accent-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* User Profile Pill */}
          {isAuthenticated && user && (
            <div className="flex items-center gap-1.5">
              <div
                onClick={() => onTabChange('dashboard')}
                className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] cursor-pointer hover:border-[var(--accent-primary)] transition-colors"
              >
                <div className="w-6 h-6 rounded-md bg-[var(--accent-primary)] text-[var(--accent-fg)] flex items-center justify-center font-bold text-xs uppercase font-mono">
                  {user.displayName.charAt(0)}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-medium text-[var(--text-primary)] leading-tight flex items-center gap-1.5">
                    <span>{user.displayName}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold uppercase ${
                        user.role === 'admin'
                          ? 'bg-[var(--status-warning-bg)] text-[var(--status-warning)] border border-[var(--status-warning)]'
                          : user.role === 'security_analyst'
                          ? 'bg-[var(--status-info-bg)] text-[var(--status-info)] border border-[var(--status-info)]'
                          : 'bg-[var(--accent-subtle)] text-[var(--accent-primary)] border border-[var(--border-color)]'
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                title="Disconnect & Sign Out"
                className="p-1.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface-elevated)] text-[var(--text-muted)] hover:text-[var(--status-danger)] hover:border-[var(--status-danger)] transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] text-[var(--text-primary)]"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[var(--border-color)] bg-[var(--surface-primary)] px-4 py-3 space-y-1">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[var(--accent-primary)] text-[var(--accent-fg)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
