/**
 * Agent 2: SDLC Selection Agent
 * Evaluates the identified software requirements and selects the most
 * suitable Software Development Life Cycle (SDLC) model with rationale and phases.
 */

export class SdlcAgent {
  constructor() {
    this.name = 'SDLC Selection Agent';
  }

  /**
   * Identifies the most suitable SDLC model for the given specification
   * @param {string} scenario 
   * @param {object} requirementData Output from Agent 1
   * @returns {object} Recommended SDLC, justification, phases, and alternative comparison
   */
  identifySDLC(scenario, requirementData) {
    const text = scenario.toLowerCase();
    const { functionalRequirements = [], nonFunctionalRequirements = [] } = requirementData;

    const allReqsText = [
      scenario,
      ...functionalRequirements.map(f => f.title + ' ' + f.description),
      ...nonFunctionalRequirements.map(n => n.category + ' ' + n.description)
    ].join(' ').toLowerCase();

    // Characteristics evaluation
    const isHighSecurityOrRegulated = allReqsText.includes('pci-dss') || allReqsText.includes('hipaa') || allReqsText.includes('bank') || allReqsText.includes('gdpr') || allReqsText.includes('fraud');
    const isSafetyCriticalOrFixed = allReqsText.includes('critical') || allReqsText.includes('compliance') || allReqsText.includes('audit');
    const isRapidOrConsumer = allReqsText.includes('ecommerce') || allReqsText.includes('cart') || allReqsText.includes('shop') || allReqsText.includes('student');
    const isHighUncertainty = allReqsText.includes('research') || allReqsText.includes('experimental') || allReqsText.includes('prototype');

    let recommendedModel = 'Agile (Scrum)';
    let justification = '';
    let suitabilityScore = '92%';
    let keyPhases = [];
    let prosAndCons = { pros: [], cons: [] };
    let alternatives = [];

    if (isHighSecurityOrRegulated) {
      recommendedModel = 'DevSecOps (or Agile-DevSecOps Hybrid)';
      suitabilityScore = '95%';
      justification = 'The specification involves critical security, strict privacy/financial regulations, and continuous threat mitigation. DevSecOps embeds automated security checks (SAST, DAST, secret scanning) directly into fast iterative sprint pipelines, ensuring compliance without slowing delivery.';
      keyPhases = [
        { phase: 'Phase 1: Inception & Threat Modeling', description: 'Define user stories, identify security controls, and conduct STRIDE threat modeling.' },
        { phase: 'Phase 2: Secure Sprint Development', description: 'Two-week development sprints with pre-commit security linters and unit test suites.' },
        { phase: 'Phase 3: Automated CI/CD & Security Gates', description: 'Automated build pipeline executing SAST, dependency vulnerability checks, and container scanning.' },
        { phase: 'Phase 4: Verification, Pen-Testing & Compliance Audit', description: 'End-to-end integration testing, independent penetration testing, and regulatory compliance sign-off.' },
        { phase: 'Phase 5: Continuous Monitoring & Telemetry', description: 'Production deployment with real-time audit logging, WAF, and runtime intrusion detection.' }
      ];
      prosAndCons = {
        pros: ['Security is treated as code from day 1', 'Early defect detection reduces costly rework', 'Continuous compliance audit readiness'],
        cons: ['Requires automated testing infrastructure and CI/CD tools']
      };
      alternatives = [
        { name: 'V-Model', suitability: '82%', note: 'Excellent for formal verification, but rigid against evolving business requirements.' },
        { name: 'Traditional Waterfall', suitability: '50%', note: 'Too slow and inflexible for modern cloud and regulated financial services.' }
      ];
    } else if (isHighUncertainty) {
      recommendedModel = 'Spiral Model';
      suitabilityScore = '88%';
      justification = 'The project entails significant technical or algorithmic uncertainty. The Spiral model is risk-driven, focusing on progressive prototypes, risk assessment cycles, and iterative refinement.';
      keyPhases = [
        { phase: 'Phase 1: Determine Objectives & Constraints', description: 'Identify project goals, constraints, and alternative approaches.' },
        { phase: 'Phase 2: Risk Analysis & Prototyping', description: 'Evaluate technical risks and construct experimental prototypes.' },
        { phase: 'Phase 3: Core Engineering & Testing', description: 'Develop the validated architecture and execute thorough testing.' },
        { phase: 'Phase 4: Review & Next Phase Planning', description: 'Stakeholder evaluation and planning for the subsequent evolutionary spiral.' }
      ];
      prosAndCons = {
        pros: ['Exceptional risk mitigation and early blocker discovery', 'Realistic estimations via prototype iteration'],
        cons: ['High management overhead; requires seasoned risk analysis expertise']
      };
      alternatives = [
        { name: 'Agile (Scrum)', suitability: '75%', note: 'Can adapt quickly, but may struggle without explicit early risk resolution.' }
      ];
    } else {
      // Standard / Agile
      recommendedModel = 'Agile (Scrum)';
      suitabilityScore = '91%';
      justification = 'The requirements are feature-focused, iterative, and benefit from frequent stakeholder feedback. Scrum enables delivering working software in short 2-week sprints, accommodating evolving customer needs and rapid time-to-market.';
      keyPhases = [
        { phase: 'Phase 1: Product Backlog Elicitation', description: 'Break down identified requirements into prioritized user stories and acceptance criteria.' },
        { phase: 'Phase 2: Sprint Planning & Execution', description: '2-week iterative sprints implementing functional components.' },
        { phase: 'Phase 3: Continuous Integration & Automated Testing', description: 'Automated unit, integration, and UI testing on every pull request.' },
        { phase: 'Phase 4: Sprint Review & Retrospective', description: 'Demo working features to stakeholders and adapt the backlog based on feedback.' },
        { phase: 'Phase 5: Release & Iterative Deployment', description: 'Deploy releasable increments and gather live user telemetry.' }
      ];
      prosAndCons = {
        pros: ['Rapid time-to-market with incremental working software', 'High adaptability to changing user preferences', 'Transparent stakeholder collaboration'],
        cons: ['Scope creep risk if sprint backlogs are not strictly managed']
      };
      alternatives = [
        { name: 'Waterfall', suitability: '60%', note: 'Strict sequential phases with heavy documentation, but high cost of mid-project changes.' },
        { name: 'Kanban', suitability: '84%', note: 'Continuous flow alternative, good for continuous support and maintenance teams.' }
      ];
    }

    return {
      recommendedModel,
      suitabilityScore,
      justification,
      keyPhases,
      prosAndCons,
      alternatives
    };
  }
}
