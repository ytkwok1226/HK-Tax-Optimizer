import React, { useState } from 'react';
import { OptimizationResult, TaxResult, Language } from '../types';
import { translations } from '../utils/i18n';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  results: OptimizationResult;
  isMarried: boolean;
  language: Language;
}

export const DetailedReportModal: React.FC<Props> = ({ isOpen, onClose, results, isMarried, language }) => {
  const [activeTab, setActiveTab] = useState<keyof OptimizationResult>('separate');
  const t = translations[language];

  if (!isOpen) return null;

  const tabs: { key: keyof OptimizationResult; label: string }[] = [
    { key: 'separate', label: isMarried ? t.results.labels["Separate Filing"] : t.results.labels["Standard Filing"] },
    ...(isMarried ? [{ key: 'jointAssessment', label: t.results.labels["Joint Assessment (Salaries)"] } as const] : []),
    { key: 'personalAssessmentSeparate', label: isMarried ? t.results.labels["Personal Assessment (Separate)"] : t.results.labels["Personal Assessment"] },
    ...(isMarried ? [{ key: 'personalAssessmentJoint', label: t.results.labels["Personal Assessment (Joint)"] } as const] : []),
  ];

  const currentResult = results[activeTab] as TaxResult;

  // Helper to style lines based on content
  const renderLine = (line: string, index: number) => {
    if (line.startsWith('###')) {
      return <h4 key={index} className="text-sm font-bold text-gray-800 mt-5 mb-2 uppercase tracking-wide">{line.replace('###', '').trim()}</h4>;
    }
    if (line.startsWith('---')) {
        return <hr key={index} className="my-3 border-gray-100" />;
    }
    if (line.includes('Tax Payable') || line.includes('Total Tax')) {
        return (
            <div key={index} className="font-bold text-orange-700 bg-orange-50 p-3 rounded-xl my-2 flex justify-between border border-orange-100 shadow-sm">
                {line.split(':').map((s, i) => <span key={i}>{s}</span>)}
            </div>
        );
    }
    
    const isSubItem = line.startsWith('  ');
    const className = `py-1.5 flex justify-between text-sm ${isSubItem ? 'text-gray-500 pl-4 border-l-2 border-gray-100 ml-1' : 'text-gray-700'}`;
    
    const lastColonIndex = line.lastIndexOf(':');
    if (lastColonIndex > -1) {
        const label = line.substring(0, lastColonIndex).trim();
        const value = line.substring(lastColonIndex + 1).trim();
        return (
            <div key={index} className={className}>
                <span>{label}</span>
                <span className="font-mono font-semibold text-gray-900 bg-gray-50 px-1.5 rounded">{value}</span>
            </div>
        );
    }

    return <div key={index} className={className}>{line}</div>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-fadeIn ring-1 ring-white/20" 
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{t.report.title}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{t.report.subtitle}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Scrollable Tabs */}
        <div className="bg-gray-50/50 border-b border-gray-100">
            <div className="flex items-center gap-3 px-6 py-4 overflow-x-auto custom-scrollbar">
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all
                    ${activeTab === tab.key 
                      ? 'bg-gray-900 text-white shadow-lg shadow-gray-200 transform scale-105' 
                      : 'bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700'}
                  `}
                >
                  {tab.label}
                </button>
              ))}
            </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-white custom-scrollbar">
           {currentResult.totalTax === Infinity ? (
               <div className="text-center text-gray-400 py-12 flex flex-col items-center">
                   <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                     <span className="text-2xl grayscale opacity-50">🚫</span>
                   </div>
                   <p className="font-medium">{t.report.na}</p>
               </div>
           ) : (
               <div className="space-y-1">
                   <div className="text-center mb-8 pb-8 border-b border-dashed border-gray-200">
                       <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">{t.report.totalTax}</div>
                       <div className="text-5xl font-black text-gray-900 tracking-tighter">HK${currentResult.totalTax.toLocaleString()}</div>
                       {currentResult.isBest && (
                           <div className="mt-4 inline-flex items-center gap-1.5 px-4 py-1.5 bg-orange-100 text-orange-700 text-xs font-bold rounded-full uppercase tracking-wide shadow-sm">
                               <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                               {t.report.bestOption}
                           </div>
                       )}
                   </div>
                   <div className="space-y-2">
                    {currentResult.detailedReport && currentResult.detailedReport.length > 0 ? (
                        currentResult.detailedReport.map((line, i) => renderLine(line, i))
                    ) : (
                        <p className="text-gray-400 text-center py-4">{t.report.noLogs}</p>
                    )}
                   </div>
               </div>
           )}
        </div>
        
        {/* Footer */}
        <div className="p-5 border-t border-gray-100 bg-gray-50 text-right">
            <button 
                onClick={onClose}
                className="px-8 py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 rounded-xl transition-all text-sm font-bold shadow-sm"
            >
                {t.actions.close}
            </button>
        </div>
      </div>
    </div>
  );
};