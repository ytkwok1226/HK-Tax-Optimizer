import React, { useState, useEffect } from 'react';
import { Tab, PersonProfile, OptimizationResult, Language } from './types';
import { InputGroup, Toggle, CheckboxSection, InfoDisclosure, InfoSection, SelectGroup } from './components/InputGroup';
import { ResultCard } from './components/ResultCard';
import { GeminiAdvisor } from './components/GeminiAdvisor';
import { DetailedReportModal } from './components/DetailedReportModal';
import { calculateTaxLiability } from './utils/taxEngine';
import { translations } from './utils/i18n';

const initialProfile: PersonProfile = {
  income: {
    salary: 0,
    businessProfit: 0,
    rentalIncome: 0,
    rentalRatesPaid: 0,
    otherIncome: 0,
  },
  deductions: {
    mpfSelf: 0,
    mpfVoluntaryTVC: 0,
    residentialCare: 0,
    homeLoanInterest: 0,
    domesticRent: 0,
    approvedCharitableDonations: 0,
    selfEducation: 0,
    qualifyingPremiums: 0,
    assistedReproductiveServices: 0,
    outgoingsAndExpenses: 0,
  },
  allowances: {
    married: false, 
    childrenCount: 0,
    newbornCount: 0,
    dependentBrotherSister: 0,
    dependentParent60PlusLiving: 0,
    dependentParent60PlusNotLiving: 0,
    dependentParent55To59Living: 0,
    dependentParent55To59NotLiving: 0,
    disabledDependents: 0,
    personalDisability: false,
    singleParent: false,
  },
};

export default function App() {
  const [language, setLanguage] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<Tab>(Tab.SELF);
  const [self, setSelf] = useState<PersonProfile>(initialProfile);
  const [spouse, setSpouse] = useState<PersonProfile>(initialProfile);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [shareBtnText, setShareBtnText] = useState("");
  
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [enabledSections, setEnabledSections] = useState<Record<string, boolean>>({});

  const t = translations[language];
  const isMarried = self.allowances.married;

  useEffect(() => {
    setShareBtnText(t.header.share);
  }, [language, t.header.share]);

  const updateProfile = (
    isSelf: boolean,
    section: keyof PersonProfile,
    field: string,
    value: any
  ) => {
    const setter = isSelf ? setSelf : setSpouse;
    setter((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const resetFields = (isSelf: boolean, section: keyof PersonProfile, fields: string[]) => {
      fields.forEach(field => {
          updateProfile(isSelf, section, field, 0);
      });
  }

  const handleMarriageToggle = (checked: boolean) => {
    updateProfile(true, 'allowances', 'married', checked);
    if (!checked) {
      setActiveTab(Tab.SELF);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareBtnText(t.header.copied);
    setTimeout(() => setShareBtnText(t.header.share), 2000);
  };
  
  const handleCalculate = () => {
    const result = calculateTaxLiability(self, spouse);
    setOptimizationResult(result);
    
    if (window.innerWidth < 768) {
        setTimeout(() => {
            const resultPanel = document.getElementById('results-panel');
            if (resultPanel) {
                resultPanel.scrollIntoView({ behavior: 'smooth' });
            }
        }, 100);
    }
  };
  
  const isSectionActive = (isSelf: boolean, key: string, valueCheck: boolean) => {
    const id = `${isSelf ? 'self' : 'spouse'}_${key}`;
    return enabledSections[id] || valueCheck;
  };

  const toggleSection = (isSelf: boolean, key: string, isEnabled: boolean, onDisable?: () => void) => {
    const id = `${isSelf ? 'self' : 'spouse'}_${key}`;
    setEnabledSections(prev => ({ ...prev, [id]: isEnabled }));
    if (!isEnabled && onDisable) {
      onDisable();
    }
  };

  const renderForm = (isSelf: boolean) => {
    const data = isSelf ? self : spouse;
    const handleChange = (section: keyof PersonProfile, field: string, value: any) =>
      updateProfile(isSelf, section, field, value);

    const activeBusiness = isSectionActive(isSelf, 'business', data.income.businessProfit > 0);
    const activeRental = isSectionActive(isSelf, 'rental', data.income.rentalIncome > 0 || data.income.rentalRatesPaid > 0);
    const activeOtherIncome = isSectionActive(isSelf, 'otherIncome', data.income.otherIncome > 0);

    const activeOutgoings = isSectionActive(isSelf, 'outgoings', data.deductions.outgoingsAndExpenses > 0);
    const activeHLI = isSectionActive(isSelf, 'hli', data.deductions.homeLoanInterest > 0);
    const activeRent = isSectionActive(isSelf, 'rent', data.deductions.domesticRent > 0);
    const activeDonations = isSectionActive(isSelf, 'donations', data.deductions.approvedCharitableDonations > 0);
    const activeTVC = isSectionActive(isSelf, 'tvc', data.deductions.mpfVoluntaryTVC > 0);
    const activeEducation = isSectionActive(isSelf, 'education', data.deductions.selfEducation > 0);
    const activeVHIS = isSectionActive(isSelf, 'vhis', data.deductions.qualifyingPremiums > 0);
    const activeARS = isSectionActive(isSelf, 'ars', data.deductions.assistedReproductiveServices > 0);
    const activeElderlyCare = isSectionActive(isSelf, 'elderlyCare', data.deductions.residentialCare > 0);

    const activeChildren = isSectionActive(isSelf, 'children', data.allowances.childrenCount > 0 || data.allowances.newbornCount > 0);
    const activeBrotherSister = isSectionActive(isSelf, 'brotherSister', data.allowances.dependentBrotherSister > 0);
    const activeParents = isSectionActive(isSelf, 'parents', (
        data.allowances.dependentParent60PlusLiving > 0 || 
        data.allowances.dependentParent60PlusNotLiving > 0 ||
        data.allowances.dependentParent55To59Living > 0 ||
        data.allowances.dependentParent55To59NotLiving > 0
    ));
    const activeDisability = isSectionActive(isSelf, 'disability', data.allowances.disabledDependents > 0 || data.allowances.personalDisability || data.allowances.singleParent);

    const toggleNewborn = (checked: boolean) => {
        handleChange('allowances', 'newbornCount', checked ? 1 : 0);
        if(checked && data.allowances.childrenCount === 0) handleChange('allowances', 'childrenCount', 1);
    };

    return (
      <div className="space-y-8 animate-fadeIn pb-12" key={isSelf ? 'self-form' : 'spouse-form'}>
        {/* Income Section */}
        <section>
          <div className="flex items-center gap-3 mb-6">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center text-lg font-bold shadow-blue-200 shadow-lg">1</div>
             <h3 className="text-xl font-bold text-gray-800">{t.sections.income}</h3>
          </div>

          <InfoSection 
            label={t.income.salary.label}
            description={t.income.salary.desc}
          >
            <InputGroup label={t.income.salary.input} value={data.income.salary} onChange={(v) => handleChange('income', 'salary', v)} />
          </InfoSection>

          <CheckboxSection 
            label={t.income.business.label}
            checked={activeBusiness} 
            onToggle={(v) => toggleSection(isSelf, 'business', v, () => resetFields(isSelf, 'income', ['businessProfit']))}
            summary={t.income.business.summary}
            description={t.income.business.desc}
          >
            <InputGroup label={t.income.business.input} value={data.income.businessProfit} onChange={(v) => handleChange('income', 'businessProfit', v)} />
          </CheckboxSection>

          <CheckboxSection 
            label={t.income.rental.label}
            checked={activeRental} 
            onToggle={(v) => toggleSection(isSelf, 'rental', v, () => resetFields(isSelf, 'income', ['rentalIncome', 'rentalRatesPaid']))}
            summary={t.income.rental.summary}
            description={t.income.rental.desc}
          >
            <InputGroup label={t.income.rental.inputIncome} value={data.income.rentalIncome} onChange={(v) => handleChange('income', 'rentalIncome', v)} />
            <InputGroup label={t.income.rental.inputRates} value={data.income.rentalRatesPaid} onChange={(v) => handleChange('income', 'rentalRatesPaid', v)} />
          </CheckboxSection>

          <CheckboxSection 
            label={t.income.other.label} 
            checked={activeOtherIncome} 
            onToggle={(v) => toggleSection(isSelf, 'otherIncome', v, () => resetFields(isSelf, 'income', ['otherIncome']))}
            summary={t.income.other.summary}
            description={t.income.other.desc}
          >
            <InputGroup label={t.income.other.input} value={data.income.otherIncome} onChange={(v) => handleChange('income', 'otherIncome', v)} />
          </CheckboxSection>

          <div className="mt-4">
            <InfoDisclosure title={t.income.remark.title}>
              <ul className="list-disc pl-4 space-y-1 text-gray-600">
                  {t.income.remark.list.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            </InfoDisclosure>
          </div>
        </section>

        {/* Deductions Section */}
        <section>
          <div className="flex items-center gap-3 mb-6 mt-10 pt-10 border-t border-gray-100">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 text-white flex items-center justify-center text-lg font-bold shadow-emerald-200 shadow-lg">2</div>
             <h3 className="text-xl font-bold text-gray-800">{t.sections.deductions}</h3>
          </div>

           <CheckboxSection 
            label={t.deductions.outgoings.label}
            checked={activeOutgoings} 
            onToggle={(v) => toggleSection(isSelf, 'outgoings', v, () => resetFields(isSelf, 'deductions', ['outgoingsAndExpenses']))}
            description={t.deductions.outgoings.desc}
          >
            <InputGroup label={t.deductions.outgoings.input} value={data.deductions.outgoingsAndExpenses} onChange={(v) => handleChange('deductions', 'outgoingsAndExpenses', v)} />
          </CheckboxSection>
          
          <CheckboxSection 
            label={t.deductions.hli.label}
            checked={activeHLI} 
            onToggle={(v) => toggleSection(isSelf, 'hli', v, () => resetFields(isSelf, 'deductions', ['homeLoanInterest']))}
            description={t.deductions.hli.desc}
          >
            <InputGroup label={t.deductions.hli.input} value={data.deductions.homeLoanInterest} onChange={(v) => handleChange('deductions', 'homeLoanInterest', v)} hint={t.deductions.hli.hint} />
            <div className="mt-3 p-3 bg-orange-50 rounded-2xl border border-orange-100">
                <Toggle 
                    label={t.deductions.newbornToggle}
                    checked={data.allowances.newbornCount > 0} 
                    onChange={toggleNewborn} 
                />
                <p className="text-xs text-gray-500 leading-relaxed">{t.deductions.newbornDef}</p>
            </div>
          </CheckboxSection>

          <CheckboxSection 
            label={t.deductions.rent.label}
            checked={activeRent} 
            onToggle={(v) => toggleSection(isSelf, 'rent', v, () => resetFields(isSelf, 'deductions', ['domesticRent']))}
            description={t.deductions.rent.desc}
          >
            <InputGroup label={t.deductions.rent.input} value={data.deductions.domesticRent} onChange={(v) => handleChange('deductions', 'domesticRent', v)} hint={t.deductions.rent.hint} />
             <div className="mt-3 p-3 bg-orange-50 rounded-2xl border border-orange-100">
                <Toggle 
                    label={t.deductions.newbornToggle}
                    checked={data.allowances.newbornCount > 0} 
                    onChange={toggleNewborn} 
                />
                <p className="text-xs text-gray-500 leading-relaxed">{t.deductions.newbornDef}</p>
            </div>
          </CheckboxSection>

          <CheckboxSection 
            label={t.deductions.donations.label}
            checked={activeDonations} 
            onToggle={(v) => toggleSection(isSelf, 'donations', v, () => resetFields(isSelf, 'deductions', ['approvedCharitableDonations']))}
            description={t.deductions.donations.desc}
          >
            <InputGroup label={t.deductions.donations.input} value={data.deductions.approvedCharitableDonations} onChange={(v) => handleChange('deductions', 'approvedCharitableDonations', v)} hint={t.deductions.donations.hint} />
          </CheckboxSection>

          <CheckboxSection 
            label={t.deductions.tvc.label}
            checked={activeTVC} 
            onToggle={(v) => toggleSection(isSelf, 'tvc', v, () => resetFields(isSelf, 'deductions', ['mpfVoluntaryTVC']))}
            description={t.deductions.tvc.desc}
          >
            <InputGroup label={t.deductions.tvc.input} value={data.deductions.mpfVoluntaryTVC} onChange={(v) => handleChange('deductions', 'mpfVoluntaryTVC', v)} max={60000} hint={t.deductions.tvc.hint} />
          </CheckboxSection>

          <CheckboxSection 
            label={t.deductions.education.label}
            checked={activeEducation} 
            onToggle={(v) => toggleSection(isSelf, 'education', v, () => resetFields(isSelf, 'deductions', ['selfEducation']))}
            description={t.deductions.education.desc}
          >
            <InputGroup label={t.deductions.education.input} value={data.deductions.selfEducation} onChange={(v) => handleChange('deductions', 'selfEducation', v)} max={100000} hint={t.deductions.education.hint} />
          </CheckboxSection>

           <CheckboxSection 
            label={t.deductions.elderlyCare.label}
            checked={activeElderlyCare} 
            onToggle={(v) => toggleSection(isSelf, 'elderlyCare', v, () => resetFields(isSelf, 'deductions', ['residentialCare']))}
            description={t.deductions.elderlyCare.desc}
          >
            <InputGroup label={t.deductions.elderlyCare.input} value={data.deductions.residentialCare} onChange={(v) => handleChange('deductions', 'residentialCare', v)} max={100000} hint={t.deductions.elderlyCare.hint} />
          </CheckboxSection>

          <CheckboxSection 
            label={t.deductions.vhis.label}
            checked={activeVHIS} 
            onToggle={(v) => toggleSection(isSelf, 'vhis', v, () => resetFields(isSelf, 'deductions', ['qualifyingPremiums']))}
            description={t.deductions.vhis.desc}
          >
            <InputGroup label={t.deductions.vhis.input} value={data.deductions.qualifyingPremiums} onChange={(v) => handleChange('deductions', 'qualifyingPremiums', v)} hint={t.deductions.vhis.hint} />
          </CheckboxSection>

          <CheckboxSection 
            label={t.deductions.ars.label}
            checked={activeARS} 
            onToggle={(v) => toggleSection(isSelf, 'ars', v, () => resetFields(isSelf, 'deductions', ['assistedReproductiveServices']))}
            description={
                <div>
                    <p>{t.deductions.ars.desc}</p>
                    <a href="https://www.ird.gov.hk/eng/tax/ars.htm" target="_blank" rel="noreferrer" className="text-orange-600 underline mt-2 inline-block">
                        More details from IRD
                    </a>
                </div>
            }
          >
            <InputGroup label={t.deductions.ars.input} value={data.deductions.assistedReproductiveServices} onChange={(v) => handleChange('deductions', 'assistedReproductiveServices', v)} hint={t.deductions.ars.hint} />
          </CheckboxSection>
        </section>

        {/* Allowances Section */}
        <section>
          <div className="flex items-center gap-3 mb-6 mt-10 pt-10 border-t border-gray-100">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-600 text-white flex items-center justify-center text-lg font-bold shadow-orange-200 shadow-lg">3</div>
             <h3 className="text-xl font-bold text-gray-800">{t.sections.allowances}</h3>
          </div>

          <CheckboxSection 
            label={t.allowances.children.label}
            checked={activeChildren} 
            onToggle={(v) => toggleSection(isSelf, 'children', v, () => {
                handleChange('allowances', 'childrenCount', 0);
                handleChange('allowances', 'newbornCount', 0);
            })}
            description={
              <div>
                  <p className="font-bold mb-1">{t.allowances.children.descTitle}</p>
                  <p className="mb-2">{t.allowances.children.descIntro}</p>
                  <ul className="list-disc pl-4 space-y-1">
                    {t.allowances.children.descList.map((item, i) => <li key={i}>{item}</li>)}
                  </ul>
              </div>
            }
          >
            <SelectGroup label={t.allowances.children.inputTotal} value={data.allowances.childrenCount} onChange={(v) => handleChange('allowances', 'childrenCount', v)} max={9} />
            <SelectGroup label={t.allowances.children.inputNewborn} value={data.allowances.newbornCount} onChange={(v) => handleChange('allowances', 'newbornCount', v)} hint={t.allowances.children.hintNewborn} max={data.allowances.childrenCount} />
          </CheckboxSection>

          <CheckboxSection 
            label={t.allowances.brotherSister.label}
            checked={activeBrotherSister} 
            onToggle={(v) => toggleSection(isSelf, 'brotherSister', v, () => handleChange('allowances', 'dependentBrotherSister', 0))}
            description={t.allowances.brotherSister.desc}
          >
            <SelectGroup label={t.allowances.brotherSister.input} value={data.allowances.dependentBrotherSister} onChange={(v) => handleChange('allowances', 'dependentBrotherSister', v)} />
          </CheckboxSection>

          <CheckboxSection 
            label={t.allowances.parents.label}
            checked={activeParents} 
            onToggle={(v) => toggleSection(isSelf, 'parents', v, () => {
                resetFields(isSelf, 'allowances', ['dependentParent60PlusLiving', 'dependentParent60PlusNotLiving', 'dependentParent55To59Living', 'dependentParent55To59NotLiving']);
            })}
            description={t.allowances.parents.desc}
          >
             <SelectGroup label={t.allowances.parents.l60Living} value={data.allowances.dependentParent60PlusLiving} onChange={(v) => handleChange('allowances', 'dependentParent60PlusLiving', v)} max={4} />
             <SelectGroup label={t.allowances.parents.l60NotLiving} value={data.allowances.dependentParent60PlusNotLiving} onChange={(v) => handleChange('allowances', 'dependentParent60PlusNotLiving', v)} max={4} />
             <SelectGroup label={t.allowances.parents.l55Living} value={data.allowances.dependentParent55To59Living} onChange={(v) => handleChange('allowances', 'dependentParent55To59Living', v)} max={4} />
             <SelectGroup label={t.allowances.parents.l55NotLiving} value={data.allowances.dependentParent55To59NotLiving} onChange={(v) => handleChange('allowances', 'dependentParent55To59NotLiving', v)} max={4} />
          </CheckboxSection>

          <CheckboxSection 
            label={t.allowances.disability.label}
            checked={activeDisability} 
            onToggle={(v) => toggleSection(isSelf, 'disability', v, () => {
                handleChange('allowances', 'disabledDependents', 0);
                handleChange('allowances', 'personalDisability', false);
                handleChange('allowances', 'singleParent', false);
            })}
            description={
                <div className="space-y-3">
                    <p>{t.allowances.disability.descDependent}</p>
                    <p>{t.allowances.disability.descPersonal}</p>
                    <p>{t.allowances.disability.descSingle}</p>
                </div>
            }
          >
             <SelectGroup label={t.allowances.disability.inputDependent} value={data.allowances.disabledDependents} onChange={(v) => handleChange('allowances', 'disabledDependents', v)} />
             <Toggle label={t.allowances.disability.togglePersonal} checked={data.allowances.personalDisability} onChange={(v) => handleChange('allowances', 'personalDisability', v)} />
             <Toggle label={t.allowances.disability.toggleSingle} checked={data.allowances.singleParent} onChange={(v) => handleChange('allowances', 'singleParent', v)} />
          </CheckboxSection>
        </section>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-300 to-orange-500 pb-20 pt-8 px-6 shadow-lg">
        <div className="max-w-4xl mx-auto flex justify-between items-start">
          <div className="text-white">
            <h1 className="text-3xl font-black tracking-tight mb-1">{t.header.title}</h1>
            <p className="text-orange-50 font-medium text-sm max-w-md opacity-95">{t.header.subtitle}</p>
          </div>
          <div className="flex gap-3">
             <button 
                onClick={() => setLanguage(l => l === 'en' ? 'zh' : 'en')} 
                className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-xs font-bold border border-white/30 hover:bg-white/30 transition-all"
             >
                {t.header.language}
             </button>
             <button 
                onClick={handleShare}
                className="px-4 py-2 bg-white text-orange-600 rounded-full text-xs font-bold hover:bg-orange-50 transition-all shadow-sm flex items-center gap-2"
             >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"></path></svg>
                {shareBtnText}
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 -mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form */}
          <div className="lg:col-span-7 space-y-6">
             <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
                <div className="p-6 border-b border-gray-100 bg-white sticky top-0 z-20">
                    <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 mb-6">
                        <Toggle 
                            label={t.married.label} 
                            checked={isMarried} 
                            onChange={handleMarriageToggle} 
                        />
                        <p className="text-xs text-gray-500 mt-1 ml-0.5">{t.married.hint}</p>
                    </div>

                    {isMarried && (
                        <div className="flex p-1.5 bg-gray-100 rounded-2xl">
                            <button
                                onClick={() => setActiveTab(Tab.SELF)}
                                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all shadow-sm ${activeTab === Tab.SELF ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 bg-transparent shadow-none'}`}
                            >
                                {t.tabs.self}
                            </button>
                            <button
                                onClick={() => setActiveTab(Tab.SPOUSE)}
                                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all shadow-sm ${activeTab === Tab.SPOUSE ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 bg-transparent shadow-none'}`}
                            >
                                {t.tabs.spouse}
                            </button>
                        </div>
                    )}
                </div>
                
                <div className="p-6 bg-white">
                    {activeTab === Tab.SELF ? renderForm(true) : renderForm(false)}
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 sticky bottom-0 z-20 backdrop-blur-xl bg-gray-50/90">
                    <button 
                        onClick={handleCalculate}
                        className="w-full py-4 bg-gradient-to-r from-orange-300 to-orange-500 text-white text-lg font-bold rounded-2xl hover:shadow-xl hover:shadow-orange-100 hover:-translate-y-0.5 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                        {t.actions.calculate}
                    </button>
                </div>
             </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-5" id="results-panel">
             <div className="sticky top-8 space-y-6">
                {!optimizationResult ? (
                    <div className="bg-white rounded-[2rem] p-8 text-center border border-gray-100 shadow-xl shadow-gray-200/50 h-full flex flex-col justify-center min-h-[400px]">
                        <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{t.results.readyTitle}</h3>
                        <p className="text-gray-500 leading-relaxed">{t.results.readyDesc}</p>
                    </div>
                ) : (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-xl shadow-gray-200/50">
                            <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                                <span className="w-2 h-8 bg-orange-400 rounded-full"></span>
                                {t.results.title}
                            </h2>
                            
                            <div className="mb-8">
                                <ResultCard result={optimizationResult.bestOption} language={language} />
                                {optimizationResult.savings > 0 && (
                                    <div className="mt-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                                        <p className="text-sm text-emerald-600 font-bold mb-1">{t.results.save}</p>
                                        <p className="text-3xl font-black text-emerald-600">HK${optimizationResult.savings.toLocaleString()}</p>
                                        <p className="text-xs text-emerald-500 mt-1">{t.results.compared}</p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">{t.results.otherOptions}</p>
                                <ResultCard result={optimizationResult.separate} language={language} />
                                {isMarried && <ResultCard result={optimizationResult.jointAssessment} language={language} />}
                                <ResultCard result={optimizationResult.personalAssessmentSeparate} language={language} />
                                {isMarried && <ResultCard result={optimizationResult.personalAssessmentJoint} language={language} />}
                            </div>

                            <button 
                                onClick={() => setIsReportOpen(true)}
                                className="w-full mt-6 py-3 bg-gray-50 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
                            >
                                {t.actions.viewReport}
                            </button>
                        </div>

                        <GeminiAdvisor 
                            self={self} 
                            spouse={spouse} 
                            results={optimizationResult} 
                            language={language} 
                        />
                        
                        <p className="text-center text-xs text-gray-400 px-4 pb-10">
                            {t.results.disclaimer}
                        </p>
                    </div>
                )}
             </div>
          </div>
        </div>
      </main>

      <DetailedReportModal 
        isOpen={isReportOpen} 
        onClose={() => setIsReportOpen(false)} 
        results={optimizationResult!} 
        isMarried={isMarried}
        language={language}
      />
    </div>
  );
}