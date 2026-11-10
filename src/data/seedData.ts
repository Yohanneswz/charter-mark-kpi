// Authentic seed dataset for Addis Ababa Bole Sub-City One-Stop Center
import { Office, Officer, CharterService, ServiceSession, EscalationAlert, SemesterAppraisal } from '../types';

export const initialOffice: Office = {
  id: 'off-bole-03',
  nameEn: 'Bole Sub-City Woreda 03 One-Stop Service Center',
  nameAm: 'የቦሌ ክፍለ ከተማ ወረዳ 03 የአንድ ማዕከል አገልግሎት መስጫ ማዕከል',
  nameOr: 'Magaalaa Boolee Aanaa 03 Wiirtuu Tajaajila Tokkoo',
  region: 'Addis Ababa',
  city: 'Addis Ababa',
  subCity: 'Bole',
  woreda: 'Woreda 03',
  centerType: 'Municipal One-Stop Center (አንድ ማዕከል)'
};

export const initialOfficers: Officer[] = [
  {
    id: 'off-101',
    employeeId: 'ETH-CSC-4491',
    fullNameEn: 'Alemayehu Tadesse',
    fullNameAm: 'አለማየሁ ታደሰ',
    fullNameOr: 'Alamayyahu Taaddasaa',
    assignedWindowNum: 3,
    jegGradeCode: 'JEG-VIII',
    baseSalaryEtb: 11500,
    departmentEn: 'Revenues & Tax Clearance Desk',
    departmentAm: 'የገቢዎችና ታክስ ክሊራንስ ዴስክ',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    phone: '+251 91 123 4567'
  },
  {
    id: 'off-102',
    employeeId: 'ETH-CSC-3820',
    fullNameEn: 'Almaz Bekele',
    fullNameAm: 'አልማዝ በቀለ',
    fullNameOr: 'Almaz Baqqalaa',
    assignedWindowNum: 1,
    jegGradeCode: 'JEG-VIII',
    baseSalaryEtb: 11500,
    departmentEn: 'Trade & Business Licensing Desk',
    departmentAm: 'የንግድና ስራ ፈቃድ ዴስክ',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    phone: '+251 91 234 5678'
  },
  {
    id: 'off-103',
    employeeId: 'ETH-CSC-5104',
    fullNameEn: 'Dawit Tsegaye',
    fullNameAm: 'ዳዊት ፀጋዬ',
    fullNameOr: 'Daawiit Tsaggaayee',
    assignedWindowNum: 2,
    jegGradeCode: 'JEG-IX',
    baseSalaryEtb: 13800,
    departmentEn: 'Vital Events & Kebele Civil Status',
    departmentAm: 'የወሳኝ ኩነቶችና የነዋሪነት አገልግሎት',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'ACTIVE',
    phone: '+251 91 345 6789'
  },
  {
    id: 'off-104',
    employeeId: 'ETH-CSC-2940',
    fullNameEn: 'Rahel Kebede',
    fullNameAm: 'ራሔል ከበደ',
    fullNameOr: 'Raaheel Kabbadaa',
    assignedWindowNum: 4,
    jegGradeCode: 'JEG-VII',
    baseSalaryEtb: 9800,
    departmentEn: 'Document Authentication Desk',
    departmentAm: 'የሰነዶች ማረጋገጫና ምዝገባ ዴስክ',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    status: 'ON_BREAK',
    phone: '+251 91 456 7890'
  }
];

export const initialCharterServices: CharterService[] = [
  {
    id: 'srv-01',
    serviceCode: 'REV-TC-01',
    nameEn: 'Tax Clearance Certificate',
    nameAm: 'የታክስ ክሊራንስ የምስክር ወረቀት',
    nameOr: 'Waraqaa Ragaa Qulqullina Gibiraa',
    standardDurationMin: 25,
    officialFeeEtb: 0, // Statutory Free service
    category: 'Revenue & Finance',
    requiredDocuments: {
      en: ['Valid Kebele ID or Fayda Digital ID', 'TIN Certificate', 'Previous Year Audit Clearance'],
      am: ['የታደሰ የቀበሌ መታወቂያ ወይም የፋይዳ ዲጂታል መታወቂያ', 'የግብር ከፋይ መለያ ቁጥር (TIN)', 'ያለፈው ዓመት የሂሳብ ማጠቃለያ'],
      om: ['Waraqaa Eenyummaa Aanaa ykn Fayda', 'Waraqaa TIN', 'Ragaa Herrega Waggaa Darbee']
    }
  },
  {
    id: 'srv-02',
    serviceCode: 'TRD-REN-02',
    nameEn: 'Annual Trade License Renewal',
    nameAm: 'ዓመታዊ የንግድ ስራ ፈቃድ እድሳት',
    nameOr: 'Haroomsi Eeyyama Daldala Waggaa',
    standardDurationMin: 35,
    officialFeeEtb: 150,
    category: 'Trade & Industry',
    requiredDocuments: {
      en: ['Original Trade License', 'Commercial Register Copy', 'Standard Office Lease Agreement'],
      am: ['ዋናው የንግድ ስራ ፈቃድ', 'የንግድ ምዝገባ ቅጂ', 'የተረጋገጠ የቢሮ ኪራይ ውል'],
      om: ['Eeyyama Daldalaa Jalqabaa', 'Galmee Daldalaa', 'Waliigaltee Kireeffannaa']
    }
  },
  {
    id: 'srv-03',
    serviceCode: 'VIT-UNM-03',
    nameEn: 'Certificate of Free Marital Status (Unmarried)',
    nameAm: 'ያላገባ የምስክር ወረቀት',
    nameOr: 'Waraqaa Ragaa Qeenxee (Kan Hin Fuune/Heerumni)',
    standardDurationMin: 20,
    officialFeeEtb: 50,
    category: 'Vital Events',
    requiredDocuments: {
      en: ['Original Kebele ID', 'Two Witness Declarations', 'Recent Passport Photograph'],
      am: ['ዋናው የቀበሌ መታወቂያ', 'የሁለት ምስክሮች ቃል', 'የቅርብ ጊዜ ፓስፖርት መጠን ፎቶ'],
      om: ['Waraqaa Eenyummaa', 'Ragaa Dhugaa Baatota Lamaa', 'Suuraa Paaspoortii']
    }
  },
  {
    id: 'srv-04',
    serviceCode: 'DOC-AUTH-04',
    nameEn: 'Power of Attorney Verification (ውክልና ማረጋገጥ)',
    nameAm: 'የውክልና ስልጣን ማረጋገጫ',
    nameOr: 'Mirkaneessa Bakka Bu\'iinsaa',
    standardDurationMin: 30,
    officialFeeEtb: 100,
    category: 'Legal Authentication',
    requiredDocuments: {
      en: ['Principal Kebele ID', 'Agent Identification Document', 'Draft Power of Attorney Document'],
      am: ['የወካይ የቀበሌ መታወቂያ', 'የተወካይ ህጋዊ ሰነድ', 'የተዘጋጀ የውክልና ሰነድ'],
      om: ['Eenyummaa Bakka Buusaa', 'Eenyummaa Bakka Bu\'aa', 'Waraqaa Bakka Bu\'iinsaa']
    }
  }
];

// Past sessions representing real morning transactions
export const initialSessions: ServiceSession[] = [
  {
    id: 'ses-901',
    serviceId: 'srv-01',
    officerId: 'off-101',
    windowNum: 3,
    citizenPhoneHash: '091****882',
    startedAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 88 * 60 * 1000).toISOString(),
    actualDurationMin: 22,
    metCharterSla: true,
    slaVarianceMin: -3,
    citizenRating: 5,
    complaintCategory: 'NONE',
    completionPin: '4192',
    sessionStatus: 'COMPLETED'
  },
  {
    id: 'ses-902',
    serviceId: 'srv-01',
    officerId: 'off-101',
    windowNum: 3,
    citizenPhoneHash: '092****311',
    startedAt: new Date(Date.now() - 80 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 56 * 60 * 1000).toISOString(),
    actualDurationMin: 24,
    metCharterSla: true,
    slaVarianceMin: -1,
    citizenRating: 4,
    complaintCategory: 'NONE',
    completionPin: '7823',
    sessionStatus: 'COMPLETED'
  },
  {
    id: 'ses-903',
    serviceId: 'srv-02',
    officerId: 'off-102',
    windowNum: 1,
    citizenPhoneHash: '094****190',
    startedAt: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 61 * 60 * 1000).toISOString(),
    actualDurationMin: 34,
    metCharterSla: true,
    slaVarianceMin: -1,
    citizenRating: 5,
    complaintCategory: 'NONE',
    completionPin: '5561',
    sessionStatus: 'COMPLETED'
  },
  {
    id: 'ses-904',
    serviceId: 'srv-04',
    officerId: 'off-104',
    windowNum: 4,
    citizenPhoneHash: '093****744',
    startedAt: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    completedAt: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    actualDurationMin: 55, // breached standard of 30 min
    metCharterSla: false,
    slaVarianceMin: 25,
    citizenRating: 2,
    complaintCategory: 'UNREASONABLE_DELAY',
    citizenNotes: 'Clerk was on a phone call while I sat waiting for 30 minutes.',
    completionPin: '8910',
    sessionStatus: 'COMPLETED'
  }
];

export const initialAlerts: EscalationAlert[] = [
  {
    id: 'alt-501',
    officerId: 'off-104',
    officerNameEn: 'Rahel Kebede',
    officerNameAm: 'ራሔል ከበደ',
    windowNum: 4,
    alertType: 'EXTREME_SLA_BREACH',
    incidentCount: 2,
    timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    severity: 'HIGH',
    descriptionEn: 'Average turnaround duration for Document Authentication exceeded Citizen Charter standard by 83% over morning session.',
    descriptionAm: 'የሰነዶች ማረጋገጫ አገልግሎት የሚወስደው ጊዜ ከዜጎች ቻርተር ስታንዳርድ በ 83% በልጦ ተመዝግቧል።',
    status: 'ACTIVE'
  }
];

// Historical Semester Appraisals for Alemayehu Tadesse (off-101) to demonstrate the 2-Year Aggregator
export const sampleHistoricalAppraisals: Record<string, SemesterAppraisal[]> = {
  'off-101': [
    {
      semesterId: '2015-S2',
      semesterLabel: '2015 ዓ.ም ሁለተኛ መንፈቅ (2023 G.C. Sem 2)',
      officerId: 'off-101',
      totalTransactions: 320,
      completedTransactions: 312,
      slaComplianceRate: 94,
      averageCitizenRating: 4.6,
      volumeEfficiencyScore: 24.5,
      slaComplianceScore: 18.8,
      citizenRatingScore: 13.5,
      objectiveScore60: 56.8,
      supervisorScore40: 36.0,
      totalAppraisalScore: 92.8,
      supervisorRemarks: 'Consistently punctilious, resolves citizen tax clearances with minimal delay.',
      evaluatedAt: '2023-07-15T08:00:00Z'
    },
    {
      semesterId: '2016-S1',
      semesterLabel: '2016 ዓ.ም አንደኛ መንፈቅ (2024 G.C. Sem 1)',
      officerId: 'off-101',
      totalTransactions: 345,
      completedTransactions: 338,
      slaComplianceRate: 92,
      averageCitizenRating: 4.5,
      volumeEfficiencyScore: 24.8,
      slaComplianceScore: 18.4,
      citizenRatingScore: 13.1,
      objectiveScore60: 56.3,
      supervisorScore40: 35.5,
      totalAppraisalScore: 91.8,
      supervisorRemarks: 'High volume efficiency and professional composure during tax season rush.',
      evaluatedAt: '2024-01-20T08:00:00Z'
    },
    {
      semesterId: '2016-S2',
      semesterLabel: '2016 ዓ.ም ሁለተኛ መንፈቅ (2024 G.C. Sem 2)',
      officerId: 'off-101',
      totalTransactions: 310,
      completedTransactions: 305,
      slaComplianceRate: 91,
      averageCitizenRating: 4.4,
      volumeEfficiencyScore: 24.0,
      slaComplianceScore: 18.2,
      citizenRatingScore: 12.8,
      objectiveScore60: 55.0,
      supervisorScore40: 35.0,
      totalAppraisalScore: 90.0,
      supervisorRemarks: 'Met all volume quotas. Clean audit log with zero ethics complaints.',
      evaluatedAt: '2024-07-18T08:00:00Z'
    },
    {
      semesterId: '2017-S1',
      semesterLabel: '2017 ዓ.ም አንደኛ መንፈቅ (2025 G.C. Sem 1)',
      officerId: 'off-101',
      totalTransactions: 360,
      completedTransactions: 352,
      slaComplianceRate: 93,
      averageCitizenRating: 4.7,
      volumeEfficiencyScore: 25.0,
      slaComplianceScore: 18.6,
      citizenRatingScore: 13.9,
      objectiveScore60: 57.5,
      supervisorScore40: 36.5,
      totalAppraisalScore: 94.0,
      supervisorRemarks: 'Exceptional SLA adherence. Top performer in sub-city revenue directorate.',
      evaluatedAt: '2025-01-25T08:00:00Z'
    }
  ]
};
