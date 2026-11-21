/**
 * Adaptive Clarification & Hospital Interview Agent
 * Detects missing clinical, regulatory, interoperability, and operational dimensions
 * and generates context-aware follow-up questions that feed back into RE & SDLC scoring.
 */

export class ClarificationAgent {
  constructor() {
    this.name = 'Adaptive Clarification & Interview Agent';
  }

  generateClarifications(scenarioText, stakeholderRole = 'cmo') {
    const textLower = (scenarioText || '').toLowerCase();
    const questions = [];

    // 1. Hospital Scale & Clinical Concurrency
    if (!textLower.includes('beds') && !textLower.includes('concurrent') && !textLower.includes('tps') && !textLower.includes('patients per day')) {
      questions.push({
        id: 'hospital_scale',
        topic: 'Hospital Scale & Peak Clinical Concurrency',
        question: 'What is the hospital bed capacity and expected peak concurrent clinicians/patients?',
        options: [
          'Multi-Hospital Network (1,000+ beds, 5,000+ concurrent clinical/patient sessions)',
          'Mid-Size Multi-Specialty Hospital (200–500 beds, 500–1,500 concurrent users)',
          'Single Clinic / Specialty Center (< 100 beds, < 200 concurrent users)'
        ],
        impact: 'Determines horizontal scalability, database partitioning, and load-testing NFRs.'
      });
    }

    // 2. Primary Healthcare Regulatory Jurisdiction
    if (!textLower.includes('hipaa') && !textLower.includes('nabh') && !textLower.includes('abdm') && !textLower.includes('iec 62304')) {
      questions.push({
        id: 'regulatory_regime',
        topic: 'Healthcare Regulatory Jurisdiction',
        question: 'Which primary healthcare compliance and accreditation standards govern this hospital deployment?',
        options: [
          'India: NABH 5th Edition + ABDM / DPDP Act 2023 (ABHA linkage & domestic consent artifacts)',
          'Global / US: HIPAA Security & Privacy Rules + HITECH (ePHI encryption & 6-year audit logs)',
          'Medical Device / Critical Care: IEC 62304 + FDA 21 CFR Part 11 (Formal V&V traceability)'
        ],
        impact: 'Selects mandatory compliance gates, retention periods, and regulatory traceability.'
      });
    }

    // 3. Clinical Downtime Tolerance (RTO / RPO)
    if (!textLower.includes('rto') && !textLower.includes('rpo') && !textLower.includes('failover')) {
      questions.push({
        id: 'clinical_dr',
        topic: 'Clinical Downtime Tolerance (RTO / RPO)',
        question: 'What is the maximum acceptable downtime during an emergency or ICU clinical workflow?',
        options: [
          'Life-Critical Zero-Data-Loss: RPO = 0, RTO < 5 min (Active-active failover + offline ward cache)',
          'High-Availability Clinical: RPO < 15 min, RTO < 30 min (Warm standby failover)',
          'Standard Administrative: RPO < 24 hours, RTO < 4 hours (Daily encrypted backups)'
        ],
        impact: 'Directly sets availability NFRs and increases Failure Consequence weight in SDLC scoring.'
      });
    }

    // 4. Interoperability with Existing Hospital Systems
    if (!textLower.includes('hl7') && !textLower.includes('fhir') && !textLower.includes('dicom')) {
      questions.push({
        id: 'interoperability',
        topic: 'Clinical Interoperability & Legacy HMS Integration',
        question: 'Does this module need to integrate with existing hospital EHR, Lab (LIS), or Radiology (PACS) systems?',
        options: [
          'Full HL7 FHIR R4 + DICOM bi-directional integration with legacy HMS & external labs',
          'REST API integration with internal hospital EHR and billing database only',
          'Standalone greenfield module with CSV/PDF export only'
        ],
        impact: 'Adds HL7 FHIR/DICOM interface requirements and integration testing gates.'
      });
    }

    // 5. Release Cadence & Change Frequency
    questions.push({
      id: 'release_cadence',
      topic: 'Clinical Release Cadence & Governance',
      question: `From the ${stakeholderRole.toUpperCase()} perspective, how often will clinical workflows or compliance rules change?`,
      options: [
        'Frequent / Evolving: Bi-weekly sprints with automated CI/CD security & compliance checks',
        'Controlled Staged Releases: Monthly/Quarterly releases with formal clinical UAT sign-off',
        'Frozen / Rigorous Baseline: Annual validated releases with exhaustive upfront approvals'
      ],
      impact: 'Key decision driver between Agile–DevSecOps Hybrid, V-Model, and Waterfall.'
    });

    return questions;
  }
}
