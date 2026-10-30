import React, { useState, useEffect } from "react";
import { CheckCheck } from "lucide-react";
import api from "../../api/axios";

export default function MentorChatTab({ mentorInfo, internUser, internDomain, isActive = true }) {
  const [chatMessages, setChatMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState("");

  const fetchChatMessages = async (targetMentorId) => {
    const mId = targetMentorId || mentorInfo?.id || 2;
    try {
      const res = await api.get(`/api/v1/messages?contact_id=${mId}`);
      if (Array.isArray(res.data)) {
        const formatted = res.data.map(m => ({
          id: m.id,
          sender: m.sender_id === internUser?.id ? "You" : (mentorInfo?.name || "Mentor"),
          text: m.content,
          time: m.sent_at ? new Date(m.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Just now"
        }));
        setChatMessages(formatted);
      }
    } catch (err) {
      console.warn("Failed to fetch messages from API:", err);
    }
  };

  useEffect(() => {
    let interval;
    if (isActive) {
      fetchChatMessages();
      interval = setInterval(() => {
        fetchChatMessages();
      }, 3500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive, mentorInfo?.id, internUser?.id]);

  const handleSendMessage = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!inputMsg.trim()) return;
    const textToSend = inputMsg.trim();
    setInputMsg("");

    const targetMentorId = mentorInfo?.id || 2;
    // Optimistic UI update
    const optimisticMsg = {
      sender: "You",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatMessages(prev => [...prev, optimisticMsg]);

    try {
      await api.post('/api/v1/messages', {
        receiver_id: targetMentorId,
        content: textToSend
      });
      fetchChatMessages(targetMentorId);
    } catch (err) {
      console.error("Failed to post message to backend:", err);
    }
  };

  const getBackgroundImage = () => {
    const domain = (internDomain || "").toLowerCase();
    if (domain.includes("ui/ux") || domain.includes("design")) return "url('/images/chat_bg_uiux.png')";
    if (domain.includes("data") || domain.includes("ai") || domain.includes("machine learning")) return "url('/images/chat_bg_data.png')";
    return "url('/images/chat_bg_code.png')";
  };

  const mentorName = mentorInfo?.name || "Dr. Sakthi";
  const initials = mentorName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="card" style={{ margin: 0, padding: 0, flex: 1, height: "100%", minHeight: "650px", display: "flex", flexDirection: "column", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
      {/* Professional Chat Header */}
      <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", backgroundColor: "var(--bg-surface-elevated, #0f172a)", borderBottom: "1px solid var(--border-color)", borderRadius: "12px 12px 0 0" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", backgroundColor: "var(--brand-primary, #2563eb)", color: "#ffffff", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "16px", fontWeight: "bold", marginRight: "16px" }}>
          {initials}
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: "16px", color: "var(--text-primary, #ffffff)", fontWeight: 600 }}>{mentorName}</h3>
          <p style={{ margin: 0, fontSize: "12px", color: "var(--text-secondary, #94a3b8)" }}>Mentor • Online</p>
        </div>
      </div>

      {/* Chat Body */}
      <div style={{ flex: 1, backgroundColor: "var(--card-bg)", padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px", position: "relative" }}>
        {/* Generative Background Image Overlay */}
        <div style={{ 
          position: "absolute", top: 0, left: 0, right: 0, bottom: 0, 
          pointerEvents: "none", zIndex: 1, opacity: 0.6,
          backgroundImage: getBackgroundImage(),
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}></div>

        {chatMessages.map((msg, i) => (
          <div key={i} style={{ alignSelf: msg.sender === "You" ? "flex-end" : "flex-start", maxWidth: "70%", position: "relative", marginBottom: "8px", zIndex: 2 }}>
            <div style={{ 
              backgroundColor: msg.sender === "You" ? "var(--brand-primary, #1d4ed8)" : "var(--bg-surface-elevated, #ffffff)", 
              color: msg.sender === "You" ? "#ffffff" : "var(--text-primary, #0f172a)", 
              padding: "10px 14px 22px 14px", 
              borderRadius: "12px", 
              borderBottomRightRadius: msg.sender === "You" ? "0" : "12px",
              borderBottomLeftRadius: msg.sender !== "You" ? "0" : "12px",
              fontSize: "14px", 
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)", 
              wordBreak: "break-word",
              border: msg.sender !== "You" ? "1px solid var(--border-color)" : "none"
            }}>
              {msg.text}
              <span style={{ fontSize: "10px", color: msg.sender === "You" ? "rgba(255,255,255,0.7)" : "var(--text-muted, #94a3b8)", position: "absolute", bottom: "6px", right: "12px", display: "flex", alignItems: "center", gap: "2px" }}>
                {msg.time} {msg.sender === "You" && <CheckCheck size={12} />}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSendMessage} style={{ display: "flex", alignItems: "center", padding: "16px", backgroundColor: "var(--bg-surface-elevated, #ffffff)", margin: 0, borderTop: "1px solid var(--border-color)", borderRadius: "0 0 12px 12px" }}>
        <input 
          type="text" 
          placeholder="Type your message..." 
          value={inputMsg} 
          onChange={(e) => setInputMsg(e.target.value)} 
          style={{ flex: 1, padding: "12px 20px", borderRadius: "24px", border: "1px solid var(--border-color)", backgroundColor: "var(--bg-surface, #f1f5f9)", fontSize: "14px", outline: "none", color: "var(--text-primary, #0f172a)" }} 
        />
        <button type="submit" style={{ width: "44px", height: "44px", borderRadius: "50%", backgroundColor: "var(--brand-primary, #2563eb)", color: "#ffffff", border: "none", display: "flex", justifyContent: "center", alignItems: "center", marginLeft: "12px", cursor: "pointer", transition: "all 0.2s" }}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"></path>
          </svg>
        </button>
      </form>
    </div>
  );
}
