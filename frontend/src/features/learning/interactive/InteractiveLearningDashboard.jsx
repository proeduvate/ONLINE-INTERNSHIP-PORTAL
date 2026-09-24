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
  const [order, setOrder] = useState([]);
  const [explored, setExplored] = useState(new Set());

  useEffect(() => {
    setSelected(null);
    setValue(50);
    setChosen([]);
    setStep(0);
    setInput('');
    setStatus('idle');
    setAdded([]);
    setExplored(new Set());
    if (interaction?.family === 'reorder') {
      setOrder([...(interaction.config?.goal || ['Step 1', 'Step 2', 'Step 3'])].reverse());
    } else {
      setOrder([]);
    }
  }, [interaction]);

  const { mode, family, config } = interaction;
  const finish = () => onComplete();

  if (family === 'click-map' || family === 'anatomy') {
    const parts = config?.items || ['Target A', 'Target B', 'Target C'];
    const descriptions = config?.descriptions || [];
    const isCorrect = explored.size === parts.length;
    return (
      <div className="lab-content">
        <div className={family === 'click-map' ? "mini-stage map-stage" : "code anatomy-code"}>
          {parts.map((x, i) => (
            <button key={x} className={selected === i ? 'picked' : ''} onClick={() => { setSelected(i); setExplored(new Set([...explored, i])); }}>
              {x}
            </button>
          ))}
        </div>
        {selected !== null && (
          <div className="feedback">
            <b>{parts[selected]}</b>
            <span>{descriptions[selected] || 'Explore the selected element.'}</span>
          </div>
        )}
        <div className={isCorrect ? 'success' : 'feedback'}>
          {isCorrect ? 'Exploration complete!' : `Explore all ${parts.length} items to continue.`}
        </div>
        <CompleteButton disabled={!isCorrect} onClick={finish} />
      </div>
    );
  }

  if (family === 'compare') {
    const choices = config?.choices || ['Option A', 'Option B'];
    const answer = config?.answer;
    const isCorrect = answer ? choices[selected] === answer : selected !== null;
    return (
      <div className="lab-content">
        <div className="compare-grid">
          {choices.map((x, i) => (
            <button key={x} className={selected === i ? 'compare-picked' : ''} onClick={() => setSelected(i)}>
              <span>{x}</span>
            </button>
          ))}
        </div>
        <div className={isCorrect && selected !== null ? 'success' : 'feedback'}>
          {selected === null ? 'Select an option.' : isCorrect ? 'Correct!' : 'Incorrect, try again.'}
        </div>
        <CompleteButton disabled={!isCorrect} onClick={finish} />
      </div>
    );
  }

  if (family === 'reorder') {
    const goal = config?.goal || ['Step 1', 'Step 2', 'Step 3'];
    const current = order.length ? order : goal.slice().reverse();
    
    const moveUp = (idx) => {
      if (idx === 0) return;
      const newOrder = [...current];
      [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
      setOrder(newOrder);
    };
    
    const moveDown = (idx) => {
      if (idx === current.length - 1) return;
      const newOrder = [...current];
      [newOrder[idx + 1], newOrder[idx]] = [newOrder[idx], newOrder[idx + 1]];
      setOrder(newOrder);
    };

    const isCorrect = JSON.stringify(current) === JSON.stringify(goal);

    return (
      <div className="lab-content">
        <div className="reorder-list">
          {current.map((x, i) => (
            <div className="reorder-row" key={x} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{i + 1}</span>
              <b style={{ flex: 1 }}>{x.replace(/^\d+\.\s*/, '')}</b>
              <button onClick={() => moveUp(i)} disabled={i === 0} style={{ padding: '2px 8px', cursor: i === 0 ? 'not-allowed' : 'pointer' }}>↑</button>
              <button onClick={() => moveDown(i)} disabled={i === current.length - 1} style={{ padding: '2px 8px', cursor: i === current.length - 1 ? 'not-allowed' : 'pointer' }}>↓</button>
            </div>
          ))}
        </div>
        <div className={isCorrect ? 'success' : 'feedback'}>
          {isCorrect ? 'Correctly ordered!' : 'Organize items logically.'}
        </div>
        <CompleteButton disabled={!isCorrect} onClick={finish} />
      </div>
    );
  }

  if (family === 'builder') {
    const options = config?.options || ['Block 1', 'Block 2', 'Block 3'];
    const required = config?.required || [];
    const isCorrect = required.length 
      ? JSON.stringify(added) === JSON.stringify(required) 
      : added.length > 0;

    return (
      <div className="lab-content">
        <div className="builder-preview">
          {added.length ? added.map((x, i) => <span className="builder-chip" key={`${x}-${i}`}>{x}</span>) : <span className="muted">Your composition appears here</span>}
        </div>
        <div className="token-bank">
          {options.map(x => (
            <button key={x} className={added.includes(x) ? 'picked' : ''} onClick={() => setAdded(a => a.includes(x) ? a.filter(v => v !== x) : [...a, x])}>
              {x}
            </button>
          ))}
        </div>
        <div className={isCorrect ? 'success' : 'feedback'}>
          {isCorrect ? 'Correct composition!' : 'Build the correct structure.'}
        </div>
        <CompleteButton disabled={!isCorrect} onClick={finish} />
      </div>
    );
  }

  if (family === 'slider') {
    const target = config?.target;
    const isCorrect = target !== undefined ? value === target : value !== 50;
    return (
      <div className="lab-content">
        <div className="control-grid">
          <label>Value<input type="range" min={config?.min || 0} max={config?.max || 100} value={value} onChange={e => setValue(+e.target.value)} /><strong>{value}</strong></label>
        </div>
        <div className="preview-card" style={{ padding: `${8 + value / 3}px` }}>
          <Pill>LIVE PREVIEW</Pill>
          <p>Change the controls and watch the visual result update.</p>
        </div>
        <div className={isCorrect ? 'success' : 'feedback'}>
          {isCorrect ? 'Value set successfully!' : 'Adjust the value.'}
        </div>
        <CompleteButton disabled={!isCorrect} onClick={finish} />
      </div>
    );
  }

  if (family === 'live-preview') {
    const parts = config?.items || ['Variant 1', 'Variant 2'];
    const isCorrect = explored.size === parts.length;
    return (
      <div className="lab-content">
        <div className="segmented">
          {parts.map((t, i) => (
            <button key={t} className={selected === i ? 'picked' : ''} onClick={() => { setSelected(i); setExplored(new Set([...explored, i])); }}>
              {t}
            </button>
          ))}
        </div>
        <div className="browser-preview">{parts[selected || 0]} Preview</div>
        <div className={isCorrect ? 'success' : 'feedback'}>
          {isCorrect ? 'Exploration complete!' : `Explore all ${parts.length} variants.`}
        </div>
        <CompleteButton disabled={!isCorrect} onClick={finish} />
      </div>
    );
  }

  if (family === 'simulator') {
    const target = config?.target || 'fulfilled';
    const isCorrect = status === target;
    return (
      <div className="lab-content">
        <div className="api-card">
          <div className="status-dot" data-state={status} />
          <strong>{status.toUpperCase()}</strong>
          <p>Simulated state lifecycle.</p>
        </div>
        <div className="token-bank">
          <button onClick={() => setStatus('pending')}>Start</button>
          <button onClick={() => setStatus('fulfilled')}>Success</button>
        </div>
        <div className={isCorrect ? 'success' : 'feedback'}>
          {isCorrect ? 'Simulation complete!' : `Reach the ${target} state.`}
        </div>
        <CompleteButton disabled={!isCorrect} onClick={finish} />
      </div>
    );
  }

  if (family === 'timeline' || family === 'flow') {
    const items = config?.labels || config?.nodes || ['Start', 'End'];
    const isCorrect = step === items.length - 1;
    return (
      <div className="lab-content">
        <div className={family === 'timeline' ? "timeline" : "event-path"}>
          {items.map((x, i) => (
            <button key={x} className={(family === 'timeline' ? step === i : step >= i) ? 'step-active' : ''} onClick={() => setStep(i)}>
              {family === 'timeline' ? <span>{i + 1}</span> : null}
              {x}
            </button>
          ))}
        </div>
        <div className={isCorrect ? 'success' : 'feedback'}>
          {isCorrect ? 'Sequence complete!' : 'Advance to the end.'}
        </div>
        <CompleteButton disabled={!isCorrect} onClick={finish} />
      </div>
    );
  }

  if (family === 'debug') {
    const target = config?.target || 100;
    const isCorrect = value === target;
    return (
      <div className="lab-content">
        <div className="debug-console">
          <code>expected: {target}</code>
          <code>actual: {value}</code>
        </div>
        <label className="range-label">
          Fix value
          <input type="range" min="0" max="200" value={value} onChange={e => setValue(+e.target.value)} />
          <strong>{value}</strong>
        </label>
        <div className={isCorrect ? 'success' : 'feedback'}>
          {isCorrect ? 'Bug fixed!' : 'Adjust the value to match the expected output.'}
        </div>
        <CompleteButton disabled={!isCorrect} onClick={finish} />
      </div>
    );
  }

  if (family === 'tree') {
    const nodes = config?.nodes || ['Root', 'Child A', 'Child B'];
    const isCorrect = explored.size === nodes.length;
    return (
      <div className="lab-content">
        <div className="tree">
          {nodes.map((n, i) => (
            <button key={n} style={{ marginLeft: i * 18 }} className={selected === i ? 'picked' : ''} onClick={() => { setSelected(i); setExplored(new Set([...explored, i])); }}>
              ↳ {n}
            </button>
          ))}
        </div>
        <div className={isCorrect ? 'success' : 'feedback'}>
          {isCorrect ? 'Tree fully explored!' : `Explore all ${nodes.length} nodes.`}
        </div>
        <CompleteButton disabled={!isCorrect} onClick={finish} />
      </div>
    );
  }

  if (family === 'form') {
    const target = config?.target;
    const isCorrect = target ? input === target : input.length > 0;
    return (
      <div className="lab-content">
        <label className="field">
          Input
          <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type here..." />
        </label>
        <div className={isCorrect ? 'success' : 'feedback'}>
          {isCorrect ? 'Valid input!' : target ? `Input must exactly match: ${target}` : 'Edit the field.'}
        </div>
        <CompleteButton disabled={!isCorrect} onClick={finish} />
      </div>
    );
  }

  if (family === 'lab') {
    const target = config?.target;
    const isCorrect = target ? input.includes(target) : input.length > 0;
    return (
      <div className="lab-content">
        <textarea className="code-input" value={input || config?.code} onChange={e => setInput(e.target.value)} spellCheck="false" />
        <div className="json-preview">Interactive Lab Session</div>
        <div className={isCorrect ? 'success' : 'feedback'}>
          {isCorrect ? 'Lab complete!' : 'Complete the required exercise.'}
        </div>
        <CompleteButton disabled={!isCorrect} onClick={finish} />
      </div>
    );
  }

  return (
    <div className="lab-content">
      <div className="stage">
        <Pill>INTERACTIVE</Pill>
        <h3>{mode?.replaceAll('-', ' ')}</h3>
        <p>Manipulate the example to learn the concept.</p>
      </div>
      <button className="complete-btn" onClick={finish}>Complete exploration</button>
    </div>
  );
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

        // Deduplicate by day
        curriculumList = Array.from(new Map(curriculumList.map(c => [c.day, c])).values());

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
