// Production API Server with Comprehensive Municipal GovTech Features
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { db, initDatabase, seedInitialData } from './db.js';

initDatabase();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Helper: Calculate SLA variance
function calculateSla(startedAt: string, completedAt: string, standardMin: number) {
  const start = new Date(startedAt).getTime();
  const end = new Date(completedAt).getTime();
  const actualDurationMin = Math.max(1, Math.round((end - start) / 60000));
  const slaVarianceMin = actualDurationMin - standardMin;
  const metCharterSla = actualDurationMin <= standardMin;
  return { actualDurationMin, slaVarianceMin, metCharterSla };
}

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'System 2: QR-Based Charter Mark Citizen Feedback & KPI Tracker',
    jurisdiction: 'FDRE Civil Service Commission & Ethiopian Competency and Management Institute',
    database: 'SQLite (WAL Active)',
    proclamation: 'No. 1353/2025',
    timestamp: new Date().toISOString()
  });
});

// 2. Authentication
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  const user: any = db.prepare('SELECT * FROM users WHERE username = ? OR id = ?').get(username.trim().toLowerCase(), username.trim());
  
  if (!user || user.password_hash !== password.trim()) {
    return res.status(401).json({ error: 'Invalid civil service credentials' });
  }

  let officer = null;
  if (user.officer_id) {
    officer = db.prepare('SELECT * FROM officers WHERE id = ?').get(user.officer_id);
  }

  res.json({
    token: `token-${user.id}-${Date.now()}`,
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      officerId: user.officer_id,
      fullName: user.full_name,
      email: user.email,
      officer
    }
  });
});

// 3. Office Information
app.get('/api/offices', (req, res) => {
  const office = db.prepare('SELECT * FROM offices LIMIT 1').get();
  res.json(office);
});

// 4. Officers & Statuses
app.get('/api/officers', (req, res) => {
  const officers = db.prepare('SELECT * FROM officers ORDER BY assigned_window_num ASC').all();
  res.json(officers);
});

app.patch('/api/officers/:id/status', (req, res) => {
  const { id } = req.params;
  const { status, statusReason } = req.body;
  if (!['ACTIVE', 'ON_BREAK', 'HOLD', 'OFFLINE'].includes(status)) {
    return res.status(400).json({ error: 'Invalid officer status' });
  }

  db.prepare('UPDATE officers SET status = ?, status_reason = ? WHERE id = ?').run(status, statusReason || null, id);
  const updated = db.prepare('SELECT * FROM officers WHERE id = ?').get(id);
  res.json(updated);
});

// 5. Charter Services
app.get('/api/services', (req, res) => {
  const services = db.prepare('SELECT * FROM charter_services').all();
  const parsed = services.map((s: any) => ({
    ...s,
    requiredDocs: s.required_docs_json ? JSON.parse(s.required_docs_json) : []
  }));
  res.json(parsed);
});

// 6. Public Waiting Hall Display Board (Real-Time Queue Monitor)
app.get('/api/display/now-serving', (req, res) => {
  const activeSessions = db.prepare(`
    SELECT s.id, s.ticket_number, COALESCE(s.window_num, o.assigned_window_num) as window_num, s.started_at,
           o.id as officer_id, o.assigned_window_num, o.full_name_en as officer_name_en, o.full_name_am as officer_name_am,
           o.photo_url as officer_photo_url, o.status as officer_status, o.department_en, o.department_am,
           cs.name_en as service_name_en, cs.name_am as service_name_am, cs.standard_duration_min
    FROM officers o
    LEFT JOIN service_sessions s ON s.officer_id = o.id AND s.session_status = 'IN_PROGRESS'
    LEFT JOIN charter_services cs ON s.service_id = cs.id
    ORDER BY o.assigned_window_num ASC
  `).all();

  const recentCompleted = db.prepare(`
    SELECT s.ticket_number, s.window_num, s.actual_duration_min, s.met_charter_sla, s.completed_at,
           cs.name_en as service_name_en, cs.name_am as service_name_am
    FROM service_sessions s
    JOIN charter_services cs ON s.service_id = cs.id
    WHERE s.session_status = 'COMPLETED'
    ORDER BY s.completed_at DESC
    LIMIT 6
  `).all();

  res.json({
    windows: activeSessions,
    recentCompleted,
    timestamp: new Date().toISOString()
  });
});

// 7. Active Sessions & History
app.get('/api/sessions/active', (req, res) => {
  const active = db.prepare(`
    SELECT s.*, o.full_name_en as officer_name_en, o.full_name_am as officer_name_am,
           cs.name_en as service_name_en, cs.name_am as service_name_am, cs.standard_duration_min, cs.official_fee_etb
    FROM service_sessions s
    JOIN officers o ON s.officer_id = o.id
    JOIN charter_services cs ON s.service_id = cs.id
    WHERE s.session_status = 'IN_PROGRESS' OR s.session_status = 'HELD'
    ORDER BY s.started_at DESC
  `).all();
  res.json(active);
});

app.get('/api/sessions/history', (req, res) => {
  const sessions = db.prepare(`
    SELECT s.*, o.full_name_en as officer_name_en, o.full_name_am as officer_name_am,
           cs.name_en as service_name_en, cs.name_am as service_name_am, cs.standard_duration_min, cs.official_fee_etb
    FROM service_sessions s
    JOIN officers o ON s.officer_id = o.id
    JOIN charter_services cs ON s.service_id = cs.id
    ORDER BY s.started_at DESC
    LIMIT 100
  `).all();
  res.json(sessions);
});

// 8. Start Citizen Session with National Digital ID (Fayda) & Digital Ticket Number
app.post('/api/sessions/start', (req, res) => {
  const { serviceId, officerId, windowNum, citizenPhone, faydaId } = req.body;

  if (!serviceId || !officerId) {
    return res.status(400).json({ error: 'serviceId and officerId are required' });
  }

  const service: any = db.prepare('SELECT service_code FROM charter_services WHERE id = ?').get(serviceId);
  const prefix = service ? service.service_code.split('-')[1] || 'TK' : 'TK';
  
  // Sequential ticket generator
  const todayCount: any = db.prepare("SELECT COUNT(*) as count FROM service_sessions WHERE DATE(started_at) = DATE('now')").get();
  const ticketNumber = `${prefix}-${(todayCount.count + 101).toString()}`;

  const phoneHash = citizenPhone ? (citizenPhone.startsWith('WALK-IN') ? citizenPhone : `${citizenPhone.slice(0, 4)}****${citizenPhone.slice(-3)}`) : '091****' + Math.floor(100 + Math.random() * 900);
  const finHash = faydaId ? `FIN-2025-${Math.floor(1000 + Math.random() * 9000)}` : null;

  const sessionId = `ses-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const completionPin = Math.floor(1000 + Math.random() * 9000).toString();
  const startedAt = new Date().toISOString();

  const insert = db.prepare(`
    INSERT INTO service_sessions (
      id, ticket_number, service_id, officer_id, window_num, citizen_phone_hash, fayda_fin_hash, started_at, completion_pin, session_status, complaint_category
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'IN_PROGRESS', 'NONE')
  `);

  insert.run(sessionId, ticketNumber, serviceId, officerId, windowNum, phoneHash, finHash, startedAt, completionPin);

  db.prepare(`
    INSERT INTO audit_logs (id, event_type, entity_id, actor, details_json, created_at)
    VALUES (?, 'SESSION_STARTED', ?, ?, ?, ?)
  `).run(`aud-${Date.now()}`, sessionId, phoneHash, JSON.stringify({ ticketNumber, windowNum, serviceId }), startedAt);

  const newSession = db.prepare('SELECT * FROM service_sessions WHERE id = ?').get(sessionId);
  res.status(201).json(newSession);
});

// 9. Complete Session with Document Checklist, PIN verification & Anti-Corruption Sentinel
app.post('/api/sessions/:id/complete', (req, res) => {
  const { id } = req.params;
  const { rating, complaintCategory, citizenNotes, enteredPin, verifiedDocs } = req.body;

  const session: any = db.prepare('SELECT * FROM service_sessions WHERE id = ?').get(id);
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }

  if (enteredPin && enteredPin.trim() !== session.completion_pin) {
    return res.status(400).json({ error: 'Invalid 4-digit completion PIN' });
  }

  const completedAt = new Date().toISOString();
  const service: any = db.prepare('SELECT * FROM charter_services WHERE id = ?').get(session.service_id);
  const officer: any = db.prepare('SELECT * FROM officers WHERE id = ?').get(session.officer_id);
  const standardMin = service ? service.standard_duration_min : 25;

  const { actualDurationMin, slaVarianceMin, metCharterSla } = calculateSla(session.started_at, completedAt, standardMin);

  const update = db.prepare(`
    UPDATE service_sessions
    SET completed_at = ?,
        actual_duration_min = ?,
        met_charter_sla = ?,
        sla_variance_min = ?,
        citizen_rating = ?,
        complaint_category = ?,
        citizen_notes = ?,
        documents_verified_json = ?,
        session_status = 'COMPLETED'
    WHERE id = ?
  `);

  const category = complaintCategory || 'NONE';
  const finalRating = rating ? Math.min(5, Math.max(1, rating)) : 5;
  const docsJson = verifiedDocs ? JSON.stringify(verifiedDocs) : null;

  update.run(
    completedAt,
    actualDurationMin,
    metCharterSla ? 1 : 0,
    slaVarianceMin,
    finalRating,
    category,
    citizenNotes || null,
    docsJson,
    id
  );

  // Anti-Corruption Escalator
  if (category === 'BRIBE_SOLICITED' || category === 'OFFICER_ABSENT') {
    const alertId = `alt-${Date.now()}`;
    const isBribe = category === 'BRIBE_SOLICITED';
    db.prepare(`
      INSERT INTO escalation_alerts (
        id, officer_id, officer_name_en, officer_name_am, window_num, alert_type, incident_count, timestamp, severity, description_en, description_am, status
      ) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?, 'ACTIVE')
    `).run(
      alertId,
      officer.id,
      officer.full_name_en,
      officer.full_name_am,
      session.window_num,
      isBribe ? 'BRIBE_REPORTED' : 'ABSENTEEISM_SPIKE',
      completedAt,
      isBribe ? 'URGENT' : 'HIGH',
      isBribe
        ? `Citizen reported irregular fee solicitation at Window #${session.window_num}. Immediate ethics review flagged.`
        : `Citizen flagged unannounced officer absence at Window #${session.window_num} during working hours.`,
      isBribe
        ? `በመስኮት #${session.window_num} ላይ ህገ-ወጥ ክፍያ (ጉቦ) መጠየቁ በዜጋው ተመዝግቧል።`
        : `በመስኮት #${session.window_num} ላይ በስራ ሰዓት ያለመገኘት ቅሬታ ቀርቧል።`
    );
  } else if (!metCharterSla && slaVarianceMin >= standardMin * 0.5) {
    const alertId = `alt-${Date.now()}`;
    db.prepare(`
      INSERT INTO escalation_alerts (
        id, officer_id, officer_name_en, officer_name_am, window_num, alert_type, incident_count, timestamp, severity, description_en, description_am, status
      ) VALUES (?, ?, ?, ?, ?, 'EXTREME_SLA_BREACH', 1, ?, 'MEDIUM', ?, ?, 'ACTIVE')
    `).run(
      alertId,
      officer.id,
      officer.full_name_en,
      officer.full_name_am,
      session.window_num,
      completedAt,
      `Transaction exceeded Citizen Charter standard by +${slaVarianceMin} minutes (${actualDurationMin}m vs ${standardMin}m standard).`,
      `አገልግሎቱ ከዜጎች ቻርተር ስታንዳርድ በ +${slaVarianceMin} ደቂቃ ዘግይቶ ተጠናቋል።`
    );
  }

  db.prepare(`
    INSERT INTO audit_logs (id, event_type, entity_id, actor, details_json, created_at)
    VALUES (?, 'SESSION_COMPLETED', ?, ?, ?, ?)
  `).run(`aud-${Date.now()}`, id, officer.employee_id, JSON.stringify({ actualDurationMin, metCharterSla, category, finalRating }), completedAt);

  const updatedSession = db.prepare('SELECT * FROM service_sessions WHERE id = ?').get(id);
  res.json(updatedSession);
});

// 10. Pause / Hold Session with Reason
app.post('/api/sessions/:id/hold', (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  db.prepare("UPDATE service_sessions SET session_status = 'HELD', citizen_notes = ? WHERE id = ?").run(reason || 'Pending Document Photocopy', id);
  res.json({ success: true, id, status: 'HELD' });
});

app.post('/api/sessions/:id/resume', (req, res) => {
  const { id } = req.params;
  db.prepare("UPDATE service_sessions SET session_status = 'IN_PROGRESS' WHERE id = ?").run(id);
  res.json({ success: true, id, status: 'IN_PROGRESS' });
});

// 11. Transfer Session between Service Windows
app.post('/api/sessions/:id/transfer', (req, res) => {
  const { id } = req.params;
  const { targetWindowNum } = req.body;

  const targetOfficer: any = db.prepare('SELECT * FROM officers WHERE assigned_window_num = ?').get(targetWindowNum);
  if (!targetOfficer) return res.status(404).json({ error: 'Target window not found' });

  db.prepare(`
    UPDATE service_sessions 
    SET officer_id = ?, window_num = ? 
    WHERE id = ?
  `).run(targetOfficer.id, targetWindowNum, id);

  res.json({ success: true, id, transferredToWindow: targetWindowNum, officerName: targetOfficer.full_name_en });
});

// 12. Officer Explanation & Bureau Head Sanction Workflow
app.post('/api/alerts/:id/explain', (req, res) => {
  const { id } = req.params;
  const { explanation } = req.body;
  db.prepare("UPDATE escalation_alerts SET officer_explanation = ?, status = 'UNDER_INVESTIGATION' WHERE id = ?").run(explanation, id);
  res.json({ success: true, id });
});

app.post('/api/alerts/:id/sanction', (req, res) => {
  const { id } = req.params;
  const { sanction, actionNotes } = req.body;
  db.prepare("UPDATE escalation_alerts SET sanction_imposed = ?, action_taken_notes = ?, status = 'RESOLVED' WHERE id = ?").run(sanction, actionNotes, id);
  res.json({ success: true, id });
});

// 13. Escalation Alerts
app.get('/api/alerts', (req, res) => {
  const alerts = db.prepare('SELECT * FROM escalation_alerts ORDER BY timestamp DESC').all();
  res.json(alerts);
});

app.post('/api/alerts/:id/resolve', (req, res) => {
  const { id } = req.params;
  const { actionNotes } = req.body;
  db.prepare("UPDATE escalation_alerts SET status = 'RESOLVED', action_taken_notes = ? WHERE id = ?").run(actionNotes || 'Resolved by Bureau Head', id);
  res.json({ success: true, id });
});

app.post('/api/alerts/:id/dismiss', (req, res) => {
  const { id } = req.params;
  db.prepare("UPDATE escalation_alerts SET status = 'DISMISSED' WHERE id = ?").run(id);
  res.json({ success: true, id });
});

// 14. Performance Appraisals & Statutory 60/40 Split
app.get('/api/appraisals/:officerId', (req, res) => {
  const { officerId } = req.params;
  const officer = db.prepare('SELECT * FROM officers WHERE id = ?').get(officerId);
  if (!officer) return res.status(404).json({ error: 'Officer not found' });

  const semesters = db.prepare('SELECT * FROM semester_appraisals WHERE officer_id = ? ORDER BY semester_id ASC').all(officerId);
  const completedToday: any[] = db.prepare("SELECT * FROM service_sessions WHERE officer_id = ? AND session_status = 'COMPLETED'").all(officerId);

  const count = completedToday.length;
  const metSlaCount = completedToday.filter(s => s.met_charter_sla === 1).length;
  const slaRate = count > 0 ? (metSlaCount / count) * 100 : 100;
  const rated = completedToday.filter(s => s.citizen_rating > 0);
  const avgRating = rated.length > 0 ? rated.reduce((a, b) => a + b.citizen_rating, 0) / rated.length : 5.0;

  const volumeScore = Math.min(25, Math.round((count / 20) * 25 * 10) / 10);
  const slaScore = Math.round((slaRate / 100) * 20 * 10) / 10;
  const ratingScore = Math.round(Math.max(0, ((avgRating - 1) / 4)) * 15 * 10) / 10;
  const objectiveScore60 = Math.round((volumeScore + slaScore + ratingScore) * 10) / 10;

  res.json({
    officer,
    semesters,
    currentLiveShift: {
      completedTransactions: count,
      slaComplianceRate: Math.round(slaRate),
      averageCitizenRating: Math.round(avgRating * 10) / 10,
      volumeEfficiencyScore: volumeScore,
      slaComplianceScore: slaScore,
      citizenRatingScore: ratingScore,
      objectiveScore60
    }
  });
});

app.post('/api/appraisals/supervisor-score', (req, res) => {
  const { officerId, semesterId, policyScore, ethicsScore, attendanceScore, problemSolvingScore, remarks } = req.body;
  
  const p = Math.max(0, Math.min(10, parseFloat(policyScore) || 9.0));
  const e = Math.max(0, Math.min(10, parseFloat(ethicsScore) || 9.0));
  const a = Math.max(0, Math.min(10, parseFloat(attendanceScore) || 9.0));
  const ps = Math.max(0, Math.min(10, parseFloat(problemSolvingScore) || 9.0));
  const supervisorScore40 = Math.round((p + e + a + ps) * 10) / 10;

  const existing: any = db.prepare('SELECT * FROM semester_appraisals WHERE officer_id = ? AND semester_id = ?').get(officerId, semesterId);
  if (!existing) return res.status(404).json({ error: 'Appraisal semester not found' });

  const newTotal = Math.round((existing.objective_score_60 + supervisorScore40) * 10) / 10;
  db.prepare(`
    UPDATE semester_appraisals 
    SET supervisor_score_40 = ?, total_appraisal_score = ?, policy_score_10 = ?, ethics_score_10 = ?, attendance_score_10 = ?, problem_solving_score_10 = ?, supervisor_remarks = ?, evaluated_at = ?
    WHERE officer_id = ? AND semester_id = ?
  `).run(supervisorScore40, newTotal, p, e, a, ps, remarks || '', new Date().toISOString(), officerId, semesterId);

  res.json({ success: true, officerId, semesterId, supervisorScore40, newTotal });
});

// 15. Two-Year Salary Increment Aggregator & Cryptographic Certificate Generation
app.get('/api/certificates/:officerId', (req, res) => {
  const { officerId } = req.params;
  const officer: any = db.prepare('SELECT * FROM officers WHERE id = ?').get(officerId);
  if (!officer) return res.status(404).json({ error: 'Officer not found' });

  const semesters: any[] = db.prepare('SELECT * FROM semester_appraisals WHERE officer_id = ? ORDER BY semester_id ASC').all(officerId);
  const sorted4 = semesters.slice(-4);
  const total = sorted4.reduce((sum, s) => sum + s.total_appraisal_score, 0);
  const twoYearAverage = sorted4.length > 0 ? Math.round((total / sorted4.length) * 10) / 10 : 0;
  const passingCutoff = 80.0;
  const isEligible = twoYearAverage >= passingCutoff && sorted4.length >= 4;

  const stepIncrementEtb = Math.round(officer.base_salary_etb * 0.075);
  const newSalaryStepEtb = isEligible ? officer.base_salary_etb + stepIncrementEtb : officer.base_salary_etb;

  const serialNumber = `CSC/1353/2017/${officer.assigned_window_num.toString().padStart(2, '0')}-${officer.employee_id.slice(-4)}`;
  const signaturePayload = `${serialNumber}:${officer.employee_id}:${twoYearAverage}:${newSalaryStepEtb}:FDRE_CSC_SECRET_KEY_2025`;
  const verificationHash = 'ETH-CSC-' + crypto.createHash('sha256').update(signaturePayload).digest('hex').slice(0, 16).toUpperCase();

  res.json({
    officer,
    semesters: sorted4,
    twoYearAverageScore: twoYearAverage,
    minimumPassingThreshold: passingCutoff,
    isEligibleForStepIncrement: isEligible,
    newSalaryStepEtb,
    certificateSerialNumber: serialNumber,
    verificationHash,
    issuedDateUtc: new Date().toISOString()
  });
});

// 16. Public Cryptographic Verification Endpoint (Supports Hash, Officer ID, Serial Number, or Ticket Number)
app.get('/api/certificates/verify/:hash', (req, res) => {
  const { hash } = req.params;
  const cleanQuery = hash.trim().toUpperCase();

  // First check if it matches a citizen service ticket
  const ticket: any = db.prepare(`
    SELECT s.*, o.full_name_en as officer_name_en, o.full_name_am as officer_name_am,
           cs.name_en as service_name_en, cs.name_am as service_name_am, cs.official_fee_etb, cs.standard_duration_min
    FROM service_sessions s
    JOIN officers o ON s.officer_id = o.id
    JOIN charter_services cs ON s.service_id = cs.id
    WHERE UPPER(s.ticket_number) = ? OR UPPER(s.id) = ?
  `).get(cleanQuery, cleanQuery);

  if (ticket) {
    return res.json({
      verified: true,
      type: 'TICKET_RECEIPT',
      proclamationRef: 'Federal Civil Servants Proclamation No. 1353/2025',
      ticketNumber: ticket.ticket_number,
      sessionId: ticket.id,
      windowNum: ticket.window_num,
      officerNameEn: ticket.officer_name_en,
      officerNameAm: ticket.officer_name_am,
      serviceNameEn: ticket.service_name_en,
      serviceNameAm: ticket.service_name_am,
      officialFeeEtb: ticket.official_fee_etb,
      sessionStatus: ticket.session_status,
      actualDurationMin: ticket.actual_duration_min,
      standardDurationMin: ticket.standard_duration_min,
      metCharterSla: ticket.met_charter_sla === 1,
      startedAt: ticket.started_at,
      completedAt: ticket.completed_at,
      faydaFinHash: ticket.fayda_fin_hash,
      verificationHash: 'ETH-TX-' + crypto.createHash('sha256').update(`${ticket.ticket_number}:${ticket.id}`).digest('hex').slice(0, 16).toUpperCase(),
      verifiedAt: new Date().toISOString()
    });
  }

  // Next check 2-year appraisal certificate records
  const officers: any[] = db.prepare('SELECT * FROM officers').all();
  
  for (const officer of officers) {
    const semesters: any[] = db.prepare('SELECT * FROM semester_appraisals WHERE officer_id = ?').all(officer.id);
    const sorted4 = semesters.slice(-4);
    const total = sorted4.reduce((sum, s) => sum + s.total_appraisal_score, 0);
    const twoYearAverage = sorted4.length > 0 ? Math.round((total / sorted4.length) * 10) / 10 : 0;
    const stepIncrementEtb = Math.round(officer.base_salary_etb * 0.075);
    const newSalaryStepEtb = officer.base_salary_etb + stepIncrementEtb;
    const serialNumber = `CSC/1353/2017/${officer.assigned_window_num.toString().padStart(2, '0')}-${officer.employee_id.slice(-4)}`;
    const signaturePayload = `${serialNumber}:${officer.employee_id}:${twoYearAverage}:${newSalaryStepEtb}:FDRE_CSC_SECRET_KEY_2025`;
    const checkHash = 'ETH-CSC-' + crypto.createHash('sha256').update(signaturePayload).digest('hex').slice(0, 16).toUpperCase();

    const matchesHash = checkHash.toUpperCase() === cleanQuery;
    const matchesSerial = serialNumber.toUpperCase() === cleanQuery;
    const matchesEmployee = officer.employee_id.toUpperCase() === cleanQuery;
    const matchesOfficerId = officer.id.toUpperCase() === cleanQuery;

    if (matchesHash || matchesSerial || matchesEmployee || matchesOfficerId) {
      return res.json({
        verified: true,
        type: 'APPRAISAL_CERTIFICATE',
        proclamationRef: 'Federal Civil Servants Proclamation No. 1353/2025',
        officerNameEn: officer.full_name_en,
        officerNameAm: officer.full_name_am,
        employeeId: officer.employee_id,
        jegGradeCode: officer.jeg_grade_code,
        department: officer.department_en,
        twoYearAverageScore: twoYearAverage,
        stepSalaryEtb: newSalaryStepEtb,
        serialNumber,
        verificationHash: checkHash,
        verifiedAt: new Date().toISOString()
      });
    }
  }

  res.status(404).json({ verified: false, error: 'Cryptographic signature or reference not found in the Civil Service Commission Central Register.' });
});

// 17. Real CSV Export for Municipal Audit
app.get('/api/export/transactions-csv', (req, res) => {
  const sessions: any[] = db.prepare(`
    SELECT s.ticket_number, s.started_at, s.completed_at, s.actual_duration_min, s.met_charter_sla,
           s.citizen_rating, s.complaint_category, o.full_name_en as officer_name, o.assigned_window_num,
           cs.service_code, cs.standard_duration_min, cs.official_fee_etb
    FROM service_sessions s
    JOIN officers o ON s.officer_id = o.id
    JOIN charter_services cs ON s.service_id = cs.id
    ORDER BY s.started_at DESC
  `).all();

  const headers = ['Ticket Number', 'Window', 'Officer', 'Service Code', 'Standard (Min)', 'Actual (Min)', 'Met SLA', 'Rating (1-5)', 'Complaint Flag', 'Fee (ETB)', 'Started At', 'Completed At'];
  const rows = sessions.map(s => [
    s.ticket_number,
    s.assigned_window_num,
    `"${s.officer_name}"`,
    s.service_code,
    s.standard_duration_min,
    s.actual_duration_min || 'N/A',
    s.met_charter_sla === 1 ? 'YES' : 'NO',
    s.citizen_rating || 'N/A',
    s.complaint_category,
    s.official_fee_etb,
    s.started_at,
    s.completed_at || 'N/A'
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="charter_mark_transactions.csv"');
  res.send(csv);
});

// 18. USSD Gateway Simulation
app.post('/api/ussd', (req, res) => {
  const { phoneNumber = '0911223344', text = '' } = req.body;
  const parts = text.split('*').filter(Boolean);

  if (parts.length === 0) {
    const response = 
`CON Welcome to FDRE Citizen Charter USSD
1. Check-In at Window
2. View Official Fees
3. Verify Civil Servant`;
    return res.type('text/plain').send(response);
  }

  if (parts[0] === '1') {
    if (parts.length === 1) {
      const response = 
`CON Select Service Window:
1. Win #1 (Almaz - Licensing)
2. Win #2 (Dawit - Vital Events)
3. Win #3 (Alemayehu - Tax)
4. Win #4 (Rahel - Legal Auth)`;
      return res.type('text/plain').send(response);
    }

    const winMap: Record<string, { offId: string; srvId: string; winNum: number; name: string }> = {
      '1': { offId: 'off-102', srvId: 'srv-02', winNum: 1, name: 'Almaz Bekele' },
      '2': { offId: 'off-103', srvId: 'srv-03', winNum: 2, name: 'Dawit Tsegaye' },
      '3': { offId: 'off-101', srvId: 'srv-01', winNum: 3, name: 'Alemayehu Tadesse' },
      '4': { offId: 'off-104', srvId: 'srv-04', winNum: 4, name: 'Rahel Kebede' }
    };

    const selected = winMap[parts[1]] || winMap['3'];
    const completionPin = Math.floor(1000 + Math.random() * 9000).toString();
    const sessionId = `ses-ussd-${Date.now()}`;
    const startedAt = new Date().toISOString();
    const ticketNumber = `USSD-${Math.floor(100 + Math.random() * 900)}`;

    db.prepare(`
      INSERT INTO service_sessions (
        id, ticket_number, service_id, officer_id, window_num, citizen_phone_hash, started_at, completion_pin, session_status, complaint_category
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'IN_PROGRESS', 'NONE')
    `).run(sessionId, ticketNumber, selected.srvId, selected.offId, selected.winNum, phoneNumber, startedAt, completionPin);

    const response = 
`END Ticket #${ticketNumber} Confirmed at Window #${selected.winNum}!
Officer: ${selected.name}
Fee: 0.00 ETB (FREE)
Charter Standard: 25 Minutes
Your 4-Digit Completion PIN: ${completionPin}
Share this PIN only upon receiving your documents.`;
    return res.type('text/plain').send(response);
  }

  if (parts[0] === '2') {
    const response = 
`END Official Government Fee Schedule:
1. Tax Clearance: FREE (0 ETB)
2. Trade Renewal: 150 ETB
3. Unmarried Cert: 50 ETB
4. Power of Attorney: 100 ETB
Demanding extra fees is prohibited by Proclamation 1353/2025.`;
    return res.type('text/plain').send(response);
  }

  res.type('text/plain').send('END Invalid selection. Please redial.');
});

// 19. Reset Database
app.post('/api/reset', (req, res) => {
  db.exec(`
    DELETE FROM audit_logs;
    DELETE FROM escalation_alerts;
    DELETE FROM service_sessions;
    DELETE FROM semester_appraisals;
    DELETE FROM charter_services;
    DELETE FROM officers;
    DELETE FROM offices;
    DELETE FROM users;
  `);
  seedInitialData();
  res.json({ success: true, message: 'Database reset to baseline state.' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[API Server] Running on http://0.0.0.0:${PORT}`);
});
