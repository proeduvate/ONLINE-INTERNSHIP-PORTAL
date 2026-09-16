import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowLeft, ArrowRight, BookOpen, Check, ChevronRight, CircleHelp,
  Code2, Edit3, GraduationCap, LayoutDashboard, Lock, Play, Save,
  Send, Sparkles, Target, Users, Wand2
} from "lucide-react";
import "./styles.css";

const API = "http://localhost:8000/api";

const learningSlides = [
  {
    type: "discover",
    title: "Your first webpage is already built",
    subtitle: "Explore it before learning the code.",
    body: "Click each visible part. The goal is not to memorize tags yet — discover what each part does.",
  },
  {
    type: "anatomy",
    title: "An HTML element has a structure",
    subtitle: "Reveal each part of the element.",
    body: "Interact with the opening tag, content and closing tag.",
  },
  {
    type: "experiment",
    title: "Change the tag. Watch the page change.",
    subtitle: "You are learning by manipulating the concept.",
    body: "Try at least two different tags and observe the result.",
  },
  {
    type: "reveal",
    title: "The visual page has code behind it",
    subtitle: "Reveal the code only after exploring.",
    body: "Connect what you saw on screen with the HTML that produced it.",
  },
  {
    type: "guided",
    title: "Build a heading yourself",
    subtitle: "Complete the guided code.",
    body: "This is guided learning, not the final practical assessment.",
  }
];

export default function NormalLearningDashboard() {
  const [role, setRole] = useState("intern");
  const [task, setTask] = useState(null);

  useEffect(() => {
    fetch(`${API}/tasks/DAY-01`).then(r => r.json()).then(setTask).catch(() => {});
  }, []);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="logo">P</div><span>ProEduvate</span></div>
        <div className="role-switch">
          <button className={role === "intern" ? "active" : ""} onClick={() => setRole("intern")}>Intern</button>
          <button className={role === "mentor" ? "active" : ""} onClick={() => setRole("mentor")}>Mentor</button>
        </div>
        <nav>
          <div className="nav-item active"><LayoutDashboard size={17}/> Dashboard</div>
          <div className="nav-item"><BookOpen size={17}/> Learning</div>
          <div className="nav-item"><Target size={17}/> Tasks</div>
          {role === "mentor" && <div className="nav-item"><Users size={17}/> Interns</div>}
        </nav>
        <div className="side-bottom">
          <div className="mini-card">
            <Sparkles size={16}/>
            <div><strong>AI Coach</strong><span>Ready to help</span></div>
          </div>
        </div>
      </aside>

      <main className="main">
        {role === "intern"
          ? <InternDashboard task={task} />
          : <MentorDashboard task={task} onTask={setTask} />}
      </main>
    </div>
  );
}

function Topbar({eyebrow, title, right}) {
  return <header className="topbar">
    <div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1></div>
    {right}
  </header>
}

function InternDashboard({task}) {
  const [view, setView] = useState("dashboard");
  const [completed, setCompleted] = useState(false);

  if (view === "learning") return <LearningDeck task={task} onDone={() => {setCompleted(true); setView("dashboard")}} />;
  return <div>
    <Topbar eyebrow="INTERNSHIP / DAY 01" title="Good evening, Alex" right={<div className="status-pill"><span/> Day 1 active</div>} />
    <section className="hero-card">
      <div>
        <div className="lime-label"><Sparkles size={15}/> TODAY'S MISSION</div>
        <h2>{task?.title || "HTML5 Fundamentals & Semantic Structure"}</h2>
        <p>{task?.description || "Learn HTML fundamentals through an interactive experience, then prove your understanding."}</p>
        <button className="primary-btn" onClick={() => setView("learning")}><Play size={16}/> Start Interactive Learning <ArrowRight size={16}/></button>
      </div>
      <div className="day-orb"><span>DAY</span><strong>01</strong><small>of 30</small></div>
    </section>

    <div className="section-title"><div><span>DAY 01</span><h3>Your learning path</h3></div><span className="muted">Unlocks sequentially</span></div>
    <div className="path-grid">
      <PathCard icon={<BookOpen/>} title="Interactive Learning" text="Explore concepts before assessment" state={completed ? "done" : "active"} onClick={() => setView("learning")} />
      <PathCard icon={<CircleHelp/>} title={`MCQ Assessment · ${task?.mcq_count || 5} questions`} text="Check what you understood" state={completed ? "unlocked" : "locked"} />
      <PathCard icon={<Code2/>} title={task?.practical_title || "Practical Task"} text="Apply the concept independently" state={completed ? "unlocked" : "locked"} />
    </div>

    <div className="bottom-grid">
      <div className="panel">
        <div className="panel-head"><span>PROGRESS</span><strong>3 / 30 days</strong></div>
        <div className="progress"><i style={{width:"10%"}}/></div>
        <div className="stats"><div><strong>1</strong><span>Learning day</span></div><div><strong>0</strong><span>Submissions</span></div><div><strong>0</strong><span>Mentor reviews</span></div></div>
      </div>
      <div className="panel coach"><Wand2/><div><strong>AI Coach</strong><p>Stuck? Ask why a concept works instead of asking for the answer.</p></div></div>
    </div>
  </div>
}

function PathCard({icon,title,text,state,onClick}) {
  return <button className={`path-card ${state}`} onClick={state !== "locked" ? onClick : undefined}>
    <div className="path-icon">{state === "locked" ? <Lock/> : state === "done" ? <Check/> : icon}</div>
    <div className="path-copy"><strong>{title}</strong><span>{text}</span></div>
    <ChevronRight className="chev"/>
  </button>
}

function LearningDeck({task,onDone}) {
  const [slide, setSlide] = useState(0);
  const [interactionDone, setInteractionDone] = useState(false);
  const [marks, setMarks] = useState({});
  const current = learningSlides[slide];

  useEffect(() => { setInteractionDone(false); }, [slide]);

  const complete = (key) => {
    setMarks(m => ({...m, [key]: true}));
  };

  const next = () => {
    if (slide === learningSlides.length - 1) onDone();
    else setSlide(s => s + 1);
  };

  return <div className="learning-shell">
    <div className="deck-top">
      <button className="icon-btn" onClick={onDone}><ArrowLeft size={17}/></button>
      <div><span className="eyebrow">DAY 01 · INTERACTIVE LEARNING</span><strong>HTML Fundamentals</strong></div>
      <div className="deck-progress">{learningSlides.map((_,i)=><i className={i <= slide ? "on":""} key={i}/>)}</div>
    </div>

    <div className="deck-card">
      <div className="slide-copy">
        <div className="slide-number">0{slide+1} / 05</div>
        <h2>{current.title}</h2>
        <h4>{current.subtitle}</h4>
        <p>{current.body}</p>
      </div>
      <div className="interactive-area">
        {current.type === "discover" && <Discover marks={marks} complete={complete} />}
        {current.type === "anatomy" && <Anatomy marks={marks} complete={complete} />}
        {current.type === "experiment" && <Experiment complete={() => setInteractionDone(true)} />}
        {current.type === "reveal" && <Reveal complete={() => setInteractionDone(true)} />}
        {current.type === "guided" && <Guided complete={() => setInteractionDone(true)} />}
      </div>
    </div>

    <div className="deck-footer">
      <div className="hint"><Sparkles size={15}/> Interact with the concept — don't just read it.</div>
      <button className="primary-btn" disabled={!interactionReady(current.type, marks, interactionDone)} onClick={next}>
        {slide === learningSlides.length - 1 ? "Finish Learning" : "Continue"} <ArrowRight size={16}/>
      </button>
    </div>
  </div>
}

function interactionReady(type, marks, done) {
  if (type === "discover") return ["heading","paragraph","button"].every(k => marks[k]);
  if (type === "anatomy") return ["open","content","close"].every(k => marks[k]);
  return done;
}

function Discover({marks,complete}) {
  const info = {
    heading: ["Heading", "Tells the reader what the page is about."],
    paragraph: ["Paragraph", "Contains normal text and explanations."],
    button: ["Button", "Creates an action the user can interact with."]
  };
  return <div className="web-mock">
    <div className="mock-browser"><span/><span/><span/><b>my-first-site.html</b></div>
    <div className="mock-page">
      <button className={`discover heading ${marks.heading ? "selected":""}`} onClick={() => complete("heading")}>My Portfolio</button>
      <button className={`discover paragraph ${marks.paragraph ? "selected":""}`} onClick={() => complete("paragraph")}>Welcome to my first website. I'm learning HTML.</button>
      <button className={`discover button ${marks.button ? "selected":""}`} onClick={() => complete("button")}>Contact Me</button>
      <div className="discover-info">
        {Object.entries(info).filter(([k])=>marks[k]).map(([k,v])=><div key={k}><strong>{v[0]}</strong><span>{v[1]}</span></div>)}
        {!Object.values(marks).length && <span>Click the heading, paragraph and button.</span>}
      </div>
    </div>
  </div>
}

function Anatomy({marks,complete}) {
  const parts = [
    ["open","<h1>","Opening tag","Tells the browser where the element starts."],
    ["content","My Portfolio","Content","This is what the user sees."],
    ["close","</h1>","Closing tag","Tells the browser where the element ends."]
  ];
  return <div className="anatomy-box">
    <div className="code-line">
      {parts.map(([key,label,name,desc])=><button key={key} className={marks[key] ? "selected":""} onClick={()=>complete(key)}>{label}</button>)}
    </div>
    <div className="anatomy-info">
      {parts.map(([key,,name,desc])=>marks[key] && <div key={key}><strong>{name}</strong><span>{desc}</span></div>)}
    </div>
  </div>
}

function Experiment({complete}) {
  const [tag,setTag] = useState("h1");
  const label = tag === "h1" ? "My Portfolio" : tag === "h2" ? "My Portfolio" : "My Portfolio is here.";
  return <div className="experiment">
    <div className="control-row"><label>Choose a tag</label><select value={tag} onChange={e=>{setTag(e.target.value); complete()}}><option>h1</option><option>h2</option><option>p</option></select></div>
    <div className="live-preview"><span>LIVE OUTPUT</span>{tag === "h1" ? <h1>{label}</h1> : tag === "h2" ? <h2>{label}</h2> : <p>{label}</p>}</div>
    <code>&lt;{tag}&gt;My Portfolio&lt;/{tag}&gt;</code>
  </div>
}

function Reveal({complete}) {
  const [shown,setShown] = useState(false);
  return <div className="reveal-box">
    <div className="mini-page"><h2>My Portfolio</h2><p>Welcome to my first website.</p><button>Contact Me</button></div>
    {!shown ? <button className="primary-btn" onClick={()=>{setShown(true);complete()}}><Code2 size={16}/> Show me the code</button>
      : <pre>{`<header>\\n  <h1>My Portfolio</h1>\\n</header>\\n\\n<p>Welcome to my first website.</p>\\n\\n<button>Contact Me</button>`}</pre>}
  </div>
}

function Guided({complete}) {
  const [tag,setTag] = useState("");
  const good = tag === "h1";
  return <div className="guided">
    <div className="guided-code">&lt;<select value={tag} onChange={e=>{setTag(e.target.value); if(e.target.value==="h1") complete()}}><option value="">?</option><option value="h1">h1</option><option value="h2">h2</option><option value="p">p</option></select>&gt;My Portfolio&lt;/<span>{tag || "?"}</span>&gt;</div>
    <div className={`feedback ${good ? "good":""}`}>{good ? "✓ Correct — h1 communicates the main heading." : "Choose the tag that represents the main heading."}</div>
  </div>
}

function MentorDashboard({task,onTask}) {
  const [form,setForm] = useState(task || {});
  const [saved,setSaved] = useState(false);
  useEffect(()=>{if(task) setForm(task)},[task]);

  const change = (e) => setForm({...form,[e.target.name]:e.target.value});
  const save = async () => {
    const payload = {
      title: form.title,
      description: form.description,
      learning_goal: form.learning_goal,
      due_date: form.due_date,
      mcq_count: Number(form.mcq_count || 5),
      practical_title: form.practical_title,
      practical_description: form.practical_description
    };
    try {
      const res = await fetch(`${API}/tasks/DAY-01`, {method:"PUT", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload)});
      const updated = await res.json();
      onTask(updated); setSaved(true); setTimeout(()=>setSaved(false),1800);
    } catch {
      setSaved(true); setTimeout(()=>setSaved(false),1800);
    }
  };

  return <div>
    <Topbar eyebrow="MENTOR CONSOLE / TASK MANAGEMENT" title="Day 01 Assignment" right={<div className="publish-badge"><span/> Published</div>} />
    <div className="mentor-grid">
      <div className="panel editor-panel">
        <div className="panel-head"><div><span>TASK BUILDER</span><h3>Update intern learning task</h3></div><div className="version">v{task?.version || 1}</div></div>
        <div className="form-grid">
          <label>Task title<input name="title" value={form.title || ""} onChange={change}/></label>
          <label>Due date<input type="date" name="due_date" value={form.due_date || ""} onChange={change}/></label>
        </div>
        <label>Description<textarea name="description" value={form.description || ""} onChange={change}/></label>
        <label>Learning goal<textarea name="learning_goal" value={form.learning_goal || ""} onChange={change}/></label>
        <div className="form-grid">
          <label>MCQ count<input type="number" name="mcq_count" value={form.mcq_count || 5} onChange={change}/></label>
          <label>Practical title<input name="practical_title" value={form.practical_title || ""} onChange={change}/></label>
        </div>
        <label>Practical instructions<textarea name="practical_description" value={form.practical_description || ""} onChange={change}/></label>
        <button className="primary-btn" onClick={save}><Save size={16}/> {saved ? "Published to Interns ✓" : "Save & Publish"}</button>
      </div>

      <div className="panel preview-panel">
        <div className="panel-head"><div><span>INTERN PREVIEW</span><h3>What the intern receives</h3></div></div>
        <div className="preview-day">DAY 01 <span>Frontend Development</span></div>
        <h2>{form.title || "Untitled task"}</h2>
        <p>{form.description || "Task description..."}</p>
        <div className="preview-step"><BookOpen/><div><strong>Interactive Learning</strong><span>5 concept experiences</span></div></div>
        <div className="preview-step"><CircleHelp/><div><strong>{form.mcq_count || 5} MCQs</strong><span>Separate assessment after learning</span></div></div>
        <div className="preview-step"><Code2/><div><strong>{form.practical_title || "Practical Task"}</strong><span>{form.practical_description || "Instructions appear here."}</span></div></div>
        <div className="publish-note"><Send size={15}/> Changes are versioned and published to the intern task.</div>
      </div>
    </div>
  </div>
}


