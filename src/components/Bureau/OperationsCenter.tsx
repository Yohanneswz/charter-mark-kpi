// Bureau Head Operations Center & Anti-Corruption Sentinel Console
import React, { useState } from 'react';
import { useSystem } from '../../context/SystemContext';
import { StatusBadge } from '../Common/StatusBadge';
import { formatFullEthiopianDateTime } from '../../utils/ethiopianCalendar';

export const OperationsCenter: React.FC = () => {
  const { 
    language, 
    officers, 
    services, 
    sessions, 
    alerts, 
    resolveAlert, 
    dismissAlert,
    refreshData 
  } = useSystem();

  const [activeTab, setActiveTab] = useState<'matrix' | 'ethics' | 'analytics'>('matrix');
  const [selectedAlert, setSelectedAlert] = useState<any>(null);
  const [sanctionChoice, setSanctionChoice] = useState<string>('Formal Written Reprimand (የጽሁፍ ማስጠንቀቂያ)');
  const [resolutionNote, setResolutionNote] = useState<string>('');

  const strings = {
    title: {
      en: 'Executive Operations & Anti-Corruption Center',
      am: 'የአመራር ስራ ክትትልና የስነ-ምግባር መቆጣጠሪያ ማዕከል',
      om: 'Wiirtuu Hoggansaa fi Hordoffii Naamusaa'
    },
    subtitle: {
      en: 'Sub-city desk activity, statutory Charter Mark SLA compliance, and real-time anti-corruption escalation log.',
      am: 'የክፍለ ከተማው የአገልግሎት መስኮቶች እንቅስቃሴ፣ የSLA ተገዢነት እና የቀጥታ የስነ-ምግባር ጥሰት ክትትል መዝገብ።',
      om: 'Sochii goolii tajaajilaa, hordoffii SLA fi galmee balaa naamusaa.'
    },
    tabMatrix: {
      en: 'Active Counter Matrix',
      am: 'የመስኮቶች የቀጥታ ሁኔታ',
      om: 'Sochii Gooliiwwanii'
    },
    tabEthics: {
      en: 'Anti-Corruption & Grievance Feed',
      am: 'የስነ-ምግባርና የጉቦ ጥቆማዎች',
      om: 'Hordoffii Naamusaa fi Malaammaltummaa'
    },
    tabAnalytics: {
      en: 'Citizen Charter SLA Variances',
      am: 'የቻርተር ስታንዳርድ ልዩነቶች (SLA)',
      om: 'Garaagarummaa Sadarkaa Chaartarii'
    }
  };

  const activeAlerts = alerts.filter(a => a.status === 'ACTIVE' || a.status === 'UNDER_INVESTIGATION');

  const handleApplySanction = async (alertId: string) => {
    await fetch(`/api/alerts/${alertId}/sanction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sanction: sanctionChoice,
        actionNotes: resolutionNote || 'Sanction applied pursuant to Proclamation No. 1353/2025'
      })
    });
    setSelectedAlert(null);
    setResolutionNote('');
    await refreshData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            {strings.title[language]}
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            {strings.subtitle[language]}
          </p>
        </div>

        {/* Status Indicators & CSV Export */}
        <div className="flex items-center gap-3">
          <a
            href="/api/export/transactions-csv"
            download
            className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-mono font-medium transition-colors shadow-xs"
          >
            Export Audit CSV ↓
          </a>
          <div className="px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono text-slate-700">
            Counters Online: <strong className="text-slate-900">{officers.length}</strong>
          </div>
          <div className={`px-3 py-2 rounded-xl border text-xs font-mono font-medium ${
            activeAlerts.length > 0 ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}>
            Ethics Flags: <strong className="font-bold">{activeAlerts.length}</strong>
          </div>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2 text-xs font-medium rounded-xl transition-colors ${
            activeTab === 'matrix' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {strings.tabMatrix[language]}
        </button>
        <button
          onClick={() => setActiveTab('ethics')}
          className={`px-4 py-2 text-xs font-medium rounded-xl transition-colors flex items-center gap-2 ${
            activeTab === 'ethics' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>{strings.tabEthics[language]}</span>
          {activeAlerts.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-600 text-white text-[10px] font-mono flex items-center justify-center font-bold">
              {activeAlerts.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 text-xs font-medium rounded-xl transition-colors ${
            activeTab === 'analytics' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {strings.tabAnalytics[language]}
        </button>
      </div>

      {/* Tab 1: Live Counter Matrix */}
      {activeTab === 'matrix' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {officers.map((off) => {
            const officerSessions = sessions.filter(s => s.officerId === off.id);
            const activeSession = sessions.find(s => s.officerId === off.id && (s.sessionStatus === 'IN_PROGRESS' || s.sessionStatus === 'HELD'));
            const completedToday = officerSessions.filter(s => s.sessionStatus === 'COMPLETED').length;
            const activeService = services.find(s => s.id === activeSession?.serviceId);

            return (
              <div 
                key={off.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4 hover:border-slate-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[11px] font-mono font-bold">
                      WINDOW #{off.assignedWindowNum}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">
                      {language === 'am' ? off.fullNameAm : off.fullNameEn}
                    </h4>
                    <span className="text-[11px] font-mono text-slate-500">
                      {off.jegGradeCode} • {off.employeeId}
                    </span>
                  </div>

                  <StatusBadge
                    status={activeSession ? (activeSession.sessionStatus === 'HELD' ? 'ON HOLD' : 'SERVING') : off.status}
                    variant={activeSession ? 'info' : off.status === 'ACTIVE' ? 'success' : 'warning'}
                  />
                </div>

                {/* Desk Status Detail */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                    Current Desk Activity
                  </span>
                  {activeSession ? (
                    <div className="text-xs">
                      <strong className="text-slate-900 block truncate font-medium">
                        {language === 'am' ? activeService?.nameAm : activeService?.nameEn}
                      </strong>
                      <span className="text-slate-500 text-[11px] font-mono">
                        Ticket: {activeSession.ticketNumber || activeSession.id.slice(-6)} • PIN: {activeSession.completionPin}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-500 italic">
                      Desk idle — ready for next citizen
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-center pt-1 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Completed</span>
                    <strong className="text-slate-900 font-mono text-sm">{completedToday}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] font-mono text-slate-400 block uppercase">Base Salary</span>
                    <strong className="text-slate-900 font-mono text-xs">{off.baseSalaryEtb.toLocaleString()} ETB</strong>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Anti-Corruption & Ethics Feed with Sanctions Dossier */}
      {activeTab === 'ethics' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
            <strong>Proclamation 1353/2025 Statutory Ethics Protocol:</strong> Frontline complaints alleging unannounced absence or irregular fee demands trigger an immediate disciplinary case dossier. All resolutions and imposed sanctions are bound to the officer's two-year increment ledger.
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-mono uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Severity</th>
                  <th className="py-3 px-4">Window / Officer</th>
                  <th className="py-3 px-4">Trigger Type</th>
                  <th className="py-3 px-4">Incident Dossier</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {alerts.map((alt) => (
                  <tr key={alt.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <StatusBadge
                        status={alt.severity}
                        variant={alt.severity === 'URGENT' ? 'danger' : alt.severity === 'HIGH' ? 'warning' : 'info'}
                        size="sm"
                      />
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      <div>Win #{alt.windowNum}</div>
                      <div className="text-[11px] text-slate-500">{alt.officerNameEn}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {alt.alertType}
                    </td>
                    <td className="py-3 px-4 max-w-sm space-y-1">
                      <p className="text-slate-800 font-medium">{language === 'am' ? alt.descriptionAm : alt.descriptionEn}</p>
                      {alt.officerExplanation && (
                        <div className="text-[11px] text-slate-600 bg-slate-100 p-2 rounded-lg">
                          <strong>Officer Explanation:</strong> {alt.officerExplanation}
                        </div>
                      )}
                      {alt.sanctionImposed && (
                        <div className="text-[11px] text-emerald-800 font-semibold">
                          Sanction: {alt.sanctionImposed}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <StatusBadge status={alt.status} variant={alt.status === 'RESOLVED' ? 'neutral' : 'danger'} size="sm" />
                    </td>
                    <td className="py-3 px-4">
                      {alt.status !== 'RESOLVED' ? (
                        <button
                          onClick={() => setSelectedAlert(alt)}
                          className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-lg"
                        >
                          Review & Sanction
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400">Archived</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: SLA Variance Analytics */}
      {activeTab === 'analytics' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900">
              Statutory Citizen Charter Delivery Metrics
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Empirical turnaround analysis across all registered municipal services.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {services.map((srv) => {
              const serviceSessions = sessions.filter(s => s.serviceId === srv.id && s.sessionStatus === 'COMPLETED');
              const total = serviceSessions.length;
              const withinSla = serviceSessions.filter(s => s.metCharterSla).length;
              const complianceRate = total > 0 ? Math.round((withinSla / total) * 100) : 100;
              const avgDuration = total > 0 
                ? Math.round(serviceSessions.reduce((acc, c) => acc + (c.actualDurationMin || 0), 0) / total) 
                : srv.standardDurationMin;
              const variance = avgDuration - srv.standardDurationMin;

              return (
                <div key={srv.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 block">{srv.serviceCode}</span>
                      <h4 className="text-sm font-bold text-slate-900">
                        {language === 'am' ? srv.nameAm : srv.nameEn}
                      </h4>
                    </div>
                    <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                      complianceRate >= 90 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {complianceRate}% On-Time
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
                    <div className="p-2 bg-white rounded-lg border border-slate-100">
                      <span className="text-[10px] font-mono text-slate-400 block">Charter Standard</span>
                      <strong className="text-slate-900 font-mono">{srv.standardDurationMin} min</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-100">
                      <span className="text-[10px] font-mono text-slate-400 block">Avg Actual</span>
                      <strong className="text-slate-900 font-mono">{avgDuration} min</strong>
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-slate-100">
                      <span className="text-[10px] font-mono text-slate-400 block">SLA Variance</span>
                      <strong className={`font-mono ${variance <= 0 ? 'text-emerald-800' : 'text-rose-600'}`}>
                        {variance > 0 ? `+${variance}m` : `${variance}m`}
                      </strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Disciplinary Sanction Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Statutory Disciplinary Triage & Sanction Determination
            </h3>
            <p className="text-xs text-slate-600">
              Apply administrative measures under Federal Civil Servants Proclamation No. 1353/2025.
            </p>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
              <div>Officer: <strong>{selectedAlert.officerNameEn} (Window #{selectedAlert.windowNum})</strong></div>
              <div>Grievance: <strong className="text-rose-700">{selectedAlert.alertType}</strong></div>
              <p className="text-slate-600">{selectedAlert.descriptionEn}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Statutory Disciplinary Measure
              </label>
              <select
                value={sanctionChoice}
                onChange={(e) => setSanctionChoice(e.target.value)}
                className="w-full text-xs p-3 rounded-lg border border-slate-200"
              >
                <option value="Formal Written Reprimand (የጽሁፍ ማስጠንቀቂያ)">Formal Written Reprimand (የጽሁፍ ማስጠንቀቂያ)</option>
                <option value="One-Month Salary Step Increment Freeze (የደመወዝ እርከን ጭማሪ እገዳ)">One-Month Salary Step Increment Freeze (የደመወዝ እርከን ጭማሪ እገዳ)</option>
                <option value="Formal Referral to Ethics Directorate (ለስነ-ምግባር ኮሚቴ ማስተላለፍ)">Formal Referral to Ethics Directorate (ለስነ-ምግባር ኮሚቴ ማስተላለፍ)</option>
                <option value="Exonerated / Legitimate Hardware Delay (ነጻ መውጣት)">Exonerated / Legitimate Hardware Delay (ነጻ መውጣት)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Bureau Head Formal Findings & Orders
              </label>
              <textarea
                value={resolutionNote}
                onChange={(e) => setResolutionNote(e.target.value)}
                rows={3}
                placeholder="Record official orders entered into the public service compliance record..."
                className="w-full text-xs p-3 rounded-lg border border-slate-200"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedAlert(null)}
                className="px-3 py-2 text-xs font-medium text-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleApplySanction(selectedAlert.id)}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-medium rounded-lg shadow-sm"
              >
                Enforce Sanction & Resolve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
