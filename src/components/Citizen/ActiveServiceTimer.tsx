// Live Turnaround Progress & Verification PIN Screen for Citizen
import React, { useState, useEffect } from 'react';
import { ServiceSession } from '../../types';
import { useSystem } from '../../context/SystemContext';

interface ActiveServiceTimerProps {
  session: ServiceSession;
  onTriggerCompletion: () => void;
}

export const ActiveServiceTimer: React.FC<ActiveServiceTimerProps> = ({
  session,
  onTriggerCompletion
}) => {
  const { language, officers, services, cancelSession } = useSystem();
  const [elapsedSec, setElapsedSec] = useState<number>(0);

  const officer = officers.find(o => o.id === session.officerId);
  const service = services.find(s => s.id === session.serviceId);
  const standardMinutes = service?.standardDurationMin || 25;
  const standardSeconds = standardMinutes * 60;

  useEffect(() => {
    const startTime = new Date(session.startedAt).getTime();
    const updateElapsed = () => {
      const now = Date.now();
      setElapsedSec(Math.max(0, Math.floor((now - startTime) / 1000)));
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [session.startedAt]);

  const elapsedMinutes = Math.floor(elapsedSec / 60);
  const elapsedRemainingSec = elapsedSec % 60;
  const progressRatio = Math.min(1.5, elapsedSec / standardSeconds);
  const isOverdue = elapsedSec > standardSeconds;

  const strings = {
    activeSession: {
      en: 'Active Service Session in Progress',
      am: 'መስተንግዶ በሂደት ላይ ነው',
      om: 'Tajaajilli Hojjetamaa Jira'
    },
    pinLabel: {
      en: 'Your 4-Digit Completion Verification PIN',
      am: 'የመስተንግዶ ማጠቃለያ 4-አሃዝ ማረጋገጫ ፒን',
      om: 'Koodii Mirkaneessaa Lakkoofsa 4'
    },
    pinNotice: {
      en: 'Provide this PIN to the officer only when your documents or service are handed back to you.',
      am: 'ሰነድዎ ተጠናቆ በእጅዎ ሲደርስ ብቻ ይህንን ባለ 4-አሃዝ ፒን ለባለሙያው ይስጡ።',
      om: 'Yeroo ragaan keessan xumuramee isiniif kennamu qofa koodii kana hojjetaatti kennaa.'
    },
    standardLimit: {
      en: 'Citizen Charter Standard',
      am: 'የዜጎች ቻርተር ስታንዳርድ',
      om: 'Sadarkaa Chaartarii'
    },
    elapsedTime: {
      en: 'Elapsed Service Time',
      am: 'የፈጀው ጊዜ',
      om: 'Yeroo Fudhatame'
    },
    completeAction: {
      en: 'Service Completed — Rate Officer',
      am: 'አገልግሎቱ ተጠናቋል — ባለሙያውን ምዘን',
      om: 'Tajaajilli Xumurameera — Madaali'
    },
    cancelAction: {
      en: 'Cancel Session',
      am: 'መስተንግዶ ሰርዝ',
      om: 'Haqi'
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Status Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-mono font-semibold tracking-wider">
              SESSION #{session.id.slice(-6)}
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-1">
              {strings.activeSession[language]}
            </h3>
          </div>
          <div className="text-right">
            <span className="text-xs font-mono text-slate-500 block">WINDOW</span>
            <span className="text-base font-bold font-mono text-slate-900">
              #{session.windowNum}
            </span>
          </div>
        </div>

        {/* Officer & Service Snapshot */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/70">
          <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-300">
            <img 
              src={officer?.photoUrl} 
              alt={officer?.fullNameEn} 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-slate-900 truncate">
              {language === 'am' ? officer?.fullNameAm : officer?.fullNameEn}
            </h4>
            <p className="text-xs text-slate-600 truncate">
              {language === 'am' ? service?.nameAm : service?.nameEn}
            </p>
            <div className="text-[11px] font-mono text-slate-400 mt-0.5">
              {officer?.employeeId} • {officer?.jegGradeCode}
            </div>
          </div>
        </div>

        {/* Stopwatch & SLA Variance Indicator */}
        <div className="text-center py-4 space-y-3">
          <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-medium">
            {strings.elapsedTime[language]}
          </span>
          <div className="text-4xl sm:text-5xl font-mono font-bold tracking-tight text-slate-900">
            {elapsedMinutes.toString().padStart(2, '0')}:
            {elapsedRemainingSec.toString().padStart(2, '0')}
          </div>

          <div className="text-xs text-slate-500">
            {strings.standardLimit[language]}: <strong className="text-slate-800 font-semibold">{standardMinutes}:00 min</strong>
            {isOverdue && (
              <span className="block text-rose-600 font-semibold text-xs mt-1">
                Charter SLA Standard Breached by +{elapsedMinutes - standardMinutes} min
              </span>
            )}
          </div>

          {/* SLA Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isOverdue ? 'bg-rose-600' : progressRatio > 0.8 ? 'bg-amber-500' : 'bg-emerald-600'
              }`}
              style={{ width: `${Math.min(100, (progressRatio / 1.0) * 100)}%` }}
            />
          </div>
        </div>

        {/* 4-Digit Completion PIN Card */}
        <div className="p-5 rounded-xl bg-slate-900 text-white text-center space-y-2 shadow-inner">
          <span className="text-xs font-mono tracking-widest text-emerald-400 uppercase font-semibold">
            {strings.pinLabel[language]}
          </span>
          <div className="text-3xl sm:text-4xl font-mono font-bold tracking-widest text-white">
            {session.completionPin}
          </div>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed pt-1">
            {strings.pinNotice[language]}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={onTriggerCompletion}
            className="w-full sm:flex-1 py-3 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-sm rounded-lg transition-colors shadow-sm"
          >
            {strings.completeAction[language]}
          </button>
          <button
            onClick={() => cancelSession(session.id)}
            className="w-full sm:w-auto py-3 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-medium text-sm rounded-lg transition-colors"
          >
            {strings.cancelAction[language]}
          </button>
        </div>
      </div>
    </div>
  );
};
