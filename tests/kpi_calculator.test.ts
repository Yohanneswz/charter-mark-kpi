// Automated Unit Test Suite for Statutory Formulas (Proclamation No. 1353/2025)
import { calculateSlaVariance, computeObjectiveScore60, evaluateTwoYearStepIncrement } from '../src/utils/kpiCalculator';
import { Officer, ServiceSession, SemesterAppraisal } from '../src/types';

function runTests() {
  console.log('🧪 Running Statutory KPI Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✓ ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ FAILED: ${testName}`);
      failed++;
    }
  }

  // 1. SLA Variance & Compliance Tests
  const startTime = '2026-11-10T10:00:00Z';
  const onTimeEnd = '2026-11-10T10:20:00Z'; // 20 minutes (Standard is 25)
  const delayedEnd = '2026-11-10T10:35:00Z'; // 35 minutes (Standard is 25)

  const onTimeResult = calculateSlaVariance(startTime, onTimeEnd, 25);
  assert(onTimeResult.actualDurationMin === 20, 'On-time duration matches 20 minutes');
  assert(onTimeResult.slaVarianceMin === -5, 'SLA variance is negative 5 minutes for on-time service');
  assert(onTimeResult.metCharterSla === true, 'Met SLA evaluates to true');

  const delayedResult = calculateSlaVariance(startTime, delayedEnd, 25);
  assert(delayedResult.actualDurationMin === 35, 'Delayed duration matches 35 minutes');
  assert(delayedResult.slaVarianceMin === 10, 'SLA variance is positive 10 minutes for overdue service');
  assert(delayedResult.metCharterSla === false, 'Met SLA evaluates to false for delayed service');

  // 2. 60-Point Objective Score Calculation Tests
  const mockSessions: ServiceSession[] = [
    {
      id: 's1',
      serviceId: 'srv-1',
      officerId: 'off-1',
      windowNum: 1,
      citizenPhoneHash: '091****111',
      startedAt: startTime,
      completedAt: onTimeEnd,
      sessionStatus: 'COMPLETED',
      metCharterSla: true,
      citizenRating: 5,
      complaintCategory: 'NONE',
      completionPin: '1234'
    },
    {
      id: 's2',
      serviceId: 'srv-1',
      officerId: 'off-1',
      windowNum: 1,
      citizenPhoneHash: '091****222',
      startedAt: startTime,
      completedAt: delayedEnd,
      sessionStatus: 'COMPLETED',
      metCharterSla: false,
      citizenRating: 4,
      complaintCategory: 'NONE',
      completionPin: '5678'
    }
  ];

  const kpiResult = computeObjectiveScore60(mockSessions, 2);
  assert(kpiResult.completedCount === 2, 'Completed transaction count is 2');
  assert(kpiResult.volumeEfficiencyScore === 25.0, 'Full volume score 25.0 when quota is met');
  assert(kpiResult.slaComplianceRate === 50, 'SLA compliance rate is 50% (1 of 2)');
  assert(kpiResult.slaComplianceScore === 10.0, 'SLA compliance score is 10.0 (50% of 20 pts)');
  assert(kpiResult.averageRating === 4.5, 'Average citizen rating is 4.5 stars');
  assert(kpiResult.citizenRatingScore === 13.5, 'Citizen rating score is 13.5 (4.5 / 5.0 * 15 pts)');
  assert(kpiResult.objectiveScore60 === 48.5, 'Total objective score equals 48.5 / 60 pts');

  // 3. Two-Year Appraisal & Salary Increment Threshold Tests
  const mockOfficer: Officer = {
    id: 'off-test',
    employeeId: 'ETH-TEST-001',
    fullNameEn: 'Test Officer',
    fullNameAm: 'ሙከራ ባለሙያ',
    fullNameOr: 'Hojjetaa Qormaataa',
    assignedWindowNum: 1,
    jegGradeCode: 'JEG-VIII',
    baseSalaryEtb: 10000,
    departmentEn: 'Revenues',
    departmentAm: 'ገቢዎች',
    photoUrl: 'https://example.com/photo.jpg',
    status: 'ACTIVE',
    phone: '0911000000'
  };

  const passingSemesters: SemesterAppraisal[] = [
    createSemester('2015-S2', 88),
    createSemester('2016-S1', 90),
    createSemester('2016-S2', 92),
    createSemester('2017-S1', 94)
  ];

  const passingReport = evaluateTwoYearStepIncrement(mockOfficer, passingSemesters);
  assert(passingReport.twoYearAverageScore === 91.0, '4-Semester average score is 91.0%');
  assert(passingReport.isEligibleForStepIncrement === true, 'Officer is eligible for step increment (>= 80.0%)');
  assert(passingReport.newSalaryStepEtb === 10750, 'New salary reflects +7.5% increment (10,000 -> 10,750 ETB)');

  const failingSemesters: SemesterAppraisal[] = [
    createSemester('2015-S2', 72),
    createSemester('2016-S1', 75),
    createSemester('2016-S2', 78),
    createSemester('2017-S1', 79)
  ];

  const failingReport = evaluateTwoYearStepIncrement(mockOfficer, failingSemesters);
  assert(failingReport.twoYearAverageScore === 76.0, '4-Semester average score is 76.0%');
  assert(failingReport.isEligibleForStepIncrement === false, 'Officer is ineligible (< 80.0%)');
  assert(failingReport.newSalaryStepEtb === 10000, 'Salary remains unchanged when under threshold');

  console.log(`\n================================`);
  console.log(`Test Results: ${passed} Passed, ${failed} Failed`);
  console.log(`================================`);
  if (failed > 0) process.exit(1);
}

function createSemester(id: string, totalScore: number): SemesterAppraisal {
  return {
    semesterId: id,
    officerId: 'off-test',
    semesterLabel: `Semester ${id}`,
    totalTransactions: 100,
    completedTransactions: 98,
    slaComplianceRate: 90,
    averageCitizenRating: 4.5,
    volumeEfficiencyScore: 24,
    slaComplianceScore: 18,
    citizenRatingScore: 13,
    objectiveScore60: 55,
    supervisorScore40: totalScore - 55,
    totalAppraisalScore: totalScore,
    supervisorRemarks: 'Performance verified',
    evaluatedAt: '2026-11-10T12:00:00Z'
  };
}

runTests();
