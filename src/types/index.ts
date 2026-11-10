// Types for System 2: QR-Based Charter Mark Citizen Feedback & Civil Servant KPI Tracker
// In accordance with Ethiopian Federal Civil Servants Proclamation No. 1353/2025

export type Language = 'en' | 'am' | 'om';

export type ComplaintCategory = 
  | 'NONE'
  | 'OFFICER_ABSENT'
  | 'BRIBE_SOLICITED'
  | 'SYSTEM_DOWN'
  | 'UNREASONABLE_DELAY'
  | 'POOR_CONDUCT';

export type SessionStatus = 
  | 'IN_PROGRESS'
  | 'HELD'
  | 'TRANSFERRED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FLAGGED';

export interface Office {
  id: string;
  nameEn: string;
  nameAm: string;
  nameOr: string;
  region: string;
  city: string;
  subCity: string;
  woreda: string;
  centerType: string;
}

export interface CharterService {
  id: string;
  serviceCode: string;
  nameEn: string;
  nameAm: string;
  nameOr: string;
  standardDurationMin: number; // e.g. 25 min
  officialFeeEtb: number; // 0 for free public services, or e.g. 150 ETB
  category: string;
  requiredDocuments: {
    en: string[];
    am: string[];
    om: string[];
  };
}

export interface Officer {
  id: string;
  employeeId: string;
  fullNameEn: string;
  fullNameAm: string;
  fullNameOr: string;
  assignedWindowNum: number;
  jegGradeCode: string; // e.g., JEG-VIII, JEG-X
  baseSalaryEtb: number;
  departmentEn: string;
  departmentAm: string;
  photoUrl: string;
  status: 'ACTIVE' | 'ON_BREAK' | 'OFFLINE';
  phone: string;
}

export interface ServiceSession {
  id: string;
  ticketNumber?: string; // Sequential ticket (e.g., TR-101, TC-102)
  serviceId: string;
  officerId: string;
  windowNum: number;
  citizenPhoneHash: string; // anonymized phone
  faydaFinHash?: string; // Hashed Fayda National Digital ID
  startedAt: string; // ISO UTC
  completedAt?: string; // ISO UTC
  actualDurationMin?: number;
  metCharterSla?: boolean;
  slaVarianceMin?: number; // actual - standard
  citizenRating?: number; // 1 to 5
  complaintCategory: ComplaintCategory;
  citizenNotes?: string;
  completionPin: string; // 4-digit verification code
  sessionStatus: SessionStatus;
  documentsVerifiedJson?: string;
}

export interface EscalationAlert {
  id: string;
  officerId: string;
  officerNameEn: string;
  officerNameAm: string;
  windowNum: number;
  alertType: 'BRIBE_REPORTED' | 'ABSENTEEISM_SPIKE' | 'EXTREME_SLA_BREACH' | 'REPEATED_SYSTEM_DOWN';
  incidentCount: number;
  timestamp: string; // ISO UTC
  severity: 'URGENT' | 'HIGH' | 'MEDIUM';
  descriptionEn: string;
  descriptionAm: string;
  status: 'ACTIVE' | 'INVESTIGATING' | 'UNDER_INVESTIGATION' | 'RESOLVED' | 'DISMISSED';
  actionTakenNotes?: string;
  officerExplanation?: string;
  sanctionImposed?: string;
}

export interface SemesterAppraisal {
  semesterId: string; // e.g., "2017-S1" (Ethiopian Calendar year 2017 Semester 1)
  semesterLabel: string;
  officerId: string;
  totalTransactions: number;
  completedTransactions: number;
  slaComplianceRate: number; // percentage (0 - 100)
  averageCitizenRating: number; // 1.0 - 5.0
  volumeEfficiencyScore: number; // max 25 pts
  slaComplianceScore: number; // max 20 pts
  citizenRatingScore: number; // max 15 pts
  objectiveScore60: number; // max 60 pts
  supervisorScore40: number; // max 40 pts
  totalAppraisalScore: number; // max 100 pts
  supervisorRemarks: string;
  evaluatedAt: string;
}

export interface TwoYearEligibilityReport {
  officerId: string;
  officer: Officer;
  semesters: SemesterAppraisal[];
  twoYearAverageScore: number; // mean of 4 semesters
  minimumPassingThreshold: number; // 80.0 pts under Proclamation 1353/2025
  isEligibleForStepIncrement: boolean;
  newSalaryStepEtb: number;
  certificateSerialNumber: string;
  verificationHash: string;
  issuedDateUtc: string;
}
