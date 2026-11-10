// Citizen Desk QR Interaction Component with Genuine Camera-Scannable QR Support & Bulletproof Fallbacks
import React, { useState, useEffect } from 'react';
import { useSystem } from '../../context/SystemContext';
import { initialOfficers, initialCharterServices } from '../../data/seedData';
import { QrCodeDisplay } from '../../utils/qrGenerator';
import { ActiveServiceTimer } from './ActiveServiceTimer';
import { CitizenFeedbackModal } from './CitizenFeedbackModal';

export const DeskQrScanner: React.FC = () => {
  const { 
    language, 
    officers, 
    services, 
    startCitizenSession, 
    activeCitizenSession 
  } = useSystem();

  const [selectedOfficerId, setSelectedOfficerId] = useState<string>('off-101');
  const [selectedServiceId, setSelectedServiceId] = useState<string>('srv-01');
  const [phoneNumber, setPhoneNumber] = useState<string>('0911239845');
  const [isFinishingSession, setIsFinishingSession] = useState<boolean>(false);
  const [qrHostMode, setQrHostMode] = useState<'wifi' | 'origin'>('wifi');
  const [customHost, setCustomHost] = useState<string>('http://192.168.1.2:3000');

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
      setCustomHost(window.location.origin);
      setQrHostMode('origin');
    }
  }, []);

  // Safe fallback guarantees no undefined property errors
  const safeOfficers = officers.length > 0 ? officers : initialOfficers;
  const safeServices = services.length > 0 ? services : initialCharterServices;

  const officer = safeOfficers.find(o => o.id === selectedOfficerId) || safeOfficers[0];
  const service = safeServices.find(s => s.id === selectedServiceId) || safeServices[0];

  const handleStart = () => {
    startCitizenSession(service.id, officer.id, officer.assignedWindowNum, phoneNumber);
  };

  const strings = {
    title: {
      en: 'Frontline Citizen Check-In',
      am: 'የዜጎች መስተንግዶና አገልግሎት መጀመሪያ',
      om: 'Simannaa fi Eegalchiisa Tajaajila Lammiilee'
    },
    subtitle: {
      en: 'Scan the acrylic desk QR stand with your smartphone camera or select your window below to initiate a timestamped service record.',
      am: 'በመስኮቱ ላይ ያለውን የQR ኮድ በሞባይል ካሜራዎ በመቃኘት ወይም ከታች ያለውን መስኮት በመምረጥ የአገልግሎት ቆጣሪውን ያስጀምሩ።',
      om: 'Koodii QR teessoo irra jiru kaameeraa bilbilaatiin iskaan gochuun ykn goolii filachuun sa\'aatii tajaajilaa eegalsiisaa.'
    },
    selectWindow: {
      en: 'Select Service Window (Physical Counter)',
      am: 'የአገልግሎት መስኮት ይምረጡ',
      om: 'Goolii Tajaajilaa Filadhaa'
    },
    serviceHeading: {
      en: 'Select Required Public Service',
      am: 'የሚፈልጉትን የመንግስት አገልግሎት ይምረጡ',
      om: 'Tajaajila Mootummaa Barbaaddan Filadhaa'
    },
    officialFee: {
      en: 'Official Government Fee',
      am: 'ህጋዊ የመንግስት ክፍያ',
      om: 'Kaffaltii Mootummaa Seera Qabeessa'
    },
    freeService: {
      en: 'Statutory Free Service (No Fee Permitted)',
      am: 'ከክፍያ ነጻ (ማንኛውንም ክፍያ መክፈል የተከለከለ ነው)',
      om: 'Kaffaltii Tokko Malee'
    },
    standardTime: {
      en: 'Citizen Charter Standard Time',
      am: 'የዜጎች ቻርተር ስታንዳርድ ጊዜ',
      om: 'Yeroo Sadarkaa Chaartarii Lammiilee'
    },
    startService: {
      en: 'Check-In & Start Service Timer',
      am: 'መስተንግዶ ጀምር (ቆጣሪ አስጀምር)',
      om: 'Tajaajila Eegali'
    },
    acrylicHeader: {
      en: 'Official Desk QR Stand',
      am: 'ኦፊሴላዊ የዴስክ QR ሰሌዳ',
      om: 'Gabatee QR Teessoo Seera Qabeessa'
    },
    ussdFallback: {
      en: 'Feature Phone Short Code: Dial',
      am: 'የመደበኛ ስልክ USSD ኮድ፡ ይደውሉ',
      om: 'Koodii USSD Bilbila Idilee:'
    }
  };

  const activeQrBaseUrl = qrHostMode === 'wifi' 
    ? 'http://192.168.1.5:3000' 
    : (typeof window !== 'undefined' ? window.location.origin : 'http://127.0.0.1:3000');
  
  const scannableQrUrl = `${activeQrBaseUrl}/?window=${officer.assignedWindowNum}`;

  if (activeCitizenSession && !isFinishingSession) {
    return (
      <ActiveServiceTimer 
        session={activeCitizenSession} 
        onTriggerCompletion={() => setIsFinishingSession(true)} 
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Intro Header */}
      <div className="max-w-3xl mb-8">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {strings.title[language]}
        </h2>
        <p className="text-sm text-slate-600 mt-1 leading-relaxed">
          {strings.subtitle[language]}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Window & Service Selection Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Window Selector */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              {strings.selectWindow[language]}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {safeOfficers.map((off) => {
                const isSelected = off.id === selectedOfficerId;
                return (
                  <button
                    key={off.id}
                    onClick={() => setSelectedOfficerId(off.id)}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      isSelected
                        ? 'border-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-700'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <span className="block text-xs font-mono font-bold text-slate-900">
                      Window #{off.assignedWindowNum}
                    </span>
                    <span className="block text-xs text-slate-700 font-medium truncate mt-0.5">
                      {language === 'am' ? off.fullNameAm : off.fullNameEn}
                    </span>
                    <span className="block text-[11px] text-slate-500 mt-1">
                      {off.jegGradeCode}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Service Selector & Fee Transparency */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
                {strings.serviceHeading[language]}
              </label>
              <div className="space-y-2.5">
                {safeServices.map((srv) => {
                  const isSelected = srv.id === selectedServiceId;
                  const srvName = language === 'am' ? srv.nameAm : language === 'om' ? srv.nameOr : srv.nameEn;
                  return (
                    <div
                      key={srv.id}
                      onClick={() => setSelectedServiceId(srv.id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-emerald-700 bg-emerald-50/40 ring-1 ring-emerald-700'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="space-y-0.5 pr-4">
                        <span className="text-xs font-mono text-slate-400 block">{srv.serviceCode}</span>
                        <h4 className="text-sm font-semibold text-slate-900">{srvName}</h4>
                        <div className="text-xs text-slate-500">
                          {strings.standardTime[language]}: <strong className="text-slate-800 font-semibold">{srv.standardDurationMin} min</strong>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="block text-xs font-mono font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded">
                          {srv.officialFeeEtb === 0 ? '0.00 ETB (FREE)' : `${srv.officialFeeEtb}.00 ETB`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Anti-Corruption Fee Guarantee Notice */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700 space-y-1">
              <div className="font-semibold text-slate-900">
                {strings.officialFee[language]}:{' '}
                <span className="text-emerald-800">
                  {service.officialFeeEtb === 0 ? strings.freeService[language] : `${service.officialFeeEtb} ETB`}
                </span>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Notice: Civil servants are strictly prohibited under Proclamation No. 1353/2025 from demanding fees exceeding the official schedule.
              </p>
            </div>

            {/* Start Button */}
            <div className="pt-2">
              <button
                onClick={handleStart}
                className="w-full py-3.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-sm rounded-lg transition-colors shadow-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
              >
                {strings.startService[language]}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Realistic Physical Acrylic Desk Stand with CAMERA-SCANNABLE QR */}
        <div className="lg:col-span-5">
          <div className="bg-gradient-to-b from-slate-100 to-slate-200 p-6 rounded-2xl border border-slate-300 shadow-md">
            <div className="text-center mb-3">
              <span className="text-[11px] font-mono tracking-widest uppercase font-semibold text-slate-500">
                {strings.acrylicHeader[language]}
              </span>
            </div>

            {/* Scannable Target Selector for local Wi-Fi vs Localhost */}
            <div className="mb-4 bg-white/80 p-2 rounded-lg border border-slate-300/70 text-[11px] flex items-center justify-between gap-2">
              <span className="text-slate-600 font-medium">QR Link Target:</span>
              <div className="inline-flex rounded bg-slate-200 p-0.5">
                <button
                  type="button"
                  onClick={() => setQrHostMode('wifi')}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    qrHostMode === 'wifi' ? 'bg-emerald-800 text-white font-bold' : 'text-slate-700 hover:text-slate-900'
                  }`}
                  title="Phone camera scan on same Wi-Fi network"
                >
                  Wi-Fi (192.168.1.5)
                </button>
                <button
                  type="button"
                  onClick={() => setQrHostMode('origin')}
                  className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    qrHostMode === 'origin' ? 'bg-emerald-800 text-white font-bold' : 'text-slate-700 hover:text-slate-900'
                  }`}
                  title="Current browser origin"
                >
                  Localhost
                </button>
              </div>
            </div>

            {/* Physical Stand Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 text-center shadow-lg space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <span className="inline-block px-3 py-1 rounded-full bg-slate-900 text-white font-mono text-xs font-bold tracking-wider mb-2">
                  WINDOW #{officer.assignedWindowNum}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {language === 'am' ? officer.fullNameAm : officer.fullNameEn}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {language === 'am' ? officer.departmentAm : officer.departmentEn}
                </p>
                <div className="text-[11px] font-mono text-slate-400 mt-1">
                  ID: {officer.employeeId} • {officer.jegGradeCode}
                </div>
              </div>

              {/* Real Camera-Scannable QR Code */}
              <div className="py-2 flex flex-col items-center justify-center">
                <QrCodeDisplay
                  value={scannableQrUrl}
                  size={190}
                  label={`SCAN TO CHECK-IN (WIN #${officer.assignedWindowNum})`}
                />
                <a
                  href={scannableQrUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-mono text-emerald-700 hover:underline mt-2 block break-all max-w-[260px]"
                >
                  {scannableQrUrl}
                </a>
              </div>

              <div className="pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800">
                  Point Phone Camera or Scan in Telegram
                </p>
                <p className="text-[11px] text-slate-500">
                  {strings.ussdFallback[language]} <strong className="font-mono text-slate-800">*884*{300 + officer.assignedWindowNum}#</strong>
                </p>
              </div>
            </div>

            <div className="mt-4 text-center text-xs text-slate-500 leading-relaxed">
              Standard QR Code with error correction. Opens directly into the citizen check-in terminal on mobile.
            </div>
          </div>
        </div>
      </div>

      {isFinishingSession && activeCitizenSession && (
        <CitizenFeedbackModal
          session={activeCitizenSession}
          onClose={() => setIsFinishingSession(false)}
        />
      )}
    </div>
  );
};
