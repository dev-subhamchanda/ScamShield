import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { AnalysisResult, CommunityThreatReport, IncidentReport } from '../types.js';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

  if (url && key && url.startsWith('http')) {
    try {
      supabaseInstance = createClient(url, key, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      console.log('✅ Supabase Client initialized with RLS support.');
    } catch (err: any) {
      console.warn('⚠️ Supabase initialization skipped:', err.message);
    }
  }

  return supabaseInstance;
}

export async function persistScanToSupabase(result: AnalysisResult, userId?: string) {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('scan_records').insert({
      id: result.id,
      user_id: userId || null,
      scan_type: result.scanType,
      target_name: result.targetName,
      risk_severity: result.riskSeverity,
      confidence: result.confidence,
      threat_category: result.threatCategory,
      deterministic_score: result.deterministicScore,
      sha256_hash: result.indicators.sha256 || null,
      detected_mime: result.indicators.detectedMime || null,
      claimed_extension: result.indicators.claimedExtension || null,
      file_size_bytes: result.indicators.fileSizeBytes || null,
      entropy_score: result.indicators.entropyScore || null,
      flags: result.flags,
      indicators: result.indicators,
      ai_explanation: result.aiExplanation,
      quarantine_status: result.quarantineStatus || 'analyzed_safe',
      is_quarantined: result.quarantineStatus === 'quarantined',
      created_at: result.timestamp,
    });

    if (error) {
      console.warn('Supabase scan_records insert error:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('Failed to sync scan record to Supabase:', err.message);
    return false;
  }
}

export async function persistCommunityReportToSupabase(report: CommunityThreatReport) {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('community_threats').insert({
      id: report.id,
      title: report.title,
      threat_type: report.threatType,
      sanitized_snippet: report.sanitizedSnippet,
      risk_severity: report.riskSeverity,
      verified_by_admin: report.verifiedByAdmin,
      upvotes: report.upvotes,
      tags: report.tags,
      reporting_reason: report.reportingReason,
      created_at: report.createdAt,
    });
    if (error) {
      console.warn('Supabase community_threats insert error:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('Failed to sync community report to Supabase:', err.message);
    return false;
  }
}

export async function persistIncidentToSupabase(incident: IncidentReport) {
  const client = getSupabaseClient();
  if (!client) return false;

  try {
    const { error } = await client.from('incident_cases').insert({
      id: incident.id,
      scan_id: incident.scanId || null,
      threat_category: incident.threatCategory,
      financial_loss_amount: incident.financialLossAmount || 0,
      transaction_reference: incident.transactionReference || null,
      suspect_contact_or_handle: incident.suspectContactOrHandle || null,
      cybercell_portal_filed: incident.cyberCellPortalFiled,
      cybercell_ack_number: incident.cyberCellAckNumber || null,
      bank_notified: incident.bankNotified,
      status: incident.status,
      checklist: incident.checklist,
      created_at: incident.createdAt,
    });
    if (error) {
      console.warn('Supabase incident_cases insert error:', error.message);
      return false;
    }
    return true;
  } catch (err: any) {
    console.warn('Failed to sync incident case to Supabase:', err.message);
    return false;
  }
}
