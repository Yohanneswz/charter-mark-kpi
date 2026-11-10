// Sovereign Government Header & Multi-Module Portal Dock for FDRE GovTech System
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSystem } from '../../context/SystemContext';
import { formatFullEthiopianDateTime } from '../../utils/ethiopianCalendar';

interface SovereignGovHeaderProps {
  currentModule?: string;
  hideNavDock?: boolean;
}

export const SovereignGovHeader: React.FC<SovereignGovHeaderProps> = ({ 
  currentModule,
  hideNavDock = false 
}) => {
  const { language, setLanguage, office, resetDemoData } = useSystem();
  const [currentUtc, setCurrentUtc] = useState<string>(new Date().toISOString());
  const [user, setUser] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setCurrentUtc(new Date().toISOString()), 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('CHARTER_AUTH_USER');
    if (saved) {
      try {
        setUser(JSON.parse(saved));
      } catch (e) {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [location.pathname]);

  const navLinks = [
    { to: '/stands', labelEn: 'Desk Stands', labelAm: 'የመስኮት QR', labelOr: 'QR Goolii' },
    { to: '/desk/1', labelEn: 'Citizen Mobile', labelAm: 'የዜጋ መተግበሪያ', labelOr: 'Moobaayila Lammiilee' },
    { to: '/display', labelEn: 'Waiting Hall TV', labelAm: 'የማሳወቂያ ሰሌዳ', labelOr: 'Agarsiisa TV' },
    { to: '/clerk', labelEn: 'Clerk Counter', labelAm: 'የባለሙያ መስኮት', labelOr: 'Bara Hojjetaa' },
    { to: '/operations', labelEn: 'Operations & Ethics', labelAm: 'የስራ ክትትልና ስነ-ምግባር', labelOr: 'Hoggansaa fi Naamusaa' },
    { to: '/appraisal', labelEn: '2-Year Appraisal', labelAm: 'የ2-ዓመት ምዘና', labelOr: 'Madaallii Waggaa 2' },
    { to: '/verify', labelEn: 'Verify Certificate', labelAm: 'ምስክር ወረቀት አረጋግጥ', labelOr: 'Mirkaneessa' },
  ];

  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 font-sans shadow-md">
      {/* Top micro-bar: Jurisdiction & Ge'ez Local Time */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 border-b border-slate-800/80 gap-2">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-emerald-400 tracking-wider uppercase text-[11px] font-mono">
            Federal Democratic Republic of Ethiopia
          </span>
          <span className="hidden sm:inline text-slate-600">•</span>
          <span className="text-slate-300 font-mono text-[11px]">
            {formatFullEthiopianDateTime(currentUtc, language)}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <div className="inline-flex rounded-lg bg-slate-800 p-0.5 border border-slate-700 text-xs">
            <button
              onClick={() => setLanguage('am')}
              className={`px-2 py-0.5 rounded transition-colors ${
                language === 'am' ? 'bg-emerald-700 text-white font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              አማርኛ
            </button>
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-0.5 rounded transition-colors ${
                language === 'en' ? 'bg-emerald-700 text-white font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('om')}
              className={`px-2 py-0.5 rounded transition-colors ${
                language === 'om' ? 'bg-emerald-700 text-white font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              Afaan Oromo
            </button>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-slate-300 text-xs font-mono font-medium">
                {user.fullName} ({user.role})
              </span>
              <button
                onClick={() => {
                  localStorage.removeItem('CHARTER_AUTH_TOKEN');
                  localStorage.removeItem('CHARTER_AUTH_USER');
                  setUser(null);
                  window.location.href = '/login';
                }}
                className="text-[11px] text-slate-400 hover:text-white underline"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium underline underline-offset-2"
            >
              Staff Sign In →
            </Link>
          )}

          <button
            onClick={resetDemoData}
            title="Reset system state to baseline seed data"
            className="text-[11px] text-slate-500 hover:text-slate-300 font-mono underline"
          >
            Reset Seed
          </button>
        </div>
      </div>

      {/* Main Title Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-emerald-950 border border-emerald-600/80 flex items-center justify-center shrink-0 shadow-inner">
            <span className="text-emerald-300 font-serif font-bold text-xs">
              FDRE
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white font-serif">
                {language === 'am' ? office.nameAm : office.nameEn}
              </h1>
              {currentModule && (
                <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-[10px] font-mono text-emerald-300 uppercase tracking-wider font-semibold">
                  {currentModule}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-light">
              Proclamation No. 1353/2025 • Digital Ethiopia 2030 (DE2030)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-300">Live Charter Tracking</span>
        </div>
      </div>

      {/* GovTech Modular Navigation Dock */}
      {!hideNavDock && (
        <nav className="bg-slate-950/90 border-t border-slate-800/80 px-4 sm:px-8 py-2 overflow-x-auto">
          <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs font-medium">
            <span className="text-slate-500 text-[11px] font-mono uppercase tracking-wider pr-1 hidden sm:inline">
              PORTALS:
            </span>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to || (link.to.startsWith('/desk') && location.pathname.startsWith('/desk'));
              const label = language === 'am' ? link.labelAm : language === 'om' ? link.labelOr : link.labelEn;

              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-3 py-1.5 rounded-lg transition-all text-xs whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-700 text-white font-semibold shadow-xs ring-1 ring-emerald-500'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
};
