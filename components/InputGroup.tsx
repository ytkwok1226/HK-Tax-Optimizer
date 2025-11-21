import React, { useState } from 'react';

interface InputGroupProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  max?: number;
  prefix?: string;
  hint?: string;
}

export const InputGroup: React.FC<InputGroupProps> = ({ label, value, onChange, prefix = "HK$", hint }) => {
  return (
    <div className="flex flex-col gap-1.5 mb-5 last:mb-0">
      <label className="text-sm font-semibold text-gray-700 ml-1">{label}</label>
      <div className="relative group">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none group-focus-within:text-orange-500 transition-colors">
          {prefix}
        </span>
        <input
          type="number"
          min="0"
          className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-900 font-medium placeholder-gray-300 shadow-sm"
          value={value || ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          placeholder="0"
          onWheel={(e) => e.currentTarget.blur()}
        />
      </div>
      {hint && <p className="text-xs text-gray-500 ml-1">{hint}</p>}
    </div>
  );
};

interface SelectGroupProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  max?: number;
  hint?: string;
}

export const SelectGroup: React.FC<SelectGroupProps> = ({ label, value, onChange, max = 10, hint }) => {
  const limit = Math.max(0, max);
  const options = Array.from({ length: limit + 1 }, (_, i) => i);

  return (
    <div className="flex flex-col gap-1.5 mb-5 last:mb-0">
      <label className="text-sm font-semibold text-gray-700 ml-1">{label}</label>
      <div className="relative">
        <select
          className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-900 font-medium appearance-none shadow-sm cursor-pointer"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </div>
      </div>
      {hint && <p className="text-xs text-gray-500 ml-1">{hint}</p>}
    </div>
  );
};

interface ToggleProps {
    label: string;
    checked: boolean;
    onChange: (val: boolean) => void;
}

export const Toggle: React.FC<ToggleProps> = ({ label, checked, onChange }) => (
    <div className="flex items-center justify-between mb-4 py-1 cursor-pointer" onClick={() => onChange(!checked)}>
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <button
            type="button"
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none ${checked ? 'bg-orange-500 shadow-inner' : 'bg-gray-200'}`}
        >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    </div>
  );

interface CheckboxSectionProps {
  label: string;
  checked: boolean;
  onToggle: (newState: boolean) => void;
  children: React.ReactNode;
  summary?: string;
  description?: React.ReactNode;
}

export const CheckboxSection: React.FC<CheckboxSectionProps> = ({
  label,
  checked,
  onToggle,
  children,
  summary,
  description
}) => {
  const [showInfo, setShowInfo] = useState(false);

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(!checked);
  };

  const handleLabelClick = () => {
    setShowInfo(!showInfo);
  };

  return (
    <div className={`mb-5 rounded-3xl border transition-all duration-300 overflow-hidden ${checked ? 'border-orange-500 bg-white shadow-orange-100 shadow-lg ring-1 ring-orange-500/20' : 'border-gray-100 bg-white shadow-sm hover:shadow-md hover:border-orange-200'}`}>
      <div className="flex items-start p-5 select-none">
        {/* Checkbox Area */}
        <div 
          onClick={handleCheckboxClick}
          className="flex-shrink-0 pt-0.5 pr-3 cursor-pointer"
        >
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${checked ? 'bg-orange-500 border-orange-500' : 'bg-gray-50 border-gray-300 hover:border-orange-400'}`}>
                {checked && (
                    <svg className="w-3.5 h-3.5 text-white stroke-[3]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"></path></svg>
                )}
            </div>
        </div>

        {/* Label Area */}
        <div className="flex-grow cursor-pointer" onClick={handleLabelClick}>
            <div className="flex items-center gap-2">
                <div className={`font-bold text-[15px] transition-colors ${checked ? 'text-gray-900' : 'text-gray-600'}`}>
                    {label}
                </div>
                {description && (
                    <span className={`text-gray-400 hover:text-orange-500 transition-colors p-1 rounded-full hover:bg-orange-50 ${showInfo ? 'text-orange-500 bg-orange-50' : ''}`}>
                        <svg className={`w-4 h-4 transform transition-transform duration-300 ${showInfo ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </span>
                )}
            </div>
             {summary && !checked && <div className="text-xs text-gray-400 mt-1 font-medium">{summary}</div>}
        </div>
      </div>
      
      {/* Info/Description Area */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showInfo ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-5 pb-5 pt-0">
           <div className="text-xs text-gray-600 bg-orange-50 p-4 rounded-2xl border border-orange-100 leading-relaxed">
              {description}
           </div>
        </div>
      </div>

      {/* Inputs Area */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${checked ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-5 pb-5 pt-0">
          <div className="pl-0 space-y-4 pt-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

interface InfoSectionProps {
    label: string;
    children: React.ReactNode;
    description?: React.ReactNode;
}

export const InfoSection: React.FC<InfoSectionProps> = ({ label, children, description }) => {
    const [showInfo, setShowInfo] = useState(false);

    return (
        <div className="mb-5 rounded-3xl border border-gray-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
            <div 
                onClick={() => setShowInfo(!showInfo)}
                className="flex items-center justify-between p-5 cursor-pointer select-none hover:bg-gray-50/50"
            >
                <div className="font-bold text-[15px] text-gray-800 flex items-center gap-2">
                    {label}
                    {description && (
                        <div className={`p-1 rounded-full transition-colors ${showInfo ? 'bg-orange-50 text-orange-500' : 'text-gray-400'}`}>
                            <svg className={`w-4 h-4 transform transition-transform duration-300 ${showInfo ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    )}
                </div>
            </div>

            {description && (
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showInfo ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="px-5 pb-5 pt-0">
                         <div className="text-xs text-gray-600 bg-orange-50 p-4 rounded-2xl border border-orange-100 leading-relaxed">
                            {description}
                         </div>
                    </div>
                </div>
            )}

            <div className="p-5 pt-0">
                {children}
            </div>
        </div>
    );
};


interface InfoDisclosureProps {
    title: string;
    children: React.ReactNode;
}

export const InfoDisclosure: React.FC<InfoDisclosureProps> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="mb-8 bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-5 py-4 flex items-center justify-between text-left text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    </div>
                    {title}
                </div>
                <svg className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </button>
            {isOpen && (
                <div className="px-5 pb-5 text-xs text-gray-600 leading-relaxed animate-fadeIn pt-0 pl-14">
                    {children}
                </div>
            )}
        </div>
    );
};