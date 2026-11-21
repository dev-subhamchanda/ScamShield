import dns from 'dns/promises';
import { RedirectHop } from '../types.js';

// Comprehensive private & sensitive IPv4/IPv6 ranges to block SSRF
const PRIVATE_IPV4_RANGES = [
  /^127\./,                         // Loopback (127.0.0.0/8)
  /^10\./,                          // Private Class A (10.0.0.0/8)
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // Private Class B (172.16.0.0/12)
  /^192\.168\./,                    // Private Class C (192.168.0.0/16)
  /^169\.254\./,                    // Link-local / Cloud Metadata (169.254.0.0/16)
  /^100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\./, // Carrier-grade NAT (100.64.0.0/10)
  /^0\./,                           // Current network
  /^224\./,                         // Multicast
  /^240\./,                         // Reserved
];

const PRIVATE_IPV6_RANGES = [
  /^::1$/,                          // Loopback
  /^[fF][cCdD]/,                    // Unique Local Address (fc00::/7)
  /^[fF][eE][89aAbB]/,              // Link-local (fe80::/10)
];

export function isIpBlocked(ip: string): boolean {
  if (!ip) return true;
  for (const regex of PRIVATE_IPV4_RANGES) {
    if (regex.test(ip)) return true;
  }
  for (const regex of PRIVATE_IPV6_RANGES) {
    if (regex.test(ip)) return true;
  }
  return false;
}

export interface SafeUrlCheckResult {
  isSafe: boolean;
  blockedReason?: string;
  finalUrl?: string;
  hops: RedirectHop[];
  isShortened: boolean;
  isPunycode: boolean;
  isDirectIp: boolean;
  domainAgeEstimatedDays?: number;
}

const KNOWN_URL_SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'rb.gy', 'cutt.ly', 'is.gd', 'ow.ly', 'buff.ly',
  'tiny.cc', 'bl.ink', 'shorturl.at', 'rebrandly.com'
]);

export async function validateAndTraceUrl(targetUrl: string, maxHops = 5): Promise<SafeUrlCheckResult> {
  const hops: RedirectHop[] = [];
  let currentUrl = targetUrl.trim();
  let isShortened = false;

  for (let i = 0; i < maxHops; i++) {
    let parsed: URL;
    try {
      if (!/^https?:\/\//i.test(currentUrl)) {
        currentUrl = 'http://' + currentUrl;
      }
      parsed = new URL(currentUrl);
    } catch {
      return {
        isSafe: false,
        blockedReason: 'Invalid URL format',
        hops,
        isShortened,
        isPunycode: false,
        isDirectIp: false,
      };
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        isSafe: false,
        blockedReason: `Disallowed protocol: ${parsed.protocol}. Only HTTP and HTTPS are permitted.`,
        hops,
        isShortened,
        isPunycode: false,
        isDirectIp: false,
      };
    }

    const hostname = parsed.hostname;
    const isPunycode = hostname.startsWith('xn--') || hostname.includes('.xn--');
    const isDirectIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.startsWith('[');

    if (KNOWN_URL_SHORTENERS.has(hostname.toLowerCase())) {
      isShortened = true;
    }

    // SSRF Check: resolve DNS
    let resolvedIp = '';
    try {
      const lookup = await dns.lookup(hostname);
      resolvedIp = lookup.address;
    } catch (err: any) {
      hops.push({ url: currentUrl, blocked: true });
      return {
        isSafe: false,
        blockedReason: `Failed to resolve host "${hostname}": ${err.message || 'DNS resolution failed'}`,
        hops,
        isShortened,
        isPunycode,
        isDirectIp,
      };
    }

    if (isIpBlocked(resolvedIp)) {
      hops.push({ url: currentUrl, ip: resolvedIp, blocked: true });
      return {
        isSafe: false,
        blockedReason: `SSRF Violation: Host "${hostname}" resolves to protected or internal IP: ${resolvedIp}`,
        hops,
        isShortened,
        isPunycode,
        isDirectIp,
      };
    }

    // Trace HTTP redirect hop safely using fetch with redirect: manual
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(currentUrl, {
        method: 'HEAD',
        redirect: 'manual',
        signal: controller.signal,
        headers: { 'User-Agent': 'ScamShield-SecurityInspector/1.0' },
      });
      clearTimeout(timeout);

      hops.push({
        url: currentUrl,
        status: res.status,
        ip: resolvedIp,
      });

      if ([301, 302, 303, 307, 308].includes(res.status)) {
        const location = res.headers.get('location');
        if (!location) {
          break;
        }
        currentUrl = new URL(location, currentUrl).toString();
      } else {
        // Destination reached
        break;
      }
    } catch {
      // If HEAD fails, record the hop and end tracing
      hops.push({ url: currentUrl, ip: resolvedIp });
      break;
    }
  }

  return {
    isSafe: true,
    finalUrl: currentUrl,
    hops,
    isShortened,
    isPunycode: hops.some(h => {
      try { return new URL(h.url).hostname.includes('xn--'); } catch { return false; }
    }),
    isDirectIp: hops.some(h => {
      try { return /^(\d{1,3}\.){3}\d{1,3}$/.test(new URL(h.url).hostname); } catch { return false; }
    }),
  };
}
