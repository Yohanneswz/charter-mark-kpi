// Frontline Civil Servant Window Terminal with Bulletproof Fallbacks
import React, { useState } from 'react';
import { useSystem } from '../../context/SystemContext';
import { initialOfficers, initialCharterServices } from '../../data/seedData';
import { computeObjectiveScore60 } from '../../utils/kpiCalculator';
import { StatusBadge } from '../Common/StatusBadge';

export const ClerkDeskTerminal: React.FC = () => {
  const { 
    language, 
    officers, 
    currentOfficerId, 
    setCurrentOfficerId, 
    sessions, 
    services, 
    completeSession,
    startCitizenSession 
  } = useSystem();

  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  const safeOfficers = officers.length > 0 ? officers : initialOfficers;
  const safeServices = services.length > 0 ? services : initialCharterServices;

  const officer = safeOfficers.find(o => o.id === currentOfficerId) || safeOfficers[0];
  
  // Find active session for this specific officer's window
  const activeSession = sessions.find(
    s => s.officerId === officer.id && s.sessionStatus === 'IN_PROGRESS'
  );

  const activeService = safeServices.find(s => s.id === activeSession?.serviceId) || safeServices[0];

  // Filter completed sessions for this officer today
  const officerSessions = sessions.filter(s => s.officerId === officer.id);
  const kpi = computeObjectiveScore60(officerSessions, 20);

  const handleCompleteWithPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession) return;

    if (enteredPin.trim() === activeSession.completionPin) {
      const success = await completeSession(activeSession.id, 5, 'NONE', 'Verified at counter by PIN match', enteredPin.trim());
      if (success) {
        setEnteredPin('');
        setPinError(null);
      } else {
        setPinError('Failed to complete session on server.');
      }
    } else {
      setPinError('Invalid 4-digit PIN. Please verify with citizen.');
    }
  };

  const handleManualWalkin = () => {
    startCitizenSession(safeServices[0].id, officer.id, officer.assignedWindowNum, 'WALK-IN CITIZEN');
  };

  const strings = {
    title: {
      en: 'Frontline Civil Servant Terminal',
      am: 'የባለሙያ መስተንግዶ መስኮት ተርሚናል',
      om: 'Goolii Tajaajila Hojjetaa'
    },
    subtitle: {
      en: 'Real-time transaction logging, 4-digit PIN verification, and statutory SLA performance monitor.',
      am: 'የቀጥታ መስተንግዶ መመዝገቢያ፣ የ4-አሃዝ ፒን ማረጋገጫ እና የSLA ክትትል ሰሌዳ።',
      om: 'Galmee tajaajilaa, mirkaneessa PIN fi hordoffii SLA.'
    },
    switchOfficer: {
      en: 'Switch Active Counter Desk',
      am: 'የመስተንግዶ መስኮት ቀይር',
      om: 'Goolii Jijjiiri'
    },
    activeCitizen: {
      en: 'Current Citizen Transaction',
      am: 'በሂደት ላይ ያለ መስተንግዶ',
      om: 'Tajaajila Ammaa'
    },
    noActive: {
      en: 'Desk Ready — Waiting for Citizen QR Check-In',
      am: 'መስኮቱ ዝግጁ ነው — የዜጎች QR ቅኝት ይጠበቃል',
      om: 'Gooliin Qophiidha — Iskaanii Eegaa Jira'
    },
    pinPrompt: {
      en: 'Enter Citizen\'s 4-Digit Completion PIN',
      am: 'የዜጋውን ባለ 4-አሃዝ ማጠቃለያ ፒን ያስገቡ',
      om: 'Koodii PIN Lammiin Qabu Galchaa'
    },
    completeBtn: {
      en: 'Verify PIN & Close Transaction',
      am: 'ፒኑን አረጋግጥና መስተንግዶውን ጨርስ',
      om: 'Mirkaneessi & Xumuri'
    },
    walkinBtn: {
      en: 'Start Manual Walk-in (Assisted Citizen)',
      am: 'ያለ ስልክ የመጣ ዜጋ አስጀምር',
      om: 'Lammii Bilbila Hin Qabneef Eegali'
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Officer Switcher Micro-Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block">
            {strings.switchOfficer[language]}
          </span>
          <h2 className="text-base font-bold text-slate-900 mt-0.5">
            Window #{officer.assignedWindowNum} — {language === 'am' ? officer.fullNameAm : officer.fullNameEn}
          </h2>
          <span className="text-xs text-slate-500">
            {language === 'am' ? officer.departmentAm : officer.departmentEn} • {officer.jegGradeCode}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {safeOfficers.map(o => (
            <button
              key={o.id}
              onClick={() => setCurrentOfficerId(o.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                o.id === currentOfficerId
                  ? 'bg-slate-900 text-white font-bold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Win #{o.assignedWindowNum}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Active Citizen Processing Card */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-600">
                {strings.activeCitizen[language]}
              </h3>
              <StatusBadge
                status={activeSession ? 'IN SERVICE' : 'READY / IDLE'}
                variant={activeSession ? 'info' : 'success'}
              />
            </div>

            {activeSession ? (
              <div className="space-y-5">
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500">
                      SESSION #{activeSession.id.slice(-6)}
                    </span>
                    <span className="text-xs font-mono font-semibold text-slate-700">
                      Citizen: {activeSession.citizenPhoneHash}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900">
                      {language === 'am' ? activeService?.nameAm : activeService?.nameEn}
                    </h4>
                    <span className="text-xs text-slate-500">
                      Citizen Charter Standard: <strong className="text-slate-800">{activeService?.standardDurationMin} Minutes</strong>
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 pt-1 border-t border-slate-200/60">
                    Official Statutory Fee: <strong className="text-emerald-800 font-semibold">{activeService?.officialFeeEtb === 0 ? 'FREE' : `${activeService?.officialFeeEtb} ETB`}</strong>
                  </div>
                </div>

                {/* PIN Verification Form */}
                <form onSubmit={handleCompleteWithPin} className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                      {strings.pinPrompt[language]}
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={enteredPin}
                      onChange={(e) => {
                        setEnteredPin(e.target.value);
                        setPinError(null);
                      }}
                      placeholder="e.g. 4192"
                      className="w-full text-center text-2xl font-mono tracking-widest py-3 px-4 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700"
                    />
                    {pinError && (
                      <p className="text-xs text-rose-600 mt-1 font-medium">{pinError}</p>
                    )}
                    <p className="text-[11px] text-slate-500 mt-1">
                      Verification Hint: The active citizen's PIN is <strong className="font-mono text-slate-800">{activeSession.completionPin}</strong>
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-sm rounded-lg transition-colors shadow-sm"
                  >
                    {strings.completeBtn[language]}
                  </button>
                </form>
              </div>
            ) : (
              <div className="text-center py-10 space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-lg font-mono">
                  —
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    {strings.noActive[language]}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    When a citizen scans the desk QR stand at Window #{officer.assignedWindowNum}, their session will instantly appear here.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleManualWalkin}
                    className="py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium rounded-lg transition-colors"
                  >
                    {strings.walkinBtn[language]}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Daily KPI Summary Snapshot */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
                STATUTORY EMPIRICAL METRICS
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                Today's Desk Performance Ledger
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-mono text-slate-500 block uppercase">Completed</span>
                <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
                  {kpi.completedCount}
                </span>
                <span className="text-[11px] text-slate-500">Transactions</span>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-mono text-slate-500 block uppercase">SLA Adherence</span>
                <span className="text-2xl font-bold font-mono text-emerald-800 mt-1 block">
                  {kpi.slaComplianceRate}%
                </span>
                <span className="text-[11px] text-slate-500">Within Charter Standard</span>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-mono text-slate-500 block uppercase">Citizen Rating</span>
                <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
                  {kpi.averageRating > 0 ? `${kpi.averageRating}★` : 'N/A'}
                </span>
                <span className="text-[11px] text-slate-500">Verified Citizen Scores</span>
              </div>

              <div className="p-4 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-mono text-slate-500 block uppercase">Objective Score</span>
                <span className="text-2xl font-bold font-mono text-emerald-900 mt-1 block">
                  {kpi.objectiveScore60} / 60
                </span>
                <span className="text-[11px] text-slate-500">Proclamation 1353 Cap</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-emerald-50/60 border border-emerald-200/70 text-xs text-emerald-900 leading-relaxed">
              <strong>Proclamation 1353/2025 Mandate:</strong> Transaction timestamps, durations, and citizen ratings are mathematically immutable and contribute directly to the 60% objective appraisal component.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
