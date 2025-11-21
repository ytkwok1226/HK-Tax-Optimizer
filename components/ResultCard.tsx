import React from 'react';
import { TaxResult, Language } from '../types';
import { translations } from '../utils/i18n';

interface ResultCardProps {
  result: TaxResult;
  language: Language;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, language }) => {
  const t = translations[language];
  const translatedLabel = t.results.labels[result.label as keyof typeof t.results.labels] || result.label;

  if (result.isBest) {
      return (
        <div className="relative p-6 rounded-3xl bg-gradient-to-br from-orange-300 to-orange-500 text-white shadow-xl shadow-orange-100 transform scale-[1.02] transition-transform duration-300 overflow-hidden group">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity"></div>
            <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-32 h-32 bg-yellow-200 opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity"></div>
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white/90 text-lg tracking-wide">
                    {translatedLabel}
                    </h3>
                    <span className="bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border border-white/10">
                    {t.report.bestOption}
                    </span>
                </div>
                
                <div className="text-4xl font-extrabold text-white mb-4 tracking-tight">
                    HK${result.totalTax.toLocaleString()}
                </div>
                
                <div className="space-y-1.5 bg-black/10 -mx-6 -mb-6 p-6 backdrop-blur-sm border-t border-white/10">
                    {result.breakdown.map((item, idx) => (
                    <div key={idx} className="text-xs text-white/90 flex items-center gap-2 font-medium">
                        <svg className="w-3 h-3 text-orange-100" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                        {item}
                    </div>
                    ))}
                </div>
            </div>
        </div>
      );
  }

  return (
    <div className="p-5 rounded-3xl border border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-orange-200 transition-all duration-200">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-gray-600 text-sm">
          {translatedLabel}
        </h3>
      </div>
      
      <div className="text-2xl font-bold text-gray-800 mb-3 tracking-tight">
        HK${result.totalTax.toLocaleString()}
      </div>
      
      <div className="space-y-1">
        {result.breakdown.map((item, idx) => (
          <div key={idx} className="text-xs text-gray-400 flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
};