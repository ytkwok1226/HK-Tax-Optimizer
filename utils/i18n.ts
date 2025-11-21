
export type Language = 'en' | 'zh';

export const translations = {
  en: {
    header: {
      title: "HK Tax Optimizer",
      subtitle: "Gives you the best filing option to minimize your tax liability.",
      share: "Share App",
      copied: "Link Copied!",
      language: "繁"
    },
    married: {
      label: "I am Married",
      hint: "Check this box to include your spouse's income."
    },
    tabs: {
      self: "You (Self)",
      spouse: "Spouse"
    },
    sections: {
      income: "Taxable Income",
      deductions: "Deductions",
      allowances: "Allowances"
    },
    income: {
      salary: {
        label: "Yearly Salary",
        input: "Total Amount",
        desc: "Income from any office or employment. Includes salary, wages, commission, bonuses, leave pay, end of contract gratuities, and payment in lieu of notice."
      },
      business: {
        label: "I have Business Profit",
        input: "Assessable Profit",
        summary: "Sole proprietorship or partnership",
        desc: "Net assessable profits from any trade, profession, or business carried on in Hong Kong (e.g. Sole Proprietorship, Partnership). Corporations are taxed separately."
      },
      rental: {
        label: "I have Rental Income",
        inputIncome: "Gross Rental Income",
        inputRates: "Rates Paid by You",
        summary: "Property rental income",
        desc: "Gross rent received or receivable from letting properties in Hong Kong. You can deduct Rates paid by you, and a 20% statutory allowance for repairs and outgoings is automatically granted."
      },
      other: {
        label: "I have Pensions / Share Options",
        input: "Taxable Amount",
        summary: "Pensions, Share Options, Tips",
        desc: "Taxable income not reported in the Salary box. Examples: Pensions, Gain realized on exercise of share options, Tips, Back pay, or other taxable employment benefits."
      },
      remark: {
        title: "Remark: What income is NOT taxable?",
        list: [
          "Dividends from a corporation",
          "Capital gains (e.g., from selling property or stocks)",
          "Interest on bank deposits (for individuals)",
          "Inheritance"
        ]
      }
    },
    deductions: {
      newbornToggle: "Living with a newborn child?",
      newbornDef: "Definition: A child born on or after 25 Oct 2023. Increases deduction cap to HK$120,000.",
      outgoings: {
        label: "Outgoings & Expenses",
        input: "Amount",
        desc: "Expenses wholly, exclusively, and necessarily incurred in the production of your assessable income. Examples: Professional association fees, mandatory uniforms. No statutory upper limit, but must be reasonable."
      },
      hli: {
        label: "Home Loan Interest",
        input: "Interest Paid",
        hint: "Max HK$100,000 (HK$120,000 if living with newborn)",
        desc: "Interest paid on a loan for the acquisition of your principal place of residence in Hong Kong. Maximum deduction HK$100,000 (HK$120,000 if residing with a newborn)."
      },
      rent: {
        label: "Domestic Rents",
        input: "Rent Paid",
        hint: "Max HK$100,000 (HK$120,000 if living with newborn)",
        desc: "Rent paid for your principal place of residence in Hong Kong. Not applicable if you or your spouse receive a housing allowance from an employer. Max deduction HK$100,000 (HK$120,000 with newborn)."
      },
      donations: {
        label: "Charitable Donations",
        input: "Approved Donations",
        hint: "Must be to approved charities",
        desc: "Cash donations to approved charitable institutions or trusts of a public character. Total donations must be at least HK$100. Deduction capped at 35% of assessable income (after outgoings)."
      },
      tvc: {
        label: "TVC (Voluntary MPF)",
        input: "TVC Contribution",
        hint: "Max HK$60,000",
        desc: "Contributions made to a Tax Deductible Voluntary Contribution (TVC) account under MPF. Maximum deduction HK$60,000."
      },
      education: {
        label: "Self-Education Expenses",
        input: "Course Fees",
        hint: "Max HK$100,000",
        desc: "Fees paid for courses of education prescribed by the Commissioner or provided by approved institutions (including tuition and examination fees). Max deduction HK$100,000."
      },
      elderlyCare: {
        label: "Elderly Residential Care",
        input: "Expenses Paid",
        hint: "Max HK$100,000",
        desc: "Residential care expenses paid by you to a residential care home for a parent or grandparent. Max HK$100,000. You cannot claim Dependent Parent Allowance for the same parent if you claim this deduction."
      },
      vhis: {
        label: "VHIS Premiums",
        input: "Premiums Paid",
        hint: "Max HK$8,000 per person",
        desc: "Qualifying premiums paid for Certified Plans under the Voluntary Health Insurance Scheme (VHIS) for yourself or specified relatives. Max HK$8,000 per insured person."
      },
      ars: {
        label: "Assisted Reproductive Services",
        input: "Expenses Paid",
        hint: "Max HK$100,000",
        desc: "Deduction for expenses paid for assisted reproductive services (e.g., IVF, Intrauterine Insemination) incurred by you or your spouse at an Accredited Service Provider. Applicable from 2024/25 onwards. Max deduction HK$100,000 per couple."
      }
    },
    allowances: {
      children: {
        label: "Children",
        inputTotal: "Total Unmarried Children",
        inputNewborn: "Of which, born this tax year",
        hintNewborn: "For additional deduction",
        descTitle: "Eligibility Criteria:",
        descIntro: "You can claim if you maintain an unmarried child who was:",
        descList: [
          "Under 18 years old; OR",
          "18 to under 25 years old AND receiving full-time education; OR",
          "18 or above AND unable to work due to disability."
        ]
      },
      brotherSister: {
        label: "Dependent Brother / Sister",
        input: "Number of Dependents",
        desc: "You can claim for maintaining an unmarried brother or sister (yours or your spouse's) who is: Under 18; OR 18-25 and in full-time education; OR disabled. You must have sole/predominant care."
      },
      parents: {
        label: "Dependent Parents / Grandparents",
        desc: "You may claim for maintaining a parent/grandparent who is ordinarily resident in HK. 'Living With You' means living in the same premises for a continuous period of at least 6 months without paying full cost.",
        l60Living: "60+ Living With You",
        l60NotLiving: "60+ Not Living With You",
        l55Living: "55-59 Living With You",
        l55NotLiving: "55-59 Not Living With You"
      },
      disability: {
        label: "Disability & Single Parent",
        descDependent: "Disabled Dependent: You maintain a dependent eligible for an allowance under the Govt Disability Allowance Scheme.",
        descPersonal: "Personal Disability: You are eligible to claim an allowance under the Govt Disability Allowance Scheme.",
        descSingle: "Single Parent: You had the sole or predominant care of a child. Cannot check this if you are married and not separated.",
        inputDependent: "Disabled Dependents",
        togglePersonal: "I have Personal Disability",
        toggleSingle: "Single Parent Allowance"
      }
    },
    actions: {
      calculate: "Calculate Tax",
      viewReport: "View Detailed Calculation Report",
      close: "Close"
    },
    results: {
      title: "Assessment Results",
      readyTitle: "Ready to Calculate",
      readyDesc: "Enter your income and deduction details, then click the Calculate Tax button to see your optimal filing strategy.",
      save: "You save",
      compared: "Compared to standard separate filing",
      otherOptions: "Other Options",
      disclaimer: "Disclaimer: This tool is for estimation purposes only. Please consult a qualified tax advisor for professional advice.",
      labels: {
        "Separate Filing": "Separate Filing",
        "Joint Assessment (Salaries)": "Joint Assessment (Salaries)",
        "Personal Assessment (Separate)": "Personal Assessment (Separate)",
        "Personal Assessment (Joint)": "Personal Assessment (Joint)",
        "Standard Filing": "Standard Filing",
        "Personal Assessment": "Personal Assessment"
      }
    },
    report: {
      title: "Detailed Calculation Report",
      subtitle: "Breakdown of income, deductions, and tax computation",
      totalTax: "Total Tax Liability",
      bestOption: "Best Option",
      noLogs: "No detailed logs available.",
      na: "This option is not applicable."
    },
    advisor: {
      title: "AI Tax Consultant",
      button: "Generate AI Analysis",
      loading: "Analyzing...",
      error: "Failed to load AI advice."
    }
  },
  zh: {
    header: {
      title: "香港稅務優化器",
      subtitle: "助你找出最佳報稅方式，將稅款減至最低。",
      share: "分享",
      copied: "已複製連結!",
      language: "EN"
    },
    married: {
      label: "已婚",
      hint: "勾選此項以輸入配偶入息並計算合併評稅。"
    },
    tabs: {
      self: "本人",
      spouse: "配偶"
    },
    sections: {
      income: "應課稅入息",
      deductions: "扣除項目",
      allowances: "免稅額"
    },
    income: {
      salary: {
        label: "年度薪俸收入",
        input: "總金額",
        desc: "來自任何職位或受僱工作的收入。包括薪金、工資、佣金、花紅、代通知金等。"
      },
      business: {
        label: "我有獨資/合夥業務利潤",
        input: "應評稅利潤",
        summary: "獨資或合夥業務",
        desc: "在香港經營任何行業、專業或業務的應評稅利潤（例如獨資、合夥）。有限公司則分開徵稅。"
      },
      rental: {
        label: "我有物業出租收入",
        inputIncome: "租金收入總額",
        inputRates: "由你支付的差餉",
        summary: "物業出租收入",
        desc: "在香港出租物業的租金收入。你可扣除由你支付的差餉，並自動獲得扣減差餉後餘額的20%作為修葺及支出的法定免稅額。"
      },
      other: {
        label: "我有退休金 / 認股權收益",
        input: "應課稅金額",
        summary: "退休金、認股權、小費",
        desc: "未包含在薪金內的應課稅收入。例如：退休金、行使認股權之收益、小費、補發薪金或其他應課稅津貼。"
      },
      remark: {
        title: "備註：甚麼收入不需要交稅？",
        list: [
          "來自有限公司的股息",
          "資本增值（例如出售物業或股票的利潤）",
          "銀行存款利息（對個人而言）",
          "遺產"
        ]
      }
    },
    deductions: {
      newbornToggle: "與新生子女同住？",
      newbornDef: "定義：於 2023年10月25日或之後出生的子女。扣除上限將增至 120,000 港元。",
      outgoings: {
        label: "支出及開支",
        input: "金額",
        desc: "完全、純粹及必須為產生應評稅入息而招致的開支。例如：專業學會會費、必須穿著的制服。法例沒有設定上限，但必須合理。"
      },
      hli: {
        label: "居所貸款利息",
        input: "利息支出",
        hint: "上限 HK$100,000 (有新生兒 HK$120,000)",
        desc: "為購買香港主要居所而支付的按揭利息。最高扣除額為100,000港元（如與新生子女同住則為120,000港元）。"
      },
      rent: {
        label: "住宅租金",
        input: "租金支出",
        hint: "上限 HK$100,000 (有新生兒 HK$120,000)",
        desc: "為香港主要居所支付的租金。如僱主有提供房屋津貼則不適用。最高扣除額為100,000港元（有新生兒則為120,000港元）。"
      },
      donations: {
        label: "認可慈善捐款",
        input: "捐款總額",
        hint: "必須為認可慈善機構",
        desc: "捐贈給認可慈善機構或公共性質信託的現金捐款。總額須不少於100港元。扣除額上限為應評稅入息（扣除開支後）的35%。"
      },
      tvc: {
        label: "可扣稅自願性供款 (TVC)",
        input: "TVC 供款額",
        hint: "上限 HK$60,000",
        desc: "向強積金計劃作出的可扣稅自願性供款。最高扣除額為60,000港元。"
      },
      education: {
        label: "個人進修開支",
        input: "課程費用",
        hint: "上限 HK$100,000",
        desc: "支付予指定教育機構的課程費用或考試費。最高扣除額為100,000港元。"
      },
      elderlyCare: {
        label: "長者住宿照顧開支",
        input: "支付金額",
        hint: "上限 HK$100,000",
        desc: "為父母或祖父母支付予安老院的住宿照顧開支。最高100,000港元。如已申索此扣除，則不能同時申索該名長者的供養父母免稅額。"
      },
      vhis: {
        label: "自願醫保保費 (VHIS)",
        input: "保費支出",
        hint: "每名受保人上限 HK$8,000",
        desc: "為自己或指明親屬支付的自願醫保計劃認可產品保費。每名受保人最高扣除額為8,000港元。"
      },
      ars: {
        label: "輔助生育服務開支",
        input: "開支總額",
        hint: "上限 HK$100,000",
        desc: "為你或配偶在認可服務提供者或持牌中心支付的輔助生育服務（如體外受精、宮腔內授精）開支。由 2024/25 課稅年度起適用。每對夫婦最高扣除額為 100,000 港元。"
      }
    },
    allowances: {
      children: {
        label: "子女免稅額",
        inputTotal: "未婚子女總數",
        inputNewborn: "其中於本課稅年度出生",
        hintNewborn: "獲額外免稅額",
        descTitle: "資格準則：",
        descIntro: "如你供養一名未婚子女，而該子女符合以下條件，即可申索：",
        descList: [
          "未滿 18 歲；或",
          "年滿 18 歲但未滿 25 歲，並在接受全日制教育；或",
          "年滿 18 歲，但因身體或精神無能力而不能工作。"
        ]
      },
      brotherSister: {
        label: "供養兄弟姊妹",
        input: "受養人數目",
        desc: "你可申索供養你（或配偶）的未婚兄弟姊妹，條件為：未滿18歲；或18-25歲並接受全日制教育；或傷殘。你必須負責其獨力或主要供養。"
      },
      parents: {
        label: "供養父母 / 祖父母",
        desc: "如你供養通常居住於香港的父母/祖父母。'同住'指連續至少6個月住在同一處所，且無需支付全額費用。",
        l60Living: "60歲以上 (同住)",
        l60NotLiving: "60歲以上 (非同住)",
        l55Living: "55-59歲 (同住)",
        l55NotLiving: "55-59歲 (非同住)"
      },
      disability: {
        label: "傷殘及單親",
        descDependent: "傷殘受養人：你供養一名有資格申領政府傷殘津貼的受養人。",
        descPersonal: "個人傷殘：你有資格申領政府傷殘津貼。",
        descSingle: "單親：你負責照顧和監護子女的起居生活。如已婚且未分居，則不能申索。",
        inputDependent: "傷殘受養人數目",
        togglePersonal: "我有個人傷殘",
        toggleSingle: "單親免稅額"
      }
    },
    actions: {
      calculate: "計算稅項",
      viewReport: "查看詳細計算報告",
      close: "關閉"
    },
    results: {
      title: "評稅結果",
      readyTitle: "準備計算",
      readyDesc: "輸入你的收入及扣除資料，然後按「計算稅項」按鈕查看最佳報稅策略。",
      save: "你節省了",
      compared: "相對於標準分開評稅",
      otherOptions: "其他方案",
      disclaimer: "免責聲明：此工具僅供估算之用。如需專業建議，請諮詢合資格稅務顧問。",
      labels: {
        "Separate Filing": "分開評稅",
        "Joint Assessment (Salaries)": "合併評稅 (薪俸稅)",
        "Personal Assessment (Separate)": "個人入息課稅 (分開)",
        "Personal Assessment (Joint)": "個人入息課稅 (合併)",
        "Standard Filing": "標準評稅",
        "Personal Assessment": "個人入息課稅"
      }
    },
    report: {
      title: "詳細計算報告",
      subtitle: "收入、扣除項目及稅款計算明細",
      totalTax: "應繳稅款總額",
      bestOption: "最佳方案",
      noLogs: "沒有詳細記錄。",
      na: "此選項不適用。"
    },
    advisor: {
      title: "AI 稅務顧問",
      button: "生成 AI 分析建議",
      loading: "分析中...",
      error: "無法載入 AI 建議。"
    }
  }
};
