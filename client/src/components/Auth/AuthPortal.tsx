import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  Key,
  User,
  ArrowRight,
  Cpu,
  Fingerprint,
  AlertCircle,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';

export const AuthPortal: React.FC = () => {
  const { login, signup, quickDemoLogin } = useAuth();
  const { theme, setTheme } = useTheme();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        await login(email, password);
      } else {
        await signup(email, password, displayName);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemo = async (role: 'citizen' | 'analyst' | 'admin') => {
    setError(null);
    setIsLoading(true);
    try {
      await quickDemoLogin(role);
    } catch (err: any) {
      setError(err.message || 'Failed to start demo session.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-canvas)] text-[var(--text-primary)] flex flex-col justify-between selection:bg-[var(--accent-subtle)] selection:text-[var(--accent-primary)] font-sans">
      {/* Top Header bar with Theme switcher */}
      <header className="w-full border-b border-[var(--border-color)] px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--surface-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent-primary)]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-base tracking-tight">ScamShield</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-[var(--border-color)] text-[var(--text-muted)] bg-[var(--surface-elevated)]">
                v1.0 Pro
              </span>
            </div>
            <span className="text-[11px] text-[var(--text-secondary)] hidden sm:block">
              Deterministic Security Analysis + AI Fraud Defense
            </span>
          </div>
        </div>

        {/* Theme Preference Switcher */}
        <div className="flex items-center gap-1 bg-[var(--surface-primary)] border border-[var(--border-color)] p-1 rounded-lg">
          <button
            onClick={() => setTheme('dark')}
            title="Dark theme"
            className={`p-1.5 rounded-md text-xs transition-colors ${
              theme === 'dark'
                ? 'bg-[var(--surface-elevated)] text-[var(--accent-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('light')}
            title="Light theme"
            className={`p-1.5 rounded-md text-xs transition-colors ${
              theme === 'light'
                ? 'bg-[var(--surface-elevated)] text-[var(--accent-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('system')}
            title="System preference"
            className={`p-1.5 rounded-md text-xs transition-colors ${
              theme === 'system'
                ? 'bg-[var(--surface-elevated)] text-[var(--accent-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Authentication Grid */}
      <main className="flex-1 flex items-center justify-center px-4 py-12 max-w-7xl mx-auto w-full">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center max-w-5xl">
          {/* Left Column: Security Trust & Value Proposition */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono border border-[var(--border-color)] bg-[var(--surface-primary)] text-[var(--text-secondary)]">
              <span className="w-2 h-2 rounded-full bg-[var(--status-success)] animate-pulse"></span>
              Secured Gateway • Zero-Execution Isolation
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight text-[var(--text-primary)]">
                Protect yourself from digital fraud with deterministic precision.
              </h1>
              <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
                ScamShield combines low-level binary inspection, heuristic threat models, and Google Gemini AI to analyze fraudulent messages, extortion attempts, weaponized documents, and malicious APKs.
              </p>
            </div>

            {/* Core Trust Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[var(--surface-primary)] border border-[var(--border-color)] flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[var(--surface-elevated)] text-[var(--accent-primary)] shrink-0">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-heading font-semibold text-[var(--text-primary)]">
                    Zero-Execution Sandboxing
                  </h2>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                    Untrusted files are never executed. Inspected through static byte signatures.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--surface-primary)] border border-[var(--border-color)] flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[var(--surface-elevated)] text-[var(--accent-primary)] shrink-0">
                  <Fingerprint className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-heading font-semibold text-[var(--text-primary)]">
                    PII Masking by Default
                  </h2>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                    Phone numbers, Aadhaar, UPI IDs, and card numbers are redacted prior to analysis.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--surface-primary)] border border-[var(--border-color)] flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[var(--surface-elevated)] text-[var(--accent-primary)] shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-heading font-semibold text-[var(--text-primary)]">
                    Prevalent Scam Models
                  </h2>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                    Trained on Digital Arrest coercion, Reverse UPI scams, and APK smishing.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-[var(--surface-primary)] border border-[var(--border-color)] flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[var(--surface-elevated)] text-[var(--accent-primary)] shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-heading font-semibold text-[var(--text-primary)]">
                    1930 Helpline Readiness
                  </h2>
                  <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                    Generates standardized police incident dossiers within the Golden Hour.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Authentication Card */}
          <div className="lg:col-span-5">
            <div className="bg-[var(--surface-primary)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-7 shadow-xs">
              {/* Card Header & Tabs */}
              <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-4 mb-5">
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setMode('signin');
                      setError(null);
                    }}
                    className={`text-xs font-medium pb-1 transition-colors relative ${
                      mode === 'signin'
                        ? 'text-[var(--accent-primary)] font-semibold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Sign In
                    {mode === 'signin' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-primary)] rounded-full"></span>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setMode('signup');
                      setError(null);
                    }}
                    className={`text-xs font-medium pb-1 transition-colors relative ${
                      mode === 'signup'
                        ? 'text-[var(--accent-primary)] font-semibold'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    Create Account
                    {mode === 'signup' && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent-primary)] rounded-full"></span>
                    )}
                  </button>
                </div>

                <span className="text-[11px] text-[var(--text-muted)] font-mono">Secured Access</span>
              </div>

              {/* Error Notice */}
              {error && (
                <div className="mb-4 p-3 rounded-lg border border-[var(--status-danger)] bg-[var(--status-danger-bg)] text-[var(--status-danger)] flex items-start gap-2 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Auth Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-2.5" />
                      <input
                        type="text"
                        required
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="Security Analyst / Citizen"
                        className="w-full bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-lg pl-9 pr-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-2.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="citizen@domain.org"
                      className="w-full bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-lg pl-9 pr-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-lg pl-9 pr-3 py-2 text-xs text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-[var(--accent-fg)] font-medium text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-50 mt-2"
                >
                  {isLoading ? (
                    <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                  ) : (
                    <>
                      <span>{mode === 'signin' ? 'Authenticate' : 'Complete Registration'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* 1-Click Sandbox Fast Access */}
              <div className="mt-6 pt-5 border-t border-[var(--border-color)]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider">
                    1-Click Evaluation Profiles
                  </span>
                  <span className="text-[10px] text-[var(--status-info)] font-mono">Sandbox Ready</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemo('citizen')}
                    disabled={isLoading}
                    className="p-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface-elevated)] hover:border-[var(--accent-primary)] text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-primary)]">
                      <User className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                      Citizen
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                      Safety tools & scans
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemo('analyst')}
                    disabled={isLoading}
                    className="p-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface-elevated)] hover:border-[var(--accent-primary)] text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-primary)]">
                      <Cpu className="w-3.5 h-3.5 text-[var(--status-info)]" />
                      Analyst
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                      Technical telemetry
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemo('admin')}
                    disabled={isLoading}
                    className="p-2.5 rounded-lg border border-[var(--border-color)] bg-[var(--surface-elevated)] hover:border-[var(--accent-primary)] text-left transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-primary)] group-hover:text-[var(--accent-primary)]">
                      <ShieldAlert className="w-3.5 h-3.5 text-[var(--status-warning)]" />
                      Admin
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] block mt-0.5">
                      Moderation & controls
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[var(--border-color)] py-4 px-6 text-center text-xs text-[var(--text-muted)] max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[var(--accent-primary)]" />
          <span>ScamShield Cybersecurity Framework • National Cybercrime Prevention Standard</span>
        </div>
        <div className="font-mono text-[11px] text-[var(--text-secondary)]">
          National Emergency Helpline: <span className="text-[var(--accent-primary)] font-semibold">1930</span>
        </div>
      </footer>
    </div>
  );
};
