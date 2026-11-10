// Public Verification Portal Page
import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PublicVerificationView } from '../components/Common/PublicVerificationView';
import { SovereignGovHeader } from '../components/Layout/SovereignGovHeader';

export const VerifyPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hash = searchParams.get('hash') || searchParams.get('verify') || searchParams.get('ticket') || '';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <SovereignGovHeader currentModule="Public Verification Portal" />
      <main className="flex-1 flex items-center justify-center py-6">
        <PublicVerificationView
          hashParam={hash}
          onBack={() => navigate('/stands')}
        />
      </main>
    </div>
  );
};
