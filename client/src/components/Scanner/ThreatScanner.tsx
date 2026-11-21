import React, { useState, useEffect } from 'react';
import type { AnalysisResult } from '../../types';
import { ThreatResultCard } from './ThreatResultCard';
import { Button } from '../UI/Button';
import { useAuth } from '../../context/AuthContext';
import {
  MessageSquare,
  Link as LinkIcon,
  FileCode,
  UploadCloud,
  Search,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  Lock,
  Cpu,
} from 'lucide-react';

interface ThreatScannerProps {
  onStartIncident: (result: AnalysisResult) => void;
  onOpenEncyclopedia?: () => void;
  externalPrompt?: { prompt: string; type: 'text' | 'url' } | null;
}

type ScanTab = 'text' | 'url' | 'file';

interface PresetSample {
  name: string;
  type: ScanTab;
  label: string;
  payload: string;
  category: string;
}

const PRESET_SAMPLES: PresetSample[] = [
  {
    name: 'Digital Arrest CBI Intimidation',
    type: 'text',
    label: 'CBI / Police Digital Arrest Notice',
    category: 'DIGITAL_ARREST',
    payload:
      'CONFIDENTIAL NOTICE FROM CBI & MUMBAI POLICE: An arrest warrant has been issued against your Aadhaar card number under Section 21 of the NDPS Act. An illegal parcel seized in customs contains 16 fake passports and contraband registered in your name. You are under immediate digital arrest. Connect to video call interrogation immediately or our team will reach your residence in 2 hours.',
  },
  {
    name: 'Reverse UPI QR Scam',
    type: 'text',
    label: 'Marketplace "Receive Money" QR Code Trap',
    category: 'REVERSE_UPI_QR',
    payload:
      'Dear Seller, I am transferring the ₹15,000 advance payment for your sofa. Please scan this QR code and enter your UPI PIN to receive the money directly credited to your Google Pay bank balance.',
  },
  {
    name: 'Courier Delivery Smishing',
    type: 'url',
    label: 'India Post "Incomplete Address" Smishing',
    category: 'COURIER_DELIVERY_SMISHING',
    payload: 'http://indiapost-parcel-redelivery.top/update-address?trackId=IN89128',
  },
  {
    name: 'Electricity Disconnection Urgency',
    type: 'text',
    label: 'Electricity Cutoff & Remote Tool Threat',
    category: 'IMPERSONATION_SOCIAL_ENGINEERING',
    payload:
      'Dear consumer, your electricity power will be disconnected tonight at 9.30 PM from electricity office because your previous month bill was not updated. Please call electricity officer at 9876543210 immediately or download QuickSupport app to update bill.',
  },
  {
    name: 'Internal Server Probe (SSRF Check)',
    type: 'url',
    label: 'SSRF Cloud Metadata Block Test',
    category: 'SSRF_PROBE',
    payload: 'http://169.254.169.254/latest/meta-data/',
  },
];

export const ThreatScanner: React.FC<ThreatScannerProps> = ({
  onStartIncident,
  onOpenEncyclopedia,
  externalPrompt,
}) => {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState<ScanTab>('text');
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<AnalysisResult | null>(null);

  useEffect(() => {
    if (externalPrompt) {
      setActiveTab(externalPrompt.type);
      if (externalPrompt.type === 'text') setTextInput(externalPrompt.prompt);
      if (externalPrompt.type === 'url') setUrlInput(externalPrompt.prompt);
      setScanResult(null);
      setErrorMsg(null);
    }
  }, [externalPrompt]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 25 * 1024 * 1024) {
        setErrorMsg('File size exceeds the 25MB safety threshold.');
        return;
      }
      setSelectedFile(file);
      setErrorMsg(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 25 * 1024 * 1024) {
        setErrorMsg('File size exceeds the 25MB safety threshold.');
        return;
      }
      setSelectedFile(file);
      setErrorMsg(null);
    }
  };

  const applyPreset = (preset: PresetSample) => {
    setActiveTab(preset.type);
    if (preset.type === 'text') setTextInput(preset.payload);
    if (preset.type === 'url') setUrlInput(preset.payload);
    setErrorMsg(null);
  };

  const executeScan = async () => {
    setErrorMsg(null);
    setIsScanning(true);
    setScanResult(null);

    try {
      const formData = new FormData();
      if (activeTab === 'file') {
        if (!selectedFile) {
          setErrorMsg('Please select a file to scan.');
          setIsScanning(false);
          return;
        }
        formData.append('file', selectedFile);
      } else if (activeTab === 'url') {
        if (!urlInput.trim()) {
          setErrorMsg('Please enter a website or link to verify.');
          setIsScanning(false);
          return;
        }
        formData.append('url', urlInput.trim());
      } else {
        if (!textInput.trim()) {
          setErrorMsg('Please paste message text or email to analyze.');
          setIsScanning(false);
          return;
        }
        formData.append('text', textInput.trim());
      }

      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/v1/scan/universal', {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to complete threat analysis');
      }

      setScanResult(data.result);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with ScamShield Security Engine.');
    } finally {
      setIsScanning(false);
    }
  };

  const resetScanner = () => {
    setScanResult(null);
    setTextInput('');
    setUrlInput('');
    setSelectedFile(null);
    setErrorMsg(null);
  };

  return (
    <div className="space-y-6">
      {/* Precision Header */}
      <div className="border-b border-[var(--border-color)] pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md text-[11px] font-mono border border-[var(--border-color)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--status-success)]"></span>
              Deterministic Security Analysis + AI Fraud Reasoning
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-[var(--text-primary)] tracking-tight">
              Universal Threat & Cyber Scam Scanner
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] mt-1">
              Verify suspicious SMS, WhatsApp messages, QR codes, links, documents, APKs, and EXEs in an isolated zero-execution sandbox.
            </p>
          </div>

          {user && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] text-xs font-mono shrink-0">
              <span className="text-[var(--text-secondary)]">Citizen:</span>
              <span className="font-semibold text-[var(--text-primary)]">{user.displayName}</span>
              <span className="text-[var(--border-color)]">|</span>
              <span className="text-[var(--status-success)] font-medium">Safe Session</span>
            </div>
          )}
        </div>
      </div>

      {/* If Result Exists, Show Threat Result Card */}
      {scanResult ? (
        <ThreatResultCard
          result={scanResult}
          onStartIncident={onStartIncident}
          onReset={resetScanner}
        />
      ) : (
        /* Scanner Input Panel */
        <div className="bg-[var(--surface-primary)] border border-[var(--border-color)] rounded-xl p-6 shadow-xs relative overflow-hidden transition-colors">
          {/* Scanning Progress Overlay */}
          {isScanning && (
            <div className="absolute inset-0 bg-[var(--bg-canvas)]/90 backdrop-blur-xs z-30 flex flex-col items-center justify-center p-6 space-y-4">
              <div className="relative w-16 h-16 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-[var(--accent-primary)]/20 animate-ping" />
                <div className="absolute inset-1 rounded-full border-2 border-[var(--accent-primary)] border-t-transparent animate-spin" />
                <ShieldCheck className="w-6 h-6 text-[var(--accent-primary)]" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-xs font-heading font-semibold text-[var(--text-primary)] uppercase tracking-wider font-mono">
                  Inspecting Telemetry & Running Security Rules...
                </p>
                <p className="text-[11px] text-[var(--text-secondary)] max-w-md">
                  Inspecting magic headers, sanitizing PII, evaluating deterministic heuristics, and requesting Gemini AI explanation.
                </p>
              </div>
            </div>
          )}

          {/* Mode Tabs */}
          <div className="flex border-b border-[var(--border-color)] mb-6 gap-2">
            <button
              onClick={() => {
                setActiveTab('text');
                setErrorMsg(null);
              }}
              className={`flex items-center gap-2 pb-3 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === 'text'
                  ? 'border-[var(--accent-primary)] text-[var(--accent-primary)] font-semibold'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>SMS / WhatsApp / Text</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('url');
                setErrorMsg(null);
              }}
              className={`flex items-center gap-2 pb-3 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === 'url'
                  ? 'border-[var(--accent-primary)] text-[var(--accent-primary)] font-semibold'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <LinkIcon className="w-4 h-4" />
              <span>URLs & Web Links</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('file');
                setErrorMsg(null);
              }}
              className={`flex items-center gap-2 pb-3 px-3 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                activeTab === 'file'
                  ? 'border-[var(--accent-primary)] text-[var(--accent-primary)] font-semibold'
                  : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>FileGuard (Docs, APK, EXE, QR)</span>
            </button>
          </div>

          {/* Tab 1: Text Input */}
          {activeTab === 'text' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-[var(--text-secondary)] font-mono uppercase tracking-wider">
                  Paste Suspicious Communication / Notice / Chat
                </label>
                <span className="text-[11px] font-mono text-[var(--status-success)] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Auto PII Masking
                </span>
              </div>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="e.g. Paste summons claiming arrest, fake courier redelivery update, or lottery claim..."
                rows={5}
                className="w-full bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-lg p-3 text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors resize-y font-sans leading-relaxed"
              />
              <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-[var(--text-secondary)]" />
                Phone numbers, 16-digit cards, Aadhaar, and UPI handles are automatically masked before any processing.
              </p>
            </div>
          )}

          {/* Tab 2: URL Input */}
          {activeTab === 'url' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-[var(--text-secondary)] font-mono uppercase tracking-wider">
                  Enter Web Link, Shortened URL or Phishing Domain
                </label>
                <span className="text-[11px] font-mono text-[var(--status-info)] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  SSRF Pre-flight Guard
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-muted)]">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example-parcel-update.com/claim or http://bit.ly/..."
                  className="w-full bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-lg pl-9 pr-3 py-2.5 text-xs sm:text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--accent-primary)] transition-colors font-mono"
                />
              </div>
              <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-[var(--text-secondary)]" />
                Pre-flight DNS validation prevents SSRF attacks against RFC1918 subnets, loopback interfaces, or cloud metadata endpoints.
              </p>
            </div>
          )}

          {/* Tab 3: File Upload */}
          {activeTab === 'file' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-[var(--text-secondary)] font-mono uppercase tracking-wider">
                  Upload File or Image for Static Analysis (Zero-Execution)
                </label>
                <span className="text-[11px] font-mono text-[var(--status-success)] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  No Execution
                </span>
              </div>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border border-dashed border-[var(--border-color)] hover:border-[var(--accent-primary)] rounded-xl p-6 text-center cursor-pointer bg-[var(--surface-elevated)] transition-colors"
                onClick={() => document.getElementById('file-upload-input')?.click()}
              >
                <input
                  id="file-upload-input"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.jpg,.jpeg,.png,.webp,.apk,.exe"
                />
                <div className="w-10 h-10 mx-auto rounded-lg bg-[var(--surface-primary)] border border-[var(--border-color)] flex items-center justify-center text-[var(--accent-primary)] mb-2">
                  <UploadCloud className="w-5 h-5" />
                </div>
                {selectedFile ? (
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-primary)] font-mono">
                      {selectedFile.name}
                    </p>
                    <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for static inspection
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-medium text-[var(--text-primary)]">
                      Click to browse or drop file here
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1 font-mono">
                      Supported: PDF, DOCX, XLSX, CSV, JPG, PNG, WEBP, APK, EXE (Max 25MB)
                    </p>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-[var(--text-secondary)]" />
                Files are never executed on the host. Analyzed via magic bytes, PE Shannon entropy, and macro AST parsers.
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="mt-4 p-3 rounded-lg bg-[var(--status-danger-bg)] border border-[var(--status-danger)] text-xs text-[var(--status-danger)] flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Row */}
          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-[var(--border-color)]">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] font-mono">
              <Cpu className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <span>Deterministic Security + Gemini 3 Flash Cognitive Explainer</span>
            </div>

            <div className="flex items-center gap-2">
              {onOpenEncyclopedia && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={onOpenEncyclopedia}
                  icon={<BookOpen className="w-3.5 h-3.5" />}
                >
                  Scam Encyclopedia
                </Button>
              )}
              <Button
                onClick={executeScan}
                size="md"
                isLoading={isScanning}
                icon={<Search className="w-3.5 h-3.5" />}
              >
                Scan & Verify Safety
              </Button>
            </div>
          </div>

          {/* Quick-Test Real World Scenarios */}
          <div className="mt-6 pt-5 border-t border-[var(--border-color)]">
            <span className="text-[11px] font-mono text-[var(--text-muted)] uppercase tracking-wider block mb-2.5">
              Quick-Test Prevalent Scam Vectors
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_SAMPLES.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => applyPreset(sample)}
                  className="px-2.5 py-1.5 rounded-lg bg-[var(--surface-elevated)] hover:border-[var(--accent-primary)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-left cursor-pointer"
                >
                  <span className="font-mono text-[10px] text-[var(--accent-primary)] uppercase mr-1">
                    [{sample.type}]
                  </span>
                  <span>{sample.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
