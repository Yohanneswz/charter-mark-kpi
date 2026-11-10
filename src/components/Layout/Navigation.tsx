// Navigation component with pure, elegant typography and zero icon clutter
import React from 'react';
import { useSystem } from '../../context/SystemContext';

export type ActiveTab = 'citizen' | 'clerk' | 'bureau' | 'appraisal';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onSelectTab }) => {
  const { language, alerts, activeCitizenSession } = useSystem();

  const urgentAlertsCount = alerts.filter(a => a.status === 'ACTIVE').length;

  const labels = {
    citizen: {
      en: 'Citizen Desk QR',
      am: 'የዜጎች መስተንግዶ (QR)',
      om: 'Tajaajila Lammiilee (QR)'
    },
    clerk: {
      en: 'Frontline Clerk Counter',
      am: 'የባለሙያ መስኮት',
      om: 'Goolii Hojjetaa'
    },
    bureau: {
      en: 'Operations & Anti-Corruption',
      am: 'የአመራርና ስነ-ምግባር ክትትል',
      om: 'Hoggansa & Naamusaa'
    },
    appraisal: {
      en: '2-Year Appraisal & Salary Increment',
      am: 'የ2-ዓመት ምዘናና የደመወዝ ጭማሪ',
      om: 'Madaallii Waggaa 2 & Daballii Miindaa'
    }
  };

  const navItems: { key: ActiveTab; label: string; badge?: number | string }[] = [
    { 
      key: 'citizen', 
      label: labels.citizen[language],
      badge: activeCitizenSession ? 'Active Session' : undefined
    },
    { 
      key: 'clerk', 
      label: labels.clerk[language] 
    },
    { 
      key: 'bureau', 
      label: labels.bureau[language],
      badge: urgentAlertsCount > 0 ? urgentAlertsCount : undefined
    },
    { 
      key: 'appraisal', 
      label: labels.appraisal[language] 
    }
  ];

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-6 sm:space-x-8 overflow-x-auto no-scrollbar py-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onSelectTab(item.key)}
                className={`group py-3.5 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-all flex items-center gap-2 ${
                  isActive
                    ? 'border-emerald-700 text-emerald-900 font-semibold'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                      item.key === 'bureau' && typeof item.badge === 'number'
                        ? 'bg-rose-100 text-rose-800 font-bold'
                        : item.key === 'citizen'
                        ? 'bg-emerald-100 text-emerald-800 animate-pulse font-medium'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
