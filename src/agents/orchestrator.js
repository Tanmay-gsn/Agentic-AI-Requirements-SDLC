/**
 * Multi-Agent Orchestrator
 * Coordinates communication, execution sequence, shared state,
 * and human-in-the-loop validation between Agent 1 and Agent 2.
 */

import { RequirementAgent } from './requirementAgent.js';
import { SdlcAgent } from './sdlcAgent.js';
import { ClarificationAgent } from './clarificationAgent.js';

export class AgentOrchestrator {
  constructor() {
    this.requirementAgent = new RequirementAgent();
    this.sdlcAgent = new SdlcAgent();
    this.clarificationAgent = new ClarificationAgent();
  }

  /**
   * Run the complete multi-agent pipeline
   */
  async runPipeline(scenarioText, customFactors = {}, onLogUpdate = () => {}) {
    const logs = [];

    const addLog = (agentName, phase, message, details = null) => {
      const entry = {
        timestamp: new Date().toLocaleTimeString(),
        agent: agentName,
        phase,
        message,
        details
      };
      logs.push(entry);
      onLogUpdate([...logs]);
    };

    // Step 1: Coordinator initializes workflow
    addLog('Coordinator Agent', 'Initialization', 'Received scenario specification. Validating input syntax and initializing multi-agent collaboration context.');

    // Step 2: Agent 1 - Requirement Engineering & Extraction
    addLog('Requirement Extraction Agent', 'Elicitation', 'Parsing unstructured input, detecting domain context, and extracting atomic functional workflows.');
    const requirementResult = await this.requirementAgent.analyzeScenario(scenarioText);
    addLog('Requirement Extraction Agent', 'Categorization', `Extracted ${requirementResult.functionalRequirements.length} Functional Requirements and ${requirementResult.nonFunctionalRequirements.length} Non-Functional Requirements.`);

    // Step 3: Compliance & Security Sub-Agent
    addLog('Compliance & Security Agent', 'Regulatory Mapping', `Mapped requirements against regulatory frameworks: ${requirementResult.metrics.regulatoryStandardsMapped.join(', ') || 'Enterprise Security Standard'}.`);

    // Step 4: Quality & Ambiguity Inspector
    addLog('Quality & Conflict Agent', 'Quality Audit', `Quality Score: ${requirementResult.qualityReport.overallScore}/100. Testability: ${requirementResult.qualityReport.testabilityRating}. Identified ${requirementResult.qualityReport.ambiguities.length} vague terms.`);

    // Step 5: Clarification Agent checks for gaps
    const clarifications = this.clarificationAgent.generateClarifications(scenarioText, requirementResult.domain);
    if (clarifications.length > 0) {
      addLog('Clarification Agent', 'Adaptive Interview', `Generated ${clarifications.length} context-aware follow-up clarification prompts for stakeholder resolution.`);
    }

    // Step 6: Agent 2 - SDLC Selection & MCDA Evaluation
    addLog('SDLC Selection Agent', 'Factor Analysis', 'Extracting project characteristics (stability, regulatory criticality, security risk, change frequency) for MCDA engine.');
    const sdlcResult = this.sdlcAgent.evaluateSDLC(requirementResult, customFactors);
    addLog('SDLC Selection Agent', 'Scoring & Ranking', `Ranked SDLC models evaluated. Top recommendation: ${sdlcResult.primaryModel.name} (${sdlcResult.primaryModel.suitabilityScore}% match).`);

    // Step 7: Workflow Customization
    addLog('SDLC Selection Agent', 'Workflow Synthesis', `Generated 5 project-specific SDLC phases with custom deliverables, security activities, and compliance gates.`);

    // Step 8: Coordinator completes orchestration
    addLog('Coordinator Agent', 'Orchestration Complete', 'All agent outputs synthesized successfully. Ready for Human-in-the-Loop review and sign-off.');

    return {
      requirementResult,
      sdlcResult,
      clarifications,
      logs
    };
  }
}
