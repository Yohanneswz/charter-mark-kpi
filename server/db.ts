// Enhanced Production-Grade Relational Database Schema under Proclamation No. 1353/2025
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'charter_mark.db');
export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL, -- 'CLERK', 'DIRECTOR', 'AUDITOR'
      officer_id TEXT,
      full_name TEXT NOT NULL,
      email TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (officer_id) REFERENCES officers(id)
    );

    CREATE TABLE IF NOT EXISTS offices (
      id TEXT PRIMARY KEY,
      name_en TEXT NOT NULL,
      name_am TEXT NOT NULL,
      name_or TEXT NOT NULL,
      region TEXT NOT NULL,
      city TEXT NOT NULL,
      sub_city TEXT NOT NULL,
      woreda TEXT NOT NULL,
      center_type TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS officers (
      id TEXT PRIMARY KEY,
      employee_id TEXT UNIQUE NOT NULL,
      full_name_en TEXT NOT NULL,
      full_name_am TEXT NOT NULL,
      full_name_or TEXT NOT NULL,
      assigned_window_num INTEGER NOT NULL,
      jeg_grade_code TEXT NOT NULL,
      base_salary_etb REAL NOT NULL,
      department_en TEXT NOT NULL,
      department_am TEXT NOT NULL,
      photo_url TEXT,
      status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'ON_BREAK', 'HOLD', 'OFFLINE'
      status_reason TEXT,
      phone TEXT
    );

    CREATE TABLE IF NOT EXISTS charter_services (
      id TEXT PRIMARY KEY,
      service_code TEXT UNIQUE NOT NULL,
      name_en TEXT NOT NULL,
      name_am TEXT NOT NULL,
      name_or TEXT NOT NULL,
      standard_duration_min INTEGER NOT NULL,
      official_fee_etb REAL NOT NULL,
      category TEXT NOT NULL,
      required_docs_json TEXT
    );

    CREATE TABLE IF NOT EXISTS service_sessions (
      id TEXT PRIMARY KEY,
      ticket_number TEXT NOT NULL,
      service_id TEXT NOT NULL,
      officer_id TEXT NOT NULL,
      window_num INTEGER NOT NULL,
      citizen_phone_hash TEXT NOT NULL,
      fayda_fin_hash TEXT, -- National Digital ID
      started_at TEXT NOT NULL,
      completed_at TEXT,
      actual_duration_min INTEGER,
      met_charter_sla INTEGER,
      sla_variance_min INTEGER,
      citizen_rating INTEGER,
      complaint_category TEXT NOT NULL DEFAULT 'NONE',
      citizen_notes TEXT,
      completion_pin TEXT NOT NULL,
      session_status TEXT NOT NULL DEFAULT 'IN_PROGRESS', -- 'IN_PROGRESS', 'HELD', 'TRANSFERRED', 'COMPLETED', 'CANCELLED'
      documents_verified_json TEXT,
      pause_duration_min INTEGER DEFAULT 0,
      FOREIGN KEY (service_id) REFERENCES charter_services(id),
      FOREIGN KEY (officer_id) REFERENCES officers(id)
    );

    CREATE TABLE IF NOT EXISTS escalation_alerts (
      id TEXT PRIMARY KEY,
      officer_id TEXT NOT NULL,
      officer_name_en TEXT NOT NULL,
      officer_name_am TEXT NOT NULL,
      window_num INTEGER NOT NULL,
      alert_type TEXT NOT NULL,
      incident_count INTEGER NOT NULL DEFAULT 1,
      timestamp TEXT NOT NULL,
      severity TEXT NOT NULL, -- 'URGENT', 'HIGH', 'MEDIUM'
      description_en TEXT NOT NULL,
      description_am TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE', -- 'ACTIVE', 'UNDER_INVESTIGATION', 'RESOLVED', 'DISMISSED'
      action_taken_notes TEXT,
      officer_explanation TEXT,
      sanction_imposed TEXT,
      FOREIGN KEY (officer_id) REFERENCES officers(id)
    );

    CREATE TABLE IF NOT EXISTS semester_appraisals (
      semester_id TEXT NOT NULL,
      officer_id TEXT NOT NULL,
      semester_label TEXT NOT NULL,
      total_transactions INTEGER NOT NULL,
      completed_transactions INTEGER NOT NULL,
      sla_compliance_rate REAL NOT NULL,
      average_citizen_rating REAL NOT NULL,
      volume_efficiency_score REAL NOT NULL,
      sla_compliance_score REAL NOT NULL,
      citizen_rating_score REAL NOT NULL,
      objective_score_60 REAL NOT NULL,
      supervisor_score_40 REAL NOT NULL,
      total_appraisal_score REAL NOT NULL,
      policy_score_10 REAL DEFAULT 9.0,
      ethics_score_10 REAL DEFAULT 9.0,
      attendance_score_10 REAL DEFAULT 9.0,
      problem_solving_score_10 REAL DEFAULT 9.0,
      supervisor_remarks TEXT,
      evaluated_at TEXT NOT NULL,
      PRIMARY KEY (semester_id, officer_id),
      FOREIGN KEY (officer_id) REFERENCES officers(id)
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      event_type TEXT NOT NULL,
      entity_id TEXT,
      actor TEXT,
      details_json TEXT,
      created_at TEXT NOT NULL
    );
  `);

  // Safe migrations for existing SQLite databases
  try { db.exec('ALTER TABLE officers ADD COLUMN status_reason TEXT;'); } catch (e) {}
  try { db.exec('ALTER TABLE service_sessions ADD COLUMN ticket_number TEXT;'); } catch (e) {}
  try { db.exec('ALTER TABLE service_sessions ADD COLUMN fayda_fin_hash TEXT;'); } catch (e) {}
  try { db.exec('ALTER TABLE service_sessions ADD COLUMN documents_verified_json TEXT;'); } catch (e) {}
  try { db.exec('ALTER TABLE service_sessions ADD COLUMN pause_duration_min INTEGER DEFAULT 0;'); } catch (e) {}
  try { db.exec("UPDATE service_sessions SET ticket_number = 'TK-' || SUBSTR(id, -4) WHERE ticket_number IS NULL OR ticket_number = '';"); } catch (e) {}

  const appraisalCount = db.prepare('SELECT COUNT(*) as count FROM semester_appraisals').get() as { count: number };
  if (appraisalCount.count === 0) {
    seedInitialData();
  }
}

export function seedInitialData() {
  const insertOffice = db.prepare(`
    INSERT OR REPLACE INTO offices (id, name_en, name_am, name_or, region, city, sub_city, woreda, center_type)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertOffice.run(
    'off-bole-03',
    'Bole Sub-City Woreda 03 One-Stop Public Service Center',
    'የቦሌ ክፍለ ከተማ ወረዳ 03 የአንድ ማዕከል አገልግሎት መስጫ ማዕከል',
    'Magaalaa Boolee Aanaa 03 Wiirtuu Tajaajila Tokkoo',
    'Addis Ababa',
    'Addis Ababa',
    'Bole',
    'Woreda 03',
    'Municipal One-Stop Center (አንድ ማዕከል)'
  );

  const insertOfficer = db.prepare(`
    INSERT OR REPLACE INTO officers (id, employee_id, full_name_en, full_name_am, full_name_or, assigned_window_num, jeg_grade_code, base_salary_etb, department_en, department_am, photo_url, status, status_reason, phone)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const officers = [
    ['off-102', 'ETH-CSC-3820', 'Almaz Bekele', 'አልማዝ በቀለ', 'Almaz Baqqalaa', 1, 'JEG-VIII', 11500, 'Trade & Business Licensing Desk', 'የንግድና ስራ ፈቃድ ዴስክ', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', 'ACTIVE', null, '+251 91 234 5678'],
    ['off-103', 'ETH-CSC-5104', 'Dawit Tsegaye', 'ዳዊት ፀጋዬ', 'Daawiit Tsaggaayee', 2, 'JEG-IX', 13800, 'Vital Events & Kebele Civil Status', 'የወሳኝ ኩነቶችና የነዋሪነት አገልግሎት', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', 'ACTIVE', null, '+251 91 345 6789'],
    ['off-101', 'ETH-CSC-4491', 'Alemayehu Tadesse', 'አለማየሁ ታደሰ', 'Alamayyahu Taaddasaa', 3, 'JEG-VIII', 11500, 'Revenues & Tax Clearance Desk', 'የገቢዎችና ታክስ ክሊራንስ ዴስክ', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', 'ACTIVE', null, '+251 91 123 4567'],
    ['off-104', 'ETH-CSC-2940', 'Rahel Kebede', 'ራሔል ከበደ', 'Raaheel Kabbadaa', 4, 'JEG-VII', 9800, 'Document Authentication Desk', 'የሰነዶች ማረጋገጫና ምዝገባ ዴስክ', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', 'ON_BREAK', 'Official Tea Break (10:15 - 10:30 AM)', '+251 91 456 7890']
  ];

  for (const o of officers) {
    insertOfficer.run(...o);
  }

  // Insert Users for Authentication
  const insertUser = db.prepare(`
    INSERT OR REPLACE INTO users (id, username, password_hash, role, officer_id, full_name, email, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const nowIso = new Date().toISOString();
  // Clerks
  insertUser.run('usr-almaz', 'almaz', 'pass123', 'CLERK', 'off-102', 'Almaz Bekele', 'almaz.b@bole.gov.et', nowIso);
  insertUser.run('usr-alemayehu', 'alemayehu', 'pass123', 'CLERK', 'off-101', 'Alemayehu Tadesse', 'alemayehu.t@bole.gov.et', nowIso);
  insertUser.run('usr-dawit', 'dawit', 'pass123', 'CLERK', 'off-103', 'Dawit Tsegaye', 'dawit.t@bole.gov.et', nowIso);
  insertUser.run('usr-rahel', 'rahel', 'pass123', 'CLERK', 'off-104', 'Rahel Kebede', 'rahel.k@bole.gov.et', nowIso);
  // Management & Oversight
  insertUser.run('usr-director', 'director', 'admin123', 'DIRECTOR', null, 'Dr. Yohannes Hailu (Bureau Head & Ethics Liaison)', 'director@bole.gov.et', nowIso);
  insertUser.run('usr-auditor', 'auditor', 'admin123', 'AUDITOR', null, 'W/ro Selamawit Desta (CSC Senior HR Auditor)', 'auditor@csc.gov.et', nowIso);

  const insertService = db.prepare(`
    INSERT OR REPLACE INTO charter_services (id, service_code, name_en, name_am, name_or, standard_duration_min, official_fee_etb, category, required_docs_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const services = [
    ['srv-01', 'REV-TC-01', 'Tax Clearance Certificate', 'የታክስ ክሊራንስ የምስክር ወረቀት', 'Waraqaa Ragaa Qulqullina Gibiraa', 25, 0, 'Revenue & Finance', JSON.stringify(['Valid Kebele ID or Fayda Digital ID', 'TIN Certificate (ግብር ከፋይ መለያ)', 'Previous Year Audit Clearance'])],
    ['srv-02', 'TRD-REN-02', 'Annual Trade License Renewal', 'ዓመታዊ የንግድ ስራ ፈቃድ እድሳት', 'Haroomsi Eeyyama Daldala Waggaa', 35, 150, 'Trade & Industry', JSON.stringify(['Original Trade License', 'Commercial Registration Document', 'Standard Office Lease Agreement'])],
    ['srv-03', 'VIT-UNM-03', 'Certificate of Free Marital Status (Unmarried)', 'ያላገባ የምስክር ወረቀት', 'Waraqaa Ragaa Qeenxee (Kan Hin Fuune/Heerumni)', 20, 50, 'Vital Events', JSON.stringify(['Valid Kebele ID or Fayda Digital ID', 'Two Witness Legal Declarations', 'Recent Passport Photograph'])],
    ['srv-04', 'DOC-AUTH-04', 'Power of Attorney Verification (ውክልና ማረጋገጥ)', 'የውክልና ስልጣን ማረጋገጫ', 'Mirkaneessa Bakka Bu\'iinsaa', 30, 100, 'Legal Authentication', JSON.stringify(['Principal Kebele ID / Fayda ID', 'Agent Identification Document', 'Draft Power of Attorney Document'])]
  ];

  for (const s of services) {
    insertService.run(...s);
  }

  // Insert initial sessions with Ticket Numbers
  const insertSession = db.prepare(`
    INSERT OR REPLACE INTO service_sessions (
      id, ticket_number, service_id, officer_id, window_num, citizen_phone_hash, fayda_fin_hash, started_at, completed_at, actual_duration_min, met_charter_sla, sla_variance_min, citizen_rating, complaint_category, citizen_notes, completion_pin, session_status, documents_verified_json, pause_duration_min
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = Date.now();
  insertSession.run('ses-901', 'TC-101', 'srv-01', 'off-101', 3, '091****882', 'FIN-2025-9912', new Date(now - 110 * 60000).toISOString(), new Date(now - 88 * 60000).toISOString(), 22, 1, -3, 5, 'NONE', null, '4192', 'COMPLETED', JSON.stringify(['TIN Certificate', 'Kebele ID']), 0);
  insertSession.run('ses-902', 'TC-102', 'srv-01', 'off-101', 3, '092****311', 'FIN-2025-4103', new Date(now - 80 * 60000).toISOString(), new Date(now - 56 * 60000).toISOString(), 24, 1, -1, 4, 'NONE', null, '7823', 'COMPLETED', JSON.stringify(['TIN Certificate', 'Audit Clearance']), 0);
  insertSession.run('ses-903', 'TR-101', 'srv-02', 'off-102', 1, '094****190', 'FIN-2025-7822', new Date(now - 95 * 60000).toISOString(), new Date(now - 61 * 60000).toISOString(), 34, 1, -1, 5, 'NONE', null, '5561', 'COMPLETED', JSON.stringify(['Original Trade License', 'Commercial Register Copy']), 0);
  insertSession.run('ses-904', 'DA-101', 'srv-04', 'off-104', 4, '093****744', 'FIN-2025-6610', new Date(now - 120 * 60000).toISOString(), new Date(now - 65 * 60000).toISOString(), 55, 0, 25, 2, 'UNREASONABLE_DELAY', 'Clerk was on a phone call while I sat waiting for 30 minutes.', '8910', 'COMPLETED', JSON.stringify(['Principal ID']), 0);

  // Insert initial alert
  const insertAlert = db.prepare(`
    INSERT OR REPLACE INTO escalation_alerts (
      id, officer_id, officer_name_en, officer_name_am, window_num, alert_type, incident_count, timestamp, severity, description_en, description_am, status, action_taken_notes, officer_explanation, sanction_imposed
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertAlert.run(
    'alt-501', 
    'off-104', 
    'Rahel Kebede', 
    'ራሔል ከበደ', 
    4, 
    'EXTREME_SLA_BREACH', 
    1, 
    new Date(now - 40 * 60000).toISOString(), 
    'HIGH', 
    'Average turnaround duration for Document Authentication exceeded Citizen Charter standard by 83% over morning session.', 
    'የሰነዶች ማረጋገጫ አገልግሎት የሚወስደው ጊዜ ከዜጎች ቻርተር ስታንዳርድ በ 83% በልጦ ተመዝግቧል።', 
    'ACTIVE', 
    null, 
    'Document scanner power fluctuation caused 20-minute hardware restart delay.', 
    'First Formal Warning Issued'
  );

  // Insert historical appraisals for off-101
  const insertAppraisal = db.prepare(`
    INSERT OR REPLACE INTO semester_appraisals (
      semester_id, officer_id, semester_label, total_transactions, completed_transactions, sla_compliance_rate, average_citizen_rating, volume_efficiency_score, sla_compliance_score, citizen_rating_score, objective_score_60, supervisor_score_40, total_appraisal_score, policy_score_10, ethics_score_10, attendance_score_10, problem_solving_score_10, supervisor_remarks, evaluated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // 1. Appraisals for off-101 (Alemayehu Tadesse) - 92.2% Average -> Eligible (+7.5%)
  insertAppraisal.run('2015-S2', 'off-101', '2015 ዓ.ም ሁለተኛ መንፈቅ (2023 G.C. Sem 2)', 320, 312, 94.0, 4.6, 24.5, 18.8, 13.5, 56.8, 36.0, 92.8, 9.0, 9.0, 9.0, 9.0, 'Consistently punctilious, resolves citizen tax clearances with minimal delay.', '2023-07-15T08:00:00Z');
  insertAppraisal.run('2016-S1', 'off-101', '2016 ዓ.ም አንደኛ መንፈቅ (2024 G.C. Sem 1)', 345, 338, 92.0, 4.5, 24.8, 18.4, 13.1, 56.3, 35.5, 91.8, 9.0, 8.5, 9.0, 9.0, 'High volume efficiency and professional composure during tax season rush.', '2024-01-20T08:00:00Z');
  insertAppraisal.run('2016-S2', 'off-101', '2016 ዓ.ም ሁለተኛ መንፈቅ (2024 G.C. Sem 2)', 310, 305, 91.0, 4.4, 24.0, 18.2, 12.8, 55.0, 35.0, 90.0, 9.0, 8.5, 8.5, 9.0, 'Met all volume quotas. Clean audit log with zero ethics complaints.', '2024-07-18T08:00:00Z');
  insertAppraisal.run('2017-S1', 'off-101', '2017 ዓ.ም አንደኛ መንፈቅ (2025 G.C. Sem 1)', 360, 352, 93.0, 4.7, 25.0, 18.6, 13.9, 57.5, 36.5, 94.0, 9.5, 9.0, 9.0, 9.0, 'Exceptional SLA adherence. Top performer in sub-city revenue directorate.', '2025-01-25T08:00:00Z');

  // 2. Appraisals for off-102 (Almaz Bekele - Window 1) - 89.8% Average -> Eligible (+7.5%)
  insertAppraisal.run('2015-S2', 'off-102', '2015 ዓ.ም ሁለተኛ መንፈቅ (2023 G.C. Sem 2)', 290, 280, 90.0, 4.5, 23.5, 18.0, 13.0, 54.5, 34.0, 88.5, 8.5, 8.5, 8.5, 8.5, 'Skilled at business licensing renewal verification and document authentication.', '2023-07-15T08:00:00Z');
  insertAppraisal.run('2016-S1', 'off-102', '2016 ዓ.ም አንደኛ መንፈቅ (2024 G.C. Sem 1)', 310, 302, 91.0, 4.6, 24.0, 18.2, 13.0, 55.2, 34.0, 89.2, 8.5, 8.5, 8.5, 8.5, 'Positive citizen feedback scores across trade renewals.', '2024-01-20T08:00:00Z');
  insertAppraisal.run('2016-S2', 'off-102', '2016 ዓ.ም ሁለተኛ መንፈቅ (2024 G.C. Sem 2)', 305, 298, 92.0, 4.7, 24.2, 18.4, 13.4, 56.0, 35.0, 91.0, 9.0, 8.5, 8.5, 9.0, 'Excellent team cooperation and punctuality.', '2024-07-18T08:00:00Z');
  insertAppraisal.run('2017-S1', 'off-102', '2017 ዓ.ም አንደኛ መንፈቅ (2025 G.C. Sem 1)', 325, 318, 92.0, 4.6, 24.5, 18.4, 13.1, 56.0, 34.5, 90.5, 9.0, 8.5, 8.5, 8.5, 'Maintains very low citizen queue delay at counter.', '2025-01-25T08:00:00Z');

  // 3. Appraisals for off-103 (Dawit Tsegaye - Window 2) - 85.7% Average -> Eligible (+7.5%)
  insertAppraisal.run('2015-S2', 'off-103', '2015 ዓ.ም ሁለተኛ መንፈቅ (2023 G.C. Sem 2)', 270, 260, 88.0, 4.3, 22.5, 17.6, 12.4, 52.5, 31.5, 84.0, 8.0, 8.0, 7.5, 8.0, 'Steady throughput for vital events registrations and marital certificates.', '2023-07-15T08:00:00Z');
  insertAppraisal.run('2016-S1', 'off-103', '2016 ዓ.ም አንደኛ መንፈቅ (2024 G.C. Sem 1)', 285, 275, 89.0, 4.4, 23.0, 17.8, 12.7, 53.5, 33.0, 86.5, 8.5, 8.5, 8.0, 8.0, 'Good accuracy in vital registration records archiving.', '2024-01-20T08:00:00Z');
  insertAppraisal.run('2016-S2', 'off-103', '2016 ዓ.ም ሁለተኛ መንፈቅ (2024 G.C. Sem 2)', 280, 270, 88.0, 4.3, 22.8, 17.6, 12.6, 53.0, 32.0, 85.0, 8.0, 8.0, 8.0, 8.0, 'Satisfactory turnaround time adherence.', '2024-07-18T08:00:00Z');
  insertAppraisal.run('2017-S1', 'off-103', '2017 ዓ.ም አንደኛ መንፈቅ (2025 G.C. Sem 1)', 295, 288, 90.0, 4.4, 23.5, 18.0, 12.7, 54.2, 33.0, 87.2, 8.5, 8.5, 8.0, 8.0, 'Continues to meet quarterly quotas.', '2025-01-25T08:00:00Z');

  // 4. Appraisals for off-104 (Rahel Kebede - Window 4) - 78.6% Average -> UNDER THRESHOLD (<80.0%)
  insertAppraisal.run('2015-S2', 'off-104', '2015 ዓ.ም ሁለተኛ መንፈቅ (2023 G.C. Sem 2)', 220, 205, 81.0, 3.8, 20.0, 16.2, 10.8, 47.0, 29.0, 76.0, 7.5, 7.5, 7.0, 7.0, 'Occasional delays at authentication desk during peak afternoon periods.', '2023-07-15T08:00:00Z');
  insertAppraisal.run('2016-S1', 'off-104', '2016 ዓ.ም አንደኛ መንፈቅ (2024 G.C. Sem 1)', 235, 220, 83.0, 3.9, 21.0, 16.6, 11.4, 49.0, 29.5, 78.5, 7.5, 7.5, 7.0, 7.5, 'Requires improved turnaround on power of attorney document reviews.', '2024-01-20T08:00:00Z');
  insertAppraisal.run('2016-S2', 'off-104', '2016 ዓ.ም ሁለተኛ መንፈቅ (2024 G.C. Sem 2)', 230, 218, 84.0, 4.0, 21.2, 16.8, 11.5, 49.5, 29.5, 79.0, 7.5, 7.5, 7.0, 7.5, 'Slight progress noted; attendance record is generally satisfactory.', '2024-07-18T08:00:00Z');
  insertAppraisal.run('2017-S1', 'off-104', '2017 ዓ.ም አንደኛ መንፈቅ (2025 G.C. Sem 1)', 245, 232, 85.0, 4.1, 22.0, 17.0, 12.0, 51.0, 30.0, 81.0, 8.0, 7.5, 7.0, 7.5, 'Under statutory coaching plan pursuant to Section 43 of Proclamation 1353/2025.', '2025-01-25T08:00:00Z');
}
