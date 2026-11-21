import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import type { ActiveTab } from './components/Navbar';
import { ThreatScanner } from './components/Scanner/ThreatScanner';
import { ScamEncyclopedia } from './components/Encyclopedia/ScamEncyclopedia';
import { SecurityDashboard } from './components/Dashboard/SecurityDashboard';
import { CommunityIntel } from './components/Community/CommunityIntel';
import { CampaignClusters } from './components/Campaigns/CampaignClusters';
import { IncidentResponse } from './components/Incident/IncidentResponse';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { AuthPortal } from './components/Auth/AuthPortal';
import type { AnalysisResult } from './types';
import { ShieldCheck, Lock, Cpu, Globe } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('scanner');
  const [incidentContextThreat, setIncidentContextThreat] = useState<AnalysisResult | null>(null);
  const [scannerExternalPrompt, setScannerExternalPrompt] = useState<{
    prompt: string;
    type: 'text' | 'url';
  } | null>(null);

  // Enforce admin isolation: If user is not admin, they cannot view 'admin' tab
  useEffect(() => {
    if (activeTab === 'admin' && user?.role !== 'admin') {
      setActiveTab('scanner');
    }
  }, [activeTab, user]);

  const handleStartIncidentFromScan = (result: AnalysisResult) => {
    setIncidentContextThreat(result);
    setActiveTab('incident');
  };

  const handleLoadSampleFromEncyclopedia = (prompt: string, type: 'text' | 'url') => {
    setScannerExternalPrompt({ prompt, type });
    setActiveTab('scanner');
  };

  // 1. Loading state while checking persistent session
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 rounded-xl bg-[var(--surface-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent-primary)] mb-3 animate-pulse">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <p className="text-xs font-mono text-[var(--text-secondary)]">Initializing ScamShield Security Subsystem...</p>
      </div>
    );
  }

  // 2. Mandatory Authentication Gate: Unauthenticated users MUST log in to access the system
  if (!isAuthenticated || !user) {
    return <AuthPortal />;
  }

  // 3. Authenticated Application Workspace
  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col font-sans selection:bg-[var(--accent-subtle)] selection:text-[var(--accent-primary)] transition-colors">
      {/* Top Precision Navbar */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'scanner' && (
          <ThreatScanner
            onStartIncident={handleStartIncidentFromScan}
            onOpenEncyclopedia={() => setActiveTab('encyclopedia')}
            externalPrompt={scannerExternalPrompt}
          />
        )}

        {activeTab === 'encyclopedia' && (
          <ScamEncyclopedia onTestPrompt={handleLoadSampleFromEncyclopedia} />
        )}

        {activeTab === 'dashboard' && (
          <SecurityDashboard onStartIncident={handleStartIncidentFromScan} />
        )}

        {activeTab === 'community' && <CommunityIntel />}

        {activeTab === 'campaigns' && <CampaignClusters />}

        {activeTab === 'incident' && (
          <IncidentResponse initialThreat={incidentContextThreat} />
        )}

        {/* Admin Dashboard: Strictly guarded for Admin users */}
        {activeTab === 'admin' && user.role === 'admin' && <AdminDashboard />}
      </main>

      {/* Cyber Security Precision Footer */}
      <footer className="w-full bg-[var(--surface-primary)] border-t border-[var(--border-color)] py-6 px-4 sm:px-6 lg:px-8 mt-12 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[var(--surface-elevated)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent-primary)]">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            <span className="font-heading font-semibold text-[var(--text-primary)]">ScamShield Cyber Defense</span>
            <span>• Cross-Platform Fraud Prevention System</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-[var(--status-success)]">
              <Lock className="w-3 h-3" />
              Zero-Execution Sandbox Active
            </span>
            <span className="hidden md:inline text-[var(--border-color)]">|</span>
            <span className="text-[var(--text-muted)] flex items-center gap-1.5">
              <Globe className="w-3 h-3" />
              Cloudflare Edge & SSRF Blocker
            </span>
            <span className="hidden md:inline text-[var(--border-color)]">|</span>
            <span className="text-[var(--accent-primary)] flex items-center gap-1.5">
              <Cpu className="w-3 h-3" />
              Gemini 3 Flash Detective
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
