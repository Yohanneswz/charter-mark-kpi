// Dedicated, Production-Grade Citizen Desk Experience with Fayda Digital ID & Digital Ticket Receipt
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSystem } from '../context/SystemContext';
import { initialOfficers, initialCharterServices } from '../data/seedData';
import { CitizenFeedbackModal } from '../components/Citizen/CitizenFeedbackModal';
import { formatFullEthiopianDateTime } from '../utils/ethiopianCalendar';
import { QrCodeDisplay } from '../utils/qrGenerator';

export const CitizenDeskPage: React.FC = () => {
  const { windowNum } = useParams<{ windowNum: string }>();
  const { 
    language, 
    setLanguage, 
    office, 
    officers, 
    services, 
    startCitizenSession, 
    sessions, 
    cancelSession,
    refreshData 
  } = useSystem();

  const winNumber = parseInt(windowNum || '1', 10);
  const safeOfficers = officers.length > 0 ? officers : initialOfficers;
  const safeServices = services.length > 0 ? services : initialCharterServices;

  const officer = safeOfficers.find(o => o.assignedWindowNum === winNumber) || safeOfficers[0];

  // Default service according to statutory window assignment
  const getWindowDefaultServiceId = (win: number): string => {
    switch (win) {
      case 1: return 'srv-02'; // Window 1: Almaz Bekele -> Trade License Renewal
      case 2: return 'srv-03'; // Window 2: Dawit Tsegaye -> Free Marital Status / Vital Events
      case 3: return 'srv-01'; // Window 3: Alemayehu Tadesse -> Tax Clearance Certificate
      case 4: return 'srv-04'; // Window 4: Rahel Kebede -> Power of Attorney Verification
      default: return 'srv-01';
    }
  };

  const [selectedServiceId, setSelectedServiceId] = useState<string>(getWindowDefaultServiceId(winNumber));
  const [phoneNumber, setPhoneNumber] = useState<string>('0911239845');
  const [faydaFin, setFaydaFin] = useState<string>('1094-8832-7719');
  const [useFayda, setUseFayda] = useState<boolean>(true);
  const [isFinishingSession, setIsFinishingSession] = useState<boolean>(false);
  const [evaluatingSession, setEvaluatingSession] = useState<any>(null);
  const [showSlipModal, setShowSlipModal] = useState<boolean>(false);
  const [currentUtc, setCurrentUtc] = useState<string>(new Date().toISOString());
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Auto-sync window assignment
  useEffect(() => {
    setSelectedServiceId(getWindowDefaultServiceId(winNumber));
  }, [winNumber]);

  // Regular clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentUtc(new Date().toISOString()), 10000);
    return () => clearInterval(timer);
  }, []);

  // Real-time backend auto-polling (every 2 seconds)
  useEffect(() => {
    const pollTimer = setInterval(() => {
      refreshData();
    }, 2000);
    return () => clearInterval(pollTimer);
  }, [refreshData]);

  const service = safeServices.find(s => s.id === selectedServiceId) || safeServices[0];

  // Check active session for this window
  const activeSession = sessions.find(
    s => s.windowNum === winNumber && (s.sessionStatus === 'IN_PROGRESS' || s.sessionStatus === 'HELD')
  );

  // Detect when session completes while open to automatically trigger feedback
  const prevActiveSessionRef = useRef<any>(null);
  useEffect(() => {
    if (prevActiveSessionRef.current && !activeSession) {
      // Session just transitioned to completed
      const recentlyCompleted = sessions.find(
        s => s.id === prevActiveSessionRef.current.id && s.sessionStatus === 'COMPLETED'
      );
      if (recentlyCompleted) {
        setEvaluatingSession(recentlyCompleted);
        setIsFinishingSession(true);
      }
    }
    prevActiveSessionRef.current = activeSession;
  }, [activeSession, sessions]);

  // Elapsed stopwatch effect when active
  useEffect(() => {
    if (!activeSession) return;
    const start = new Date(activeSession.startedAt).getTime();
    const update = () => {
      setElapsedSec(Math.max(0, Math.floor((Date.now() - start) / 1000)));
    };
    update();
    const intv = setInterval(update, 1000);
    return () => clearInterval(intv);
  }, [activeSession]);

  const handleStart = async () => {
    try {
      setIsLoading(true);
      await startCitizenSession(
        service.id, 
        officer.id, 
        officer.assignedWindowNum, 
        phoneNumber,
        useFayda ? faydaFin : undefined
      );
    } catch (e) {
      console.error('Failed to start ticket session', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelTicket = async () => {
    if (!activeSession) return;
    if (window.confirm('Are you sure you want to cancel this service ticket?')) {
      await cancelSession(activeSession.id);
    }
  };

  const standardSec = (service?.standardDurationMin || 25) * 60;
  const isOverdue = elapsedSec > standardSec;
  const elapsedMin = Math.floor(elapsedSec / 60);
  const elapsedRemainderSec = elapsedSec % 60;
  const progressPercent = Math.min(100, Math.round((elapsedSec / standardSec) * 100));

  const strings = {
    fdre: 'Federal Democratic Republic of Ethiopia',
    subCity: 'Bole Sub-City Woreda 03 One-Stop Center',
    activeTicket: 'ACTIVE SERVICE TICKET',
    pinTitle: 'SECRET 4-DIGIT COMPLETION PIN',
    pinNotice: 'Share this PIN with the officer only when your completed paperwork is handed back to you.',
    concludeBtn: 'Service Completed — Rate Officer & Conclude',
    standardLabel: 'Charter Standard Turnaround:',
    statutoryFee: 'Official Statutory Fee:',
    freeService: '0.00 ETB (FREE SERVICE)',
    faydaVerified: 'Fayda National ID Verified',
    proclamationNotice: 'Civil servants are strictly prohibited under Proclamation No. 1353/2025 from soliciting unofficial facilitation fees.',
    cancelBtn: 'Cancel Ticket',
    printSlip: 'View Digital Slip Receipt',
    closeSlip: 'Close Receipt',
    windowLabel: `WINDOW #${officer.assignedWindowNum}`,
    requiredDocs: 'Required Statutory Documents:'
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Sovereign Header */}
      <header className="bg-slate-900 text-white px-4 py-3 border-b border-slate-800 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-700 flex items-center justify-center font-serif text-[11px] font-bold text-emerald-300">
              FDRE
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-emerald-400 block font-semibold">
                FDRE CIVIL SERVICE COMMISSION
              </span>
              <h1 className="text-xs font-bold text-white truncate max-w-[210px]">
                {language === 'am' ? office.nameAm : office.nameEn}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="inline-flex rounded bg-slate-800 p-0.5 border border-slate-700 text-[10px]">
              <button
                onClick={() => setLanguage('am')}
                className={`px-1.5 py-0.5 rounded ${language === 'am' ? 'bg-emerald-700 text-white font-bold' : 'text-slate-400'}`}
              >
                አማ
              </button>
              <button
                onClick={() => setLanguage('en')}
                className={`px-1.5 py-0.5 rounded ${language === 'en' ? 'bg-emerald-700 text-white font-bold' : 'text-slate-400'}`}
              >
                EN
              </button>
            </div>
            <Link to="/display" target="_blank" className="text-[11px] text-emerald-400 hover:underline font-mono">
              TV Board ↗
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 sm:p-6 space-y-5">
        {/* Active Session Mode: Ticket & Secret PIN Display */}
        {activeSession ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-800 font-bold block">
                  {strings.activeTicket}
                </span>
                <h3 className="text-3xl font-extrabold font-mono text-slate-900 mt-0.5">
                  #{activeSession.ticketNumber || activeSession.id.slice(-6)}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                  {strings.windowLabel}
                </span>
                {activeSession.sessionStatus === 'HELD' && (
                  <span className="block text-[10px] font-mono text-amber-700 font-bold mt-1">
                    ⏸ ON HOLD
                  </span>
                )}
              </div>
            </div>

            {/* Officer card snippet */}
            <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <img 
                src={officer.photoUrl} 
                alt={officer.fullNameEn} 
                className="w-12 h-12 rounded-full object-cover border border-slate-300" 
              />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 truncate">
                  {language === 'am' ? officer.fullNameAm : officer.fullNameEn}
                </h4>
                <p className="text-xs text-slate-600 truncate">{language === 'am' ? service.nameAm : service.nameEn}</p>
                <span className="text-[10px] font-mono text-emerald-700 block">
                  {useFayda ? '✓ Fayda FIN Verified' : `Phone: ${phoneNumber}`}
                </span>
              </div>
            </div>

            {/* Turnaround Stopwatch & SLA Progress Bar */}
            <div className="text-center py-2 space-y-3">
              <span className="text-xs font-mono text-slate-500 uppercase tracking-widest block">
                Elapsed Service Time
              </span>
              <div className={`text-4xl font-extrabold font-mono tracking-tight ${
                isOverdue ? 'text-rose-600' : 'text-slate-900'
              }`}>
                {elapsedMin.toString().padStart(2, '0')}:{elapsedRemainderSec.toString().padStart(2, '0')}
              </div>

              {/* Visual Progress Bar against Charter Standard */}
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                <div 
                  className={`h-full transition-all duration-500 ${
                    isOverdue ? 'bg-rose-600' : progressPercent > 75 ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="text-xs text-slate-600 font-mono">
                Charter Standard: <strong className="text-slate-900">{service.standardDurationMin} Minutes</strong>
                {isOverdue && (
                  <span className="block text-rose-600 font-bold mt-1">
                    ⚠️ SLA Exceeded by +{elapsedMin - service.standardDurationMin} min
                  </span>
                )}
              </div>
            </div>

            {/* 4-Digit Completion PIN Box */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white text-center space-y-2 shadow-inner border border-slate-800">
              <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase font-semibold block">
                {strings.pinTitle}
              </span>
              <div className="text-4xl font-mono font-bold tracking-widest text-white">
                {activeSession.completionPin}
              </div>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed pt-1">
                {strings.pinNotice}
              </p>
            </div>

            {/* Action buttons */}
            <div className="space-y-2">
              <button
                onClick={() => {
                  setEvaluatingSession(activeSession);
                  setIsFinishingSession(true);
                }}
                className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-xs rounded-xl transition-colors shadow-sm"
              >
                {strings.concludeBtn}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowSlipModal(true)}
                  className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium rounded-xl transition-colors font-mono"
                >
                  📄 {strings.printSlip}
                </button>
                <button
                  onClick={handleCancelTicket}
                  className="py-2.5 px-3 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-medium rounded-xl transition-colors font-mono"
                >
                  {strings.cancelBtn}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Check-In Mode */
          <div className="space-y-5">
            {/* Officer Desk Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-800" />
              <div className="inline-block px-3 py-1 rounded-full bg-slate-900 text-white font-mono text-xs font-bold tracking-wider mb-3">
                {strings.windowLabel}
              </div>
              <div className="w-16 h-16 rounded-full mx-auto overflow-hidden border-2 border-slate-200 mb-2 shadow-xs">
                <img src={officer.photoUrl} alt={officer.fullNameEn} className="w-full h-full object-cover" />
              </div>
              <h2 className="text-base font-bold text-slate-900 font-serif">
                {language === 'am' ? officer.fullNameAm : officer.fullNameEn}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === 'am' ? officer.departmentAm : officer.departmentEn}
              </p>
              <div className="text-[11px] font-mono text-slate-400 mt-1">
                ID: {officer.employeeId} • {officer.jegGradeCode}
              </div>
            </div>

            {/* Service Selection Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 font-mono">
                  Select Public Service for Window #{officer.assignedWindowNum}
                </label>
                <div className="space-y-2">
                  {safeServices.map((srv) => {
                    const isSelected = srv.id === selectedServiceId;
                    const isWindowPrimary = srv.id === getWindowDefaultServiceId(winNumber);

                    return (
                      <div
                        key={srv.id}
                        onClick={() => setSelectedServiceId(srv.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected 
                            ? 'border-emerald-700 bg-emerald-50/60 ring-1 ring-emerald-700 shadow-xs' 
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-400">{srv.serviceCode}</span>
                            {isWindowPrimary && (
                              <span className="text-[9px] font-mono bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                                DESIGNATED COUNTER SERVICE
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-slate-900">
                            {language === 'am' ? srv.nameAm : srv.nameEn}
                          </h4>
                          <span className="text-[11px] text-slate-500 font-mono">
                            Charter Limit: <strong className="text-slate-800">{srv.standardDurationMin} min</strong>
                          </span>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100/90 px-2.5 py-1 rounded">
                          {srv.officialFeeEtb === 0 ? 'FREE' : `${srv.officialFeeEtb} ETB`}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Statutory Required Documents Checklist */}
              {service?.requiredDocuments && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 font-semibold block">
                    {strings.requiredDocs}
                  </span>
                  <ul className="space-y-1 text-slate-700">
                    {(service.requiredDocuments[language] || service.requiredDocuments.en).map((doc: string, idx: number) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-700 font-bold">✓</span>
                        <span>{doc}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Fee Transparency Box */}
              <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-slate-700 space-y-1">
                <div className="font-semibold text-slate-900">
                  {strings.statutoryFee} <span className="text-emerald-800 font-bold">{service.officialFeeEtb === 0 ? strings.freeService : `${service.officialFeeEtb}.00 ETB`}</span>
                </div>
                <p className="text-[10px] text-slate-600 leading-relaxed">
                  {strings.proclamationNotice}
                </p>
              </div>

              {/* National Digital ID Check-In */}
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-slate-700 font-mono">
                    {useFayda ? 'Fayda National Digital ID (FIN)' : 'Mobile Phone Number'}
                  </label>
                  <button
                    type="button"
                    onClick={() => setUseFayda(!useFayda)}
                    className="text-[11px] text-emerald-700 underline font-mono"
                  >
                    {useFayda ? 'Use Phone Number' : 'Use Fayda National ID'}
                  </button>
                </div>

                {useFayda ? (
                  <div className="relative">
                    <input
                      type="text"
                      value={faydaFin}
                      onChange={(e) => setFaydaFin(e.target.value)}
                      placeholder="e.g. 1094-8832-7719"
                      className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-700 bg-white"
                    />
                    <span className="absolute right-3 top-3 text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      FAYDA FIN
                    </span>
                  </div>
                ) : (
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. 0911234567"
                    className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-700 bg-white"
                  />
                )}
              </div>

              <button
                disabled={isLoading}
                onClick={handleStart}
                className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-xs rounded-xl transition-colors shadow-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
              >
                {isLoading ? 'Issuing Ticket...' : 'Check-In & Generate Digital Ticket'}
              </button>
            </div>
          </div>
        )}

        <div className="text-center text-[10px] text-slate-400 font-mono">
          {formatFullEthiopianDateTime(currentUtc, language)} • Proclamation No. 1353/2025
        </div>
      </main>

      {/* Digital Ticket Slip Modal */}
      {showSlipModal && activeSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="text-center border-b border-slate-100 pb-3">
              <span className="text-[10px] uppercase font-mono tracking-widest text-emerald-800 font-bold block">
                FDRE OFFICIAL CITIZEN SERVICE SLIP
              </span>
              <h3 className="text-2xl font-bold font-mono text-slate-900 mt-1">
                #{activeSession.ticketNumber || activeSession.id.slice(-6)}
              </h3>
              <p className="text-xs text-slate-500 font-serif">
                {language === 'am' ? office.nameAm : office.nameEn}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Service:</span>
                <strong className="text-slate-900">{service.serviceCode}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Assigned Window:</span>
                <strong className="text-slate-900">Window #{officer.assignedWindowNum}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Civil Servant:</span>
                <strong className="text-slate-900">{officer.fullNameEn}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Statutory Fee:</span>
                <strong className="text-emerald-800">{service.officialFeeEtb === 0 ? '0.00 ETB (FREE)' : `${service.officialFeeEtb}.00 ETB`}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Charter Turnaround:</span>
                <strong className="text-slate-900">{service.standardDurationMin} Minutes</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Secret 4-Digit PIN:</span>
                <strong className="text-emerald-900 font-bold text-sm">{activeSession.completionPin}</strong>
              </div>
            </div>

            <div className="py-2 flex justify-center">
              <QrCodeDisplay
                value={`${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'}/verify?ticket=${activeSession.ticketNumber || activeSession.id}`}
                size={120}
                label="SLIP RECEIPT QR"
              />
            </div>

            <button
              onClick={() => setShowSlipModal(false)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-medium"
            >
              {strings.closeSlip}
            </button>
          </div>
        </div>
      )}

      {/* Feedback Evaluation Modal */}
      {isFinishingSession && (evaluatingSession || activeSession) && (
        <CitizenFeedbackModal
          session={evaluatingSession || activeSession}
          onClose={() => {
            setIsFinishingSession(false);
            setEvaluatingSession(null);
          }}
        />
      )}
    </div>
  );
};
