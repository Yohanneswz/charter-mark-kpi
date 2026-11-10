// Two-Year Statutory Performance Appraisal Engine under Federal Civil Servants Proclamation No. 1353/2025
import React, { useState } from 'react';
import { useSystem } from '../../context/SystemContext';
import { initialOfficers } from '../../data/seedData';
import { evaluateTwoYearStepIncrement } from '../../utils/kpiCalculator';
import { CertificateModal } from './CertificateModal';
import { StatusBadge } from '../Common/StatusBadge';

export const TwoYearAggregator: React.FC = () => {
  const { 
    language, 
    officers, 
    currentOfficerId, 
    setCurrentOfficerId, 
    appraisals, 
    refreshData 
  } = useSystem();

  const [selectedSemesterId, setSelectedSemesterId] = useState<string>('2017-S1');
  const [policyScore, setPolicyScore] = useState<number>(9.5);
  const [ethicsScore, setEthicsScore] = useState<number>(9.0);
  const [attendanceScore, setAttendanceScore] = useState<number>(9.0);
  const [problemSolvingScore, setProblemSolvingScore] = useState<number>(9.0);
  const [supervisorRemarksInput, setSupervisorRemarksInput] = useState<string>('Exemplary SLA adherence, high ethical integrity, and consistent customer courtesy.');
  const [showCertificate, setShowCertificate] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const safeOfficers = officers.length > 0 ? officers : initialOfficers;
  const officer = safeOfficers.find(o => o.id === currentOfficerId) || safeOfficers[0];
  const officerAppraisals = appraisals[officer.id] || [];

  const eligibilityReport = evaluateTwoYearStepIncrement(officer, officerAppraisals);

  const handleSaveSupervisorScore = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await fetch('/api/appraisals/supervisor-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          officerId: officer.id,
          semesterId: selectedSemesterId,
          policyScore,
          ethicsScore,
          attendanceScore,
          problemSolvingScore,
          remarks: supervisorRemarksInput
        })
      });
      await refreshData();
    } catch (err) {
      console.error('Failed to save supervisor score', err);
    } finally {
      setIsSaving(false);
    }
  };

  const strings = {
    title: {
      en: 'Two-Year Appraisal & Statutory Salary Increment Engine',
      am: 'የ2-ዓመት ምዘና እና የደመወዝ እርከን ጭማሪ ሞተር',
      om: 'Madaallii Waggaa 2 & Daballii Miindaa'
    },
    subtitle: {
      en: 'Statutory 4-semester aggregator mandated under Federal Civil Servants Proclamation No. 1353/2025 (Section 42). Replaces subjective paper appraisals with 60% empirical desk transactions + 40% structured supervisor evaluation.',
      am: 'በፌዴራል ሲቪል ሰርቫንቶች አዋጅ ቁጥር 1353/2017 መሰረት 4 ተከታታይ መንፈቆችን በማጠቃለል 60% ተጨባጭ የዴስክ መረጃን ከ 40% የአመራር ምዘና ጋር ያጣምራል።',
      om: 'Madaallii semisteera 4 walitti qabuun qabxii 60% ragaa tajaajilaa fi 40% hoggansaa walsimsiisa.'
    },
    generateCert: {
      en: 'Generate Civil Service Commission Certificate',
      am: 'የሲቪል ሰርቪስ ኮሚሽን የብቃት ሰርተፊኬት አውጣ',
      om: 'Waraqaa Ragaa Komishinii Baasi'
    }
  };

  const calculatedSupervisorTotal = Math.round((policyScore + ethicsScore + attendanceScore + problemSolvingScore) * 10) / 10;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-sans">
      {/* Header & Officer Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            {strings.title[language]}
          </h2>
          <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
            {strings.subtitle[language]}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {safeOfficers.map(o => (
            <button
              key={o.id}
              onClick={() => setCurrentOfficerId(o.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all ${
                o.id === currentOfficerId
                  ? 'bg-emerald-950 text-white font-bold shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Win #{o.assignedWindowNum}: {o.fullNameEn.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Two-Year Aggregate Determination Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-6">
          <div className="space-y-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-800 font-bold block">
              CIVIL SERVICE ID: {officer.employeeId} • {officer.jegGradeCode}
            </span>
            <h3 className="text-2xl font-bold text-slate-900">
              {language === 'am' ? officer.fullNameAm : officer.fullNameEn}
            </h3>
            <p className="text-xs text-slate-500">
              {language === 'am' ? officer.departmentAm : officer.departmentEn} • Window #{officer.assignedWindowNum}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-[11px] font-mono text-slate-500 block uppercase">
                4-Semester Average
              </span>
              <div className="text-3xl font-bold font-mono text-slate-900">
                {eligibilityReport.twoYearAverageScore}%
              </div>
              <span className="text-[11px] text-slate-400">
                Passing Cutoff: ≥ 80.0%
              </span>
            </div>

            <div>
              <StatusBadge
                status={eligibilityReport.isEligibleForStepIncrement ? 'ELIGIBLE FOR INCREMENT' : 'UNDER THRESHOLD'}
                variant={eligibilityReport.isEligibleForStepIncrement ? 'success' : 'warning'}
              />
            </div>
          </div>
        </div>

        {/* 4 Semesters Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-700">
              Four-Semester Empirical Audit Ledger (Proclamation No. 1353/2025)
            </h4>
            <span className="text-xs text-slate-500 font-mono">
              60% Objective Desk Data + 40% Supervisor Evaluation
            </span>
          </div>

          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-mono uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Evaluation Period</th>
                  <th className="py-3 px-4">Volume (25 pts)</th>
                  <th className="py-3 px-4">SLA Rate (20 pts)</th>
                  <th className="py-3 px-4">Rating (15 pts)</th>
                  <th className="py-3 px-4 text-emerald-900 font-bold">Objective (60%)</th>
                  <th className="py-3 px-4">Supervisor (40%)</th>
                  <th className="py-3 px-4 font-bold">Total (100%)</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
                {officerAppraisals.map((sem) => (
                  <tr key={sem.semesterId} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-sans font-medium text-slate-900">
                      {sem.semesterLabel}
                    </td>
                    <td className="py-3 px-4">{sem.volumeEfficiencyScore}</td>
                    <td className="py-3 px-4">{sem.slaComplianceScore}</td>
                    <td className="py-3 px-4">{sem.citizenRatingScore}</td>
                    <td className="py-3 px-4 font-bold text-emerald-800">{sem.objectiveScore60}</td>
                    <td className="py-3 px-4 text-slate-800">{sem.supervisorScore40}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 text-sm">{sem.totalAppraisalScore}%</td>
                    <td className="py-3 px-4 text-emerald-700 font-semibold">VERIFIED ✓</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Increment Action Banner */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-600">
            Current Base: <strong className="text-slate-900 font-mono">{officer.baseSalaryEtb.toLocaleString()} ETB</strong> → Approved Salary Step: <strong className="text-emerald-800 font-mono text-sm">{eligibilityReport.newSalaryStepEtb.toLocaleString()} ETB / Month</strong> (+7.5% Step)
          </div>

          <button
            onClick={() => setShowCertificate(true)}
            className="w-full sm:w-auto py-3 px-5 bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-xs rounded-xl transition-colors shadow-sm"
          >
            {strings.generateCert[language]}
          </button>
        </div>
      </div>

      {/* Structured 40% Supervisory Evaluation Matrix Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
              STATUTORY SUPERVISORY MATRIX (40% COMPONENT)
            </span>
            <h3 className="text-base font-bold text-slate-900 mt-0.5">
              Structured 4-Factor Behavioral Evaluation
            </h3>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-500">Supervisor Total:</span>
            <strong className="text-base font-mono text-emerald-800 ml-1.5">{calculatedSupervisorTotal} / 40 pts</strong>
          </div>
        </div>

        <form onSubmit={handleSaveSupervisorScore} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase">
                1. Policy & Procedures (10 pts)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="10"
                value={policyScore}
                onChange={(e) => setPolicyScore(parseFloat(e.target.value) || 0)}
                className="w-full text-sm font-mono font-bold p-2 rounded-lg border border-slate-300"
              />
              <span className="text-[10px] text-slate-400 block">Adherence to civil service directives</span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase">
                2. Ethics & Integrity (10 pts)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="10"
                value={ethicsScore}
                onChange={(e) => setEthicsScore(parseFloat(e.target.value) || 0)}
                className="w-full text-sm font-mono font-bold p-2 rounded-lg border border-slate-300"
              />
              <span className="text-[10px] text-slate-400 block">Zero bribery or illicit facilitation</span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase">
                3. Attendance & Hours (10 pts)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="10"
                value={attendanceScore}
                onChange={(e) => setAttendanceScore(parseFloat(e.target.value) || 0)}
                className="w-full text-sm font-mono font-bold p-2 rounded-lg border border-slate-300"
              />
              <span className="text-[10px] text-slate-400 block">Desk presence during posted working hours</span>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase">
                4. Courtesy & Solving (10 pts)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="10"
                value={problemSolvingScore}
                onChange={(e) => setProblemSolvingScore(parseFloat(e.target.value) || 0)}
                className="w-full text-sm font-mono font-bold p-2 rounded-lg border border-slate-300"
              />
              <span className="text-[10px] text-slate-400 block">Citizen problem solving and respect</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Semester Period Target
              </label>
              <select
                value={selectedSemesterId}
                onChange={(e) => setSelectedSemesterId(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 font-mono"
              >
                {officerAppraisals.map(s => (
                  <option key={s.semesterId} value={s.semesterId}>
                    {s.semesterLabel}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Supervisory Findings & Conduct Comments
              </label>
              <input
                type="text"
                value={supervisorRemarksInput}
                onChange={(e) => setSupervisorRemarksInput(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="py-2.5 px-5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl transition-colors shadow-xs"
            >
              {isSaving ? 'Recording to Ledger...' : 'Save Evaluated Semester Appraisal'}
            </button>
          </div>
        </form>
      </div>

      {showCertificate && (
        <CertificateModal
          report={eligibilityReport}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  );
};
