// Citizen Feedback & Anti-Corruption Reporting Modal under Proclamation 1353/2025
import React, { useState } from 'react';
import { ServiceSession, ComplaintCategory } from '../../types';
import { useSystem } from '../../context/SystemContext';

interface CitizenFeedbackModalProps {
  session: ServiceSession;
  onClose: () => void;
}

export const CitizenFeedbackModal: React.FC<CitizenFeedbackModalProps> = ({
  session,
  onClose
}) => {
  const { language, completeSession } = useSystem();
  const [rating, setRating] = useState<number>(5);
  const [complaint, setComplaint] = useState<ComplaintCategory>('NONE');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    completeSession(session.id, rating, complaint, notes.trim() || undefined);
    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1400);
  };

  const strings = {
    title: {
      en: 'Citizen Charter Service Evaluation',
      am: 'የዜጎች ቻርተር የአገልግሎት ምዘና',
      om: 'Madaallii Tajaajila Chaartarii Lammiilee'
    },
    subtitle: {
      en: 'Your rating directly impacts the civil servant\'s statutory performance appraisal and salary increment eligibility under Proclamation 1353/2025.',
      am: 'የእርስዎ ምዘና በአዋጅ ቁጥር 1353/2017 መሰረት የባለሙያውን የደመወዝ እርከን ጭማሪ በቀጥታ ይወስናል።',
      om: 'Madaalliin keessan bu\'uura Labsii 1353/2017tiin daballii miindaa hojjetaa murteessa.'
    },
    rateLabel: {
      en: 'Overall Service Experience (1 - 5 Stars)',
      am: 'አጠቃላይ የአገልግሎት እርካታ (ከ1 እስከ 5 ኮከብ)',
      om: 'Sadarkaa Itti Quufinsaa (1 - 5)'
    },
    flagsLabel: {
      en: 'Statutory Governance & Ethics Verification',
      am: 'የስነ-ምግባርና የአገልግሎት ጥራት ማረጋገጫ',
      om: 'Mirkaneessa Naamusaa fi Qulqullinaa'
    },
    notesLabel: {
      en: 'Optional Comments or Specific Remarks',
      am: 'ተጨማሪ አስተያየት ወይም ማስታወሻ (አማራጭ)',
      om: 'Yaada Dabalataa (Yoo Jiraate)'
    },
    submit: {
      en: 'Submit Official Feedback',
      am: 'ምዘናውን በይፋ አስገባ',
      om: 'Madaallii Galchi'
    },
    thankYou: {
      en: 'Thank you. Your evaluation has been recorded in the civil servant\'s empirical KPI ledger.',
      am: 'እናመሰግናለን። ምዘናዎ በባለሙያው የብቃት መዝገብ ላይ ተመዝግቧል።',
      om: 'Galatoomaa. Madaalliin keessan galmaa\'eera.'
    }
  };

  const complaintOptions: { key: ComplaintCategory; labelEn: string; labelAm: string; isSevere?: boolean }[] = [
    { key: 'NONE', labelEn: 'Normal / Satisfactory (No Grievance)', labelAm: 'መደበኛ / አጥጋቢ (ቅሬታ የለም)' },
    { key: 'OFFICER_ABSENT', labelEn: 'Officer absent from desk during working hours', labelAm: 'ባለሙያው በስራ ሰዓት በመስኮቱ አልተገኘም', isSevere: true },
    { key: 'BRIBE_SOLICITED', labelEn: 'Irregular fee or bribe requested (ጉቦ ተጠይቋል)', labelAm: 'ህገ-ወጥ ክፍያ ወይም ጉቦ ተጠይቋል', isSevere: true },
    { key: 'SYSTEM_DOWN', labelEn: 'Officer claimed system was down without cause', labelAm: 'ባለሙያው ሲስተም የለም በማለት አጉላልቷል' },
    { key: 'UNREASONABLE_DELAY', labelEn: 'Unreasonable stall or procedural delay', labelAm: 'ምክንያት የሌለው መጉላላትና መዘግየት ደርሷል' },
    { key: 'POOR_CONDUCT', labelEn: 'Unprofessional or disrespectful conduct', labelAm: 'ተገቢ ያልሆነ የስነ-ምግባር ጉድለት' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200">
        {isSubmitted ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto text-xl font-bold font-mono">
              ✓
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {strings.thankYou[language]}
            </h3>
            <p className="text-xs text-slate-500 font-mono">
              Verified Session ID: {session.id}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-800 font-bold block mb-1">
                WINDOW #{session.windowNum} EVALUATION
              </span>
              <h3 className="text-lg font-bold text-slate-900">
                {strings.title[language]}
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                {strings.subtitle[language]}
              </p>
            </div>

            {/* 1 - 5 Star Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                {strings.rateLabel[language]}
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const isFilled = star <= rating;
                  return (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`w-12 h-12 rounded-lg border font-mono font-bold text-base transition-all ${
                        isFilled
                          ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                          : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {star}★
                    </button>
                  );
                })}
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono">
                {rating === 5 ? '5.0 - Excellent Service' : rating >= 3 ? `${rating}.0 - Acceptable Standard` : `${rating}.0 - Unsatisfactory Standard`}
              </div>
            </div>

            {/* Anti-Corruption Flag Checklist */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                {strings.flagsLabel[language]}
              </label>
              <div className="space-y-2">
                {complaintOptions.map((opt) => {
                  const isChecked = complaint === opt.key;
                  return (
                    <label
                      key={opt.key}
                      onClick={() => setComplaint(opt.key)}
                      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                        isChecked
                          ? opt.isSevere 
                            ? 'border-rose-600 bg-rose-50/60 ring-1 ring-rose-600'
                            : 'border-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-700'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="complaintCategory"
                        checked={isChecked}
                        onChange={() => setComplaint(opt.key)}
                        className="mt-0.5 accent-emerald-800"
                      />
                      <span className="text-xs font-medium text-slate-800">
                        {language === 'am' ? opt.labelAm : opt.labelEn}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Optional Notes */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                {strings.notesLabel[language]}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Service was finished in 15 minutes, very helpful clerk..."
                className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700"
              />
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
              >
                Close
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-medium text-xs rounded-lg transition-colors shadow-sm"
              >
                {strings.submit[language]}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
