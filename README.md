# FDRE Sovereign GovTech: QR-Based "Charter Mark" Citizen Feedback & Civil Servant KPI Tracker

[![GovTech CI](https://github.com/Yohanneswz/charter-mark-kpi/actions/workflows/ci.yml/badge.svg)](https://github.com/Yohanneswz/charter-mark-kpi/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Compliance](https://img.shields.io/badge/Legal%20Compliance-Proclamation%201353%2F2025-gold.svg)](docs/statutory_formulas.md)
[![Strategy](https://img.shields.io/badge/National%20Strategy-Digital%20Ethiopia%202030-teal.svg)](https://mint.gov.et/)

> **Statutory Compliance**: Built in strict accordance with the **Federal Civil Servants Proclamation No. 1353/2025** (Sections 42 & 43) and the **Digital Ethiopia 2030 (DE2030)** National Strategy.

---

## 🏛️ Executive Summary

This sovereign e-Government system replaces subjective, paper-based annual reviews with an empirical, real-time service tracking architecture. Frontline civil servant performance is dynamically calculated using a statutory **60% Empirical Desk Performance + 40% Structured Supervisor Evaluation** formula, directly governing biennial (2-year) salary step increment eligibility (+7.5%).

---

## 📚 Technical Documentation & Guides

* 📑 **[REST API Specification](docs/api.md)**: Full endpoint reference, request/response schemas, and authentication models.
* ⚖️ **[Statutory Formulas & Legal Rules](docs/statutory_formulas.md)**: Mathematical definitions for 60/40 splits, SLA variances, and step increments.
* 🛡️ **[Security Policy & Disclosures](SECURITY.md)**: Vulnerability disclosure and privacy-preserving identifier protocols.
* 📄 **[MIT License](LICENSE)**: Open-source terms and permissions.

---

## 🚀 Key Modules & Architecture

The system is decoupled into isolated, production-grade interfaces to prevent unauthorized access while maintaining real-time operational synchronization:

1. **🏛️ Physical Acrylic Desk Stands Directory (`/stands`)**
   - High-contrast, scannable ISO/IEC 18004 Level-M QR stands for all municipal service counters.
   - Dual-mode network target switching (Wi-Fi LAN IP or Localhost).
   - Built-in interactive **2G USSD (*884*30X#) Gateway Simulator** for non-smartphone feature phones (DE2030 compliance).

2. **📱 Citizen Mobile Counter (`/desk/:windowNum`)**
   - Parametric counter isolation (Window #1 to #4).
   - **Fayda National Digital ID (FIN)** integration with privacy-preserving hashing.
   - Statutory fee transparency (e.g. $0.00\,\text{ETB}$ for free services vs official fees) to prevent extortion.
   - Real-time SLA stopwatch with visual threshold progress bars.
   - **Secret 4-Digit Completion PIN**: Citizens receive a confidential PIN upon check-in, preventing clerks from closing tickets prematurely before handing back completed documents.
   - Instant digital slip receipt with verification QR code.

3. **📺 Public Waiting Hall Overhead TV Display (`/display`)**
   - Live queue status monitor across all windows (`NOW SERVING`, `READY / IDLE`, `ON OFFICIAL BREAK`).
   - Native Web Audio two-tone synthesized government announcement chime (`Ding-Dong`: $587.33\,\text{Hz} \rightarrow 880.00\,\text{Hz}$).
   - Bilingual Speech Synthesis audio announcements: *"Ticket [X], please proceed to Window [Y]"*.
   - Recent completed transaction ticker and anti-corruption hotline disclosure (`8199`).

4. **💻 Frontline Civil Servant Workbench (`/clerk`)**
   - Authenticated terminal strictly bound to the logged-in officer and window.
   - Real-time auto-polling (every 2 seconds) with arrival chime when a citizen scans at the desk.
   - Required document verification checklist.
   - Statutory session hold/pause (e.g. document photocopying, bank deposit) and window transfers.
   - PIN verification to conclude transactions and record empirical metrics.

5. **⚖️ Sub-City Operations & Anti-Corruption Center (`/operations`)**
   - Executive dashboard monitoring live counter matrices, turnaround SLA adherence, and active queues.
   - **Anti-Corruption Sentinel**: Automatic urgent incident flags triggered by citizen reports of irregular fee solicitation (`BRIBE_SOLICITED`) or absenteeism (`OFFICER_ABSENT`).
   - Statutory disciplinary sanction triage pursuant to Proclamation No. 1353/2025.
   - Full CSV audit log export.

6. **📊 Civil Service Commission 2-Year Appraisal Engine (`/appraisal`)**
   - Aggregates 4 consecutive semesters of empirical transaction data.
   - Calculates the **60% Objective Score** (Volume Quota [25 pts] + SLA Compliance [20 pts] + Citizen Ratings [15 pts]).
   - Records the **40% Structured Supervisor Score** across 4 statutory dimensions (Policy Alignment [10 pts] + Ethical Integrity [10 pts] + Punctuality/Attendance [10 pts] + Problem-Solving [10 pts]).
   - Automatically determines eligibility for the **+7.5% Salary Step Increment** against the statutory $\ge 80.0\%$ threshold.
   - Issues cryptographic Civil Service Commission completion certificates.

7. **🛡️ Public Cryptographic Verification Portal (`/verify`)**
   - Open verification engine for citizens, auditors, and embassies.
   - Validates **Two-Year Appraisal Certificates** via SHA-256 digital signature, serial number, or employee ID.
   - Validates **Citizen Service Ticket Slips** via ticket number (e.g. `REN-101`, `TC-101`).

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite, Lucide Icons, Canvas QR Generator.
- **Backend**: Node.js, Express, TypeScript (`tsx`).
- **Database**: SQLite3 via `better-sqlite3` running in high-concurrency WAL mode (`charter_mark.db`).
- **Calendar & Time**: Dual Ge'ez 13-month calendar (including Pagume) and Ethiopian 12-hour local clock.
- **Languages**: Trilingual support for Amharic (**አማርኛ**), English, and Afaan Oromoo.

---

## 📦 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- npm (v9.0.0 or higher)

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/Yohanneswz/charter-mark-kpi.git
cd charter-mark-kpi

# Install dependencies
npm install
```

### 3. Running the Application
```bash
# Terminal 1: Start Express API Backend (Port 3001)
npx tsx watch server/server.ts

# Terminal 2: Start Vite Frontend (Port 3000)
npm run dev -- --host 0.0.0.0 --port 3000
```

Open your browser at **[http://localhost:3000](http://localhost:3000)**.

---

## 👥 Pre-Configured Test Credentials

| Role | Username | Password | Assigned Counter / Duty |
| :--- | :--- | :--- | :--- |
| **Clerk** | `almaz` | `pass123` | Window #1: Trade & Business Licensing |
| **Clerk** | `dawit` | `pass123` | Window #2: Vital Events & Kebele Civil Status |
| **Clerk** | `alemayehu` | `pass123` | Window #3: Revenues & Tax Clearance |
| **Clerk** | `rahel` | `pass123` | Window #4: Document Authentication |
| **Bureau Director** | `director` | `admin123` | Sub-City Operations & Anti-Corruption Center |
| **CSC Auditor** | `auditor` | `admin123` | Civil Service Commission Appraisal & Salary Engine |

---

## 📜 Statutory Legal Basis
- **Proclamation No. 1353/2025**: *Federal Civil Servants Proclamation*, Federal Negarit Gazeta, Addis Ababa, Ethiopia.
- **Digital Ethiopia 2030 (DE2030)**: National digital transformation strategy for inclusive government services.
