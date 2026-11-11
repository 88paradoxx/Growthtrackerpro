import React, { useMemo, useState } from 'react';
import { assessmentAges } from './assessment.js';

/*
 * Five-domain developmental scoring + Developmental Quotient (DQ)
 * -----------------------------------------------------------------
 * Items: 0 = Not yet, 1 = Emerging (inconsistent / with help), 2 = Achieved.
 *
 * Scored bands: basal (checkpoint below the current one), current, and
 * ceiling (checkpoint above). Developmental age (DA) per domain uses the
 * basal/ceiling method:
 *   DA = months below the lowest scored band (assumed passed)
 *        + sum over scored bands of 12 months x (domain score / domain max)
 * DQ = DA / chronological age (CA) x 100.
 * Composite DQ = mean of the five domain DQs.
 *
 * This is a screening estimate built on 12-month checkpoints, not a
 * standardised, normed instrument.
 */

export const SCORE_OPTIONS = [
  { v: 0, short: '0', label: 'Not yet' },
  { v: 1, short: '1', label: 'Emerging' },
  { v: 2, short: '2', label: 'Achieved' }
];

export const DQ_BANDS = [
  { min: 130, key: 'advanced', label: 'Advanced', advice: 'Development well ahead of age. Routine surveillance; no intervention needed.' },
  { min: 115, key: 'above', label: 'Above average', advice: 'Development ahead of age. Routine surveillance at next visit.' },
  { min: 85, key: 'normal', label: 'Within normal range', advice: 'Routine surveillance at next visit.' },
  { min: 70, key: 'borderline', label: 'Borderline', advice: 'Monitor; stimulate and re-screen in 3 months.' },
  { min: 50, key: 'mild', label: 'Mild delay', advice: 'Refer for formal developmental assessment.' },
  { min: 35, key: 'moderate', label: 'Moderate delay', advice: 'Refer for formal developmental assessment and early intervention.' },
  { min: -Infinity, key: 'severe', label: 'Severe delay', advice: 'Urgent referral for comprehensive evaluation and early intervention.' }
];

export const classifyDQ = (dq) => DQ_BANDS.find((b) => dq >= b.min);

const STEP = 12; // checkpoints are 12 months apart
const LAST_CHECKPOINT = assessmentAges[assessmentAges.length - 1].months;

export default function DevScoring({ ageMonths }) {
  const [scores, setScores] = useState({});
  // Above the last checkpoint there is no higher band to score, so DQ is referenced to it
  const caForDq = Math.min(ageMonths, LAST_CHECKPOINT);
  const capped = ageMonths > LAST_CHECKPOINT;

  const bands = useMemo(() => {
    const idx = assessmentAges.map((a) => a.months).filter((m) => m <= ageMonths).length - 1;
    if (idx < 0) return [];
    return [
      idx > 0 && { role: 'Basal', band: assessmentAges[idx - 1] },
      { role: 'Current', band: assessmentAges[idx] },
      idx < assessmentAges.length - 1 && { role: 'Ceiling', band: assessmentAges[idx + 1] }
    ].filter(Boolean);
  }, [ageMonths]);

  const domains = assessmentAges[0].domains.map((d) => d.name);
  const keyOf = (months, domain, i) => `${months}|${domain}|${i}`;

  const allKeys = bands.flatMap(({ band }) =>
    band.domains.flatMap((d) => d.items.map((_, i) => keyOf(band.months, d.name, i)))
  );
  const scoredCount = allKeys.filter((k) => scores[k] !== undefined).length;
  const complete = allKeys.length > 0 && scoredCount === allKeys.length;

  const result = useMemo(() => {
    if (!bands.length) return null;
    const lowest = bands[0].band.months;
    const rows = domains.map((name) => {
      let da = lowest - STEP; // bands below the lowest scored one are credited as passed
      let raw = 0, max = 0, curRaw = 0, curMax = 0, topFull = false;
      for (const { role, band } of bands) {
        const d = band.domains.find((x) => x.name === name);
        const s = d.items.reduce((sum, _, i) => sum + (scores[keyOf(band.months, name, i)] || 0), 0);
        const m = d.items.length * 2;
        raw += s; max += m;
        if (role === 'Current') { curRaw = s; curMax = m; }
        da += STEP * (s / m);
        topFull = s === m; // ends as: was the highest scored band fully achieved?
      }
      const dq = Math.round((da / caForDq) * 100);
      // Every item at the highest scored checkpoint achieved: the true developmental
      // age may be higher than this tool can measure, so DA and DQ are minimums.
      const atCeiling = topFull;
      return { name, raw, max, curRaw, curMax, da: Math.round(da * 10) / 10, dq, cls: classifyDQ(dq), atCeiling };
    });
    const composite = Math.round(rows.reduce((s, r) => s + r.dq, 0) / rows.length);
    const delayed = rows.filter((r) => r.dq < 70);
    const totalRaw = rows.reduce((s, r) => s + r.raw, 0);
    const totalMax = rows.reduce((s, r) => s + r.max, 0);
    const ceilingRows = rows.filter((r) => r.atCeiling);
    return { rows, composite, compositeCls: classifyDQ(composite), delayed, totalRaw, totalMax, ceilingRows };
  }, [bands, scores, caForDq]);

  if (!bands.length) return null;

  const setBand = (band, v) =>
    setScores((s) => {
      const next = { ...s };
      band.domains.forEach((d) => d.items.forEach((_, i) => { next[keyOf(band.months, d.name, i)] = v; }));
      return next;
    });

  const ageText = `${Math.floor(ageMonths / 12)} y ${ageMonths % 12} m (${ageMonths} months)`;

  return (
    <>
      <section className="panel assessment-panel dev-score">
        <div className="assessment-heading">
          <div>
            <span className="eyebrow">5-DOMAIN DEVELOPMENTAL SCORING</span>
            <h2>Score each item</h2>
            <p>
              Score the current checkpoint plus the checkpoint below (basal) and above (ceiling).
              0 = Not yet · 1 = Emerging (inconsistent or with help) · 2 = Achieved.
            </p>
          </div>
          <div className="dev-progress" aria-live="polite">
            <strong>{scoredCount}/{allKeys.length}</strong>
            <span>items scored</span>
          </div>
        </div>

        {bands.map(({ role, band }) => (
          <div className={`dev-band dev-band-${role.toLowerCase()}`} key={band.months}>
            <div className="dev-band-head">
              <h3><span className="dev-role">{role}</span> {band.label}</h3>
              <div className="dev-band-actions">
                <button type="button" onClick={() => setBand(band, 2)}>All achieved</button>
                <button type="button" onClick={() => setBand(band, 0)}>All not yet</button>
              </div>
            </div>
            <table className="dev-table">
              <thead>
                <tr><th scope="col">Domain</th><th scope="col">Item</th><th scope="col" className="dev-score-col">Score</th></tr>
              </thead>
              <tbody>
                {band.domains.flatMap((d) =>
                  d.items.map((item, i) => {
                    const k = keyOf(band.months, d.name, i);
                    return (
                      <tr key={k} className={scores[k] === undefined ? 'unscored' : ''}>
                        {i === 0 && <th scope="row" rowSpan={d.items.length}>{d.name}</th>}
                        <td>{item}</td>
                        <td className="dev-score-col">
                          <div className="dev-seg" role="radiogroup" aria-label={`${item} score`}>
                            {SCORE_OPTIONS.map((o) => (
                              <button
                                key={o.v}
                                type="button"
                                role="radio"
                                aria-checked={scores[k] === o.v}
                                title={o.label}
                                className={`seg-${o.v} ${scores[k] === o.v ? 'on' : ''}`}
                                onClick={() => setScores((s) => ({ ...s, [k]: o.v }))}
                              >
                                <b>{o.short}</b><span>{o.label}</span>
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ))}
      </section>

      <section className="panel assessment-panel dq-panel">
        <div className="assessment-heading">
          <div>
            <span className="eyebrow">DEVELOPMENTAL QUOTIENT</span>
            <h2>Score summary</h2>
            <p>Chronological age: <strong>{ageText}</strong> · Scored checkpoints: {bands.map((b) => b.band.months).join(', ')} months</p>
            {capped && <p className="dq-note">Age is above the last checkpoint ({LAST_CHECKPOINT} months), so DQ is calculated against {LAST_CHECKPOINT} months — it shows whether the 5-year skills are in place, not development beyond them.</p>}
          </div>
        </div>

        {!complete ? (
          <p className="dq-pending">Score all items to calculate the DQ — {allKeys.length - scoredCount} remaining.</p>
        ) : (
          <>
            <div className={`dq-composite dq-${result.compositeCls.key}`}>
              <div>
                <span>Composite DQ</span>
                <strong>{result.ceilingRows.length ? '≥ ' : ''}{result.composite}</strong>
              </div>
              <div>
                <b>{result.compositeCls.label}</b>
                <p>{result.compositeCls.advice}</p>
                <small>Total raw score {result.totalRaw}/{result.totalMax}</small>
              </div>
            </div>

            <table className="dev-table dq-table">
              <thead>
                <tr>
                  <th scope="col">Domain</th>
                  <th scope="col">Current checkpoint</th>
                  <th scope="col">Raw (all bands)</th>
                  <th scope="col">Dev. age (mo)</th>
                  <th scope="col">DQ</th>
                  <th scope="col">Interpretation</th>
                </tr>
              </thead>
              <tbody>
                {result.rows.map((r) => (
                  <tr key={r.name}>
                    <th scope="row">{r.name}</th>
                    <td data-label="Current checkpoint">{r.curRaw}/{r.curMax}</td>
                    <td data-label="Raw (all bands)">{r.raw}/{r.max}</td>
                    <td data-label="Dev. age (mo)">{r.atCeiling ? '≥ ' : ''}{r.da}</td>
                    <td data-label="DQ"><strong>{r.atCeiling ? '≥ ' : ''}{r.dq}</strong></td>
                    <td data-label="Interpretation"><span className={`dq-chip dq-${r.cls.key}`}>{r.cls.label}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {result.ceilingRows.length > 0 && (
              <p className="dq-note dq-ceiling">
                <b>Ceiling reached{result.ceilingRows.length < result.rows.length ? ` in ${result.ceilingRows.map((r) => r.name).join(', ')}` : ''}:</b>{' '}
                every item at the highest checkpoint scored was achieved, so the true developmental age may be higher than shown — values marked ≥ are minimums.
              </p>
            )}

            {result.delayed.length >= 2 && ageMonths < 60 && (
              <p className="dq-flag">
                DQ below 70 in {result.delayed.length} domains ({result.delayed.map((r) => r.name).join(', ')}):
                meets the screening criterion for <b>global developmental delay</b> (significant delay in ≥ 2 domains, under 5 years). Refer for a standardised assessment.
              </p>
            )}
            {result.delayed.length === 1 && (
              <p className="dq-flag dq-flag-soft">
                Isolated delay in {result.delayed[0].name} (DQ {result.delayed[0].dq}). Consider domain-specific evaluation.
              </p>
            )}
          </>
        )}

        <details className="dq-method">
          <summary>Method &amp; interpretation</summary>
          <p><b>DQ = Developmental age ÷ Chronological age × 100.</b> Developmental age per domain = age credited below the basal checkpoint + 12 months × (domain score ÷ maximum) for each scored checkpoint. Emerging skills count half, so scoring the ceiling checkpoint matters for children between checkpoints.</p>
          <p>Bands: ≥ 130 advanced · 115–129 above average · 85–114 normal · 70–84 borderline · 50–69 mild · 35–49 moderate · &lt; 35 severe delay. Global developmental delay: DQ &lt; 70 in two or more domains in a child under 5.</p>
          <p>Screening estimate on 12-month checkpoints — not a standardised, normed test. Confirm abnormal results with a validated instrument (e.g. DASII, Bayley-4, ASQ-3) and clinical evaluation.</p>
        </details>
      </section>
    </>
  );
}
