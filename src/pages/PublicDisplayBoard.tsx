// Public Waiting Hall Live Queue & Turnaround Display Screen with Real-Time Audio Chime
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { formatFullEthiopianDateTime } from '../utils/ethiopianCalendar';

export const PublicDisplayBoard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [currentUtc, setCurrentUtc] = useState<string>(new Date().toISOString());
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);
  const previousTicketsRef = useRef<Record<number, string>>({});

  const playGovChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      const now = ctx.currentTime;
      
      // Tone 1 (D5 - 587.33 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(587.33, now);
      gain1.gain.setValueAtTime(0.2, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.55);

      // Tone 2 (A5 - 880 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880.00, now + 0.25);
      gain2.gain.setValueAtTime(0.24, now + 0.25);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.25);
      osc2.stop(now + 0.95);
    } catch (e) {
      console.log('Audio chime error or blocked', e);
    }
  };

  const speakAnnouncement = (ticketNum: string, winNum: number) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const text = `Ticket ${ticketNum}, please proceed to Window ${winNum}. ትኬት ${ticketNum}, ወደ መስኮት ${winNum} ይሂዱ።`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        // Ignored
      }
    }
  };

  const fetchDisplayData = () => {
    fetch('/api/display/now-serving')
      .then(res => res.json())
      .then(d => {
        setData(d);
        // Check for new tickets called
        if (d?.windows) {
          d.windows.forEach((win: any) => {
            const prev = previousTicketsRef.current[win.window_num];
            const current = win.ticket_number;
            if (current && current !== prev) {
              if (audioEnabled) {
                playGovChime();
                setTimeout(() => {
                  speakAnnouncement(current, win.window_num);
                }, 600);
              }
            }
            if (current) {
              previousTicketsRef.current[win.window_num] = current;
            } else {
              delete previousTicketsRef.current[win.window_num];
            }
          });
        }
      })
      .catch(err => console.error('Display sync failed', err));
  };

  useEffect(() => {
    fetchDisplayData();
    const interval = setInterval(() => {
      fetchDisplayData();
      setCurrentUtc(new Date().toISOString());
    }, 2000);
    return () => clearInterval(interval);
  }, [audioEnabled]);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans select-none">
      {/* Top Sovereign Overhead Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-950 border-2 border-emerald-500 flex items-center justify-center font-serif text-sm font-bold text-emerald-300 shadow-md shrink-0">
            FDRE
          </div>
          <div>
            <span className="text-[11px] uppercase font-mono tracking-widest text-emerald-400 font-bold block">
              FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA • BOLE SUB-CITY ONE-STOP CENTER
            </span>
            <h1 className="text-xl font-bold tracking-tight text-white font-serif">
              የቦሌ ክፍለ ከተማ ወረዳ 03 የአንድ ማዕከል የቀጥታ አገልግሎት ማሳወቂያ ሰሌዳ
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => {
              setAudioEnabled(!audioEnabled);
              if (!audioEnabled) {
                playGovChime();
              }
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium flex items-center gap-2 transition-colors ${
              audioEnabled
                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <span>{audioEnabled ? '🔔 Chime & Audio: ON' : '🔕 Chime: OFF'}</span>
          </button>

          <div className="text-right font-mono hidden md:block">
            <div className="text-lg font-bold text-emerald-300">
              {formatFullEthiopianDateTime(currentUtc, 'am')}
            </div>
            <span className="text-xs text-slate-400">
              Citizen Charter Turnaround Monitoring Active
            </span>
          </div>
        </div>
      </header>

      {/* Main Grid: All Service Windows */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {data?.windows?.map((win: any) => {
          const isServing = !!win.ticket_number;
          const isOnBreak = win.officer_status === 'ON_BREAK';

          return (
            <div
              key={win.id || win.window_num}
              className={`rounded-2xl border-2 p-6 flex flex-col justify-between shadow-xl transition-all duration-300 ${
                isServing
                  ? 'bg-slate-900/90 border-emerald-500 shadow-emerald-950/50 ring-2 ring-emerald-500/50'
                  : isOnBreak
                  ? 'bg-slate-900/40 border-amber-500/40 opacity-75'
                  : 'bg-slate-900/60 border-slate-700'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-sm font-mono font-bold px-3 py-1 rounded-full bg-slate-800 text-white">
                    WINDOW #{win.window_num}
                  </span>
                  <span className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-full ${
                    isServing 
                      ? 'bg-emerald-500/20 text-emerald-300 animate-pulse border border-emerald-500/40' 
                      : isOnBreak 
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isServing ? 'NOW SERVING' : isOnBreak ? 'ON OFFICIAL BREAK' : 'READY / IDLE'}
                  </span>
                </div>

                {/* Big Ticket Readout */}
                <div className="text-center py-4 space-y-1">
                  <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest block">
                    ACTIVE TICKET
                  </span>
                  <div className={`text-5xl font-mono font-extrabold tracking-tight ${
                    isServing ? 'text-white drop-shadow-md' : 'text-slate-600'
                  }`}>
                    {win.ticket_number || '——'}
                  </div>
                </div>

                {/* Service & Officer Info */}
                <div className="space-y-1.5 text-center border-t border-slate-800/80 pt-3">
                  <h4 className="text-sm font-bold text-slate-100 truncate">
                    {win.service_name_am || win.department_am || win.service_name_en || win.department_en || 'Municipal Service Counter'}
                  </h4>
                  <div className="flex items-center justify-center gap-2">
                    {win.officer_photo_url && (
                      <img src={win.officer_photo_url} alt="" className="w-5 h-5 rounded-full object-cover border border-slate-600 inline-block" />
                    )}
                    <p className="text-xs text-emerald-400 font-medium font-serif">
                      {win.officer_name_am} ({win.officer_name_en})
                    </p>
                  </div>
                </div>
              </div>

              {/* Standard SLA Notice */}
              <div className="border-t border-slate-800 pt-3 text-center text-xs font-mono text-slate-400">
                {isServing ? (
                  <span>Charter Standard: <strong className="text-slate-200">{win.standard_duration_min} Minutes</strong></span>
                ) : (
                  <span className="text-slate-500">Scan desk QR code at Window #{win.window_num} to start</span>
                )}
              </div>
            </div>
          );
        })}
      </main>

      {/* Bottom Ticker: Recent Completed & Legal Hotline */}
      <footer className="bg-slate-900 border-t border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
        <div className="flex items-center gap-3 overflow-x-auto">
          <span className="font-bold text-white uppercase tracking-wider font-mono shrink-0">
            RECENTLY COMPLETED:
          </span>
          <div className="flex items-center gap-3 font-mono">
            {data?.recentCompleted?.length > 0 ? (
              data.recentCompleted.map((c: any, i: number) => (
                <span key={i} className="bg-slate-800 px-2.5 py-1 rounded text-slate-300 shrink-0">
                  {c.ticket_number} (Win #{c.window_num}) — <strong className="text-emerald-400">{c.actual_duration_min}m</strong>
                </span>
              ))
            ) : (
              <span className="text-slate-500 font-mono">Awaiting first transactions today</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4 text-slate-400 shrink-0">
          <span>Anti-Corruption Hotline: <strong className="text-white font-mono">8199 / 011-551-7000</strong></span>
          <Link to="/stands" className="text-emerald-400 underline font-mono">
            Desk Stands Directory →
          </Link>
        </div>
      </footer>
    </div>
  );
};
