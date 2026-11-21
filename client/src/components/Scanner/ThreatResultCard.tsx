import React, { useState } from 'react';
import type { AnalysisResult } from '../../types';
import { Badge } from '../UI/Badge';
import { Button } from '../UI/Button';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  ShieldCheck,
  Terminal,
  PhoneCall,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';

interface ThreatResultCardProps {
  result: AnalysisResult;
  onStartIncident: (result: AnalysisResult) => void;
  onReset: () => void;
}

export const ThreatResultCard: React.FC<ThreatResultCardProps> = ({
  result,
  onStartIncident,
  onReset,
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);
  const [copiedAdvice, setCopiedAdvice] = useState(false);

  const isDangerous = result.riskSeverity === 'CRITICAL' || result.riskSeverity === 'HIGH';
  const isSafe = result.riskSeverity === 'SAFE';

  const fishiness =
    result.aiExplanation.fishinessScore !== undefined
      ? result.aiExplanation.fishinessScore
      : isSafe
      ? 5
      : result.deterministicScore || 85;

  const verdictLabel =
    result.aiExplanation.verdictLabel ||
    (isDangerous
      ? 'BLATANT SCAM / HIGHLY FISHY'
      : isSafe
      ? 'SAFE & GENUINE'
      : 'POTENTIALLY SUSPICIOUS');

  const copyAdvice = () => {
    const textToCopy = `ScamShield Verdict: ${verdictLabel}\n${result.aiExplanation.plainLanguageVerdict}\n\nImmediate Actions:\n${result.aiExplanation.immediateActionSteps.join(
      '\n'
    )}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedAdvice(true);
    setTimeout(() => setCopiedAdvice(false), 2500);
  };

  return (
    <div className="w-full bg-[var(--surface-primary)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-xs">
      {/* 1. Header Banner with Severity State */}
      <div
        className={`px-6 py-4.5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isDangerous
            ? 'bg-[var(--status-danger-bg)] border-[var(--status-danger)]'
            : isSafe
            ? 'bg-[var(--status-success-bg)] border-[var(--status-success)]'
            : 'bg-[var(--status-warning-bg)] border-[var(--status-warning)]'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
              isDangerous
                ? 'bg-[var(--surface-primary)] text-[var(--status-danger)] border-[var(--status-danger)]'
                : isSafe
                ? 'bg-[var(--surface-primary)] text-[var(--status-success)] border-[var(--status-success)]'
                : 'bg-[var(--surface-primary)] text-[var(--status-warning)] border-[var(--status-warning)]'
            }`}
          >
            {isDangerous ? (
              <AlertTriangle className="w-5 h-5" />
            ) : isSafe ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Info className="w-5 h-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-heading font-bold text-lg text-[var(--text-primary)] tracking-tight">
                {verdictLabel}
              </span>
              <Badge severity={result.riskSeverity} />
              <Badge variant="accent" label={`Confidence: ${result.confidence}`} />
            </div>
            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5 font-mono">
              Target: <span className="text-[var(--text-primary)] font-medium">{result.targetName}</span> •{' '}
              {new Date(result.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isDangerous && (
            <Button
              variant="danger"
              size="sm"
              icon={<PhoneCall className="w-3.5 h-3.5" />}
              onClick={() => onStartIncident(result)}
            >
              Start 1930 Incident Dossier
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={onReset}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            New Scan
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 2. AI Scam & Fishiness Probability Gauge */}
        <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[var(--text-secondary)] uppercase font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[var(--accent-primary)]" />
              Cognitive Threat & Fishiness Meter
            </span>
            <span
              className={`font-bold text-sm ${
                isDangerous
                  ? 'text-[var(--status-danger)]'
                  : isSafe
                  ? 'text-[var(--status-success)]'
                  : 'text-[var(--status-warning)]'
              }`}
            >
              {fishiness}% Threat Probability
            </span>
          </div>

          {/* Visual Progress Bar */}
          <div className="w-full h-2.5 rounded-full bg-[var(--surface-primary)] overflow-hidden border border-[var(--border-color)]">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isDangerous
                  ? 'bg-[var(--status-danger)]'
                  : isSafe
                  ? 'bg-[var(--status-success)]'
                  : 'bg-[var(--status-warning)]'
              }`}
              style={{ width: `${Math.max(5, Math.min(100, fishiness))}%` }}
            />
          </div>
        </div>

        {/* 3. Plain Language Verdict */}
        <div className="bg-[var(--surface-elevated)] border border-[var(--border-color)] rounded-xl p-4.5">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-heading font-semibold text-[var(--accent-primary)] uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Info className="w-3.5 h-3.5" />
              Plain-English Verdict for Citizens
            </h2>
            <button
              onClick={copyAdvice}
              className="text-[11px] text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors font-mono flex items-center gap-1 cursor-pointer"
            >
              {copiedAdvice ? (
                <>
                  <Check className="w-3 h-3 text-[var(--status-success)]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Advice</span>
                </>
              )}
            </button>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed font-medium">
            {result.aiExplanation.plainLanguageVerdict || result.summary}
          </p>
        </div>

        {/* 4. Red Flags Detected */}
        {result.aiExplanation.redFlags && result.aiExplanation.redFlags.length > 0 && (
          <div className="space-y-2">
            <h2 className="text-xs font-mono font-semibold text-[var(--status-danger)] uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--status-danger)]" />
              Identified Deception Flags ({result.aiExplanation.redFlags.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {result.aiExplanation.redFlags.map((flag, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)] text-xs text-[var(--text-primary)] flex items-start gap-2.5"
                >
                  <span className="text-[var(--status-danger)] font-bold text-xs shrink-0 mt-0.5">✕</span>
                  <span className="leading-snug">{flag}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Legitimacy Check: What Genuine Organizations Do */}
        {result.aiExplanation.legitimacyCheck && (
          <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] space-y-1">
            <h2 className="text-xs font-mono font-semibold text-[var(--status-success)] uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Reality Check: What Real Organizations Actually Do
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {result.aiExplanation.legitimacyCheck}
            </p>
          </div>
        )}

        {/* 6. Safe Response Advice */}
        {result.aiExplanation.safeResponseAdvice && (
          <div className="p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] space-y-1">
            <h2 className="text-xs font-mono font-semibold text-[var(--accent-primary)] uppercase tracking-wider">
              Recommended Defensive Action
            </h2>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              {result.aiExplanation.safeResponseAdvice}
            </p>
          </div>
        )}

        {/* 7. Immediate Action Steps */}
        {result.aiExplanation.immediateActionSteps &&
          result.aiExplanation.immediateActionSteps.length > 0 && (
            <div>
              <h2 className="text-xs font-mono font-semibold text-[var(--text-primary)] uppercase tracking-wider mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
                Defensive Action Checklist
              </h2>
              <div className="space-y-2">
                {result.aiExplanation.immediateActionSteps.map((step, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 rounded-lg bg-[var(--surface-elevated)] border border-[var(--border-color)]"
                  >
                    <div className="w-5 h-5 rounded bg-[var(--accent-primary)] text-[var(--accent-fg)] flex items-center justify-center shrink-0 font-bold font-mono text-[10px]">
                      {idx + 1}
                    </div>
                    <p className="text-xs text-[var(--text-primary)] font-medium leading-relaxed">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        {/* 8. Emergency 1930 Helpline Advice */}
        {isDangerous && (
          <div className="p-4 rounded-xl bg-[var(--status-danger-bg)] border border-[var(--status-danger)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-[var(--status-danger)] uppercase tracking-wider font-mono flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5" />
                Financial Loss Emergency Protocol (Golden Hour)
              </h3>
              <p className="text-xs text-[var(--text-primary)] mt-0.5">
                {result.aiExplanation.emergencyAdvice ||
                  'If money was transferred or UPI PIN entered, dial National Cyber Crime Helpline 1930 immediately to freeze banking settlement nodes.'}
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              onClick={() => onStartIncident(result)}
              className="shrink-0"
            >
              Open Helpline Dossier
            </Button>
          </div>
        )}

        {/* 9. Collapsible Technical Security Telemetry */}
        <div className="border-t border-[var(--border-color)] pt-4">
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="w-full flex items-center justify-between py-2 text-xs font-mono text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[var(--accent-primary)]" />
              <span>TECHNICAL SECURITY TELEMETRY & DETERMINISTIC AUDIT</span>
              <span className="px-2 py-0.5 rounded bg-[var(--surface-elevated)] text-[10px] text-[var(--accent-primary)] border border-[var(--border-color)]">
                Score: {result.deterministicScore}/100
              </span>
            </span>
            {showTechnicalDetails ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showTechnicalDetails && (
            <div className="mt-3 space-y-3 p-4 rounded-xl bg-[var(--surface-elevated)] border border-[var(--border-color)] font-mono text-xs">
              {/* Telemetry Metric Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
                <div className="p-2.5 rounded-lg bg-[var(--surface-primary)] border border-[var(--border-color)]">
                  <span className="text-[var(--text-muted)] block text-[10px]">Deterministic Score</span>
                  <span className="text-[var(--text-primary)] font-bold text-sm">
                    {result.deterministicScore} / 100
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--surface-primary)] border border-[var(--border-color)]">
                  <span className="text-[var(--text-muted)] block text-[10px]">MIME / File Type</span>
                  <span className="text-[var(--accent-primary)] font-bold truncate block">
                    {result.indicators.detectedMime || 'N/A'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--surface-primary)] border border-[var(--border-color)]">
                  <span className="text-[var(--text-muted)] block text-[10px]">Shannon Entropy</span>
                  <span className="text-[var(--text-primary)] font-bold">
                    {result.indicators.entropyScore !== undefined
                      ? `${result.indicators.entropyScore} / 8.0`
                      : 'N/A'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[var(--surface-primary)] border border-[var(--border-color)]">
                  <span className="text-[var(--text-muted)] block text-[10px]">Isolation State</span>
                  <span className="text-[var(--status-success)] font-bold">Zero-Execution</span>
                </div>
              </div>

              {/* SHA256 Hash if available */}
              {result.indicators.sha256 && (
                <div className="p-2.5 rounded-lg bg-[var(--surface-primary)] border border-[var(--border-color)] flex items-center gap-2 overflow-x-auto">
                  <span className="text-[var(--text-muted)] shrink-0 text-[10px]">SHA-256:</span>
                  <span className="text-[var(--accent-primary)] text-[11px] select-all truncate">
                    {result.indicators.sha256}
                  </span>
                </div>
              )}

              {/* Security Flags with Evidence & Limitations */}
              <div>
                <span className="text-[var(--text-muted)] text-[11px] block mb-2 font-semibold uppercase">
                  Deterministic Heuristic & Signature Evidence ({result.flags.length} Flags)
                </span>
                {result.flags.length === 0 ? (
                  <p className="text-[var(--status-success)] text-xs">No anomalous signatures detected.</p>
                ) : (
                  <div className="space-y-2">
                    {result.flags.map((flag) => (
                      <div
                        key={flag.id}
                        className="p-3 rounded-lg bg-[var(--surface-primary)] border border-[var(--border-color)] space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[var(--text-primary)] font-semibold text-xs">
                            {flag.label}
                          </span>
                          <Badge severity={flag.severity} />
                        </div>
                        <p className="text-[var(--text-secondary)] text-[11px] leading-relaxed">
                          <strong className="text-[var(--accent-primary)]">Evidence:</strong> {flag.evidence}
                        </p>
                        <p className="text-[var(--text-muted)] text-[10px] leading-relaxed">
                          <strong>Technical Limitation:</strong> {flag.limitations}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* URL Redirect Hops if present */}
              {result.indicators.redirectHops && result.indicators.redirectHops.length > 0 && (
                <div>
                  <span className="text-[var(--text-muted)] text-[11px] block mb-2 font-semibold uppercase">
                    SSRF-Protected Safe Redirect Chain
                  </span>
                  <div className="space-y-1.5">
                    {result.indicators.redirectHops.map((hop, i) => (
                      <div
                        key={i}
                        className="p-2 rounded bg-[var(--surface-primary)] border border-[var(--border-color)] flex items-center justify-between text-[11px]"
                      >
                        <span className="text-[var(--accent-primary)] truncate max-w-[70%]">
                          {i + 1}. {hop.url}
                        </span>
                        <div className="flex items-center gap-2">
                          {hop.ip && (
                            <span className="text-[var(--text-muted)] text-[10px]">IP: {hop.ip}</span>
                          )}
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              hop.blocked
                                ? 'bg-[var(--status-danger-bg)] text-[var(--status-danger)]'
                                : 'bg-[var(--status-success-bg)] text-[var(--status-success)]'
                            }`}
                          >
                            {hop.blocked ? 'BLOCKED' : hop.status || 'Resolved'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
