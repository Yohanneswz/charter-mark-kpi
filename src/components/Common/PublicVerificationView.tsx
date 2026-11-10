// Public Cryptographic Certificate & Ticket Slip Verification Portal
import React, { useState, useEffect } from 'react';

interface PublicVerificationViewProps {
  hashParam: string;
  onBack: () => void;
}

export const PublicVerificationView: React.FC<PublicVerificationViewProps> = ({
  hashParam,
  onBack
}) => {
  const [query, setQuery] = useState<string>(hashParam || '');
  const [activeTab, setActiveTab] = useState<'appraisal' | 'ticket'>('appraisal');
  const [verificationData, setVerificationData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const performVerification = (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setVerificationData(null);
      setError(null);
      return;
    }
    setIsLoading(true);
    setError(null);

    fetch(`/api/certificates/verify/${encodeURIComponent(searchQuery.trim())}`)
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Record or signature not found in central registry.');
        }
        return res.json();
      })
      .then((data) => {
        setVerificationData(data);
        setError(null);
      })
      .catch((err) => {
        setVerificationData(null);
        setError(err.message || 'Verification lookup failed.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (hashParam) {
      setQuery(hashParam);
      performVerification(hashParam);
    }
  }, [hashParam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performVerification(query);
  };

  return (
    <div className="max-w-2xl w-full mx-auto px-4 py-8 font-sans">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
        {/* Sovereign Header */}
        <div className="text-center space-y-2 border-b border-slate-100 pb-5">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-950 text-emerald-300 border-2 border-emerald-700 flex items-center justify-center font-serif font-bold text-sm shadow-xs">
            FDRE
          </div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-800 font-bold block">
            CENTRAL PUBLIC SERVICE VERIFICATION PORTAL
          </span>
          <h2 className="text-xl font-bold text-slate-900 font-serif">
            Federal Civil Service Commission of Ethiopia
          </h2>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Authenticates Two-Year Salary Step Increments & Citizen Service Ticket Slips pursuant to Proclamation No. 1353/2025.
          </p>
        </div>

        {/* Verification Mode Selector */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-mono">
          <button
            type="button"
            onClick={() => {
              setActiveTab('appraisal');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'appraisal' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            📜 2-Year Appraisal Certificate
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('ticket');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-lg font-semibold transition-all ${
              activeTab === 'ticket' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            🎟️ Citizen Ticket & Fee Receipt
          </button>
        </div>

        {/* Lookup Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 font-mono">
            {activeTab === 'appraisal' ? 'Certificate Hash, Serial #, or Employee ID' : 'Ticket Number or Session ID'}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={activeTab === 'appraisal' ? 'e.g. ETH-CSC-4491, off-101, or CSC/1353/...' : 'e.g. TC-101, TR-101, or DA-101'}
              className="flex-1 text-xs font-mono p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-700 bg-slate-50"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-medium font-mono transition-colors shadow-xs"
            >
              {isLoading ? 'Verifying...' : 'Verify Now'}
            </button>
          </div>

          {/* Quick Demo Samples */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono">
            <span className="text-slate-400">Quick Test:</span>
            {activeTab === 'appraisal' ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('ETH-CSC-4491');
                    performVerification('ETH-CSC-4491');
                  }}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 underline"
                >
                  Alemayehu Tadesse (ETH-CSC-4491)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('off-102');
                    performVerification('off-102');
                  }}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 underline"
                >
                  Almaz Bekele (Window 1)
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('TC-101');
                    performVerification('TC-101');
                  }}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 underline"
                >
                  Ticket #TC-101 (Tax Clearance)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setQuery('TR-101');
                    performVerification('TR-101');
                  }}
                  className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 underline"
                >
                  Ticket #TR-101 (Trade Renewal)
                </button>
              </>
            )}
          </div>
        </form>

        {/* Verification Result Display */}
        {isLoading ? (
          <div className="text-center py-10 space-y-2 font-mono text-xs text-slate-500">
            <div className="animate-spin w-7 h-7 border-2 border-emerald-800 border-t-transparent rounded-full mx-auto" />
            <p>Querying Federal Civil Service Commission Central Cryptographic Register...</p>
          </div>
        ) : error ? (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1.5 text-center">
            <div className="font-bold text-sm">Verification Record Not Found</div>
            <p>{error}</p>
            <p className="text-[11px] text-rose-600 font-mono">Query: {query}</p>
          </div>
        ) : verificationData ? (
          <div className="space-y-5 border-t border-slate-100 pt-5">
            {verificationData.type === 'TICKET_RECEIPT' ? (
              /* Ticket Verification Card */
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-800 text-white text-xs font-mono font-bold tracking-wider mb-1">
                    GENUINE CITIZEN SERVICE RECEIPT ✓
                  </span>
                  <h4 className="text-sm font-bold text-emerald-950">
                    Municipal Transaction Verified in Bole Sub-City Service Ledger
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px]">TICKET NUMBER</span>
                    <strong className="text-slate-900 text-base block font-bold">{verificationData.ticketNumber}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">WINDOW #</span>
                    <strong className="text-slate-900 text-base block font-bold">Window #{verificationData.windowNum}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">OFFICER</span>
                    <strong className="text-slate-900 block">{verificationData.officerNameEn} ({verificationData.officerNameAm})</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">SERVICE</span>
                    <strong className="text-slate-900 block">{verificationData.serviceNameEn}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">STATUTORY FEE</span>
                    <strong className="text-emerald-800 text-sm block">
                      {verificationData.officialFeeEtb === 0 ? '0.00 ETB (FREE SERVICE)' : `${verificationData.officialFeeEtb}.00 ETB`}
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">CHARTER STATUS</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                      verificationData.metCharterSla ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {verificationData.metCharterSla ? 'ON-TIME (CHARTER MET)' : 'SLA BREACH'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">DURATION</span>
                    <strong className="text-slate-900 block">{verificationData.actualDurationMin} min (Standard: {verificationData.standardDurationMin}m)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">FAYDA ID VERIFICATION</span>
                    <strong className="text-slate-900 block">{verificationData.faydaFinHash || 'Kebele Physical ID'}</strong>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-500 space-y-1 border-t border-slate-100 pt-3">
                  <div>Cryptographic Proof: <strong className="text-slate-900">{verificationData.verificationHash}</strong></div>
                  <div>Timestamp: <strong>{new Date(verificationData.verifiedAt).toLocaleString()}</strong></div>
                </div>
              </div>
            ) : (
              /* 2-Year Appraisal Certificate Card */
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-800 text-white text-xs font-mono font-bold tracking-wider mb-1">
                    CRYPTOGRAPHIC SIGNATURE VALID ✓
                  </span>
                  <h4 className="text-sm font-bold text-emerald-950 font-serif">
                    Official Two-Year Appraisal Certified by Civil Service Commission
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs font-mono p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px]">EMPLOYEE NAME</span>
                    <strong className="text-slate-900 text-sm block font-serif">
                      {verificationData.officerNameEn} ({verificationData.officerNameAm})
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">CIVIL SERVICE ID</span>
                    <strong className="text-slate-900 text-sm block">{verificationData.employeeId}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">JEG GRADE CODE</span>
                    <strong className="text-slate-900 block">{verificationData.jegGradeCode}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">DEPARTMENT / DESK</span>
                    <strong className="text-slate-900 block">{verificationData.department}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">2-YEAR CUMULATIVE AVERAGE</span>
                    <strong className="text-emerald-800 text-base block">{verificationData.twoYearAverageScore}%</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">APPROVED SALARY STEP</span>
                    <strong className="text-slate-900 text-base block">{verificationData.stepSalaryEtb.toLocaleString()} ETB / Month</strong>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-slate-500 space-y-1 border-t border-slate-100 pt-3">
                  <div>Certificate Serial: <strong className="text-slate-900">{verificationData.serialNumber}</strong></div>
                  <div>Digital Hash: <strong className="text-slate-900">{verificationData.verificationHash}</strong></div>
                  <div>Verification Timestamp: <strong>{new Date(verificationData.verifiedAt).toLocaleString()}</strong></div>
                </div>
              </div>
            )}
          </div>
        ) : null}

        <div className="pt-2 text-center">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-xl transition-colors font-mono"
          >
            ← Return to Desk Stands Directory
          </button>
        </div>
      </div>
    </div>
  );
};
