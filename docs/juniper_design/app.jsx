const { useState, useEffect, useRef, useMemo } = React;

// ---------- Loader sequence ----------
const LOADER_STEPS = [
  { key: 'generate', label: 'Generating 10 variants', duration: 28 },
  { key: 'compliance', label: 'Running compliance checks', duration: 36 },
  { key: 'finalise', label: 'Finalising', duration: 4 },
];

function Loader({ onDone, totalScale = 1 }) {
  const [elapsed, setElapsed] = useState(0);
  const [checkedCount, setCheckedCount] = useState(0);
  const startRef = useRef(performance.now());

  const totalSec = LOADER_STEPS.reduce((s, x) => s + x.duration, 0) * totalScale;

  useEffect(() => {
    let raf;
    const tick = () => {
      const t = (performance.now() - startRef.current) / 1000;
      setElapsed(t);
      if (t >= totalSec) {
        onDone();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [totalSec, onDone]);

  // figure active step + per-step progress
  let acc = 0, activeIdx = 0, stepProg = 0;
  for (let i = 0; i < LOADER_STEPS.length; i++) {
    const dur = LOADER_STEPS[i].duration * totalScale;
    if (elapsed < acc + dur) {
      activeIdx = i;
      stepProg = (elapsed - acc) / dur;
      break;
    }
    acc += dur;
    activeIdx = i + 1;
  }

  // sub-progress for compliance step (1/10 → 10/10)
  useEffect(() => {
    if (activeIdx === 1) {
      const c = Math.min(10, Math.floor(stepProg * 10) + 1);
      setCheckedCount(c);
    } else if (activeIdx > 1) {
      setCheckedCount(10);
    }
  }, [activeIdx, stepProg]);

  const overallPct = Math.min(100, (elapsed / totalSec) * 100);

  return (
    <div className="loader" role="status" aria-live="polite">
      <div className="loader-title">Generating variants…</div>
      <div className="loader-sub">
        Approx. 70 seconds. Don't refresh — partial results are not persisted.
      </div>

      <div className="steps">
        {LOADER_STEPS.map((s, i) => {
          const status = i < activeIdx ? 'done' : i === activeIdx ? 'active' : 'pending';
          let meta = '';
          if (i === 1 && status === 'active') meta = `${checkedCount}/10`;
          else if (status === 'done' && i === 1) meta = '10/10';
          else if (status === 'done') meta = '✓';
          else if (status === 'active') meta = `${Math.round(stepProg * 100)}%`;
          return (
            <div key={s.key} className={`step ${status}`}>
              <span className="step-marker"></span>
              <span className="step-label">{s.label}</span>
              <span className="step-meta">{meta}</span>
            </div>
          );
        })}
      </div>

      <div className="progress-track" aria-hidden="true">
        <div className="progress-fill" style={{ width: overallPct + '%' }} />
      </div>

      {activeIdx === 1 && (
        <div className="compliance-grid" aria-hidden="true">
          {Array.from({ length: 10 }).map((_, i) => {
            const cls = i < checkedCount - 1 ? 'done'
              : i === checkedCount - 1 ? 'checking' : '';
            return (
              <div key={i} className={`cg-cell ${cls}`}>
                {cls === 'done' ? '✓' : cls === 'checking' ? '·' : ''}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------- Card ----------
function VariantCard({ v, onClick }) {
  const isPass = v.compliance.verdict === 'PASS';
  return (
    <button className="card" onClick={onClick}>
      <div className="card-meta">
        <div className="card-tags">
          <span className="vid">{v.variantId.toUpperCase()}</span>
          <span className="sep">·</span>
          {HOOK_LABEL[v.hookStyle]}
          <span className="sep">·</span>
          {FORMAT_LABEL[v.format]}
          <span className="sep">·</span>
          {FRAME_LABEL[v.demographicFrame]}
        </div>
        <span className={`badge ${isPass ? 'badge-pass' : 'badge-flag'}`}>
          <span className="dot-glyph" />
          {v.compliance.verdict}
          {!isPass && v.compliance.issues.length > 0 && (
            <span style={{ opacity: .8, marginLeft: 2 }}>
              {v.compliance.issues.length}
            </span>
          )}
        </span>
      </div>
      <div className="card-headline">{v.headline}</div>
      <div className="card-body">{v.body}</div>
      <div className="card-cta">
        <span className="arr">→</span>
        <span>{v.cta}</span>
      </div>
    </button>
  );
}

// ---------- Modal ----------
function Modal({ v, onClose, onPrev, onNext, index, total }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, onPrev, onNext]);

  if (!v) return null;
  const isPass = v.compliance.verdict === 'PASS';

  return (
    <div className="backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="modal-title">{v.variantId.toUpperCase()} — variant detail</div>
            <div className="modal-sub">
              {HOOK_LABEL[v.hookStyle]} · {FORMAT_LABEL[v.format]} · {FRAME_LABEL[v.demographicFrame]}
              {v.regenAttempts > 0 && <> · regenerated {v.regenAttempts}×</>}
            </div>
          </div>
          <span className={`badge ${isPass ? 'badge-pass' : 'badge-flag'}`}>
            <span className="dot-glyph" />
            {v.compliance.verdict}
          </span>
        </div>

        <div className="copy-block">
          <div className="ch">{v.headline}</div>
          <div className="cb">{v.body}</div>
          <div className="cc">→ {v.cta}</div>
        </div>

        <div className="hr" />

        <dl className="kv-grid">
          <dt>Hook style</dt><dd>{HOOK_LABEL[v.hookStyle]}</dd>
          <dt>Format</dt><dd>{FORMAT_LABEL[v.format]}</dd>
          <dt>Audience</dt><dd>{FRAME_LABEL[v.demographicFrame]}</dd>
          <dt>Regenerations</dt><dd>{v.regenAttempts}</dd>
        </dl>

        <div className="hr" />

        <div style={{ marginBottom: 12, display:'flex', alignItems:'baseline', justifyContent:'space-between' }}>
          <div className="serif" style={{ fontSize: 17 }}>
            Compliance — {v.compliance.verdict}
          </div>
          <div style={{ color: 'var(--muted)', fontSize: 12 }}>
            {v.compliance.issues.length} issue{v.compliance.issues.length === 1 ? '' : 's'} flagged
          </div>
        </div>

        {v.compliance.issues.length === 0 ? (
          <div className="issue pass">
            <div className="row">No regulatory concerns identified by the compliance pass. Variant is cleared for review.</div>
          </div>
        ) : (
          v.compliance.issues.map((iss, i) => (
            <div className="issue flag" key={i}>
              <span className="rid">{iss.ruleId}</span>
              <div className="row">
                <strong>Phrase</strong>
                <span className="quote">"{iss.triggeringPhrase}"</span>
              </div>
              <div className="row">
                <strong>Rule</strong>
                <span>{iss.ruleDescription}</span>
              </div>
              <div className="row">
                <strong>Reasoning</strong>
                <span>{iss.regulatoryReasoning}</span>
              </div>
              <div className="row">
                <strong>Suggested fix</strong>
                <span>{iss.suggestedFix}</span>
              </div>
            </div>
          ))
        )}

        <div className="modal-foot">
          <div className="ix">Variant {index + 1} of {total} · ←/→ to navigate · Esc to close</div>
          <div style={{ display:'flex', gap: 8 }}>
            <button className="btn-secondary" onClick={onPrev}>← Prev</button>
            <button className="btn-secondary" onClick={onNext}>Next →</button>
            <button className="btn-secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- App ----------
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "density": "comfortable",
  "loaderSpeed": 12,
  "showProgressGrid": true,
  "accentTone": "lime",
  "startWithResults": true
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [seed, setSeed] = useState(SAMPLE_SEED);
  const [channel, setChannel] = useState('paid_social');
  const [variants, setVariants] = useState(tweaks.startWithResults ? SAMPLE_VARIANTS : []);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(null);
  const [filter, setFilter] = useState('all');

  // re-apply density
  useEffect(() => {
    document.documentElement.style.setProperty('--card-pad', tweaks.density === 'compact' ? '16px 18px' : '22px 24px');
    document.documentElement.style.setProperty('--card-gap', tweaks.density === 'compact' ? '12px' : '16px');
  }, [tweaks.density]);

  // accent palette swap (lime / sage / cream)
  useEffect(() => {
    const root = document.documentElement;
    if (tweaks.accentTone === 'sage') {
      root.style.setProperty('--accent', '#C8DBA8');
      root.style.setProperty('--accent-soft', '#E2EAD2');
    } else if (tweaks.accentTone === 'cream') {
      root.style.setProperty('--accent', '#F2EEDF');
      root.style.setProperty('--accent-soft', '#FAF8F0');
    } else {
      root.style.setProperty('--accent', '#D8EDA0');
      root.style.setProperty('--accent-soft', '#ECF4CD');
    }
  }, [tweaks.accentTone]);

  const handleGenerate = () => {
    if (!seed.trim()) return;
    setLoading(true);
    setVariants([]);
  };

  const filtered = useMemo(() => {
    if (filter === 'pass') return variants.filter(v => v.compliance.verdict === 'PASS');
    if (filter === 'flag') return variants.filter(v => v.compliance.verdict === 'FLAG');
    return variants;
  }, [variants, filter]);

  const counts = useMemo(() => ({
    total: variants.length,
    pass: variants.filter(v => v.compliance.verdict === 'PASS').length,
    flag: variants.filter(v => v.compliance.verdict === 'FLAG').length,
  }), [variants]);

  const selected = selectedIdx != null ? filtered[selectedIdx] : null;

  return (
    <div className="shell">
      {/* Header */}
      <div className="topbar">
        <div>
          <div className="brand-row">
            <span className="brand">Juniper Variant Engine</span>
            <span className="pill">v1 prototype</span>
          </div>
          <div className="descriptor">
            Generates 10 compliance-checked ad variants from one seed concept.
          </div>
        </div>
        <div className="topbar-meta">
          <span><span className="dot"></span>orchestrate · ready</span>
          <span className="mono">build 0426</span>
        </div>
      </div>

      {/* Form */}
      <div className="form-grid">
        <div>
          <div className="field-label">
            <span>Seed concept</span>
            <span className="hint">{seed.length} chars</span>
          </div>
          <textarea
            className="textarea"
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            placeholder="Paste an approved Juniper ad concept here..."
          />
        </div>
        <div>
          <div className="field-label"><span>Channel</span></div>
          <select className="select" value={channel} onChange={(e) => setChannel(e.target.value)}>
            {CHANNELS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>

          <div className="field-label" style={{ marginTop: 18 }}><span>Variant matrix</span></div>
          <div style={{
            border: '1px solid var(--line)', borderRadius: 8, padding: '10px 12px',
            background: 'var(--paper-2)', fontSize: 12, color: 'var(--muted)', lineHeight: 1.55,
            fontFamily: "'JetBrains Mono', monospace"
          }}>
            5 hook styles × 5 formats<br/>
            5 demographic frames<br/>
            <span style={{ color: 'var(--ink)' }}>→ 10 variants per run</span>
          </div>
        </div>
      </div>

      <div className="actionbar">
        <div className="helper">
          ~70s per run.
        </div>
        <div style={{ display:'flex', gap: 10 }}>
          <button className="btn-secondary" onClick={() => setSeed('')}>Clear</button>
          <button className="btn" disabled={loading || !seed.trim()} onClick={handleGenerate}>
            {loading ? 'Generating…' : 'Generate variants'}
            <span className="arrow">→</span>
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <Loader
          totalScale={tweaks.loaderSpeed / 70}
          onDone={() => {
            setVariants(SAMPLE_VARIANTS);
            setLoading(false);
          }}
        />
      )}

      {/* Results */}
      {!loading && variants.length > 0 && (
        <>
          <div className="result-bar">
            <div>
              <div className="result-title">10 variants ready</div>
              <div className="result-meta">
                <span className="swatch"><span className="sw" style={{background:'var(--accent)'}}></span>{counts.pass} pass</span>
                <span className="swatch"><span className="sw" style={{background:'var(--flag)'}}></span>{counts.flag} flagged for review</span>
              </div>
            </div>
            <div className="filter-row">
              <button className={`chip ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All · {counts.total}</button>
              <button className={`chip ${filter === 'pass' ? 'active' : ''}`} onClick={() => setFilter('pass')}>Pass · {counts.pass}</button>
              <button className={`chip ${filter === 'flag' ? 'active' : ''}`} onClick={() => setFilter('flag')}>Flag · {counts.flag}</button>
            </div>
          </div>

          <div className="grid">
            {filtered.map((v, i) => (
              <VariantCard key={v.variantId} v={v} onClick={() => setSelectedIdx(i)} />
            ))}
          </div>
        </>
      )}

      {!loading && variants.length === 0 && (
        <div className="empty">
          <div className="e-title">No run yet</div>
          <div className="e-body">
            Drop in a seed concept above and hit <em>Generate variants</em>.
            Each run produces 10 copy variants across the hook × format × frame matrix,
            with a TGA compliance check on each one.
          </div>
        </div>
      )}

      <div className="prod-note">
        // prototype fonts: Source Serif 4 → Nib Pro · Inter → Atlas Grotesk · swap before production.
      </div>

      {selected && (
        <Modal
          v={selected}
          index={selectedIdx}
          total={filtered.length}
          onClose={() => setSelectedIdx(null)}
          onPrev={() => setSelectedIdx((selectedIdx - 1 + filtered.length) % filtered.length)}
          onNext={() => setSelectedIdx((selectedIdx + 1) % filtered.length)}
        />
      )}

      {/* Tweaks */}
      <TweaksPanel title="Tweaks">
        <TweakSection title="Display">
          <TweakRadio
            label="Density"
            value={tweaks.density}
            options={[{value:'comfortable',label:'Comfortable'},{value:'compact',label:'Compact'}]}
            onChange={(v) => setTweak('density', v)}
          />
          <TweakSelect
            label="Pass accent"
            value={tweaks.accentTone}
            options={[{value:'lime',label:'Lime (default)'},{value:'sage',label:'Sage'},{value:'cream',label:'Cream'}]}
            onChange={(v) => setTweak('accentTone', v)}
          />
        </TweakSection>
        <TweakSection title="Loading sim">
          <TweakSlider
            label="Total run time (s)"
            min={3} max={70} step={1}
            value={tweaks.loaderSpeed}
            onChange={(v) => setTweak('loaderSpeed', v)}
          />
          <TweakButton onClick={() => { setVariants([]); setLoading(true); }}>
            Replay loading sequence
          </TweakButton>
        </TweakSection>
        <TweakSection title="Demo state">
          <TweakButton onClick={() => setVariants(SAMPLE_VARIANTS)}>Load 10 sample variants</TweakButton>
          <TweakButton onClick={() => setVariants([])}>Clear results</TweakButton>
          <TweakButton onClick={() => setSelectedIdx(4)}>Open flagged-variant modal</TweakButton>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
