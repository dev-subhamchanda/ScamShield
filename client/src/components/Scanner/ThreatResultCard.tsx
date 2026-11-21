import React, { useState } from 'react';
import type { AnalysisResult } from '../../types';
import { Badge } from '../UI/Badge';
import { Button } from '../UI/Button';
import {
  FontAwesomeIcon,
  faTriangleExclamation,
  faCircleCheck,
  faChevronDown,
  faChevronUp,
  faTerminal,
  faPhoneVolume,
  faCircleInfo,
  faShieldHalved,
} from '../UI/Icons';

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

  const fishiness = result.aiExplanation.fishinessScore || (isSafe ? 5 : result.deterministicScore || 85);
  const verdictLabel = result.aiExplanation.verdictLabel || (isDangerous ? 'BLATANT SCAM / HIGHLY FISHY' : isSafe ? 'SAFE & GENUINE' : 'POTENTIALLY SUSPICIOUS');

  const copyAdvice = () => {
    const textToCopy = `ScamShield Verdict: ${verdictLabel}\n${result.aiExplanation.plainLanguageVerdict}\n\nImmediate Actions:\n${result.aiExplanation.immediateActionSteps.join('\n')}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedAdvice(true);
    setTimeout(() => setCopiedAdvice(false), 2500);
  };

  return (
    <div className="w-full bg-[#11151E] border border-[#30394B] rounded-2xl overflow-hidden shadow-2xl animate-fadeIn">
      {/* 1. Header Banner with Severity State */}
      <div
        className={`px-6 py-5 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
          isDangerous
            ? 'bg-[#EF4444]/10 border-[#EF4444]/30'
            : isSafe
            ? 'bg-[#22C55E]/10 border-[#22C55E]/30'
            : 'bg-[#F59E0B]/10 border-[#F59E0B]/30'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${
              isDangerous
                ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/40'
                : isSafe
                ? 'bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/40'
                : 'bg-[#F59E0B]/20 text-[#F59E0B] border border-[#F59E0B]/40'
            }`}
          >
            <FontAwesomeIcon
              icon={isDangerous ? faTriangleExclamation : isSafe ? faCircleCheck : faCircleInfo}
            />
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-display font-bold text-xl text-[#F1F5F9] tracking-tight">
                {verdictLabel}
              </span>
              <Badge severity={result.riskSeverity} />
              <Badge variant="accent" label={`Confidence: ${result.confidence}`} />
            </div>
            <p className="text-xs text-[#94A3B8] mt-1 font-mono">
              Target: <span className="text-[#F1F5F9] font-medium">{result.targetName}</span> •{' '}
              {new Date(result.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isDangerous && (
            <Button
              variant="danger"
              size="sm"
              icon={<FontAwesomeIcon icon={faPhoneVolume} />}
              onClick={() => onStartIncident(result)}
            >
              Start Incident Protocol
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={onReset}>
            New Scan
          </Button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* 2. AI Scam & Fishiness Probability Gauge */}
        <div className="p-4 rounded-xl bg-[#090B10] border border-[#30394B] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-[#94A3B8] uppercase font-semibold flex items-center gap-1.5">
              <FontAwesomeIcon icon={faShieldHalved} className="text-[#818CF8]" />
              AI Scam Likelihood & Fishiness Meter
            </span>
            <span
              className={`font-bold text-sm ${
                isDangerous ? 'text-[#EF4444]' : isSafe ? 'text-[#22C55E]' : 'text-[#F59E0B]'
              }`}
            >
              {fishiness}% Scam Likelihood
            </span>
          </div>

          {/* Visual Progress Bar */}
          <div className="w-full h-3 rounded-full bg-[#1B2230] overflow-hidden p-0.5 border border-[#30394B]">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                isDangerous
                  ? 'bg-gradient-to-r from-[#F59E0B] to-[#EF4444]'
                  : isSafe
                  ? 'bg-[#22C55E]'
                  : 'bg-[#F59E0B]'
              }`}
              style={{ width: `${Math.max(5, fishiness)}%` }}
            />
          </div>
        </div>

        {/* 3. Plain Language Verdict */}
        <div className="bg-[#1B2230]/50 border border-[#30394B] rounded-xl p-4">
          <div className="flex items-center justify-between mb-1.5">
            <h4 className="text-xs font-semibold text-[#818CF8] uppercase tracking-wider flex items-center gap-2 font-mono">
              <FontAwesomeIcon icon={faCircleInfo} />
              Plain-English Verdict for Citizens
            </h4>
            <button
              onClick={copyAdvice}
              className="text-[11px] text-[#94A3B8] hover:text-[#818CF8] transition-colors font-mono"
            >
              {copiedAdvice ? '✓ Copied Advice' : 'Copy Advice'}
            </button>
          </div>
          <p className="text-sm sm:text-base text-[#F1F5F9] leading-relaxed font-medium">
            {result.aiExplanation.plainLanguageVerdict || result.summary}
          </p>
        </div>

        {/* 4. Red Flags Detected (Why this is Fishy) */}
        {result.aiExplanation.redFlags && result.aiExplanation.redFlags.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-[#EF4444] uppercase tracking-wider font-mono flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
              Fishy Red Flags Detected
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {result.aiExplanation.redFlags.map((flag, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-[#090B10] border border-[#30394B] text-xs text-[#F1F5F9] flex items-start gap-2.5"
                >
                  <span className="text-[#EF4444] font-bold text-sm shrink-0">✕</span>
                  <span className="leading-snug">{flag}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Legitimacy Check: What Genuine Organizations Do */}
        {result.aiExplanation.legitimacyCheck && (
          <div className="p-4 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/30 space-y-1">
            <h4 className="text-xs font-semibold text-[#22C55E] uppercase tracking-wider font-mono flex items-center gap-1.5">
              <FontAwesomeIcon icon={faCircleCheck} />
              Reality Check: What Real Organizations Actually Do
            </h4>
            <p className="text-xs text-[#F1F5F9] leading-relaxed font-medium">
              {result.aiExplanation.legitimacyCheck}
            </p>
          </div>
        )}

        {/* 6. Safe Response Script */}
        {result.aiExplanation.safeResponseAdvice && (
          <div className="p-4 rounded-xl bg-[#090B10] border border-[#30394B] space-y-1">
            <h4 className="text-xs font-semibold text-[#818CF8] uppercase tracking-wider font-mono">
              Recommended Safe Response / Action
            </h4>
            <p className="text-xs text-[#94A3B8] leading-relaxed">
              {result.aiExplanation.safeResponseAdvice}
            </p>
          </div>
        )}

        {/* 7. The 1-2-3 Immediate Action Steps */}
        <div>
          <h4 className="text-xs font-semibold text-[#F1F5F9] uppercase tracking-wider mb-2.5 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#818CF8]" />
            Immediate Action Checklist
          </h4>
          <div className="space-y-2">
            {result.aiExplanation.immediateActionSteps.map((step, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl bg-[#1B2230]/40 border border-[#30394B] hover:border-[#818CF8]/40 transition-colors"
              >
                <div className="w-6 h-6 rounded-lg bg-[#6366F1] text-[#F1F5F9] flex items-center justify-center shrink-0 font-bold font-mono text-xs">
                  {idx + 1}
                </div>
                <p className="text-xs sm:text-sm text-[#F1F5F9] font-medium leading-relaxed pt-0.5">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 8. Emergency 1930 Advice Box */}
        {isDangerous && (
          <div className="p-4 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h5 className="text-xs font-bold text-[#EF4444] uppercase tracking-wider font-mono flex items-center gap-1.5">
                <FontAwesomeIcon icon={faPhoneVolume} />
                Financial Loss Emergency Protocol
              </h5>
              <p className="text-xs text-[#F1F5F9] mt-0.5">
                {result.aiExplanation.emergencyAdvice}
              </p>
            </div>
            <button
              onClick={() => onStartIncident(result)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#EF4444] text-white hover:bg-[#DC2626] transition-colors shrink-0"
            >
              Open Helpline Guide
            </button>
          </div>
        )}

        {/* 9. Collapsible Technical Security Telemetry */}
        <div className="border-t border-[#30394B] pt-4">
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            className="w-full flex items-center justify-between py-2 text-xs font-mono text-[#94A3B8] hover:text-[#F1F5F9] transition-colors"
          >
            <span className="flex items-center gap-2">
              <FontAwesomeIcon icon={faTerminal} className="text-[#818CF8]" />
              TECHNICAL SECURITY TELEMETRY & DETERMINISTIC AUDIT
              <span className="px-2 py-0.5 rounded bg-[#1B2230] text-[10px] text-[#818CF8] border border-[#30394B]">
                Score: {result.deterministicScore}/100
              </span>
            </span>
            <FontAwesomeIcon icon={showTechnicalDetails ? faChevronUp : faChevronDown} />
          </button>

          {showTechnicalDetails && (
            <div className="mt-4 space-y-4 p-4 rounded-xl bg-[#090B10] border border-[#30394B] font-mono text-xs animate-fadeIn">
              {/* Telemetry Metric Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
                <div className="p-2.5 rounded-lg bg-[#11151E] border border-[#30394B]">
                  <span className="text-[#94A3B8] block text-[10px]">Deterministic Score</span>
                  <span className="text-[#F1F5F9] font-bold text-sm">
                    {result.deterministicScore} / 100
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#11151E] border border-[#30394B]">
                  <span className="text-[#94A3B8] block text-[10px]">MIME / File Type</span>
                  <span className="text-[#818CF8] font-bold truncate block">
                    {result.indicators.detectedMime || 'N/A'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#11151E] border border-[#30394B]">
                  <span className="text-[#94A3B8] block text-[10px]">Shannon Entropy</span>
                  <span className="text-[#F1F5F9] font-bold">
                    {result.indicators.entropyScore !== undefined
                      ? `${result.indicators.entropyScore} / 8.0`
                      : 'N/A'}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#11151E] border border-[#30394B]">
                  <span className="text-[#94A3B8] block text-[10px]">Isolation State</span>
                  <span className="text-[#22C55E] font-bold">Zero-Execution</span>
                </div>
              </div>

              {/* SHA256 Hash if available */}
              {result.indicators.sha256 && (
                <div className="p-2.5 rounded-lg bg-[#11151E] border border-[#30394B] flex items-center gap-2 overflow-x-auto">
                  <span className="text-[#94A3B8] shrink-0 text-[10px]">SHA-256:</span>
                  <span className="text-[#818CF8] text-[11px] select-all truncate">
                    {result.indicators.sha256}
                  </span>
                </div>
              )}

              {/* Security Flags with Evidence & Limitations */}
              <div>
                <span className="text-[#94A3B8] text-[11px] block mb-2 font-semibold uppercase">
                  Deterministic Heuristic & Signature Evidence ({result.flags.length} Flags)
                </span>
                {result.flags.length === 0 ? (
                  <p className="text-[#22C55E] text-xs">No anomalous signatures detected.</p>
                ) : (
                  <div className="space-y-2">
                    {result.flags.map((flag) => (
                      <div
                        key={flag.id}
                        className="p-3 rounded-lg bg-[#11151E] border border-[#30394B] space-y-1"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[#F1F5F9] font-semibold text-xs">{flag.label}</span>
                          <Badge severity={flag.severity} />
                        </div>
                        <p className="text-[#94A3B8] text-[11px] leading-relaxed">
                          <strong className="text-[#818CF8]">Evidence:</strong> {flag.evidence}
                        </p>
                        <p className="text-[#94A3B8]/70 text-[10px] leading-relaxed">
                          <strong className="text-[#94A3B8]">Technical Limitation:</strong>{' '}
                          {flag.limitations}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* URL Redirect Hops if present */}
              {result.indicators.redirectHops && result.indicators.redirectHops.length > 0 && (
                <div>
                  <span className="text-[#94A3B8] text-[11px] block mb-2 font-semibold uppercase">
                    SSRF-Protected Safe Redirect Chain
                  </span>
                  <div className="space-y-1.5">
                    {result.indicators.redirectHops.map((hop, i) => (
                      <div
                        key={i}
                        className="p-2 rounded bg-[#11151E] border border-[#30394B] flex items-center justify-between text-[11px]"
                      >
                        <span className="text-[#818CF8] truncate max-w-[70%]">
                          {i + 1}. {hop.url}
                        </span>
                        <div className="flex items-center gap-2">
                          {hop.ip && (
                            <span className="text-[#94A3B8] text-[10px]">IP: {hop.ip}</span>
                          )}
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] ${
                              hop.blocked
                                ? 'bg-[#EF4444]/20 text-[#EF4444]'
                                : 'bg-[#22C55E]/20 text-[#22C55E]'
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
