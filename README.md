# ScamShield (v1.0 Pro)
### Cross-Platform Cyber Fraud Defense Platform
**Deterministic Security Analysis + Empathetic AI Explanations**

---

## 1. Overview & Core Philosophy
**ScamShield** protects everyday citizens, professionals, and enterprises from the modern wave of sophisticated cyber frauds:
- **Digital Arrest & Law Enforcement Impersonation** (CBI, Police, Customs fake video warrants)
- **Reverse UPI & QR Code Traps** (Deceptive "Scan to Receive Money" tricks)
- **Courier & Postal Smishing** (India Post, FedEx fake delivery failures)
- **Weaponized Documents** (PDF embedded scripts, Office VBA macros, CSV DDE formula injections)
- **Malicious Android APKs** (Fake electricity bill updates, SMS stealers, accessibility overlay abuse)
- **Malicious Windows Binaries** (PE section entropy analysis, masqueraded `.exe` extensions)

### The Architectural Boundary
1. **Deterministic Security Core**: Determines if a file, link, or message contains malicious patterns through programmatic, rule-based static analysis. **Zero code execution on the server.**
2. **AI Explanation Engine (Google Gemini)**: Translates the technical findings and exposes social engineering psychology into calm, plain-English guidance and actionable 1-2-3 recovery steps. **The LLM never makes the binary malware verdict.**

---

## 2. The 9 Independent Core Modules

| Module | Purpose | Key Technical Safeguards |
| :--- | :--- | :--- |
| **1. Universal Threat Scanner** | Unified multi-modal ingestion (text, URL, screenshot, file). | Automatic routing, PII sanitization, in-memory stream processing. |
| **2. FileGuard** | Static document and binary inspection (PDF, DOCX, XLSX, CSV, APK, EXE). | Magic byte inspection, Shannon entropy check, VBA/DDE parser, ZIP bomb ratio limit. |
| **3. URL & QR Intelligence** | Inspects links and QR code screenshot payloads. | SSRF private IP blocker (RFC 1918 + `169.254.169.254`), hop tracer, Punycode detector. |
| **4. AI-Powered Scam Explanation** | Cognitive translation of technical telemetry via Gemini. | Strict prompt injection boundaries (`<untrusted_content_to_analyze>`), structured JSON schemas. |
| **5. Personal Security Dashboard** | Personal risk posture and chronological audit history. | Client-side and database-synced audit trail with deterministic score breakdown. |
| **6. Community Threat Intelligence** | Crowdsourced threat warning network. | Upvoting system, automatic PII masking prior to storage, admin verification badges. |
| **7. Scam Campaign Detection** | Syndicated fraud ring clustering. | Correlates domain suffixes, UPI handles, and hash patterns across campaigns. |
| **8. Security Awareness & Incident Response** | Victim recovery workflow. | Priority 1930 Cyber Helpline launcher, 5-step checklist, dispute dossier generator. |
| **9. Admin Moderation Dashboard** | Administrative controls & security telemetry. | Community queue approval/rejection, engine health metrics, immutable audit logs. |

---

## 3. UI Design System ("Midnight Indigo")
- **Base Canvas**: `#090B10`
- **Surface Elevation**: `#11151E`
- **Elevated States**: `#1B2230`
- **Crisp Borders**: `#30394B` (1px hairlines)
- **Brand Accents**: Primary `#818CF8`, Deep `#6366F1`
- **Semantic Status**: Success (`#22C55E`), Warning (`#F59E0B`), Danger (`#EF4444`), Info (`#38BDF8`)
- **Icons**: Font Awesome exclusively (`@fortawesome/react-fontawesome`)
- **Typography**: Inter (Body) + Outfit (Headings)

---

## 4. Security Verification & Testing
Run the complete deterministic test suite:
```bash
npm run test:security
```
This automatically verifies:
1. **SSRF Guard**: Confirms blocks on `127.0.0.1` and cloud metadata IP `169.254.169.254`.
2. **Magic Byte Masquerade**: Detects `.exe` binaries renamed to `.pdf`.
3. **Social Engineering Heuristics**: Validates Digital Arrest and Reverse UPI detection.
4. **CSV DDE Formula Injection**: Detects malicious execution formulas (`=cmd|...`).
5. **PII Redactor**: Confirms masking of phone numbers, payment cards, and bank handles.

---

## 5. Development & Build

### Running Locally
1. **Build both Client and Server**:
   ```bash
   npm run build
   ```
2. **Start the API Engine**:
   ```bash
   npm run dev:server
   ```
3. **Start the Vite Frontend**:
   ```bash
   npm run dev:client
   ```

### Cloudflare Deployment
- **Frontend SPA**: Deployed on Cloudflare Pages using `client/dist`, with `client/public/_redirects` handling single-page routing and `client/public/_headers` enforcing strict CSP, HSTS, and X-Content-Type-Options.
- **Backend / Edge Proxy**: Configured via `wrangler.jsonc`.

---
*Built by Cybersecurity Expert & Full-Stack Engineering Team for ScamShield.*
