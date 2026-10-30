import React from "react";
import { Ticket, Clock, CheckCircle, AlertCircle } from "lucide-react";

/**
 * InternTicketsTab Component
 * 
 * Support and ticket assistance center for interns:
 * - Ticket submission form with pre-filled student context
 * - Ticket status filtering (All, Active, Resolved)
 * - Expandable mentor and admin reply threads
 */
const InternTicketsTab = ({
  showTicketForm = false,
  newTicketTitle = "",
  setNewTicketTitle,
  newTicketDesc = "",
  setNewTicketDesc,
  handleCreateTicket,
  ticketFilter = "All",
  setTicketFilter,
  ticketsData = [],
  selectedTicket = null,
  internUser = null,
  internDomain = "Software Engineering",
  navigate
}) => {
  // Ticket Creation Form View
  if (showTicketForm) {
    return (
      <div className="card" style={{ padding: "28px", maxWidth: "800px", margin: "0 auto", borderRadius: "16px", border: "1px solid var(--border-color, #e2e8f0)", background: "#ffffff", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
          <h3 style={{ margin: 0, color: "var(--text-primary, #0f172a)", fontSize: "1.25rem", fontWeight: "800", display: "flex", alignItems: "center", gap: "10px" }}>
            <Ticket size={22} color="#2563eb" /> File a New Support Ticket
          </h3>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate("/intern/tickets")} 
            style={{ padding: "6px 14px", fontSize: "13px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
          >
            Back
          </button>
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Intern Context Metadata */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", backgroundColor: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
            <div>
              <label style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>Intern Name</label>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>{internUser?.name || "Intern User"}</div>
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>Assigned Mentor</label>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>{internUser?.mentor_name || "Dr. Sakthi"}</div>
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>Track Domain</label>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>{internDomain}</div>
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#64748b", fontWeight: 600 }}>College / Institution</label>
              <div style={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>{internUser?.college || "Engineering College"}</div>
            </div>
          </div>

          <div>
            <label style={{ fontSize: "13px", fontWeight: 700, display: "block", marginBottom: "6px", color: "#0f172a" }}>Subject / Short Summary</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g., Environment setup issue, assessment grading question..." 
              value={newTicketTitle}
              onChange={(e) => setNewTicketTitle(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px", boxSizing: "border-box" }} 
            />
          </div>
          
          <div>
            <label style={{ fontSize: "13px", fontWeight: 700, display: "block", marginBottom: "6px", color: "#0f172a" }}>Detailed Problem Description & Error Logs</label>
            <textarea 
              rows="5" 
              placeholder="Explain step-by-step what occurred and any error traces you observed..." 
              value={newTicketDesc}
              onChange={(e) => setNewTicketDesc(e.target.value)}
              style={{ width: "100%", padding: "12px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", outline: "none", fontSize: "14px", fontFamily: "inherit", boxSizing: "border-box" }}
            />
          </div>
          
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "8px" }}>
            <button 
              className="btn btn-secondary" 
              onClick={() => navigate("/intern/tickets")}
              style={{ padding: "10px 18px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary" 
              style={{ padding: "10px 24px", background: "#2563eb", color: "#ffffff", borderRadius: "8px", border: "none", fontWeight: 700, cursor: "pointer" }} 
              onClick={handleCreateTicket}
            >
              Submit Ticket &rarr;
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Filtered tickets
  const filteredTickets = ticketsData.filter(t => {
    if (ticketFilter === "Active") return t.status !== "Resolved";
    if (ticketFilter === "Resolved") return t.status === "Resolved";
    return true;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", width: "100%" }}>
      
      {/* Top Hero Banner */}
      <div className="hero-banner-card" style={{
        borderRadius: "16px",
        padding: "16px 22px",
        position: "relative",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        border: "1px solid #e2e8f0"
      }}>
        <div style={{ position: "relative", zIndex: 2, display: "flex", gap: "14px", alignItems: "center" }}>
          <div style={{ width: "44px", height: "44px", background: "#ffffff", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.15)", flexShrink: 0 }}>
            <Ticket size={22} color="#2563eb" />
          </div>
          <div>
            <span style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", color: "#1d4ed8", display: "block", marginBottom: "2px" }}>
              Student Assistance Center
            </span>
            <h1 style={{ fontSize: "1.35rem", fontWeight: 800, margin: "0 0 2px 0", color: "#0f172a", letterSpacing: "-0.02em" }}>
              Support & Query Hub
            </h1>
            <p style={{ margin: 0, fontSize: "12.5px", color: "#475569", maxWidth: "600px", lineHeight: "1.4" }}>
              Direct access to instructors and system administrators for curriculum queries, grading reviews, or environment blockers.
            </p>
          </div>
        </div>

        <div style={{ position: "relative", zIndex: 2 }}>
          <button 
            className="btn btn-primary" 
            style={{ padding: "9px 18px", fontSize: "13px", fontWeight: "700", borderRadius: "8px", border: "none", background: "#2563eb", color: "#ffffff", cursor: "pointer", boxShadow: "0 2px 6px rgba(37, 99, 235, 0.3)" }} 
            onClick={() => navigate("/intern/tickets/new")}
          >
            + File a Ticket
          </button>
        </div>
      </div>

      {/* Main Tickets Table Container */}
      <div className="card" style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px", border: "1px solid #e2e8f0", borderRadius: "16px", background: "#ffffff" }}>
        
        {/* Header & Filter Tabs */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", borderBottom: "1px solid #e2e8f0", paddingBottom: "14px" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "800", color: "#0f172a" }}>Your Ticket History</h3>
            <span style={{ fontSize: "12px", color: "#64748b" }}>Select any ticket to expand mentor and instructor resolutions.</span>
          </div>

          {/* Filter Pills */}
          <div style={{ display: "flex", gap: "6px", background: "#f1f5f9", padding: "4px", borderRadius: "10px" }}>
            {["All", "Active", "Resolved"].map(tab => (
              <button
                key={tab}
                onClick={() => setTicketFilter(tab)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "8px",
                  fontSize: "12px",
                  fontWeight: "700",
                  border: "none",
                  cursor: "pointer",
                  background: ticketFilter === tab ? "#ffffff" : "transparent",
                  color: ticketFilter === tab ? "#0f172a" : "#64748b",
                  boxShadow: ticketFilter === tab ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.2s ease"
                }}
              >
                {tab} ({tab === "All" ? ticketsData.length : tab === "Active" ? ticketsData.filter(t => t.status !== "Resolved").length : ticketsData.filter(t => t.status === "Resolved").length})
              </button>
            ))}
          </div>
        </div>

        {/* Tickets List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filteredTickets.length === 0 ? (
            <div style={{ textAlign: "center", padding: "36px 20px", color: "#64748b", fontSize: "14px" }}>
              No tickets found in this view. Have a question or facing a blocker? File a new ticket above!
            </div>
          ) : (
            filteredTickets.map(ticket => {
              const isSelected = selectedTicket?.id === ticket.id;
              const isResolved = ticket.status === "Resolved";
              
              return (
                <div 
                  key={ticket.id}
                  onClick={() => navigate(isSelected ? "/intern/tickets" : `/intern/tickets/${ticket.id}`)}
                  style={{ 
                    padding: "16px 20px", 
                    cursor: "pointer", 
                    borderRadius: "12px",
                    border: isSelected ? "2px solid #2563eb" : "1px solid #e2e8f0", 
                    transition: "all 0.2s ease",
                    backgroundColor: isSelected ? "#eff6ff" : "#ffffff"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "11px", color: "#1d4ed8", fontWeight: 700, backgroundColor: "#dbeafe", padding: "3px 8px", borderRadius: "6px" }}>
                        #{ticket.id}
                      </span>
                      <span style={{ fontSize: "14px", color: "#0f172a", fontWeight: "700" }}>
                        {ticket.title}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                      <span style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Clock size={13} /> {ticket.date || "Today"}
                      </span>
                      <span style={{ 
                        backgroundColor: isResolved ? "#dcfce7" : "#fef3c7", 
                        color: isResolved ? "#15803d" : "#b45309",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontWeight: "700",
                        fontSize: "11.5px"
                      }}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>
                  
                  {isSelected && (
                    <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #e2e8f0", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div style={{ fontSize: "11px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        Mentor / Admin Response
                      </div>
                      <div style={{ backgroundColor: "#ffffff", padding: "14px 18px", borderRadius: "10px", borderLeft: "4px solid #2563eb", border: "1px solid #e2e8f0" }}>
                        <p style={{ margin: 0, fontSize: "13.5px", color: "#1e293b", lineHeight: "1.6", whiteSpace: "pre-line" }}>
                          {ticket.adminReply || "Ticket received by the mentor team. An instructor is currently reviewing your error log."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
};

export default React.memo(InternTicketsTab);

