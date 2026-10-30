import React, { useState } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Copy, 
  Check, 
  Layers,
  AlertTriangle,
  Download,
  Sliders,
  ChevronDown,
  ChevronUp,
  Award
} from 'lucide-react';
import { RequirementAgent } from './agents/requirementAgent.js';
import { SdlcAgent } from './agents/sdlcAgent.js';
import { PRESET_SCENARIOS } from './agents/presets.js';
import { generateSRSMarkdown } from './utils/srsExporter.js';

const requirementAgent = new RequirementAgent();
const sdlcAgent = new SdlcAgent();

// Specification deterministic examples from prompt
const SPEC_EXAMPLES = [
  {
    label: 'Waterfall: Stable & Approvals',
    title: 'Stable requirements + extensive approvals → Waterfall',
    scenario: 'A legacy enterprise accounting ledger system with stable requirements and extensive approvals across executive and compliance committees.'
  },
  {
    label: 'V-Model: Strict Verification',
    title: 'Strict verification/validation → V-Model',
    scenario: 'A medical ventilator firmware control system requiring strict verification/validation, formal traceability, and safety-critical audit gates.'
  },
  {
    label: 'Spiral: High Uncertainty',
    title: 'High uncertainty/technical risk → Spiral',
    scenario: 'An R&D research project exploring experimental quantum cryptography algorithms with high uncertainty and technical risk across novel hardware.'
  },
  {
    label: 'Agile: Changing Reqs',
    title: 'Frequently changing requirements → Agile',
    scenario: 'A consumer mobile social feed app with frequently changing requirements, weekly user telemetry pivots, and fluid feature backlogs.'
  },
  {
    label: 'DevSecOps: Secure Deploy',
    title: 'Continuous secure deployment → DevSecOps',
    scenario: 'A cloud-native microservices platform requiring continuous secure deployment, automated SAST/DAST in CI/CD, and zero-downtime canary rollouts.'
  },
  {
    label: 'Hybrid: Regulated & Evolving',
    title: 'High regulation + evolving requirements → Agile–V-Model/DevSecOps hybrid',
    scenario: 'A digital banking loan module subject to high regulation and evolving requirements from shifting central bank digital lending directives.'
  }
];

const initialPreset = PRESET_SCENARIOS[1];
const initialReqs = requirementAgent.identifyRequirements(initialPreset.scenarioDescription);
const initialSdlc = sdlcAgent.evaluateSDLC(initialPreset.scenarioDescription, initialReqs, initialPreset.defaultFactors);

export default function App() {
  const [scenarioInput, setScenarioInput] = useState(initialPreset.scenarioDescription);
  const [selectedScenarioTitle, setSelectedScenarioTitle] = useState(initialPreset.title);
  const [requirementsData, setRequirementsData] = useState(initialReqs);
  const [sdlcData, setSdlcData] = useState(initialSdlc);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expandedModelId, setExpandedModelId] = useState(null);
  const [activeTab, setActiveTab] = useState('spec'); // 'spec' | 'enterprise'

  const runAgents = (inputScenario, title = 'Custom Software Scenario', customFactors = {}) => {
    setIsProcessing(true);
    setErrorMessage(null);

    setTimeout(() => {
      try {
        // Task (i): Agent 1 identifies requirements (validates and extracts)
        const reqs = requirementAgent.identifyRequirements(inputScenario);

        // Task (ii): Agent 2 MCDA evaluation
        const sdlc = sdlcAgent.evaluateSDLC(inputScenario, reqs, customFactors);

        setRequirementsData(reqs);
        setSdlcData(sdlc);
        setSelectedScenarioTitle(title);
      } catch (err) {
        setErrorMessage(err.message || 'The provided scenario could not be processed.');
        setRequirementsData(null);
        setSdlcData(null);
      } finally {
        setIsProcessing(false);
      }
    }, 150);
  };

  const handleSelectPreset = (preset) => {
    setScenarioInput(preset.scenarioDescription);
    runAgents(preset.scenarioDescription, preset.title, preset.defaultFactors || {});
  };

  const handleSelectSpecExample = (spec) => {
    setScenarioInput(spec.scenario);
    runAgents(spec.scenario, spec.title);
  };

  const handleCopySummary = () => {
    if (!requirementsData || !sdlcData) return;

    const summaryText = `=== AGENT 1: SOFTWARE REQUIREMENTS SPECIFICATION ===
Scenario: ${scenarioInput}
Domain: ${requirementsData.domain}

Functional Requirements (${requirementsData.functionalRequirements.length}):
${requirementsData.functionalRequirements.map(f => `[${f.id}] ${f.title} (${f.priority} Priority)\n- Statement: ${f.statement || f.description}`).join('\n\n')}

Non-Functional Requirements (${requirementsData.nonFunctionalRequirements.length}):
${requirementsData.nonFunctionalRequirements.map(n => `[${n.id}] [${n.category}] (${n.priority})\n- ${n.statement || n.description}`).join('\n\n')}

=== AGENT 2: MULTI-CRITERIA DECISION ANALYSIS (MCDA) SDLC RANKING ===
Primary Recommendation: ${sdlcData.recommendedModel} (${sdlcData.suitabilityScore} Match)
Justification: ${sdlcData.justification}

Complete Ranked Models:
${sdlcData.rankedRecommendations.map(r => `${r.rank}. ${r.name} — ${r.suitabilityScore} (${r.matchLevel})\n   Rationale: ${r.rationale}`).join('\n\n')}

Evaluated Decision Factors:
- Requirement Stability: ${sdlcData.evaluatedFactors.requirementStability}/100
- Change Frequency: ${sdlcData.evaluatedFactors.changeFrequency}/100
- Regulatory Criticality: ${sdlcData.evaluatedFactors.regulatoryCriticality}/100
- Security Risk: ${sdlcData.evaluatedFactors.securityRisk}/100
- Technical Uncertainty: ${sdlcData.evaluatedFactors.technicalUncertainty}/100
- Failure Consequence: ${sdlcData.evaluatedFactors.failureConsequence}/100
- Continuous Deployment Need: ${sdlcData.evaluatedFactors.continuousDeploymentNeed}/100
- Formal Verification Need: ${sdlcData.evaluatedFactors.formalVerificationNeed}/100
`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportSRS = () => {
    if (!requirementsData || !sdlcData) return;
    const srsMarkdown = generateSRSMarkdown(selectedScenarioTitle, scenarioInput, requirementsData, sdlcData);
    const blob = new Blob([srsMarkdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SRS_SDLC_${selectedScenarioTitle.replace(/[^a-zA-Z0-9]/g, '_')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="app-wrapper">
      {/* HEADER */}
      <header className="app-header">
        <div className="header-badge">
          <Sparkles size={14} /> MCDA Agentic-AI Dual-Agent Architecture
        </div>
        <h1>SDLC Selection Engine & Requirements Synthesizer</h1>
        <p>
          Collaborative multi-agent intelligence performing rigorous: <strong>(i) Requirements Engineering</strong> and <strong>(ii) Multi-Criteria Decision Analysis (MCDA) SDLC Ranking</strong>.
        </p>
      </header>

      {/* INPUT CARD */}
      <section className="input-card">
        <div className="input-label-row">
          <label className="input-title" htmlFor="scenario-textarea">
            <Layers size={18} /> Specify Software Scenario, Module, or Requirements:
          </label>
        </div>

        {/* Preset Selector Tabs */}
        <div className="preset-tabs-header">
          <button 
            className={`preset-tab-btn ${activeTab === 'spec' ? 'active' : ''}`}
            onClick={() => setActiveTab('spec')}
          >
            Specification Deterministic Rules (6)
          </button>
          <button 
            className={`preset-tab-btn ${activeTab === 'enterprise' ? 'active' : ''}`}
            onClick={() => setActiveTab('enterprise')}
          >
            Enterprise Production Presets (5)
          </button>
        </div>

        {/* Quick Scenario Pills */}
        <div className="sample-pills">
          {activeTab === 'spec' ? (
            SPEC_EXAMPLES.map((spec, idx) => (
              <button
                key={idx}
                id={`spec-pill-${idx}`}
                className="sample-pill-btn spec-rule-pill"
                onClick={() => handleSelectSpecExample(spec)}
                title={spec.title}
              >
                {spec.label}
              </button>
            ))
          ) : (
            PRESET_SCENARIOS.map((preset, idx) => (
              <button
                key={idx}
                id={`preset-pill-${idx}`}
                className="sample-pill-btn"
                onClick={() => handleSelectPreset(preset)}
                title={preset.category}
              >
                {preset.title.split('&')[0].trim()}
              </button>
            ))
          )}
        </div>

        <textarea
          id="scenario-textarea"
          className="scenario-textarea"
          rows={3}
          value={scenarioInput}
          onChange={(e) => setScenarioInput(e.target.value)}
          placeholder="Describe your software scenario, module, or functionality here (or test with rejection cases like 'i fuck myself')..."
        />

        <div className="action-bar">
          <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
            {scenarioInput.trim().length} characters
          </span>

          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {requirementsData && sdlcData && (
              <>
                <button
                  id="export-srs-btn"
                  className="sample-pill-btn"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1rem' }}
                  onClick={handleExportSRS}
                >
                  <Download size={16} /> Export SRS (IEEE 830)
                </button>

                <button
                  id="copy-summary-btn"
                  className="sample-pill-btn"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.65rem 1rem' }}
                  onClick={handleCopySummary}
                >
                  {copied ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                  {copied ? 'Copied' : 'Copy Summary'}
                </button>
              </>
            )}

            <button
              id="run-agents-btn"
              className="submit-btn"
              onClick={() => runAgents(scenarioInput, 'Custom Scenario')}
              disabled={isProcessing || !scenarioInput.trim()}
            >
              {isProcessing ? 'Evaluating with MCDA...' : 'Run Dual Agents'} <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* ERROR / REJECTION BANNER */}
      {errorMessage && (
        <section className="rejection-banner" id="rejection-banner">
          <div className="rejection-icon">
            <AlertTriangle size={24} />
          </div>
          <div className="rejection-content">
            <h3 className="rejection-title">Specification Rejected (No Agile Default)</h3>
            <p className="rejection-desc">{errorMessage}</p>
            <p className="rejection-hint">
              <strong>Requirement:</strong> Completely invalid or non-software inputs are rejected deterministically by the validation engine instead of falling back to Agile. Please input a descriptive software module or select one of the presets above.
            </p>
          </div>
        </section>
      )}

      {/* DUAL AGENTS OUTPUT GRID */}
      {requirementsData && sdlcData && (
        <main className="agents-grid">
          {/* PANEL 1: AGENT 1 - REQUIREMENTS SPECIFICATION */}
          <article className="agent-panel agent-1" id="agent-1-panel">
            <header className="agent-panel-header">
              <span className="agent-meta-tag">Agent 1: Requirements Engineer</span>
              <h2 className="agent-panel-title">Task (i): Software Requirements</h2>
              <div className="panel-sub-row">
                <span className="domain-badge">{requirementsData.domain}</span>
                <span className="quality-badge">Quality Score: {requirementsData.qualityReport?.overallScore || 92}/100</span>
              </div>
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
                      {fr.priority} Priority
                    </span>
                  </div>
                  <h3 className="req-item-title">{fr.title}</h3>
                  <p className="req-item-desc">{fr.statement || fr.description}</p>
                  {fr.acceptanceCriteria && fr.acceptanceCriteria.length > 0 && (
                    <div className="req-ac-list">
                      <span className="req-ac-label">Acceptance Criteria:</span>
                      <ul>
                        {fr.acceptanceCriteria.slice(0, 2).map((ac, idx) => (
                          <li key={idx}>{ac}</li>
                        ))}
                      </ul>
                    </div>
                  )}
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
                    <span className="category-pill">
                      {nfr.category}
                    </span>
                  </div>
                  <h4 className="nfr-title">{nfr.title || nfr.category}</h4>
                  <p className="req-item-desc">{nfr.statement || nfr.description}</p>
                  {nfr.targetMetrics && (
                    <div className="target-metric-box">
                      <strong>Target Metric:</strong> {nfr.targetMetrics}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </article>

          {/* PANEL 2: AGENT 2 - SDLC SELECTION (MCDA RANKED ENGINE) */}
          <article className="agent-panel agent-2" id="agent-2-panel">
            <header className="agent-panel-header">
              <span className="agent-meta-tag">Agent 2: SDLC Architect (MCDA Engine)</span>
              <h2 className="agent-panel-title">Task (ii): Complete SDLC Ranking</h2>
              <p className="agent-panel-sub">
                Evaluated against 8 weighted multi-criteria decision factors & deterministic rules
              </p>
            </header>

            {/* Primary Recommended Model Banner */}
            <div className="sdlc-model-highlight">
              <div className="sdlc-model-header-row">
                <span className="sdlc-model-label">
                  <Award size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Top Recommendation
                </span>
                <span className="match-badge">{sdlcData.suitabilityScore} Suitability Match</span>
              </div>
              <div className="sdlc-model-name">
                {sdlcData.recommendedModel}
              </div>
              {sdlcData.primaryModel?.triggeredRule && (
                <div className="rule-triggered-tag">
                  Deterministic Rule: {sdlcData.primaryModel.triggeredRule}
                </div>
              )}
              <p className="justification-text" style={{ marginTop: '0.85rem' }}>
                {sdlcData.justification}
              </p>
            </div>

            {/* Complete MCDA Ranked List (Requirement 2, 4, 9) */}
            <div className="mcda-ranking-section">
              <div className="req-section-title">
                <span>Complete MCDA Model Ranking ({sdlcData.rankedRecommendations.length} Models)</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Ranked Highest to Lowest</span>
              </div>

              <div className="mcda-table-container">
                {sdlcData.rankedRecommendations.map((model) => {
                  const isExpanded = expandedModelId === model.id;
                  const isPrimary = model.rank === 1;

                  return (
                    <div 
                      key={model.id} 
                      className={`mcda-rank-card ${isPrimary ? 'primary-rank-card' : ''}`}
                      id={`mcda-rank-card-${model.id}`}
                    >
                      <div className="mcda-card-main-row" onClick={() => setExpandedModelId(isExpanded ? null : model.id)}>
                        <div className="mcda-rank-badge">
                          #{model.rank}
                        </div>
                        <div className="mcda-model-info">
                          <div className="mcda-model-title-row">
                            <span className="mcda-model-name">{model.name}</span>
                            <span className={`match-level-tag ${model.matchLevel.toLowerCase().replace(/\s+/g, '-')}`}>
                              {model.matchLevel}
                            </span>
                          </div>

                          {/* Progress score bar */}
                          <div className="mcda-score-bar-wrapper">
                            <div 
                              className={`mcda-score-bar-fill ${model.score >= 90 ? 'high' : model.score >= 70 ? 'medium' : 'low'}`}
                              style={{ width: `${model.score}%` }}
                            />
                          </div>
                        </div>

                        <div className="mcda-score-number">
                          {model.suitabilityScore}
                          <button className="expand-toggle-btn" aria-label="Toggle details">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>

                      {/* Rationale & Tradeoffs */}
                      <div className={`mcda-rationale-accordion ${isExpanded ? 'open' : ''}`}>
                        <p className="mcda-rationale-text">
                          <strong>Evaluation:</strong> {model.rationale}
                        </p>
                        <div className="pros-cons-grid">
                          <div className="pro-box">
                            <span className="pro-title">Key Strengths:</span>
                            <ul>
                              {model.pros.map((p, idx) => (
                                <li key={idx}>+ {p}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="con-box">
                            <span className="con-title">Challenges / Constraints:</span>
                            <ul>
                              {model.cons.map((c, idx) => (
                                <li key={idx}>- {c}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Evaluated Decision Factors Breakdown (Requirement 3) */}
            <div className="factors-evaluation-section">
              <div className="req-section-title">
                <span>
                  <Sliders size={14} style={{ display: 'inline', marginRight: '4px' }} />
                  Evaluated Decision Criteria (8 Factors)
                </span>
              </div>
              <div className="factors-grid">
                <div className="factor-tile">
                  <span className="factor-label">Requirement Stability</span>
                  <div className="factor-bar"><div className="factor-fill" style={{ width: `${sdlcData.evaluatedFactors.requirementStability}%` }} /></div>
                  <span className="factor-value">{sdlcData.evaluatedFactors.requirementStability}%</span>
                </div>
                <div className="factor-tile">
                  <span className="factor-label">Change Frequency</span>
                  <div className="factor-bar"><div className="factor-fill" style={{ width: `${sdlcData.evaluatedFactors.changeFrequency}%` }} /></div>
                  <span className="factor-value">{sdlcData.evaluatedFactors.changeFrequency}%</span>
                </div>
                <div className="factor-tile">
                  <span className="factor-label">Regulatory Criticality</span>
                  <div className="factor-bar"><div className="factor-fill" style={{ width: `${sdlcData.evaluatedFactors.regulatoryCriticality}%` }} /></div>
                  <span className="factor-value">{sdlcData.evaluatedFactors.regulatoryCriticality}%</span>
                </div>
                <div className="factor-tile">
                  <span className="factor-label">Security Risk</span>
                  <div className="factor-bar"><div className="factor-fill" style={{ width: `${sdlcData.evaluatedFactors.securityRisk}%` }} /></div>
                  <span className="factor-value">{sdlcData.evaluatedFactors.securityRisk}%</span>
                </div>
                <div className="factor-tile">
                  <span className="factor-label">Technical Uncertainty</span>
                  <div className="factor-bar"><div className="factor-fill" style={{ width: `${sdlcData.evaluatedFactors.technicalUncertainty}%` }} /></div>
                  <span className="factor-value">{sdlcData.evaluatedFactors.technicalUncertainty}%</span>
                </div>
                <div className="factor-tile">
                  <span className="factor-label">Failure Consequence</span>
                  <div className="factor-bar"><div className="factor-fill" style={{ width: `${sdlcData.evaluatedFactors.failureConsequence}%` }} /></div>
                  <span className="factor-value">{sdlcData.evaluatedFactors.failureConsequence}%</span>
                </div>
                <div className="factor-tile">
                  <span className="factor-label">Continuous Deployment</span>
                  <div className="factor-bar"><div className="factor-fill" style={{ width: `${sdlcData.evaluatedFactors.continuousDeploymentNeed}%` }} /></div>
                  <span className="factor-value">{sdlcData.evaluatedFactors.continuousDeploymentNeed}%</span>
                </div>
                <div className="factor-tile">
                  <span className="factor-label">Formal Verification</span>
                  <div className="factor-bar"><div className="factor-fill" style={{ width: `${sdlcData.evaluatedFactors.formalVerificationNeed}%` }} /></div>
                  <span className="factor-value">{sdlcData.evaluatedFactors.formalVerificationNeed}%</span>
                </div>
              </div>
            </div>

            {/* Proposed SDLC Phases */}
            <div style={{ marginTop: '1.75rem' }}>
              <div className="req-section-title">
                <span>Proposed Project Phases ({sdlcData.keyPhases.length})</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--color-agent2-light)' }}>{sdlcData.recommendedModel}</span>
              </div>
              <div className="phase-steps-list">
                {sdlcData.keyPhases.map((phaseItem, pIdx) => (
                  <div key={pIdx} className="phase-step-item">
                    <span className="phase-number-box">Phase {pIdx + 1}</span>
                    <div>
                      <div className="phase-content-title">{phaseItem.phase}</div>
                      <div className="phase-content-desc">{phaseItem.description}</div>
                    </div>
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
