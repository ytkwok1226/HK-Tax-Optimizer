import { GoogleGenAI } from "@google/genai";
import { PersonProfile, OptimizationResult, Language } from "../types";
import { DEDUCTION_CAPS } from "../constants";

const initGemini = () => {
  if (!process.env.API_KEY) {
    console.warn("Gemini API Key is missing.");
    return null;
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const getTaxAdvice = async (
  self: PersonProfile,
  spouse: PersonProfile,
  results: OptimizationResult,
  language: Language
): Promise<string> => {
  const ai = initGemini();
  if (!ai) return "API Key missing. Please configure the application environment.";

  const langInstruction = language === 'zh' 
    ? "IMPORTANT: You MUST reply in Traditional Chinese (Cantonese style where appropriate for Hong Kong context)." 
    : "Reply in English.";

  // Prepare a summary of deduction utilization to guide the AI
  const selfStats = `
    - TVC (Voluntary MPF): Claimed HK$${self.deductions.mpfVoluntaryTVC} (Cap: HK$${DEDUCTION_CAPS.MPF_TVC}).
    - VHIS (Health Insurance): Claimed HK$${self.deductions.qualifyingPremiums}.
    - Charitable Donations: Claimed HK$${self.deductions.approvedCharitableDonations}.
    - Self Education: Claimed HK$${self.deductions.selfEducation} (Cap: HK$${DEDUCTION_CAPS.SELF_EDUCATION}).
  `;

  const prompt = `
    You are a Hong Kong Tax Expert. Analyze the following user data and tax calculation results.
    ${langInstruction}
    
    **User Data:**
    Self Income: Salary ${self.income.salary}, Profit ${self.income.businessProfit}, Rental ${self.income.rentalIncome}.
    Spouse Income: Salary ${spouse.income.salary}, Profit ${spouse.income.businessProfit}, Rental ${spouse.income.rentalIncome}.
    Allowances: Married ${self.allowances.married}, Children ${self.allowances.childrenCount}.

    **Deduction Utilization (Self):**
    ${selfStats}

    **Calculation Results:**
    1. Separate Filing: HK$${results.separate.totalTax}
    2. Joint Assessment (Salaries): HK$${results.jointAssessment.totalTax}
    3. Personal Assessment (Separate): HK$${results.personalAssessmentSeparate.totalTax}
    4. Personal Assessment (Joint): HK$${results.personalAssessmentJoint.totalTax}

    **Winner:** ${results.bestOption.label} with tax HK$${results.bestOption.totalTax}.
    Savings vs Separate: HK$${results.savings}.

    **Task:**
    1. Briefly explain *why* the winner is the best option (e.g., "Joint Assessment helps because one spouse has unused allowances...").
    2. **Crucial:** Provide specific, actionable suggestions to minimize tax for the *next* year based on their unused deductions.
       - If TVC usage is low, suggested contributing to **TVC (Tax Deductible Voluntary Contributions)** or **QDAP** (Annuity) to utilize the HK$60,000 cap.
       - If they have high income, suggest **Charitable Donations**.
       - If applicable, mention **VHIS** or **Self-Education** (VTC/Courses).
    3. Keep it concise (under 200 words).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No advice generated.";
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    // Handle Quota Exceeded (429) specifically
    const isQuotaError = 
        error.status === 429 || 
        error.code === 429 || 
        (error.message && error.message.toLowerCase().includes('quota')) ||
        (error.error && error.error.code === 429);

    if (isQuotaError) {
        return language === 'zh' 
            ? "⚠️ AI 服務繁忙（已達到配額上限）。請稍後再試。" 
            : "⚠️ AI Service is busy (Quota Exceeded). Please try again in a minute.";
    }

    return language === 'zh'
        ? "暫時無法獲取 AI 建議，請稍後再試。"
        : "Failed to load AI advice. Please try again later.";
  }
};