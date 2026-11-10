// Full-Stack Real Backend Integration for Charter Mark KPI System with Instant Initial Fallbacks
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Language, 
  Office, 
  Officer, 
  CharterService, 
  ServiceSession, 
  EscalationAlert, 
  SemesterAppraisal, 
  ComplaintCategory 
} from '../types';
import { 
  initialOffice, 
  initialOfficers, 
  initialCharterServices, 
  initialSessions, 
  initialAlerts, 
  sampleHistoricalAppraisals 
} from '../data/seedData';

interface SystemContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  office: Office;
  officers: Officer[];
  services: CharterService[];
  sessions: ServiceSession[];
  alerts: EscalationAlert[];
  appraisals: Record<string, SemesterAppraisal[]>;
  currentOfficerId: string;
  setCurrentOfficerId: (id: string) => void;
  activeCitizenSession: ServiceSession | null;
  isLoading: boolean;
  isBackendConnected: boolean;
  startCitizenSession: (serviceId: string, officerId: string, windowNum: number, phone?: string, faydaFin?: string) => Promise<ServiceSession>;
  completeSession: (sessionId: string, rating: number, complaint: ComplaintCategory, notes?: string, enteredPin?: string) => Promise<boolean>;
  cancelSession: (sessionId: string) => Promise<void>;
  resolveAlert: (alertId: string, actionNotes: string) => Promise<void>;
  dismissAlert: (alertId: string) => Promise<void>;
  addSupervisorScore: (officerId: string, semesterId: string, score40: number, remarks: string) => Promise<void>;
  resetDemoData: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');
  const [office, setOffice] = useState<Office>(initialOffice);
  // Safe initial state prevents undefined crashes during initial synchronous render
  const [officers, setOfficers] = useState<Officer[]>(initialOfficers);
  const [services, setServices] = useState<CharterService[]>(initialCharterServices);
  const [sessions, setSessions] = useState<ServiceSession[]>(initialSessions);
  const [alerts, setAlerts] = useState<EscalationAlert[]>(initialAlerts);
  const [appraisals, setAppraisals] = useState<Record<string, SemesterAppraisal[]>>(sampleHistoricalAppraisals);
  const [currentOfficerId, setCurrentOfficerId] = useState<string>('off-101');
  const [activeCitizenSession, setActiveCitizenSession] = useState<ServiceSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  // Map database officer row to frontend Officer type
  const mapOfficer = (row: any): Officer => ({
    id: row.id,
    employeeId: row.employee_id,
    fullNameEn: row.full_name_en,
    fullNameAm: row.full_name_am,
    fullNameOr: row.full_name_or,
    assignedWindowNum: row.assigned_window_num,
    jegGradeCode: row.jeg_grade_code,
    baseSalaryEtb: row.base_salary_etb,
    departmentEn: row.department_en,
    departmentAm: row.department_am,
    photoUrl: row.photo_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    status: row.status,
    phone: row.phone
  });

  // Map database service row to CharterService type
  const mapService = (row: any): CharterService => ({
    id: row.id,
    serviceCode: row.service_code,
    nameEn: row.name_en,
    nameAm: row.name_am,
    nameOr: row.name_or,
    standardDurationMin: row.standard_duration_min,
    officialFeeEtb: row.official_fee_etb,
    category: row.category,
    requiredDocuments: row.requiredDocs || { en: [], am: [], om: [] }
  });

  // Map database session row to ServiceSession type
  const mapSession = (row: any): ServiceSession => ({
    id: row.id,
    ticketNumber: row.ticket_number,
    serviceId: row.service_id,
    officerId: row.officer_id,
    windowNum: row.window_num,
    citizenPhoneHash: row.citizen_phone_hash,
    faydaFinHash: row.fayda_fin_hash,
    startedAt: row.started_at,
    completedAt: row.completed_at || undefined,
    actualDurationMin: row.actual_duration_min !== null ? row.actual_duration_min : undefined,
    metCharterSla: row.met_charter_sla === 1,
    slaVarianceMin: row.sla_variance_min !== null ? row.sla_variance_min : undefined,
    citizenRating: row.citizen_rating || undefined,
    complaintCategory: row.complaint_category || 'NONE',
    citizenNotes: row.citizen_notes || undefined,
    completionPin: row.completion_pin,
    sessionStatus: row.session_status,
    documentsVerifiedJson: row.documents_verified_json
  });

  // Map database alert row to EscalationAlert type
  const mapAlert = (row: any): EscalationAlert => ({
    id: row.id,
    officerId: row.officer_id,
    officerNameEn: row.officer_name_en,
    officerNameAm: row.officer_name_am,
    windowNum: row.window_num,
    alertType: row.alert_type,
    incidentCount: row.incident_count || 1,
    timestamp: row.timestamp,
    severity: row.severity,
    descriptionEn: row.description_en,
    descriptionAm: row.description_am,
    status: row.status,
    actionTakenNotes: row.action_taken_notes || undefined
  });

  // Refresh all state from the real SQLite database
  const refreshData = useCallback(async () => {
    try {
      const [officesRes, officersRes, servicesRes, sessionsRes, alertsRes] = await Promise.all([
        fetch('/api/offices'),
        fetch('/api/officers'),
        fetch('/api/services'),
        fetch('/api/sessions/history'),
        fetch('/api/alerts')
      ]);

      if (officesRes.ok && officersRes.ok && servicesRes.ok) {
        const officeData = await officesRes.json();
        const officersData = await officersRes.json();
        const servicesData = await servicesRes.json();
        const sessionsData = await sessionsRes.json();
        const alertsData = await alertsRes.json();

        if (officeData) {
          setOffice({
            id: officeData.id,
            nameEn: officeData.name_en,
            nameAm: officeData.name_am,
            nameOr: officeData.name_or,
            region: officeData.region,
            city: officeData.city,
            subCity: officeData.sub_city,
            woreda: officeData.woreda,
            centerType: officeData.center_type
          });
        }

        if (Array.isArray(officersData) && officersData.length > 0) {
          setOfficers(officersData.map(mapOfficer));
        }
        if (Array.isArray(servicesData) && servicesData.length > 0) {
          setServices(servicesData.map(mapService));
        }
        if (Array.isArray(sessionsData)) {
          const mappedSessions = sessionsData.map(mapSession);
          setSessions(mappedSessions);
          const inProgress = mappedSessions.find((s: ServiceSession) => s.sessionStatus === 'IN_PROGRESS');
          setActiveCitizenSession(inProgress || null);
        }
        if (Array.isArray(alertsData)) {
          setAlerts(alertsData.map(mapAlert));
        }

        // Fetch appraisals for current officer
        if (currentOfficerId) {
          const appRes = await fetch(`/api/appraisals/${currentOfficerId}`);
          if (appRes.ok) {
            const appData = await appRes.json();
            if (appData.semesters && Array.isArray(appData.semesters) && appData.semesters.length > 0) {
              setAppraisals(prev => ({
                ...prev,
                [currentOfficerId]: appData.semesters.map((s: any) => ({
                  semesterId: s.semester_id,
                  semesterLabel: s.semester_label,
                  officerId: s.officer_id,
                  totalTransactions: s.total_transactions,
                  completedTransactions: s.completed_transactions,
                  slaComplianceRate: s.sla_compliance_rate,
                  averageCitizenRating: s.average_citizen_rating,
                  volumeEfficiencyScore: s.volume_efficiency_score,
                  slaComplianceScore: s.sla_compliance_score,
                  citizenRatingScore: s.citizen_rating_score,
                  objectiveScore60: s.objective_score_60,
                  supervisorScore40: s.supervisor_score_40,
                  totalAppraisalScore: s.total_appraisal_score,
                  supervisorRemarks: s.supervisor_remarks || '',
                  evaluatedAt: s.evaluated_at
                }))
              }));
            }
          }
        }

        setIsBackendConnected(true);
      }
    } catch (err) {
      console.warn('[SystemContext] Failed to connect to SQLite backend. Retrying...', err);
      setIsBackendConnected(false);
    }
  }, [currentOfficerId]);

  // Initial load
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  // Reactive Polling every 2.5 seconds for live desk & counter synchronization
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 2500);
    return () => clearInterval(interval);
  }, [refreshData]);

  // Real backend operations
  const startCitizenSession = async (
    serviceId: string, 
    officerId: string, 
    windowNum: number, 
    phone?: string,
    faydaFin?: string
  ): Promise<ServiceSession> => {
    const res = await fetch('/api/sessions/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        serviceId, 
        officerId, 
        windowNum, 
        citizenPhone: phone,
        faydaId: faydaFin 
      })
    });

    if (!res.ok) {
      throw new Error('Failed to start session on backend');
    }

    const data = await res.json();
    const newSession = mapSession(data);
    setActiveCitizenSession(newSession);
    await refreshData();
    return newSession;
  };

  const completeSession = async (
    sessionId: string,
    rating: number,
    complaint: ComplaintCategory,
    notes?: string,
    enteredPin?: string
  ): Promise<boolean> => {
    const res = await fetch(`/api/sessions/${sessionId}/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating,
        complaintCategory: complaint,
        citizenNotes: notes,
        enteredPin
      })
    });

    if (!res.ok) {
      const err = await res.json();
      console.error('Failed to complete session:', err);
      return false;
    }

    if (activeCitizenSession?.id === sessionId) {
      setActiveCitizenSession(null);
    }

    await refreshData();
    return true;
  };

  const cancelSession = async (sessionId: string) => {
    await fetch(`/api/sessions/${sessionId}/cancel`, { method: 'POST' });
    if (activeCitizenSession?.id === sessionId) {
      setActiveCitizenSession(null);
    }
    await refreshData();
  };

  const resolveAlert = async (alertId: string, actionNotes: string) => {
    await fetch(`/api/alerts/${alertId}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actionNotes })
    });
    await refreshData();
  };

  const dismissAlert = async (alertId: string) => {
    await fetch(`/api/alerts/${alertId}/dismiss`, { method: 'POST' });
    await refreshData();
  };

  const addSupervisorScore = async (
    officerId: string, 
    semesterId: string, 
    score40: number, 
    remarks: string
  ) => {
    await fetch('/api/appraisals/supervisor-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        officerId,
        semesterId,
        supervisorScore40: score40,
        remarks
      })
    });
    await refreshData();
  };

  const resetDemoData = async () => {
    await fetch('/api/reset', { method: 'POST' });
    await refreshData();
  };

  return (
    <SystemContext.Provider
      value={{
        language,
        setLanguage,
        office,
        officers,
        services,
        sessions,
        alerts,
        appraisals,
        currentOfficerId,
        setCurrentOfficerId,
        activeCitizenSession,
        isLoading,
        isBackendConnected,
        startCitizenSession,
        completeSession,
        cancelSession,
        resolveAlert,
        dismissAlert,
        addSupervisorScore,
        resetDemoData,
        refreshData
      }}
    >
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const context = useContext(SystemContext);
  if (!context) {
    throw new Error('useSystem must be used within a SystemProvider');
  }
  return context;
};
