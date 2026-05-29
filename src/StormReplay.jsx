import { useMemo, useState } from "react";

const CASE_ID = "case_001";
const CASE_TITLE = "December 10 to 11, 2021 Tornado Outbreak Replay";
const CASE_STATUS = "Calibration pass";
const FRAMES_REVIEWED = 24;
const KNOWN_ACTIVITY_WINDOW = "22:00-23:00 CST in Graves County";
const SHORT_LIMITATION_LINE = "Historical replay only. Not a forecast. Not an alert.";
const LIMITATION_STATEMENT = [
  "Storm Replay is not a forecasting system.",
  "Storm Replay is not a warning system.",
  "Storm Replay does not confirm tornado formation.",
  "It reviews historical weather imagery and prepares evidence for human inspection."
].join(" ");
const CONTACT_SHEET_URL = "https://github.com/aaronmarchant96-max/uap-footage-analyzer/tree/main/storm-replay";

const METRICS = {
  motion: { min: 0.0, max: 0.0162 },
  intensity: { min: 0.3791, max: 0.3844 },
  combined: { min: 0.0015, max: 0.0176 }
};

const REVIEW_MARK_OPTIONS = [
  "stable",
  "needs review",
  "possible false positive",
  "possible missed activity",
  "ignore"
];

const HOW_IT_WORKS_STEPS = [
  "Load imagery",
  "Extract signals",
  "Review evidence"
];

function formatScore(value) {
  return Number(value).toFixed(4);
}

function buildFrames() {
  const rows = [];
  const motionValues = [
    0.0000, 0.0141, 0.0139, 0.0139, 0.0138, 0.0128, 0.0114, 0.0101,
    0.0096, 0.0100, 0.0098, 0.0093, 0.0074, 0.0053, 0.0040, 0.0041,
    0.0067, 0.0092, 0.0093, 0.0108, 0.0137, 0.0153, 0.0162, 0.0156
  ];
  const timestamps = [
    "2021-12-10 18:00 CST",
    "2021-12-10 18:15 CST",
    "2021-12-10 18:30 CST",
    "2021-12-10 18:45 CST",
    "2021-12-10 19:00 CST",
    "2021-12-10 19:15 CST",
    "2021-12-10 19:30 CST",
    "2021-12-10 19:45 CST",
    "2021-12-10 20:00 CST",
    "2021-12-10 20:15 CST",
    "2021-12-10 20:30 CST",
    "2021-12-10 20:45 CST",
    "2021-12-10 21:00 CST",
    "2021-12-10 21:15 CST",
    "2021-12-10 21:30 CST",
    "2021-12-10 21:45 CST",
    "2021-12-10 22:00 CST",
    "2021-12-10 22:15 CST",
    "2021-12-10 22:30 CST",
    "2021-12-10 22:45 CST",
    "2021-12-10 23:00 CST",
    "2021-12-10 23:15 CST",
    "2021-12-10 23:30 CST",
    "2021-12-10 23:45 CST"
  ];
  const frameNames = [
    "000_202112101800.png",
    "001_202112101815.png",
    "002_202112101830.png",
    "003_202112101845.png",
    "004_202112101900.png",
    "005_202112101915.png",
    "006_202112101930.png",
    "007_202112101945.png",
    "008_202112102000.png",
    "009_202112102015.png",
    "010_202112102030.png",
    "011_202112102045.png",
    "012_202112102100.png",
    "013_202112102115.png",
    "014_202112102130.png",
    "015_202112102145.png",
    "016_202112102200.png",
    "017_202112102215.png",
    "018_202112102230.png",
    "019_202112102245.png",
    "020_202112102300.png",
    "021_202112102315.png",
    "022_202112102330.png",
    "023_202112102345.png"
  ];
  const intensityValues = [
    0.3839, 0.3839, 0.3826, 0.3837, 0.3841, 0.3837, 0.3842, 0.3841,
    0.3835, 0.3822, 0.3815, 0.3823, 0.3828, 0.3835, 0.3838, 0.3825,
    0.3806, 0.3791, 0.3801, 0.3794, 0.3796, 0.3802, 0.3829, 0.3844
  ];
  const combinedValues = [
    0.0015, 0.0156, 0.0141, 0.0152, 0.0155, 0.0141, 0.0132, 0.0118,
    0.0107, 0.0102, 0.0107, 0.0094, 0.0078, 0.0064, 0.0054, 0.0042,
    0.0085, 0.0125, 0.0116, 0.0138, 0.0165, 0.0175, 0.0167, 0.0176
  ];

  for (let index = 0; index < FRAMES_REVIEWED; index += 1) {
    rows.push({
      frame: frameNames[index],
      timestamp: timestamps[index],
      motion_score: motionValues[index],
      intensity_score: intensityValues[index],
      combined_score: combinedValues[index],
      label: "low_activity",
      reviewer_mark: ""
    });
  }

  return rows;
}

function downloadJsonFile(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
}

function MetricCard({ label, value, note }) {
  return (
    <div className="panel storm-card storm-card--metric">
      <div className="card-label">{label}</div>
      <div className="storm-metric">{value}</div>
      {note ? <div className="storm-note">{note}</div> : null}
    </div>
  );
}

function buildPreviewSvg(row) {
  const motionBand = Math.max(0.08, Math.min(1, (row.motion_score / METRICS.motion.max) || 0));
  const intensityBand = Math.max(0.08, Math.min(1, (row.intensity_score / METRICS.intensity.max) || 0));
  const combinedBand = Math.max(0.08, Math.min(1, (row.combined_score / METRICS.combined.max) || 0));
  const glowScale = 0.18 + combinedBand * 0.28;
  const fogScale = 0.4 + intensityBand * 0.25;

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 260" role="img" aria-label="${row.frame} storm preview">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#07111a" />
          <stop offset="55%" stop-color="#0c1523" />
          <stop offset="100%" stop-color="#111827" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="42%" r="68%">
          <stop offset="0%" stop-color="#83f3ff" stop-opacity="${glowScale}" />
          <stop offset="45%" stop-color="#a46cff" stop-opacity="${fogScale}" />
          <stop offset="100%" stop-color="#f0c75e" stop-opacity="0" />
        </radialGradient>
        <filter id="blur"><feGaussianBlur stdDeviation="10" /></filter>
      </defs>
      <rect width="420" height="260" fill="url(#bg)" />
      <circle cx="120" cy="98" r="${40 + motionBand * 18}" fill="url(#glow)" filter="url(#blur)" opacity="0.95" />
      <circle cx="232" cy="118" r="${54 + intensityBand * 16}" fill="url(#glow)" filter="url(#blur)" opacity="0.78" />
      <path d="M34 188 C72 154, 112 160, 148 138 S228 92, 274 110 S348 160, 390 132" fill="none" stroke="rgba(131,243,255,0.46)" stroke-width="4" stroke-linecap="round" />
      <path d="M34 206 C86 180, 126 186, 170 166 S258 126, 308 140 S358 168, 392 150" fill="none" stroke="rgba(164,108,255,0.34)" stroke-width="3" stroke-linecap="round" />
      <g fill="rgba(255,255,255,0.85)" font-family="ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace">
        <text x="20" y="28" font-size="14">${row.frame}</text>
        <text x="20" y="48" font-size="11" fill="rgba(183,189,175,0.9)">${row.timestamp}</text>
        <text x="20" y="238" font-size="12" fill="rgba(195,247,255,0.92)">motion ${formatScore(row.motion_score)}  intensity ${formatScore(row.intensity_score)}</text>
      </g>
      <rect x="18" y="18" width="384" height="224" rx="18" fill="none" stroke="rgba(255,255,255,0.08)" />
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function buildTopReviewCandidates(rows) {
  return [...rows]
    .sort((a, b) => b.combined_score - a.combined_score || b.motion_score - a.motion_score)
    .slice(0, 3);
}

export default function StormReplay() {
  const [reviewerNotes, setReviewerNotes] = useState(
    [
      "Most frames stay in a steady radar background and do not jump into a stronger label band.",
      "A few later frames rise slightly in motion score, but they still remain low_activity.",
      "No obvious false positives appeared in this pass because the detector stayed conservative.",
      "If there is meaningful storm structure in this slice, current thresholding may be too conservative to surface it.",
      "low_activity seems fair overall for this first calibration pass."
    ].join(" ")
  );
  const [rows, setRows] = useState(buildFrames);

  const summaryMetrics = useMemo(
    () => ({
      motion_score: "0.0000 to 0.0162",
      intensity_score: "0.3791 to 0.3844",
      combined_score: "0.0015 to 0.0176",
      label_count: "low_activity 24"
    }),
    []
  );

  const visualFrames = useMemo(
    () =>
      rows.map((row) => ({
        ...row,
        motionLevel: (row.motion_score - METRICS.motion.min) / (METRICS.motion.max - METRICS.motion.min || 1),
        intensityLevel:
          (row.intensity_score - METRICS.intensity.min) / (METRICS.intensity.max - METRICS.intensity.min || 1),
        combinedLevel:
          (row.combined_score - METRICS.combined.min) / (METRICS.combined.max - METRICS.combined.min || 1)
      })),
    [rows]
  );

  const previewFrames = useMemo(
    () =>
      rows.slice(0, 6).map((row) => ({
        ...row,
        previewSrc: buildPreviewSvg(row)
      })),
    [rows]
  );

  const topReviewCandidates = useMemo(() => buildTopReviewCandidates(rows), [rows]);

  const progressPercent = Math.round((rows.length / FRAMES_REVIEWED) * 100);

  function updateMark(index, value) {
    setRows((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, reviewer_mark: value } : row))
    );
  }

  function exportPacket() {
    const reviewer_marks = rows.map((row) => ({
      frame: row.frame,
      timestamp: row.timestamp,
      reviewer_mark: row.reviewer_mark || "ignore",
      label: row.label
    }));

    const payload = {
      case_id: CASE_ID,
      reviewer_marks,
      notes: reviewerNotes,
      summary_metrics: summaryMetrics,
      limitation_statement: LIMITATION_STATEMENT,
      exported_at: new Date().toISOString()
    };

    downloadJsonFile(`storm-replay-${CASE_ID}-review-packet.json`, payload);
  }

  return (
    <section className="storm-replay">
      <header className="storm-hero">
        <div className="storm-hero__copy">
          <div className="eyebrow">Storm Replay</div>
          <h1>{CASE_TITLE}</h1>
          <p className="lead">{SHORT_LIMITATION_LINE}</p>
        </div>
        <div className="storm-hero__status">
          <div className="storm-status">
            <span className="status-badge status-badge--violet">Beta</span>
            <span className="status-badge status-badge--cyan">Historical replay</span>
          </div>
          <div className="storm-hero__linknote">
            <span className="card-label">Source repo</span>
            <a href={CONTACT_SHEET_URL} target="_blank" rel="noreferrer">
              Contact sheet lives in the source repo.
            </a>
          </div>
        </div>
      </header>

      <section className="storm-grid storm-grid--summary">
        <div className="panel storm-card">
          <div className="panel__head">
            <div>
              <div className="eyebrow">Quick stats</div>
              <h2>Fast read</h2>
            </div>
          </div>
          <div className="storm-summary__rows">
            <div className="storm-summary__row">
              <span className="card-label">Frames</span>
              <span className="storm-metric">{FRAMES_REVIEWED}</span>
            </div>
            <div className="storm-summary__row">
              <span className="card-label">Status</span>
              <span className="status-badge status-badge--cyan">{CASE_STATUS}</span>
            </div>
            <div className="storm-summary__row">
              <span className="card-label">Current label result</span>
              <span className="storm-metric">24 low_activity</span>
            </div>
            <div className="storm-summary__row">
              <span className="card-label">Known tornado activity</span>
              <span className="storm-note">{KNOWN_ACTIVITY_WINDOW}</span>
            </div>
          </div>
        </div>

        <div className="panel storm-card storm-card--placeholder">
          <div className="panel__head">
            <div>
              <div className="eyebrow">Inline preview</div>
              <h2>Preview montage</h2>
            </div>
          </div>
          <div className="storm-placeholder">
            <div className="storm-placeholder__title">Local preview tiles are generated from the current replay rows.</div>
            <div className="storm-placeholder__text">The source repo still holds the rendered SVG contact sheet.</div>
            <a className="storm-placeholder__link" href={CONTACT_SHEET_URL} target="_blank" rel="noreferrer">
              Open source repo
            </a>
          </div>
          <div className="storm-preview-strip" aria-label="Storm Replay preview montage">
            {previewFrames.map((frame) => (
              <figure key={frame.frame} className="storm-preview-tile">
                <img className="storm-preview-tile__img" src={frame.previewSrc} alt={`${frame.frame} preview`} />
                <figcaption className="storm-preview-tile__caption">{frame.timestamp}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="storm-grid storm-grid--metrics">
        <MetricCard
          label="Motion score range"
          value={`${formatScore(METRICS.motion.min)} to ${formatScore(METRICS.motion.max)}`}
          note="Observed in this pass."
        />
        <MetricCard
          label="Intensity score range"
          value={`${formatScore(METRICS.intensity.min)} to ${formatScore(METRICS.intensity.max)}`}
          note="Stayed flat."
        />
        <MetricCard
          label="Combined score range"
          value={`${formatScore(METRICS.combined.min)} to ${formatScore(METRICS.combined.max)}`}
          note="Useful for review notes."
        />
        <MetricCard
          label="Label count"
          value="low_activity 24"
          note="No higher label band surfaced in this pass."
        />
      </section>

      <section className="panel storm-card storm-visual-card">
        <div className="panel__head">
          <div>
            <div className="eyebrow">Visual summary</div>
            <h2>Calibration at a glance</h2>
          </div>
          <div className="meta">{rows.length}/{FRAMES_REVIEWED} frames reviewed</div>
        </div>

        <div className="storm-insight">
          <div className="storm-insight__label">Key insight</div>
          <div className="storm-insight__text">
            All 24 frames labeled low_activity, so conservative thresholding may miss subtle signals.
          </div>
        </div>

        <div className="storm-window">
          <div className="storm-window__label">Known tornado activity window</div>
          <div className="storm-window__value">{KNOWN_ACTIVITY_WINDOW}</div>
          <div className="storm-window__note">Use this band to check whether later motion spikes line up with the event.</div>
        </div>

        <div className="storm-progress" aria-label="Calibration progress">
          <div className="storm-progress__head">
            <span className="card-label">Calibration pass</span>
            <span className="storm-metric">{rows.length}/{FRAMES_REVIEWED}</span>
          </div>
          <div className="storm-progress__bar" role="progressbar" aria-valuemin="0" aria-valuemax={FRAMES_REVIEWED} aria-valuenow={rows.length}>
            <div className="storm-progress__fill" style={{ width: `${progressPercent}%` }} />
          </div>
          <div className="storm-progress__note">24/24 frames reviewed</div>
        </div>

        <div className="storm-heatmap">
          <div className="storm-heatmap__legend">
            <span><i className="legend-swatch legend-swatch--motion" /> motion</span>
            <span><i className="legend-swatch legend-swatch--intensity" /> intensity</span>
            <span><i className="legend-swatch legend-swatch--combined" /> combined</span>
          </div>
          <div className="storm-heatmap__grid">
            {visualFrames.map((row) => (
              <div key={row.frame} className="storm-heatmap__cell">
                <div className="storm-heatmap__frame">{row.frame.slice(0, 3)}</div>
                <div
                  className="storm-heatmap__bar storm-heatmap__bar--motion"
                  style={{ "--heat": row.motionLevel }}
                  title={`motion ${formatScore(row.motion_score)}`}
                />
                <div
                  className="storm-heatmap__bar storm-heatmap__bar--intensity"
                  style={{ "--heat": row.intensityLevel }}
                  title={`intensity ${formatScore(row.intensity_score)}`}
                />
                <div
                  className="storm-heatmap__bar storm-heatmap__bar--combined"
                  style={{ "--heat": row.combinedLevel }}
                  title={`combined ${formatScore(row.combined_score)}`}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="storm-grid storm-grid--candidates">
        <div className="panel storm-card storm-candidates">
          <div className="panel__head">
            <div>
              <div className="eyebrow">Top review candidates</div>
              <h2>Highest-scoring frames</h2>
            </div>
            <div className="meta">Sorted by combined score</div>
          </div>
          <div className="storm-candidates__list">
            {topReviewCandidates.map((row, index) => (
              <div key={row.frame} className="storm-candidate">
                <div className="storm-candidate__rank">{index + 1}</div>
                <div className="storm-candidate__body">
                  <div className="storm-candidate__title">{row.timestamp}</div>
                  <div className="storm-candidate__meta">
                    <span>{row.frame}</span>
                    <span>motion {formatScore(row.motion_score)}</span>
                    <span>intensity {formatScore(row.intensity_score)}</span>
                    <span className="status-badge status-badge--muted">{row.label}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel storm-card storm-table-card">
        <div className="panel__head">
          <div>
            <div className="eyebrow">Frame review</div>
            <h2>24 radar frames</h2>
          </div>
          <div className="meta">Calibration pass</div>
        </div>

        <div className="storm-table__cue">
          All 24 rows are <span>low_activity</span>. Use reviewer marks to flag anything worth a second look.
        </div>

        <div className="storm-table-wrap">
          <table className="storm-table">
            <thead>
              <tr>
                <th>frame</th>
                <th>timestamp</th>
                <th>motion_score</th>
                <th>intensity_score</th>
                <th>combined_score</th>
                <th>label</th>
                <th>reviewer mark</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={row.frame} className={index % 2 === 0 ? "storm-table__row" : "storm-table__row storm-table__row--alt"}>
                  <td className="storm-table__mono">{row.frame}</td>
                  <td>{row.timestamp}</td>
                  <td className="storm-table__mono">{formatScore(row.motion_score)}</td>
                  <td className="storm-table__mono">{formatScore(row.intensity_score)}</td>
                  <td className="storm-table__mono">{formatScore(row.combined_score)}</td>
                  <td>
                    <span className="status-badge status-badge--muted">{row.label}</span>
                  </td>
                  <td>
                    <select
                      className="storm-select"
                      value={row.reviewer_mark}
                      onChange={(event) => updateMark(index, event.target.value)}
                      aria-label={`Reviewer mark for ${row.frame}`}
                    >
                      <option value="">Select mark</option>
                      {REVIEW_MARK_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="storm-grid storm-grid--review">
        <div className="panel storm-card">
          <div className="panel__head">
            <div>
              <div className="eyebrow">Review notes</div>
              <h2>Manual reviewer notes</h2>
            </div>
          </div>
          <textarea
            className="storm-notes"
            rows={8}
            value={reviewerNotes}
            onChange={(event) => setReviewerNotes(event.target.value)}
            placeholder="Write quick calibration notes here."
          />
          <div className="storm-note">
            Quick calibration notes for human review.
          </div>
        </div>

        <div className="panel storm-card">
          <div className="panel__head">
            <div>
              <div className="eyebrow">What this can and cannot say</div>
              <h2>Review framing</h2>
            </div>
          </div>
          <div className="storm-method">
            <p>Storm Replay is not a forecasting system.</p>
            <p>Storm Replay is not a warning system.</p>
            <p>Storm Replay does not confirm tornado formation.</p>
            <p>It reviews historical weather imagery and prepares evidence for human inspection.</p>
          </div>
          <div className="storm-method__footer">
            The goal is to keep limits visible while the detector explains its scoring.
          </div>
        </div>
      </section>

      <section className="panel storm-card storm-how storm-how--compact">
        <div className="panel__head">
          <div>
            <div className="eyebrow">How it works</div>
            <h2>Why replay historical storms?</h2>
          </div>
          <div className="meta">Human review first</div>
        </div>
        <div className="storm-how__copy">
          Historical replay compares extracted signals against a known event window. That makes calibration easier and keeps the output away from prediction language.
        </div>
        <div className="storm-how__steps">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <div key={step} className="storm-how__step">
              <span className="storm-how__index">{index + 1}</span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="storm-footer">
        <button type="button" className="pill pill--primary pill--large" onClick={exportPacket}>
          Export review packet
        </button>
        <div className="storm-footer__meta">
          <div className="storm-note">Exports include case_id, reviewer marks, notes, summary metrics, limitation statement, and timestamp.</div>
          <div className="storm-note">Downloads happen locally in the browser.</div>
        </div>
      </section>
    </section>
  );
}
