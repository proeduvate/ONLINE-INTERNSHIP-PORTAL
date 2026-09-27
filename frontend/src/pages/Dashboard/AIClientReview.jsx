import React, { useState, useRef, useEffect } from 'react';
import { Bot, Code, Send, User, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import WebIDE from '../../components/WebIDE/WebIDE';

export default function AIClientReview() {
  const [implementationCode, setImplementationCode] = useState(
`import React, { useEffect, useState } from "react";

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tasks")
      .then(res => res.json())
      .then(data => {
        setTasks(data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      {loading ? "Loading..." : JSON.stringify(tasks)}
    </div>
  );
}`
  );
  
  const techUsed = "React, Tailwind CSS, JavaScript, REST API";
  const previousFeedback = "Refactor the component structure to use reusable UI pieces, add error handling for the API fetch, include missing internship details, and upgrade the styling for better responsiveness and user experience.";
  const clientTask = "Build a responsive internship dashboard using React and Tailwind CSS. The dashboard should display internship information, assigned tasks, task status, and completion progress. It should retrieve data from an API, allow task status updates, handle loading and errors, and use reusable components.";

  const [chatHistory, setChatHistory] = useState([
    { 
      role: "ai", 
      content: "Hello! I am your AI Mentor/Client for this task. Let me know if you need clarifications on the requirements, or submit your code when you're ready for a review." 
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);
  const [isContextExpanded, setIsContextExpanded] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const handleSendMessage = () => {
    if (!chatInput.trim() && !implementationCode.trim()) return;

    const userMessageContent = chatInput.trim() || "Please review my current implementation.";

    setChatHistory(prev => [...prev, {
      role: "user",
      content: userMessageContent
    }]);
    
    setChatInput("");
    setIsReviewing(true);
    
    // Simulate AI thinking and returning feedback
    setTimeout(() => {
      setIsReviewing(false);
      setChatHistory(prev => [...prev, {
        role: "ai",
        status: "Changes Requested",
        score: 65,
        content: "I've reviewed your latest implementation against our requirements. We still have some significant gaps before this is ready for production.",
        issues: [
          "The UI is completely barebones. Where are the reusable components mentioned in the requirements?",
          "Loading state is just a text string. The client expects a proper skeleton loader or spinner.",
          "Error handling logs to console instead of showing a user-friendly error message on the screen.",
          "Styling is missing entirely. Use Tailwind classes as requested to make it responsive."
        ]
      }]);
    }, 2500);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "Inter, sans-serif" }}>
      
      {/* Header section (Extremely compact) */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Bot size={20} color="#2563eb" />
          <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--text-primary, #0f172a)", margin: 0 }}>AI Client Review</h2>
        </div>
        <p style={{ margin: 0, color: "var(--text-muted, #64748b)", fontSize: "0.8rem" }}>
          Interact with your AI Mentor to get real-time code feedback.
        </p>
      </div>

      {/* Main Workspace */}
      <div style={{ display: "grid", gridTemplateColumns: "2.5fr 1fr", gap: "16px", flex: 1, minHeight: 0 }}>
        
        {/* Left Side: Context + IDE */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", minHeight: 0 }}>
          
          {/* Ultra-compact Context Panel */}
          <div style={{ background: "var(--bg-surface, #ffffff)", borderRadius: "8px", border: "1px solid var(--border-color, #e2e8f0)", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
            <div 
              style={{ padding: "8px 12px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", background: "var(--bg-surface-elevated, #f8fafc)", borderRadius: isContextExpanded ? "8px 8px 0 0" : "8px" }}
              onClick={() => setIsContextExpanded(!isContextExpanded)}
            >
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#475569" }}>Client Requirements & Context</span>
              {isContextExpanded ? <ChevronUp size={14} color="#64748b" /> : <ChevronDown size={14} color="#64748b" />}
            </div>
            
            {isContextExpanded && (
              <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", gap: "12px" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.8rem", color: "#0f172a", width: "70px", flexShrink: 0 }}>Task:</span>
                  <span style={{ fontSize: "0.8rem", color: "#334155", lineHeight: "1.4" }}>{clientTask}</span>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.8rem", color: "#0f172a", width: "70px", flexShrink: 0 }}>Tech:</span>
                  <span style={{ fontSize: "0.8rem", color: "#334155" }}>{techUsed}</span>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.8rem", color: "#0f172a", width: "70px", flexShrink: 0 }}>Feedback:</span>
                  <span style={{ fontSize: "0.8rem", color: "#334155", fontStyle: "italic" }}>"{previousFeedback}"</span>
                </div>
              </div>
            )}
          </div>

          {/* IDE Container */}
          <div style={{ background: "var(--bg-surface, #ffffff)", borderRadius: "8px", border: "1px solid var(--border-color, #e2e8f0)", overflow: "hidden", display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
            <div style={{ padding: "8px 12px", background: "var(--bg-surface-elevated, #f8fafc)", borderBottom: "1px solid var(--border-color, #e2e8f0)", display: "flex", alignItems: "center", gap: "6px" }}>
              <Code size={14} color="#475569" />
              <h3 style={{ margin: 0, fontSize: "0.8rem", fontWeight: 700, color: "var(--text-primary, #0f172a)" }}>Implementation</h3>
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <WebIDE language="javascript" onChange={(files) => setImplementationCode(files?.[0]?.content || "")} />
            </div>
          </div>
        </div>

        {/* Right Side: Chatbox */}
        <div style={{ background: "var(--bg-surface, #ffffff)", borderRadius: "8px", border: "1px solid var(--border-color, #e2e8f0)", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
          <div style={{ padding: "10px 16px", background: "linear-gradient(135deg, #1d4ed8, #2563eb)", color: "white", display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
            <Bot size={16} color="white" />
            <h3 style={{ margin: 0, fontSize: "0.9rem", fontWeight: 700, color: "white" }}>Mentor Chat</h3>
          </div>
          
          {/* Messages Area */}
          <div style={{ flex: 1, padding: "16px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px", backgroundColor: "#f8fafc" }}>
            {chatHistory.map((msg, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{ 
                  display: "flex", 
                  alignItems: "flex-end", 
                  gap: "8px", 
                  maxWidth: "92%",
                  flexDirection: msg.role === "user" ? "row-reverse" : "row" 
                }}>
                  
                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: msg.role === "user" ? "#dbeafe" : "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {msg.role === "user" ? <User size={14} color="#1d4ed8" /> : <Bot size={14} color="#4338ca" />}
                  </div>

                  <div style={{ 
                    background: msg.role === "user" ? "#2563eb" : "white", 
                    color: msg.role === "user" ? "white" : "#334155",
                    padding: "10px 14px", 
                    borderRadius: msg.role === "user" ? "14px 14px 0 14px" : "14px 14px 14px 0",
                    border: msg.role === "user" ? "none" : "1px solid #e2e8f0",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
                  }}>
                    <p style={{ margin: 0, fontSize: "0.85rem", lineHeight: "1.5", color: "inherit" }}>{msg.content}</p>
                    
                    {/* Rich AI Feedback Content */}
                    {msg.issues && (
                      <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px solid #e2e8f0" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                          <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#dc2626", display: "flex", alignItems: "center", gap: "4px" }}>
                            <AlertTriangle size={12} /> {msg.status}
                          </span>
                          <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#4f46e5" }}>
                            Score: {msg.score}/100
                          </span>
                        </div>
                        <ul style={{ margin: 0, paddingLeft: "16px", color: "#64748b", fontSize: "0.8rem", display: "flex", flexDirection: "column", gap: "6px" }}>
                          {msg.issues.map((issue, idx) => (
                            <li key={idx}>{issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isReviewing && (
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Bot size={14} color="#4338ca" />
                </div>
                <div style={{ background: "white", padding: "10px 14px", borderRadius: "14px 14px 14px 0", border: "1px solid #e2e8f0" }}>
                  <span style={{ fontSize: "0.85rem", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                    <div className="dot-typing"></div> Reviewing...
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: "12px", borderTop: "1px solid var(--border-color, #e2e8f0)", background: "white", flexShrink: 0 }}>
            <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
              <input 
                type="text" 
                placeholder="Ask a question..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                disabled={isReviewing}
                style={{ flex: 1, padding: "10px 14px", borderRadius: "16px", border: "1px solid #cbd5e1", fontSize: "0.85rem", outline: "none", backgroundColor: isReviewing ? "#f1f5f9" : "white" }}
              />
              <button 
                onClick={handleSendMessage}
                disabled={isReviewing || (!chatInput.trim() && !implementationCode.trim())}
                style={{ 
                  background: isReviewing ? "#94a3b8" : "#2563eb", 
                  color: "white", 
                  border: "none", 
                  width: "38px", 
                  height: "38px", 
                  borderRadius: "50%", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  cursor: isReviewing ? "not-allowed" : "pointer",
                  transition: "background 0.2s"
                }}
              >
                <Send size={16} />
              </button>
            </div>
            <div style={{ display: "flex", justifyContent: "center" }}>
               <button 
                onClick={() => { setChatInput("Please review my current code."); handleSendMessage(); }}
                disabled={isReviewing}
                style={{ background: "none", border: "1px solid #2563eb", color: "#2563eb", padding: "4px 12px", borderRadius: "12px", fontSize: "0.75rem", fontWeight: 600, cursor: isReviewing ? "not-allowed" : "pointer", transition: "all 0.2s" }}
              >
                Quick Submit: Review Code
              </button>
            </div>
          </div>
        </div>

      </div>

      <style>{`
        .dot-typing {
          position: relative;
          width: 4px;
          height: 4px;
          border-radius: 5px;
          background-color: #64748b;
          color: #64748b;
          animation: dotTyping 1.5s infinite linear;
          margin-right: 12px;
          margin-left: 6px;
        }
        @keyframes dotTyping {
          0% { box-shadow: -8px 0 0 0 #64748b, 0 0 0 0 #64748b, 8px 0 0 0 #64748b; }
          33% { box-shadow: -8px 0 0 0 #cbd5e1, 0 0 0 0 #64748b, 8px 0 0 0 #64748b; }
          66% { box-shadow: -8px 0 0 0 #64748b, 0 0 0 0 #cbd5e1, 8px 0 0 0 #64748b; }
          100% { box-shadow: -8px 0 0 0 #64748b, 0 0 0 0 #64748b, 8px 0 0 0 #cbd5e1; }
        }
      `}</style>
    </div>
  );
}
