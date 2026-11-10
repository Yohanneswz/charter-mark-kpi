# REST API Specification: Charter Mark & Civil Servant KPI Tracker

The Charter Mark & KPI Tracker exposes a full REST API for municipal front-desks, waiting hall overhead displays, supervisor dashboards, Civil Service Commission auditors, and USSD gateways.

---

## 1. Authentication Endpoints

### `POST /api/auth/login`
Authenticates frontline clerks, sub-city directors, and CSC auditors.
- **Request Body**:
  ```json
  {
    "username": "almaz",
    "password": "pass123"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "token": "charter-token-usr-almaz-...",
    "user": {
      "id": "usr-almaz",
      "username": "almaz",
      "role": "CLERK",
      "officerId": "off-102",
      "fullName": "Almaz Bekele",
      "email": "almaz.b@bole.gov.et"
    }
  }
  ```

---

## 2. Institutional Metadata Endpoints

### `GET /api/offices`
Retrieves the designated woreda/sub-city one-stop service center profile.

### `GET /api/officers`
Returns all active frontline officers, their JEG grades, assigned window numbers, and live presence status (`ACTIVE`, `ON_BREAK`, `OFFLINE`).

### `GET /api/services`
Returns all statutory charter services, officially promulgated fees in ETB, and mandatory document prerequisite checklists.

---

## 3. Real-Time Service Queue & Turnaround

### `GET /api/display/now-serving`
High-concurrency endpoint polled by the waiting hall overhead TV screen every 2 seconds.
- **Response `200 OK`**:
  ```json
  {
    "windows": [
      {
        "id": "ses-...",
        "ticket_number": "TR-101",
        "window_num": 1,
        "officer_name_en": "Almaz Bekele",
        "officer_name_am": "አልማዝ በቀለ",
        "officer_status": "ACTIVE",
        "service_name_en": "Annual Trade License Renewal",
        "standard_duration_min": 35
      }
    ],
    "recentCompleted": [ ... ],
    "timestamp": "2026-11-10T09:00:00Z"
  }
  ```

---

## 4. Session & Citizen Feedback Lifecycle

### `POST /api/sessions/start`
Starts a citizen session via QR scan, self-service counter, or walk-in.
- **Request Body**:
  ```json
  {
    "serviceId": "srv-02",
    "officerId": "off-102",
    "windowNum": 1,
    "citizenPhone": "0911234567",
    "faydaId": "1094-8832-7719"
  }
  ```
- **Response `201 Created`**:
  Generates a sequential ticket number (`TR-101`), hashes the Fayda FIN (`FIN-2025-XXXX`), and generates a **secret 4-digit PIN** (`completion_pin`).

### `POST /api/sessions/:id/complete`
Concludes a service session upon entering the citizen's 4-digit PIN and records verified documents, citizen rating (1–5 stars), and ethical compliance category.
- **Request Body**:
  ```json
  {
    "rating": 5,
    "complaintCategory": "NONE",
    "citizenNotes": "Documents received promptly.",
    "enteredPin": "7695",
    "verifiedDocs": ["Original Trade License", "Commercial Register Copy"]
  }
  ```

### `POST /api/sessions/:id/hold`
Pauses statutory SLA countdown with an official justification (e.g. `Pending Document Photocopy` or `Bank Deposit`).

### `POST /api/sessions/:id/resume`
Resumes an on-hold session.

### `POST /api/sessions/:id/transfer`
Transfers an active citizen ticket to another service window.

---

## 5. Anti-Corruption & Disciplinary Oversight

### `GET /api/alerts`
Returns active ethics alerts (`BRIBE_REPORTED`, `ABSENTEEISM_SPIKE`, `EXTREME_SLA_BREACH`).

### `POST /api/alerts/:id/sanction`
Records formal administrative reprimand or suspension under Proclamation No. 1353/2025.

---

## 6. Two-Year Appraisal & Increment Verification

### `GET /api/appraisals/:officerId`
Calculates empirical 4-semester scores, combining the 60% objective desk performance with 40% supervisor review.

### `GET /api/certificates/verify/:query`
Public cryptographic verification endpoint. Validates SHA-256 HMAC digital signatures for:
- Two-Year Appraisal Certificates (by hash, serial number, or employee ID).
- Citizen Service Ticket Receipts (by ticket number or session ID).

---

## 7. Digital Ethiopia 2030 Feature-Phone Gateway

### `POST /api/ussd`
Simulates the `*884#` USSD gateway for 2G mobile phones.
