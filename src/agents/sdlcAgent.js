/**
 * Agent 2: Hospital SDLC Selection & Workflow Architecture Agent
 * Hybrid engine combining:
 * 1. Quantitative 8-Factor Extraction (with healthcare signals + clarification answers + live UI slider overrides)
 * 2. Multi-Criteria Decision Analysis (MCDA) across all 6 SDLC models
 * 3. Deterministic Specification Rule Matching
 * 4. Hospital-Tailored 5-Phase SDLC Workflow with clinical safety & compliance gates
 */

import { validateHospitalScenario } from './privacyGuard.js';

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
    this.name = 'Hospital SDLC Selection Architect';
  }

  evaluateSDLC(requirementData, customFactors = {}, clarificationAnswers = {}) {
    const scenarioText = requirementData?.scenario || '';
    if (scenarioText) {
      const validation = validateHospitalScenario(scenarioText);
      if (!validation.isValid) {
        throw new Error(`SDLC Evaluation rejected: ${validation.reason}`);
      }
    }

    const evaluatedFactors = this._extractFactors(scenarioText, customFactors, clarificationAnswers);
    const rankedRecommendations = this._performMCDA(scenarioText, evaluatedFactors, customFactors);
    const primaryModel = rankedRecommendations[0];
    const projectWorkflow = this._generateHospitalWorkflow(primaryModel.name);

    return {
      recommendedModel: primaryModel.name,
      suitabilityScore: primaryModel.suitabilityScore,
      justification: primaryModel.rationale,
      primaryModel,
      rankedRecommendations,
      evaluatedFactors,
      projectWorkflow
    };
  }

  _extractFactors(scenarioText, customFactors = {}, clarificationAnswers = {}) {
    const fullText = [
      scenarioText || '',
      ...Object.values(clarificationAnswers || {})
    ].join(' ').toLowerCase();

    const clamp = (val) => Math.min(Math.max(Math.round(val), 0), 100);

    let stability = 52;
    let changeFreq = 50;
    let regulatory = 45;
    let secRisk = 50;
    let techUncertainty = 30;
    let failConsequence = 50;
    let contDeploy = 45;
    let formalVerif = 45;

    // Stability vs Change Frequency
    if (/stable requirements|fixed scope|extensive approvals|frozen|annual validated|statutory.*reporting/.test(fullText)) {
      stability = 92;
      changeFreq = 18;
      formalVerif = Math.max(formalVerif, 78);
    }
    if (/frequently changing|evolving requirements|rapidly changing|bi-weekly sprints|ux experiments|agile/.test(fullText)) {
      changeFreq = 86;
      stability = 26;
    }

    // Strict V&V / Life-Critical Medical Devices
    if (/strict verification|verification\/validation|v-model|formal verification|iec 62304|ventilator|infusion pump|life-critical/.test(fullText)) {
      formalVerif = 96;
      failConsequence = 98;
      stability = Math.max(stability, 74);
      changeFreq = Math.min(changeFreq, 30);
    }

    // Technical Uncertainty / Clinical R&D
    if (/high uncertainty|technical risk|experimental|novel ai|research platform|unproven|sepsis prediction/.test(fullText)) {
      techUncertainty = 92;
      failConsequence = Math.max(failConsequence, 84);
    }

    // Healthcare Regulatory Criticality
    if (/hipaa|nabh|abdm|dpdp|fda|epcs|high regulation|regulated|accreditation|compliance|statutory/.test(fullText)) {
      regulatory = 94;
      formalVerif = Math.max(formalVerif, 80);
    }

    // Security & ePHI Risk
    if (/ephi|phi|encryption|aes-256|rbac|break-glass|2fa|mfa|sast|dast|secure/.test(fullText)) {
      secRisk = 92;
    }

    // Continuous Deployment
    if (/continuous secure deployment|continuous deployment|ci\/cd|canary|microservices|cloud-native/.test(fullText)) {
      contDeploy = 95;
      secRisk = Math.max(secRisk, 86);
    }

    // Failure Consequence (ICU, ER, Zero Data Loss)
    if (/icu|emergency|triage|rpo = 0|99\.99%|zero data loss|patient safety|drug-to-drug/.test(fullText)) {
      failConsequence = Math.max(failConsequence, 94);
    }

    return {
      requirementStability: customFactors.requirementStability !== undefined ? clamp(customFactors.requirementStability) : clamp(stability),
      changeFrequency: customFactors.changeFrequency !== undefined ? clamp(customFactors.changeFrequency) : clamp(changeFreq),
      regulatoryCriticality: customFactors.regulatoryCriticality !== undefined ? clamp(customFactors.regulatoryCriticality) : clamp(regulatory),
      securityRisk: customFactors.securityRisk !== undefined ? clamp(customFactors.securityRisk) : clamp(secRisk),
      technicalUncertainty: customFactors.technicalUncertainty !== undefined ? clamp(customFactors.technicalUncertainty) : clamp(techUncertainty),
      failureConsequence: customFactors.failureConsequence !== undefined ? clamp(customFactors.failureConsequence) : clamp(failConsequence),
      continuousDeploymentNeed: customFactors.continuousDeploymentNeed !== undefined ? clamp(customFactors.continuousDeploymentNeed) : clamp(contDeploy),
      formalVerificationNeed: customFactors.formalVerificationNeed !== undefined ? clamp(customFactors.formalVerificationNeed) : clamp(formalVerif)
    };
  }

  _performMCDA(scenarioText, factors, customFactors = {}) {
    const textLower = (scenarioText || '').toLowerCase();
    const isManualSliderTuning = Object.keys(customFactors || {}).length > 0 && customFactors._fromSlider === true;

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

    // 1. Raw MCDA Weighted Utility Scores
    let waterfallScore = (stab * 0.38) + (verif * 0.22) + ((100 - chg) * 0.25) + ((100 - unc) * 0.15);
    let vModelScore = (verif * 0.38) + (fail * 0.22) + (reg * 0.18) + (stab * 0.12) + ((100 - chg) * 0.10);
    let spiralScore = (unc * 0.44) + (fail * 0.24) + ((100 - stab) * 0.16) + (chg * 0.16);
    let agileScore = (chg * 0.42) + ((100 - stab) * 0.26) + (deploy * 0.20) + ((100 - verif) * 0.12);
    if (reg > 78 || sec > 80) agileScore -= 16;
    let devSecOpsScore = (deploy * 0.38) + (sec * 0.32) + (chg * 0.18) + ((100 - stab) * 0.12);
    let hybridScore = (reg * 0.28) + (sec * 0.24) + (chg * 0.22) + (deploy * 0.14) + (verif * 0.12);

    // 2. Deterministic Specification Rules (bypass text-only override when user drags sliders)
    let triggeredRule = null;

    const isWaterfallRule = (!isManualSliderTuning && textLower.includes('stable requirements') && textLower.includes('approvals')) ||
      (stab >= 82 && chg <= 28 && verif >= 65 && fail < 90);

    const isVModelRule = (!isManualSliderTuning && (textLower.includes('strict verification') || textLower.includes('verification/validation'))) ||
      (verif >= 88 && fail >= 85 && unc < 70 && chg <= 40);

    const isSpiralRule = (!isManualSliderTuning && (textLower.includes('high uncertainty') || textLower.includes('technical risk'))) ||
      (unc >= 78);

    const isHybridRule = (!isManualSliderTuning && (textLower.includes('high regulation') || textLower.includes('regulated')) && (textLower.includes('evolving') || textLower.includes('changing'))) ||
      (reg >= 80 && chg >= 58 && verif >= 70);

    const isDevSecOpsRule = (!isManualSliderTuning && textLower.includes('continuous secure deployment')) ||
      (deploy >= 85 && sec >= 80 && reg < 90 && verif < 85);

    const isAgileRule = (!isManualSliderTuning && textLower.includes('frequently changing') && !textLower.includes('regulation') && !textLower.includes('secure deployment')) ||
      (chg >= 72 && reg < 75 && sec < 78);

    if (isWaterfallRule) {
      triggeredRule = 'Stable requirements + extensive approvals → Waterfall';
      waterfallScore = 96;
      vModelScore = Math.min(vModelScore, 85);
      hybridScore = Math.min(hybridScore, 68);
      agileScore = Math.min(agileScore, 42);
    } else if (isVModelRule) {
      triggeredRule = 'Strict verification/validation → V-Model';
      vModelScore = 96;
      hybridScore = Math.min(hybridScore, 84);
      waterfallScore = Math.min(waterfallScore, 80);
      agileScore = Math.min(agileScore, 40);
    } else if (isSpiralRule) {
      triggeredRule = 'High uncertainty/technical risk → Spiral Model';
      spiralScore = 96;
      hybridScore = Math.min(hybridScore, 78);
      agileScore = Math.min(agileScore, 72);
      waterfallScore = Math.min(waterfallScore, 44);
    } else if (isHybridRule) {
      triggeredRule = 'High regulation + evolving requirements → Agile–DevSecOps Hybrid';
      hybridScore = 96;
      devSecOpsScore = Math.min(devSecOpsScore, 88);
      vModelScore = Math.min(vModelScore, 82);
      agileScore = Math.min(agileScore, 66);
    } else if (isDevSecOpsRule) {
      triggeredRule = 'Continuous secure deployment → DevSecOps';
      devSecOpsScore = 96;
      hybridScore = Math.min(hybridScore, 88);
      agileScore = Math.min(agileScore, 76);
    } else if (isAgileRule) {
      triggeredRule = 'Frequently changing requirements → Agile (Scrum)';
      agileScore = 95;
      devSecOpsScore = Math.min(devSecOpsScore, 82);
      hybridScore = Math.min(hybridScore, 74);
    }

    const models = [
      {
        id: 'agile_devsecops_hybrid',
        name: SDLC_MODEL_DEFINITIONS.AGILE_DEVSECOPS_HYBRID,
        rawScore: Math.round(hybridScore),
        pros: [
          'Unites clinical sprint agility with automated HIPAA/NABH compliance-as-code gates',
          'Embeds shift-left PHI security scanning (SAST/DAST) in every release cycle',
          'Maintains continuous audit readiness while adapting to new hospital workflows'
        ],
        cons: [
          'Requires close coordination between Hospital IT, Clinical Safety, and Compliance',
          'Higher upfront CI/CD automation setup cost'
        ],
        rationale: isHybridRule
          ? `Balances high healthcare regulation (${reg}%) and ePHI security (${sec}%) with evolving clinical requirements (${chg}%), embedding automated compliance gates into iterative sprints.`
          : `Scored ${Math.round(hybridScore)}% based on combined regulatory criticality (${reg}%), security risk (${sec}%), and requirement change rate (${chg}%).`
      },
      {
        id: 'v_model',
        name: SDLC_MODEL_DEFINITIONS.V_MODEL,
        rawScore: Math.round(vModelScore),
        pros: [
          'Maps every clinical safety requirement 1-to-1 to formal verification & validation tests',
          'Ideal for IEC 62304 life-critical ICU/ventilator and high-assurance hospital software',
          'Produces exhaustive traceability artifacts required for regulatory certification'
        ],
        cons: [
          'Rigid against frequent mid-project clinical workflow changes',
          'Working software reaches clinicians later in the lifecycle'
        ],
        rationale: isVModelRule
          ? `Strict clinical verification/validation (${verif}%) and life-critical failure consequence (${fail}%) require bilateral V&V traceability before deployment.`
          : `Scored ${Math.round(vModelScore)}% reflecting formal verification demand (${verif}%) and failure severity (${fail}%).`
      },
      {
        id: 'devsecops',
        name: SDLC_MODEL_DEFINITIONS.DEVSECOPS,
        rawScore: Math.round(devSecOpsScore),
        pros: [
          'Automated security gates (SAST, DAST, secrets & container scans) in CI/CD',
          'Supports zero-downtime canary rollouts for 24/7 hospital cloud services',
          'Continuous runtime monitoring and fast vulnerability patching'
        ],
        cons: [
          'Needs mature automated test coverage and DevSecOps engineering skills',
          'Less suited for heavily frozen, upfront-approved statutory systems'
        ],
        rationale: isDevSecOpsRule
          ? `High continuous deployment need (${deploy}%) paired with strong ePHI security risk (${sec}%) favors automated Security-as-Code CI/CD pipelines.`
          : `Scored ${Math.round(devSecOpsScore)}% based on deployment frequency (${deploy}%) and security posture (${sec}%).`
      },
      {
        id: 'spiral',
        name: SDLC_MODEL_DEFINITIONS.SPIRAL,
        rawScore: Math.round(spiralScore),
        pros: [
          'Explicit clinical & technical risk analysis in every iterative spiral loop',
          'De-risks novel medical AI algorithms and unfamiliar hardware via prototypes',
          'Supports structured Go/No-Go clinical safety reviews per cycle'
        ],
        cons: [
          'High project-management overhead for routine hospital IT modules',
          'Requires experienced clinical risk assessors'
        ],
        rationale: isSpiralRule
          ? `Elevated technical uncertainty (${unc}%) and clinical risk (${fail}%) warrant iterative prototyping and risk-mitigation cycles before full hospital rollout.`
          : `Scored ${Math.round(spiralScore)}% given technical uncertainty (${unc}%) and risk profile (${fail}%).`
      },
      {
        id: 'waterfall',
        name: SDLC_MODEL_DEFINITIONS.WATERFALL,
        rawScore: Math.round(waterfallScore),
        pros: [
          'Clear stage-gate sign-offs for hospital directors and statutory boards',
          'Predictable fixed-scope budgeting and exhaustive upfront documentation',
          'Simple governance when clinical rules are completely frozen'
        ],
        cons: [
          'Very costly to revise once development starts',
          'Late clinician feedback increases usability mismatch risk'
        ],
        rationale: isWaterfallRule
          ? `Stable clinical requirements (${stab}%) and extensive upfront approval gates make linear sequential Waterfall delivery predictable and auditable.`
          : `Scored ${Math.round(waterfallScore)}% due to requirement stability (${stab}%) vs. change frequency (${chg}%).`
      },
      {
        id: 'agile',
        name: SDLC_MODEL_DEFINITIONS.AGILE,
        rawScore: Math.round(agileScore),
        pros: [
          'Rapid 2-week increments for patient-facing OPD portals and feedback apps',
          'Continuous involvement of doctors, nurses, and patients in sprint demos',
          'High adaptability to shifting hospital usability priorities'
        ],
        cons: [
          'Lacks built-in statutory compliance gates unless paired with DevSecOps',
          'Risk of incomplete audit documentation in high-regulation clinical cores'
        ],
        rationale: isAgileRule
          ? `High requirement volatility (${chg}%) with lower formal verification overhead (${verif}%) fits fast Scrum iterations and direct patient/staff feedback.`
          : `Scored ${Math.round(agileScore)}%; standalone Agile is penalized when hospital regulatory criticality (${reg}%) demands formal compliance gates.`
      }
    ];

    const sorted = models
      .map((m) => {
        const clamped = Math.min(Math.max(m.rawScore, 30), 98);
        return {
          ...m,
          score: clamped,
          suitabilityScore: `${clamped}%`,
          matchLevel: clamped >= 90 ? 'Primary Recommendation' : clamped >= 75 ? 'Viable Alternative' : clamped >= 55 ? 'Conditional Fit' : 'Low Suitability'
        };
      })
      .sort((a, b) => b.score - a.score);

    sorted.forEach((item, idx) => {
      item.rank = idx + 1;
    });

    if (triggeredRule) {
      sorted[0].triggeredRule = triggeredRule;
    }

    return sorted;
  }

  _generateHospitalWorkflow(modelName) {
    if (modelName.includes('V-Model')) {
      return [
        {
          phaseNumber: 1,
          phaseName: 'Clinical Safety Requirements & Acceptance Test Baseline',
          durationEstimate: '3 Weeks',
          objective: 'Freeze clinical safety requirements and draft 1-to-1 User Acceptance Tests (UAT) and RTM.',
          responsibleRoles: ['Chief Medical Officer', 'Clinical Safety Officer', 'Systems Analyst'],
          activities: [
            'Specify deterministic clinical safety, alarm, and fail-safe behaviors',
            'Draft clinical UAT protocols mapped directly to each requirement ID',
            'Baseline IEEE 830 SRS and IEC 62304 hazard traceability matrix'
          ],
          deliverables: ['Signed Clinical SRS', 'Hazard Analysis Dossier', 'UAT Protocol & RTM'],
          securityControls: ['ePHI Threat Assessment', 'Role & Break-Glass Policy Baseline'],
          complianceCheckpoints: 'Formal sign-off by CMO, Clinical Safety Board, and Compliance Officer.',
          entryCriteria: 'Approved hospital clinical project charter.',
          exitCriteria: 'Frozen clinical SRS and 100% mapped UAT plan.'
        },
        {
          phaseNumber: 2,
          phaseName: 'Medical System Architecture & Integration Test Design',
          durationEstimate: '3 Weeks',
          objective: 'Design fault-tolerant clinical architecture, HL7/device interfaces, and integration test specs.',
          responsibleRoles: ['Hospital IT Architect', 'Biomedical Engineer', 'QA Lead'],
          activities: [
            'Design active-active failover topology and medical device interface contracts',
            'Author HL7 FHIR / bedside telemetry integration test suites',
            'Verify cryptographic key management and network VLAN isolation'
          ],
          deliverables: ['Clinical Architecture Spec', 'Integration Test Matrix', 'Network Isolation Blueprint'],
          securityControls: ['Medical VLAN Segmentation', 'TLS 1.3 & AES-256 Design Verification'],
          complianceCheckpoints: 'Architecture & Biomedical Safety Review Gate.',
          entryCriteria: 'Approved clinical SRS baseline.',
          exitCriteria: 'Signed architecture spec and integration test matrix.'
        },
        {
          phaseNumber: 3,
          phaseName: 'Module Design, Implementation & Unit Verification',
          durationEstimate: '6 Weeks',
          objective: 'Implement clinical modules with strict static analysis and automated unit verification.',
          responsibleRoles: ['Clinical Software Engineers', 'Verification Engineers'],
          activities: [
            'Implement alarm, telemetry, and record modules to frozen design specs',
            'Achieve >= 90% branch test coverage on safety-critical logic',
            'Execute peer clinical code reviews and SAST scans'
          ],
          deliverables: ['Verified Codebase', 'Unit Test & Coverage Report', 'SAST Clean Certificate'],
          securityControls: ['Static Analysis (SAST)', 'Zero Hardcoded Credentials Audit'],
          complianceCheckpoints: '100% unit test pass rate and zero critical SAST findings.',
          entryCriteria: 'Approved architecture and detailed module design.',
          exitCriteria: 'Verified modules ready for hospital staging integration.'
        },
        {
          phaseNumber: 4,
          phaseName: 'Bilateral System Integration & Clinical Simulation Testing',
          durationEstimate: '3 Weeks',
          objective: 'Validate end-to-end device/HMS integration, load resilience, and emergency failover.',
          responsibleRoles: ['Biomedical QA', 'ICU Nursing Leads', 'Security Auditor'],
          activities: [
            'Simulate peak ICU/ER vitals load and sensor-disconnect fail-safe alarms',
            'Validate emergency break-glass access and audit log immutability',
            'Execute independent penetration test on hospital APIs'
          ],
          deliverables: ['Clinical Simulation Report', 'Penetration Test Report', 'Failover Drill Log'],
          securityControls: ['Third-Party Penetration Test', 'Break-Glass Audit Verification'],
          complianceCheckpoints: 'Zero open safety or critical security defects.',
          entryCriteria: 'Integrated build deployed to isolated clinical staging.',
          exitCriteria: 'Passed clinical simulation and security audit.'
        },
        {
          phaseNumber: 5,
          phaseName: 'Clinical UAT, Regulatory Certification & Controlled Cutover',
          durationEstimate: '2 Weeks',
          objective: 'Complete formal clinician UAT, archive traceability evidence, and execute phased ward rollout.',
          responsibleRoles: ['Hospital Director', 'Compliance Officer', 'SRE & Nursing Supervisors'],
          activities: [
            'Execute Phase 1 UAT scripts with ICU/ER clinicians',
            'Compile final IEC 62304 / NABH / HIPAA compliance dossier',
            'Run parallel shadow mode in one ward before hospital-wide go-live'
          ],
          deliverables: ['Signed UAT Certificate', 'Regulatory Audit Package', 'Ward Cutover Runbook'],
          securityControls: ['Production Access Lockout Audit', '24/7 SIEM Clinical Monitoring'],
          complianceCheckpoints: 'Final production sign-off by CMO, CISO, and Compliance Officer.',
          entryCriteria: 'Completed integration & security remediation.',
          exitCriteria: 'Certified clinical system running live with 99.99% SLA telemetry.'
        }
      ];
    }

    if (modelName.includes('Spiral')) {
      return [
        {
          phaseNumber: 1,
          phaseName: 'Spiral 1: Clinical Hypothesis & Risk Matrix Definition',
          durationEstimate: '2–3 Weeks',
          objective: 'Define clinical research objectives, data governance constraints, and top technical risks.',
          responsibleRoles: ['Chief Medical Officer', 'Clinical AI Lead', 'Privacy Officer'],
          activities: [
            'Define clinical accuracy targets and acceptable false-alarm bounds',
            'Establish de-identified training/validation datasets under ethics board approval',
            'Build prioritized technical and clinical safety risk register'
          ],
          deliverables: ['Clinical Research Charter', 'Ethics & Privacy Approval', 'Initial Risk Register'],
          securityControls: ['Dataset De-Identification Audit', 'HIPAA Safe Harbor Verification'],
          complianceCheckpoints: 'Institutional Review Board (IRB) & Privacy Officer approval.',
          entryCriteria: 'Hospital innovation charter.',
          exitCriteria: 'Approved de-identified dataset and ranked risk matrix.'
        },
        {
          phaseNumber: 2,
          phaseName: 'Spiral 2: Exploratory Prototyping & Retrospective Validation',
          durationEstimate: '4 Weeks',
          objective: 'Build exploratory AI/hardware prototypes and test against historical hospital cohorts.',
          responsibleRoles: ['ML/R&D Engineers', 'Clinical Advisors', 'Risk Officer'],
          activities: [
            'Prototype candidate algorithms and benchmark sensitivity/specificity',
            'Test sensor interoperability across heterogeneous ICU/ward hardware',
            'Eliminate high-risk or biased approaches early'
          ],
          deliverables: ['Working Prototype', 'Retrospective Clinical Benchmark', 'Bias & Risk Report'],
          securityControls: ['Model Data Leakage Audit', 'Isolated Sandbox Execution'],
          complianceCheckpoints: 'Go/No-Go clinical feasibility gate.',
          entryCriteria: 'Approved Phase 1 risk matrix.',
          exitCriteria: 'Validated prototype meeting clinical sensitivity thresholds.'
        },
        {
          phaseNumber: 3,
          phaseName: 'Spiral 3: Shadow-Mode Clinical Pilot & Explainability Hardening',
          durationEstimate: '5 Weeks',
          objective: 'Run the system in silent shadow mode alongside clinicians to verify real-world safety.',
          responsibleRoles: ['Senior Engineers', 'Attending Physicians', 'QA Lead'],
          activities: [
            'Deploy in read-only shadow mode without altering live patient care',
            'Validate clinician explainability cards and override workflows',
            'Refine HL7 FHIR integration and latency bottlenecks'
          ],
          deliverables: ['Shadow-Mode Clinical Evaluation', 'Explainability Audit', 'Hardened Build'],
          securityControls: ['PHI Masking Verification', 'SAST/DAST Automated Scans'],
          complianceCheckpoints: 'Clinical Steering Committee shadow-pilot sign-off.',
          entryCriteria: 'Successful retrospective prototype.',
          exitCriteria: 'Confirmed real-world clinical accuracy and clinician trust.'
        },
        {
          phaseNumber: 4,
          phaseName: 'Spiral 4: Production Engineering, Security & Fail-Safe Testing',
          durationEstimate: '3 Weeks',
          objective: 'Harden system for hospital production with penetration testing and disaster recovery drills.',
          responsibleRoles: ['DevSecOps Engineer', 'Compliance Officer', 'SRE'],
          activities: [
            'Execute penetration testing, load stress tests, and failover drills',
            'Verify immutable audit logging of all AI recommendations and clinician overrides',
            'Complete NABH/HIPAA compliance checklist'
          ],
          deliverables: ['Security & Pen-Test Report', 'Compliance Audit Package', 'DR Drill Report'],
          securityControls: ['Penetration Testing', 'Immutable Audit Trail Verification'],
          complianceCheckpoints: 'Residual clinical & cyber risk sign-off by CISO & CMO.',
          entryCriteria: 'Approved shadow-pilot findings.',
          exitCriteria: 'Zero critical security or safety blockers.'
        },
        {
          phaseNumber: 5,
          phaseName: 'Controlled Clinical Rollout & Continuous Drift Monitoring',
          durationEstimate: 'Ongoing',
          objective: 'Roll out to target hospital wards and monitor model drift and clinical outcomes.',
          responsibleRoles: ['Clinical Safety Team', 'MLOps/SRE', 'Product Manager'],
          activities: [
            'Phased ward rollout with mandatory human-in-the-loop clinician confirmation',
            'Continuous monitoring for data drift, alert fatigue, and false positives',
            'Plan next spiral iteration from live clinical feedback'
          ],
          deliverables: ['Production Rollout Dossier', 'Clinical Drift Dashboard', 'Next-Spiral Roadmap'],
          securityControls: ['Runtime Telemetry & SIEM Alerts', 'Periodic Bias Re-Audits'],
          complianceCheckpoints: 'Quarterly clinical governance and safety review.',
          entryCriteria: 'Final production sign-off.',
          exitCriteria: 'Stable live clinical operation with active drift monitoring.'
        }
      ];
    }

    if (modelName.includes('Waterfall')) {
      return [
        {
          phaseNumber: 1,
          phaseName: 'Exhaustive Hospital Requirements & Board Sign-Off',
          durationEstimate: '4 Weeks',
          objective: 'Finalize all statutory, clinical, and reporting requirements with executive sign-off.',
          responsibleRoles: ['Hospital Business Analyst', 'Compliance Officer', 'Medical Director'],
          activities: [
            'Gather complete statutory reporting formats and hospital policy rules',
            'Publish formal IEEE 830 Hospital SRS and Requirements Traceability Matrix',
            'Obtain frozen scope sign-off from hospital governance committee'
          ],
          deliverables: ['Frozen IEEE 830 SRS', 'Regulatory Mapping Matrix', 'Signed Project Charter'],
          securityControls: ['ePHI Data Classification', 'Statutory Retention Policy Baseline'],
          complianceCheckpoints: 'Executive & Legal Board scope freeze approval.',
          entryCriteria: 'Hospital mandate and budget approval.',
          exitCriteria: 'Signed, frozen SRS baseline.'
        },
        {
          phaseNumber: 2,
          phaseName: 'System Architecture, Schema & Interface Specification',
          durationEstimate: '3 Weeks',
          objective: 'Complete High-Level Design, database schemas, and legacy HMS export interfaces.',
          responsibleRoles: ['Hospital IT Architect', 'Database Administrator'],
          activities: [
            'Design relational database schemas with AES-256 encryption controls',
            'Specify HL7/CSV statutory export formats and error codes',
            'Complete Architecture Review Board inspection'
          ],
          deliverables: ['HLD/LLD Specifications', 'Encrypted Database DDL', 'Interface Control Doc'],
          securityControls: ['Architectural Threat Review', 'Access Control Matrix'],
          complianceCheckpoints: 'Hospital IT & Security Architecture sign-off.',
          entryCriteria: 'Frozen SRS.',
          exitCriteria: 'Approved design specifications.'
        },
        {
          phaseNumber: 3,
          phaseName: 'Module Implementation & Internal Quality Verification',
          durationEstimate: '6–8 Weeks',
          objective: 'Build all hospital reporting and workflow modules strictly to design specs.',
          responsibleRoles: ['Development Team', 'Tech Lead'],
          activities: [
            'Implement core modules and automated unit test suites',
            'Run peer code reviews and static security analysis',
            'Prepare staging deployment package and code freeze'
          ],
          deliverables: ['Completed Codebase', 'Unit Test Report', 'Build Artifacts'],
          securityControls: ['SAST Code Scanning', 'Peer Security Review'],
          complianceCheckpoints: 'Code freeze and 100% unit test pass.',
          entryCriteria: 'Approved design baseline.',
          exitCriteria: 'Code-frozen staging release.'
        },
        {
          phaseNumber: 4,
          phaseName: 'Formal QA, Compliance Audit & Hospital UAT',
          durationEstimate: '3 Weeks',
          objective: 'Verify statutory accuracy, ePHI security, and hospital user acceptance.',
          responsibleRoles: ['QA Team', 'Compliance Officer', 'Hospital Staff'],
          activities: [
            'Validate 100% accuracy of statutory reports against sample hospital records',
            'Conduct security vulnerability testing and audit log verification',
            'Execute formal Hospital UAT with signed approval sheets'
          ],
          deliverables: ['QA Verification Log', 'Security Audit Report', 'Signed UAT Form'],
          securityControls: ['Vulnerability Assessment', 'Audit Trail Completeness Test'],
          complianceCheckpoints: 'Zero critical defects; Compliance Officer sign-off.',
          entryCriteria: 'Staging deployment complete.',
          exitCriteria: 'Formal UAT acceptance.'
        },
        {
          phaseNumber: 5,
          phaseName: 'Production Deployment & Hospital Operations Handover',
          durationEstimate: '2 Weeks',
          objective: 'Deploy to hospital production environment and train operations staff.',
          responsibleRoles: ['Deployment Engineer', 'Hospital IT Support', 'Project Manager'],
          activities: [
            'Execute scheduled production cutover with rollback plan',
            'Conduct staff training and handover operations runbooks',
            'Verify post-go-live backups and audit log retention'
          ],
          deliverables: ['Production Cutover Report', 'Operations Manual', 'Closure Sign-Off'],
          securityControls: ['Production Access Audit', 'Encrypted Backup Verification'],
          complianceCheckpoints: 'Hospital Operations & CISO go-live sign-off.',
          entryCriteria: 'Signed UAT and readiness checklist.',
          exitCriteria: 'Live production operation transitioned to hospital IT.'
        }
      ];
    }

    return [
      {
        phaseNumber: 1,
        phaseName: 'Clinical Inception, Threat Modeling & Compliance-as-Code',
        durationEstimate: '2 Weeks',
        objective: 'Define clinical user stories, HIPAA/NABH policy-as-code gates, and STRIDE threat model.',
        responsibleRoles: ['Product Owner (CMO Rep)', 'Hospital IT Architect', 'Security Engineer'],
        activities: [
          'Decompose hospital modules into prioritized stories with clinical acceptance criteria',
          'Run STRIDE threat modeling on ePHI flows, RBAC, and break-glass paths',
          'Configure CI/CD pipeline with automated SAST, secret scanning, and FHIR schema checks'
        ],
        deliverables: ['Clinical Product Backlog', 'ePHI Threat Model', 'Automated CI/CD Baseline'],
        securityControls: ['STRIDE Threat Modeling', 'Automated Pre-Commit Secret Scanning'],
        complianceCheckpoints: 'HIPAA/NABH Compliance Officer baseline approval.',
        entryCriteria: 'Approved hospital initiative and stakeholder roles.',
        exitCriteria: 'Groomed Sprint 1 backlog and green security pipeline.'
      },
      {
        phaseNumber: 2,
        phaseName: 'Iterative Clinical Sprints & Shift-Left Security',
        durationEstimate: '4–8 Weeks (2-Week Sprints)',
        objective: 'Deliver working clinical increments every 2 weeks with automated testing and clinician demos.',
        responsibleRoles: ['Full-Stack & FHIR Engineers', 'QA Automation', 'Nursing/Doctor Reps'],
        activities: [
          'Build EHR, e-Rx, lab, or telehealth stories in 2-week sprint cadences',
          'Run automated SAST, dependency SCA, and unit tests (>85% coverage) on every PR',
          'Conduct bi-weekly sprint demos with doctors and nurses for usability feedback'
        ],
        deliverables: ['Working Clinical Increments', 'Automated Test & SAST Reports', 'Sprint Demo Sign-Offs'],
        securityControls: ['SAST (Semgrep/SonarQube)', 'Dependency Vulnerability Gate (SCA)'],
        complianceCheckpoints: 'Zero high/critical security findings allowed to merge.',
        entryCriteria: 'Sprint backlog meeting Definition of Ready.',
        exitCriteria: 'Clinician-accepted sprint increment with clean security scans.'
      },
      {
        phaseNumber: 3,
        phaseName: 'HL7/FHIR Integration & Dynamic Security Scanning (DAST)',
        durationEstimate: 'Continuous / 1 Week Hardening',
        objective: 'Validate legacy HMS/lab interoperability and execute automated dynamic security scans.',
        responsibleRoles: ['DevSecOps Engineer', 'FHIR Integration Lead', 'Security Analyst'],
        activities: [
          'Execute automated HL7 FHIR R4 / DICOM contract tests against staging HMS',
          'Run OWASP ZAP DAST and container image scanning (Trivy)',
          'Generate Software Bill of Materials (SBOM) and audit trail verification'
        ],
        deliverables: ['FHIR Integration Report', 'DAST & Container Scan Report', 'Signed SBOM'],
        securityControls: ['DAST (OWASP ZAP)', 'Container Scanning', 'API Rate-Limiting & AuthZ Tests'],
        complianceCheckpoints: 'Pipeline auto-blocks any unpatched CVE with CVSS >= 7.0.',
        entryCriteria: 'Release candidate merged to staging.',
        exitCriteria: 'Clean DAST/container scan and passing FHIR contract suite.'
      },
      {
        phaseNumber: 4,
        phaseName: 'Clinical Safety UAT, Pen-Testing & Compliance Gate',
        durationEstimate: '1–2 Weeks',
        objective: 'Perform independent penetration testing, disaster recovery failover, and clinical UAT.',
        responsibleRoles: ['Independent Pen-Tester', 'Compliance Officer', 'Clinical Leads'],
        activities: [
          'Execute manual penetration test focusing on horizontal ePHI access & break-glass',
          'Run live database failover drill verifying RTO/RPO clinical targets',
          'Obtain formal Human-in-the-Loop approval on requirements & SDLC compliance'
        ],
        deliverables: ['Pen-Test Remediation Report', 'DR Failover Proof', 'Signed Compliance Gate'],
        securityControls: ['Third-Party Penetration Test', 'Key Rotation & WORM Log Audit'],
        complianceCheckpoints: 'Mandatory release sign-off by CMO, CISO, and Compliance Officer.',
        entryCriteria: 'Staging candidate passing all automated CI/CD gates.',
        exitCriteria: 'Signed clinical & regulatory release authorization.'
      },
      {
        phaseNumber: 5,
        phaseName: 'Zero-Downtime Canary Rollout & Continuous Clinical Telemetry',
        durationEstimate: 'Ongoing Post-Release',
        objective: 'Roll out incrementally across hospital departments with 24/7 security and SLA monitoring.',
        responsibleRoles: ['Hospital SRE', 'SOC Analyst', 'Clinical Operations Lead'],
        activities: [
          'Pilot rollout to one department/ward (10% -> 50% -> 100%) with instant rollback',
          'Monitor real-time API latency, WAF/SIEM intrusion alerts, and break-glass usage',
          'Feed post-release clinical telemetry into the next sprint backlog'
        ],
        deliverables: ['Production Release Dossier', 'Live SLA & SIEM Dashboard', 'Retrospective Log'],
        securityControls: ['WAF / Runtime Protection', '24/7 SIEM Audit Monitoring', 'Automated Backups'],
        complianceCheckpoints: 'Continuous automated compliance evidence collection for NABH/HIPAA.',
        entryCriteria: 'Approved production release gate.',
        exitCriteria: 'Stable hospital-wide operation meeting all clinical SLAs.'
      }
    ];
  }
}
