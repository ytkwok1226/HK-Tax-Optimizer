
export type Language = 'en' | 'zh';

export interface IncomeSource {
  salary: number;
  businessProfit: number;
  rentalIncome: number;
  rentalRatesPaid: number; // Rates paid by owner
  otherIncome: number;
}

export interface Deductions {
  mpfSelf: number; // Mandatory contributions (usually calculated, but allowed override)
  mpfVoluntaryTVC: number;
  residentialCare: number;
  homeLoanInterest: number;
  domesticRent: number;
  approvedCharitableDonations: number;
  selfEducation: number;
  qualifyingPremiums: number; // VHIS
  assistedReproductiveServices: number; // New 2024/25
  outgoingsAndExpenses: number; // Expenses incurred in production of income
}

export interface Allowances {
  married: boolean;
  childrenCount: number;
  newbornCount: number; // For specific deduction boosts
  dependentBrotherSister: number; // Added
  dependentParent60PlusLiving: number;
  dependentParent60PlusNotLiving: number;
  dependentParent55To59Living: number;
  dependentParent55To59NotLiving: number;
  disabledDependents: number;
  personalDisability: boolean;
  singleParent: boolean;
}

export interface PersonProfile {
  income: IncomeSource;
  deductions: Deductions;
  allowances: Allowances;
}

export interface TaxResult {
  label: string;
  totalTax: number;
  breakdown: string[];
  detailedReport: string[]; // Detailed line-by-line calculation log
  isBest: boolean;
}

export interface OptimizationResult {
  separate: TaxResult;
  jointAssessment: TaxResult; // Salaries Tax Joint
  personalAssessmentSeparate: TaxResult;
  personalAssessmentJoint: TaxResult;
  bestOption: TaxResult;
  savings: number;
}

export enum Tab {
  SELF = 'SELF',
  SPOUSE = 'SPOUSE',
  RESULTS = 'RESULTS'
}