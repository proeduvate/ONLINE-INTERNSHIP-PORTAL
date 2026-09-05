import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import './BreakoutRooms.css';
import WorkspaceSidebar from './WorkspaceSidebar';
import MeetingArea from './MeetingArea';
import MembersPanel from './MembersPanel';
import BreakoutManagerModal from './BreakoutManagerModal';
import { mockInterns, mockMentor, mockRooms } from './MockData';

export default function BreakoutRoomsApp({ onRoomChange, onLeaveMeeting, isIntern = false, onMinimize }) {
  const [rooms, setRooms] = useState(mockRooms);
  // Interns always start in Main Meeting — mentor allocates them to breakout rooms
  const [interns, setInterns] = useState(
    isIntern
      ? mockInterns.map(i => ({ ...i, room: 'Main Meeting' }))
      : mockInterns
  );
  const [activeRoom, setActiveRoom] = useState('main');
  const [rightPanelMode, setRightPanelMode] = useState('members'); // 'members', 'chat', 'closed'
  const [isManagerOpen, setIsManagerOpen] = useState(false);

  // Safe fallback if activeRoom is deleted
  const currentRoomData = rooms.find(r => r.id === activeRoom) || rooms[0] || { id: 'main', name: 'Main Meeting', type: 'main' };
  
  // Mentor joins the currently active room being viewed
  const updatedMentor = { ...mockMentor, room: currentRoomData.name };

  // Combine mentor and interns for easier lookup
  const allParticipants = [updatedMentor, ...interns];

  const currentRoomParticipants = allParticipants.filter(
    p => p.room === currentRoomData.name && p.online
  );

  // Notify parent when active room changes
  const handleSetActiveRoom = (roomId) => {
    setActiveRoom(roomId);
    const room = rooms.find(r => r.id === roomId);
    if (onRoomChange && room) onRoomChange(room.name);
  };

  const handleLeave = () => {
    if (onLeaveMeeting) {
      onLeaveMeeting();
    } else {
      setActiveRoom('main');
    }
  };

  // For interns: follow the room they've been assigned to (simulate mentor moving them)
  const internAssignedRoom = isIntern
    ? rooms.find(r => r.name === (interns.find(i => i.name === 'Tobi')?.room || 'Main Meeting'))?.id || 'main'
    : null;


  // Waiting Room Logic
  const [entryState, setEntryState] = useState(isIntern ? "prompt" : "approved");
  const [inputId, setInputId] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [knocks, setKnocks] = useState([]);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === "room_knock" && e.newValue) {
        const data = JSON.parse(e.newValue);
        if (!isIntern) {
          setKnocks(prev => [...prev, data]);
        }
      }
      if (e.key === "room_knock_response" && e.newValue) {
        const data = JSON.parse(e.newValue);
        if (isIntern && data.internId === inputId) {
          if (data.status === "approved") {
            setEntryState("approved");
          } else {
            setEntryState("denied");
          }
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [isIntern, inputId]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      const res = await api.get(`/api/meetings/verify-intern/${inputId}`);
      if (res.data.status === "success") {
        setEntryState("waiting");
        localStorage.setItem("room_knock", JSON.stringify({ internId: inputId, name: res.data.name, time: Date.now() }));
      }
    } catch (err) {
      setErrorMsg("Invalid Intern ID or not found in database.");
    }
  };

  const handleApprove = (k) => {
    setKnocks(prev => prev.filter(x => x.internId !== k.internId));
    localStorage.setItem("room_knock_response", JSON.stringify({ internId: k.internId, status: "approved", time: Date.now() }));
  };
  
  const handleDeny = (k) => {
    setKnocks(prev => prev.filter(x => x.internId !== k.internId));
    localStorage.setItem("room_knock_response", JSON.stringify({ internId: k.internId, status: "denied", time: Date.now() }));
  };

  return (
    <div className="br-app-container">

      {entryState === "prompt" && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.8)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "white", padding: "32px", borderRadius: "8px", width: "400px", textAlign: "center" }}>
            <h2>Enter Breakout Room</h2>
            <p style={{ color: "#666", marginBottom: "20px" }}>Please verify your identity to join.</p>
            <form onSubmit={handleVerify}>
              <input 
                type="text" 
                placeholder="Intern ID (e.g. 2)" 
                value={inputId} 
                onChange={e => setInputId(e.target.value)}
                style={{ width: "100%", padding: "12px", borderRadius: "4px", border: "1px solid #ccc", marginBottom: "12px" }}
              />
              {errorMsg && <p style={{ color: "red", fontSize: "14px", marginTop: 0 }}>{errorMsg}</p>}
              <button type="submit" style={{ width: "100%", padding: "12px", backgroundColor: "var(--primary-dark)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>Request Entry</button>
            </form>
          </div>
        </div>
      )}

      {entryState === "waiting" && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.8)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "white", padding: "32px", borderRadius: "8px", width: "400px", textAlign: "center" }}>
            <h2>Waiting Room</h2>
            <p style={{ color: "#666", marginTop: "16px" }}>You are in the waiting room. Please wait for the mentor to let you in.</p>
            <div style={{ marginTop: "24px", display: "inline-block", width: "40px", height: "40px", border: "4px solid #f3f3f3", borderTop: "4px solid var(--primary-dark)", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <style>
              {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
            </style>
          </div>
        </div>
      )}

      {entryState === "denied" && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.8)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "white", padding: "32px", borderRadius: "8px", width: "400px", textAlign: "center" }}>
            <h2 style={{ color: "var(--danger-color)" }}>Entry Denied</h2>
            <p style={{ color: "#666", marginBottom: "20px" }}>The mentor has declined your request to join this session.</p>
            <button onClick={onLeaveMeeting} style={{ padding: "10px 24px", backgroundColor: "#e2e8f0", border: "none", borderRadius: "4px", cursor: "pointer" }}>Go Back</button>
          </div>
        </div>
      )}

      {!isIntern && knocks.length > 0 && (
        <div style={{ position: "absolute", top: "20px", left: "50%", transform: "translateX(-50%)", zIndex: 9999, display: "flex", flexDirection: "column", gap: "10px" }}>
          {knocks.map((k, i) => (
            <div key={i} style={{ background: "white", padding: "16px 24px", borderRadius: "8px", boxShadow: "0 4px 12px rgba(0,0,0,0.15)", display: "flex", alignItems: "center", gap: "20px", borderLeft: "4px solid var(--primary-dark)" }}>
              <div>
                <p style={{ margin: 0, fontWeight: "bold" }}>Waiting Room Request</p>
                <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>{k.name} (ID: {k.internId}) wants to join.</p>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => handleApprove(k)} style={{ padding: "6px 12px", backgroundColor: "var(--success-color)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Admit</button>
                <button onClick={() => handleDeny(k)} style={{ padding: "6px 12px", backgroundColor: "var(--danger-color)", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>Deny</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <WorkspaceSidebar 
        rooms={rooms}
        activeRoom={activeRoom}
        setActiveRoom={handleSetActiveRoom}
        participants={allParticipants}
        isIntern={isIntern}
      />
      {entryState === 'approved' && (
        <MeetingArea 
        room={currentRoomData}
        participants={currentRoomParticipants}
        rightPanelMode={rightPanelMode}
        setRightPanelMode={setRightPanelMode}
        onLeave={handleLeave}
        openManager={() => setIsManagerOpen(true)}
        isIntern={isIntern}
        onMinimize={onMinimize}
      />
      )}
      {rightPanelMode !== 'closed' && (
        <MembersPanel 
          mode={rightPanelMode}
          onClose={() => setRightPanelMode('closed')}
          interns={interns}
          mentor={updatedMentor}
          isIntern={isIntern}
        />
      )}

      {isManagerOpen && (
        <BreakoutManagerModal 
          onClose={() => setIsManagerOpen(false)}
          rooms={rooms}
          setRooms={setRooms}
          interns={interns}
          setInterns={setInterns}
          activeRoom={activeRoom}
          setActiveRoom={setActiveRoom}
        />
      )}
    </div>
  );
}
