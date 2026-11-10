// Frontline Civil Servant Workbench with Full Statutory Controls & Document Verification
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useSystem } from '../context/SystemContext';
import { initialOfficers, initialCharterServices } from '../data/seedData';
import { computeObjectiveScore60 } from '../utils/kpiCalculator';
import { StatusBadge } from '../components/Common/StatusBadge';
import { SovereignGovHeader } from '../components/Layout/SovereignGovHeader';

export const ClerkPage: React.FC = () => {
  const navigate = useNavigate();
  const { 
    language, 
    officers, 
    sessions, 
    services, 
    completeSession, 
    startCitizenSession,
    refreshData 
  } = useSystem();

  const [enteredPin, setEnteredPin] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [verifiedDocs, setVerifiedDocs] = useState<string[]>([]);
  const [showTransferModal, setShowTransferModal] = useState<boolean>(false);
  const [transferWindow, setTransferWindow] = useState<number>(3);
  const [isHolding, setIsHolding] = useState<boolean>(false);
  const [holdReason, setHoldReason] = useState<string>('Pending Document Photocopy');

  useEffect(() => {
    const savedUser = localStorage.getItem('CHARTER_AUTH_USER');
    if (!savedUser) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(savedUser));
  }, [navigate]);

  // Real-time backend sync: Polls every 2 seconds
  useEffect(() => {
    const pollInterval = setInterval(() => {
      refreshData();
    }, 2000);
    return () => clearInterval(pollInterval);
  }, [refreshData]);

  const prevSessionIdRef = useRef<string | null>(null);

  const safeOfficers = officers.length > 0 ? officers : initialOfficers;
  const safeServices = services.length > 0 ? services : initialCharterServices;

  // Bind strictly to logged in officer
  const officer = safeOfficers.find(o => o.id === user?.officerId) || safeOfficers[0];

  // Active session
  const activeSession = sessions.find(
    s => s.officerId === officer.id && (s.sessionStatus === 'IN_PROGRESS' || s.sessionStatus === 'HELD')
  );

  const activeService = safeServices.find(s => s.id === activeSession?.serviceId) || safeServices[0];
  const officerSessions = sessions.filter(s => s.officerId === officer.id);
  const kpi = computeObjectiveScore60(officerSessions, 20);

  // Play subtle bell chime when a citizen checks in at this counter
  useEffect(() => {
    if (activeSession && activeSession.id !== prevSessionIdRef.current) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(659.25, ctx.currentTime);
          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        }
      } catch (e) {
        // Ignored
      }
    }
    prevSessionIdRef.current = activeSession?.id || null;
  }, [activeSession]);
  useEffect(() => {
    if (activeService?.requiredDocuments?.en) {
      setVerifiedDocs(activeService.requiredDocuments.en);
    }
  }, [activeService]);

  const handleToggleDoc = (doc: string) => {
    setVerifiedDocs(prev => 
      prev.includes(doc) ? prev.filter(d => d !== doc) : [...prev, doc]
    );
  };

  const handleCompleteWithPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession) return;

    if (enteredPin.trim() === activeSession.completionPin) {
      const success = await completeSession(
        activeSession.id, 
        5, 
        'NONE', 
        `Completed at Window #${officer.assignedWindowNum}. Docs verified: ${verifiedDocs.length}`,
        enteredPin.trim()
      );
      if (success) {
        setEnteredPin('');
        setPinError(null);
      } else {
        setPinError('Failed to record completion on central server.');
      }
    } else {
      setPinError('Invalid 4-digit PIN. Please verify with citizen.');
    }
  };

  const handleHoldSession = async () => {
    if (!activeSession) return;
    await fetch(`/api/sessions/${activeSession.id}/hold`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: holdReason })
    });
    setIsHolding(false);
    await refreshData();
  };

  const handleResumeSession = async () => {
    if (!activeSession) return;
    await fetch(`/api/sessions/${activeSession.id}/resume`, { method: 'POST' });
    await refreshData();
  };

  const handleTransferSession = async () => {
    if (!activeSession) return;
    await fetch(`/api/sessions/${activeSession.id}/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetWindowNum: transferWindow })
    });
    setShowTransferModal(false);
    await refreshData();
  };

  const handleStatusChange = async (newStatus: string, reason?: string) => {
    await fetch(`/api/officers/${officer.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, statusReason: reason })
    });
    await refreshData();
  };

  const handleLogout = () => {
    localStorage.removeItem('CHARTER_AUTH_TOKEN');
    localStorage.removeItem('CHARTER_AUTH_USER');
    navigate('/login');
  };

  if (!user) return null;

  const todayCompleted = officerSessions.filter(s => s.sessionStatus === 'COMPLETED');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SovereignGovHeader currentModule={`Window #${officer.assignedWindowNum} Frontline Terminal`} />

      {/* Counter Controls Micro-Bar */}
      <div className="bg-slate-800 text-white border-b border-slate-700 px-4 py-2 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span className="font-mono text-emerald-400 font-bold">
              WINDOW #{officer.assignedWindowNum}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-200">
              {language === 'am' ? officer.fullNameAm : officer.fullNameEn} ({officer.employeeId})
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="inline-flex rounded-lg bg-slate-900 p-0.5 border border-slate-700 text-xs">
              <button
                onClick={() => handleStatusChange('ACTIVE')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  officer.status === 'ACTIVE' ? 'bg-emerald-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                ● Online
              </button>
              <button
                onClick={() => handleStatusChange('ON_BREAK', 'Official Tea Break')}
                className={`px-2.5 py-1 rounded transition-colors ${
                  officer.status === 'ON_BREAK' ? 'bg-amber-700 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                ⏸ On Break
              </button>
            </div>

            <Link
              to={`/desk/${officer.assignedWindowNum}`}
              target="_blank"
              className="text-emerald-400 hover:underline font-mono hidden sm:inline"
            >
              Open Window QR ↗
            </Link>

            <button
              onClick={handleLogout}
              className="text-slate-400 hover:text-white underline"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Officer Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-200 shadow-xs">
              <img src={officer.photoUrl} alt={officer.fullNameEn} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {language === 'am' ? officer.fullNameAm : officer.fullNameEn}
              </h3>
              <p className="text-xs text-slate-500">
                {language === 'am' ? officer.departmentAm : officer.departmentEn} • Window #{officer.assignedWindowNum}
              </p>
              <span className="text-[11px] font-mono text-slate-400">
                Employee ID: {officer.employeeId} • JEG Grade: {officer.jegGradeCode} • Base Salary: {officer.baseSalaryEtb.toLocaleString()} ETB
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] font-mono text-slate-400 uppercase block">Window Status</span>
              <StatusBadge status={activeSession ? (activeSession.sessionStatus === 'HELD' ? 'ON HOLD' : 'PROCESSING') : officer.status} variant={activeSession ? 'info' : 'success'} />
            </div>
            {user.role !== 'CLERK' && (
              <Link to="/operations" className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-xl transition-colors">
                Executive Console →
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Active Citizen Processing Box */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Active Transaction at Window #{officer.assignedWindowNum}
              </h3>
              {activeSession && (
                <div className="flex items-center gap-2">
                  {activeSession.sessionStatus === 'HELD' ? (
                    <button
                      onClick={handleResumeSession}
                      className="px-2.5 py-1 bg-emerald-700 text-white text-[11px] font-medium rounded-lg"
                    >
                      Resume Ticket
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsHolding(true)}
                      className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[11px] font-medium rounded-lg"
                    >
                      Hold / Pause
                    </button>
                  )}
                  <button
                    onClick={() => setShowTransferModal(true)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium rounded-lg"
                  >
                    Transfer Window
                  </button>
                </div>
              )}
            </div>

            {activeSession ? (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-emerald-800 text-sm">
                      TICKET #{activeSession.ticketNumber || activeSession.id.slice(-6)}
                    </span>
                    <span className="font-mono text-slate-600">Citizen: {activeSession.citizenPhoneHash}</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">
                    {language === 'am' ? activeService?.nameAm : activeService?.nameEn}
                  </h4>
                  <div className="text-xs text-slate-500">
                    Citizen Charter Limit: <strong className="text-slate-800">{activeService?.standardDurationMin} min</strong> • Statutory Fee: <strong className="text-emerald-800">{activeService?.officialFeeEtb === 0 ? 'FREE' : `${activeService?.officialFeeEtb} ETB`}</strong>
                  </div>
                </div>

                {/* Prerequisite Document Verification Checklist */}
                <div className="space-y-2 border border-slate-200 rounded-xl p-4 bg-white">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
                    Statutory Prerequisite Document Checklist
                  </span>
                  <div className="space-y-1.5">
                    {activeService?.requiredDocuments?.en?.map((doc: string, idx: number) => {
                      const isChecked = verifiedDocs.includes(doc);
                      return (
                        <label
                          key={idx}
                          className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer select-none"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleDoc(doc)}
                            className="rounded border-slate-300 text-emerald-800 focus:ring-emerald-700"
                          />
                          <span className={isChecked ? 'text-slate-900 font-medium' : 'text-slate-500'}>
                            {doc}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* PIN Verification & Conclude Form */}
                <form onSubmit={handleCompleteWithPin} className="space-y-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                      Enter Citizen's 4-Digit Completion PIN
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
                      className="w-full text-center text-3xl font-mono tracking-widest py-3 px-4 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
                    />
                    {pinError && <p className="text-xs text-rose-600 mt-1 font-medium">{pinError}</p>}
                    <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
                      <span>Citizen received this PIN on check-in. Hint: <strong className="font-mono text-slate-700">{activeSession.completionPin}</strong></span>
                      <button
                        type="button"
                        onClick={() => {
                          setEnteredPin(activeSession.completionPin);
                          setPinError(null);
                        }}
                        className="text-[11px] text-emerald-800 underline font-mono font-bold hover:text-emerald-950"
                      >
                        Auto-fill PIN
                      </button>
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-xs rounded-xl transition-colors shadow-sm"
                  >
                    Verify PIN & Conclude Service File
                  </button>
                </form>
              </div>
            ) : (
              <div className="text-center py-12 space-y-4">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-lg font-mono">
                  —
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">
                    Window #{officer.assignedWindowNum} is Ready
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                    Ready for next ticket. When a citizen scans the QR stand at Window #{officer.assignedWindowNum}, it appears here instantly.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const defaultServiceId = officer.assignedWindowNum === 1 ? 'srv-02' : officer.assignedWindowNum === 2 ? 'srv-03' : officer.assignedWindowNum === 4 ? 'srv-04' : 'srv-01';
                    startCitizenSession(defaultServiceId, officer.id, officer.assignedWindowNum, 'WALK-IN CITIZEN');
                  }}
                  className="py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium rounded-xl transition-colors shadow-xs"
                >
                  Start Assisted Walk-In Ticket
                </button>
              </div>
            )}
          </div>

          {/* Daily Personal Metrics Snapshot */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
                  STATUTORY EMPIRICAL METRICS (60% COMPONENT)
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">
                  Today's Cumulative Performance Ledger
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Completed</span>
                  <span className="text-2xl font-bold font-mono text-slate-900 mt-0.5 block">{kpi.completedCount}</span>
                  <span className="text-[10px] text-slate-500">Transactions Today</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">SLA Compliance</span>
                  <span className="text-2xl font-bold font-mono text-emerald-800 mt-0.5 block">{kpi.slaComplianceRate}%</span>
                  <span className="text-[10px] text-slate-500">Within Charter Limit</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Citizen Rating</span>
                  <span className="text-2xl font-bold font-mono text-slate-900 mt-0.5 block">
                    {kpi.averageRating > 0 ? `${kpi.averageRating}★` : '5.0★'}
                  </span>
                  <span className="text-[10px] text-slate-500">Verified Citizen Scores</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Objective Score</span>
                  <span className="text-2xl font-bold font-mono text-emerald-900 mt-0.5 block">{kpi.objectiveScore60} / 60</span>
                  <span className="text-[10px] text-slate-500">Proclamation 1353 Cap</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
                Under Proclamation No. 1353/2025, every verified transaction timestamp mathematically accumulates into your official 2-year appraisal.
              </div>
            </div>

            {/* Today's Closed Tickets Ledger */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-bold block">
                Today's Concluded Tickets ({todayCompleted.length})
              </span>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {todayCompleted.map((s) => (
                  <div key={s.id} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 text-xs flex items-center justify-between">
                    <div>
                      <strong className="text-slate-900 font-mono block">{s.ticketNumber || s.id.slice(-6)}</strong>
                      <span className="text-[11px] text-slate-500">Duration: {s.actualDurationMin} min</span>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                        s.metCharterSla ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {s.metCharterSla ? 'ON-TIME' : 'DELAYED'}
                      </span>
                      <span className="block text-[11px] text-slate-500 mt-0.5">{s.citizenRating}★</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Transfer Ticket to Another Window</h3>
            <p className="text-xs text-slate-500">Direct the citizen's active session to a different service desk.</p>
            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">Target Window</label>
              <select
                value={transferWindow}
                onChange={(e) => setTransferWindow(parseInt(e.target.value, 10))}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              >
                <option value={1}>Window #1 — Almaz Bekele (Trade)</option>
                <option value={2}>Window #2 — Dawit Tsegaye (Vital Events)</option>
                <option value={3}>Window #3 — Alemayehu Tadesse (Tax)</option>
                <option value={4}>Window #4 — Rahel Kebede (Legal Auth)</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowTransferModal(false)} className="px-3 py-1.5 text-xs text-slate-600">Cancel</button>
              <button onClick={handleTransferSession} className="px-4 py-1.5 bg-emerald-800 text-white text-xs font-medium rounded-lg">Confirm Transfer</button>
            </div>
          </div>
        </div>
      )}

      {/* Hold Modal */}
      {isHolding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900">Pause / Hold Ticket</h3>
            <p className="text-xs text-slate-500">Record a statutory reason for pausing the turnaround stopwatch.</p>
            <div>
              <select
                value={holdReason}
                onChange={(e) => setHoldReason(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200"
              >
                <option value="Pending Document Photocopy">Pending Document Photocopy (ፎቶ ኮፒ እየተደረገ)</option>
                <option value="Kebele Network / System Latency">Kebele Network / System Latency (የቀበሌ ሲስተም መቆራረጥ)</option>
                <option value="Physical Archive Document Fetch">Physical Archive Document Fetch (ከመዝገብ ቤት ሰነድ ማምጣት)</option>
                <option value="Witness Consultation">Witness Consultation (የምስክሮች ቃል)</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIsHolding(false)} className="px-3 py-1.5 text-xs text-slate-600">Cancel</button>
              <button onClick={handleHoldSession} className="px-4 py-1.5 bg-amber-700 text-white text-xs font-medium rounded-lg">Confirm Hold</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
