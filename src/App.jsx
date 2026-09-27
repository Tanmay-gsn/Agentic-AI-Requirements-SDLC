import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  GitBranch, 
  ArrowRight, 
  CheckCircle, 
  Sparkles, 
  Copy, 
  Check, 
  ShieldCheck, 
  Layers
} from 'lucide-react';
import { RequirementAgent } from './agents/requirementAgent.js';
import { SdlcAgent } from './agents/sdlcAgent.js';

const requirementAgent = new RequirementAgent();
const sdlcAgent = new SdlcAgent();

const SAMPLE_SCENARIOS = [
  {
    label: 'Digital Payment Gateway',
    text: 'A high-throughput real-time payment gateway handling card and UPI transactions. Needs automated fraud detection, sub-second latency, zero plain-text card storage, PCI-DSS compliance, and high availability.'
  },
  {
    label: 'Hospital Patient Portal',
    text: 'A healthcare consultation and patient records module allowing patients to book appointments, consult doctors via video, access lab reports, and manage e-prescriptions. Must comply with HIPAA privacy standards.'
  },
  {
    label: 'E-Commerce Checkout & Cart',
    text: 'An online shopping cart and multi-vendor checkout functionality with real-time inventory reservation, promotional discount coupons, flash sale auto-scaling, and order tracking notifications.'
  },
  {
    label: 'Online Examination System',
    text: 'A web-based university testing module supporting timed multiple-choice and coding tests, automated grading, anti-cheating browser lockdown, and accessibility compliance for students.'
  }
];

export default function App() {
  const [scenarioInput, setScenarioInput] = useState(SAMPLE_SCENARIOS[0].text);
  const [requirementsData, setRequirementsData] = useState(null);
  const [sdlcData, setSdlcData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Execute on initial render
  useEffect(() => {
    runAgents(SAMPLE_SCENARIOS[0].text);
  }, []);

  const runAgents = (inputScenario) => {
    setIsProcessing(true);
    setTimeout(() => {
      // Task (i): Agent 1 identifies requirements
      const reqs = requirementAgent.identifyRequirements(inputScenario);
      
      // Task (ii): Agent 2 identifies suitable SDLC
      const sdlc = sdlcAgent.identifySDLC(inputScenario, reqs);

      setRequirementsData(reqs);
      setSdlcData(sdlc);
      setIsProcessing(false);
    }, 250);
  };

  const handleSampleClick = (sample) => {
    setScenarioInput(sample.text);
    runAgents(sample.text);
  };

  const handleCopySummary = () => {
    if (!requirementsData || !sdlcData) return;

    const summaryText = `--- AGENT 1: SOFTWARE REQUIREMENTS ---
Scenario: ${scenarioInput}

Functional Requirements:
${requirementsData.functionalRequirements.map(f => `[${f.id}] ${f.title} (${f.priority} Priority)\n- ${f.description}`).join('\n\n')}

Non-Functional Requirements:
${requirementsData.nonFunctionalRequirements.map(n => `[${n.id}] [${n.category}]\n- ${n.description}`).join('\n\n')}

--- AGENT 2: SDLC RECOMMENDATION ---
Recommended Model: ${sdlcData.recommendedModel} (Suitability: ${sdlcData.suitabilityScore})
Justification: ${sdlcData.justification}

Key Phases:
${sdlcData.keyPhases.map(p => `- ${p.phase}: ${p.description}`).join('\n')}
`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="app-wrapper">
      {/* HEADER */}
      <header className="app-header">
        <div className="header-badge">
          <Sparkles size={14} /> Agentic-AI Dual-Agent System
        </div>
        <h1>Requirements & SDLC Intelligence</h1>
        <p>
          Collaborative AI agents performing: <strong>(i) Software Requirements Identification</strong> and <strong>(ii) SDLC Selection</strong>.
        </p>
      </header>

      {/* INPUT CARD */}
      <section className="input-card">
        <div className="input-label-row">
          <label className="input-title" htmlFor="scenario-textarea">
            <Layers size={18} /> Specify Scenario, Functionality, or Module:
          </label>
        </div>

        {/* Quick Sample Scenarios */}
        <div className="sample-pills">
          <span className="sample-pills-label">Quick Scenarios:</span>
          {SAMPLE_SCENARIOS.map((sample, idx) => (
            <button
              key={idx}
              id={`sample-btn-${idx}`}
              className="sample-pill-btn"
              onClick={() => handleSampleClick(sample)}
            >
              {sample.label}
            </button>
          ))}
        </div>

        <textarea
          id="scenario-textarea"
          className="scenario-textarea"
          rows={3}
          value={scenarioInput}
          onChange={(e) => setScenarioInput(e.target.value)}
          placeholder="Describe your software scenario, module, or functionality here..."
        />

        <div className="action-bar">
          <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
            {scenarioInput.trim().length} characters
          </span>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              id="copy-summary-btn"
              className="sample-pill-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1rem' }}
              onClick={handleCopySummary}
            >
              {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy Output'}
            </button>

            <button
              id="run-agents-btn"
              className="submit-btn"
              onClick={() => runAgents(scenarioInput)}
              disabled={isProcessing || !scenarioInput.trim()}
            >
              {isProcessing ? 'Analyzing...' : 'Run Dual Agents'} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* DUAL AGENTS OUTPUT GRID */}
      {requirementsData && sdlcData && (
        <main className="agents-grid">
          {/* PANEL 1: AGENT 1 - REQUIREMENTS IDENTIFICATION */}
          <article className="agent-panel agent-1" id="agent-1-panel">
            <header className="agent-panel-header">
              <span className="agent-meta-tag">Agent 1: Requirements Engineer</span>
              <h2 className="agent-panel-title">Task (i): Software Requirements</h2>
              <p className="agent-panel-sub">
                Identified {requirementsData.functionalRequirements.length} Functional & {requirementsData.nonFunctionalRequirements.length} Non-Functional specifications
              </p>
            </header>

            {/* Functional Requirements */}
            <div className="req-section-title">
              <span>Functional Requirements ({requirementsData.functionalRequirements.length})</span>
            </div>
            <div className="req-items-list">
              {requirementsData.functionalRequirements.map((fr) => (
                <div key={fr.id} className="req-item-box" id={`fr-item-${fr.id}`}>
                  <div className="req-item-header">
                    <span className="req-id">{fr.id}</span>
                    <span className={`priority-pill ${fr.priority.toLowerCase()}`}>
                      {fr.priority}
                    </span>
                  </div>
                  <h3 className="req-item-title">{fr.title}</h3>
                  <p className="req-item-desc">{fr.description}</p>
                </div>
              ))}
            </div>

            {/* Non-Functional Requirements */}
            <div className="req-section-title" style={{ marginTop: '1.75rem' }}>
              <span>Non-Functional Requirements ({requirementsData.nonFunctionalRequirements.length})</span>
            </div>
            <div className="req-items-list">
              {requirementsData.nonFunctionalRequirements.map((nfr) => (
                <div key={nfr.id} className="req-item-box" id={`nfr-item-${nfr.id}`}>
                  <div className="req-item-header">
                    <span className="req-id" style={{ color: 'var(--color-agent2-light)' }}>{nfr.id}</span>
                    <span className="priority-pill" style={{ background: 'rgba(255,255,255,0.08)', color: '#e5e7eb' }}>
                      {nfr.category}
                    </span>
                  </div>
                  <p className="req-item-desc">{nfr.description}</p>
                </div>
              ))}
            </div>
          </article>

          {/* PANEL 2: AGENT 2 - SDLC SELECTION */}
          <article className="agent-panel agent-2" id="agent-2-panel">
            <header className="agent-panel-header">
              <span className="agent-meta-tag">Agent 2: SDLC Architect</span>
              <h2 className="agent-panel-title">Task (ii): Suitable SDLC Model</h2>
              <p className="agent-panel-sub">
                Evaluated against requirement characteristics, security, and delivery cadence
              </p>
            </header>

            {/* Recommended Model Highlight */}
            <div className="sdlc-model-highlight">
              <div className="sdlc-model-label">Recommended Model</div>
              <div className="sdlc-model-name">
                <span>{sdlcData.recommendedModel}</span>
                <span className="match-badge">{sdlcData.suitabilityScore} Suitability</span>
              </div>
            </div>

            {/* Justification */}
            <div className="justification-box">
              <div className="req-section-title">Why this SDLC is suitable</div>
              <p className="justification-text">{sdlcData.justification}</p>
            </div>

            {/* Project Phases */}
            <div>
              <div className="req-section-title">Proposed SDLC Phases</div>
              <div className="phase-steps-list">
                {sdlcData.keyPhases.map((phaseItem, pIdx) => (
                  <div key={pIdx} className="phase-step-item">
                    <span className="phase-number-box">P{pIdx + 1}</span>
                    <div>
                      <div className="phase-content-title">{phaseItem.phase}</div>
                      <div className="phase-content-desc">{phaseItem.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alternative Comparison */}
            <div>
              <div className="req-section-title">Alternative Models Comparison</div>
              <div className="tradeoffs-box">
                {sdlcData.alternatives.map((alt, aIdx) => (
                  <div key={aIdx} className="tradeoff-row">
                    <span className="tradeoff-name">{alt.name} ({alt.suitability})</span>
                    <span className="tradeoff-reason">{alt.note}</span>
                  </div>
                ))}
              </div>
            </div>
          </article>
        </main>
      )}
    </div>
  );
}
