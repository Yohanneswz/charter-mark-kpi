# Contributing to Charter Mark Citizen Feedback & Civil Servant KPI Tracker

Thank you for your interest in contributing to the **Charter Mark KPI Tracker**! This sovereign GovTech system digitizes citizen service verification, queue tracking, and biennial civil servant performance appraisals in compliance with the **Federal Democratic Republic of Ethiopia (FDRE) Federal Civil Servants Proclamation No. 1353/2025**.

---

## 🏛️ Statutory Principles & Code Guidelines

All pull requests and modifications must uphold the core legal and design principles of the Ethiopian Civil Service:

1. **Strict 60/40 Statutory Appraisal Split**:
   - 60% of an officer's appraisal score must strictly derive from empirical counter transactions:
     - Volume Quota Efficiency: **25 points**
     - SLA Adherence / Turnaround Time: **20 points**
     - Verified Citizen Star Rating: **15 points**
   - 40% derives from qualitative supervisor evaluations across ethics, attendance, policy execution, and problem solving.

2. **Statutory Step Increment Threshold ($\ge 80.0\%$)**:
   - Under Section 42 of Proclamation No. 1353/2025, biennial salary step increments (+7.5%) require an aggregated 4-semester average score of $\ge 80.0\%$. Scores $< 80.0\%$ place the civil servant under mandatory coaching.

3. **Sovereign Anti-Corruption & Citizen Privacy Safeguards**:
   - Citizen phone numbers must always be masked (`091****882`) in UI displays.
   - Transaction completion requires the citizen's secret 4-digit PIN generated upon check-in. Clerks cannot complete a transaction without citizen verification.
   - Anti-Corruption Sentinel monitors anomalies such as transactions completed in $< 60$ seconds, excessive delays $> 50\%$ over SLA, or cluster ratings.

4. **Trilingual & Dual Calendar Standards**:
   - Any user-facing interface element should support English (`en`), Amharic (`am`), and Afaan Oromoo (`om`).
   - Timestamps and dates must be compatible with both the Ethiopian Ge'ez 13-month calendar and the Gregorian calendar.

---

## 💻 Development Workflow

### 1. Prerequisites
- Node.js $\ge 18$
- npm or yarn

### 2. Installation & Setup
```bash
# Clone the repository
git clone https://github.com/Yohanneswz/charter-mark-kpi.git
cd charter-mark-kpi

# Install dependencies
npm install

# Seed the sovereign database
npm run db:seed

# Run the automated unit test suite
npm test
```

### 3. Running Locally
```bash
# Start frontend dev server (port 3000)
npm run dev

# In a separate terminal, start backend API server (port 3001)
npm run server
```

### 4. Code Standards & Testing
- Run TypeScript verification before committing:
  ```bash
  npx tsc --noEmit
  ```
- Run tests:
  ```bash
  npm test
  ```
- Ensure zero lint or type errors before submitting your PR.

---

## 📬 Submitting a Pull Request
1. Fork the repository and create your branch from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Commit your changes with clear, semantic commit messages (e.g. `feat:`, `fix:`, `docs:`, `test:`).
3. Push to your branch and open a Pull Request against the `main` branch.
4. Follow the provided PR template and ensure all checklist items are checked.

Thank you for helping build transparent, sovereign digital infrastructure for Ethiopia! 🇪🇹
