/**
 * Predefined Scenarios & Modules across Financial and Mission-Critical Domains
 */

export const PRESET_SCENARIOS = [
  {
    id: 'loan_origination',
    title: 'Automated Loan Origination & Credit Assessment System',
    category: 'Financial Services / Lending',
    scenarioDescription: `Develop an intelligent Digital Loan Origination and Automated Credit Assessment module for a commercial bank. The system must allow retail and SME applicants to apply for personal and commercial loans online, automatically pull credit bureau reports (e.g. CIBIL/Experian), verify income using bank statement analyzers, and calculate automated creditworthiness scores using an ML underwriting model. High-risk or borderline credit applications must be routed to human credit risk officers with automated explainability dossiers. The platform must enforce strict regulatory compliance (RBI digital lending norms / Fair Lending Acts), encrypt all tax and identity documents, maintain tamper-evident audit trails of credit decisions, and support real-time digital loan sanction and disbursement within 15 minutes.`,
    tags: ['FinTech', 'Credit Risk', 'RBI Regulations', 'High Security', 'ML Underwriting'],
    defaultFactors: {
      requirementStability: 75,
      regulatoryCriticality: 92,
      securityRisk: 95,
      complexity: 82,
      changeFrequency: 60,
      continuousDeliveryNeed: 80,
      formalVerificationNeed: 88,
      failureConsequence: 90
    }
  },
  {
    id: 'fraud_detection',
    title: 'Real-Time Payment Gateway & Anti-Fraud Processing Engine',
    category: 'Payments / Security',
    scenarioDescription: `Build a high-throughput, low-latency Payment Processing and Fraud Detection Engine capable of inspecting 10,000 transactions per second (TPS) with sub-50ms inference time. The engine must score incoming credit card, UPI, and wire transactions for fraud patterns (velocity checks, geolocation jumps, device fingerprinting, and blacklisted merchant accounts). Legitimate transactions are routed to payment networks, suspicious transactions trigger adaptive step-up multi-factor authentication (3D Secure 2.0 / OTP), and fraudulent transactions are immediately rejected with alert notifications to SOC teams. The system must be fully PCI-DSS v4.0 Level 1 certified, ensure zero plain-text card data storage, feature 99.999% high availability with active-active multi-region failover, and produce automated regulatory incident reports.`,
    tags: ['PCI-DSS Level 1', 'Sub-50ms Latency', '10,000 TPS', 'Active-Active', 'Cybersecurity'],
    defaultFactors: {
      requirementStability: 65,
      regulatoryCriticality: 98,
      securityRisk: 99,
      complexity: 94,
      changeFrequency: 75,
      continuousDeliveryNeed: 95,
      formalVerificationNeed: 92,
      failureConsequence: 98
    }
  },
  {
    id: 'video_kyc',
    title: 'Customer Onboarding & Automated Video KYC Platform',
    category: 'Digital Banking / Identity',
    scenarioDescription: `Implement an end-to-end digital customer onboarding system featuring AI-assisted Video Know-Your-Customer (V-KYC). Customers upload government ID proofs (Aadhaar, Passport, PAN), which undergo OCR data extraction and holographic tampering verification. An interactive live video session is conducted with geo-tagging, liveness detection (blink/head turn), and facial biometric matching against the government ID photo. The platform must connect to regulatory databases for instant AML/PEP (Anti-Money Laundering / Politically Exposed Persons) sanctions screening. The solution must comply with central bank digital identity regulations, mandate video recording storage for 10 years in encrypted WORM (Write Once Read Many) storage, and provide bank compliance officers with an interactive verification workbench.`,
    tags: ['Biometrics', 'AML/Sanctions', 'WORM Storage', 'Liveness AI', 'Compliance'],
    defaultFactors: {
      requirementStability: 70,
      regulatoryCriticality: 95,
      securityRisk: 92,
      complexity: 78,
      changeFrequency: 50,
      continuousDeliveryNeed: 75,
      formalVerificationNeed: 85,
      failureConsequence: 88
    }
  },
  {
    id: 'telemedicine_ehr',
    title: 'Healthcare Telemedicine & Electronic Prescription Network',
    category: 'Healthcare / Critical Systems',
    scenarioDescription: `Design a secure telemedicine consultation and e-prescription platform connecting patients, licensed physicians, and registered pharmacies. Patients can schedule end-to-end encrypted video appointments, share symptom history, and receive digitally signed prescriptions. The system must enforce role-based access control, strict HIPAA Privacy/Security rules, and DEA regulations for electronic prescribing of controlled substances (EPCS) including two-factor digital signatures. All medical records and chat transcripts must be encrypted with AES-256 at rest and TLS 1.3 in transit, with full audit logging of access events.`,
    tags: ['HIPAA', 'e-Prescription', 'End-to-End Encryption', 'Healthcare', 'Audit Trails'],
    defaultFactors: {
      requirementStability: 80,
      regulatoryCriticality: 90,
      securityRisk: 90,
      complexity: 75,
      changeFrequency: 45,
      continuousDeliveryNeed: 70,
      formalVerificationNeed: 82,
      failureConsequence: 92
    }
  },
  {
    id: 'wealth_portfolio',
    title: 'Robo-Advisory Wealth Management & Algorithmic Portfolio Engine',
    category: 'Capital Markets / Investments',
    scenarioDescription: `Develop an automated investment advisory and portfolio rebalancing platform for retail investors. The system collects investor risk appetite questionnaires, creates personalized ETF portfolios based on Modern Portfolio Theory, and automatically rebalances assets when market drift exceeds defined tolerance thresholds. The system must integrate with market exchanges for real-time price feeds, generate automated trade execution orders via broker APIs, and produce MiFID II / SEC compliant suitability and disclosure reports. Requires robust historical backtesting, real-time stress testing, and human fiduciary advisor sign-off capabilities for high-net-worth rebalances.`,
    tags: ['FinTech', 'Robo-Advisory', 'SEC/MiFID II', 'Market Feeds', 'Algorithmic'],
    defaultFactors: {
      requirementStability: 60,
      regulatoryCriticality: 88,
      securityRisk: 86,
      complexity: 85,
      changeFrequency: 70,
      continuousDeliveryNeed: 85,
      formalVerificationNeed: 80,
      failureConsequence: 85
    }
  }
];
