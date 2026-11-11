// Statutory Performance Formula Engine under Federal Civil Servants Proclamation No. 1353/2025
import { ServiceSession, SemesterAppraisal, TwoYearEligibilityReport, Officer } from '../types';

/**
 * Calculates SLA variance in minutes and boolean compliance.
 * Formula: SLA Variance = (T_completed - T_started) - T_CharterStandard
 */
export function calculateSlaVariance(
  startedAtIso: string,
  completedAtIso: string,
  standardDurationMin: number
): {
  actualDurationMin: number;
  slaVarianceMin: number;
  metCharterSla: boolean;
} {
  const start = new Date(startedAtIso).getTime();
  const end = new Date(completedAtIso).getTime();
  const actualDurationMin = Math.max(1, Math.round((end - start) / (1000 * 60)));
  const slaVarianceMin = actualDurationMin - standardDurationMin;
  const metCharterSla = actualDurationMin <= standardDurationMin;

  return {
    actualDurationMin,
    slaVarianceMin,
    metCharterSla
  };
}

/**
 * Computes the 60-point Statutory Objective Score from raw transaction data.
 * Objective Appraisal Score (60 pts) = Volume Efficiency (25 pts) + SLA Compliance (20 pts) + Verified Citizen Rating (15 pts)
 */
export function computeObjectiveScore60(sessions: ServiceSession[], targetQuota: number = 30): {
  volumeEfficiencyScore: number;
  slaComplianceScore: number;
  citizenRatingScore: number;
  objectiveScore60: number;
  completedCount: number;
  slaComplianceRate: number;
  averageRating: number;
} {
  const completed = sessions.filter(s => s.sessionStatus === 'COMPLETED');
  const completedCount = completed.length;

  if (completedCount === 0) {
    return {
      volumeEfficiencyScore: 0,
      slaComplianceScore: 0,
      citizenRatingScore: 0,
      objectiveScore60: 0,
      completedCount: 0,
      slaComplianceRate: 0,
      averageRating: 0
    };
  }

  // 1. Volume Efficiency (25 pts max)
  const volumeRatio = Math.min(1.0, completedCount / targetQuota);
  const volumeEfficiencyScore = Math.round(volumeRatio * 25 * 10) / 10;

  // 2. SLA Compliance Rate (20 pts max)
  const metSlaCount = completed.filter(s => s.metCharterSla).length;
  const slaComplianceRate = Math.round((metSlaCount / completedCount) * 100);
  const slaComplianceScore = Math.round((metSlaCount / completedCount) * 20 * 10) / 10;

  // 3. Verified Citizen Rating (15 pts max)
  const ratedSessions = completed.filter(s => s.citizenRating && s.citizenRating > 0);
  let averageRating = 0;
  let citizenRatingScore = 0;

  if (ratedSessions.length > 0) {
    const sum = ratedSessions.reduce((acc, curr) => acc + (curr.citizenRating || 0), 0);
    averageRating = Math.round((sum / ratedSessions.length) * 10) / 10;
    // Direct linear scaling of 5-star citizen rating to 15 statutory points: (Avg / 5) * 15
    citizenRatingScore = Math.round((averageRating / 5) * 15 * 10) / 10;
  }

  const objectiveScore60 = Math.round((volumeEfficiencyScore + slaComplianceScore + citizenRatingScore) * 10) / 10;

  return {
    volumeEfficiencyScore,
    slaComplianceScore,
    citizenRatingScore,
    objectiveScore60,
    completedCount,
    slaComplianceRate,
    averageRating
  };
}

/**
 * Computes full 100-point Biannual Appraisal.
 * Total Score = Objective Score (60 pts) + Supervisor Behavioral Score (40 pts)
 */
export function computeTotalAppraisal(objective60: number, supervisor40: number): number {
  const boundedObj = Math.max(0, Math.min(60, objective60));
  const boundedSup = Math.max(0, Math.min(40, supervisor40));
  return Math.round((boundedObj + boundedSup) * 10) / 10;
}

/**
 * Aggregates 4 consecutive semesters (2 calendar years) for salary step increment eligibility.
 * Mandated by Proclamation No. 1353/2025.
 */
export function evaluateTwoYearStepIncrement(
  officer: Officer,
  semesters: SemesterAppraisal[]
): TwoYearEligibilityReport {
  const sorted = [...semesters].slice(-4);
  const total = sorted.reduce((sum, sem) => sum + sem.totalAppraisalScore, 0);
  const twoYearAverageScore = sorted.length > 0 ? Math.round((total / sorted.length) * 10) / 10 : 0;
  const minimumPassingThreshold = 80.0;
  const isEligibleForStepIncrement = twoYearAverageScore >= minimumPassingThreshold && sorted.length >= 4;

  // Next step salary calculation: approx +6% to +8% step increment per Ethiopian civil service grade scale
  const stepIncrementAmount = Math.round(officer.baseSalaryEtb * 0.075);
  const newSalaryStepEtb = isEligibleForStepIncrement 
    ? officer.baseSalaryEtb + stepIncrementAmount 
    : officer.baseSalaryEtb;

  const hashSeed = `${officer.employeeId}-${twoYearAverageScore}-${Date.now()}`;
  const verificationHash = `ETH-CSC-${Math.abs(hashSeed.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)).toString(16).toUpperCase()}`;
  const certificateSerialNumber = `CSC/1353/2017/${officer.assignedWindowNum.toString().padStart(2, '0')}-${officer.employeeId.slice(-4)}`;

  return {
    officerId: officer.id,
    officer,
    semesters: sorted,
    twoYearAverageScore,
    minimumPassingThreshold,
    isEligibleForStepIncrement,
    newSalaryStepEtb,
    certificateSerialNumber,
    verificationHash,
    issuedDateUtc: new Date().toISOString()
  };
}
