// Production-Ready Route Architecture for Charter Mark KPI System
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SystemProvider } from './context/SystemContext';
import { DeskStandsDirectory } from './pages/DeskStandsDirectory';
import { CitizenDeskPage } from './pages/CitizenDeskPage';
import { LoginPage } from './pages/LoginPage';
import { ClerkPage } from './pages/ClerkPage';
import { OperationsPage } from './pages/OperationsPage';
import { AppraisalPage } from './pages/AppraisalPage';
import { VerifyPage } from './pages/VerifyPage';
import { PublicDisplayBoard } from './pages/PublicDisplayBoard';

export default function App() {
  return (
    <SystemProvider>
      <BrowserRouter>
        <Routes>
          {/* Default entry point: Physical Desk Stands Directory */}
          <Route path="/" element={<Navigate to="/stands" replace />} />
          
          {/* 1. Physical Desk QR Stands (Windows 1, 2, 3, 4) */}
          <Route path="/stands" element={<DeskStandsDirectory />} />
          
          {/* 2. Isolated Citizen Desk Portal (Parametric by Window Number) */}
          <Route path="/desk/:windowNum" element={<CitizenDeskPage />} />
          
          {/* 3. Civil Service Staff Authentication */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* 4. Frontline Clerk Counter Workbench (Locked to Authenticated Officer) */}
          <Route path="/clerk" element={<ClerkPage />} />
          
          {/* 5. Executive Operations & Anti-Corruption Center (Management & Ethics) */}
          <Route path="/operations" element={<OperationsPage />} />
          
          {/* 6. Statutory Two-Year Appraisal & Increment Engine (Civil Service Commission) */}
          <Route path="/appraisal" element={<AppraisalPage />} />
          
          {/* 7. Public Cryptographic Certificate Verification */}
          <Route path="/verify" element={<VerifyPage />} />

          {/* 8. Public Waiting Hall Overhead TV Display */}
          <Route path="/display" element={<PublicDisplayBoard />} />

          {/* Fallback to Stands */}
          <Route path="*" element={<Navigate to="/stands" replace />} />
        </Routes>
      </BrowserRouter>
    </SystemProvider>
  );
}
