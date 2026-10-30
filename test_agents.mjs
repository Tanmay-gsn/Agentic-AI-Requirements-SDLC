import { RequirementAgent } from './src/agents/requirementAgent.js';
import { SdlcAgent } from './src/agents/sdlcAgent.js';
import { AgentOrchestrator } from './src/agents/orchestrator.js';
import { generateSRSMarkdown } from './src/utils/srsExporter.js';

console.log('================================================================');
console.log('RUNNING STREAMLINED DUAL-AGENT VERIFICATION & MCDA BENCHMARK');
console.log('================================================================');

const reqAgent = new RequirementAgent();
const sdlcAgent = new SdlcAgent();
const orchestrator = new AgentOrchestrator();

// 1. ORIGINAL 4 PRESET SCENARIO TESTS
const originalTestCases = [
  {
    name: 'Task 1: Digital Payment Gateway',
    scenario: 'A high-throughput real-time payment gateway handling card and UPI transactions with automated fraud detection and PCI-DSS compliance.'
  },
  {
    name: 'Task 2: Hospital Patient Portal',
    scenario: 'A healthcare consultation and patient records module allowing patients to book appointments, consult doctors via video, access lab reports, complying with HIPAA.'
  },
  {
    name: 'Task 3: E-Commerce Shopping Cart',
    scenario: 'An online shopping cart and multi-vendor checkout functionality with real-time inventory reservation, discount coupons, and order tracking.'
  },
  {
    name: 'Task 4: Online Examination System',
    scenario: 'A web-based university testing module supporting timed multiple-choice tests, automated grading, and anti-cheating browser lockdown.'
  }
];

console.log('\n--- SECTION 1: ORIGINAL 4 TEST CASES ---');
originalTestCases.forEach((tc, idx) => {
  console.log(`\n[Test ${idx + 1}] Scenario: ${tc.name}`);
  
  // (i) Agent 1: Identify and list software requirements
  const reqs = reqAgent.identifyRequirements(tc.scenario);
  console.log(`  -> Agent 1 Extracted: ${reqs.functionalRequirements.length} FRs, ${reqs.nonFunctionalRequirements.length} NFRs`);
  if (reqs.functionalRequirements.length === 0 || reqs.nonFunctionalRequirements.length === 0) {
    throw new Error(`Agent 1 failed for ${tc.name}`);
  }

  // (ii) Agent 2: Identify suitable SDLC
  const sdlc = sdlcAgent.identifySDLC(tc.scenario, reqs);
  console.log(`  -> Agent 2 Selected SDLC: ${sdlc.recommendedModel} (${sdlc.suitabilityScore} match)`);
  console.log(`  -> Proposed Phases: ${sdlc.keyPhases.length}`);
  console.log(`  -> Ranked Models Count: ${sdlc.rankedRecommendations.length}`);
  if (!sdlc.recommendedModel || sdlc.rankedRecommendations.length < 5) {
    throw new Error(`Agent 2 failed for ${tc.name}`);
  }
});

// 2. SPECIFICATION EXAMPLES & DETERMINISTIC RULES
console.log('\n--- SECTION 2: SPECIFICATION DETERMINISTIC RULES ---');
const specExamples = [
  {
    ruleName: 'Stable requirements + extensive approvals → Waterfall',
    scenario: 'A legacy accounting ledger system with stable requirements and extensive approvals across executive and financial committees.',
    expectedModel: 'Waterfall'
  },
  {
    ruleName: 'Strict verification/validation → V-Model',
    scenario: 'A medical ventilator control firmware system requiring strict verification/validation, formal traceability, and safety-critical audit gates.',
    expectedModel: 'V-Model'
  },
  {
    ruleName: 'High uncertainty/technical risk → Spiral',
    scenario: 'A research project exploring experimental quantum cryptography algorithms with high uncertainty and technical risk across unknown hardware architectures.',
    expectedModel: 'Spiral Model'
  },
  {
    ruleName: 'Frequently changing requirements → Agile',
    scenario: 'A consumer mobile social feed app with frequently changing requirements, weekly user telemetry pivots, and fluid feature backlogs.',
    expectedModel: 'Agile (Scrum)'
  },
  {
    ruleName: 'Continuous secure deployment → DevSecOps',
    scenario: 'A cloud-native microservices backend requiring continuous secure deployment, zero-downtime canary rollouts, and automated SAST/DAST in the CI/CD pipeline.',
    expectedModel: 'DevSecOps'
  },
  {
    ruleName: 'High regulation + evolving requirements → Agile–V-Model/DevSecOps hybrid',
    scenario: 'A digital banking loan module subject to high regulation and evolving requirements from shifting statutory central bank credit directives.',
    expectedModel: 'Agile–DevSecOps Hybrid'
  }
];

specExamples.forEach((spec, idx) => {
  console.log(`\n[Spec Rule ${idx + 1}] Target: ${spec.ruleName}`);
  const reqs = reqAgent.identifyRequirements(spec.scenario);
  const sdlc = sdlcAgent.identifySDLC(spec.scenario, reqs);
  console.log(`  -> Top Selected: ${sdlc.recommendedModel} (${sdlc.suitabilityScore})`);
  console.log(`  -> Rule Triggered / Rationale: ${sdlc.justification.slice(0, 85)}...`);
  
  if (sdlc.recommendedModel !== spec.expectedModel) {
    throw new Error(`Specification rule failed: Expected ${spec.expectedModel}, but received ${sdlc.recommendedModel}`);
  }
  console.log(`  -> PASSED! Correctly ranked ${spec.expectedModel} as #1.`);
});

// 3. INVALID / NON-SOFTWARE INPUT REJECTION (NO AGILE FALLBACK!)
console.log('\n--- SECTION 3: INVALID INPUT REJECTION ---');
const invalidInputs = [
  'i fuck myself',
  'asdfghjkl',
  'I love ice cream and eating apples on sunny days'
];

invalidInputs.forEach((badInput, idx) => {
  console.log(`\n[Rejection Test ${idx + 1}] Input: "${badInput}"`);
  let caught = false;
  try {
    reqAgent.identifyRequirements(badInput);
  } catch (err) {
    caught = true;
    console.log(`  -> Successfully rejected by Agent 1: "${err.message}"`);
  }

  if (!caught) {
    throw new Error(`Agent 1 failed to reject invalid input: "${badInput}"`);
  }

  // Also test Agent 2 direct rejection without requirements
  let sdlcCaught = false;
  try {
    sdlcAgent.identifySDLC(badInput, null);
  } catch (err) {
    sdlcCaught = true;
    console.log(`  -> Successfully rejected by Agent 2 (No Agile Fallback): "${err.message}"`);
  }

  if (!sdlcCaught) {
    throw new Error(`Agent 2 failed to reject invalid input: "${badInput}"`);
  }
});

// 4. ORCHESTRATOR & ARCHITECTURAL CONSISTENCY
console.log('\n--- SECTION 4: ORCHESTRATOR PIPELINE & ARCHITECTURAL CONSISTENCY ---');
const orchestratorResult = await orchestrator.runPipeline(
  'A real-time financial transaction processor with high regulation and evolving requirements.'
);
console.log(`  -> Orchestrator Pipeline Ran: ${orchestratorResult.logs.length} logs captured`);
console.log(`  -> Orchestrator Selected: ${orchestratorResult.sdlcResult.recommendedModel}`);
if (!orchestratorResult.sdlcResult.recommendedModel || orchestratorResult.logs.length === 0) {
  throw new Error('Orchestrator pipeline failed');
}

// 5. SRS EXPORTER INTEGRATION
console.log('\n--- SECTION 5: IEEE 830 SRS EXPORTER VERIFICATION ---');
const srsMarkdown = generateSRSMarkdown(
  'Payment Gateway',
  originalTestCases[0].scenario,
  orchestratorResult.requirementResult,
  orchestratorResult.sdlcResult
);
if (!srsMarkdown.includes('SOFTWARE REQUIREMENTS SPECIFICATION') || !srsMarkdown.includes('Multi-Criteria Decision Analysis (MCDA) Ranking')) {
  throw new Error('SRS Exporter generation failed or missing MCDA ranking');
}
console.log(`  -> SRS Exporter Generated Valid Markdown (${srsMarkdown.length} bytes)`);

console.log('\n================================================================');
console.log('ALL VERIFICATION TESTS & SPECIFICATION RULES PASSED (100%)!');
console.log('================================================================\n');
