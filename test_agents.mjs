import { RequirementAgent } from './src/agents/requirementAgent.js';
import { SdlcAgent } from './src/agents/sdlcAgent.js';

console.log('================================================================');
console.log('RUNNING STREAMLINED DUAL-AGENT VERIFICATION');
console.log('================================================================');

const reqAgent = new RequirementAgent();
const sdlcAgent = new SdlcAgent();

const testCases = [
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

testCases.forEach((tc, idx) => {
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
  if (!sdlc.recommendedModel) {
    throw new Error(`Agent 2 failed for ${tc.name}`);
  }
});

console.log('\n================================================================');
console.log('ALL DUAL-AGENT CORE TESTS PASSED SUCCESSFULLY! (4/4)');
console.log('================================================================\n');
