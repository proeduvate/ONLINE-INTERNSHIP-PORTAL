import React, { useEffect, useState } from 'react';
import api from '../../../api/axios';
import { createRoot } from 'react-dom/client';
import { curriculum } from './data/curriculum';
import './styles.css';
import { useAuth } from '../../../services/AuthContext';

const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const emailOk = (v) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v);

function Pill({ children }) { return <span className="pill">{children}</span>; }
function CompleteButton({ disabled, onClick, children = 'Complete interaction' }) {
  return <button className="complete-btn" disabled={disabled} onClick={onClick}>{children}</button>;
}

function InteractiveLab({ interaction, onComplete }) {
  const [selected, setSelected] = useState(null);
  const [value, setValue] = useState(50);
  const [chosen, setChosen] = useState([]);
  const [step, setStep] = useState(0);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('idle');
  const [added, setAdded] = useState([]);

  const { mode, family, config } = interaction;
  const finish = () => onComplete();

  if (family === 'click-map') {
    const parts = config?.items || ['Target A', 'Target B', 'Target C'];
    const descriptions = config?.descriptions || [];
    return <div className="lab-content"><div className="mini-stage map-stage">{parts.map((x, i) => <button key={x} className={selected === i ? 'picked' : ''} onClick={() => setSelected(i)}>{x}</button>)}</div>{selected !== null && <div className="feedback"><b>{parts[selected]}</b><span>{descriptions[selected] || 'Explore the selected element.'}</span></div>}<CompleteButton disabled={selected === null} onClick={finish} /></div>;
  }

  if (family === 'anatomy') {
    const parts = config?.items || ['Part A', 'Part B', 'Part C'];
    const descriptions = config?.descriptions || [];
    return <div className="lab-content"><div className="code anatomy-code">{parts.map((x, i) => <button key={x} className={selected === i ? 'picked' : ''} onClick={() => setSelected(i)}>{x}</button>)}</div>{selected !== null && <div className="feedback"><b>{parts[selected]}</b><span>{descriptions[selected] || 'Inspect the component.'}</span></div>}<CompleteButton disabled={selected === null} onClick={finish} /></div>;
  }

  if (family === 'compare') {
    const choices = config?.choices || ['Option A', 'Option B'];
    return <div className="lab-content"><div className="compare-grid">{choices.map((x, i) => <button key={x} className={selected === i ? 'compare-picked' : ''} onClick={() => setSelected(i)}><span>{x}</span></button>)}</div><CompleteButton disabled={selected === null} onClick={finish} /></div>;
  }

  if (family === 'reorder') {
    const goal = config?.goal || ['Step 1', 'Step 2', 'Step 3'];
    const current = goal.slice();
    const ok = true; // Simplified for demo
    return <div className="lab-content"><div className="reorder-list">{current.map((x, i) => <div className="reorder-row" key={x}><span>{i + 1}</span><b>{x}</b></div>)}</div><div className="feedback">Organize items logically.</div><CompleteButton disabled={false} onClick={finish} /></div>;
  }

  if (family === 'builder') {
    const options = config?.options || ['Block 1', 'Block 2', 'Block 3'];
    return <div className="lab-content"><div className="builder-preview">{added.length ? added.map(x => <span className="builder-chip" key={x}>{x}</span>) : <span className="muted">Your composition appears here</span>}</div><div className="token-bank">{options.map(x => <button key={x} className={added.includes(x) ? 'picked' : ''} onClick={() => setAdded(a => a.includes(x) ? a.filter(v => v !== x) : [...a, x])}>{x}</button>)}</div><CompleteButton disabled={added.length < 1} onClick={finish} /></div>;
  }

  if (family === 'slider') {
    return <div className="lab-content"><div className="control-grid"><label>Value<input type="range" min={config?.min || 0} max={config?.max || 100} value={value} onChange={e => setValue(+e.target.value)} /><strong>{value}</strong></label></div><div className="preview-card" style={{ padding: `${8 + value / 3}px` }}><Pill>LIVE PREVIEW</Pill><p>Change the controls and watch the visual result update.</p></div><CompleteButton disabled={value === 50} onClick={finish} /></div>;
  }

  if (family === 'live-preview') {
    const parts = config?.items || ['Variant 1', 'Variant 2'];
    return <div className="lab-content"><div className="segmented">{parts.map((t, i) => <button key={t} className={selected === i ? 'picked' : ''} onClick={() => setSelected(i)}>{t}</button>)}</div><div className="browser-preview">{parts[selected || 0]} Preview</div><CompleteButton disabled={selected === null} onClick={finish} /></div>;
  }

  if (family === 'simulator') {
    return <div className="lab-content"><div className="api-card"><div className="status-dot" data-state={status} /><strong>{status.toUpperCase()}</strong><p>Simulated state lifecycle.</p></div><div className="token-bank"><button onClick={() => setStatus('pending')}>Start</button><button onClick={() => setStatus('fulfilled')}>Success</button></div><CompleteButton disabled={status === 'idle'} onClick={finish} /></div>;
  }

  if (family === 'timeline') {
    const labels = config?.labels || ['Start', 'End'];
    return <div className="lab-content"><div className="timeline">{labels.map((x, i) => <button key={x} className={step === i ? 'step-active' : ''} onClick={() => setStep(i)}><span>{i + 1}</span>{x}</button>)}</div><div className="feedback">Advance one step at a time.</div><CompleteButton disabled={step !== labels.length - 1} onClick={finish} /></div>;
  }

  if (family === 'debug') {
    return <div className="lab-content"><div className="debug-console"><code>expected: {config?.target || 100}</code><code>actual: {value}</code></div><label className="range-label">Fix value<input type="range" min="0" max="200" value={value} onChange={e => setValue(+e.target.value)} /><strong>{value}</strong></label><CompleteButton disabled={value !== (config?.target || 100)} onClick={finish} /></div>;
  }

  if (family === 'flow') {
    const nodes = config?.nodes || ['Start', 'Condition', 'End'];
    return <div className="lab-content"><div className="event-path">{nodes.map((n, i) => <button key={n} className={step >= i ? 'step-active' : ''} onClick={() => setStep(i)}>{n}</button>)}</div><div className="feedback">Trace the flow path.</div><CompleteButton disabled={step < nodes.length - 1} onClick={finish} /></div>;
  }

  if (family === 'tree') {
    const nodes = config?.nodes || ['Root', 'Child A', 'Child B'];
    return <div className="lab-content"><div className="tree">{nodes.map((n, i) => <button key={n} style={{ marginLeft: i * 18 }} className={selected === i ? 'picked' : ''} onClick={() => setSelected(i)}>↳ {n}</button>)}</div><CompleteButton disabled={selected === null} onClick={finish} /></div>;
  }

  if (family === 'form') {
    return <div className="lab-content"><label className="field">Input<input value={input} onChange={e => setInput(e.target.value)} placeholder="Type here..." /></label><div className={input ? 'success' : 'feedback'}>{input ? 'Valid input.' : 'Edit the field.'}</div><CompleteButton disabled={!input} onClick={finish} /></div>;
  }

  if (family === 'lab') {
    return <div className="lab-content"><textarea className="code-input" value={input || config?.code} onChange={e => setInput(e.target.value)} spellCheck="false" /><div className="json-preview">Interactive Lab Session</div><CompleteButton disabled={!input} onClick={finish} /></div>;
  }

  return <div className="lab-content"><div className="stage"><Pill>INTERACTIVE</Pill><h3>{mode?.replaceAll('-', ' ')}</h3><p>Manipulate the example to learn the concept.</p></div><button onClick={finish}>Complete exploration</button></div>;
}

function Activity({ activity, done, locked, onComplete }) {
  return <section className={`activity ${done ? 'done' : ''} ${locked ? 'activity-locked' : ''}`}>
    <div className="activity-head"><Pill>{activity.type}</Pill><h2>{activity.title}</h2>{done && <span className="check">✓</span>}</div>
    <p className="instruction">{activity.instruction}</p>
    {locked ? <div className="locked-panel">🔒 Complete the previous interactive experience to unlock this one.</div> : <><div className="concept"><strong>Why this matters</strong><span>{activity.content?.concept}</span><small>{activity.content?.tip}</small></div><InteractiveLab interaction={activity.interaction} onComplete={onComplete} /></>}
  </section>;
}

export default function InteractiveLearningDashboard() {
  const { devDomain } = useAuth();
  const [day, setDay] = useState(1);
  const [maxUnlockedDay, setMaxUnlockedDay] = useState(1);
  const [dynamicCurriculum, setDynamicCurriculum] = useState([]);
  const [loading, setLoading] = useState(true);

  const [progress, setProgress] = useState(() => {
    try { return JSON.parse(sessionStorage.getItem('proeduvate-progress') || '{}'); } catch { return {}; }
  });

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const url = devDomain ? `/tasks/intern?dev_domain=${encodeURIComponent(devDomain)}` : '/tasks/intern';
        const res = await api.get(url);
        const fetchedTasks = res.data;

        let curriculumList = [];
        let highestDay = 1;

        fetchedTasks.forEach(task => {
          if (task.day_number > highestDay) highestDay = task.day_number;
          if (task.interactive_json) {
            try {
              const parsed = JSON.parse(task.interactive_json);
              curriculumList.push({ day: task.day_number, ...parsed });
            } catch (e) {
              console.error("Invalid interactive_json on task:", task.id);
            }
          }
        });

        // Sort by day
        curriculumList.sort((a, b) => a.day - b.day);

        // Fallback to static if empty for demo purposes
        if (curriculumList.length === 0) {
          curriculumList = curriculum;
          highestDay = 30; // Unlock all if fallback
        }

        setDynamicCurriculum(curriculumList);
        setMaxUnlockedDay(highestDay);
      } catch (err) {
        console.error("Failed to fetch tasks for interactive learning", err);
        setDynamicCurriculum(curriculum);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [devDomain]);

  if (loading) return <div style={{ padding: '24px' }}>Loading Interactive Modules...</div>;
  if (!dynamicCurriculum.length) return <div style={{ padding: '24px' }}>No interactive modules assigned for your domain.</div>;

  const current = dynamicCurriculum.find(c => c.day === day) || dynamicCurriculum[0];
  const key = `day-${day}`;
  const done = progress[key] || [];
  const complete = (id) => setProgress(p => {
    const n = { ...p, [key]: [...new Set([...(p[key] || []), id])] };
    sessionStorage.setItem('proeduvate-progress', JSON.stringify(n));
    return n;
  });

  const completed = current?.activities ? done.length === current.activities.length : false;
  const pct = current?.activities ? Math.round(done.length / current.activities.length * 100) : 0;
  const dayUnlocked = d => d <= maxUnlockedDay;

  return (
    <div className="app">
      <aside>
        <div className="brand">
          <div className="logo">PRO<span>EDUVATE</span></div>
          <div className="role">INTERN MODE</div>
        </div>
        <div className="path-title">Interactive Path</div>
        <div className="days" style={{ marginTop: '12px' }}>
          <button className="btn btn-secondary" style={{ width: '100%', marginBottom: '16px' }} onClick={() => window.location.href = '/intern'}>
            &larr; Back to Dashboard
          </button>
          {dynamicCurriculum.map(d => (
            <button
              key={d.day}
              disabled={!dayUnlocked(d.day)}
              className={day === d.day ? 'active' : ''}
              onClick={() => setDay(d.day)}
            >
              <span>{String(d.day).padStart(2, '0')}</span>
              <em>{d.topic}</em>
              {!dayUnlocked(d.day) ? <b>🔒</b> : progress[`day-${d.day}`]?.length === d.activities?.length && <b>✓</b>}
            </button>
          ))}
        </div>
      </aside>
      <main>
        <header>
          <div>
            <p className="eyebrow">DAY {String(day).padStart(2, '0')}</p>
            <h1>{current?.topic}</h1>
            <p className="muted">Interactive Learning <span>→</span> Assessment <span>→</span> Practical Task</p>
          </div>
          <div className="progress">
            <div><strong>{pct}%</strong><span>learning complete</span></div>
            <div className="bar"><i style={{ width: `${pct}%` }} /></div>
          </div>
        </header>
        <div className="objectives">
          <strong>Today you will</strong>
          {current?.learningObjectives?.map(x => <span key={x}>✓ {x}</span>)}
        </div>
        <div className="deck">
          {current?.activities?.map((a, i) => (
            <Activity
              key={a.id}
              activity={a}
              done={done.includes(a.id)}
              locked={i > 0 && !done.includes(current.activities[i - 1].id)}
              onComplete={() => complete(a.id)}
            />
          ))}
        </div>
        <footer>
          <button className="secondary" onClick={() => setDay(d => Math.max(1, d - 1))}>← Previous</button>
          <div>
            {completed ? <span className="ready">✓ Learning complete — assessment unlocked</span> : <span className="locked">Complete the interactive experiences in order</span>}
          </div>
          <button className="primary" disabled={!completed} onClick={() => window.location.href = '/intern?assessment=true'}>
            Start Assessment &rarr;
          </button>
        </footer>
      </main>
    </div>
  );
}
