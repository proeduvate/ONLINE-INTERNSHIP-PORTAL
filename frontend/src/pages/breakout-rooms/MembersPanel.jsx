import React, { useState, useRef, useEffect } from 'react';
import { Search, Send, X, ArrowLeft, UserX, MessageSquare } from 'lucide-react';
import { mockChatMessages, mockInterns, mockMentor } from './MockData';

export default function MembersPanel({ mode, onClose, interns: propInterns = mockInterns, mentor = mockMentor, isIntern = false }) {
  const [interns, setInterns] = useState(propInterns);

  // Group chat state
  const [groupMessages, setGroupMessages] = useState(mockChatMessages);
  const [groupInput, setGroupInput] = useState('');

  // Private DM state
  const [dmTarget, setDmTarget] = useState(null);        // intern object or null
  const [dmChats, setDmChats] = useState({});            // { internId: [messages] }
  const [dmInput, setDmInput] = useState('');

  // Members search
  const [searchTerm, setSearchTerm] = useState('');

  // Kick confirm
  const [kickTarget, setKickTarget] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [groupMessages, dmTarget, dmChats]);

  // ── Group chat send ──
  const handleGroupSend = (e) => {
    e.preventDefault();
    if (!groupInput.trim()) return;
    setGroupMessages(prev => [...prev, {
      id: Date.now(),
      author: 'You',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: groupInput.trim()
    }]);
    setGroupInput('');
  };

  // ── DM send ──
  const handleDmSend = (e) => {
    e.preventDefault();
    if (!dmInput.trim() || !dmTarget) return;
    setDmChats(prev => ({
      ...prev,
      [dmTarget.id]: [...(prev[dmTarget.id] || []), {
        id: Date.now(),
        author: 'You',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: dmInput.trim()
      }]
    }));
    setDmInput('');
  };

  // ── Kick intern ──
  const handleKick = (internId) => {
    setInterns(prev => prev.filter(i => i.id !== internId));
    setKickTarget(null);
    if (dmTarget?.id === internId) setDmTarget(null);
  };

  // ── Group chat panel ──
  if (mode === 'chat' && !dmTarget) {
    return (
      <div className="br-right-sidebar">
        <div className="br-right-header">
          <span># meeting-chat</span>
          <button className="br-icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="br-chat-panel">
          <div className="br-chat-messages">
            {groupMessages.map(msg => (
              <div key={msg.id} className="br-chat-message">
                <div className="br-avatar-small">{msg.author.charAt(0)}</div>
                <div className="br-chat-message-content">
                  <div className="br-chat-message-header">
                    <span className="br-chat-author">{msg.author}</span>
                    <span className="br-chat-time">{msg.time}</span>
                  </div>
                  <div className="br-chat-text">{msg.text}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="br-chat-input-wrapper">
            <form className="br-chat-input" onSubmit={handleGroupSend}>
              <input
                type="text"
                placeholder="Type a message..."
                value={groupInput}
                onChange={(e) => setGroupInput(e.target.value)}
              />
              <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Send size={18} color="#5865f2" />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── Private DM panel ──
  if (dmTarget) {
    const dmMessages = dmChats[dmTarget.id] || [];
    return (
      <div className="br-right-sidebar">
        <div className="br-right-header">
          <button
            className="br-icon-btn"
            onClick={() => setDmTarget(null)}
            title="Back to members"
            style={{ marginRight: '6px' }}
          >
            <ArrowLeft size={18} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            <div className="br-avatar-small" style={{ width: '24px', height: '24px', fontSize: '11px' }}>
              {dmTarget.avatar}
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#313338' }}>{dmTarget.name}</div>
              <div style={{ fontSize: '10px', color: '#5c5e66' }}>Private message</div>
            </div>
          </div>
          <button className="br-icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="br-chat-panel">
          <div className="br-chat-messages">
            {dmMessages.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#80848e', fontSize: '13px', marginTop: '40px' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>💬</div>
                Start a private conversation with <b>{dmTarget.name}</b>
              </div>
            ) : dmMessages.map(msg => (
              <div key={msg.id} className="br-chat-message">
                <div className="br-avatar-small">{msg.author.charAt(0)}</div>
                <div className="br-chat-message-content">
                  <div className="br-chat-message-header">
                    <span className="br-chat-author">{msg.author}</span>
                    <span className="br-chat-time">{msg.time}</span>
                  </div>
                  <div className="br-chat-text">{msg.text}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="br-chat-input-wrapper">
            <form className="br-chat-input" onSubmit={handleDmSend}>
              <input
                type="text"
                placeholder={`Message ${dmTarget.name}...`}
                value={dmInput}
                onChange={(e) => setDmInput(e.target.value)}
                autoFocus
              />
              <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                <Send size={18} color="#5865f2" />
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── Members list panel ──
  const filteredInterns = interns.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.room.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const allMembers = [mentor, ...interns];

  return (
    <div className="br-right-sidebar">
      {/* Kick confirmation overlay */}
      {kickTarget && (
        <div style={{
          position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, borderRadius: '0 0 8px 8px'
        }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: '12px', padding: '24px',
            width: '260px', textAlign: 'center', boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚠️</div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: '#313338', marginBottom: '6px' }}>
              Kick {kickTarget.name}?
            </div>
            <div style={{ fontSize: '12px', color: '#5c5e66', marginBottom: '20px' }}>
              This will remove them from the meeting.
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setKickTarget(null)}
                style={{ flex: 1, padding: '8px', border: '1px solid #d1d5db', borderRadius: '8px', backgroundColor: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
              >Cancel</button>
              <button
                onClick={() => handleKick(kickTarget.id)}
                style={{ flex: 1, padding: '8px', border: 'none', borderRadius: '8px', backgroundColor: '#da373c', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 600 }}
              >Kick</button>
            </div>
          </div>
        </div>
      )}

      <div className="br-right-header">
        <span>MEMBERS — {allMembers.length}</span>
        <button className="br-icon-btn" onClick={onClose}><X size={18} /></button>
      </div>

      <div style={{ padding: '12px 16px 0' }}>
        <div className="br-chat-input" style={{ padding: '8px' }}>
          <Search size={16} color="#80848e" />
          <input
            type="text"
            placeholder="Search members"
            style={{ fontSize: '13px' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="br-member-list">
        {/* ── Mentor ── */}
        <div className="br-section-title">MENTOR — 1</div>
        <div className="br-member-item">
          <div className="br-avatar-small" style={{ position: 'relative' }}>
            {mentor.avatar}
            <div className={`br-status-dot ${mentor.online ? 'online' : 'idle'}`} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#313338' }}>{mentor.name}</span>
            <span style={{ fontSize: '11px', color: '#5c5e66' }}>{mentor.room || 'Mentor'}</span>
          </div>
        </div>

        {/* ── Interns ── */}
        <div className="br-section-title">INTERNS — {filteredInterns.length}</div>
        {filteredInterns.map(intern => (
          <div
            key={intern.id}
            className="br-member-item"
            style={{ cursor: 'pointer', position: 'relative' }}
            title="Click to private message"
          >
            {/* Avatar + name — clicking opens DM */}
            <div
              style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}
              onClick={() => setDmTarget(intern)}
            >
              <div className="br-avatar-small" style={{ position: 'relative' }}>
                {intern.avatar}
                <div className={`br-status-dot ${intern.online ? 'online' : 'idle'}`} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#313338' }}>{intern.name}</span>
                <span style={{ fontSize: '11px', color: '#5c5e66' }}>{intern.room}</span>
              </div>
            </div>

            {/* Action buttons — only shown on hover via CSS group, shown inline here */}
            {!isIntern && (
              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                <button
                  title={`Message ${intern.name}`}
                  onClick={(e) => { e.stopPropagation(); setDmTarget(intern); }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '4px 6px', borderRadius: '6px', color: '#5865f2',
                    display: 'flex', alignItems: 'center',
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ededf0'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <MessageSquare size={15} />
                </button>
                <button
                  title={`Kick ${intern.name}`}
                  onClick={(e) => { e.stopPropagation(); setKickTarget(intern); }}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    padding: '4px 6px', borderRadius: '6px', color: '#da373c',
                    display: 'flex', alignItems: 'center',
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fde8e8'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <UserX size={15} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
