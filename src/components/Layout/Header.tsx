// Sovereign Government Header with Dual Calendar & Institutional Title
import React, { useState, useEffect } from 'react';
import { useSystem } from '../../context/SystemContext';
import { formatFullEthiopianDateTime } from '../../utils/ethiopianCalendar';

export const Header: React.FC = () => {
  const { language, setLanguage, office, resetDemoData } = useSystem();
  const [currentUtc, setCurrentUtc] = useState<string>(new Date().toISOString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentUtc(new Date().toISOString());
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const officeTitle = {
    en: office.nameEn,
    am: office.nameAm,
    om: office.nameOr
  }[language];

  const subHeader = {
    en: 'Federal Civil Service Proclamation No. 1353/2025 • Citizen Charter Compliance System',
    am: 'የፌዴራል ሲቪል ሰርቫንቶች አዋጅ ቁጥር 1353/2017 • የዜጎች ቻርተር እና የብቃት ምዘና ስርዓት',
    om: 'Labsii Hojjettoota Mootummaa Federaalaa Lak. 1353/2017 • Sirna Hordoffii Chaartarii Lammiilee'
  }[language];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800">
      {/* Top micro-bar: Jurisdiction & Time */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 border-b border-slate-800/60 gap-2">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-emerald-400 tracking-wider uppercase text-[11px]">
            Federal Democratic Republic of Ethiopia
          </span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="text-slate-300">
            {formatFullEthiopianDateTime(currentUtc, language)}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <div className="inline-flex rounded-md bg-slate-800 p-0.5 border border-slate-700">
            <button
              onClick={() => setLanguage('am')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                language === 'am' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              አማርኛ
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                language === 'en' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLanguage('om')}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                language === 'om' ? 'bg-emerald-700 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              Oromoo
            </button>
          </div>

          <button
            onClick={resetDemoData}
            title="Reset system state to pristine baseline"
            className="text-xs text-slate-400 hover:text-slate-200 underline underline-offset-2 transition-colors"
          >
            Reset Demo
          </button>
        </div>
      </div>

      {/* Main Title Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Official Seal Emblem */}
          <div className="w-12 h-12 rounded-lg bg-emerald-900/80 border border-emerald-700/60 flex items-center justify-center shrink-0 shadow-inner">
            <div className="w-8 h-8 rounded-full border border-emerald-400/60 flex items-center justify-center text-emerald-300 font-serif font-bold text-xs tracking-tight">
              FDRE
            </div>
          </div>

          <div>
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-white">
              {officeTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5 font-light">
              {subHeader}
            </p>
          </div>
        </div>

        {/* Live Operational Tag */}
        <div className="flex items-center gap-2 self-end md:self-center">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-mono text-emerald-300 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800">
            Desk SLA Tracking: Active
          </span>
        </div>
      </div>
    </header>
  );
};
