/**
 * Versioned Healthcare & Hospital Regulatory Knowledge Base + Local RAG Retriever
 * Every knowledge item includes source ID, version, jurisdiction, effective date, and clauses
 * for citation-grounded requirement generation.
 */

export const STAKEHOLDER_ROLES = [
  {
    id: 'cmo',
    label: 'Chief Medical Officer / Clinician',
    focus: 'Clinical safety, diagnostic accuracy, triage speed, drug-interaction alerts, and minimal clinician burnout.'
  },
  {
    id: 'compliance',
    label: 'HIPAA / NABH Compliance Officer',
    focus: 'ePHI encryption, patient consent, audit logs, break-glass tracking, and statutory accreditation.'
  },
  {
    id: 'it_architect',
    label: 'Hospital IT & Security Architect',
    focus: 'HL7 FHIR/DICOM interoperability, zero-downtime HA/DR, RBAC/MFA, and CI/CD security gates.'
  },
  {
    id: 'nursing',
    label: 'Nursing Supervisor & Ward Operations',
    focus: 'Bed/ICU handovers, real-time vitals dashboards, medication administration (eMAR), and shift workflows.'
  },
  {
    id: 'lab_pharmacy',
    label: 'Lab & Pharmacy Operations Lead',
    focus: 'Specimen tracking, critical lab value escalation, e-prescription validation, and controlled drug inventory.'
  },
  {
    id: 'patient_rep',
    label: 'Patient Representative / OPD Coordinator',
    focus: 'Appointment booking, transparent billing, accessible patient portals, and digital health record consent.'
  }
];

export const HOSPITAL_KNOWLEDGE_BASE = [
  {
    id: 'KB-HIPAA-01',
    standard: 'HIPAA Security Rule',
    clause: '45 CFR §164.312(a)(2)(iv) & (e)(1)',
    version: '2024.1',
    jurisdiction: 'US / Global Healthcare Benchmark',
    effectiveDate: '2024-01-01',
    category: 'Security & Encryption',
    title: 'ePHI Encryption at Rest and in Transit',
    requirement: 'All Electronic Protected Health Information (ePHI) must be encrypted using AES-256 at rest and TLS 1.3 in transit, with HSM-backed key rotation and zero unmasked PHI in application logs.',
    keywords: ['ehr', 'emr', 'patient', 'phi', 'record', 'records', 'hospital', 'telemedicine', 'prescription', 'lab', 'billing', 'encryption', 'security', 'privacy', 'hipaa']
  },
  {
    id: 'KB-HIPAA-02',
    standard: 'HIPAA Security Rule',
    clause: '45 CFR §164.312(a)(2)(ii) & (b)',
    version: '2024.1',
    jurisdiction: 'US / Global Healthcare Benchmark',
    effectiveDate: '2024-01-01',
    category: 'Access Control & Auditability',
    title: 'RBAC, Emergency Break-Glass Access & Immutable Audit Controls',
    requirement: 'Enforce role-based access control (RBAC) with unique clinician IDs, mandatory emergency break-glass access for ICU/ER overrides, and append-only audit trails logging every ePHI view, edit, and export for 6+ years.',
    keywords: ['rbac', 'access', 'audit', 'log', 'icu', 'emergency', 'triage', 'break-glass', 'doctor', 'nurse', 'patient', 'ehr', 'hospital', 'security']
  },
  {
    id: 'KB-NABH-01',
    standard: 'NABH 5th Edition Hospital Accreditation',
    clause: 'MOM.4 & IMS.3 (Medication & Clinical Records)',
    version: '5th Ed.',
    jurisdiction: 'India (National Accreditation Board for Hospitals)',
    effectiveDate: '2023-04-01',
    category: 'Clinical Safety & Compliance',
    title: 'Medication Safety, Allergy Alerts & Standardized Clinical Documentation',
    requirement: 'Clinical modules must display prominent patient allergy flags, run automated drug-to-drug interaction checks before e-prescription sign-off, and maintain timestamped clinical notes with clinician attribution.',
    keywords: ['prescription', 'pharmacy', 'medication', 'drug', 'allergy', 'doctor', 'ehr', 'clinical', 'nabh', 'hospital', 'safety', 'patient', 'ward']
  },
  {
    id: 'KB-ABDM-01',
    standard: 'ABDM & India DPDP Act 2023',
    clause: 'ABDM HIE-CM Spec & DPDP Sec. 6-8',
    version: '2024.2',
    jurisdiction: 'India (National Health Authority)',
    effectiveDate: '2024-03-15',
    category: 'Privacy & Consent',
    title: 'ABHA Health ID Linkage & Explicit Consent Artifact Management',
    requirement: 'Support ABHA (Ayushman Bharat Health Account) patient linking, capture granular, revocable digital consent artifacts before sharing health records across facilities, and support breach reporting.',
    keywords: ['abdm', 'abha', 'consent', 'privacy', 'dpdp', 'india', 'hospital', 'patient', 'portal', 'telemedicine', 'records', 'ehr', 'sharing', 'opd']
  },
  {
    id: 'KB-FHIR-01',
    standard: 'HL7 FHIR R4 & DICOM Interoperability',
    clause: 'HL7 FHIR R4 Core Profiles / DICOM PS3',
    version: 'R4 (4.0.1)',
    jurisdiction: 'International Healthcare Interoperability',
    effectiveDate: '2023-01-01',
    category: 'Interoperability',
    title: 'Standardized Clinical Data Exchange (EHR, Lab LIS, Radiology PACS)',
    requirement: 'Expose HL7 FHIR R4 RESTful APIs for Patient, Observation, DiagnosticReport, MedicationRequest, and Claim resources, and support DICOM ingestion for radiology imaging.',
    keywords: ['hl7', 'fhir', 'dicom', 'lab', 'laboratory', 'radiology', 'pacs', 'lis', 'ehr', 'integration', 'api', 'insurance', 'claims', 'billing', 'interoperability']
  },
  {
    id: 'KB-EPCS-01',
    standard: 'DEA EPCS / Electronic Prescribing Standard',
    clause: '21 CFR Part 1311 (Controlled Substances)',
    version: '2023.1',
    jurisdiction: 'US / Clinical Best Practice',
    effectiveDate: '2023-06-01',
    category: 'Security & Clinical Compliance',
    title: 'Two-Factor Cryptographic Signing for Electronic Prescriptions',
    requirement: 'Electronic prescriptions—especially for controlled narcotics—require two-factor clinician authentication, cryptographic digital signatures, and tamper-evident transmission to verified pharmacies.',
    keywords: ['prescription', 'prescriptions', 'e-rx', 'pharmacy', 'telemedicine', 'telehealth', 'controlled', 'doctor', 'physician', 'signature', 'mfa', '2fa']
  },
  {
    id: 'KB-IEC62304-01',
    standard: 'IEC 62304 & FDA 21 CFR Part 11',
    clause: 'IEC 62304 Class C / 21 CFR §11.10',
    version: '2024.1',
    jurisdiction: 'International Medical Device Software',
    effectiveDate: '2024-01-01',
    category: 'Safety-Critical Verification',
    title: 'Formal Verification, Traceability & Fail-Safe Clinical Monitoring',
    requirement: 'Life-critical software interfacing with ICU ventilators, infusion pumps, or AI clinical decision support requires bilateral V&V traceability, deterministic fail-safe alerts, and human clinician sign-off.',
    keywords: ['icu', 'ventilator', 'infusion', 'pump', 'device', 'firmware', 'safety', 'verification', 'validation', 'sepsis', 'monitoring', 'vitals', 'critical', 'ai', 'ml', 'triage']
  },
  {
    id: 'KB-ISO25010-01',
    standard: 'ISO/IEC 25010 & Hospital Availability Baseline',
    clause: 'ISO 25010 Reliability & Performance Efficiency',
    version: '2023',
    jurisdiction: 'International Engineering Standard',
    effectiveDate: '2023-11-01',
    category: 'Availability & Performance',
    title: 'Clinical High Availability (99.95%+) & Low-Latency Alerting',
    requirement: 'Mission-critical clinical systems must achieve >= 99.95% uptime with automated failover (RTO < 5 min for ICU/ER), sub-second clinical chart retrieval, and graceful offline continuity.',
    keywords: ['uptime', 'availability', 'failover', 'latency', 'performance', 'icu', 'emergency', 'triage', 'monitoring', 'real-time', 'hospital', 'cloud', 'microservices']
  }
];

/**
 * Local RAG Retriever: Scores knowledge base items against query text and returns top-K grounded citations
 */
export function retrieveHealthcareContext(queryText, clarificationAnswers = {}, topK = 5) {
  const combined = [
    queryText || '',
    ...Object.values(clarificationAnswers || {})
  ].join(' ').toLowerCase();

  const tokens = new Set(combined.match(/[a-z0-9-]+/g) || []);

  const scored = HOSPITAL_KNOWLEDGE_BASE.map((item) => {
    let hits = 0;
    const matchedTerms = [];

    for (const kw of item.keywords) {
      if (tokens.has(kw) || combined.includes(kw)) {
        hits += kw.length > 4 ? 2 : 1;
        matchedTerms.push(kw);
      }
    }

    // Baseline boost for universal HIPAA/NABH hospital rules
    const baseScore = item.id === 'KB-HIPAA-01' || item.id === 'KB-HIPAA-02' ? 2 : 0;
    const rawScore = hits + baseScore;
    const confidence = Math.min(0.98, Number((0.68 + Math.min(rawScore, 15) * 0.02).toFixed(2)));

    return {
      ...item,
      rawScore,
      confidence,
      matchedTerms: [...new Set(matchedTerms)].slice(0, 5),
      citation: `[${item.id} | ${item.standard} ${item.clause} (${item.version})]`
    };
  });

  return scored
    .filter((item) => item.rawScore > 0)
    .sort((a, b) => b.rawScore - a.rawScore)
    .slice(0, topK);
}
