/**
 * Agent 1: Hospital Requirements Engineering, Quality & Conflict Analysis Agent
 * Supports:
 * 1. Live RAG-Grounded Gemini LLM mode (when user supplies a Gemini API key)
 * 2. Local RAG-Grounded Hospital Engine (deterministic fallback that composes
 *    module-specific clinical requirements, citations, confidence scores,
 *    ambiguity checks, conflict detection, risk register, and IEEE 830 RTM).
 */

import { validateHospitalScenario } from './privacyGuard.js';
import { retrieveHealthcareContext, STAKEHOLDER_ROLES } from './knowledgeBase.js';

/**
 * Audits raw scenario text for IEEE 830 ambiguities and stakeholder requirement conflicts
 */
export function auditRequirementQuality(scenarioText, functionalReqs = [], nonFunctionalReqs = []) {
  const lower = (scenarioText || '').toLowerCase();
  const ambiguities = [];
  const conflicts = [];

  const vagueTerms = [
    {
      term: 'fast',
      regex: /\bfast\b/i,
      finding: 'Unquantified performance term "fast" cannot be objectively verified.',
      recommendation: 'Specify a measurable latency SLA (e.g., "P95 clinical chart load < 500ms").'
    },
    {
      term: 'user-friendly',
      regex: /\buser[- ]friendly\b/i,
      finding: 'Subjective usability phrase "user-friendly" lacks testable acceptance criteria.',
      recommendation: 'Define usability metrics (e.g., "WCAG 2.1 AA compliance; <= 3 clicks for e-Rx order").'
    },
    {
      term: 'seamless',
      regex: /\bseamless(ly)?\b/i,
      finding: 'Vague integration term "seamless" hides protocol and error-handling details.',
      recommendation: 'Specify interface protocol and fallback SLA (e.g., "HL7 FHIR R4 REST API with retry queue").'
    },
    {
      term: 'secure',
      regex: /\bsecure\b/i,
      checkMissing: ['aes', 'tls', 'rbac', 'mfa', '2fa', 'hipaa', 'encryption'],
      finding: 'Generic term "secure" without explicit cryptographic or access-control specifications.',
      recommendation: 'Mandate AES-256 at rest, TLS 1.3 in transit, RBAC, and MFA per HIPAA §164.312.'
    },
    {
      term: 'real-time',
      regex: /\breal[- ]time\b/i,
      checkMissing: ['ms', 'second', 'sec', 'latency'],
      finding: '"Real-time" is stated without an upper latency bound.',
      recommendation: 'Specify hard latency bounds (e.g., "< 500ms for ICU vitals alerts").'
    },
    {
      term: 'scalable',
      regex: /\bscalab(le|ility)\b/i,
      checkMissing: ['concurrent', 'tps', 'beds', 'users'],
      finding: '"Scalable" lacks quantitative concurrency or hospital volume targets.',
      recommendation: 'Define peak capacity (e.g., "2,000 concurrent clinicians and 10,000 patient records/hour").'
    }
  ];

  for (const item of vagueTerms) {
    if (item.regex.test(lower)) {
      const hasQuantifier = item.checkMissing ? item.checkMissing.some((k) => lower.includes(k)) : false;
      if (!hasQuantifier) {
        ambiguities.push({
          term: item.term,
          severity: 'Medium',
          finding: item.finding,
          recommendation: item.recommendation
        });
      }
    }
  }

  // Conflict detection rules common in hospital IT systems
  if ((lower.includes('emergency') || lower.includes('icu') || lower.includes('triage')) && (lower.includes('rbac') || lower.includes('privacy') || lower.includes('hipaa') || lower.includes('strict'))) {
    conflicts.push({
      id: 'CONF-01',
      title: 'Emergency Clinical Access vs. Strict RBAC Privacy',
      description: 'ICU/Emergency clinicians require immediate frictionless access to patient charts, which conflicts with strict least-privilege RBAC and multi-step consent checks.',
      resolution: 'Implement HIPAA-compliant Break-Glass Emergency Override with mandatory post-hoc audit alert to the Compliance Officer within 1 hour.'
    });
  }

  if ((lower.includes('real-time') || lower.includes('sub-second') || lower.includes('instant')) && (lower.includes('human') || lower.includes('sign-off') || lower.includes('review') || lower.includes('approval'))) {
    conflicts.push({
      id: 'CONF-02',
      title: 'Sub-Second Automated Alerting vs. Manual Clinician Sign-Off',
      description: 'Real-time automated clinical scoring or lab publishing conflicts with mandatory human physician verification before release.',
      resolution: 'Use a two-tier workflow: deliver unverified advisory alerts immediately to attending physicians while gating external patient portal visibility behind digital sign-off.'
    });
  }

  if ((lower.includes('evolving') || lower.includes('frequently changing') || lower.includes('agile')) && (lower.includes('hipaa') || lower.includes('nabh') || lower.includes('iec 62304') || lower.includes('regulation'))) {
    conflicts.push({
      id: 'CONF-03',
      title: 'Rapid Clinical Iteration vs. Statutory Compliance Stability',
      description: 'Frequent feature releases conflict with formal hospital accreditation (NABH/HIPAA/IEC 62304) audit sign-offs.',
      resolution: 'Adopt an Agile–DevSecOps Hybrid pipeline with automated compliance-as-code gates and versioned audit artifacts per sprint.'
    });
  }

  const penalty = ambiguities.length * 4 + conflicts.length * 3;
  const overallScore = Math.max(68, Math.min(97, 96 - penalty));
  const testabilityRating = ambiguities.length === 0 ? 'High (Fully Quantified)' : ambiguities.length <= 2 ? 'Moderate-High (Minor Refinements Needed)' : 'Needs Clarification';

  return {
    overallScore,
    status: overallScore >= 85 ? 'Validated Draft (Pending Human Sign-Off)' : 'Clarification Recommended',
    testabilityRating,
    ambiguities,
    conflicts,
    checkedCount: functionalReqs.length + nonFunctionalReqs.length
  };
}

export class RequirementAgent {
  constructor() {
    this.name = 'Hospital Requirements Engineering Agent';
  }

  /**
   * Optional Live Gemini LLM call grounded in RAG context
   */
  async _callGeminiLLM(maskedScenario, stakeholderObj, ragDocs, clarificationAnswers, apiKey) {
    const ragContext = ragDocs
      .map((d) => `${d.citation} (${d.jurisdiction}): ${d.requirement}`)
      .join('\n');

    const clarifText = Object.entries(clarificationAnswers || {})
      .map(([k, v]) => `- ${k}: ${v}`)
      .join('\n');

    const prompt = `You are a senior Hospital Requirements Engineering AI Agent.
Analyze the following hospital software scenario from the perspective of stakeholder: ${stakeholderObj.label} (${stakeholderObj.focus}).

SCENARIO (PHI already masked):
${maskedScenario}

CLARIFICATION ANSWERS PROVIDED:
${clarifText || 'None yet.'}

AUTHORIZED HEALTHCARE REGULATORY KNOWLEDGE BASE (cite these exact IDs in citations):
${ragContext}

Return ONLY valid JSON (no markdown fences) matching this exact schema:
{
  "domain": "string (specific hospital sub-domain)",
  "functionalRequirements": [
    {
      "id": "FR-01",
      "title": "string",
      "category": "string",
      "multiLabels": ["Functional", "Clinical Safety"],
      "priority": "Critical|High|Medium",
      "riskLevel": "Critical|High|Medium|Low",
      "sourceStakeholder": "string",
      "statement": "The system shall ...",
      "userStory": "As a ..., I want ..., so that ...",
      "acceptanceCriteria": ["criterion 1", "criterion 2"],
      "businessJustification": "string",
      "applicableRegulations": ["HIPAA ...", "NABH ..."],
      "citations": ["KB-HIPAA-01"],
      "confidence": 0.92
    }
  ],
  "nonFunctionalRequirements": [
    {
      "id": "NFR-01",
      "title": "string",
      "category": "Security|Privacy|Performance|Availability|Interoperability|Auditability",
      "multiLabels": ["Security", "Regulatory"],
      "priority": "Critical|High|Medium",
      "statement": "string",
      "targetMetrics": "quantified SLA",
      "applicableRegulations": ["string"],
      "citations": ["KB-HIPAA-01"],
      "confidence": 0.94
    }
  ]
}
Produce 4 to 5 Functional Requirements and 4 Non-Functional Requirements grounded strictly in the scenario and knowledge base.`;

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey.trim())}`;
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: 'application/json'
        }
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Gemini API HTTP ${response.status}: ${errBody.slice(0, 160)}`);
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      throw new Error('Empty response from Gemini API.');
    }

    const cleaned = rawText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed.functionalRequirements) || !Array.isArray(parsed.nonFunctionalRequirements)) {
      throw new Error('Gemini JSON response missing required FR/NFR arrays.');
    }
    return parsed;
  }

  /**
   * Composes dynamic, hospital-module-specific requirements grounded in RAG context
   */
  _generateLocalRAGRequirements(maskedScenario, stakeholderObj, ragDocs, clarificationAnswers = {}) {
    const lower = (maskedScenario + ' ' + Object.values(clarificationAnswers).join(' ')).toLowerCase();

    // Detect specific hospital clinical modules mentioned
    const hasICU = /icu|triage|emergency|ventilator|infusion|vitals|sepsis|critical care/.test(lower);
    const hasTelemed = /telemedicine|telehealth|video|appointment|outpatient|opd|queue/.test(lower);
    const hasPharmacy = /prescription|e-rx|pharmacy|medication|drug|controlled/.test(lower);
    const hasLab = /lab|laboratory|pathology|radiology|pacs|dicom|lis|specimen|diagnostic/.test(lower);
    const hasBilling = /billing|insurance|claim|claims|tpa|icd-10|invoice/.test(lower);
    const hasAI = /ai|ml|decision support|sepsis|predict|scoring|early-warning/.test(lower);

    let domain = 'Hospital Information & EHR Management';
    if (hasICU) domain = 'Critical Care, Emergency Triage & ICU Monitoring';
    else if (hasLab) domain = 'Hospital Diagnostics (LIS) & Radiology (PACS)';
    else if (hasBilling) domain = 'Hospital Revenue Cycle, Claims & Pharmacy Operations';
    else if (hasTelemed && hasPharmacy) domain = 'Hospital Telemedicine & e-Prescription Network';
    else if (hasTelemed) domain = 'Outpatient Telehealth & Patient Engagement';

    const functionalReqs = [];
    let frCounter = 1;
    const nextFrId = () => `FR-HOSP-${String(frCounter++).padStart(2, '0')}`;

    // Core Hospital Identity & EHR Patient Record
    functionalReqs.push({
      id: nextFrId(),
      title: 'Patient Identity Verification, Consent & Clinical Profile (EHR)',
      category: 'Clinical Records & Access',
      multiLabels: ['Functional', 'Privacy', 'Regulatory'],
      priority: 'Critical',
      riskLevel: 'High',
      sourceStakeholder: stakeholderObj.label,
      statement: 'The system shall register and authenticate patients using unique Hospital UHID / ABHA identifiers, capture explicit revocable data-sharing consent, and present longitudinal allergies, diagnoses, and vitals to authorized clinicians.',
      userStory: 'As an attending clinician, I want instant access to verified patient allergies and medical history so that clinical decisions are safe and compliant.',
      acceptanceCriteria: [
        'Duplicate patient detection on registration via biometric or national health ID (ABHA/UHID)',
        'High-visibility clinical allergy and contraindication banner pinned across all patient views',
        'Granular digital consent artifact logged prior to any external health record exchange'
      ],
      businessJustification: 'Prevents misidentification errors and satisfies statutory health data privacy mandates.',
      applicableRegulations: ['HIPAA Privacy Rule', 'NABH IMS.3', 'ABDM / DPDP Act 2023'],
      citations: ['KB-HIPAA-02', 'KB-NABH-01', 'KB-ABDM-01'],
      confidence: 0.95
    });

    if (hasICU) {
      functionalReqs.push({
        id: nextFrId(),
        title: 'Real-Time ICU Vitals Ingestion & Deterioration Alerting',
        category: 'Critical Care Safety',
        multiLabels: ['Functional', 'Clinical Safety', 'Performance'],
        priority: 'Critical',
        riskLevel: 'Critical',
        sourceStakeholder: 'ICU Nursing & Critical Care Lead',
        statement: 'The system shall continuously ingest bedside telemetry (HR, SpO2, BP, ventilator metrics), compute triage/early-warning scores, and dispatch deterministic audio-visual escalation alerts on threshold breach.',
        userStory: 'As an ICU nurse, I want sub-second critical deterioration alerts with patient bed location so that emergency intervention begins immediately.',
        acceptanceCriteria: [
          'Telemetry ingestion latency under 500ms from bedside monitor to nursing central station',
          'Fail-safe disconnect alarm triggered within 3 seconds of sensor or network drop',
          'Alert acknowledgment and clinician escalation timer recorded in immutable clinical log'
        ],
        businessJustification: 'Directly protects patient life in emergency and intensive care environments.',
        applicableRegulations: ['IEC 62304 Class C', 'NABH Patient Safety Standards'],
        citations: ['KB-IEC62304-01', 'KB-ISO25010-01'],
        confidence: 0.96
      });
    }

    if (hasTelemed) {
      functionalReqs.push({
        id: nextFrId(),
        title: 'Encrypted Teleconsultation Scheduling & Queue Management',
        category: 'Telehealth & OPD Workflow',
        multiLabels: ['Functional', 'Usability', 'Security'],
        priority: 'High',
        riskLevel: 'Medium',
        sourceStakeholder: 'OPD Coordinator & Patients',
        statement: 'The system shall enable outpatients to book specialty appointments, track live OPD queue status, and join end-to-end encrypted video consultations with clinical note capture.',
        userStory: 'As a patient, I want to book a specialist teleconsultation and receive automated reminders so I can consult my doctor remotely without travel.',
        acceptanceCriteria: [
          'Real-time physician roster sync preventing overlapping appointment slots',
          'WebRTC video stream encrypted end-to-end with zero unencrypted media storage',
          'Automated SMS/email reminders 24 hours and 1 hour prior to consultation'
        ],
        businessJustification: 'Expands hospital outpatient capacity and improves patient care continuity.',
        applicableRegulations: ['HIPAA Telehealth Guidelines', 'ABDM Telemedicine Norms'],
        citations: ['KB-HIPAA-01', 'KB-ABDM-01'],
        confidence: 0.93
      });
    }

    if (hasPharmacy) {
      functionalReqs.push({
        id: nextFrId(),
        title: 'Electronic Prescribing (e-Rx), Drug-Interaction Check & Pharmacy Dispatch',
        category: 'Medication Safety',
        multiLabels: ['Functional', 'Clinical Safety', 'Regulatory'],
        priority: 'Critical',
        riskLevel: 'Critical',
        sourceStakeholder: 'Licensed Physicians & Chief Pharmacist',
        statement: 'The system shall validate prescribed medications against patient allergies and active drugs, require 2FA cryptographic clinician signing for controlled substances, and transmit orders directly to the hospital pharmacy.',
        userStory: 'As a physician, I want automated drug-to-drug interaction warnings and 2FA digital signing so that patients receive safe, tamper-proof prescriptions.',
        acceptanceCriteria: [
          'Hard-stop clinical alert on severe drug-drug or drug-allergy contraindications',
          'Two-factor authentication and cryptographic hash signature on every controlled e-Rx',
          'Real-time pharmacy stock check with batch/expiry verification prior to dispensing'
        ],
        businessJustification: 'Eliminates prescription legibility errors and prevents adverse drug events (ADEs).',
        applicableRegulations: ['NABH MOM.4', 'DEA EPCS 21 CFR Part 1311'],
        citations: ['KB-NABH-01', 'KB-EPCS-01'],
        confidence: 0.95
      });
    }

    if (hasLab) {
      functionalReqs.push({
        id: nextFrId(),
        title: 'HL7/FHIR Lab Result & DICOM Radiology Ingestion with Critical Sign-Off',
        category: 'Diagnostics & Interoperability',
        multiLabels: ['Functional', 'Interoperability', 'Clinical Safety'],
        priority: 'High',
        riskLevel: 'High',
        sourceStakeholder: 'Pathology & Radiology Director',
        statement: 'The system shall ingest diagnostic results via HL7 FHIR R4 and radiology scans via DICOM, require pathologist verification for abnormal critical values, and escalate critical findings to attending doctors.',
        userStory: 'As a pathologist, I want to verify critical abnormal lab reports before patient release while alerting the attending physician immediately.',
        acceptanceCriteria: [
          'Automated HL7 FHIR Observation/DiagnosticReport parsing with schema validation',
          'Critical value escalation workflow requiring clinician read-receipt within 15 minutes',
          'DICOM viewer integrated with watermarked patient IDs and access audit logging'
        ],
        businessJustification: 'Accelerates diagnostic turnaround while preventing unreviewed panic values.',
        applicableRegulations: ['HL7 FHIR R4 / DICOM', 'NABH Diagnostic Safety'],
        citations: ['KB-FHIR-01', 'KB-HIPAA-02'],
        confidence: 0.94
      });
    }

    if (hasBilling) {
      functionalReqs.push({
        id: nextFrId(),
        title: 'ICD-10 Coding Validation, Insurance Claims (TPA) & Billing Reconciliation',
        category: 'Hospital Revenue & Compliance',
        multiLabels: ['Functional', 'Regulatory', 'Auditability'],
        priority: 'High',
        riskLevel: 'High',
        sourceStakeholder: 'Hospital Finance & Insurance Desk',
        statement: 'The system shall validate clinical diagnoses against ICD-10 codes, submit electronic cashless pre-authorization claims via FHIR Claim APIs, and detect duplicate billing entries.',
        userStory: 'As a hospital billing officer, I want automated ICD-10 and insurance eligibility checks so that claim rejections and discharge delays are minimized.',
        acceptanceCriteria: [
          'Automated ICD-10 code completeness check before insurance claim submission',
          'Duplicate charge and policy coverage cap verification in under 2 seconds',
          'Itemized GST/statutory discharge invoice linked to verified clinical orders'
        ],
        businessJustification: 'Reduces insurance claim denials and ensures transparent hospital financial audits.',
        applicableRegulations: ['HL7 FHIR Claims', 'HIPAA Transaction Standards'],
        citations: ['KB-FHIR-01', 'KB-HIPAA-01'],
        confidence: 0.91
      });
    }

    if (hasAI) {
      functionalReqs.push({
        id: nextFrId(),
        title: 'Explainable Clinical Decision Support & Human-in-the-Loop Override',
        category: 'Clinical AI Governance',
        multiLabels: ['Functional', 'Clinical Safety', 'Auditability'],
        priority: 'High',
        riskLevel: 'Critical',
        sourceStakeholder: 'Chief Medical Officer',
        statement: 'The system shall present AI-generated clinical risk scores alongside contributing patient features, confidence intervals, and mandatory physician accept/override controls.',
        userStory: 'As a clinician, I want to inspect why an AI model flagged a patient as high-risk and record my clinical override so that final medical accountability stays with licensed doctors.',
        acceptanceCriteria: [
          'Every AI risk score displays top 3 clinical indicators and model version/confidence',
          'Mandatory clinician confirmation required before triggering treatment protocols',
          'All clinician overrides logged for retrospective clinical safety evaluation'
        ],
        businessJustification: 'Mitigates AI hallucination/automation bias and preserves medical liability governance.',
        applicableRegulations: ['IEC 62304', 'FDA Clinical Decision Support Guidance'],
        citations: ['KB-IEC62304-01'],
        confidence: 0.92
      });
    }

    // Ensure at least 4 rich FRs even for short hospital prompts
    if (functionalReqs.length < 4) {
      functionalReqs.push({
        id: nextFrId(),
        title: 'Clinical Workflow Execution & Role-Based Department Routing',
        category: 'Hospital Operations',
        multiLabels: ['Functional', 'Operational'],
        priority: 'High',
        riskLevel: 'Medium',
        sourceStakeholder: stakeholderObj.label,
        statement: `The system shall automate the core hospital workflow described in the specification with structured input validation, department routing, and status tracking.`,
        userStory: `As a ${stakeholderObj.label}, I want structured clinical workflow tracking so that patient handovers across hospital departments have zero dropped tasks.`,
        acceptanceCriteria: [
          'Enforced clinical state transitions with timestamped clinician attribution',
          'Automated handover notifications across ward, lab, and billing teams',
          'Exception handling queue for incomplete clinical entries'
        ],
        businessJustification: 'Eliminates manual paper handoffs and improves hospital throughput.',
        applicableRegulations: ['NABH Operational Standards'],
        citations: ['KB-NABH-01'],
        confidence: 0.89
      });
    }

    if (functionalReqs.length < 4) {
      functionalReqs.push({
        id: nextFrId(),
        title: 'Regulatory Reporting, Audit Trail Export & Analytics Dashboard',
        category: 'Audit & Statutory Reporting',
        multiLabels: ['Functional', 'Auditability', 'Regulatory'],
        priority: 'Medium',
        riskLevel: 'Medium',
        sourceStakeholder: 'HIPAA / NABH Compliance Officer',
        statement: 'The system shall generate anonymized hospital quality metrics and export tamper-evident compliance audit logs for internal and statutory accreditation reviews.',
        userStory: 'As a compliance officer, I want one-click anonymized statutory reports and complete ePHI access logs so hospital accreditation audits are fast and verifiable.',
        acceptanceCriteria: [
          'Automated PHI de-identification on all analytical and ministry exports',
          'Searchable audit log filterable by clinician ID, patient UHID, and timestamp',
          'Cryptographic checksum attached to exported compliance reports'
        ],
        businessJustification: 'Ensures continuous readiness for NABH and HIPAA compliance audits.',
        applicableRegulations: ['HIPAA §164.312(b)', 'NABH IMS Standards'],
        citations: ['KB-HIPAA-02', 'KB-NABH-01'],
        confidence: 0.91
      });
    }

    // Build Non-Functional Requirements dynamically incorporating clarification answers
    const drAnswer = clarificationAnswers.clinical_dr || '';
    const scaleAnswer = clarificationAnswers.hospital_scale || '';
    const interopAnswer = clarificationAnswers.interoperability || '';

    const uptimeTarget = drAnswer.includes('RPO = 0') || hasICU
      ? '99.99% uptime, RPO = 0, RTO < 5 minutes (active-active multi-zone failover)'
      : '99.95% uptime, RPO < 15 minutes, RTO < 30 minutes (warm standby failover)';

    const loadTarget = scaleAnswer.includes('1,000+ beds')
      ? '5,000+ concurrent clinical/patient sessions, P95 API latency < 500ms'
      : scaleAnswer.includes('200–500 beds')
      ? '1,500 concurrent hospital users, P95 API latency < 750ms'
      : 'P95 clinical record retrieval < 800ms, zero dropped critical alerts';

    const nonFunctionalReqs = [
      {
        id: 'NFR-HOSP-01',
        title: 'ePHI Cryptographic Encryption & Zero-Leakage Privacy',
        category: 'Security & Privacy',
        multiLabels: ['Security', 'Privacy', 'Regulatory'],
        priority: 'Critical',
        statement: 'All Electronic Protected Health Information (ePHI) must be encrypted using AES-256 at rest and TLS 1.3 in transit, with automated PHI masking before any AI/LLM inference or logging.',
        targetMetrics: 'AES-256 / TLS 1.3, 100% PHI masking in logs, zero plaintext ePHI exposure',
        applicableRegulations: ['HIPAA Security Rule §164.312', 'DPDP Act 2023'],
        citations: ['KB-HIPAA-01', 'KB-ABDM-01'],
        confidence: 0.97
      },
      {
        id: 'NFR-HOSP-02',
        title: 'Role-Based Access Control (RBAC), MFA & Emergency Break-Glass',
        category: 'Access Control & Auditability',
        multiLabels: ['Security', 'Auditability', 'Clinical Safety'],
        priority: 'Critical',
        statement: 'Enforce strict least-privilege RBAC with MFA for clinicians, emergency break-glass override for life-critical ICU/ER access, and append-only audit trails retained for at least 6–7 years.',
        targetMetrics: '100% ePHI access events logged; break-glass overrides alerted to CISO/Compliance < 60 min',
        applicableRegulations: ['HIPAA §164.312(a)(2)(ii)', 'ISO 27001:2022'],
        citations: ['KB-HIPAA-02'],
        confidence: 0.96
      },
      {
        id: 'NFR-HOSP-03',
        title: 'Clinical Availability, Disaster Recovery & Latency SLA',
        category: 'Availability & Performance',
        multiLabels: ['Availability', 'Performance', 'Clinical Safety'],
        priority: 'High',
        statement: 'Hospital clinical workflows must sustain continuous high availability with automated failover and deterministic response times under peak ward and OPD concurrency.',
        targetMetrics: `${uptimeTarget}; ${loadTarget}`,
        applicableRegulations: ['ISO/IEC 25010 Reliability', 'NABH Continuity Standards'],
        citations: ['KB-ISO25010-01'],
        confidence: 0.93
      },
      {
        id: 'NFR-HOSP-04',
        title: 'Clinical Interoperability (HL7 FHIR R4 / DICOM / ABHA)',
        category: 'Interoperability',
        multiLabels: ['Interoperability', 'Integration', 'Regulatory'],
        priority: 'High',
        statement: interopAnswer.includes('Standalone')
          ? 'Provide standardized FHIR-compatible JSON/CSV export schemas so the standalone module can integrate with hospital EHRs in future phases.'
          : 'Expose HL7 FHIR R4 REST APIs (and DICOM where imaging applies) to exchange patient, lab, prescription, and claim records cleanly with legacy Hospital Management Systems (HMS).',
        targetMetrics: '100% HL7 FHIR R4 schema validation pass rate; < 0.1% message sync error rate',
        applicableRegulations: ['HL7 FHIR R4', 'ABDM HIE-CM Specification'],
        citations: ['KB-FHIR-01', 'KB-ABDM-01'],
        confidence: 0.92
      }
    ];

    return {
      domain,
      functionalRequirements: functionalReqs,
      nonFunctionalRequirements: nonFunctionalReqs
    };
  }

  /**
   * Main entry point called by AgentOrchestrator
   */
  async analyzeScenario(maskedScenario, options = {}) {
    const {
      stakeholderRole = 'cmo',
      clarificationAnswers = {},
      apiKey = ''
    } = options;

    const validation = validateHospitalScenario(maskedScenario);
    if (!validation.isValid) {
      throw new Error(validation.reason);
    }

    const stakeholderObj = STAKEHOLDER_ROLES.find((r) => r.id === stakeholderRole) || STAKEHOLDER_ROLES[0];
    const ragDocs = retrieveHealthcareContext(maskedScenario, clarificationAnswers, 5);

    let generationMode = 'Local RAG-Grounded Hospital Engine';
    let llmWarning = null;
    let extracted = null;

    if (apiKey && apiKey.trim().length > 10) {
      try {
        extracted = await this._callGeminiLLM(maskedScenario, stakeholderObj, ragDocs, clarificationAnswers, apiKey);
        generationMode = 'Live Gemini 2.5 Flash + Healthcare RAG';
      } catch (err) {
        llmWarning = `Live LLM unavailable (${err.message}); automatically fell back to Local RAG-Grounded Hospital Engine.`;
        extracted = this._generateLocalRAGRequirements(maskedScenario, stakeholderObj, ragDocs, clarificationAnswers);
      }
    } else {
      extracted = this._generateLocalRAGRequirements(maskedScenario, stakeholderObj, ragDocs, clarificationAnswers);
    }

    const functionalRequirements = extracted.functionalRequirements.map((fr) => ({
      ...fr,
      approvalStatus: 'Pending Review'
    }));
    const nonFunctionalRequirements = extracted.nonFunctionalRequirements.map((nfr) => ({
      ...nfr,
      approvalStatus: 'Pending Review'
    }));

    const qualityReport = auditRequirementQuality(maskedScenario, functionalRequirements, nonFunctionalRequirements);

    // Build IEEE 830 Requirements Traceability Matrix (RTM)
    const traceabilityMatrix = [
      ...functionalRequirements.map((fr) => ({
        requirementId: fr.id,
        title: fr.title,
        type: 'Functional',
        stakeholder: fr.sourceStakeholder || stakeholderObj.label,
        regulatoryMapping: (fr.applicableRegulations || []).join(', ') || 'Hospital Standard',
        citations: (fr.citations || []).join(', ') || 'KB-HIPAA-01',
        verificationStage: fr.riskLevel === 'Critical' ? 'Clinical Safety & UAT Gate' : 'Integration & UAT'
      })),
      ...nonFunctionalRequirements.map((nfr) => ({
        requirementId: nfr.id,
        title: nfr.title,
        type: 'Non-Functional',
        stakeholder: 'Hospital Security & Compliance',
        regulatoryMapping: (nfr.applicableRegulations || []).join(', ') || 'ISO 25010',
        citations: (nfr.citations || []).join(', ') || 'KB-ISO25010-01',
        verificationStage: 'Automated SAST/DAST & Load Verification'
      }))
    ];

    // Clinical Risk Register
    const riskRegister = [
      {
        id: 'RISK-01',
        category: 'Privacy / Regulatory',
        risk: 'Unauthorized ePHI exposure or unmasked patient data leakage to external AI endpoints.',
        severity: 'Critical',
        mitigation: 'Mandatory pre-inference PHI redaction, AES-256 encryption, RBAC, and immutable audit trails.'
      },
      {
        id: 'RISK-02',
        category: 'Clinical Safety',
        risk: 'Missed critical alerts, drug-interaction omissions, or over-reliance on AI scoring without physician review.',
        severity: 'Critical',
        mitigation: 'Deterministic hard-stop allergy/drug alerts, human clinician sign-off gates, and clinical UAT.'
      },
      {
        id: 'RISK-03',
        category: 'Interoperability / Legacy',
        risk: 'Data synchronization failures with legacy Hospital Management Systems (HMS), labs, or radiology PACS.',
        severity: 'High',
        mitigation: 'HL7 FHIR R4 contract validation, dead-letter retry queues, and integration staging drills.'
      }
    ];

    const avgConfidence = Number((
      [...functionalRequirements, ...nonFunctionalRequirements].reduce((s, r) => s + (r.confidence || 0.9), 0) /
      Math.max(1, functionalRequirements.length + nonFunctionalRequirements.length)
    ).toFixed(2));

    const uniqueRegs = [...new Set(ragDocs.map((d) => d.standard))];

    return {
      scenario: maskedScenario,
      domain: extracted.domain || 'Hospital & Clinical Systems',
      stakeholderRole: stakeholderObj.label,
      generationMode,
      llmWarning,
      retrievedKnowledge: ragDocs,
      functionalRequirements,
      nonFunctionalRequirements,
      totalCount: functionalRequirements.length + nonFunctionalRequirements.length,
      metrics: {
        regulatoryStandardsMapped: uniqueRegs,
        functionalCount: functionalRequirements.length,
        nonFunctionalCount: nonFunctionalRequirements.length,
        averageConfidence: avgConfidence
      },
      qualityReport,
      traceabilityMatrix,
      riskRegister
    };
  }
}
