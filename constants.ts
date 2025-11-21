
export const TAX_YEAR = "2024/25";

export const ALLOWANCES = {
  BASIC: 132000,
  MARRIED: 264000,
  CHILD: 130000,
  CHILD_YEAR_OF_BIRTH_EXTRA: 130000,
  PARENT_60_LIVING: 100000, // First 50k + Second 50k (Total 100k)
  PARENT_60_NOT_LIVING: 50000,
  PARENT_55_LIVING: 50000, // First 25k + Second 25k (Total 50k)
  PARENT_55_NOT_LIVING: 25000,
  BROTHER_SISTER: 37500,
  DISABLED_DEPENDENT: 75000,
  PERSONAL_DISABILITY: 75000,
  SINGLE_PARENT: 132000,
};

export const DEDUCTION_CAPS = {
  MPF_MANDATORY: 18000,
  HOME_LOAN_INTEREST: 100000,
  HOME_LOAN_INTEREST_NEWBORN: 120000, // Increased cap for newborn
  DOMESTIC_RENT: 100000, // Standard
  DOMESTIC_RENT_NEWBORN: 120000, // Increased cap for newborn
  MPF_TVC: 60000,
  SELF_EDUCATION: 100000,
  VHIS: 8000,
  ASSISTED_REPRODUCTIVE_SERVICES: 100000, // New for 2024/25
  CHARITABLE_PERCENTAGE: 0.35,
};

export const TAX_RATES = {
  PROGRESSIVE: [
    { limit: 50000, rate: 0.02 },
    { limit: 50000, rate: 0.06 },
    { limit: 50000, rate: 0.10 },
    { limit: 50000, rate: 0.14 },
    { limit: Infinity, rate: 0.17 },
  ],
  // 2024/25 Two-tiered Standard Rate Regime
  STANDARD_TIERS: [
    { limit: 5000000, rate: 0.15 },
    { limit: Infinity, rate: 0.16 }
  ],
  PROPERTY_TAX: 0.15,
  PROFITS_TAX_CORP: 0.165, 
  PROFITS_TAX_UNINCORPORATED: 0.15, 
};

// 2-Tier Rates for Unincorporated Business (Sole Proprietorship)
export const PROFITS_TAX_TIERS = [
    { limit: 2000000, rate: 0.075 },
    { limit: Infinity, rate: 0.15 }
];