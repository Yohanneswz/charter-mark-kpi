// Physical Acrylic Desk Stands Directory for Municipal Service Counters
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSystem } from '../context/SystemContext';
import { initialOfficers } from '../data/seedData';
import { QrCodeDisplay } from '../utils/qrGenerator';
import { SovereignGovHeader } from '../components/Layout/SovereignGovHeader';

export const DeskStandsDirectory: React.FC = () => {
  const { language, officers } = useSystem();
  const [qrHostMode, setQrHostMode] = useState<'wifi' | 'origin'>('wifi');
  const [ussdWindow, setUssdWindow] = useState<number | null>(null);
  const [ussdOutput, setUssdOutput] = useState<string>('');
  const [ussdInput, setUssdInput] = useState<string>('');
  const [isUssdLoading, setIsUssdLoading] = useState<boolean>(false);

  const safeOfficers = officers.length > 0 ? officers : initialOfficers;

  const baseOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:3000';
  const [wifiIp, setWifiIp] = useState<string>('192.168.1.2');
  const baseUrl = qrHostMode === 'wifi' ? `http://${wifiIp}:3000` : baseOrigin;

  const handleStartUssd = async (winNum: number) => {
    setUssdWindow(winNum);
    setIsUssdLoading(true);
    try {
      const res = await fetch('/api/ussd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: '0911223344',
          text: `1*${winNum}`
        })
      });
      const text = await res.text();
      setUssdOutput(text);
    } catch (e) {
      setUssdOutput('USSD Gateway connection timeout. Please check server.');
    } finally {
      setIsUssdLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SovereignGovHeader currentModule="Physical Acrylic Desk Stands" />

      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-800 font-bold block">
              ZERO-HARDWARE CITIZEN CHARTER DEPLOYMENT
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 mt-0.5 font-serif">
              Official Acrylic Desk QR Stands
            </h2>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Every frontline municipal desk has a physical stand linking to its isolated counter. Citizens scan with any smartphone camera or dial the statutory USSD code on 2G feature phones.
            </p>
          </div>

          {/* Network Target Toggle */}
          <div className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
            <span className="text-xs text-slate-600 font-medium">QR Target:</span>
            <div className="inline-flex rounded-lg bg-slate-100 p-0.5 text-xs font-mono">
              <button
                onClick={() => setQrHostMode('wifi')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  qrHostMode === 'wifi' ? 'bg-emerald-800 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Wi-Fi ({wifiIp})
              </button>
              <button
                onClick={() => setQrHostMode('origin')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  qrHostMode === 'origin' ? 'bg-emerald-800 text-white font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Localhost / Current
              </button>
            </div>
            {qrHostMode === 'wifi' && (
              <input
                type="text"
                value={wifiIp}
                onChange={(e) => setWifiIp(e.target.value.trim())}
                placeholder="192.168.1.2"
                title="Your computer's Wi-Fi LAN IP so phones on the same network can open the QR"
                className="w-28 text-xs font-mono px-2 py-1 rounded-lg border border-slate-300 text-slate-800 bg-slate-50 focus:bg-white"
              />
            )}
          </div>
        </div>

        {/* Grid of Physical Stands */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {safeOfficers.map((off) => {
            const deskUrl = `${baseUrl}/desk/${off.assignedWindowNum}`;

            return (
              <div
                key={off.id}
                className="bg-gradient-to-b from-slate-100 to-slate-200 p-5 rounded-2xl border border-slate-300 shadow-md space-y-4 flex flex-col justify-between"
              >
                {/* Stand Body */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 text-center shadow-sm space-y-3">
                  <div className="border-b border-slate-100 pb-3">
                    <span className="inline-block px-3 py-0.5 rounded-full bg-slate-900 text-white font-mono text-xs font-bold tracking-wider mb-2">
                      WINDOW #{off.assignedWindowNum}
                    </span>
                    <div className="w-16 h-16 rounded-full mx-auto overflow-hidden border-2 border-slate-200 mb-2 shadow-xs">
                      <img 
                        src={off.photoUrl} 
                        alt={off.fullNameEn} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 font-serif">
                      {language === 'am' ? off.fullNameAm : off.fullNameEn}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {language === 'am' ? off.departmentAm : off.departmentEn}
                    </p>
                    <div className="text-[10px] font-mono text-slate-400 mt-1">
                      {off.employeeId} • {off.jegGradeCode}
                    </div>
                  </div>

                  {/* Scannable Barcode */}
                  <div className="py-1 flex flex-col items-center justify-center">
                    <QrCodeDisplay
                      value={deskUrl}
                      size={160}
                      label={`WIN #${off.assignedWindowNum} CHECK-IN`}
                    />
                    <a
                      href={deskUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] font-mono text-emerald-800 hover:underline mt-2 block break-all max-w-[200px]"
                    >
                      {deskUrl}
                    </a>
                  </div>

                  {/* USSD Fallback */}
                  <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600 flex items-center justify-between">
                    <div className="text-left">
                      <p className="font-semibold text-slate-800">2G USSD Fallback:</p>
                      <p className="text-[10px] text-slate-500 font-mono">
                        *884*{300 + off.assignedWindowNum}#
                      </p>
                    </div>
                    <button
                      onClick={() => handleStartUssd(off.assignedWindowNum)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-mono rounded border border-slate-300"
                    >
                      Test USSD 📱
                    </button>
                  </div>
                </div>

                {/* Direct Simulator Link */}
                <Link
                  to={`/desk/${off.assignedWindowNum}`}
                  className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium text-center rounded-xl transition-colors shadow-xs block"
                >
                  Open Window #{off.assignedWindowNum} Citizen Screen
                </Link>
              </div>
            );
          })}
        </div>
      </main>

      {/* USSD Simulator Modal */}
      {ussdWindow !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-slate-950 text-white rounded-3xl max-w-xs w-full p-6 shadow-2xl border-4 border-slate-800 space-y-4 font-mono">
            <div className="text-center border-b border-slate-800 pb-2">
              <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold block">
                ETHIO TELECOM USSD GATEWAY
              </span>
              <span className="text-xs text-slate-400">
                Dialing: *884*{300 + ussdWindow}#
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-emerald-300 whitespace-pre-line leading-relaxed min-h-[140px]">
              {isUssdLoading ? 'Dialing *884#...' : ussdOutput}
            </div>

            <button
              onClick={() => {
                setUssdWindow(null);
                setUssdOutput('');
              }}
              className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-colors"
            >
              Dismiss USSD Screen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
