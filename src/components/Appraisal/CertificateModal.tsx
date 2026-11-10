// Official Verifiable Salary Increment Eligibility Certificate
// Mandated under Ethiopian Federal Civil Servants Proclamation No. 1353/2025
import React from 'react';
import { TwoYearEligibilityReport } from '../../types';
import { QrCodeDisplay } from '../../utils/qrGenerator';
import { formatFullEthiopianDateTime } from '../../utils/ethiopianCalendar';

interface CertificateModalProps {
  report: TwoYearEligibilityReport;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  report,
  onClose
}) => {
  const { officer, twoYearAverageScore, newSalaryStepEtb, certificateSerialNumber, verificationHash, issuedDateUtc } = report;

  const handlePrint = () => {
    window.print();
  };

  const originUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
  const verificationQrUrl = `${originUrl}/verify?hash=${verificationHash}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-10 shadow-2xl border border-slate-200 space-y-6 my-8 print:m-0 print:p-8 print:shadow-none print:border-none">
        {/* Certificate Border Frame */}
        <div className="border-4 border-double border-emerald-900/80 p-6 sm:p-8 rounded-xl bg-gradient-to-b from-stone-50/40 to-white relative overflow-hidden">
          {/* Institutional Watermark background */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none text-9xl font-serif font-black">
            FDRE
          </div>

          {/* Certificate Header */}
          <div className="text-center space-y-2 border-b-2 border-emerald-950 pb-5">
            <div className="w-16 h-16 mx-auto rounded-full border-2 border-emerald-900 flex items-center justify-center bg-emerald-950 text-white font-serif font-bold text-sm">
              FDRE
            </div>
            <div className="space-y-0.5">
              <span className="text-xs uppercase font-serif tracking-widest text-emerald-900 font-bold block">
                Federal Democratic Republic of Ethiopia
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 tracking-tight">
                Ethiopian Competency & Management Institute (ECMI)
              </h2>
              <h3 className="text-sm font-serif font-semibold text-emerald-950">
                የፌዴራል ሲቪል ሰርቪስ ኮሚሽን • የደመወዝ እርከን ጭማሪ የብቃት ማረጋገጫ ምስክር ወረቀት
              </h3>
              <p className="text-[11px] font-mono text-slate-500 pt-1">
                Issued pursuant to Federal Civil Servants Proclamation No. 1353/2025 (Section 42: Two-Year Appraisal Increment)
              </p>
            </div>
          </div>

          {/* Certificate Body Text */}
          <div className="py-6 space-y-5 text-slate-800 text-xs sm:text-sm leading-relaxed">
            <p className="text-center italic text-slate-600">
              This is to officially certify that the civil servant named hereunder has successfully satisfied the mandatory four-semester (two-year) empirical performance appraisal benchmark:
            </p>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-emerald-50/40 border border-emerald-200/60 font-mono text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">FULL NAME (ሙሉ ስም):</span>
                <strong className="text-slate-900 text-sm block">
                  {officer.fullNameEn} ({officer.fullNameAm})
                </strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">CIVIL SERVICE ID:</span>
                <strong className="text-slate-900 text-sm block">{officer.employeeId}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">JEG OCCUPATIONAL GRADE:</span>
                <strong className="text-slate-900 block">{officer.jegGradeCode}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">WINDOW & DESK:</span>
                <strong className="text-slate-900 block">Window #{officer.assignedWindowNum} — {officer.departmentEn}</strong>
              </div>
            </div>

            {/* 4 Semesters Table */}
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="min-w-full text-center text-xs divide-y divide-slate-200">
                <thead className="bg-slate-100 font-mono text-slate-600">
                  <tr>
                    <th className="py-2 px-3 text-left">Semester Period</th>
                    <th className="py-2 px-3">Objective (60%)</th>
                    <th className="py-2 px-3">Supervisor (40%)</th>
                    <th className="py-2 px-3">Total (100%)</th>
                    <th className="py-2 px-3">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono">
                  {report.semesters.map(s => (
                    <tr key={s.semesterId}>
                      <td className="py-2 px-3 text-left font-medium text-slate-900">{s.semesterLabel}</td>
                      <td className="py-2 px-3 text-emerald-800 font-bold">{s.objectiveScore60}</td>
                      <td className="py-2 px-3 text-slate-700">{s.supervisorScore40}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{s.totalAppraisalScore}%</td>
                      <td className="py-2 px-3 text-emerald-700 font-medium">VERIFIED ✓</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Aggregate Score & Salary Increment Determination */}
            <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 block">
                  Two-Year Cumulative Average Score
                </span>
                <div className="text-3xl font-bold font-mono mt-0.5">
                  {twoYearAverageScore}% <span className="text-xs font-normal text-slate-400">/ 100%</span>
                </div>
                <span className="text-[11px] text-slate-300">
                  Statutory Passing Threshold: ≥ 80.0%
                </span>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 block">
                  Approved Salary Step Increment
                </span>
                <div className="text-2xl font-bold font-mono text-emerald-300 mt-0.5">
                  {newSalaryStepEtb.toLocaleString()} ETB / Month
                </div>
                <span className="text-[11px] text-slate-400">
                  Adjusted from {officer.baseSalaryEtb.toLocaleString()} ETB base (+7.5% Step)
                </span>
              </div>
            </div>

            {/* Verification Footer with Cryptographic Hash & Camera-Scannable QR */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="space-y-1 text-left">
                <div className="text-[11px] font-mono text-slate-500">
                  Certificate Serial: <strong className="text-slate-900">{certificateSerialNumber}</strong>
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  Cryptographic Hash: <strong className="text-slate-900">{verificationHash}</strong>
                </div>
                <div className="text-[11px] font-mono text-slate-500">
                  Official Issue Date: <strong className="text-slate-900">{formatFullEthiopianDateTime(issuedDateUtc, 'en')}</strong>
                </div>
                <div className="text-[10px] text-slate-400 italic pt-1">
                  Scan QR code to verify validity against Central Federal Civil Service Commission register.
                </div>
              </div>

              <div className="shrink-0">
                <QrCodeDisplay
                  value={verificationQrUrl}
                  size={105}
                  label="SCAN TO VERIFY"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Controls (Hidden in print mode) */}
        <div className="flex items-center justify-end gap-3 print:hidden pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-xs rounded-lg transition-colors shadow-sm flex items-center gap-2"
          >
            Print Official Certificate
          </button>
        </div>
      </div>
    </div>
  );
};
