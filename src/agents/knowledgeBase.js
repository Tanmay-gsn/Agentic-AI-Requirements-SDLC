/**
 * Enterprise & Regulatory Knowledge Base
 * Supporting Financial, Healthcare, and Mission-Critical Engineering
 */

export const REGULATORY_STANDARDS = {
  PCI_DSS: {
    name: 'PCI-DSS v4.0 (Payment Card Industry Data Security Standard)',
    jurisdiction: 'Global / Payment Systems',
    criticalRequirements: [
      'Encryption of cardholder data at rest and in transit (Requirement 3 & 4)',
      'Role-based access control and least-privilege enforcement (Requirement 7)',
      'Multi-factor authentication (MFA) for administrative and remote access (Requirement 8.3)',
      'Immutable audit logs retaining transaction records for at least 12 months (Requirement 10)',
      'Continuous vulnerability management and automated DAST/SAST pipelines (Requirement 6 & 11)'
    ]
  },
  GDPR: {
    name: 'GDPR (General Data Protection Regulation)',
    jurisdiction: 'European Union / Global Applicability',
    criticalRequirements: [
      'Explicit user consent and purpose limitation for data collection (Article 6 & 7)',
      'Right to Erasure / Right to be Forgotten within 30 days (Article 17)',
      'Data Protection by Design and by Default (Article 25)',
      'Mandatory 72-hour breach notification to supervisory authorities (Article 33)',
      'PII anonymization and cryptographic pseudonymization'
    ]
  },
  RBI_CYBER: {
    name: 'RBI Cyber Security Framework for Banks',
    jurisdiction: 'India / Reserve Bank of India',
    criticalRequirements: [
      'Mandatory 2FA for all electronic fund transfers and digital banking access',
      'Continuous fraud monitoring and anomaly detection for unusual velocity/amounts',
      'Data localization: End-to-end payment data stored securely within domestic jurisdiction',
      'Real-time automated kill-switch for compromised accounts or suspicious transactions',
      'Board-approved cyber crisis management plan (CCMP) and independent cyber audits'
    ]
  },
  HIPAA: {
    name: 'HIPAA Security & Privacy Rules',
    jurisdiction: 'United States / Healthcare',
    criticalRequirements: [
      'Protection of Protected Health Information (PHI) at rest with AES-256',
      'Role-based medical staff authorization with emergency break-glass procedure',
      'Complete audit trail of all medical record views, edits, and transfers'
    ]
  },
  ISO_27001: {
    name: 'ISO/IEC 27001:2022 ISMS',
    jurisdiction: 'International Standard',
    criticalRequirements: [
      'Information security risk assessment and treatment methodology',
      'Secure development lifecycle policy and secure coding guidelines',
      'Segregation of production and non-production environments'
    ]
  }
};

export const SDLC_MODELS_INFO = {
  'Agile-DevSecOps Hybrid': {
    name: 'Agile–DevSecOps Hybrid Model',
    shortDescription: 'Combines iterative sprint velocity with continuous automated security scanning, compliance policy-as-code, and fast feedback loops.',
    bestFor: 'High regulatory & security sensitivity combined with rapidly changing business requirements and frequent feature releases.',
    keyStrengths: [
      'Shift-left security (SAST/DAST/Secret scanning in CI/CD pipeline)',
      'Continuous compliance verification without slowing sprint cadence',
      'Rapid adaptation to market feedback and regulatory amendments',
      'Integrated cross-functional pods (Product, Security, Compliance, Dev, QA)'
    ],
    challenges: [
      'Requires mature automated testing infrastructure and CI/CD tooling',
      'Needs dedicated DevSecOps culture and cross-skilled engineers'
    ]
  },
  'DevSecOps': {
    name: 'Pure DevSecOps Model',
    shortDescription: 'Security-as-Code driven continuous integration and continuous deployment with automated compliance gates.',
    bestFor: 'Cloud-native services, microservices architectures, high-frequency continuous deployment with strict automated security.',
    keyStrengths: [
      'Automated pipeline gating and zero-touch security checks',
      'High release frequency with instant rollbacks and canary deployments',
      'Real-time runtime observability and threat detection'
    ],
    challenges: [
      'Heavy reliance on pipeline automation; requires comprehensive automated test suites'
    ]
  },
  'V-Model': {
    name: 'V-Model (Verification & Validation)',
    shortDescription: 'Disciplined sequential model where each development stage maps strictly to a corresponding testing and verification phase.',
    bestFor: 'High-assurance systems, mission-critical banking cores, regulatory systems with fixed specifications and strict audit verification.',
    keyStrengths: [
      'Rigorous verification and validation at every abstraction tier',
      'Clear traceability from User Requirements to Acceptance Testing',
      'Defects detected early before code reaches subsequent stages'
    ],
    challenges: [
      'Inflexible to mid-project requirement shifts',
      'Working software delivered late in the cycle'
    ]
  },
  'Agile (Scrum / Kanban)': {
    name: 'Agile (Scrum / Feature-Driven)',
    shortDescription: 'Iterative, collaborative framework emphasizing short sprint cycles, working software, and responsive stakeholder collaboration.',
    bestFor: 'Rapid prototyping, consumer-facing MVPs, greenfield applications with evolving product-market fit.',
    keyStrengths: [
      'High adaptability to evolving customer preferences',
      'Frequent incremental delivery of working features',
      'Direct, continuous stakeholder engagement'
    ],
    challenges: [
      'May lack formal compliance documentation if governance is not explicitly enforced'
    ]
  },
  'Spiral Model': {
    name: 'Spiral Model (Risk-Driven)',
    shortDescription: 'Risk-driven iterative model emphasizing repetitive cycles of risk assessment, prototyping, evaluation, and phased engineering.',
    bestFor: 'Complex, novel systems with high technological uncertainty, large research components, or unproven algorithms.',
    keyStrengths: [
      'Explicit risk analysis and risk mitigation in every loop',
      'Realistic budgeting through progressive prototyping',
      'Early elimination of fatal technical blockers'
    ],
    challenges: [
      'High management overhead; requires seasoned risk assessment expertise'
    ]
  },
  'Waterfall': {
    name: 'Traditional Waterfall Model',
    shortDescription: 'Linear sequential life cycle where each phase (Requirements, Design, Implementation, Verification, Maintenance) is completed sequentially.',
    bestFor: 'Projects with completely finalized, non-negotiable specifications, legacy core banking batch systems, or fixed-price rigid contracts.',
    keyStrengths: [
      'Crystal-clear milestones, sign-offs, and exhaustive documentation',
      'Easy to manage with predictable timeline and resource allocation'
    ],
    challenges: [
      'Extremely costly to accommodate changes once implementation begins',
      'High risk of late surprise defects during integration'
    ]
  }
};
