/**
 * Hospital & Healthcare Case Studies + 6 SDLC Deterministic Rule Scenarios
 */

export const HOSPITAL_PRESETS = [
  {
    id: 'hospital_ehr_cds',
    title: 'Multi-Hospital EHR & Clinical Decision Support System',
    category: 'Core Clinical / EHR',
    defaultRole: 'cmo',
    scenarioDescription: `Develop a unified Electronic Health Records (EHR) and Clinical Decision Support platform for a multi-specialty hospital network. Physicians and nurses must record patient histories, vitals, allergies, diagnoses, and orders in real time, with automated drug-to-drug interaction alerts and ABHA/HL7 FHIR R4 interoperability across departments. The system faces high regulation (HIPAA, NABH 5th Edition, DPDP Act) and evolving clinical requirements as new specialties and national health directives are added. All ePHI must be encrypted (AES-256 / TLS 1.3), enforce RBAC with emergency break-glass access, and maintain immutable audit logs.`,
    tags: ['EHR', 'HIPAA & NABH', 'HL7 FHIR R4', 'Break-Glass RBAC'],
    defaultFactors: {
      requirementStability: 55,
      changeFrequency: 72,
      regulatoryCriticality: 96,
      securityRisk: 95,
      technicalUncertainty: 48,
      failureConsequence: 92,
      continuousDeploymentNeed: 82,
      formalVerificationNeed: 84
    }
  },
  {
    id: 'icu_triage_monitoring',
    title: 'Emergency Department (ED) Triage & ICU Vitals Monitoring',
    category: 'Critical Care / Safety-Critical',
    defaultRole: 'nursing',
    scenarioDescription: `Build an Emergency Department (ED) triage and ICU bedside patient monitoring system integrating with hospital ventilators, infusion pumps, and telemetry monitors. The platform must stream real-time heart rate, SpO2, and blood pressure telemetry, trigger sub-second critical deterioration alerts to ICU nurses, and enforce strict verification/validation under IEC 62304 safety standards. Require 99.99% uptime with zero data loss failover, formal traceability from clinical safety requirements to verification tests, and mandatory clinician sign-off on automated early-warning scores.`,
    tags: ['ICU Safety', 'IEC 62304', 'Strict V&V', '99.99% Uptime'],
    defaultFactors: {
      requirementStability: 82,
      changeFrequency: 28,
      regulatoryCriticality: 98,
      securityRisk: 90,
      technicalUncertainty: 45,
      failureConsequence: 99,
      continuousDeploymentNeed: 40,
      formalVerificationNeed: 97
    }
  },
  {
    id: 'hospital_telemedicine_erx',
    title: 'Hospital Telemedicine & e-Prescription (e-Rx) Network',
    category: 'Telehealth / Pharmacy',
    defaultRole: 'patient_rep',
    scenarioDescription: `Design a secure hospital telemedicine and electronic prescription (e-Rx) platform connecting outpatients, specialist doctors, and the hospital pharmacy. Patients book encrypted video consultations, share prior lab reports, and receive digitally signed prescriptions with two-factor clinician verification (DEA EPCS / NABH medication safety). The cloud-native microservices backend requires continuous secure deployment with automated SAST/DAST scanning, HIPAA/ABDM consent management, and fast user-friendly mobile access.`,
    tags: ['Telemedicine', 'e-Rx 2FA', 'DevSecOps', 'ABDM Consent'],
    defaultFactors: {
      requirementStability: 52,
      changeFrequency: 76,
      regulatoryCriticality: 88,
      securityRisk: 92,
      technicalUncertainty: 40,
      failureConsequence: 84,
      continuousDeploymentNeed: 94,
      formalVerificationNeed: 74
    }
  },
  {
    id: 'hospital_lis_pacs',
    title: 'Diagnostic Lab (LIS) & Radiology Imaging (PACS) Portal',
    category: 'Diagnostics / Interoperability',
    defaultRole: 'lab_pharmacy',
    scenarioDescription: `Implement a Hospital Laboratory Information System (LIS) and Radiology PACS portal that ingests automated analyzer results via HL7 FHIR and DICOM medical images. Pathologists must review and digitally sign critical abnormal lab values before they become visible on the patient portal, while triggering instant escalation alerts to attending physicians. The system must protect PHI with strict role-based access control, maintain 7-year regulatory retention, and support seamless integration with legacy hospital management software.`,
    tags: ['HL7 FHIR', 'DICOM PACS', 'Critical Lab Alerts', 'Legacy HMS'],
    defaultFactors: {
      requirementStability: 74,
      changeFrequency: 44,
      regulatoryCriticality: 90,
      securityRisk: 88,
      technicalUncertainty: 52,
      failureConsequence: 88,
      continuousDeploymentNeed: 64,
      formalVerificationNeed: 86
    }
  },
  {
    id: 'hospital_billing_claims',
    title: 'Hospital Billing, Insurance Claims & Pharmacy Inventory',
    category: 'Hospital Operations / Finance',
    defaultRole: 'compliance',
    scenarioDescription: `Create an integrated Hospital Billing, Cashless Insurance Pre-Authorization (TPA/FHIR Claims), and Pharmacy Inventory module. It must automate ICD-10 diagnostic coding validation, verify patient insurance eligibility in real time, track controlled narcotics stock with batch expiry alerts, and generate itemized GST/statutory hospital invoices. Requires tamper-evident financial and clinical audit trails, PCI/HIPAA data protection, and automated fraud/duplicate-claim checks.`,
    tags: ['Insurance Claims', 'ICD-10', 'Pharmacy Stock', 'Audit Trails'],
    defaultFactors: {
      requirementStability: 68,
      changeFrequency: 58,
      regulatoryCriticality: 92,
      securityRisk: 90,
      technicalUncertainty: 38,
      failureConsequence: 82,
      continuousDeploymentNeed: 74,
      formalVerificationNeed: 80
    }
  }
];

export const HOSPITAL_SDLC_EXAMPLES = [
  {
    label: 'Waterfall: Statutory Reporting',
    title: 'Hospital Statutory Reporting (Stable + Approvals → Waterfall)',
    scenario: 'A hospital statutory health ministry reporting module with stable requirements and extensive approvals from medical directors, legal teams, and national accreditation boards before development begins.'
  },
  {
    label: 'V-Model: ICU Ventilator V&V',
    title: 'ICU Ventilator Software (Strict V&V → V-Model)',
    scenario: 'An ICU medical ventilator and infusion pump control software module requiring strict verification/validation, formal IEC 62304 traceability, and life-critical clinical audit gates.'
  },
  {
    label: 'Spiral: AI Sepsis R&D',
    title: 'AI Sepsis Early-Warning R&D (High Uncertainty → Spiral)',
    scenario: 'An experimental hospital clinical research platform using novel AI models for early sepsis prediction with high uncertainty and technical risk across heterogeneous ICU sensor hardware.'
  },
  {
    label: 'Agile: Outpatient Feedback',
    title: 'Outpatient Feedback & Queue App (Changing Reqs → Agile)',
    scenario: 'A hospital outpatient queue tracker and patient satisfaction mobile app with frequently changing requirements, bi-weekly UX experiments, and evolving clinic workflow feedback.'
  },
  {
    label: 'DevSecOps: Cloud Telehealth',
    title: 'Cloud Telehealth Microservices (Secure Deploy → DevSecOps)',
    scenario: 'A cloud-native hospital telemedicine microservices platform requiring continuous secure deployment, automated SAST/DAST security gates in CI/CD, and zero-downtime canary rollouts.'
  },
  {
    label: 'Hybrid: Regulated EHR',
    title: 'Multi-Hospital EHR (High Regulation + Evolving → Hybrid)',
    scenario: 'A multi-hospital EHR and digital patient onboarding system subject to high regulation (HIPAA, NABH, ABDM) and evolving requirements as new clinical departments and compliance rules roll out.'
  }
];
