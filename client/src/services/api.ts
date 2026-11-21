import type {
  AnalysisResult,
  AuditLogEntry,
  CommunityThreatReport,
  ScamCampaign,
  UserProfile,
} from '../types';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('scamshield_token');
  if (token) {
    return { Authorization: `Bearer ${token}` };
  }
  return {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers || {});
  const authHeaders = getAuthHeader();

  for (const [key, value] of Object.entries(authHeaders)) {
    if (!headers.has(key)) {
      headers.set(key, value);
    }
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  const res = await fetch(endpoint, config);
  const data = await res.json().catch(() => ({}));

  if (!res.ok || (data && data.success === false)) {
    const errorMsg = data?.error || `Request to ${endpoint} failed with status ${res.status}`;
    throw new ApiError(errorMsg, res.status);
  }

  return data as T;
}

export const api = {
  // Authentication
  auth: {
    login: async (email: string, password: string): Promise<{ user: UserProfile; token: string }> => {
      return request('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
    },
    signup: async (
      email: string,
      password: string,
      displayName?: string
    ): Promise<{ user: UserProfile; token: string }> => {
      return request('/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName }),
      });
    },
    demo: async (role: 'citizen' | 'analyst' | 'admin'): Promise<{ user: UserProfile; token: string }> => {
      return request('/api/v1/auth/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
    },
    me: async (): Promise<{ user: UserProfile }> => {
      return request('/api/v1/auth/me');
    },
  },

  // Threat Scanner
  scan: {
    universal: async (formData: FormData): Promise<{ result: AnalysisResult }> => {
      return request('/api/v1/scan/universal', {
        method: 'POST',
        body: formData,
      });
    },
    getHistory: async (): Promise<{ history: AnalysisResult[] }> => {
      return request('/api/v1/scan/history');
    },
  },

  // Community Intel
  community: {
    getThreats: async (): Promise<{ reports: CommunityThreatReport[] }> => {
      return request('/api/v1/community/threats');
    },
    submitReport: async (payload: {
      title: string;
      threatType: string;
      content: string;
      reportingReason?: string;
    }): Promise<{ report: CommunityThreatReport }> => {
      return request('/api/v1/community/threats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    },
    vote: async (reportId: string): Promise<{ upvotes: number }> => {
      return request(`/api/v1/community/threats/${reportId}/vote`, {
        method: 'POST',
      });
    },
  },

  // Campaigns & Statistics
  campaigns: {
    getAll: async (): Promise<{ campaigns: ScamCampaign[] }> => {
      return request('/api/v1/intelligence/campaigns');
    },
    getStats: async (): Promise<{
      stats: {
        totalThreatsScanned: number;
        activeThreatsBlocked: number;
        activeCampaignsTracked: number;
        verifiedCommunityReports: number;
      };
    }> => {
      return request('/api/v1/intelligence/stats');
    },
  },

  // Incident Response
  incident: {
    getGuide: async (threatType: string) => {
      return request(`/api/v1/incident/guide/${threatType}`);
    },
    submitReport: async (payload: {
      threatCategory: string;
      financialLossAmount: number;
      transactionReference?: string;
      suspectContactOrHandle?: string;
    }): Promise<{ incident: { id: string } }> => {
      return request('/api/v1/incident/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    },
  },

  // Admin Controls (RBAC Protected)
  admin: {
    getModerationQueue: async (): Promise<{ reports: CommunityThreatReport[] }> => {
      return request('/api/v1/admin/moderation');
    },
    reviewReport: async (
      reportId: string,
      action: 'approve' | 'reject'
    ): Promise<{ report: CommunityThreatReport }> => {
      return request('/api/v1/admin/moderation/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, action }),
      });
    },
    getAuditLogs: async (): Promise<{ auditLogs: AuditLogEntry[] }> => {
      return request('/api/v1/admin/audit-logs');
    },
  },
};
