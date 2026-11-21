# ScamShield (v2.0 Enterprise)
### Next-Generation Cyber Fraud Defense Platform
**Deterministic Security Analysis + Empathetic LLM Explanations + Zero-Trust RBAC**

[![Oxlint Quality](https://img.shields.io/badge/Oxlint-0%20Errors%20%7C%200%20Warnings-22c55e?style=flat-square)](https://github.com/oxc-project/oxlint)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict%20Type%20Safe-3178c6?style=flat-square)](https://www.typescriptlang.org/)
[![UI Design](https://img.shields.io/badge/Design%20System-Modern%20Precision-06b6d4?style=flat-square)](#3-modern-precision-design-system)
[![Security](https://img.shields.io/badge/Zero--Execution-Static%20Sandbox-818cf8?style=flat-square)](#2-security-architecture--deterministic-core)

---

## 1. Executive Summary & Philosophy

**ScamShield** is a cross-platform cyber fraud defense platform engineered to protect citizens, security analysts, and enterprise teams from modern social engineering, fraudulent payment traps, weaponized documents, and malicious binaries.

### The Non-Negotiable Architectural Boundary
Modern security platforms frequently make the mistake of trusting probabilistic Large Language Models (LLMs) to determine whether an executable or script is safe. ScamShield enforces a strict, decoupled boundary:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        UNTRUSTED INCOMING PAYLOAD                      │
│             (Text, Screenshot, URL, QR Code, PDF, Office, APK, EXE)     │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │
                                     ▼
        ┌─────────────────────────────────────────────────────────┐
        │        DETERMINISTIC SECURITY CORE (ZERO-EXECUTION)      │
        │  • Magic Byte Header Verification (True MIME)           │
        │  • Shannon Entropy Calculation (>7.2 flags packing)     │
        │  • SSRF RFC1918 & Cloud Metadata Filter                 │
        │  • Office VBA Macro & CSV DDE Injection Heuristics      │
        │  • APK Manifest Permission & Suspicious API Scanners    │
        │  • Zero-Host Code Execution Guarantee                   │
        └────────────────────────────┬────────────────────────────┘
                                     │ Deterministic Verdict & Forensic Telemetry
                                     ▼
        ┌─────────────────────────────────────────────────────────┐
        │       COGNITIVE EXPLANATION ENGINE (GOOGLE GEMINI)      │
        │  • Translates technical indicators into plain English   │
        │  • Demystifies psychological coercion & urgency tactics │
        │  • Generates empathetic 1-2-3 recovery action steps     │
        │  • Safe Fallback Engine if Gemini is offline            │
        └────────────────────────────┬────────────────────────────┘
                                     │
                                     ▼
        ┌─────────────────────────────────────────────────────────┐
        │         MODERN PRECISION PRESENTATION LAYER (REACT)     │
        │  • Zero-Trust Role-Based Access Control (RBAC)          │
        │  • Real-Time Threat Indicator Badges                    │
        │  • Golden Hour Incident Response Workflow               │
        └─────────────────────────────────────────────────────────┘
```

1. **Deterministic Core (Authoritative)**: Programmatic, rule-based static analysis makes 100% of the risk scoring, severity ratings, and binary safety verdicts. Files are never executed on the host.
2. **Empathetic AI Explanations (Cognitive)**: Google Gemini (with an offline deterministic fallback engine) takes the forensic flags and translates them into understandable, non-technical guidance and actionable recovery advice. The LLM never makes the binary malware verdict.

---

## 2. Security Architecture & Threat Defense Engine

### A. Universal Multi-Modal Ingestion
ScamShield accepts inputs across four primary channels:
- **Plain Text & Messages**: Detects Indian & global cyber fraud patterns including *Digital Arrest*, *Reverse UPI QR codes*, *Electricity Bill cut-off smishing*, *Part-time Job scams*, and *Courier Delivery failures*.
- **URLs & Links**: Automated protocol normalization, Punycode/IDN homograph detection, and redirect unravelling.
- **QR Codes & Screenshots**: In-memory ZXing QR matrix extraction and OCR payload inspection.
- **Binary & Document Uploads**: In-memory inspection of PDF, DOCX, XLSX, CSV, APK, and EXE files.

### B. Static Binary & Document Analysis (FileGuard)
- **Magic Bytes Validation**: Enforces true file signatures regardless of spoofed extensions (e.g. an `.exe` disguised as `.pdf` is flagged immediately with 100/100 critical severity).
- **Shannon Entropy Engine**: Calculates byte distribution entropy on Windows PE binaries. Entropy $\ge 7.20$ triggers automated packed/obfuscated malware classification.
- **CSV DDE Formula Injection Guard**: Detects weaponized formulas (`=cmd|...`, `@SUM(1+1)*cmd|...`, `-2+3*cmd|...`, `+powershell|...`) that attempt remote command execution upon spreadsheet open.
- **Office OpenXML Macro Scanner**: Unzips and inspects internal structures for `vbaProject.bin` and automated auto-exec macros (`AutoOpen`, `Workbook_Open`).
- **ZIP Bomb Mitigations**: Strict decompression ratio enforcement ($< 100:1$) with an uncompressed upper threshold of 100 MB to prevent resource exhaustion attacks.

### C. Network & SSRF Defenses
- **Private Subnet Enforcement**: Resolves outbound hostnames against DNS and blocks requests targeting RFC 1918 subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), loopback (`127.0.0.1`), link-local (`169.254.0.0/16`), and cloud instance metadata endpoints (`169.254.169.254`).
- **Punycode De-obfuscation**: Unmasks spoofed internationalized domain names (IDN) used in homograph phishing attacks.

### D. PII Masking & Privacy Shield
Before any text, OCR payload, or community report is logged or sent to the LLM/database:
- Phone numbers, Aadhaar numbers, PAN cards, credit cards, and UPI IDs are redacted with secure cryptonym placeholders (`[REDACTED_PHONE]`, `[REDACTED_PAN]`, `[REDACTED_UPI]`).

---

## 3. Modern Precision Design System

ScamShield utilizes the **Cyber Graphite + Electric Cyan** visual identity designed for modern cybersecurity operations:

| Token | Dark Mode (Default) | Light Mode | Purpose |
| :--- | :--- | :--- | :--- |
| **Canvas Background** | `#090D12` | `#F7F9FC` | Clean neutral canvas foundation |
| **Primary Surface** | `#111923` | `#FFFFFF` | Core application cards and panels |
| **Elevated Surface** | `#1B2733` | `#F1F5F9` | Modals, dropdowns, and hover states |
| **Crisp Border** | `#293541` | `#DCE4EC` | 1px hairline structural separation |
| **Primary Accent** | `#22D3EE` | `#0891B2` | High-impact active states and brand accents |
| **Accent Hover** | `#06B6D4` | `#0E7490` | Interactive states |
| **Primary Text** | `#F1F5F9` | `#0F172A` | High-contrast body typography |
| **Muted Text** | `#64748B` | `#64748B` | Secondary labels and metadata |

### Typography & Iconography
- **Body & Controls**: Clean neo-grotesque sans-serif with tabular numeric alignment for forensic data.
- **Headings & Badges**: Outfit / Space Grotesk.
- **Iconography**: 100% pure `lucide-react` with unified `1.75px` stroke weights and purposeful semantic coloring.

---

## 4. The 9 Independent Architectural Modules

1. **Universal Threat Scanner**: Multi-modal ingestion interface with instant static routing and real-time risk breakdown.
2. **FileGuard (Document & Binary Security)**: Static inspector for documents, archives, APKs, and PE executables.
3. **URL & QR Intelligence**: Redirection tracer, homograph detector, and safe SSRF-guarded fetcher.
4. **AI Scam Explainer**: Empathetic translation of technical indicators via Google Gemini with deterministic offline fallback.
5. **Personal Security Dashboard**: Chronological scan history, risk breakdown, and individual safety metrics.
6. **Community Threat Intelligence**: Crowdsourced threat warning network with upvoting and analyst verification badges.
7. **Scam Campaign Detection**: Correlation engine grouping recurring syndicate indicators (UPI handles, domains, keywords).
8. **Security Awareness & Incident Response**: "Golden Hour" victim triage protocol with direct National Cyber Helpline (1930) connection and dispute dossier generation.
9. **Admin Moderation & Audit Console**: Role-gated interface for queue moderation, engine telemetry, and immutable audit logs.

---

## 5. Role-Based Access Control (RBAC)

ScamShield implements cryptographic JWT authentication (PBKDF2 password hashing with salt) and role enforcement:

| Role | Access Scope | Protected Endpoints |
| :--- | :--- | :--- |
| `citizen` | Universal Scanner, Personal History, Scam Encyclopedia, Incident Response, Community Reporting | Public + Authenticated User Routes |
| `security_analyst` | All Citizen features + Advanced Campaign Correlation, Elevated Threat Flagging | Public + Authenticated User Routes |
| `admin` | Full System Access: Community Moderation Queue, Queue Approval/Rejection, Immutable Security Audit Logs | Enforced via `requireAdmin` (401/403) |

---

## 6. Project Structure & Code Quality

```
GU-PromptWars/
├── client/                     # Vite + React + TypeScript Frontend
│   ├── src/
│   │   ├── components/         # Modular presentation components
│   │   │   ├── Admin/          # Admin moderation dashboard
│   │   │   ├── Auth/           # AuthPortal modal & form handlers
│   │   │   ├── Campaigns/      # Campaign correlation clusters
│   │   │   ├── Community/      # Community intelligence feed
│   │   │   ├── Dashboard/      # Personal security dashboard
│   │   │   ├── Encyclopedia/   # Scam patterns knowledge base
│   │   │   ├── Incident/       # Golden hour incident response
│   │   │   ├── Scanner/        # Universal threat scanner & cards
│   │   │   └── UI/             # Buttons, badges, modals, ErrorBoundary
│   │   ├── context/            # AuthContext, ThemeContext, useAuth, useTheme
│   │   ├── services/           # Dedicated API Client (api.ts) with Bearer token injection
│   │   ├── types/              # Strict TypeScript interfaces
│   │   └── App.tsx             # Root component with ErrorBoundary wrapping
│   └── .oxlintrc.json          # Oxlint configuration (0 errors, 0 warnings)
│
├── server/                     # Express + TypeScript Security Engine
│   ├── src/
│   │   ├── auth/               # User authentication & PBKDF2/JWT vault
│   │   ├── community/          # Community intelligence data layer
│   │   ├── middleware/         # authMiddleware (authenticateJwt, requireAdmin)
│   │   ├── routes/             # Modularized API endpoints
│   │   ├── schemas/            # Zod input validation schemas
│   │   ├── security/           # Deterministic parsers (magicBytes, PE entropy, DDE, SSRF, PII)
│   │   ├── supabaseClient.ts   # Supabase client with RLS support
│   │   ├── testApiE2E.ts       # 11-step comprehensive E2E test suite
│   │   └── index.ts            # Central Express application entry point
│   └── package.json
└── README.md
```

### Code Quality Standards
- **Oxlint Clean**: Verified with `0 errors` and `0 warnings` across all 40 files in the project.
- **Fast Refresh Compliant**: Context providers and hooks strictly separated to prevent unnecessary re-mounts.
- **No Cascading Renders**: Dynamic tab resolution and memoized callbacks prevent cascading state loops.
- **Type Safety**: Built with strict TypeScript with zero `any` shortcuts in application business logic.

---

## 7. Verification & Testing

### Running the End-to-End Test Suite
Run the 11-point automated verification suite:

```bash
cd server
npm test
```

### Verified Scenarios:
1. **Health & Engine Readiness**: Verifies core deterministic modules are online.
2. **Digital Arrest Threat Detection**: Tests legal threat heuristics and plain-language explanation generation.
3. **Reverse UPI QR Traps**: Validates detection of deceptive payment collection schemes.
4. **SSRF Guard Protection**: Probes loopback (`127.0.0.1`) and cloud metadata (`169.254.169.254`) and confirms HTTP blocking.
5. **CSV DDE Formula Injection**: Confirms detection of executable formula patterns.
6. **Magic Byte Masquerade**: Verifies an `.exe` disguised as `.pdf` is detected via PE header analysis.
7. **Personal Audit History**: Verifies retrieval and formatting of prior scans.
8. **Community Intelligence**: Submits a report and executes community voting.
9. **Campaign Correlation Engine**: Aggregates active fraud syndicates and platform telemetry.
10. **Incident Response Filing**: Files an incident case and receives the 5-step recovery checklist.
11. **RBAC & Admin Moderation**: Verifies unauthenticated calls to `/api/v1/admin/*` are blocked with HTTP 401/403, and administrative approval succeeds with audit logging.

---

## 8. Installation & Local Development

### Prerequisites
- Node.js $\ge 18.0.0$
- npm $\ge 9.0.0$

### 1. Clone & Install Dependencies
```bash
# Clone the repository
git clone <repository-url>
cd GU-PromptWars

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables
Create `.env` in `server/`:
```env
PORT=4000
NODE_ENV=development
JWT_SECRET=scamshield-super-secret-production-token-key-2026

# Optional: Google Gemini API Key (Offline fallback engages automatically if omitted)
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Supabase Database Sync (In-memory storage engages automatically if omitted)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-supabase-service-key
```

### 3. Start Development Servers
In terminal 1 (Backend API Engine):
```bash
cd server
npm run dev
```

In terminal 2 (Vite Frontend):
```bash
cd client
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Demo Credentials (Pre-seeded)
For instant evaluation, the platform includes three pre-configured accounts:
- **Citizen Account**: `citizen@scamshield.org` / `Citizen123!`
- **Security Analyst Account**: `analyst@scamshield.org` / `Analyst123!`
- **Administrator Account**: `admin@scamshield.org` / `Admin123!`

---

## 9. Production Build & Deployment

### Production Compilation
```bash
# Compile server TypeScript
cd server && npm run build

# Compile client Vite distribution
cd ../client && npm run build
```

### Cloudflare Deployment
- **Frontend SPA**: Deployed on Cloudflare Pages using `client/dist`. Includes `_redirects` for client-side single page routing and `_headers` configuring strict Content Security Policy (CSP), HTTP Strict Transport Security (HSTS), and `X-Frame-Options: DENY`.
- **Backend**: Can be hosted as an isolated Node.js container or proxied behind Cloudflare Workers using `wrangler.jsonc`.

---

## 10. License & Credits

Developed with precision by the **ScamShield Security Engineering Team**. Built for the global cyber safety community to make digital life resilient, transparent, and secure.
