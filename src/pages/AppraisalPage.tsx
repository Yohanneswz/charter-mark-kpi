// Civil Service Commission 2-Year Appraisal & Increment Page
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TwoYearAggregator } from '../components/Appraisal/TwoYearAggregator';
import { SovereignGovHeader } from '../components/Layout/SovereignGovHeader';

export const AppraisalPage: React.FC = () => {
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
      <SovereignGovHeader currentModule="Civil Service Commission 2-Year Appraisal Engine" />
      <main className="flex-1">
        <TwoYearAggregator />
      </main>
    </div>
  );
};
