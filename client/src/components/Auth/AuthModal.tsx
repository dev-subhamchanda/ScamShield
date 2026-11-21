import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../UI/Modal';
import { Button } from '../UI/Button';
import {
  FontAwesomeIcon,
  faUserShield,
  faShieldHalved,
  faTriangleExclamation,
  faSliders,
} from '../UI/Icons';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, login, signup, quickDemoLogin } = useAuth();
  const [tab, setTab] = useState<'demo' | 'login' | 'signup'>('demo');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);
    try {
      await signup(email, password, displayName);
    } catch (err: any) {
      setErrorMsg(err.message || 'Signup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoClick = async (role: 'citizen' | 'analyst' | 'admin') => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      await quickDemoLogin(role);
    } catch (err: any) {
      setErrorMsg(err.message || 'Demo login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isAuthModalOpen}
      onClose={closeAuthModal}
      title="Access ScamShield Defense Vault"
      subtitle="Authenticate to link your scan telemetry, access incident dossiers, and track personal safety scores."
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex bg-[#090B10] p-1 rounded-xl border border-[#30394B]">
          <button
            onClick={() => {
              setTab('demo');
              setErrorMsg(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              tab === 'demo'
                ? 'bg-[#6366F1] text-[#F1F5F9]'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            1-Click Demo Access
          </button>
          <button
            onClick={() => {
              setTab('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              tab === 'login'
                ? 'bg-[#6366F1] text-[#F1F5F9]'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setTab('signup');
              setErrorMsg(null);
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              tab === 'signup'
                ? 'bg-[#6366F1] text-[#F1F5F9]'
                : 'text-[#94A3B8] hover:text-[#F1F5F9]'
            }`}
          >
            Register
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-center gap-2">
            <FontAwesomeIcon icon={faTriangleExclamation} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Tab 1: Instant Demo Accounts */}
        {tab === 'demo' && (
          <div className="space-y-3 pt-1">
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Explore ScamShield instantly with pre-configured role profiles. No password required:
            </p>

            <button
              onClick={() => handleDemoClick('citizen')}
              disabled={isLoading}
              className="w-full p-3.5 rounded-xl bg-[#1B2230]/60 hover:bg-[#1B2230] border border-[#30394B] hover:border-[#818CF8]/50 flex items-center justify-between transition-all group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#6366F1]/20 text-[#818CF8] flex items-center justify-center text-lg">
                  <FontAwesomeIcon icon={faUserShield} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#F1F5F9] group-hover:text-[#818CF8] transition-colors">
                    Rahul Sharma (Citizen)
                  </h4>
                  <p className="text-[11px] text-[#94A3B8]">
                    Personal safety score (98/100) • Scan history & 1930 recovery
                  </p>
                </div>
              </div>
              <span className="text-xs text-[#818CF8] font-mono font-medium">Connect →</span>
            </button>

            <button
              onClick={() => handleDemoClick('analyst')}
              disabled={isLoading}
              className="w-full p-3.5 rounded-xl bg-[#1B2230]/60 hover:bg-[#1B2230] border border-[#30394B] hover:border-[#818CF8]/50 flex items-center justify-between transition-all group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#22C55E]/20 text-[#22C55E] flex items-center justify-center text-lg">
                  <FontAwesomeIcon icon={faShieldHalved} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#F1F5F9] group-hover:text-[#818CF8] transition-colors">
                    Dr. Maya Patel (Security Analyst)
                  </h4>
                  <p className="text-[11px] text-[#94A3B8]">
                    Advanced entropy telemetry • IoC campaign clustering
                  </p>
                </div>
              </div>
              <span className="text-xs text-[#22C55E] font-mono font-medium">Connect →</span>
            </button>

            <button
              onClick={() => handleDemoClick('admin')}
              disabled={isLoading}
              className="w-full p-3.5 rounded-xl bg-[#1B2230]/60 hover:bg-[#1B2230] border border-[#30394B] hover:border-[#818CF8]/50 flex items-center justify-between transition-all group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#EF4444]/20 text-[#EF4444] flex items-center justify-center text-lg">
                  <FontAwesomeIcon icon={faSliders} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-[#F1F5F9] group-hover:text-[#818CF8] transition-colors">
                    Chief Security Officer (Admin)
                  </h4>
                  <p className="text-[11px] text-[#94A3B8]">
                    Full moderation controls • Security audit logs & engine tuning
                  </p>
                </div>
              </div>
              <span className="text-xs text-[#EF4444] font-mono font-medium">Connect →</span>
            </button>
          </div>
        )}

        {/* Tab 2: Standard Sign In */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-3.5 pt-1">
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] uppercase font-mono mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="citizen@example.com"
                className="w-full bg-[#090B10] border border-[#30394B] rounded-xl px-3.5 py-2.5 text-xs text-[#F1F5F9] focus:outline-none focus:border-[#818CF8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] uppercase font-mono mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#090B10] border border-[#30394B] rounded-xl px-3.5 py-2.5 text-xs text-[#F1F5F9] focus:outline-none focus:border-[#818CF8]"
              />
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full mt-2">
              Sign In to ScamShield
            </Button>
          </form>
        )}

        {/* Tab 3: Create Account */}
        {tab === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-3.5 pt-1">
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] uppercase font-mono mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full bg-[#090B10] border border-[#30394B] rounded-xl px-3.5 py-2.5 text-xs text-[#F1F5F9] focus:outline-none focus:border-[#818CF8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] uppercase font-mono mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-[#090B10] border border-[#30394B] rounded-xl px-3.5 py-2.5 text-xs text-[#F1F5F9] focus:outline-none focus:border-[#818CF8]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] uppercase font-mono mb-1">
                Password (min 6 characters)
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#090B10] border border-[#30394B] rounded-xl px-3.5 py-2.5 text-xs text-[#F1F5F9] focus:outline-none focus:border-[#818CF8]"
              />
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full mt-2">
              Create Citizen Account
            </Button>
          </form>
        )}
      </div>
    </Modal>
  );
};
