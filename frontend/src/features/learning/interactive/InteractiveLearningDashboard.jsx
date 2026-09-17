import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { curriculum } from './data/curriculum';
import './styles.css';

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const emailOk = (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);

function Pill({ children }) { return <span className="pill">{children}</span>; }
function CompleteButton({ disabled, onClick, children = 'Complete interaction' }) {
  return <button className="complete-btn" disabled={disabled} onClick={onClick}>{children}</button>;
}

function InteractiveLab({ mode, onComplete }) {
  // Keep every hook at the top so the component remains valid regardless of activity mode.
  const [selected, setSelected] = useState(null);
  const [value, setValue] = useState(50);
  const [radius, setRadius] = useState(14);
  const [chosen, setChosen] = useState([]);
  const [step, setStep] = useState(0);
  const [count, setCount] = useState(0);
  const [input, setInput] = useState('');
  const [jsonText, setJsonText] = useState('{"name":"Maya","score":92}');
  const [status, setStatus] = useState('idle');
  const [route, setRoute] = useState('/home');
  const [added, setAdded] = useState([]);
  const [items, setItems] = useState(['HTML', 'CSS', 'JavaScript']);
  const [cols, setCols] = useState(2);
  const [gap, setGap] = useState(16);
  const [motion, setMotion] = useState(true);
  const [tag, setTag] = useState('h1');
  const [pool, setPool] = useState(null);
  const [activeTab, setActiveTab] = useState('image');
  const [ruleOn, setRuleOn] = useState(false);
  const [eventLog, setEventLog] = useState([]);
  const [objectName, setObjectName] = useState('Maya');
  const [objectRole, setObjectRole] = useState('Frontend Intern');
  const [findings, setFindings] = useState([]);

  useEffect(() => {
    if (pool === null && ['semantic-order', 'list-arrange', 'deploy'].includes(mode)) {
      const goal = mode === 'deploy' ? ['Build', 'Test', 'Configure', 'Deploy'] : ['Header', 'Nav', 'Main', 'Footer'];
      setPool([...goal].sort(() => Math.random() - 0.5));
    }
  }, [mode, pool]);

  const finish = () => onComplete();

  if (mode === 'html-discover') {
    const parts = ['DOCTYPE', 'HEAD', 'HEADER', 'MAIN', 'FOOTER'];
    return <div className="lab-content"><div className="mini-stage map-stage">{parts.map((x, i) => <button key={x} className={selected === i ? 'picked' : ''} onClick={() => setSelected(i)}>{x}</button>)}</div>{selected !== null && <div className="feedback"><b>{parts[selected]}</b><span>{selected === 0 ? 'Tells the browser which HTML standard the document uses.' : 'This region contributes to a structured page.'}</span></div>}<CompleteButton disabled={selected === null} onClick={finish} /></div>;
  }

  if (mode === 'html-anatomy') {
    const parts = ['<h1>', 'My Portfolio', '</h1>'];
    return <div className="lab-content"><div className="code anatomy-code">{parts.map((x, i) => <button key={x} className={selected === i ? 'picked' : ''} onClick={() => setSelected(i)}>{x}</button>)}</div>{selected !== null && <div className="feedback"><b>{selected === 0 ? 'Opening tag' : selected === 1 ? 'Content' : 'Closing tag'}</b><span>{selected === 1 ? 'The text node is the content inside the element.' : 'Tags define the element boundary.'}</span></div>}<CompleteButton disabled={selected === null} onClick={finish} /></div>;
  }

  if (mode === 'html-live') {
    return <div className="lab-content"><div className="segmented">{['h1', 'h2', 'p'].map(t => <button key={t} className={tag === t ? 'picked' : ''} onClick={() => setTag(t)}>{t}</button>)}</div><div className="browser-preview">{React.createElement(tag, null, tag === 'p' ? 'A paragraph communicates body content.' : 'My Portfolio')}</div><CompleteButton disabled={tag === 'h1'} onClick={finish} /></div>;
  }

  if (mode === 'html-skeleton') {
    const pieces = ['<!DOCTYPE html>', '<html>', '<head>', '<body>'];
    const toggle = (x) => setChosen(c => c.includes(x) ? c.filter(v => v !== x) : [...c, x]);
    const ok = chosen.join('|') === pieces.join('|');
    return <div className="lab-content"><div className="code-box"><code>{chosen.length ? chosen.join(' ') + ' ...' : 'Choose the document pieces in order'}</code></div><div className="token-bank">{pieces.map(x => <button key={x} className={chosen.includes(x) ? 'picked' : ''} onClick={() => toggle(x)}>{x}</button>)}</div><CompleteButton disabled={!ok} onClick={finish} /></div>;
  }

  if (['semantic-map', 'event-map', 'accessibility', 'aria', 'position-map'].includes(mode)) {
    const data = mode === 'semantic-map' ? ['header', 'nav', 'main', 'section', 'footer'] : mode === 'event-map' ? ['click', 'input', 'submit', 'focus', 'change'] : mode === 'accessibility' ? ['Name', 'Focus', 'Contrast', 'Keyboard', 'Structure'] : mode === 'aria' ? ['aria-label', 'role', 'button name', 'heading level', 'focus'] : ['static', 'relative', 'absolute', 'fixed', 'sticky'];
    return <div className="lab-content"><div className="mini-stage map-stage">{data.map((x, i) => <button key={x} className={selected === i ? 'picked' : ''} onClick={() => setSelected(i)}>{x}</button>)}</div>{selected !== null && <div className="feedback"><b>{data[selected]}</b><span>{mode === 'position-map' ? 'The chosen position mode changes the element’s reference frame.' : 'Clicking a different region lets you compare how its role changes.'}</span></div>}<CompleteButton disabled={selected === null} onClick={finish} /></div>;
  }

  if (['semantic-order', 'list-arrange', 'deploy'].includes(mode)) {
    const goal = mode === 'deploy' ? ['Build', 'Test', 'Configure', 'Deploy'] : ['Header', 'Nav', 'Main', 'Footer'];
    const current = pool || [...goal];
    const move = (idx, dir) => { const next = [...current]; const j = idx + dir; if (j < 0 || j >= next.length) return; [next[idx], next[j]] = [next[j], next[idx]]; setPool(next); };
    const ok = current.join('|') === goal.join('|');
    return <div className="lab-content"><div className="reorder-list">{current.map((x, i) => <div className="reorder-row" key={x}><span>{i + 1}</span><b>{x}</b><button onClick={() => move(i, -1)}>↑</button><button onClick={() => move(i, 1)}>↓</button></div>)}</div><div className={ok ? 'success' : 'feedback'}>{ok ? 'Correct sequence — you reasoned through the dependency.' : 'Use the arrows to put the sequence in a logical order.'}</div><CompleteButton disabled={!ok} onClick={finish} /></div>;
  }

  if (['css-before', 'box-inspect', 'media-explore', 'background'].includes(mode)) {
    const tabs = mode === 'media-explore' ? ['image', 'audio', 'video'] : ['before', 'after', 'layers', 'cover'];
    return <div className="lab-content"><div className="segmented">{tabs.map(t => <button key={t} className={activeTab === t ? 'picked' : ''} onClick={() => setActiveTab(t)}>{t}</button>)}</div><div className="preview-card"><Pill>LIVE PREVIEW</Pill><h3>{activeTab}</h3><p>Switching the state changes what you see and helps connect the concept to the rendered result.</p></div><CompleteButton disabled={activeTab === tabs[0]} onClick={finish} /></div>;
  }

  if (['slider', 'css-live', 'box-slider', 'type-mixer', 'palette', 'transition', 'transform', 'responsive-resize', 'flex-gap'].includes(mode)) {
    return <div className="lab-content"><div className="control-grid"><label>Primary value<input type="range" min="0" max="100" value={value} onChange={e => setValue(+e.target.value)} /><strong>{value}</strong></label><label>Radius<input type="range" min="0" max="32" value={radius} onChange={e => setRadius(+e.target.value)} /><strong>{radius}px</strong></label></div><div className="preview-card" style={{ padding: `${8 + value / 3}px`, borderRadius: `${radius}px`, fontSize: `${14 + value / 10}px` }}><Pill>LIVE CSS</Pill><h3>Interactive component</h3><p>Change the controls and watch the visual result update immediately.</p></div><CompleteButton disabled={value === 50 && radius === 14} onClick={finish} /></div>;
  }

  if (['selector-lab', 'input-match', 'match', 'rules', 'feedback'].includes(mode)) {
    const choices = mode === 'rules' ? ['required', 'minLength', 'pattern'] : mode === 'feedback' ? ['“Invalid”', '“Enter at least 8 characters”', '“Error”'] : ['.profile .name', 'input[type="email"]', '#submit'];
    return <div className="lab-content"><div className="target-card"><b>Target</b><code>{mode === 'selector-lab' ? '.profile .name' : 'input[type="email"]'}</code></div><div className="token-bank">{choices.map((x, i) => <button key={x} className={selected === i ? 'picked' : ''} onClick={() => setSelected(i)}>{x}</button>)}</div><div className="feedback">Choose one, then inspect the result. This is a manipulation task, not a scored MCQ.</div><CompleteButton disabled={selected === null} onClick={finish} /></div>;
  }

  if (['build', 'form-builder', 'flex-build', 'responsive-build', 'component-build', 'dashboard', 'architecture'].includes(mode)) {
    const options = mode === 'form-builder' ? ['Label', 'Email', 'Password', 'Submit'] : mode === 'architecture' ? ['UI', 'State', 'Services', 'API'] : ['Header', 'Content', 'Action'];
    return <div className="lab-content"><div className="builder-preview">{added.length ? added.map(x => <span className="builder-chip" key={x}>{x}</span>) : <span className="muted">Your composition appears here</span>}</div><div className="token-bank">{options.map(x => <button key={x} className={added.includes(x) ? 'picked' : ''} onClick={() => setAdded(a => a.includes(x) ? a.filter(v => v !== x) : [...a, x])}>{x}</button>)}</div><CompleteButton disabled={added.length < Math.min(3, options.length)} onClick={finish} /></div>;
  }

  if (['compare', 'semantic-compare', 'box-compare', 'type-compare', 'responsive-compare'].includes(mode)) {
    const choices = mode === 'box-compare' ? ['content-box', 'border-box'] : ['Strategy A', 'Strategy B'];
    return <div className="lab-content"><div className="compare-grid">{choices.map((x, i) => <button key={x} className={selected === i ? 'compare-picked' : ''} onClick={() => setSelected(i)}><span>{x}</span><div className="compare-visual"><i style={{ width: i ? '72%' : '92%' }} /></div><small>{i ? 'Better communicates intent for this scenario.' : 'Works, but has a trade-off to inspect.'}</small></button>)}</div><CompleteButton disabled={selected === null} onClick={finish} /></div>;
  }

  if (['predict', 'form-predict', 'json'].includes(mode)) {
    let parsed = null; try { parsed = JSON.parse(jsonText); } catch { /* intentionally invalid until fixed */ }
    return <div className="lab-content"><textarea className="code-input" value={jsonText} onChange={e => setJsonText(e.target.value)} spellCheck="false" /><div className="json-preview">{parsed ? Object.entries(parsed).map(([k, v]) => <div key={k}><span>{k}</span><b>{String(v)}</b></div>) : <span className="error">Invalid JSON — edit the text until it parses.</span>}</div><CompleteButton disabled={!parsed} onClick={finish} /></div>;
  }

  if (['operator', 'truth', 'type-check'].includes(mode)) {
    const [a, b] = [value > 50, radius > 16];
    const truth = a && b;
    return <div className="lab-content"><div className="control-grid"><label>Value A<input type="range" min="0" max="100" value={value} onChange={e => setValue(+e.target.value)} /><strong>{String(a)}</strong></label><label>Value B<input type="range" min="0" max="32" value={radius} onChange={e => setRadius(+e.target.value)} /><strong>{String(b)}</strong></label></div><div className="result-large">A AND B = <strong>{String(truth)}</strong></div><CompleteButton disabled={!truth} onClick={finish} /></div>;
  }

  if (['flow', 'loop', 'callback', 'timeline', 'render', 'fetch', 'submit', 'useeffect', 'dependency'].includes(mode)) {
    const labels = mode === 'loop' ? ['init i=0', 'check i<3', 'run body', 'i++', 'repeat'] : mode === 'fetch' ? ['fetch()', 'response', 'response.json()', 'render UI'] : mode === 'render' ? ['Component call', 'JSX result', 'reconcile', 'DOM update'] : ['Start', 'Execute', 'Pause / resolve', 'Continue'];
    return <div className="lab-content"><div className="timeline">{labels.map((x, i) => <button key={x} className={step === i ? 'step-active' : ''} onClick={() => setStep(i)}><span>{i + 1}</span>{x}</button>)}</div><div className="feedback">{step === labels.length - 1 ? 'Sequence complete — you traced the execution path.' : 'Advance one step at a time and observe what changes.'}</div><CompleteButton disabled={step !== labels.length - 1} onClick={finish} /></div>;
  }

  if (['scope', 'closure', 'state', 'controlled', 'react-events', 'counter'].includes(mode)) {
    return <div className="lab-content"><div className="state-card"><div className="state-value">{count}</div><div className="state-actions"><button onClick={() => setCount(c => c - 1)}>−</button><button onClick={() => setCount(c => c + 1)}>+</button><button onClick={() => setCount(0)}>Reset</button></div><small>Change the state and watch the displayed value update.</small></div><CompleteButton disabled={count === 0} onClick={finish} /></div>;
  }

  if (['array', 'methods', 'object', 'modern'].includes(mode)) {
    return <div className="lab-content"><div className="array-row">{items.map((x, i) => <button key={`${x}-${i}`} onClick={() => setItems(a => a.filter((_, j) => j !== i))}>{x} ×</button>)}</div><div className="token-bank"><button onClick={() => setItems(a => [...a, 'React'])}>+ Add React</button><button onClick={() => setItems(a => [...a].reverse())}>Reverse</button><button onClick={() => setItems(a => a.map(x => x.toUpperCase()))}>Map → Uppercase</button></div><CompleteButton disabled={items.length < 3} onClick={finish} /></div>;
  }

  if (['dom-tree', 'component-tree'].includes(mode)) {
    const nodes = mode === 'dom-tree' ? ['document', 'main', 'section', 'button'] : ['App', 'Header', 'Main', 'Card', 'Button'];
    return <div className="lab-content"><div className="tree">{nodes.map((n, i) => <button key={n} style={{ marginLeft: i * 18 }} className={selected === i ? 'picked' : ''} onClick={() => setSelected(i)}>↳ {n}</button>)}</div>{selected !== null && <div className="feedback">Selected <b>{nodes[selected]}</b>. The nesting relationship is visible from the indentation.</div>}<CompleteButton disabled={selected === null} onClick={finish} /></div>;
  }

  if (['change', 'create', 'listener', 'delegate'].includes(mode)) {
    const act = (message) => setEventLog(log => [...log, message]);
    return <div className="lab-content"><div className="browser-preview"><h3>{eventLog.includes('text') ? 'Updated text' : 'Hello Intern'}</h3>{eventLog.includes('create') && <p>New node appended ✓</p>}</div><div className="token-bank"><button onClick={() => act('create')}>Create element</button><button onClick={() => act('text')}>Change text</button><button onClick={() => act('event')}>Trigger event</button></div><div className="feedback">{eventLog.length ? `Event log: ${eventLog.join(' → ')}` : 'Interact with the DOM controls.'}</div><CompleteButton disabled={!eventLog.length} onClick={finish} /></div>;
  }

  if (['validate', 'react-form', 'form'].includes(mode)) {
    const valid = emailOk(input);
    return <div className="lab-content"><label className="field">Email<input value={input} onChange={e => setInput(e.target.value)} placeholder="you@example.com" /></label><div className={valid ? 'success' : 'feedback'}>{valid ? 'Valid input — the form can continue.' : 'Edit the field until the validation state becomes valid.'}</div><CompleteButton disabled={!valid} onClick={finish} /></div>;
  }

  if (['storage', 'session', 'persistence'].includes(mode)) {
    return <div className="lab-content"><div className="storage-row"><input value={input} onChange={e => setInput(e.target.value)} placeholder="theme=dark" /><button onClick={() => setStatus(input || 'theme=dark')}>Save</button><button onClick={() => setStatus('Removed key')}>Remove</button></div><div className="storage-view"><Pill>SIMULATED STORAGE</Pill><code>{status || 'No changes yet'}</code></div><CompleteButton disabled={!status} onClick={finish} /></div>;
  }

  if (['promise', 'async', 'error', 'async-error', 'response', 'request', 'api-ui', 'api-debug'].includes(mode)) {
    return <div className="lab-content"><div className="api-card"><div className="status-dot" data-state={status} /><strong>{status.toUpperCase()}</strong><p>Simulated request lifecycle. Trigger states and observe the transition.</p></div><div className="token-bank"><button onClick={() => setStatus('pending')}>Start</button><button onClick={() => setStatus('fulfilled')}>Resolve</button><button onClick={() => setStatus('rejected')}>Reject</button></div><CompleteButton disabled={!['fulfilled', 'rejected'].includes(status)} onClick={finish} /></div>;
  }

  if (['grid-builder', 'grid-areas'].includes(mode)) {
    return <div className="lab-content"><div className="grid-preview" style={{ gridTemplateColumns: `repeat(${cols},1fr)`, gap }}>{['Header', 'Main', 'Side', 'Footer'].map(x => <div key={x}>{x}</div>)}</div><label className="range-label">Columns<input type="range" min="1" max="4" value={cols} onChange={e => setCols(+e.target.value)} /><strong>{cols}</strong></label><label className="range-label">Gap<input type="range" min="4" max="32" value={gap} onChange={e => setGap(+e.target.value)} /><strong>{gap}px</strong></label><CompleteButton disabled={cols === 2 && gap === 16} onClick={finish} /></div>;
  }

  if (['responsive', 'breakpoint', 'grid-responsive', 'lazy'].includes(mode)) {
    const width = value + 320;
    return <div className="lab-content"><label className="range-label">Simulated viewport<input type="range" min="320" max="1200" value={width} onChange={e => setValue(+e.target.value - 320)} /><strong>{width}px</strong></label><div className="responsive-preview" style={{ width: `${clamp(width, 320, 900)}px` }}><Pill>{width < 640 ? 'MOBILE' : 'DESKTOP'}</Pill><div className="responsive-boxes"><span>Nav</span><span>Content</span><span>Aside</span></div></div><CompleteButton disabled={width === 640} onClick={finish} /></div>;
  }

  if (['keyframes', 'motion-access'].includes(mode)) {
    return <div className="lab-content"><div className={`motion-box ${motion ? 'moving' : ''}`}>Frame {step + 1}</div><div className="token-bank"><button onClick={() => setStep(s => (s + 1) % 4)}>Next keyframe</button><button onClick={() => setMotion(m => !m)}>{motion ? 'Reduce motion' : 'Enable motion'}</button></div><div className="feedback">Animation: {motion ? 'enabled' : 'reduced'}.</div><CompleteButton disabled={step === 0} onClick={finish} /></div>;
  }

  if (['routes', 'navigation', 'params'].includes(mode)) {
    const routes = ['/home', '/internships', '/intern/42'];
    return <div className="lab-content"><div className="route-bar">{routes.map(r => <button key={r} className={route === r ? 'picked' : ''} onClick={() => setRoute(r)}>{r}</button>)}</div><div className="browser-preview"><h3>Rendered screen</h3><p>{route === '/intern/42' ? 'Intern profile #42' : route === '/internships' ? 'Internship catalog' : 'Dashboard home'}</p></div><CompleteButton disabled={route === '/home'} onClick={finish} /></div>;
  }

  if (['performance', 'audit', 'bug-hunt', 'security'].includes(mode)) {
    const list = mode === 'security' ? ['Escape user HTML', 'Keep secrets server-side', 'Validate external input', 'Use safe URLs'] : ['Large render', 'Missing label', 'Unused request', 'Heavy asset'];
    return <div className="lab-content"><div className="audit-list">{list.map(x => <button key={x} className={findings.includes(x) ? 'fixed' : ''} onClick={() => setFindings(f => f.includes(x) ? f : [...f, x])}><b>{x}</b><span>{findings.includes(x) ? 'Reviewed ✓' : 'Inspect'}</span></button>)}</div><div className="feedback">Review findings one by one. Each interaction reveals a remediation note.</div><CompleteButton disabled={findings.length < 2} onClick={finish} /></div>;
  }

  if (mode === 'object') {
    return <div className="lab-content"><div className="preview-card"><h3>{objectName}</h3><p>{objectRole}</p></div><div className="control-grid"><label>Name<input value={objectName} onChange={e => setObjectName(e.target.value)} /></label><label>Role<input value={objectRole} onChange={e => setObjectRole(e.target.value)} /></label></div><CompleteButton disabled={!objectName || !objectRole} onClick={finish} /></div>;
  }

  if (mode === 'jsx') {
    return <div className="lab-content"><div className="code-box"><code>&lt;Card&gt;{` ${input || 'Hello Intern'} `}&lt;/Card&gt;</code></div><label className="field">Children content<input value={input} onChange={e => setInput(e.target.value)} placeholder="Type JSX children" /></label><CompleteButton disabled={!input} onClick={finish} /></div>;
  }

  if (mode === 'props') {
    return <div className="lab-content"><label className="field">Name<input value={input} onChange={e => setInput(e.target.value)} placeholder="Maya" /></label><div className="preview-card"><Pill>CHILD COMPONENT</Pill><h3>Hello {input || '...'}</h3><p>Changing the prop updates the child output.</p></div><CompleteButton disabled={!input} onClick={finish} /></div>;
  }

  if (mode === 'children') {
    return <div className="lab-content"><div className="builder-preview"><Pill>CARD</Pill><strong>{input || 'Drop content into children'}</strong></div><label className="field">Children<input value={input} onChange={e => setInput(e.target.value)} placeholder="Profile summary" /></label><CompleteButton disabled={!input} onClick={finish} /></div>;
  }

  // Remaining curriculum modes still get a distinct manipulation instead of falling back to an MCQ.
  const family = mode.includes('link') || mode.includes('table') ? 'builder' : mode.includes('anchor') ? 'anchor' : mode.includes('bubble') ? 'bubble' : mode.includes('compose') || mode.includes('custom-hook') ? 'compose' : mode.includes('flex-') ? 'flex' : mode.includes('debug') ? 'debug' : mode.includes('operator') || mode.includes('type') || mode.includes('value') ? 'values' : mode.includes('request') ? 'request' : mode.includes('props') ? 'props' : mode.includes('media') ? 'media' : mode.includes('sticky') ? 'sticky' : 'builder';

  if (family === 'builder') {
    const options = mode.includes('table') ? ['Header row', 'Name column', 'Score column', 'Data row'] : mode.includes('link') ? ['URL', 'Accessible text', 'New tab', 'Safe rel'] : ['Structure', 'Content', 'Action'];
    return <div className="lab-content"><div className="builder-preview">{added.length ? added.map(x => <span className="builder-chip" key={x}>{x}</span>) : <span className="muted">Build the {mode.replaceAll('-', ' ')} here</span>}</div><div className="token-bank">{options.map(x => <button key={x} className={added.includes(x) ? 'picked' : ''} onClick={() => setAdded(a => a.includes(x) ? a.filter(v => v !== x) : [...a, x])}>{x}</button>)}</div><CompleteButton disabled={added.length < 2} onClick={finish} /></div>;
  }
  if (family === 'anchor') {
    return <div className="lab-content"><div className="anchor-board"><div className="anchor-card"><span className="anchor-badge" style={{left:`${value}%`,top:`${radius}%`}}>BADGE</span><span>position: absolute</span></div></div><label className="range-label">Horizontal<input type="range" min="5" max="90" value={value} onChange={e=>setValue(+e.target.value)}/><strong>{value}%</strong></label><label className="range-label">Vertical<input type="range" min="5" max="90" value={radius} onChange={e=>setRadius(+e.target.value)}/><strong>{radius}%</strong></label><CompleteButton disabled={value===50&&radius===14} onClick={finish}/></div>;
  }
  if (family === 'bubble') {
    const nodes=['Button','Card','Section','App']; return <div className="lab-content"><div className="event-path">{nodes.map((n,i)=><button key={n} className={step>=i?'step-active':''} onClick={()=>setStep(i)}>{n}{i<nodes.length-1?' → ':''}</button>)}</div><div className="feedback">Event path: {nodes.slice(0,step+1).join(' → ')}</div><CompleteButton disabled={step<3} onClick={finish}/></div>;
  }
  if (family === 'compose') {
    const blocks=['State','Effect','UI','Service']; return <div className="lab-content"><div className="architecture-canvas">{blocks.map((b,i)=><button key={b} className={selected===i?'picked':''} onClick={()=>setSelected(i)} style={{transform:`translate(${(i%2)*18}px,${Math.floor(i/2)*8}px)`}}>{b}</button>)}</div><div className="feedback">Select each layer to inspect what responsibility it owns.</div><CompleteButton disabled={selected===null} onClick={finish}/></div>;
  }
  if (family === 'flex') {
    const dirs=['row','column']; const aligns=['start','center','end']; return <div className="lab-content"><div className="segmented">{dirs.map(d=><button key={d} className={selected===d? 'picked':''} onClick={()=>setSelected(d)}>{d}</button>)}</div><div className="flex-preview" style={{flexDirection:selected==='column'?'column':'row',alignItems:aligns[step%3]}}>{['A','B','C'].map(x=><span key={x}>{x}</span>)}</div><div className="token-bank">{aligns.map((a,i)=><button key={a} onClick={()=>setStep(i)}>{a}</button>)}</div><CompleteButton disabled={!selected} onClick={finish}/></div>;
  }
  if (family === 'debug') {
    return <div className="lab-content"><div className="debug-console"><code>expected: 100px</code><code>actual: {value}px</code></div><label className="range-label">Fix value<input type="range" min="20" max="180" value={value} onChange={e=>setValue(+e.target.value)}/><strong>{value}px</strong></label><div className={value===100?'success':'feedback'}>{value===100?'Bug fixed — the output now matches the expected behavior.':'Tune the value until the observed behavior matches the expected result.'}</div><CompleteButton disabled={value!==100} onClick={finish}/></div>;
  }
  if (family === 'values') {
    const vals=['"hello"','42','true','null','{ }']; return <div className="lab-content"><div className="token-bank">{vals.map((v,i)=><button key={v} className={selected===i?'picked':''} onClick={()=>setSelected(i)}>{v}</button>)}</div>{selected!==null&&<div className="result-large">typeof → <strong>{['string','number','boolean','object','object'][selected]}</strong></div>}<CompleteButton disabled={selected===null} onClick={finish}/></div>;
  }
  if (family === 'request') {
    const methods=['GET','POST','PUT','DELETE']; return <div className="lab-content"><div className="segmented">{methods.map(m=><button key={m} className={selected===m?'picked':''} onClick={()=>setSelected(m)}>{m}</button>)}</div><div className="request-preview"><Pill>REQUEST</Pill><code>{selected||'Choose a method'} /api/interns/42</code></div><CompleteButton disabled={!selected} onClick={finish}/></div>;
  }
  if (family === 'props') {
    return <div className="lab-content"><div className="token-bank"><button onClick={()=>setInput('Maya')}>name="Maya"</button><button onClick={()=>setInput('Frontend')}>role="Frontend"</button><button onClick={()=>setInput('90')}>score={90}</button></div><div className="preview-card"><Pill>PROP → CHILD</Pill><h3>{input||'Select a prop'}</h3><p>The child output changes when the prop value changes.</p></div><CompleteButton disabled={!input} onClick={finish}/></div>;
  }
  if (family === 'media') {
    const types=['image','audio','video']; return <div className="lab-content"><div className="media-switch">{types.map(t=><button key={t} className={activeTab===t?'picked':''} onClick={()=>setActiveTab(t)}>{t}</button>)}</div><div className="media-preview"><div className="media-icon">{activeTab==='image'?'▧':activeTab==='audio'?'◖))':'▶'}</div><strong>{activeTab} element</strong><span>Choose a medium and inspect its role.</span></div><CompleteButton disabled={activeTab==='image'} onClick={finish}/></div>;
  }
  if (family === 'sticky') {
    return <div className="lab-content"><div className="sticky-demo"><div className="sticky-header">sticky header</div><div className="scroll-lines">{Array.from({length:7},(_,i)=><span key={i}>content line {i+1}</span>)}</div></div><button onClick={()=>setStep(s=>Math.min(4,s+1))}>Scroll simulation ({step}/4)</button><CompleteButton disabled={step<4} onClick={finish}/></div>;
  }

  return <div className="lab-content"><div className="stage"><Pill>INTERACTIVE</Pill><h3>{mode.replaceAll('-', ' ')}</h3><p>Manipulate the example to learn the concept.</p></div><button onClick={finish}>Complete exploration</button></div>;
}

function Activity({ activity, done, locked, onComplete }) {
  return <section className={`activity ${done ? 'done' : ''} ${locked ? 'activity-locked' : ''}`}>
    <div className="activity-head"><Pill>{activity.type}</Pill><h2>{activity.title}</h2>{done && <span className="check">✓</span>}</div>
    <p className="instruction">{activity.instruction}</p>
    {locked ? <div className="locked-panel">🔒 Complete the previous interactive experience to unlock this one.</div> : <><div className="concept"><strong>Why this matters</strong><span>{activity.content?.concept}</span><small>{activity.content?.tip}</small></div><InteractiveLab mode={activity.interaction.mode} onComplete={onComplete} /></>}
  </section>;
}

export default function InteractiveLearningDashboard() {
  const [day, setDay] = useState(1);
  const [progress, setProgress] = useState(() => { try { return JSON.parse(sessionStorage.getItem('proeduvate-progress') || '{}'); } catch { return {}; } });
  const current = curriculum[day - 1];
  const key = `day-${day}`;
  const done = progress[key] || [];
  const complete = (id) => setProgress(p => { const n = { ...p, [key]: [...new Set([...(p[key] || []), id])] }; sessionStorage.setItem('proeduvate-progress', JSON.stringify(n)); return n; });
  const completed = done.length === current.activities.length;
  const pct = Math.round(done.length / current.activities.length * 100);
  const dayUnlocked = d => d === 1 || ((progress[`day-${d - 1}`] || []).length === curriculum[d - 2].activities.length);

  return <div className="app"><aside><div className="brand"><div className="logo">PRO<span>EDUVATE</span></div><div className="role">INTERN MODE</div></div><div className="path-title">30-Day Frontend Path</div><div className="days">{curriculum.map(d => <button key={d.day} disabled={!dayUnlocked(d.day)} className={day === d.day ? 'active' : ''} onClick={() => setDay(d.day)}><span>{String(d.day).padStart(2, '0')}</span><em>{d.topic}</em>{!dayUnlocked(d.day) ? <b>🔒</b> : progress[`day-${d.day}`]?.length === d.activities.length && <b>✓</b>}</button>)}</div></aside><main><header><div><p className="eyebrow">DAY {String(day).padStart(2, '0')} / 30</p><h1>{current.topic}</h1><p className="muted">Interactive Learning <span>→</span> Assessment <span>→</span> Practical Task</p></div><div className="progress"><div><strong>{pct}%</strong><span>learning complete</span></div><div className="bar"><i style={{ width: `${pct}%` }} /></div></div></header><div className="objectives"><strong>Today you will</strong>{current.learningObjectives.map(x => <span key={x}>✓ {x}</span>)}</div><div className="deck">{current.activities.map((a, i) => <Activity key={a.id} activity={a} done={done.includes(a.id)} locked={i > 0 && !done.includes(current.activities[i - 1].id)} onComplete={() => complete(a.id)} />)}</div><footer><button className="secondary" onClick={() => setDay(d => Math.max(1, d - 1))}>← Previous</button><div>{completed ? <span className="ready">✓ Learning complete — assessment unlocked</span> : <span className="locked">Complete the interactive experiences in order</span>}</div><button className="primary" disabled={!completed} onClick={() => window.location.href = '/intern?assessment=true'}>
        Start Assessment &rarr;
      </button></footer></main></div>;
}
