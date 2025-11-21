import React, { useState, useEffect } from 'react';
import { getTaxAdvice } from '../services/geminiService';
import { PersonProfile, OptimizationResult, Language } from '../types';
import { translations } from '../utils/i18n';

interface Props {
  self: PersonProfile;
  spouse: PersonProfile;
  results: OptimizationResult | null;
  language: Language;
}

export const GeminiAdvisor: React.FC<Props> = ({ self, spouse, results, language }) => {
  const [advice, setAdvice] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [isStale, setIsStale] = useState(false);

  const t = translations[language].advisor;

  useEffect(() => {
      if (advice) {
          setIsStale(true);
      }
  }, [results]);

  const handleGenerate = () => {
    if (results) {
      setLoading(true);
      getTaxAdvice(self, spouse, results, language)
        .then(data => {
            setAdvice(data);
            setIsStale(false);
        })
        .catch(() => setAdvice(t.error))
        .finally(() => setLoading(false));
    }
  };

  if (!results) return null;

  return (
    <div className="bg-white rounded-3xl p-6 text-gray-800 shadow-xl shadow-orange-100 border border-orange-100 mt-8 animate-fadeIn relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-orange-50 opacity-60 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-amber-50 opacity-60 rounded-full blur-3xl"></div>

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 rounded-xl shadow-sm border border-orange-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                </div>
                <h2 className="text-lg font-bold tracking-wide text-gray-900">{t.title}</h2>
            </div>
        </div>

        {!advice || isStale ? (
            <div className="text-center py-4">
                {isStale && <p className="text-gray-500 text-sm mb-4 bg-gray-50 inline-block px-4 py-1 rounded-full border border-gray-100">Data updated. Regenerate for new advice.</p>}
                <button 
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-orange-300 to-orange-500 text-white font-bold rounded-full hover:shadow-lg hover:shadow-orange-100 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto shadow-md"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {t.loading}
                        </>
                    ) : (
                        <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                        {t.button}
                        </>
                    )}
                </button>
            </div>
        ) : (
            <div className="prose prose-invert prose-sm max-w-none animate-fadeIn bg-gray-50 p-5 rounded-2xl border border-gray-100">
                <p className="whitespace-pre-line leading-relaxed text-gray-700 font-medium">{advice}</p>
                <div className="mt-4 text-center pt-4 border-t border-gray-200">
                    <button onClick={handleGenerate} className="text-xs text-gray-400 hover:text-orange-500 underline decoration-gray-300 hover:decoration-orange-300 underline-offset-4 transition-colors">
                        Regenerate Analysis
                    </button>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};