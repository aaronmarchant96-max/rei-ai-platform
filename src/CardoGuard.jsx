import { useEffect, useMemo, useState } from "react";
import {
  buildCardoGuardComparison,
  calculateCardoGuardReview,
  formatMoney,
  getScenarioById,
  CARDO_GUARD_SCENARIOS
} from "./lib/cardoGuard.js";

function getInitialDraft() {
  const scenario = CARDO_GUARD_SCENARIOS[0];
  return {
    scenarioId: scenario.id,
    confidence: scenario.defaultConfidence,
    costToAct: scenario.defaultCostToAct,
    costToMiss: scenario.defaultCostToMiss
  };
}

function toNumber(value) {
  const next = Number.parseFloat(value);
  return Number.isFinite(next) ? next : 0;
}

function Metric({ label, value, note }) {
  return (
    <div className="mini-card cardo-guard__metric">
      <div className="card-label">{label}</div>
      <div className="cardo-guard__metric-value">{value}</div>
      {note ? <div className="muted">{note}</div> : null}
    </div>
  );
}

export default function CardoGuard() {
  const [draft, setDraft] = useState(getInitialDraft);
  const [submitted, setSubmitted] = useState(getInitialDraft);

  const selectedScenario = getScenarioById(draft.scenarioId);

  useEffect(() => {
    const scenario = getScenarioById(draft.scenarioId);
    setDraft((current) => ({
      ...current,
      confidence: scenario.defaultConfidence,
      costToAct: scenario.defaultCostToAct,
      costToMiss: scenario.defaultCostToMiss
    }));
    setSubmitted({
      scenarioId: scenario.id,
      confidence: scenario.defaultConfidence,
      costToAct: scenario.defaultCostToAct,
      costToMiss: scenario.defaultCostToMiss
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.scenarioId]);

  const review = useMemo(() => calculateCardoGuardReview(submitted), [submitted]);
  const comparison = useMemo(() => buildCardoGuardComparison(review), [review]);

  const confidenceBandLabel = `${review.confidenceBand} calibration band`;

  function updateDraft(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function runGuardCheck() {
    setSubmitted({
      scenarioId: draft.scenarioId,
      confidence: toNumber(draft.confidence),
      costToAct: toNumber(draft.costToAct),
      costToMiss: toNumber(draft.costToMiss)
    });
  }

  function resetToScenario() {
    const scenario = getScenarioById(draft.scenarioId);
    const nextDraft = {
      scenarioId: scenario.id,
      confidence: scenario.defaultConfidence,
      costToAct: scenario.defaultCostToAct,
      costToMiss: scenario.defaultCostToMiss
    };
    setDraft(nextDraft);
    setSubmitted(nextDraft);
  }

  return (
    <section className="cardo-guard panel-stack">
      <section className="panel cardo-guard__hero">
        <div className="panel__head">
          <div>
            <div className="card-label">PromptHound Labs</div>
            <h2>CARDO GUARD</h2>
            <p className="lede">
              A synthetic decision validator that checks whether an AI risk score justifies a costly operational action.
            </p>
          </div>
          <div className="cardo-guard__status">
            <span className="status-badge status-badge--cyan">Synthetic only</span>
            <span className="status-badge status-badge--muted">Launch gate</span>
          </div>
        </div>

        <div className="cardo-guard__intro mini-card">
          CARDO GUARD does not predict the world. It compares the cost of acting against the cost of missing and
          makes the hinge visible before anyone treats a score like a decision.
        </div>
      </section>

      <div className="cardo-guard__layout">
        <section className="panel">
          <div className="panel__head">
            <div>
              <div className="card-label">Synthetic input</div>
              <h2>Set the scenario</h2>
            </div>
          </div>

          <div className="control-group">
            <label className="control-label" htmlFor="cardo-scenario">
              Scenario
            </label>
            <select
              id="cardo-scenario"
              className="cardo-guard__select"
              value={draft.scenarioId}
              onChange={(event) => updateDraft("scenarioId", event.target.value)}
            >
              {CARDO_GUARD_SCENARIOS.map((scenario) => (
                <option key={scenario.id} value={scenario.id}>
                  {scenario.label}
                </option>
              ))}
            </select>
            <div className="muted cardo-guard__hint">{selectedScenario.summary}</div>
          </div>

          <div className="control-group">
            <div className="control-label">Model confidence</div>
            <div className="cardo-guard__slider-row">
              <input
                type="range"
                min="55"
                max="97"
                step="1"
                value={draft.confidence}
                onChange={(event) => updateDraft("confidence", Number(event.target.value))}
                className="cardo-guard__range"
                aria-label="Model confidence"
              />
              <div className="cardo-guard__range-value">{Number(draft.confidence)}%</div>
            </div>
            <div className="muted">Synthetic calibration band updates with the selected confidence.</div>
          </div>

          <div className="mini-grid cardo-guard__costs">
            <div className="control-group">
              <label className="control-label" htmlFor="cardo-act">
                Cost to act
              </label>
              <input
                id="cardo-act"
                type="number"
                min="0"
                step="1000"
                value={draft.costToAct}
                onChange={(event) => updateDraft("costToAct", toNumber(event.target.value))}
                className="cardo-guard__input"
              />
            </div>

            <div className="control-group">
              <label className="control-label" htmlFor="cardo-miss">
                Cost of missing
              </label>
              <input
                id="cardo-miss"
                type="number"
                min="0"
                step="1000"
                value={draft.costToMiss}
                onChange={(event) => updateDraft("costToMiss", toNumber(event.target.value))}
                className="cardo-guard__input"
              />
            </div>
          </div>

          <div className="button-row cardo-guard__actions">
            <button type="button" className="pill pill--primary" onClick={runGuardCheck}>
              Run guard check
            </button>
            <button type="button" className="pill" onClick={resetToScenario}>
              Reset synthetic example
            </button>
          </div>

          <div className="cardo-guard__rules mini-card">
            <div className="card-label">Guardrails</div>
            <ul className="cardo-guard__list">
              <li>Decision validator, not a prediction engine.</li>
              <li>Synthetic scenario only.</li>
              <li>Costs stay visible in real units.</li>
              <li>The hinge should be obvious before the recommendation.</li>
            </ul>
          </div>
        </section>

        <section className="output-panel cardo-guard__report">
          <div className="output-panel__head">
            <div>
              <div className="card-label">Decision report</div>
              <h2 className="output-title">Synthetic launch gate</h2>
            </div>
            <div className="status-badge status-badge--violet">{confidenceBandLabel}</div>
          </div>

          <p className="output-summary">
            The current snapshot shows what the decision looks like if the synthetic calibration and cost inputs are
            trusted exactly as written.
          </p>

          <div className="output-anchor cardo-guard__decision">
            <div className="card-label">Recommendation</div>
            <div className="cardo-guard__decision-line">{review.recommendation}</div>
            <div className="muted">{review.explanation}</div>
          </div>

          <div className="mini-grid">
            <Metric label="Confidence" value={`${review.confidence}%`} note={confidenceBandLabel} />
            <Metric label="False alarm rate" value={`${Math.round(review.falseAlarmRate * 100)}%`} note="Synthetic band" />
            <Metric
              label="Chance the event is real after calibration"
              value={`${Math.round(review.calibratedEventLikelihood * 100)}%`}
              note="Based on the synthetic false-alarm band."
            />
            <Metric label="Expected action waste" value={formatMoney(review.expectedActionWaste)} />
            <Metric label="Expected miss loss" value={formatMoney(review.expectedMissLoss)} />
          </div>

          <div className="cardo-guard__hinge mini-card">
            <div className="card-label">The hinge</div>
            <div>
              {review.shouldAct
                ? `Expected miss loss ${formatMoney(review.expectedMissLoss)} is higher than expected action waste ${formatMoney(review.expectedActionWaste)}.`
                : `Expected action waste ${formatMoney(review.expectedActionWaste)} is higher than expected miss loss ${formatMoney(review.expectedMissLoss)}.`}
            </div>
          </div>

          <div className="mini-grid">
            <div className="mini-card">
              <div className="card-label">Scenario</div>
              <div>{review.scenario.label}</div>
              <div className="muted">{review.scenario.summary}</div>
            </div>
            <div className="mini-card">
              <div className="card-label">Checks</div>
              <div className="stacked-list">
                <span>Synthetic inputs only</span>
                <span>Decision tradeoff visible</span>
                <span>No claim of model accuracy gain</span>
              </div>
            </div>
          </div>

          <div className="mini-card">
            <div className="card-label">What would change the verdict</div>
            <ul className="cardo-guard__list">
              {comparison.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="mini-card">
            <div className="card-label">What this is not</div>
            <div className="stacked-list">
              <span>Not a prediction model.</span>
              <span>Not expert replacement.</span>
              <span>Not a generic AI governance dashboard.</span>
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
