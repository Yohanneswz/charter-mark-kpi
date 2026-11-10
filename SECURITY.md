# Security Policy & Vulnerability Disclosure

## 🏛️ Sovereign GovTech Security Commitment

The **Charter Mark Citizen Feedback & Civil Servant KPI Tracker** processes sovereign citizen interactions, statutory feedback, and Civil Service Commission employment records. We adhere to the highest digital governance and data protection standards under **Digital Ethiopia 2030 (DE2030)**.

---

## 🔒 Security Principles

1. **Privacy-Preserving Citizen Identifiers**:
   - Phone numbers and Fayda National Digital IDs (FIN) are never stored in plaintext within operational ledgers. All citizen identifiers undergo one-way cryptographic hashing before disk persistence.

2. **Secret Completion PIN Protocol**:
   - Every service session generates a cryptographically random 4-digit PIN stored on the citizen's mobile device or USSD slip.
   - Frontline personnel cannot unilaterally close a ticket without obtaining this PIN from the citizen, stopping ghost transaction fabrication.

3. **Immutable Audit Logging**:
   - All critical transitions (`SESSION_STARTED`, `SESSION_COMPLETED`, `SESSION_HELD`, `ALERT_RAISED`, `SANCTION_APPLIED`) are recorded in an append-only `audit_logs` relational table with actor attribution and ISO 8601 UTC timestamps.

4. **Role-Based Access Control (RBAC)**:
   - Frontline clerks are strictly prohibited from viewing executive operations dashboards or supervisor score submission forms.
   - Session tokens are verified on both the HTTP API layer and React router guards.

---

## 🛡️ Reporting a Vulnerability

If you discover a security vulnerability or anti-corruption bypass mechanism within this system, please do not file a public GitHub issue. 

Instead, report it directly to:
* **Email**: `john21303021@gmail.com`
* **Official Hotline**: `8199` (Ethics & Anti-Corruption Directorate)

Please include:
* Description of the potential vulnerability.
* Steps to reproduce the issue.
* Potential operational or legal impact under Proclamation No. 1353/2025.
