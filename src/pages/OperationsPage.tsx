// Executive Operations & Anti-Corruption Center Page
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { OperationsCenter } from '../components/Bureau/OperationsCenter';
import { SovereignGovHeader } from '../components/Layout/SovereignGovHeader';

export const OperationsPage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('CHARTER_AUTH_USER');
    if (!savedUser) {
      navigate('/login');
      return;
    }
    const parsed = JSON.parse(savedUser);
    if (parsed.role === 'CLERK') {
      navigate('/clerk');
      return;
    }
    setUser(parsed);
  }, [navigate]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SovereignGovHeader currentModule="Executive Operations & Anti-Corruption Center" />
      <main className="flex-1">
        <OperationsCenter />
      </main>
    </div>
  );
};
