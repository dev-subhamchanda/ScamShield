import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import type { ActiveTab } from './components/Navbar';
import { ThreatScanner } from './components/Scanner/ThreatScanner';
import { ScamEncyclopedia } from './components/Encyclopedia/ScamEncyclopedia';
import { SecurityDashboard } from './components/Dashboard/SecurityDashboard';
import { CommunityIntel } from './components/Community/CommunityIntel';
import { CampaignClusters } from './components/Campaigns/CampaignClusters';
import { IncidentResponse } from './components/Incident/IncidentResponse';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { AuthModal } from './components/Auth/AuthModal';
import type { AnalysisResult } from './types';
import {
  FontAwesomeIcon,
  faShieldHalved,
  faLock,
} from './components/UI/Icons';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('scanner');
  const [incidentContextThreat, setIncidentContextThreat] = useState<AnalysisResult | null>(null);
  const [scannerExternalPrompt, setScannerExternalPrompt] = useState<{
    prompt: string;
    type: 'text' | 'url';
  } | null>(null);

  const handleStartIncidentFromScan = (result: AnalysisResult) => {
    setIncidentContextThreat(result);
    setActiveTab('incident');
  };

  const handleLoadSampleFromEncyclopedia = (prompt: string, type: 'text' | 'url') => {
    setScannerExternalPrompt({ prompt, type });
    setActiveTab('scanner');
  };

  return (
    <div className="min-h-screen bg-[#090B10] text-[#F1F5F9] flex flex-col font-sans selection:bg-[#6366F1]/30 selection:text-[#818CF8]">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Viewport */}
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

        {activeTab === 'admin' && <AdminDashboard />}
      </main>

      {/* Global Auth Modal */}
      <AuthModal />

      {/* Footer */}
      <footer className="w-full bg-[#11151E] border-t border-[#30394B] py-6 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#94A3B8]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#1B2230] border border-[#30394B] flex items-center justify-center text-[#818CF8]">
              <FontAwesomeIcon icon={faShieldHalved} className="text-xs" />
            </div>
            <span className="font-display font-semibold text-[#F1F5F9]">ScamShield Defense</span>
            <span>• Cross-Platform Cyber Fraud Prevention Platform</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-[#22C55E]">
              <FontAwesomeIcon icon={faLock} />
              Zero-Execution Sandbox Active
            </span>
            <span className="hidden md:inline text-[#30394B]">|</span>
            <span className="text-[#94A3B8]">Cloudflare Pages & Edge Proxy Ready</span>
            <span className="hidden md:inline text-[#30394B]">|</span>
            <span className="text-[#818CF8]">Gemini AI Scam Detective</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
