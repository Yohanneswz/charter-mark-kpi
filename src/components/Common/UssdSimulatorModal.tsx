// Interactive USSD Feature-Phone Gateway Simulator (*884*303#)
import React, { useState } from 'react';

interface UssdSimulatorModalProps {
  onClose: () => void;
}

export const UssdSimulatorModal: React.FC<UssdSimulatorModalProps> = ({ onClose }) => {
  const [phoneNumber, setPhoneNumber] = useState<string>('0911223344');
  const [dialString, setDialString] = useState<string>('*884#');
  const [ussdHistory, setUssdHistory] = useState<string[]>([]);
  const [currentScreen, setCurrentScreen] = useState<string>(
`Welcome to FDRE Citizen Charter USSD
1. Check-In at Window
2. View Official Fees
3. Verify Civil Servant`
  );
  const [userInput, setUserInput] = useState<string>('');
  const [isSessionActive, setIsSessionActive] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() && ussdHistory.length > 0) return;

    setIsLoading(true);
    const newHistory = [...ussdHistory, userInput.trim()];
    const textPayload = newHistory.join('*');

    try {
      const res = await fetch('/api/ussd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber,
          text: textPayload
        })
      });

      const responseText = await res.text();
      setCurrentScreen(responseText.replace(/^(CON|END)\s*/, ''));
      setIsSessionActive(responseText.startsWith('CON'));
      setUssdHistory(newHistory);
      setUserInput('');
    } catch (err) {
      setCurrentScreen('Network Error: Could not connect to Ethio Telecom USSD gateway.');
      setIsSessionActive(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setUssdHistory([]);
    setUserInput('');
    setIsSessionActive(true);
    setCurrentScreen(
`Welcome to FDRE Citizen Charter USSD
1. Check-In at Window
2. View Official Fees
3. Verify Civil Servant`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
      <div className="bg-slate-900 text-slate-100 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-700 space-y-4">
        {/* Feature Phone Header */}
        <div className="text-center pb-2 border-b border-slate-800">
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
            ETHIO TELECOM 2G / FEATURE-PHONE SIMULATOR
          </span>
          <h3 className="text-sm font-bold text-white mt-0.5">
            USSD Gateway Interface (*884#)
          </h3>
          <span className="text-[11px] text-slate-400 font-mono">
            Simulated Phone: {phoneNumber}
          </span>
        </div>

        {/* Feature Phone Monospace LCD Screen */}
        <div className="bg-emerald-950/70 border-2 border-emerald-800 rounded-xl p-4 font-mono text-xs text-emerald-300 min-h-[140px] shadow-inner flex flex-col justify-between whitespace-pre-line leading-relaxed">
          <div>{isLoading ? 'Sending request to telecom tower...' : currentScreen}</div>
          <div className="text-[10px] text-emerald-600 border-t border-emerald-900/60 pt-1 mt-2 flex justify-between">
            <span>Status: {isSessionActive ? 'SESSION OPEN' : 'SESSION CLOSED'}</span>
            <span>2G GSM</span>
          </div>
        </div>

        {/* USSD Keypad Input Form */}
        {isSessionActive ? (
          <form onSubmit={handleSend} className="space-y-3">
            <div>
              <input
                type="text"
                autoFocus
                placeholder="Enter choice number (e.g. 1)"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="w-full text-center text-sm font-mono p-2.5 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono rounded-lg transition-colors"
              >
                Cancel / Redial
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-mono font-bold rounded-lg transition-colors shadow-sm"
              >
                Send Choice
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-2">
            <button
              onClick={handleReset}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-mono font-bold rounded-lg transition-colors shadow-sm"
            >
              Dial *884# Again
            </button>
          </div>
        )}

        <div className="pt-2 text-center">
          <button
            onClick={onClose}
            className="text-xs text-slate-400 hover:text-white transition-colors"
          >
            Close USSD Phone Simulator
          </button>
        </div>
      </div>
    </div>
  );
};
