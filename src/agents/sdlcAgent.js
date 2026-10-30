/**
 * Agent 2: SDLC Selection Agent
 * Evaluates software requirements using Multi-Criteria Decision Analysis (MCDA)
 * to score and rank ALL lifecycle models (Waterfall, V-Model, Spiral, Agile, DevSecOps, Agile-DevSecOps Hybrid).
 */

import { validateScenario } from './requirementAgent.js';

export const SDLC_MODEL_DEFINITIONS = {
  WATERFALL: 'Waterfall',
  V_MODEL: 'V-Model',
  SPIRAL: 'Spiral Model',
  AGILE: 'Agile (Scrum)',
  DEVSECOPS: 'DevSecOps',
  AGILE_DEVSECOPS_HYBRID: 'Agile–DevSecOps Hybrid'
};

export class SdlcAgent {
  constructor() {
    this.name = 'SDLC Selection Agent';
  }

  /**
   * Evaluates requirements and selects SDLC models using MCDA scoring
   */
  evaluateSDLC(arg1, arg2, arg3) {
    return this._processSDLC(arg1, arg2, arg3);
  }

  /**
   * Consistent alias for identifySDLC
   */
  identifySDLC(arg1, arg2, arg3) {
    return this._processSDLC(arg1, arg2, arg3);
  }

  /**
   * Internal processor handling flexible signatures
   */
  _processSDLC(arg1, arg2, arg3) {
    let scenarioText = '';
    let requirementData = null;
    let customFactors = {};

    if (typeof arg1 === 'string') {
      scenarioText = arg1;
      if (arg2 && (arg2.functionalRequirements || arg2.nonFunctionalRequirements)) {
        requirementData = arg2;
        customFactors = arg3 || {};
      } else if (arg2 && typeof arg2 === 'object') {
        customFactors = arg2;
      }
    } else if (arg1 && typeof arg1 === 'object') {
      requirementData = arg1;
      scenarioText = requirementData.scenario || '';
      customFactors = arg2 || {};
    }

    // Validation check - reject invalid/non-software input (No Agile fallback!)
    if (scenarioText) {
      const validation = validateScenario(scenarioText);
      if (!validation.isValid) {
        throw new Error(`SDLC Evaluation rejected: ${validation.reason}`);
      }
    }

    if (!requirementData || (!requirementData.functionalRequirements?.length && !requirementData.nonFunctionalRequirements?.length)) {
      if (!scenarioText) {
        throw new Error('SDLC Evaluation rejected: Valid software requirements must be provided.');
      }
    }

    // 1. Resolve Factors (from customFactors or extract deterministically)
    const evaluatedFactors = this._extractFactors(scenarioText, requirementData, customFactors);

    // 2. Perform MCDA Scoring on all models
    const rankedRecommendations = this._performMCDA(scenarioText, requirementData, evaluatedFactors);

    // 3. Top recommended model
    const primaryModel = rankedRecommendations[0];

    // 4. Generate project workflow & key phases
    const projectWorkflow = this._generateWorkflowPhases(primaryModel.name, evaluatedFactors);
    const keyPhases = projectWorkflow.map(p => ({
      phase: `Phase ${p.phaseNumber}: ${p.phaseName}`,
      description: p.objective
    }));

    // 5. Alternatives (for backwards compatibility)
    const alternatives = rankedRecommendations.slice(1, 4).map(r => ({
      name: r.name,
      suitability: r.suitabilityScore,
      note: r.rationale
    }));

    return {
      recommendedModel: primaryModel.name,
      suitabilityScore: primaryModel.suitabilityScore,
      justification: primaryModel.rationale,
      primaryModel,
      rankedRecommendations,
      evaluatedFactors,
      keyPhases,
      projectWorkflow,
      alternatives
    };
  }

  /**
   * Deterministically extracts or normalizes the 8 MCDA factors (0 to 100)
   */
  _extractFactors(scenarioText, requirementData, customFactors = {}) {
    const { functionalRequirements = [], nonFunctionalRequirements = [] } = requirementData || {};
    const fullText = [
      scenarioText || '',
      ...functionalRequirements.map(f => (f.title || '') + ' ' + (f.statement || f.description || '')),
      ...nonFunctionalRequirements.map(n => (n.title || '') + ' ' + (n.statement || n.description || ''))
    ].join(' ').toLowerCase();

    // Helper to clamp values
    const clamp = (val, min = 0, max = 100) => Math.min(Math.max(Math.round(val), min), max);

    // Default factors baseline
    let stability = 50;
    let changeFreq = 50;
    let regulatory = 35;
    let secRisk = 35;
    let techUncertainty = 30;
    let failConsequence = 45;
    let contDeploy = 40;
    let formalVerif = 40;

    // (A) Stability & Approvals vs. Change Frequency
    if (fullText.includes('stable requirements') || fullText.includes('fixed scope') || fullText.includes('extensive approvals') || fullText.includes('frozen') || fullText.includes('well-defined')) {
      stability = 92;
      changeFreq = 18;
      formalVerif += 25;
    }
    if (fullText.includes('frequently changing') || fullText.includes('evolving requirements') || fullText.includes('rapidly changing') || fullText.includes('fluid') || fullText.includes('sprints')) {
      changeFreq = 88;
      stability = 25;
    }

    // (B) Formal Verification & Validation
    if (fullText.includes('strict verification') || fullText.includes('verification/validation') || fullText.includes('v-model') || fullText.includes('formal verification') || fullText.includes('iso 26262') || fullText.includes('do-178')) {
      formalVerif = 95;
      failConsequence = Math.max(failConsequence, 85);
      stability = Math.max(stability, 65);
    }

    // (C) Technical Uncertainty & Research
    if (fullText.includes('uncertainty') || fullText.includes('technical risk') || fullText.includes('research') || fullText.includes('experimental') || fullText.includes('unproven') || fullText.includes('novel')) {
      techUncertainty = 92;
      failConsequence = Math.max(failConsequence, 80);
    }

    // (D) Regulatory Criticality
    if (fullText.includes('pci-dss') || fullText.includes('pci') || fullText.includes('hipaa') || fullText.includes('gdpr') || fullText.includes('rbi') || fullText.includes('fda') || fullText.includes('statutory') || fullText.includes('regulatory') || fullText.includes('high regulation')) {
      regulatory = 94;
      formalVerif = Math.max(formalVerif, 80);
    }

    // (E) Security Risk
    if (fullText.includes('security') || fullText.includes('fraud') || fullText.includes('encryption') || fullText.includes('payment') || fullText.includes('bank') || fullText.includes('vulnerability') || fullText.includes('secure')) {
      secRisk = 92;
    }

    // (F) Continuous Deployment
    if (fullText.includes('continuous deployment') || fullText.includes('continuous secure deployment') || fullText.includes('ci/cd') || fullText.includes('continuous delivery') || fullText.includes('canary') || fullText.includes('active-active')) {
      contDeploy = 95;
      secRisk = Math.max(secRisk, 75);
    }

    // (G) Failure Consequence
    if (fullText.includes('mission-critical') || fullText.includes('high availability') || fullText.includes('zero plain-text') || fullText.includes('failover') || fullText.includes('sub-50ms')) {
      failConsequence = 92;
    }

    // Override with customFactors if provided (supports aliases like complexity, continuousDeliveryNeed)
    return {
      requirementStability: customFactors.requirementStability !== undefined ? clamp(customFactors.requirementStability) : clamp(stability),
      changeFrequency: customFactors.changeFrequency !== undefined ? clamp(customFactors.changeFrequency) : clamp(changeFreq),
      regulatoryCriticality: customFactors.regulatoryCriticality !== undefined ? clamp(customFactors.regulatoryCriticality) : clamp(regulatory),
      securityRisk: customFactors.securityRisk !== undefined ? clamp(customFactors.securityRisk) : clamp(secRisk),
      technicalUncertainty: customFactors.technicalUncertainty !== undefined ? clamp(customFactors.technicalUncertainty) : (customFactors.complexity !== undefined ? clamp(customFactors.complexity) : clamp(techUncertainty)),
      failureConsequence: customFactors.failureConsequence !== undefined ? clamp(customFactors.failureConsequence) : clamp(failConsequence),
      continuousDeploymentNeed: customFactors.continuousDeploymentNeed !== undefined ? clamp(customFactors.continuousDeploymentNeed) : (customFactors.continuousDeliveryNeed !== undefined ? clamp(customFactors.continuousDeliveryNeed) : clamp(contDeploy)),
      formalVerificationNeed: customFactors.formalVerificationNeed !== undefined ? clamp(customFactors.formalVerificationNeed) : clamp(formalVerif)
    };
  }

  /**
   * Multi-Criteria Decision Analysis (MCDA) Scoring Engine
   * Scores ALL 6 candidate models and applies deterministic specification rules
   */
  _performMCDA(scenarioText, requirementData, factors) {
    const textLower = (scenarioText || '').toLowerCase();
    const {
      requirementStability: stab,
      changeFrequency: chg,
      regulatoryCriticality: reg,
      securityRisk: sec,
      technicalUncertainty: unc,
      failureConsequence: fail,
      continuousDeploymentNeed: deploy,
      formalVerificationNeed: verif
    } = factors;

    // 1. Raw MCDA Utility Formulation for each model
    // Model A: Waterfall
    // High stability, low change frequency, high formal approval, low technical uncertainty
    let waterfallScore = (stab * 0.38) + (verif * 0.22) + ((100 - chg) * 0.25) + ((100 - unc) * 0.15);

    // Model B: V-Model
    // Strict verification and validation, high failure consequence, high regulatory criticality, moderate-high stability
    let vModelScore = (verif * 0.38) + (fail * 0.22) + (reg * 0.18) + (stab * 0.12) + ((100 - chg) * 0.10);

    // Model C: Spiral
    // High technical uncertainty, high failure consequence, progressive risk mitigation cycles
    let spiralScore = (unc * 0.44) + (fail * 0.24) + ((100 - stab) * 0.16) + (chg * 0.16);

    // Model D: Agile (Scrum)
    // Frequently changing requirements, low stability demand, moderate continuous delivery
    let agileScore = (chg * 0.42) + ((100 - stab) * 0.26) + (deploy * 0.20) + ((100 - verif) * 0.12);
    // Penalty if high regulatory & security without DevSecOps
    if (reg > 75 || sec > 75) {
      agileScore -= 15;
    }

    // Model E: DevSecOps
    // Continuous secure deployment, high security risk, high continuous delivery, moderate-high change frequency
    let devSecOpsScore = (deploy * 0.38) + (sec * 0.32) + (chg * 0.18) + ((100 - stab) * 0.12);

    // Model F: Agile-DevSecOps Hybrid
    // High regulation + evolving requirements, high security, continuous deployment and compliance gates
    let hybridScore = (reg * 0.28) + (sec * 0.24) + (chg * 0.22) + (deploy * 0.14) + (verif * 0.12);

    // 2. Deterministic Rule Matching for Specification Examples
    let triggeredRule = null;

    // Rule 1: Stable requirements + extensive approvals → Waterfall
    const isWaterfallRule = (textLower.includes('stable requirements') && (textLower.includes('approvals') || textLower.includes('extensive approvals'))) ||
      (stab >= 80 && chg <= 30 && verif >= 60);

    // Rule 2: Strict verification/validation → V-Model
    const isVModelRule = (textLower.includes('strict verification') || textLower.includes('verification/validation') || (textLower.includes('verification') && textLower.includes('validation'))) ||
      (verif >= 85 && fail >= 70 && unc < 70 && chg < 60);

    // Rule 3: High uncertainty/technical risk → Spiral
    const isSpiralRule = (textLower.includes('high uncertainty') || textLower.includes('technical risk') || (textLower.includes('uncertainty') && textLower.includes('risk'))) ||
      (unc >= 75);

    // Rule 4: High regulation + evolving requirements → Agile–V-Model/DevSecOps hybrid
    const isHybridRule = ((textLower.includes('high regulation') || textLower.includes('regulated')) && (textLower.includes('evolving') || textLower.includes('changing'))) ||
      (reg >= 70 && chg >= 55);

    // Rule 5: Continuous secure deployment → DevSecOps
    const isDevSecOpsRule = (textLower.includes('continuous secure deployment') || (textLower.includes('continuous deployment') && textLower.includes('secure'))) ||
      (deploy >= 80 && sec >= 75 && reg < 70 && verif < 85);

    // Rule 6: Frequently changing requirements → Agile
    const isAgileRule = (textLower.includes('frequently changing') || (textLower.includes('changing requirements') && !textLower.includes('regulation') && !textLower.includes('secure deployment'))) ||
      (chg >= 70 && reg < 70 && sec < 75);

    // Apply rule overrides deterministically
    if (isWaterfallRule) {
      triggeredRule = 'Stable requirements + extensive approvals → Waterfall';
      waterfallScore = 96;
      vModelScore = Math.min(vModelScore, 86);
      hybridScore = Math.min(hybridScore, 68);
      agileScore = Math.min(agileScore, 42);
      spiralScore = Math.min(spiralScore, 60);
      devSecOpsScore = Math.min(devSecOpsScore, 55);
    } else if (isVModelRule) {
      triggeredRule = 'Strict verification/validation → V-Model';
      vModelScore = 96;
      waterfallScore = Math.min(waterfallScore, 82);
      hybridScore = Math.min(hybridScore, 85);
      spiralScore = Math.min(spiralScore, 65);
      agileScore = Math.min(agileScore, 40);
      devSecOpsScore = Math.min(devSecOpsScore, 60);
    } else if (isSpiralRule) {
      triggeredRule = 'High uncertainty/technical risk → Spiral';
      spiralScore = 96;
      hybridScore = Math.min(hybridScore, 78);
      agileScore = Math.min(agileScore, 74);
      devSecOpsScore = Math.min(devSecOpsScore, 70);
      vModelScore = Math.min(vModelScore, 62);
      waterfallScore = Math.min(waterfallScore, 45);
    } else if (isHybridRule) {
      triggeredRule = 'High regulation + evolving requirements → Agile–V-Model/DevSecOps hybrid';
      hybridScore = 96;
      devSecOpsScore = Math.min(devSecOpsScore, 88);
      vModelScore = Math.min(vModelScore, 82);
      agileScore = Math.min(agileScore, 68);
      spiralScore = Math.min(spiralScore, 64);
      waterfallScore = Math.min(waterfallScore, 52);
    } else if (isDevSecOpsRule) {
      triggeredRule = 'Continuous secure deployment → DevSecOps';
      devSecOpsScore = 96;
      hybridScore = Math.min(hybridScore, 88);
      agileScore = Math.min(agileScore, 78);
      spiralScore = Math.min(spiralScore, 65);
      vModelScore = Math.min(vModelScore, 58);
      waterfallScore = Math.min(waterfallScore, 42);
    } else if (isAgileRule) {
      triggeredRule = 'Frequently changing requirements → Agile';
      agileScore = 95;
      devSecOpsScore = Math.min(devSecOpsScore, 82);
      hybridScore = Math.min(hybridScore, 76);
      spiralScore = Math.min(spiralScore, 68);
      vModelScore = Math.min(vModelScore, 48);
      waterfallScore = Math.min(waterfallScore, 38);
    }

    // 3. Assemble and build comprehensive rationales for all models
    const models = [
      {
        id: 'waterfall',
        name: SDLC_MODEL_DEFINITIONS.WATERFALL,
        rawScore: Math.round(waterfallScore),
        pros: [
          'Crystal-clear milestones, documentation baselines, and formal sign-offs',
          'Disciplined budget and resource predictability upfront',
          'Easy to manage for non-technical stakeholders with fixed timelines'
        ],
        cons: [
          'High cost and disruption if requirements change mid-project',
          'Working software only visible late in the lifecycle'
        ],
        rationaleGenerator: (score) => {
          if (isWaterfallRule) {
            return `Deterministic Rule Triggered: Specifications demand stable requirements and extensive approvals. Waterfall enforces rigid phase gate reviews (Requirements → Design → Implementation → Verification), ensuring all stakeholder approvals are secured before advancing.`;
          }
          if (score >= 80) {
            return `Waterfall scored ${score}% due to high requirement stability (${stab}%) and structured approval baselines, minimizing change risks.`;
          }
          return `Waterfall scored ${score}%. It is poorly suited because requirement volatility (${chg}%) or continuous deployment needs (${deploy}%) require iterative flexibility that linear sequential phases cannot accommodate.`;
        }
      },
      {
        id: 'v_model',
        name: SDLC_MODEL_DEFINITIONS.V_MODEL,
        rawScore: Math.round(vModelScore),
        pros: [
          'Strict bilateral verification and validation mapping at every abstraction tier',
          'Traceability from User Requirements directly to Acceptance Testing',
          'Early test plan formulation prevents defect propagation'
        ],
        cons: [
          'Rigid against evolving requirements once implementation begins',
          'High documentation overhead not suited for rapid consumer MVPs'
        ],
        rationaleGenerator: (score) => {
          if (isVModelRule) {
            return `Deterministic Rule Triggered: Strict verification/validation criteria identified. V-Model strictly pairs each development phase (Requirements, Architecture, Design) directly with its corresponding verification testing tier (Acceptance, System, Integration, Unit Testing), ensuring zero-defect safety assurance.`;
          }
          if (score >= 80) {
            return `V-Model scored ${score}% based on high formal verification demand (${verif}%) and severe failure consequences (${fail}%), ensuring exhaustive test traceability.`;
          }
          return `V-Model scored ${score}%. While excellent for high-assurance test traceability, its rigidity limits adaptability under fast sprint iterations and changing market requirements.`;
        }
      },
      {
        id: 'spiral',
        name: SDLC_MODEL_DEFINITIONS.SPIRAL,
        rawScore: Math.round(spiralScore),
        pros: [
          'Explicit risk analysis and risk mitigation in every iterative loop',
          'Progressive evolutionary prototyping reduces technical blockers early',
          'Accommodates complex, unproven algorithmic exploration'
        ],
        cons: [
          'High management overhead requiring seasoned risk assessment specialists',
          'Can be expensive and indefinite if spiral stopping criteria are ambiguous'
        ],
        rationaleGenerator: (score) => {
          if (isSpiralRule) {
            return `Deterministic Rule Triggered: High technical uncertainty and risk identified. The Spiral model centers each cycle around risk analysis, iterative prototyping, and stakeholder evaluation, actively resolving critical technical unknowns before heavy engineering investment.`;
          }
          if (score >= 80) {
            return `Spiral Model scored ${score}% due to elevated technical uncertainty (${unc}%) and risk profile (${fail}%), warranting progressive prototyping spirals.`;
          }
          return `Spiral Model scored ${score}%. The project exhibits well-understood architectural patterns, making Spiral's heavy risk-modeling cycles unnecessary overhead compared to agile execution.`;
        }
      },
      {
        id: 'agile',
        name: SDLC_MODEL_DEFINITIONS.AGILE,
        rawScore: Math.round(agileScore),
        pros: [
          'Rapid 2-week sprint delivery of working, testable software increments',
          'Exceptional adaptability to shifting customer priorities and market feedback',
          'Direct, continuous stakeholder collaboration and transparent backlog grooming'
        ],
        cons: [
          'Requires explicit governance overlays to maintain statutory audit compliance',
          'Scope creep risk if sprint backlog prioritization is loose'
        ],
        rationaleGenerator: (score) => {
          if (isAgileRule) {
            return `Deterministic Rule Triggered: Frequently changing requirements identified. Agile (Scrum) thrives under requirement volatility (${chg}%), leveraging 2-week iterative sprints, continuous backlog grooming, and frequent stakeholder feedback to pivot rapidly without waste.`;
          }
          if (score >= 80) {
            return `Agile scored ${score}% due to high change frequency (${chg}%) and demand for iterative customer-facing feature delivery.`;
          }
          return `Agile scored ${score}%. Standard Agile lacks native statutory compliance gates and formal verification controls needed for high-criticality regulatory constraints (${reg}%).`;
        }
      },
      {
        id: 'devsecops',
        name: SDLC_MODEL_DEFINITIONS.DEVSECOPS,
        rawScore: Math.round(devSecOpsScore),
        pros: [
          'Shift-left security integrating SAST, DAST, and container vulnerability scanning into CI/CD',
          'Automated deployment pipelines enabling rapid, zero-downtime releases',
          'Real-time runtime observability, automated policy-as-code, and fast incident response'
        ],
        cons: [
          'Requires mature automated testing infrastructure and CI/CD tooling',
          'Demands strong cross-functional engineering culture between Dev, Sec, and Ops'
        ],
        rationaleGenerator: (score) => {
          if (isDevSecOpsRule) {
            return `Deterministic Rule Triggered: Continuous secure deployment criteria identified. DevSecOps embeds automated security gates (SAST/DAST, secrets detection, dependency scanning) directly into CI/CD release pipelines, ensuring zero-touch secure continuous delivery.`;
          }
          if (score >= 80) {
            return `DevSecOps scored ${score}% reflecting high continuous deployment need (${deploy}%) and substantial cybersecurity risks (${sec}%).`;
          }
          return `DevSecOps scored ${score}%. It provides powerful automation, but the project requires heavy formal verification documentation and approval gates before production releases.`;
        }
      },
      {
        id: 'agile_devsecops_hybrid',
        name: SDLC_MODEL_DEFINITIONS.AGILE_DEVSECOPS_HYBRID,
        rawScore: Math.round(hybridScore),
        pros: [
          'Unites sprint delivery velocity with rigorous compliance and security gates',
          'Continuous audit readiness with immutable traceability artifacts',
          'Balances stakeholder responsiveness with statutory adherence'
        ],
        cons: [
          'Requires sophisticated orchestration between regulatory compliance officers and sprint teams',
          'Higher initial pipeline automation complexity'
        ],
        rationaleGenerator: (score) => {
          if (isHybridRule) {
            return `Deterministic Rule Triggered: High regulation + evolving requirements identified. The Agile–DevSecOps Hybrid model blends fast iterative sprint velocity with continuous automated security scanning and regulatory compliance-as-code gates, satisfying statutory standards without slowing delivery.`;
          }
          if (score >= 80) {
            return `Agile-DevSecOps Hybrid scored ${score}% because the scenario combines regulatory oversight (${reg}%) and security risks (${sec}%) with changing user requirements (${chg}%).`;
          }
          return `Agile-DevSecOps Hybrid scored ${score}%. While highly capable, simpler models suffice when regulatory criticality is low.`;
        }
      }
    ];

    // Normalize and sort descending
    const sorted = models
      .map(m => {
        const clampedScore = Math.min(Math.max(m.rawScore, 30), 98);
        return {
          id: m.id,
          name: m.name,
          score: clampedScore,
          suitabilityScore: `${clampedScore}%`,
          rationale: m.rationaleGenerator(clampedScore),
          pros: m.pros,
          cons: m.cons,
          matchLevel: clampedScore >= 90 ? 'Primary Recommendation' : clampedScore >= 75 ? 'Viable Alternative' : clampedScore >= 55 ? 'Conditional Fit' : 'Low Suitability'
        };
      })
      .sort((a, b) => b.score - a.score);

    // Assign rank
    sorted.forEach((item, index) => {
      item.rank = index + 1;
    });

    if (triggeredRule) {
      sorted[0].triggeredRule = triggeredRule;
    }

    return sorted;
  }

  /**
   * Generates IEEE 830 compliant workflow phases for the chosen model
   */
  _generateWorkflowPhases(modelName, _factors) {
    const isDevSecOps = modelName.includes('DevSecOps');
    const isVModel = modelName.includes('V-Model');
    const isSpiral = modelName.includes('Spiral');
    const isWaterfall = modelName.includes('Waterfall');

    if (isDevSecOps) {
      return [
        {
          phaseNumber: 1,
          phaseName: 'Inception, Threat Modeling & Secure Architecture',
          durationEstimate: '2 Weeks',
          objective: 'Define user stories, compliance gates, and conduct STRIDE threat modeling.',
          responsibleRoles: ['Lead Architect', 'Security Engineer', 'Product Owner'],
          activities: [
            'Decompose system into user stories with security acceptance criteria',
            'Conduct architectural threat modeling and attack surface mapping',
            'Establish automated CI/CD pipeline with baseline linting and policy-as-code'
          ],
          deliverables: ['Product Backlog', 'Threat Model Dossier', 'Security Governance Baseline'],
          securityControls: ['STRIDE Threat Modeling', 'Architecture Risk Assessment'],
          complianceCheckpoints: 'CISO architectural review and statutory regulatory baseline sign-off.',
          entryCriteria: 'Approved business scenario and initial compliance mandate.',
          exitCriteria: 'Signed threat model and initialized secure repository templates.'
        },
        {
          phaseNumber: 2,
          phaseName: 'Iterative Secure Sprint Development',
          durationEstimate: '4-8 Weeks (2-Week Sprints)',
          objective: 'Develop functional modules with pre-commit linters, SAST, and automated unit testing.',
          responsibleRoles: ['Full-Stack Engineers', 'QA Automation Engineer', 'Scrum Master'],
          activities: [
            'Implement functional stories in 2-week sprint cadences',
            'Run pre-commit secret scanning and static code analysis (SAST)',
            'Develop automated test suites targeting >85% code coverage'
          ],
          deliverables: ['Sprint Increments', 'Unit/Integration Test Suites', 'Automated SAST Reports'],
          securityControls: ['Pre-commit git hooks', 'SAST (SonarQube/Semgrep)', 'Secret scanning'],
          complianceCheckpoints: 'Zero critical SAST findings required to merge pull requests.',
          entryCriteria: 'Groomed sprint backlog with security test criteria.',
          exitCriteria: 'Passing automated test suite and clean security scans.'
        },
        {
          phaseNumber: 3,
          phaseName: 'Automated CI/CD & Dynamic Security Scanning (DAST)',
          durationEstimate: 'Continuous / 1 Week Final Stage',
          objective: 'Execute automated build pipelines, container scanning, and dynamic penetration scans.',
          responsibleRoles: ['DevSecOps Engineer', 'Security Analyst'],
          activities: [
            'Container image vulnerability scanning in ephemeral build environments',
            'Dynamic Application Security Testing (DAST) against staging APIs',
            'Automated software composition analysis (SCA) for third-party vulnerabilities'
          ],
          deliverables: ['Container Vulnerability Report', 'DAST Assessment Report', 'SCA Dependency Bill of Materials (SBOM)'],
          securityControls: ['DAST (OWASP ZAP)', 'Container scanning (Trivy)', 'SBOM generation'],
          complianceCheckpoints: 'Automated pipeline block on CVEs with CVSS >= 7.0.',
          entryCriteria: 'Merged pull requests into release candidate branch.',
          exitCriteria: 'Zero high/critical unpatched vulnerabilities in SBOM.'
        },
        {
          phaseNumber: 4,
          phaseName: 'Verification, Penetration Testing & Compliance Gate',
          durationEstimate: '2 Weeks',
          objective: 'Conduct independent third-party penetration testing and formal regulatory audit.',
          responsibleRoles: ['Independent Pen-Tester', 'Compliance Officer', 'QA Lead'],
          activities: [
            'Execute manual and automated red-team penetration testing',
            'Audit immutable transaction logging and encryption key management',
            'Validate Disaster Recovery (DR) warm-failover and RTO/RPO targets'
          ],
          deliverables: ['Third-Party Penetration Test Report', 'Compliance Audit Certification', 'RTM Verification Sign-Off'],
          securityControls: ['Independent Pen-Testing', 'Cryptographic Key Rotation Audit', 'Failover Drill'],
          complianceCheckpoints: 'Regulatory officer and Chief Security Officer release authorization.',
          entryCriteria: 'Staging environment passing automated CI/CD security scans.',
          exitCriteria: 'All penetration test findings remediated; formal audit sign-off.'
        },
        {
          phaseNumber: 5,
          phaseName: 'Canary Deployment & Continuous Runtime Telemetry',
          durationEstimate: 'Ongoing Post-Release',
          objective: 'Execute zero-downtime canary deployment, runtime intrusion monitoring, and audit trails.',
          responsibleRoles: ['Site Reliability Engineer (SRE)', 'SOC Analyst', 'Product Manager'],
          activities: [
            'Gradual canary traffic roll-out (5% -> 25% -> 100%) with automated rollbacks',
            'Real-time telemetry monitoring via Web Application Firewall (WAF) and SIEM',
            'Automated statutory compliance telemetry generation and monthly audit logs'
          ],
          deliverables: ['Production Release Dossier', 'Runtime WAF Telemetry Logs', 'Post-Deployment SLA Metrics'],
          securityControls: ['Runtime Application Self-Protection (RASP)', 'Automated WAF / DDoS shield', 'Immutable audit logs'],
          complianceCheckpoints: 'Continuous runtime compliance monitoring and automated anomaly alerts.',
          entryCriteria: 'Production deployment approval from compliance board.',
          exitCriteria: 'System stable under 100% live traffic meeting all latency SLAs.'
        }
      ];
    } else if (isVModel) {
      return [
        {
          phaseNumber: 1,
          phaseName: 'Requirements Engineering & Acceptance Test Specification',
          durationEstimate: '3 Weeks',
          objective: 'Define detailed user and system requirements while simultaneously drafting acceptance test plans.',
          responsibleRoles: ['Lead Systems Analyst', 'Lead Test Architect', 'Stakeholders'],
          activities: [
            'Document complete functional and safety requirements',
            'Design user acceptance test (UAT) criteria mapped 1-to-1 with requirements',
            'Establish formal Requirements Traceability Matrix (RTM)'
          ],
          deliverables: ['System Requirements Document', 'Acceptance Test Suite Specification', 'Traceability Baseline'],
          securityControls: ['Requirements Security Inspection', 'Regulatory Traceability Mapping'],
          complianceCheckpoints: 'Formal baseline sign-off by regulatory and business authorities.',
          entryCriteria: 'Project charter approval.',
          exitCriteria: 'Approved requirements and corresponding acceptance test suite.'
        },
        {
          phaseNumber: 2,
          phaseName: 'System Architecture & System Integration Test Design',
          durationEstimate: '3 Weeks',
          objective: 'Architect component subsystems while developing system-level integration test cases.',
          responsibleRoles: ['Enterprise Architect', 'Integration QA Specialist'],
          activities: [
            'Design subsystem components, interfaces, and database models',
            'Formulate system integration testing protocols',
            'Verify interface contracts and protocol specifications'
          ],
          deliverables: ['System Architecture Specification', 'System Integration Test Plan'],
          securityControls: ['Interface Threat Modeling', 'Network Isolation Controls'],
          complianceCheckpoints: 'Architectural safety and reliability verification gate.',
          entryCriteria: 'Frozen requirements baseline.',
          exitCriteria: 'Approved architecture specification and integration test matrix.'
        },
        {
          phaseNumber: 3,
          phaseName: 'Detailed Module Design & Unit Test Formulation',
          durationEstimate: '4 Weeks',
          objective: 'Specify internal module algorithms and formulate corresponding unit tests.',
          responsibleRoles: ['Senior Software Engineers', 'QA Engineers'],
          activities: [
            'Specify detailed module data structures and procedural algorithms',
            'Author automated unit tests and test fixtures prior to coding (TDD)',
            'Conduct peer design inspections'
          ],
          deliverables: ['Detailed Module Design Documents', 'Comprehensive Unit Test Harnesses'],
          securityControls: ['Static Code Rule Definition', 'Cryptographic Algorithm Verification'],
          complianceCheckpoints: 'Peer design review approval.',
          entryCriteria: 'Approved system architecture specification.',
          exitCriteria: 'Ready-to-code module specs with matching unit test suites.'
        },
        {
          phaseNumber: 4,
          phaseName: 'Implementation & Bilateral Verification Execution',
          durationEstimate: '6 Weeks',
          objective: 'Implement code and ascend the right-hand verification side of the V-Model.',
          responsibleRoles: ['Development Team', 'Verification & Validation Engineers'],
          activities: [
            'Write production source code to module specifications',
            'Execute unit tests, code coverage analysis, and static analysis',
            'Execute integration tests validating interface communications'
          ],
          deliverables: ['Production Codebase', 'Unit and Integration Test Execution Results'],
          securityControls: ['Static Analysis (SAST)', 'Strict Branch Protection Rules'],
          complianceCheckpoints: '100% unit and integration test pass rate.',
          entryCriteria: 'Module design and unit test specs approved.',
          exitCriteria: 'Integrated software system passing all internal verification suites.'
        },
        {
          phaseNumber: 5,
          phaseName: 'System Validation & Final Formal Acceptance Sign-Off',
          durationEstimate: '3 Weeks',
          objective: 'Execute full system validation against original user requirements for formal release.',
          responsibleRoles: ['Validation Engineers', 'Independent Audit Team', 'Stakeholders'],
          activities: [
            'Execute system-level performance, security, and load tests',
            'Conduct end-user acceptance testing (UAT) following Phase 1 specifications',
            'Generate formal audit certification and traceability verification sign-off'
          ],
          deliverables: ['Validation Final Report', 'Audit Compliance Certificate', 'Commissioning Sign-Off'],
          securityControls: ['Formal Penetration Testing', 'Regulatory Audit Inspection'],
          complianceCheckpoints: 'Full Traceability Matrix sign-off by QA and Compliance.',
          entryCriteria: 'Successful completion of integration testing.',
          exitCriteria: 'Formal customer acceptance and deployment authorization.'
        }
      ];
    } else if (isSpiral) {
      return [
        {
          phaseNumber: 1,
          phaseName: 'Spiral 1: Objective Determination & Architectural Feasibility',
          durationEstimate: '3 Weeks',
          objective: 'Identify project objectives, constraints, and alternative technical architectures.',
          responsibleRoles: ['Lead Architect', 'Chief Scientist / Tech Lead', 'Product Manager'],
          activities: [
            'Define core functional objectives and architectural constraints',
            'Evaluate alternative technology stacks and algorithm designs',
            'Establish initial risk register with probabilistic impact scores'
          ],
          deliverables: ['System Objectives Document', 'Initial Risk Matrix', 'Alternative Architecture Tradeoff Report'],
          securityControls: ['Initial Threat Assessment', 'High-Risk Component Isolation'],
          complianceCheckpoints: 'Stakeholder alignment on technical risks and objectives.',
          entryCriteria: 'Project kickoff charter.',
          exitCriteria: 'Ranked risk matrix and selected architecture candidates.'
        },
        {
          phaseNumber: 2,
          phaseName: 'Spiral 2: Risk Analysis & Algorithmic Prototyping',
          durationEstimate: '4 Weeks',
          objective: 'Construct exploratory prototypes to resolve top technical uncertainties.',
          responsibleRoles: ['R&D Engineers', 'Prototype QA', 'Risk Officer'],
          activities: [
            'Build proof-of-concept prototypes targeting highest uncertainty items',
            'Benchmark prototype latency, throughput, and algorithmic accuracy',
            'Analyze prototype failure modes and eliminate non-viable alternatives'
          ],
          deliverables: ['Working Technical Prototype', 'Risk Resolution Report', 'Performance Benchmark Dossier'],
          securityControls: ['Prototype Vulnerability Testing', 'Security Feasibility Review'],
          complianceCheckpoints: 'Go/No-Go decision gate based on prototype risk resolution.',
          entryCriteria: 'Approved Phase 1 risk matrix.',
          exitCriteria: 'Technical uncertainties verified; fatal blockers eliminated.'
        },
        {
          phaseNumber: 3,
          phaseName: 'Spiral 3: Core Engineering & Incremental Build',
          durationEstimate: '6 Weeks',
          objective: 'Develop production-grade architecture incorporating prototype findings.',
          responsibleRoles: ['Senior Developers', 'QA Automation Leads'],
          activities: [
            'Refactor validated prototype code into production-grade modular components',
            'Implement core business logic and database persistence layers',
            'Execute continuous regression testing on incremental builds'
          ],
          deliverables: ['Core Production Build', 'Regression Test Suite', 'Updated Risk Register'],
          securityControls: ['SAST Automated Scanning', 'Defensive Error Handling'],
          complianceCheckpoints: 'Intermediate milestone review with technical steering committee.',
          entryCriteria: 'Validated architectural prototype.',
          exitCriteria: 'Core system build passing 100% regression tests.'
        },
        {
          phaseNumber: 4,
          phaseName: 'Spiral 4: Operational Hardening & Security Testing',
          durationEstimate: '3 Weeks',
          objective: 'Stress test the integrated system and mitigate residual operational risks.',
          responsibleRoles: ['Performance Engineers', 'Security Auditors'],
          activities: [
            'Conduct high-volume load, stress, and failover drills',
            'Perform security vulnerability assessments and penetration testing',
            'Evaluate final compliance with regulatory and performance mandates'
          ],
          deliverables: ['Stress Test Assessment', 'Vulnerability Remediation Report', 'Operational Readiness Dossier'],
          securityControls: ['Penetration Testing', 'Disaster Recovery Simulation'],
          complianceCheckpoints: 'Risk officer sign-off that residual risk is below acceptable threshold.',
          entryCriteria: 'Complete integrated core build.',
          exitCriteria: 'Zero critical security or performance risks remaining.'
        },
        {
          phaseNumber: 5,
          phaseName: 'Release Evaluation & Next Evolution Planning',
          durationEstimate: '2 Weeks',
          objective: 'Deploy production release and plan subsequent evolutionary spiral loops.',
          responsibleRoles: ['Product Steering Committee', 'SRE Lead'],
          activities: [
            'Execute production deployment with telemetry monitoring',
            'Gather operational user telemetry and feedback',
            'Plan objectives and risk dimensions for the subsequent evolutionary spiral'
          ],
          deliverables: ['Production Release Dossier', 'User Feedback Telemetry', 'Evolutionary Spiral Roadmap'],
          securityControls: ['Production Telemetry Monitoring', 'Incident Response Playbook'],
          complianceCheckpoints: 'Customer acceptance and roadmap approval.',
          entryCriteria: 'Operational hardening sign-off.',
          exitCriteria: 'Successful deployment and roadmap established for Next Spiral.'
        }
      ];
    } else if (isWaterfall) {
      return [
        {
          phaseNumber: 1,
          phaseName: 'Exhaustive Requirements Specification & Sign-Off',
          durationEstimate: '4 Weeks',
          objective: 'Define all functional, non-functional, and interface requirements with formal stakeholder sign-off.',
          responsibleRoles: ['Business Analyst', 'Enterprise Architect', 'Executive Stakeholders'],
          activities: [
            'Conduct structured stakeholder elicitation workshops',
            'Draft comprehensive Software Requirements Specification (IEEE 830)',
            'Conduct formal stage-gate approval reviews'
          ],
          deliverables: ['Formal SRS Document', 'Requirements Traceability Matrix', 'Approved Project Charter'],
          securityControls: ['Security Requirements Baseline', 'Compliance Governance Mapping'],
          complianceCheckpoints: 'Executive sign-off; scope is frozen.',
          entryCriteria: 'Project authorization.',
          exitCriteria: 'Signed and frozen SRS document.'
        },
        {
          phaseNumber: 2,
          phaseName: 'System & Architectural Design Specification',
          durationEstimate: '4 Weeks',
          objective: 'Produce comprehensive architectural, database, and interface designs.',
          responsibleRoles: ['Lead Systems Architect', 'Database Architect'],
          activities: [
            'Create High-Level Design (HLD) and Low-Level Design (LLD) documents',
            'Specify relational database schemas, indexes, and ER diagrams',
            'Document all internal and external API interface contracts'
          ],
          deliverables: ['High-Level Architecture Document', 'Low-Level Design Specification', 'Database Schema DDL'],
          securityControls: ['Architectural Security Review', 'Cryptographic Model Approval'],
          complianceCheckpoints: 'Architecture Review Board (ARB) formal approval.',
          entryCriteria: 'Signed SRS document.',
          exitCriteria: 'Approved and baselined design specifications.'
        },
        {
          phaseNumber: 3,
          phaseName: 'Implementation & Module Construction',
          durationEstimate: '8-12 Weeks',
          objective: 'Implement all software modules according to frozen design specifications.',
          responsibleRoles: ['Software Engineering Team', 'Technical Leads'],
          activities: [
            'Develop all software units according to strict coding standards',
            'Execute unit tests and peer code reviews',
            'Integrate software modules into centralized build repository'
          ],
          deliverables: ['Fully Implemented Codebase', 'Unit Test Results Report', 'Build Artifacts'],
          securityControls: ['Automated Code Quality Linters', 'Peer Security Review'],
          complianceCheckpoints: 'Code freeze verification; 100% unit tests passed.',
          entryCriteria: 'Frozen architecture and design documents.',
          exitCriteria: 'All features implemented; code freeze declared.'
        },
        {
          phaseNumber: 4,
          phaseName: 'System Integration & Formal Verification Testing',
          durationEstimate: '4 Weeks',
          objective: 'Execute end-to-end integration, performance, and user acceptance testing.',
          responsibleRoles: ['Independent QA Team', 'User Acceptance Representatives'],
          activities: [
            'Execute full test suite against frozen code baseline',
            'Perform performance, load, and security vulnerability testing',
            'Coordinate User Acceptance Testing (UAT) with formal sign-off sheets'
          ],
          deliverables: ['Formal QA Test Execution Log', 'Defect Remediation Report', 'Signed UAT Approval'],
          securityControls: ['Formal Penetration Testing', 'Security Audit Inspection'],
          complianceCheckpoints: 'Zero open blocker or critical defects.',
          entryCriteria: 'Code freeze and deployment to dedicated QA staging.',
          exitCriteria: 'Formal stakeholder UAT sign-off.'
        },
        {
          phaseNumber: 5,
          phaseName: 'Deployment, Handover & Maintenance Transition',
          durationEstimate: '2 Weeks',
          objective: 'Deploy release into production environment and transition to operations.',
          responsibleRoles: ['Deployment Engineer', 'Operations Support', 'Project Manager'],
          activities: [
            'Execute production cutover script according to runbook',
            'Conduct post-deployment smoke verification testing',
            'Hand over documentation and operations manual to support team'
          ],
          deliverables: ['Production Release Dossier', 'Operations & Maintenance Manual', 'Project Closure Report'],
          securityControls: ['Production Access Audit', 'Final Configuration Verification'],
          complianceCheckpoints: 'Production acceptance sign-off by operations leadership.',
          entryCriteria: 'Signed UAT approval and deployment readiness sign-off.',
          exitCriteria: 'System operational in production; project transitioned to maintenance.'
        }
      ];
    } else {
      // Agile (Scrum)
      return [
        {
          phaseNumber: 1,
          phaseName: 'Product Backlog Elicitation & Sprint 0 Inception',
          durationEstimate: '1-2 Weeks',
          objective: 'Define vision, user stories, acceptance criteria, and initial sprint goals.',
          responsibleRoles: ['Product Owner', 'Scrum Master', 'Development Team'],
          activities: [
            'Break down requirements into prioritized user stories with story points',
            'Establish Definition of Ready (DoR) and Definition of Done (DoD)',
            'Set up development environments, linting, and automated CI pipelines'
          ],
          deliverables: ['Prioritized Product Backlog', 'Sprint 0 Infrastructure', 'Agile Team Charter'],
          securityControls: ['Security User Story Tagging', 'Automated Pre-Commit Checks'],
          complianceCheckpoints: 'Product Owner approval of prioritized backlog.',
          entryCriteria: 'Product vision agreed with stakeholders.',
          exitCriteria: 'Groomed backlog ready for Sprint 1 execution.'
        },
        {
          phaseNumber: 2,
          phaseName: 'Sprint Execution & Iterative Development Cadence',
          durationEstimate: '4-8 Weeks (2-Week Iterations)',
          objective: 'Deliver potentially releasable working software increments every sprint.',
          responsibleRoles: ['Scrum Team', 'Product Owner'],
          activities: [
            'Conduct Sprint Planning, Daily Standups, and Backlog Refinement',
            'Develop, test, and integrate user stories within 2-week iterations',
            'Conduct sprint reviews with live software demonstrations'
          ],
          deliverables: ['Working Software Increments', 'Sprint Burndown Charts', 'Automated Unit/Integration Tests'],
          securityControls: ['Automated PR Security Scans', 'Sprint DoD Security Criteria'],
          complianceCheckpoints: 'Sprint Demo stakeholder acceptance.',
          entryCriteria: 'Sprint backlog approved during Sprint Planning.',
          exitCriteria: 'User stories meet Definition of Done.'
        },
        {
          phaseNumber: 3,
          phaseName: 'Continuous Integration & Automated Testing Pipeline',
          durationEstimate: 'Integrated Continuous Flow',
          objective: 'Maintain unbroken build and test automation on every code push.',
          responsibleRoles: ['Developers', 'QA Automation Engineer'],
          activities: [
            'Automated execution of unit, integration, and UI tests on pull requests',
            'Maintain continuous build health and immediate failure notifications',
            'Automated regression testing before deployment candidate branching'
          ],
          deliverables: ['CI Test Automation Suite', 'Build Artifacts Repository', 'Test Coverage Reports'],
          securityControls: ['Automated Dependency Auditing', 'Container Scanning'],
          complianceCheckpoints: 'All CI checks green before branch merges.',
          entryCriteria: 'Pull request submission.',
          exitCriteria: 'Clean test run and branch merge.'
        },
        {
          phaseNumber: 4,
          phaseName: 'Release Increment Review & Stakeholder Feedback',
          durationEstimate: '1 Week per Major Release',
          objective: 'Review release candidate with key stakeholders and adapt backlog accordingly.',
          responsibleRoles: ['Product Owner', 'Stakeholders', 'Development Team'],
          activities: [
            'Demonstrate consolidated release increment to enterprise stakeholders',
            'Gather user telemetry, feedback, and emerging requirements',
            'Re-prioritize product backlog based on market validation'
          ],
          deliverables: ['Release Candidate Demo', 'Stakeholder Feedback Matrix', 'Updated Product Backlog'],
          securityControls: ['Pre-Release Vulnerability Scan', 'Sanity Test Suite'],
          complianceCheckpoints: 'Product Owner release approval.',
          entryCriteria: 'Satisfied sprint goals across release milestone.',
          exitCriteria: 'Formal authorization to deploy release candidate.'
        },
        {
          phaseNumber: 5,
          phaseName: 'Production Release & Iterative Retrospective',
          durationEstimate: 'Continuous / 2-Week Cadence',
          objective: 'Deploy release increment to production and conduct sprint retrospective.',
          responsibleRoles: ['Scrum Team', 'DevOps Specialist'],
          activities: [
            'Execute automated production deployment with zero downtime',
            'Conduct Sprint Retrospective to continuously improve team efficiency',
            'Monitor production usage metrics to inform subsequent sprint priorities'
          ],
          deliverables: ['Live Production Deployment', 'Sprint Retrospective Action Items', 'Usage Telemetry Dashboard'],
          securityControls: ['Automated Health Check Probes', 'Production Log Monitoring'],
          complianceCheckpoints: 'Post-deployment verification check.',
          entryCriteria: 'Approved release candidate.',
          exitCriteria: 'Release active in production with team improvements logged.'
        }
      ];
    }
  }
}
