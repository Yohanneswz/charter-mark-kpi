// Official Federal Civil Service Staff Sign-In Portal
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { SovereignGovHeader } from '../components/Layout/SovereignGovHeader';

interface UserSession {
  id: string;
  username: string;
  role: 'CLERK' | 'DIRECTOR' | 'AUDITOR';
  officerId?: string;
  fullName: string;
  email: string;
  officer?: any;
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>('almaz');
  const [password, setPassword] = useState<string>('pass123');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Authentication failed');
      }

      const data = await res.json();
      localStorage.setItem('CHARTER_AUTH_TOKEN', data.token);
      localStorage.setItem('CHARTER_AUTH_USER', JSON.stringify(data.user));

      // Route by role
      if (data.user.role === 'CLERK') {
        navigate('/clerk');
      } else if (data.user.role === 'DIRECTOR') {
        navigate('/operations');
      } else if (data.user.role === 'AUDITOR') {
        navigate('/appraisal');
      } else {
        navigate('/clerk');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  const setDemoRole = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <SovereignGovHeader currentModule="Civil Service Staff Sign-In" />
      <div className="flex-1 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-emerald-950 text-emerald-300 border-2 border-emerald-700 flex items-center justify-center font-serif text-base font-bold mx-auto shadow-sm">
          FDRE
        </div>
        <span className="text-xs uppercase font-mono tracking-widest text-emerald-800 font-bold block">
          FEDERAL DEMOCRATIC REPUBLIC OF ETHIOPIA
        </span>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 font-serif">
          Civil Service Staff Portal
        </h2>
        <p className="text-xs text-slate-500">
          Sign in to access your designated frontline service window or oversight console.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl border border-slate-200 sm:rounded-2xl sm:px-10 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Civil Service Username / ID
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full text-sm font-mono p-3 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1">
                Password / Security PIN
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-sm font-mono p-3 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-xs rounded-xl transition-colors shadow-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
            >
              {isLoading ? 'Verifying Credentials...' : 'Sign In to Government Workbench'}
            </button>
          </form>

          {/* Quick-Switch Demo Role Switcher */}
          <div className="border-t border-slate-100 pt-5 space-y-3">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-semibold block text-center">
              Quick Role Test Logins
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setDemoRole('almaz', 'pass123')}
                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors"
              >
                <strong className="block text-slate-900 font-semibold">Almaz Bekele</strong>
                <span className="text-[11px] text-slate-500 font-mono">Win #1 (Licensing)</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoRole('alemayehu', 'pass123')}
                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors"
              >
                <strong className="block text-slate-900 font-semibold">Alemayehu T.</strong>
                <span className="text-[11px] text-slate-500 font-mono">Win #3 (Tax)</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoRole('director', 'admin123')}
                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors"
              >
                <strong className="block text-slate-900 font-semibold">Bureau Head</strong>
                <span className="text-[11px] text-slate-500 font-mono">Operations & Ethics</span>
              </button>

              <button
                type="button"
                onClick={() => setDemoRole('auditor', 'admin123')}
                className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-colors"
              >
                <strong className="block text-slate-900 font-semibold">CSC Auditor</strong>
                <span className="text-[11px] text-slate-500 font-mono">2-Year Appraisals</span>
              </button>
            </div>
          </div>

          <div className="pt-2 text-center">
            <Link
              to="/stands"
              className="text-xs text-emerald-800 hover:underline font-medium"
            >
              ← View Physical Desk QR Stands (Citizen Access)
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
};
