
import { PersonProfile, OptimizationResult, TaxResult } from '../types';
import { ALLOWANCES, DEDUCTION_CAPS, TAX_RATES, PROFITS_TAX_TIERS } from '../constants';

// --- Helpers ---

const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
const formatCurrency = (num: number) => `HK$${Math.round(num).toLocaleString()}`;

interface CalculationResult {
    tax: number;
    report: string[];
}

const calculateProgressiveTax = (netChargeableIncome: number): CalculationResult => {
  const report: string[] = [];
  if (netChargeableIncome <= 0) {
      report.push("Net Chargeable Income is 0 or less. Tax: HK$0");
      return { tax: 0, report };
  }
  
  let tax = 0;
  let remaining = netChargeableIncome;

  report.push(`Calculate Progressive Tax on: ${formatCurrency(netChargeableIncome)}`);

  for (const band of TAX_RATES.PROGRESSIVE) {
    if (remaining <= 0) break;
    const taxableAmount = Math.min(remaining, band.limit);
    const bandTax = taxableAmount * band.rate;
    tax += bandTax;
    
    if (band.limit === Infinity) {
        report.push(`  Remainder @ ${Math.round(band.rate * 100)}%: ${formatCurrency(bandTax)}`);
    } else {
        report.push(`  First ${formatCurrency(band.limit)} @ ${Math.round(band.rate * 100)}%: ${formatCurrency(bandTax)}`);
    }
    
    remaining -= taxableAmount;
  }
  report.push(`Total Progressive Tax: ${formatCurrency(tax)}`);
  return { tax, report };
};

const calculateStandardTax = (netIncome: number): CalculationResult => {
  // 2024/25 Two-tiered standard rate
  let tax = 0;
  const report: string[] = [`Standard Rate Calculation (2-Tier):`];
  let remaining = netIncome;

  const tier1 = TAX_RATES.STANDARD_TIERS[0];
  const tier2 = TAX_RATES.STANDARD_TIERS[1];

  // Tier 1: First 5M @ 15%
  const tier1Amount = Math.min(remaining, tier1.limit);
  const tier1Tax = tier1Amount * tier1.rate;
  tax += tier1Tax;
  if (tier1Amount > 0) {
      report.push(`  First ${formatCurrency(tier1Amount)} @ 15%: ${formatCurrency(tier1Tax)}`);
  }

  remaining -= tier1Amount;

  // Tier 2: Remainder @ 16%
  if (remaining > 0) {
      const tier2Tax = remaining * tier2.rate;
      tax += tier2Tax;
      report.push(`  Remainder ${formatCurrency(remaining)} @ 16%: ${formatCurrency(tier2Tax)}`);
  }

  return { tax, report };
};

// Calculates Salaries Tax independently
const calculateSalariesTax = (profile: PersonProfile, labelPrefix: string, isMarried: boolean, spouseHasIncome: boolean): CalculationResult => {
  const report: string[] = [];
  report.push(`### ${labelPrefix} Salaries Tax`);

  // 1. Income
  const income = profile.income.salary + profile.income.otherIncome;
  report.push(`Total Salary & Other Income: ${formatCurrency(income)}`);
  
  if (income === 0) {
      report.push("No salaries income.");
      return { tax: 0, report };
  }

  // 2. Deductions
  // Outgoings & Expenses (Deducted first to determine Assessable Income for Donation Cap)
  const outgoings = profile.deductions.outgoingsAndExpenses;
  if (outgoings > 0) {
      report.push(`  Less: Outgoings & Expenses: -${formatCurrency(outgoings)}`);
  }

  // MPF
  let mpf = profile.deductions.mpfSelf;
  if (mpf === 0 && profile.income.salary > 0) {
    mpf = Math.min(profile.income.salary * 0.05, DEDUCTION_CAPS.MPF_MANDATORY);
  }
  report.push(`  Less: Mandatory MPF: -${formatCurrency(mpf)}`);
  
  // Donation Cap is 35% of (Income - Outgoings)
  const incomeForDonationCap = Math.max(0, income + profile.income.businessProfit - outgoings);
  const donationsCap = incomeForDonationCap * DEDUCTION_CAPS.CHARITABLE_PERCENTAGE;
  const donations = Math.min(profile.deductions.approvedCharitableDonations, donationsCap);
  if (donations > 0) report.push(`  Less: Donations: -${formatCurrency(donations)}`);
  
  const tvc = Math.min(profile.deductions.mpfVoluntaryTVC, DEDUCTION_CAPS.MPF_TVC);
  if (tvc > 0) report.push(`  Less: MPF TVC: -${formatCurrency(tvc)}`);

  const education = Math.min(profile.deductions.selfEducation, DEDUCTION_CAPS.SELF_EDUCATION);
  if (education > 0) report.push(`  Less: Self Education: -${formatCurrency(education)}`);
  
  const hasNewborn = profile.allowances.newbornCount > 0;
  const hliCap = hasNewborn ? DEDUCTION_CAPS.HOME_LOAN_INTEREST_NEWBORN : DEDUCTION_CAPS.HOME_LOAN_INTEREST;
  const rentCap = hasNewborn ? DEDUCTION_CAPS.DOMESTIC_RENT_NEWBORN : DEDUCTION_CAPS.DOMESTIC_RENT;

  const homeLoanInterest = Math.min(profile.deductions.homeLoanInterest, hliCap);
  if (homeLoanInterest > 0) report.push(`  Less: Home Loan Interest: -${formatCurrency(homeLoanInterest)}`);

  const domesticRent = Math.min(profile.deductions.domesticRent, rentCap);
  if (domesticRent > 0) report.push(`  Less: Domestic Rent: -${formatCurrency(domesticRent)}`);
  
  const residentialCare = Math.min(profile.deductions.residentialCare, 100000); // Cap 100k
  if (residentialCare > 0) report.push(`  Less: Elderly Residential Care: -${formatCurrency(residentialCare)}`);

  if (profile.deductions.qualifyingPremiums > 0) report.push(`  Less: VHIS Premiums: -${formatCurrency(profile.deductions.qualifyingPremiums)}`);

  // New: Assisted Reproductive Services
  const ars = Math.min(profile.deductions.assistedReproductiveServices, DEDUCTION_CAPS.ASSISTED_REPRODUCTIVE_SERVICES);
  if (ars > 0) report.push(`  Less: Assisted Reproductive Services: -${formatCurrency(ars)}`);
  
  const totalDeductions = mpf + tvc + education + donations + homeLoanInterest + domesticRent + residentialCare + profile.deductions.qualifyingPremiums + ars + outgoings;
  
  const netAssessableIncome = Math.max(0, income - totalDeductions);
  report.push(`Net Assessable Income: ${formatCurrency(netAssessableIncome)}`);

  // 3. Allowances
  report.push("Less: Allowances");
  let totalAllowances = 0;
  
  if (isMarried && !spouseHasIncome) {
      totalAllowances += ALLOWANCES.MARRIED; 
      report.push(`  Married Person's Allowance: -${formatCurrency(ALLOWANCES.MARRIED)}`);
  } else {
      totalAllowances += ALLOWANCES.BASIC;
      report.push(`  Basic Allowance: -${formatCurrency(ALLOWANCES.BASIC)}`);
  }
  
  if (profile.allowances.childrenCount > 0) {
      const amt = profile.allowances.childrenCount * ALLOWANCES.CHILD;
      totalAllowances += amt;
      report.push(`  Child Allowance (${profile.allowances.childrenCount}): -${formatCurrency(amt)}`);
  }
  if (profile.allowances.newbornCount > 0) {
      const amt = profile.allowances.newbornCount * ALLOWANCES.CHILD_YEAR_OF_BIRTH_EXTRA;
      totalAllowances += amt;
      report.push(`  Newborn Additional Allowance (${profile.allowances.newbornCount}): -${formatCurrency(amt)}`);
  }
  
  if (profile.allowances.dependentBrotherSister > 0) {
      const amt = profile.allowances.dependentBrotherSister * ALLOWANCES.BROTHER_SISTER;
      totalAllowances += amt;
      report.push(`  Dependent Brother/Sister Allowance: -${formatCurrency(amt)}`);
  }

  const parentAllowance = 
      (profile.allowances.dependentParent60PlusLiving * ALLOWANCES.PARENT_60_LIVING) +
      (profile.allowances.dependentParent60PlusNotLiving * ALLOWANCES.PARENT_60_NOT_LIVING) +
      (profile.allowances.dependentParent55To59Living * ALLOWANCES.PARENT_55_LIVING) +
      (profile.allowances.dependentParent55To59NotLiving * ALLOWANCES.PARENT_55_NOT_LIVING);
      
  if (parentAllowance > 0) {
      totalAllowances += parentAllowance;
      report.push(`  Dependent Parent Allowance: -${formatCurrency(parentAllowance)}`);
  }

  if (profile.allowances.disabledDependents > 0) {
      const amt = profile.allowances.disabledDependents * ALLOWANCES.DISABLED_DEPENDENT;
      totalAllowances += amt;
      report.push(`  Disabled Dependent Allowance: -${formatCurrency(amt)}`);
  }

  if (profile.allowances.personalDisability) {
      totalAllowances += ALLOWANCES.PERSONAL_DISABILITY;
      report.push(`  Personal Disability Allowance: -${formatCurrency(ALLOWANCES.PERSONAL_DISABILITY)}`);
  }
  if (profile.allowances.singleParent) {
      totalAllowances += ALLOWANCES.SINGLE_PARENT;
      report.push(`  Single Parent Allowance: -${formatCurrency(ALLOWANCES.SINGLE_PARENT)}`);
  }

  report.push(`Total Allowances: -${formatCurrency(totalAllowances)}`);

  const netChargeableIncome = Math.max(0, netAssessableIncome - totalAllowances);
  report.push(`Net Chargeable Income: ${formatCurrency(netChargeableIncome)}`);
  
  // 4. Tax Calculation (Lower of Progressive vs Standard)
  const progressive = calculateProgressiveTax(netChargeableIncome);
  const standard = calculateStandardTax(Math.max(0, income - mpf - outgoings)); 
  
  let finalTax = progressive.tax;
  if (standard.tax < progressive.tax) {
      finalTax = standard.tax;
      report.push(`Using Standard Rate (Lower): ${formatCurrency(standard.tax)}`);
      report.push(...standard.report);
  } else {
      report.push(`Using Progressive Rate (Lower): ${formatCurrency(progressive.tax)}`);
      report.push(...progressive.report);
  }
  
  report.push(`${labelPrefix} Tax Payable: ${formatCurrency(finalTax)}`);
  return { tax: finalTax, report };
};

// Calculates Property Tax independently
const calculatePropertyTax = (rentalIncome: number, ratesPaid: number, labelPrefix: string): CalculationResult => {
  if (rentalIncome <= 0) return { tax: 0, report: [] };
  
  const report: string[] = [`### ${labelPrefix} Property Tax`];
  report.push(`Gross Rental Income: ${formatCurrency(rentalIncome)}`);
  report.push(`Less: Rates Paid: -${formatCurrency(ratesPaid)}`);
  
  const assessableValue = Math.max(0, rentalIncome - ratesPaid);
  const statutoryAllowance = assessableValue * 0.20;
  report.push(`Assessable Value: ${formatCurrency(assessableValue)}`);
  report.push(`Less: 20% Statutory Allowance: -${formatCurrency(statutoryAllowance)}`);
  
  const netAssessableValue = assessableValue - statutoryAllowance;
  report.push(`Net Assessable Value: ${formatCurrency(netAssessableValue)}`);
  
  const tax = netAssessableValue * TAX_RATES.PROPERTY_TAX;
  report.push(`Tax @ 15%: ${formatCurrency(tax)}`);
  
  return { tax, report };
};

// Calculates Profits Tax (Unincorporated) independently
const calculateProfitsTax = (profit: number, labelPrefix: string): CalculationResult => {
  if (profit <= 0) return { tax: 0, report: [] };
  
  const report: string[] = [`### ${labelPrefix} Profits Tax`];
  report.push(`Assessable Profit: ${formatCurrency(profit)}`);
  
  let tax = 0;
  let remaining = profit;
  
  // Tier 1
  const tier1Amount = Math.min(remaining, PROFITS_TAX_TIERS[0].limit);
  tax += tier1Amount * PROFITS_TAX_TIERS[0].rate;
  if (tier1Amount > 0) report.push(`  First ${formatCurrency(tier1Amount)} @ 7.5%: ${formatCurrency(tier1Amount * PROFITS_TAX_TIERS[0].rate)}`);
  
  remaining -= tier1Amount;
  
  // Tier 2
  if (remaining > 0) {
    const tier2Tax = remaining * PROFITS_TAX_TIERS[1].rate;
    tax += tier2Tax;
    report.push(`  Remainder ${formatCurrency(remaining)} @ 15%: ${formatCurrency(tier2Tax)}`);
  }
  
  report.push(`Total Profits Tax: ${formatCurrency(tax)}`);
  return { tax, report };
};


// --- Aggregation Logic ---

const calculatePersonalAssessment = (
    self: PersonProfile, 
    spouse: PersonProfile, 
    mode: 'SINGLE' | 'JOINT'
): CalculationResult => {
    const report: string[] = [];
    const label = mode === 'JOINT' ? 'Joint' : 'Separate';
    report.push(`### Personal Assessment (${label})`);
    
    // 1. Aggregate Income
    let totalSalary = self.income.salary + self.income.otherIncome;
    let totalProfit = self.income.businessProfit;
    let totalRental = self.income.rentalIncome;
    let totalRates = self.income.rentalRatesPaid;
    
    if (mode === 'JOINT') {
        totalSalary += spouse.income.salary + spouse.income.otherIncome;
        totalProfit += spouse.income.businessProfit;
        totalRental += spouse.income.rentalIncome;
        totalRates += spouse.income.rentalRatesPaid;
    }
    
    report.push(`Total Salary Income: ${formatCurrency(totalSalary)}`);
    report.push(`Total Business Profit: ${formatCurrency(totalProfit)}`);

    // 2. Deductible Rental
    const nav = Math.max(0, totalRental - totalRates) * 0.8; 
    if (totalRental > 0) {
        report.push(`Property Income (NAV): ${formatCurrency(nav)}`);
        report.push(`  (Gross ${formatCurrency(totalRental)} - Rates ${formatCurrency(totalRates)}) x 80%`);
    }
    
    // 3. Deduct Outgoings & Expenses first
    let totalOutgoings = self.deductions.outgoingsAndExpenses;
    if (mode === 'JOINT') totalOutgoings += spouse.deductions.outgoingsAndExpenses;
    
    if (totalOutgoings > 0) {
        report.push(`Less: Outgoings & Expenses: -${formatCurrency(totalOutgoings)}`);
    }

    const totalAssessableIncome = totalSalary + totalProfit + nav - totalOutgoings;
    report.push(`Total Assessable Income (after outgoings): ${formatCurrency(totalAssessableIncome)}`);

    // 4. Deductions
    let mpfSelf = self.deductions.mpfSelf || Math.min(self.income.salary * 0.05, DEDUCTION_CAPS.MPF_MANDATORY);
    let mpfSpouse = 0;
    if (mode === 'JOINT') {
        mpfSpouse = spouse.deductions.mpfSelf || Math.min(spouse.income.salary * 0.05, DEDUCTION_CAPS.MPF_MANDATORY);
    }
    const totalMpf = mpfSelf + mpfSpouse;
    if (totalMpf > 0) report.push(`Less: MPF (Mandatory): -${formatCurrency(totalMpf)}`);

    const hasNewborn = (self.allowances.newbornCount > 0) || (mode === 'JOINT' && spouse.allowances.newbornCount > 0);
    const hliCap = hasNewborn ? DEDUCTION_CAPS.HOME_LOAN_INTEREST_NEWBORN : DEDUCTION_CAPS.HOME_LOAN_INTEREST;
    
    let hli = Math.min(self.deductions.homeLoanInterest, hliCap);
    if (mode === 'JOINT') hli += Math.min(spouse.deductions.homeLoanInterest, hliCap);
    if (hli > 0) report.push(`Less: Home Loan Interest: -${formatCurrency(hli)}`);
    
    let otherDeductions = 
        Math.min(self.deductions.mpfVoluntaryTVC, DEDUCTION_CAPS.MPF_TVC) +
        Math.min(self.deductions.selfEducation, DEDUCTION_CAPS.SELF_EDUCATION) +
        Math.min(self.deductions.domesticRent, hasNewborn ? DEDUCTION_CAPS.DOMESTIC_RENT_NEWBORN : DEDUCTION_CAPS.DOMESTIC_RENT) +
        Math.min(self.deductions.residentialCare, 100000) +
        self.deductions.qualifyingPremiums + 
        Math.min(self.deductions.assistedReproductiveServices, DEDUCTION_CAPS.ASSISTED_REPRODUCTIVE_SERVICES);

    if (mode === 'JOINT') {
        otherDeductions += 
            Math.min(spouse.deductions.mpfVoluntaryTVC, DEDUCTION_CAPS.MPF_TVC) +
            Math.min(spouse.deductions.selfEducation, DEDUCTION_CAPS.SELF_EDUCATION) +
            Math.min(spouse.deductions.domesticRent, hasNewborn ? DEDUCTION_CAPS.DOMESTIC_RENT_NEWBORN : DEDUCTION_CAPS.DOMESTIC_RENT) +
            Math.min(spouse.deductions.residentialCare, 100000) +
            spouse.deductions.qualifyingPremiums +
            Math.min(spouse.deductions.assistedReproductiveServices, DEDUCTION_CAPS.ASSISTED_REPRODUCTIVE_SERVICES);
    }
    if (otherDeductions > 0) report.push(`Less: Other Deductions (TVC/Edu/Rent/Care/VHIS/ARS): -${formatCurrency(otherDeductions)}`);

    // Donation Cap is 35% of Assessable Income (which already subtracted outgoings)
    let totalDonations = self.deductions.approvedCharitableDonations;
    if (mode === 'JOINT') totalDonations += spouse.deductions.approvedCharitableDonations;
    
    // Note: For PA, business profit is aggregated. Assessable income calculated above includes profit.
    // The cap is 35% of total assessable income.
    totalDonations = Math.min(totalDonations, Math.max(0, totalAssessableIncome) * 0.35);
    
    if (totalDonations > 0) report.push(`Less: Donations: -${formatCurrency(totalDonations)}`);

    const finalDeductions = totalMpf + hli + otherDeductions + totalDonations;
    report.push(`Total Deductions: -${formatCurrency(finalDeductions)}`);

    // 5. Allowances
    report.push("Less: Allowances");
    let allowances = 0;
    
    if (mode === 'JOINT') {
        allowances += ALLOWANCES.MARRIED;
        report.push(`  Married Person's Allowance: -${formatCurrency(ALLOWANCES.MARRIED)}`);
        
        // Aggregate children safely
        const totalChildren = self.allowances.childrenCount + spouse.allowances.childrenCount;
        const totalNewborn = self.allowances.newbornCount + spouse.allowances.newbornCount;
        
        if (totalChildren > 0) {
             const amt = totalChildren * ALLOWANCES.CHILD;
             allowances += amt;
             report.push(`  Child Allowance (${totalChildren}): -${formatCurrency(amt)}`);
        }
        
        if (totalNewborn > 0) {
             const amt = totalNewborn * ALLOWANCES.CHILD_YEAR_OF_BIRTH_EXTRA;
             allowances += amt;
             report.push(`  Newborn Additional Allowance (${totalNewborn}): -${formatCurrency(amt)}`);
        }

        const totalBrotherSister = self.allowances.dependentBrotherSister + spouse.allowances.dependentBrotherSister;
        if (totalBrotherSister > 0) {
             const amt = totalBrotherSister * ALLOWANCES.BROTHER_SISTER;
             allowances += amt;
             report.push(`  Dependent Brother/Sister Allowance (${totalBrotherSister}): -${formatCurrency(amt)}`);
        }

        const parentsAmt = (self.allowances.dependentParent60PlusLiving + spouse.allowances.dependentParent60PlusLiving) * ALLOWANCES.PARENT_60_LIVING +
                           (self.allowances.dependentParent60PlusNotLiving + spouse.allowances.dependentParent60PlusNotLiving) * ALLOWANCES.PARENT_60_NOT_LIVING +
                           (self.allowances.dependentParent55To59Living + spouse.allowances.dependentParent55To59Living) * ALLOWANCES.PARENT_55_LIVING +
                           (self.allowances.dependentParent55To59NotLiving + spouse.allowances.dependentParent55To59NotLiving) * ALLOWANCES.PARENT_55_NOT_LIVING;
                           
        if (parentsAmt > 0) { 
            allowances += parentsAmt; 
            report.push(`  Dependent Parent Allowance: -${formatCurrency(parentsAmt)}`);
        }

        // Simplified aggregation for other allowances...
        if (self.allowances.disabledDependents > 0) {
            const amt = self.allowances.disabledDependents * ALLOWANCES.DISABLED_DEPENDENT;
            allowances += amt;
            report.push(`  Disabled Dependent (Self Side): -${formatCurrency(amt)}`);
        }
        
        if (self.allowances.personalDisability) {
            allowances += ALLOWANCES.PERSONAL_DISABILITY;
            report.push(`  Personal Disability (Self): -${formatCurrency(ALLOWANCES.PERSONAL_DISABILITY)}`);
        }
        if (spouse.allowances.personalDisability) {
            allowances += ALLOWANCES.PERSONAL_DISABILITY;
            report.push(`  Personal Disability (Spouse): -${formatCurrency(ALLOWANCES.PERSONAL_DISABILITY)}`);
        }
    } else {
        allowances += ALLOWANCES.BASIC; 
        report.push(`  Basic Allowance: -${formatCurrency(ALLOWANCES.BASIC)}`);
        
        if (self.allowances.childrenCount > 0) { 
            const amt = self.allowances.childrenCount * ALLOWANCES.CHILD;
            allowances += amt; 
            report.push(`  Child Allowance (${self.allowances.childrenCount}): -${formatCurrency(amt)}`);
        }
        if (self.allowances.newbornCount > 0) {
            const amt = self.allowances.newbornCount * ALLOWANCES.CHILD_YEAR_OF_BIRTH_EXTRA;
            allowances += amt;
            report.push(`  Newborn Additional Allowance (${self.allowances.newbornCount}): -${formatCurrency(amt)}`);
        }

        if (self.allowances.dependentBrotherSister > 0) {
            const amt = self.allowances.dependentBrotherSister * ALLOWANCES.BROTHER_SISTER;
            allowances += amt;
            report.push(`  Dependent Brother/Sister Allowance: -${formatCurrency(amt)}`);
        }
        
        const parentsAmt = 
           (self.allowances.dependentParent60PlusLiving * ALLOWANCES.PARENT_60_LIVING) +
           (self.allowances.dependentParent60PlusNotLiving * ALLOWANCES.PARENT_60_NOT_LIVING) +
           (self.allowances.dependentParent55To59Living * ALLOWANCES.PARENT_55_LIVING) +
           (self.allowances.dependentParent55To59NotLiving * ALLOWANCES.PARENT_55_NOT_LIVING);
           
        if (parentsAmt > 0) { 
            allowances += parentsAmt; 
            report.push(`  Dependent Parent Allowance: -${formatCurrency(parentsAmt)}`);
        }
        
        if (self.allowances.disabledDependents > 0) {
            const amt = self.allowances.disabledDependents * ALLOWANCES.DISABLED_DEPENDENT;
            allowances += amt;
            report.push(`  Disabled Dependent Allowance: -${formatCurrency(amt)}`);
        }
        
        if (self.allowances.personalDisability) {
            allowances += ALLOWANCES.PERSONAL_DISABILITY;
            report.push(`  Personal Disability Allowance: -${formatCurrency(ALLOWANCES.PERSONAL_DISABILITY)}`);
        }
        if (self.allowances.singleParent) {
            allowances += ALLOWANCES.SINGLE_PARENT;
            report.push(`  Single Parent Allowance: -${formatCurrency(ALLOWANCES.SINGLE_PARENT)}`);
        }
    }
    
    report.push(`Total Allowances: -${formatCurrency(allowances)}`);

    const netChargeable = Math.max(0, totalAssessableIncome - finalDeductions - allowances);
    report.push(`Net Chargeable Income: ${formatCurrency(netChargeable)}`);
    
    const taxResult = calculateProgressiveTax(netChargeable);
    report.push(...taxResult.report);
    
    return { tax: taxResult.tax, report };
}


export const calculateTaxLiability = (self: PersonProfile, spouse: PersonProfile): OptimizationResult => {
    const isMarried = self.allowances.married;

    const hasIncome = (p: PersonProfile) => (p.income.salary + p.income.businessProfit + p.income.rentalIncome) > 0;
    const spouseHasIncome = isMarried && hasIncome(spouse);

    // Scenario 1: Separate Taxation (Standard)
    const selfSalaries = calculateSalariesTax(self, "Self", isMarried, spouseHasIncome);
    const selfProfits = calculateProfitsTax(self.income.businessProfit, "Self");
    const selfProperty = calculatePropertyTax(self.income.rentalIncome, self.income.rentalRatesPaid, "Self");
    const selfTotal = selfSalaries.tax + selfProfits.tax + selfProperty.tax;
    
    if (!isMarried) {
        // --- SINGLE MODE ---
        const selfPA = calculatePersonalAssessment(self, spouse, 'SINGLE');
        
        const standardResult: TaxResult = {
            label: "Standard Filing",
            totalTax: selfTotal,
            breakdown: ["Standard Salaries Tax", "Standard Profits/Property Tax"],
            detailedReport: [...selfSalaries.report, ...(selfProfits.tax > 0 ? selfProfits.report : []), ...(selfProperty.tax > 0 ? selfProperty.report : [])],
            isBest: false
        };

        const paResult: TaxResult = {
            label: "Personal Assessment",
            totalTax: selfPA.tax,
            breakdown: ["Aggregated Income Assessment"],
            detailedReport: selfPA.report,
            isBest: false
        };

        const best = selfPA.tax < selfTotal ? paResult : standardResult;
        best.isBest = true;

        const naResult: TaxResult = { label: "N/A", totalTax: Infinity, breakdown: ["Not Applicable"], detailedReport: [], isBest: false };

        return {
            separate: standardResult,
            jointAssessment: naResult,
            personalAssessmentSeparate: paResult,
            personalAssessmentJoint: naResult,
            bestOption: best,
            savings: Math.max(0, standardResult.totalTax - best.totalTax)
        };
    }

    // --- MARRIED MODE ---

    // Spouse Separate
    const spouseSalaries = calculateSalariesTax(spouse, "Spouse", isMarried, hasIncome(self));
    const spouseProfits = calculateProfitsTax(spouse.income.businessProfit, "Spouse");
    const spouseProperty = calculatePropertyTax(spouse.income.rentalIncome, spouse.income.rentalRatesPaid, "Spouse");
    const spouseTotal = spouseSalaries.tax + spouseProfits.tax + spouseProperty.tax;
    
    const separateResult: TaxResult = {
        label: "Separate Filing",
        totalTax: selfTotal + spouseTotal,
        breakdown: [`Self: ${formatCurrency(selfTotal)}`, `Spouse: ${formatCurrency(spouseTotal)}`],
        detailedReport: [
            ...selfSalaries.report, 
            ...(selfProfits.tax > 0 ? selfProfits.report : []), 
            ...(selfProperty.tax > 0 ? selfProperty.report : []),
            "---",
            ...spouseSalaries.report,
            ...(spouseProfits.tax > 0 ? spouseProfits.report : []),
            ...(spouseProperty.tax > 0 ? spouseProperty.report : []),
            `### Total Separate Tax: ${formatCurrency(selfTotal + spouseTotal)}`
        ],
        isBest: false
    };

    // Scenario 2: Joint Assessment (Salaries) + Separate Profits/Property
    const jointSalariesProfile = { ...self, income: { ...self.income, businessProfit: 0, rentalIncome: 0 } };
    const jointSalariesSpouseProfile = { ...spouse, income: { ...spouse.income, businessProfit: 0, rentalIncome: 0 } };
    const jointSalariesTax = calculatePersonalAssessment(jointSalariesProfile, jointSalariesSpouseProfile, 'JOINT');
    // We adjust the report title for this scenario
    jointSalariesTax.report[0] = "### Joint Assessment (Salaries Tax Only)";
    
    const jointAssessmentTotal = jointSalariesTax.tax + selfProfits.tax + selfProperty.tax + spouseProfits.tax + spouseProperty.tax;

    const jointResult: TaxResult = {
        label: "Joint Assessment (Salaries)",
        totalTax: jointAssessmentTotal,
        breakdown: [`Combined Salaries: ${formatCurrency(jointSalariesTax.tax)}`, `Others: ${formatCurrency(jointAssessmentTotal - jointSalariesTax.tax)}`],
        detailedReport: [
            ...jointSalariesTax.report,
            "---",
            "### Plus Separate Business/Property Tax",
            ...(selfProfits.tax > 0 ? selfProfits.report : []),
            ...(selfProperty.tax > 0 ? selfProperty.report : []),
            ...(spouseProfits.tax > 0 ? spouseProfits.report : []),
            ...(spouseProperty.tax > 0 ? spouseProperty.report : []),
            `### Total Joint Tax: ${formatCurrency(jointAssessmentTotal)}`
        ],
        isBest: false
    };

    // Scenario 3: Personal Assessment (Separate)
    const selfPA = calculatePersonalAssessment(self, spouse, 'SINGLE'); // Note: Pass SINGLE to simulate separate assessment even if married
    // Update header for clarity
    selfPA.report[0] = "### Personal Assessment (Self)";
    const spousePA = calculatePersonalAssessment(spouse, self, 'SINGLE');
    spousePA.report[0] = "### Personal Assessment (Spouse)";
    
    const paSeparateResult: TaxResult = {
        label: "Personal Assessment (Separate)",
        totalTax: selfPA.tax + spousePA.tax,
        breakdown: [`Self PA: ${formatCurrency(selfPA.tax)}`, `Spouse PA: ${formatCurrency(spousePA.tax)}`],
        detailedReport: [
            ...selfPA.report,
            "---",
            ...spousePA.report,
            `### Total PA Separate: ${formatCurrency(selfPA.tax + spousePA.tax)}`
        ],
        isBest: false
    };

    // Scenario 4: Personal Assessment (Joint)
    const jointPA = calculatePersonalAssessment(self, spouse, 'JOINT');
    
    const paJointResult: TaxResult = {
        label: "Personal Assessment (Joint)",
        totalTax: jointPA.tax,
        breakdown: ["All income aggregated", "Married Allowance applied"],
        detailedReport: jointPA.report,
        isBest: false
    };

    // Compare
    const options = [separateResult, jointResult, paSeparateResult, paJointResult];
    let bestOptions = options[0];
    let minTax = options[0].totalTax;

    options.forEach(opt => {
        if (opt.totalTax < minTax) {
            minTax = opt.totalTax;
            bestOptions = opt;
        }
    });
    bestOptions.isBest = true;

    return {
        separate: separateResult,
        jointAssessment: jointResult,
        personalAssessmentSeparate: paSeparateResult,
        personalAssessmentJoint: paJointResult,
        bestOption: bestOptions,
        savings: separateResult.totalTax - bestOptions.totalTax
    };
};