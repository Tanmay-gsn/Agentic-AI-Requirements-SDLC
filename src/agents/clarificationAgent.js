/**
 * Adaptive Clarification & Interview Agent
 * Detects missing dimensions or ambiguities in user input,
 * generating context-aware follow-up questions to refine requirements.
 */

export class ClarificationAgent {
  constructor() {
    this.name = 'Adaptive Clarification & Interview Agent';
  }

  generateClarifications(scenarioText, _domain) {
    const textLower = scenarioText.toLowerCase();
    const questions = [];

    // 1. Throughput & Scalability
    if (!textLower.includes('tps') && !textLower.includes('users') && !textLower.includes('load')) {
      questions.push({
        id: 'clarif_1',
        topic: 'Peak Throughput & Scalability',
        question: 'What is the anticipated peak transaction throughput (TPS) and daily active user volume?',
        options: [
          'High Volume: 5,000 to 10,000+ Transactions Per Second (Continuous active-active scaling)',
          'Medium Volume: 500 to 2,000 TPS (Standard horizontal container autoscaling)',
          'Low/Internal Volume: Under 100 TPS (Batch/scheduled workflow)'
        ],
        impact: 'Defines architecture scalability tier, caching strategies, and database partitioning needs.'
      });
    }

    // 2. Regulatory Jurisdiction
    if (!textLower.includes('rbi') && !textLower.includes('gdpr') && !textLower.includes('pci') && !textLower.includes('hipaa')) {
      questions.push({
        id: 'clarif_2',
        topic: 'Regulatory Jurisdiction & Compliance Framework',
        question: 'Which primary regulatory framework governs this application deployment?',
        options: [
          'PCI-DSS v4.0 & Global Payment Directives (Zero unmasked PAN storage, HSM requirement)',
          'Central Bank / RBI Cyber Security Framework (Mandatory domestic data localization & 2FA)',
          'GDPR & European Privacy Directives (Explicit consent, 72-hour breach SLA, Right to Erasure)',
          'HIPAA / Healthcare Security Standards (Protected Health Information encryption & BAA)'
        ],
        impact: 'Enforces statutory compliance gates and non-functional security criteria.'
      });
    }

    // 3. Fallback & Disaster Recovery
    if (!textLower.includes('rto') && !textLower.includes('failover') && !textLower.includes('disaster')) {
      questions.push({
        id: 'clarif_3',
        topic: 'Disaster Recovery & Data Loss Tolerance',
        question: 'What are the required Recovery Time Objective (RTO) and Recovery Point Objective (RPO)?',
        options: [
          'Zero Data Loss Mission Critical: RPO = 0, RTO < 5 minutes (Synchronous cross-region replication)',
          'Enterprise Standard: RPO < 15 minutes, RTO < 1 hour (Automated snapshot warm failover)',
          'Standard Batch: RPO < 24 hours, RTO < 4 hours (Nightly cold backups)'
        ],
        impact: 'Directly dictates infrastructure budget, distributed database topology, and DR automated drills.'
      });
    }

    // 4. Release Frequency & Delivery Cadence
    questions.push({
      id: 'clarif_4',
      topic: 'Deployment Cadence & Release Model',
      question: 'How frequently is this module or functionality expected to be updated in production?',
      options: [
        'Continuous / Bi-weekly Sprints: Fast continuous delivery with automated canary deployments',
        'Monthly Staged Releases: Strict regression and compliance audit sign-offs before release',
        'Quarterly / Annual Formal Releases: Heavy formal verification with frozen baselines'
      ],
      impact: 'Crucial input for SDLC Selection between DevSecOps Hybrid vs. V-Model.'
    });

    return questions;
  }
}
