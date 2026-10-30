import React, { useMemo } from "react";
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  Sparkles, 
  Target, 
  Lock, 
  Calendar, 
  Check, 
  Flag, 
  Gift, 
  Play, 
  Award, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import DailyScenarioCalendar from "../../../components/Simulation/DailyScenarioCalendar";

/**
 * InternOverviewTab Component
 * 
 * Production-grade overview dashboard for interns:
 * - Dynamic Day 15 Midterm Milestone Countdown (Part A6.6)
 * - 4 Key Performance Indicators (Tasks, Assessments, Attendance, Overall AI Score)
 * - Interactive 30-day journey tracker
 * - Real-time daily objectives, submissions status, and leaderboard
 */
const InternOverviewTab = ({
  currentDay = 1,
  tasksCompletedCount = 0,
  assessmentsCount = 0,
  attendancePercent = 0,
  aiScore = 0,
  curriculumData = [],
  liveSubmissions = [],
  liveLeaderboard = [],
  userRankStr = "Unranked",
  internUser = null,
  bonusAirdrops = [],
  setActiveTab,
  setIsMeetingActive,
  handleStartAirdrop
}) => {
  // Day 15 Midterm Milestone Calculations (Part A6.6)
  const milestoneInfo = useMemo(() => {
    const isPastMidterm = currentDay > 15;
    const isMidtermDay = currentDay === 15;
    const daysUntilMidterm = Math.max(0, 15 - currentDay);
    const midtermProgress = Math.min(100, Math.round((Math.min(currentDay, 15) / 15) * 100));
    const capstoneDaysRemaining = Math.max(0, 30 - currentDay);
    
    return {
      isPastMidterm,
      isMidtermDay,
      daysUntilMidterm,
      midtermProgress,
      capstoneDaysRemaining
    };
  }, [currentDay]);

  // Active curriculum day data
  const activeCurriculum = useMemo(() => {
    return curriculumData.find(c => c.day === currentDay) || curriculumData[0] || {
      day: currentDay,
      topic: "Core Fundamentals & Hands-on Implementation",
      desc: "Daily task and learning objectives"
    };
  }, [curriculumData, currentDay]);

  // Active airdrops
  const activeAirdropsList = useMemo(() => {
    return bonusAirdrops.filter(a => a.status === "Active" || a.status === "APPROVED");
  }, [bonusAirdrops]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif", boxSizing: "border-box" }}>
      
      {/* Top Hero Row: Journey Banner + Day 15 Midterm Milestone Card */}
      <div className="intern-hero-row">
        
        {/* Left Hero Banner */}
        <div className="hero-banner-card" style={{
          borderRadius: "16px",
          padding: "18px 22px",
          color: "var(--text-primary, #0f172a)",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          minHeight: "180px"
        }}>
          {/* Mountain Silhouette Background */}
          <svg style={{ position: "absolute", right: "10px", bottom: 0, height: "100%", width: "42%", opacity: 0.22, pointerEvents: "none" }} viewBox="0 0 400 200" fill="none" preserveAspectRatio="none">
            <path d="M0 200 L140 60 L240 160 L350 10 L400 200 Z" fill="#0284c7" />
            <path d="M100 200 L250 40 L340 130 L400 200 Z" fill="#0369a1" opacity="0.7" />
            <circle cx="350" cy="8" r="3" fill="var(--text-primary, #0f172a)" />
            <path d="M348 12 L352 22 M345 16 L355 16" stroke="var(--text-primary, #0f172a)" strokeWidth="2" />
          </svg>

          <div style={{ position: "relative", zIndex: 2, marginBottom: "16px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", color: "var(--primary-dark, #1d4ed8)", display: "block", marginBottom: "4px" }}>
              YOUR 30-DAY PROFESSIONAL TRACK
            </span>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 800, margin: "0 0 4px 0", color: "var(--text-primary, #0f172a)", letterSpacing: "-0.03em", lineHeight: "1.2" }}>
              Learn. Build. <span className="hero-banner-grow" style={{ color: "#2563eb" }}>Grow.</span>
            </h1>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary, #475569)" }}>
              Welcome back, <strong style={{ color: "var(--text-primary, #0f172a)" }}>{internUser?.name || "Student"}</strong>. Today is Day {currentDay} of your internship curriculum.
            </p>
          </div>

          {/* 4 Floating Metric Cards */}
          <div className="intern-metrics-grid" style={{ position: "relative", zIndex: 3 }}>
            <div style={{ background: "var(--bg-surface, #ffffff)", padding: "10px 14px", borderRadius: "12px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)" }}>
              <div className="stat-icon-bg-blue" style={{ width: "34px", height: "34px", borderRadius: "8px", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <BookOpen size={16} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h4 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, color: "var(--text-primary, #0f172a)", lineHeight: 1 }}>{tasksCompletedCount} / 30</h4>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted, #64748b)", fontWeight: 600 }}>Tasks Completed</span>
              </div>
            </div>

            <div style={{ background: "var(--bg-surface, #ffffff)", padding: "10px 14px", borderRadius: "12px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)" }}>
              <div className="stat-icon-bg-green" style={{ width: "34px", height: "34px", borderRadius: "8px", background: "#f0fdf4", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <CheckCircle size={16} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h4 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, color: "var(--text-primary, #0f172a)", lineHeight: 1 }}>{assessmentsCount} / 30</h4>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted, #64748b)", fontWeight: 600 }}>Assessments</span>
              </div>
            </div>

            <div style={{ background: "var(--bg-surface, #ffffff)", padding: "10px 14px", borderRadius: "12px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)" }}>
              <div className="stat-icon-bg-orange" style={{ width: "34px", height: "34px", borderRadius: "8px", background: "#fff7ed", color: "#ea580c", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Clock size={16} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h4 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, color: "var(--text-primary, #0f172a)", lineHeight: 1 }}>{attendancePercent}%</h4>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted, #64748b)", fontWeight: 600 }}>Attendance</span>
              </div>
            </div>

            <div style={{ background: "var(--bg-surface, #ffffff)", padding: "10px 14px", borderRadius: "12px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 2px 6px rgba(15, 23, 42, 0.04)" }}>
              <div className="stat-icon-bg-purple" style={{ width: "34px", height: "34px", borderRadius: "8px", background: "#faf5ff", color: "#9333ea", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Sparkles size={16} />
              </div>
              <div style={{ minWidth: 0 }}>
                <h4 style={{ fontSize: "1.1rem", fontWeight: 800, margin: 0, color: "var(--text-primary, #0f172a)", lineHeight: 1 }}>{aiScore}%</h4>
                <span style={{ fontSize: "0.7rem", color: "var(--text-muted, #64748b)", fontWeight: 600 }}>Overall Score</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Card: Day 15 Midterm Milestone Countdown (Part A6.6) */}
        <div className="milestone-banner">
          {/* Subtle Background Glow */}
          <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "120px", height: "120px", background: "radial-gradient(circle, rgba(59, 130, 246, 0.25) 0%, transparent 70%)", borderRadius: "50%", pointerEvents: "none" }} />
          
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ 
                fontSize: "10px", 
                fontWeight: 800, 
                textTransform: "uppercase", 
                letterSpacing: "1px", 
                background: milestoneInfo.isPastMidterm ? "#166534" : "#1e3a8a", 
                color: milestoneInfo.isPastMidterm ? "#86efac" : "#93c5fd", 
                padding: "3px 8px", 
                borderRadius: "20px",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px"
              }}>
                <Award size={12} /> {milestoneInfo.isPastMidterm ? "Milestone Unlocked" : "Midterm Milestone"}
              </span>

              <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>
                Day {currentDay} of 30
              </span>
            </div>

            <h3 style={{ margin: "0 0 6px 0", fontSize: "1.2rem", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.02em" }}>
              {milestoneInfo.isPastMidterm
                ? "Midterm Achieved ✓"
                : milestoneInfo.isMidtermDay
                ? "Day 15 Midterm Evaluation Day!"
                : `${milestoneInfo.daysUntilMidterm} Day${milestoneInfo.daysUntilMidterm === 1 ? '' : 's'} to Day 15 Midterm`}
            </h3>

            <p style={{ margin: "0 0 12px 0", fontSize: "0.8rem", color: "#cbd5e1", lineHeight: "1.4" }}>
              {milestoneInfo.isPastMidterm
                ? `Completed foundation phase. Capstone project milestone due in ${milestoneInfo.capstoneDaysRemaining} days (Day 30).`
                : milestoneInfo.isMidtermDay
                ? "Your comprehensive Day 15 midterm assessment is now active. Pass with >=70% to unlock advanced modules."
                : `Comprehensive evaluation of Core & Foundation modules. Maintain consistency across daily tasks.`}
            </p>
          </div>

          <div>
            {/* Progress Bar towards Milestone */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px", fontSize: "0.75rem" }}>
              <span style={{ color: "#94a3b8", fontWeight: 600 }}>
                {milestoneInfo.isPastMidterm ? "Capstone Progress" : "Midterm Readiness"}
              </span>
              <span style={{ color: "#60a5fa", fontWeight: 700 }}>
                {milestoneInfo.isPastMidterm ? `${Math.round(((currentDay - 15) / 15) * 100)}%` : `${milestoneInfo.midtermProgress}%`}
              </span>
            </div>
            
            <div style={{ height: "6px", background: "rgba(255, 255, 255, 0.12)", borderRadius: "3px", overflow: "hidden", marginBottom: "12px" }}>
              <div style={{ 
                width: `${milestoneInfo.isPastMidterm ? Math.round(((currentDay - 15) / 15) * 100) : milestoneInfo.midtermProgress}%`, 
                height: "100%", 
                background: milestoneInfo.isPastMidterm ? "linear-gradient(90deg, #10b981, #34d399)" : "linear-gradient(90deg, #3b82f6, #60a5fa)", 
                borderRadius: "3px",
                transition: "width 0.4s ease"
              }} />
            </div>

            <button 
              onClick={() => setActiveTab("Learning")}
              style={{
                width: "100%",
                padding: "8px 14px",
                borderRadius: "8px",
                background: milestoneInfo.isMidtermDay ? "#2563eb" : "rgba(255, 255, 255, 0.1)",
                color: "#ffffff",
                border: "1px solid rgba(255, 255, 255, 0.15)",
                fontSize: "0.8rem",
                fontWeight: 700,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "all 0.2s ease"
              }}
              onMouseOver={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"}
              onMouseOut={(e) => e.currentTarget.style.background = milestoneInfo.isMidtermDay ? "#2563eb" : "rgba(255, 255, 255, 0.1)"}
            >
              {milestoneInfo.isMidtermDay ? "Take Midterm Assessment" : "View Curriculum Milestones"} <ArrowRight size={14} />
            </button>
          </div>
        </div>

      </div>

      {/* Main Content 3-Column / Responsive Row */}
      <div className="intern-content-row">
        
        {/* Left Column: 30-Day Journey Timeline */}
        <div style={{ background: "var(--bg-surface, #ffffff)", padding: "16px", borderRadius: "16px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", flexDirection: "column", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ margin: 0, fontSize: "1rem", color: "var(--text-primary, #0f172a)", fontWeight: 800 }}>30-Day Curriculum</h3>
            <span style={{ fontSize: "0.8rem", color: "#2563eb", fontWeight: 700, cursor: "pointer" }} onClick={() => setActiveTab("Progress")}>
              Full Path &rarr;
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", position: "relative", paddingLeft: "6px", paddingTop: "4px" }}>
            <div style={{ position: "absolute", left: "15px", top: "16px", bottom: "16px", width: "2px", background: "#f1f5f9", borderRadius: "4px" }} />

            {(() => {
              const visibleDaysCount = 8;
              let startDay = Math.max(1, currentDay - 2);
              if (startDay + visibleDaysCount - 1 > 30) startDay = 30 - visibleDaysCount + 1;
              
              return Array.from({ length: visibleDaysCount }, (_, i) => {
                const dayNum = startDay + i;
                const topics = [
                  "HTML5 Semantics & DOM", "CSS Flexbox & Grid", "Modern JavaScript (ES6+)", "Async JS & Promises", 
                  "React Architecture & JSX", "Components & Props", "State Management & Hooks", "Lifecycle & useEffect", 
                  "Context API & Global Store", "React Router Navigation", "State Redux / Zustand", "Testing & Jest", 
                  "RESTful API Consumption", "Authentication & JWT", "Midterm Milestone Review", "Database Schema Basics", 
                  "Node.js Runtime", "Express Architecture", "Database CRUD Operations", "Backend Services", 
                  "Fullstack Integration", "Web Security (OWASP)", "Docker & Containers", "CI/CD Deployment", 
                  "Cloud Services", "Caching & Redis", "Web Performance & Lighthouse", "Accessibility (a11y)", 
                  "Capstone Project Setup", "Final Capstone Evaluation"
                ];
                const mockTitle = curriculumData.find(c => c.day === dayNum)?.topic || topics[dayNum - 1] || `Day ${dayNum} Module`;
                return {
                  day: `Day ${dayNum}`,
                  dayNum,
                  title: mockTitle,
                  done: dayNum < currentDay,
                  current: dayNum === currentDay,
                  locked: dayNum > currentDay,
                  isFlag: dayNum === 30,
                  isMidterm: dayNum === 15
                };
              });
            })().map((step) => (
              <div key={step.dayNum} style={{ display: "flex", alignItems: "center", gap: "12px", zIndex: 2, padding: "3px 0" }}>
                <div style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  background: step.done ? "#16a34a" : (step.current ? "#2563eb" : "var(--bg-surface, #ffffff)"),
                  border: step.locked ? "2px solid var(--border-color, #cbd5e1)" : "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: step.done || step.current ? "#ffffff" : "#94a3b8",
                  fontSize: "10px",
                  boxShadow: step.current ? "0 0 0 3px rgba(37, 99, 235, 0.2)" : "none",
                  transition: "all 0.2s ease"
                }}>
                  {step.done && <Check size={12} strokeWidth={3} />}
                  {step.current && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ffffff" }} />}
                  {step.locked && !step.isFlag && <Lock size={10} />}
                  {step.isFlag && <Flag size={10} />}
                </div>

                <div style={{ 
                  flex: 1, 
                  padding: step.current ? "8px 12px" : "6px 8px", 
                  background: step.current ? "#eff6ff" : "transparent", 
                  borderRadius: "8px", 
                  border: step.current ? "1px solid #bfdbfe" : "1px solid transparent", 
                  transition: "all 0.2s ease",
                  minWidth: 0
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.82rem", fontWeight: 800, color: step.current ? "#1d4ed8" : (step.done ? "var(--text-primary, #0f172a)" : "#94a3b8") }}>
                      {step.day} {step.isMidterm && "★ Midterm"}
                    </span>
                    {step.current && (
                      <span style={{ fontSize: "0.62rem", fontWeight: 800, color: "#2563eb", background: "#dbeafe", padding: "1px 6px", borderRadius: "10px", textTransform: "uppercase" }}>
                        Current
                      </span>
                    )}
                  </div>
                  <p style={{ margin: "2px 0 0 0", fontSize: "0.78rem", color: step.current ? "#2563eb" : (step.done ? "#475569" : "#94a3b8"), fontWeight: step.current ? 700 : 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {step.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Middle Column: Today's Objective, Bonus Airdrop teaser, Recent Submissions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          
          {/* Today's Objective Card */}
          <div style={{ background: "var(--bg-surface, #ffffff)", padding: "16px 20px", borderRadius: "16px", border: "1px solid var(--border-color, #e2e8f0)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column", gap: "12px" }}>
            
            {/* Objective Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#eff6ff", color: "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Target size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: "1.05rem", color: "var(--text-primary, #0f172a)", fontWeight: 800 }}>Today's Objective</h3>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-muted, #64748b)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                    Day {activeCurriculum.day}: {activeCurriculum.topic}
                  </span>
                </div>
              </div>
              
              <button 
                className="btn-primary" 
                style={{ padding: "6px 14px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700, margin: 0, cursor: "pointer" }} 
                onClick={() => setActiveTab("Learning")}
              >
                Go to Learning &rarr;
              </button>
            </div>

            {/* Module Progress */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary, #334155)" }}>Module Completion</span>
                <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "#2563eb" }}>
                  {tasksCompletedCount >= currentDay ? "100%" : "In Progress"}
                </span>
              </div>
              <div style={{ height: "6px", background: "#f1f5f9", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ 
                  width: tasksCompletedCount >= currentDay ? "100%" : "60%", 
                  height: "100%", 
                  background: tasksCompletedCount >= currentDay ? "#16a34a" : "#2563eb", 
                  borderRadius: "3px" 
                }} />
              </div>
            </div>

            {/* Tasks Checklist */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "18px", height: "18px", borderRadius: "4px", background: tasksCompletedCount >= currentDay ? "#16a34a" : "#eff6ff", color: tasksCompletedCount >= currentDay ? "#ffffff" : "#2563eb", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {tasksCompletedCount >= currentDay ? <Check size={12} /> : <Play size={10} fill="currentColor" />}
                </div>
                <span style={{ fontSize: "0.85rem", color: tasksCompletedCount >= currentDay ? "#166534" : "var(--text-primary, #0f172a)", fontWeight: 600 }}>
                  {activeCurriculum.topic}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "18px", height: "18px", borderRadius: "4px", background: assessmentsCount >= currentDay ? "#16a34a" : "#f1f5f9", color: assessmentsCount >= currentDay ? "#ffffff" : "#94a3b8", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {assessmentsCount >= currentDay ? <Check size={12} /> : <Target size={10} />}
                </div>
                <span style={{ fontSize: "0.85rem", color: assessmentsCount >= currentDay ? "#166534" : "var(--text-muted, #64748b)", fontWeight: 500 }}>
                  Day {currentDay} MCQ & Coding Assessment
                </span>
              </div>
            </div>

            {/* Upcoming / Join Meeting Box */}
            <div style={{ background: "var(--bg-surface-elevated, #f8fafc)", padding: "10px 14px", borderRadius: "12px", border: "1px solid var(--border-color, #e2e8f0)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#e2e8f0", color: "#475569", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Calendar size={16} />
                </div>
                <div>
                  <span style={{ fontSize: "0.65rem", color: "var(--text-muted, #64748b)", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", display: "block" }}>Interactive Session</span>
                  <span style={{ fontSize: "0.88rem", color: "var(--text-primary, #0f172a)", fontWeight: 700 }}>Mentor Q&A & Standup Room</span>
                </div>
              </div>
              <button 
                style={{ padding: "6px 16px", background: "#0f172a", color: "#ffffff", border: "none", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }} 
                onClick={() => setIsMeetingActive(true)}
              >
                Join
              </button>
            </div>
          </div>

          {/* Bonus Airdrop Compact Bar */}
          <div className="bonus-airdrop-card" style={{ borderRadius: "12px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "12px", background: "var(--bg-surface, #ffffff)", border: "1px solid var(--border-color, #e2e8f0)" }}>
            <div className="bonus-airdrop-icon" style={{ width: "32px", height: "32px", borderRadius: "8px", background: "#fef3c7", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Gift size={16} />
            </div>
            <span style={{ fontSize: "0.8rem", fontWeight: 800, color: "var(--text-primary, #0f172a)", flexShrink: 0 }}>Bonus Airdrop</span>
            <span style={{ padding: "2px 8px", borderRadius: "20px", fontSize: "0.65rem", fontWeight: 700, flexShrink: 0, background: activeAirdropsList.length > 0 ? "#dbeafe" : "#f1f5f9", color: activeAirdropsList.length > 0 ? "#1d4ed8" : "#64748b" }}>
              {activeAirdropsList.length} Active
            </span>
            <span style={{ flex: 1, fontSize: "0.75rem", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: "var(--text-secondary, #475569)" }}>
              {activeAirdropsList[0]?.question || "Solve spontaneous real-world engineering puzzles to earn bonus points!"}
            </span>
            {activeAirdropsList[0] && (
              <button 
                onClick={() => handleStartAirdrop(activeAirdropsList[0])} 
                style={{ flexShrink: 0, padding: "5px 12px", border: "none", borderRadius: "7px", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", background: "#2563eb", color: "#ffffff" }}
              >
                Attempt
              </button>
            )}
            <button 
              onClick={() => setActiveTab("Bonus Airdrops")} 
              style={{ flexShrink: 0, padding: "5px 12px", background: "transparent", border: "1px solid #cbd5e1", borderRadius: "7px", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", color: "var(--text-primary, #0f172a)" }}
            >
              View All →
            </button>
          </div>

          {/* Recent Submissions Card */}
          <div style={{ flex: 1, background: "var(--bg-surface, #ffffff)", padding: "14px 16px", borderRadius: "16px", border: "1px solid var(--border-color, #e2e8f0)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <h3 style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-primary, #0f172a)", fontWeight: 800 }}>Recent Submissions</h3>
              <span style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: 700, cursor: "pointer" }} onClick={() => setActiveTab("Learning")}>
                View All &rarr;
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
              {liveSubmissions.length === 0 ? (
                <div style={{ padding: "20px 12px", textAlign: "center", color: "var(--text-muted, #64748b)", fontSize: "0.85rem" }}>
                  No task submissions yet. Complete today's assignment in the Learning tab to view your scores!
                </div>
              ) : (
                liveSubmissions.slice(0, 4).map((sub, sIdx) => {
                  const isApproved = sub.status === "approved";
                  const totalSubScore = (sub.mcq_score || 0) + (sub.ai_score || 0) + (sub.mentor_score || 0);
                  return (
                    <div key={sub.id || sIdx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--bg-surface-elevated, #f8fafc)", borderRadius: "10px", border: "1px solid var(--border-color, #e2e8f0)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: isApproved ? "#dcfce7" : "#fef3c7", color: isApproved ? "#16a34a" : "#d97706", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          {isApproved ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <span style={{ fontSize: "0.82rem", color: "var(--text-primary, #0f172a)", fontWeight: 700, display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {sub.task_title || sub.assignment_name || `Task #${sub.task_id || (sIdx + 1)}`}
                          </span>
                          <span style={{ fontSize: "0.65rem", color: "var(--text-muted, #64748b)", fontWeight: 600 }}>
                            {isApproved ? "Graded & Verified" : "Pending Review"}
                          </span>
                        </div>
                      </div>
                      <span style={{ fontSize: "0.85rem", color: isApproved ? "#16a34a" : "var(--text-muted, #64748b)", fontWeight: 800, flexShrink: 0 }}>
                        {isApproved ? `${totalSubScore}/300` : "In Queue"}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Daily Scenario Calendar Widget + Live Leaderboard */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          
          {/* Daily Scenario Calendar Widget */}
          <div style={{ background: "var(--bg-surface, #ffffff)", borderRadius: "16px", border: "1px solid var(--border-color, #e2e8f0)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", overflow: "hidden" }}>
            <DailyScenarioCalendar />
          </div>

          {/* Leaderboard Card */}
          <div style={{ flex: 1, background: "var(--bg-surface, #ffffff)", padding: "14px 16px", borderRadius: "16px", border: "1px solid var(--border-color, #e2e8f0)", boxShadow: "0 2px 8px rgba(0,0,0,0.02)", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "0.95rem", color: "var(--text-primary, #0f172a)", fontWeight: 800 }}>Cohort Leaderboard</h3>
                <p style={{ margin: "2px 0 0 0", fontSize: "0.72rem", color: "var(--text-muted, #64748b)" }}>Real-time peer ranking</p>
              </div>
              <span style={{ background: "#eff6ff", color: "#2563eb", padding: "3px 8px", borderRadius: "20px", fontSize: "0.72rem", fontWeight: 700 }}>
                Rank: {userRankStr}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr 1fr", borderBottom: "1px solid var(--border-color, #e2e8f0)", paddingBottom: "6px", marginBottom: "6px", fontSize: "0.68rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>
              <span>Rank</span>
              <span>Name</span>
              <span style={{ textAlign: "right" }}>Points</span>
            </div>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: 1 }}>
              {liveLeaderboard.length === 0 ? (
                <div style={{ padding: "12px", textAlign: "center", color: "var(--text-muted, #64748b)", fontSize: "0.8rem" }}>
                  No cohort rankings available yet.
                </div>
              ) : (
                liveLeaderboard.slice(0, 5).map((user, uIdx) => {
                  const isMe = internUser && (user.user_name === internUser.name || user.user_id === internUser.id);
                  const rNum = user.rank || (uIdx + 1);
                  return (
                    <div key={user.user_id || uIdx} style={{ display: "grid", gridTemplateColumns: "1fr 3fr 1fr", alignItems: "center", padding: "6px 4px", background: isMe ? "#eff6ff" : "transparent", borderRadius: "6px" }}>
                      <span style={{ fontSize: "0.78rem", fontWeight: 800, color: rNum === 1 ? "#d97706" : (rNum === 2 ? "#64748b" : (rNum === 3 ? "#b45309" : "#94a3b8")) }}>
                        #{rNum}
                      </span>
                      <span style={{ fontSize: "0.78rem", fontWeight: isMe ? 700 : 500, color: isMe ? "#1d4ed8" : "var(--text-primary, #0f172a)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {user.user_name || "Intern"} {isMe && "(You)"}
                      </span>
                      <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#2563eb", textAlign: "right" }}>
                        {user.total_points || 0}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default React.memo(InternOverviewTab);

