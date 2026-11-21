import React, { useState, useEffect } from 'react';
import type { AnalysisResult } from '../../types';
import { ThreatResultCard } from './ThreatResultCard';
import { Button } from '../UI/Button';
import { useAuth } from '../../context/AuthContext';
import {
  FontAwesomeIcon,
  faCommentDots,
  faLink,
  faFileShield,
  faUpload,
  faMagnifyingGlass,
  faShieldHalved,
  faTriangleExclamation,
  faCircleCheck,
  faCircleInfo,
} from '../UI/Icons';

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
      {/* Hero Intro */}
      <div className="text-center max-w-2xl mx-auto pt-2 pb-1">
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#F1F5F9] tracking-tight">
          Universal Threat & Cyber Scam Scanner
        </h2>
        <p className="text-sm text-[#94A3B8] mt-2">
          Deterministic signature checks + AI Fraud Detection. Verify suspicious SMS, WhatsApp
          chats, QR codes, links, documents, APKs, or EXEs with zero execution risk.
        </p>

        {user && (
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#1B2230] border border-[#30394B] text-xs font-mono text-[#818CF8]">
            <span>Active Citizen: {user.displayName}</span>
            <span>•</span>
            <span className="text-[#22C55E]">Safety Score: {user.trustScore}/100</span>
          </div>
        )}
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
        <div className="bg-[#11151E] border border-[#30394B] rounded-2xl p-6 shadow-xl relative overflow-hidden">
          {/* Scanning Overlay Radar Animation */}
          {isScanning && (
            <div className="absolute inset-0 bg-[#090B10]/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-6 space-y-4">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-[#818CF8]/30 animate-ping" />
                <div className="absolute inset-2 rounded-full border border-[#6366F1] animate-spin border-t-transparent" />
                <FontAwesomeIcon icon={faShieldHalved} className="text-2xl text-[#818CF8]" />
              </div>
              <div className="text-center space-y-1">
                <p className="text-sm font-semibold text-[#F1F5F9] font-mono">
                  Performing Multi-Layer AI & Deterministic Threat Inspection...
                </p>
                <p className="text-xs text-[#94A3B8]">
                  Checking Magic Bytes • Parsing Signatures • Running Fishiness Scoring • Generating Plain-English Advice
                </p>
              </div>
            </div>
          )}

          {/* Mode Tabs */}
          <div className="flex border-b border-[#30394B] mb-6">
            <button
              onClick={() => {
                setActiveTab('text');
                setErrorMsg(null);
              }}
              className={`flex items-center gap-2 pb-3 px-4 text-xs sm:text-sm font-medium border-b-2 transition-all ${
                activeTab === 'text'
                  ? 'border-[#818CF8] text-[#818CF8]'
                  : 'border-transparent text-[#94A3B8] hover:text-[#F1F5F9]'
              }`}
            >
              <FontAwesomeIcon icon={faCommentDots} />
              <span>SMS / WhatsApp / Text</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('url');
                setErrorMsg(null);
              }}
              className={`flex items-center gap-2 pb-3 px-4 text-xs sm:text-sm font-medium border-b-2 transition-all ${
                activeTab === 'url'
                  ? 'border-[#818CF8] text-[#818CF8]'
                  : 'border-transparent text-[#94A3B8] hover:text-[#F1F5F9]'
              }`}
            >
              <FontAwesomeIcon icon={faLink} />
              <span>URL & Web Links</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('file');
                setErrorMsg(null);
              }}
              className={`flex items-center gap-2 pb-3 px-4 text-xs sm:text-sm font-medium border-b-2 transition-all ${
                activeTab === 'file'
                  ? 'border-[#818CF8] text-[#818CF8]'
                  : 'border-transparent text-[#94A3B8] hover:text-[#F1F5F9]'
              }`}
            >
              <FontAwesomeIcon icon={faFileShield} />
              <span>FileGuard (Docs, APK, EXE, QR)</span>
            </button>
          </div>

          {/* Tab 1: Text Input */}
          {activeTab === 'text' && (
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-[#94A3B8] uppercase font-mono">
                Paste Suspicious Message, Email or Chat Transcript
              </label>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="e.g. Paste notice claiming arrest warrant, fake courier update SMS, or lottery windfall..."
                rows={5}
                className="w-full bg-[#090B10] border border-[#30394B] rounded-xl p-4 text-sm text-[#F1F5F9] placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#818CF8] focus:ring-1 focus:ring-[#818CF8] transition-all resize-y"
              />
              <p className="text-[11px] text-[#94A3B8] flex items-center gap-1.5">
                <FontAwesomeIcon icon={faCircleCheck} className="text-[#22C55E]" />
                Automated PII Redactor: Phone numbers, cards, and bank account numbers are scrubbed
                before processing.
              </p>
            </div>
          )}

          {/* Tab 2: URL Input */}
          {activeTab === 'url' && (
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-[#94A3B8] uppercase font-mono">
                Enter Web Link, Shortened URL or Phishing Domain
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#94A3B8]">
                  <FontAwesomeIcon icon={faLink} />
                </div>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example-parcel-update.com/claim or http://bit.ly/..."
                  className="w-full bg-[#090B10] border border-[#30394B] rounded-xl pl-10 pr-4 py-3 text-sm text-[#F1F5F9] placeholder-[#94A3B8]/50 focus:outline-none focus:border-[#818CF8] focus:ring-1 focus:ring-[#818CF8] transition-all font-mono"
                />
              </div>
              <p className="text-[11px] text-[#94A3B8] flex items-center gap-1.5">
                <FontAwesomeIcon icon={faCircleCheck} className="text-[#22C55E]" />
                SSRF Guard Active: Pre-flight DNS prevents requests to private RFC1918 subnets,
                localhost, or cloud metadata endpoints.
              </p>
            </div>
          )}

          {/* Tab 3: File Upload */}
          {activeTab === 'file' && (
            <div className="space-y-4">
              <label className="block text-xs font-semibold text-[#94A3B8] uppercase font-mono">
                Upload File or Image for Static Analysis (Zero-Execution)
              </label>
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="border-2 border-dashed border-[#30394B] hover:border-[#818CF8]/50 rounded-2xl p-6 text-center cursor-pointer bg-[#090B10]/40 transition-colors"
                onClick={() => document.getElementById('file-upload-input')?.click()}
              >
                <input
                  id="file-upload-input"
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.jpg,.jpeg,.png,.webp,.apk,.exe"
                />
                <div className="w-12 h-12 mx-auto rounded-xl bg-[#1B2230] border border-[#30394B] flex items-center justify-center text-[#818CF8] mb-3">
                  <FontAwesomeIcon icon={faUpload} className="text-xl" />
                </div>
                {selectedFile ? (
                  <div>
                    <p className="text-sm font-semibold text-[#F1F5F9] font-mono">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for Static Analysis
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-[#F1F5F9]">
                      Click to browse or drag & drop files here
                    </p>
                    <p className="text-xs text-[#94A3B8] mt-1">
                      Supported: <span className="text-[#818CF8]">PDF, DOCX, XLSX, CSV, JPG, PNG, WEBP, APK, EXE</span> (Max 25MB)
                    </p>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-[#94A3B8] flex items-center gap-1.5">
                <FontAwesomeIcon icon={faCircleCheck} className="text-[#22C55E]" />
                Zero-Execution Policy: Uploaded binaries and macros are inspected statically via
                magic bytes and AST structures. Files are never executed.
              </p>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="mt-4 p-3 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-xs text-[#EF4444] flex items-center gap-2">
              <FontAwesomeIcon icon={faTriangleExclamation} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Row */}
          <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
              <FontAwesomeIcon icon={faShieldHalved} className="text-[#818CF8]" />
              <span>Deterministic Heuristics + AI Fishiness Reasoning</span>
            </div>

            <div className="flex items-center gap-2.5">
              {onOpenEncyclopedia && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={onOpenEncyclopedia}
                  icon={<FontAwesomeIcon icon={faCircleInfo} />}
                >
                  Scam Encyclopedia
                </Button>
              )}
              <Button
                onClick={executeScan}
                size="lg"
                isLoading={isScanning}
                icon={<FontAwesomeIcon icon={faMagnifyingGlass} />}
              >
                Scan & Verify Safety
              </Button>
            </div>
          </div>

          {/* Quick-Test Sample Scams Section */}
          <div className="mt-8 pt-6 border-t border-[#30394B]">
            <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider block mb-3 font-mono">
              Quick-Test Real World Scam Scenarios
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESET_SAMPLES.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => applyPreset(sample)}
                  className="px-3 py-1.5 rounded-lg bg-[#1B2230]/60 hover:bg-[#1B2230] border border-[#30394B] text-xs text-[#94A3B8] hover:text-[#F1F5F9] transition-colors text-left"
                >
                  <span className="font-semibold text-[#818CF8]">
                    {sample.type.toUpperCase()}:
                  </span>{' '}
                  {sample.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
