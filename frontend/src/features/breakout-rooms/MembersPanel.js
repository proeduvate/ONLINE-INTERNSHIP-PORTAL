import React, { useState, useRef, useEffect } from 'react';
import { Search, Send, Smile, Paperclip, X, ArrowLeft, UserX } from 'lucide-react';
import { mockChatMessages, mockInterns, mockMentor } from './MockData';

export default function MembersPanel({ mode, onClose, interns = mockInterns, mentor = mockMentor, onKickIntern }) {
  const [messages, setMessages] = useState(mockChatMessages);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for Direct Messaging
  const [activeDm, setActiveDm] = useState(null);
  const [dmMessages, setDmMessages] = useState({});
  const [dmInputText, setDmInputText] = useState('');
  
  const messagesEndRef = useRef(null);
  const dmEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const scrollToDmBottom = () => {
    dmEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (mode === 'chat' && !activeDm) {
      scrollToBottom();
    } else if (activeDm) {
      scrollToDmBottom();
    }
  }, [messages, dmMessages, mode, activeDm]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      author: 'You',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: inputText
    };
    
    setMessages([...messages, newMessage]);
    setInputText('');
  };

  const handleSendDmMessage = (e) => {
    e.preventDefault();
    if (!dmInputText.trim() || !activeDm) return;
    
    const newMessage = {
      id: Date.now(),
      author: 'You',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: dmInputText
    };
    
    const currentDms = dmMessages[activeDm.id] || [];
    setDmMessages({
      ...dmMessages,
      [activeDm.id]: [...currentDms, newMessage]
    });
    setDmInputText('');
  };

  // If we are in global chat mode and not in a DM
  if (mode === 'chat' && !activeDm) {
    return (
      <div className="br-right-sidebar">
        <div className="br-right-header">
          <span># meeting-chat</span>
          <button className="br-icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="br-chat-panel">
          <div className="br-chat-messages">
            {messages.map(msg => (
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
            <form className="br-chat-input" onSubmit={handleSendMessage}>
              <input 
                type="text" 
                placeholder="Type a message..." 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <Smile size={20} color="#80848e" style={{cursor: 'pointer'}} />
            </form>
          </div>
        </div>
      </div>
    );
  }

  // If a DM is active, show the direct message chat panel
  if (activeDm) {
    const currentDms = dmMessages[activeDm.id] || [];
    
    return (
      <div className="br-right-sidebar">
        <div className="br-right-header" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button className="br-icon-btn" onClick={() => setActiveDm(null)}><ArrowLeft size={18} /></button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div className="br-avatar-small" style={{ width: '20px', height: '20px', fontSize: '10px' }}>{activeDm.avatar}</div>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>{activeDm.name} (DM)</span>
            </div>
          </div>
          <button className="br-icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="br-chat-panel">
          <div className="br-chat-messages">
            <div style={{ textAlign: 'center', color: '#80848e', fontSize: '12px', margin: '10px 0' }}>
              This is the beginning of your direct message history with {activeDm.name}.
            </div>
            {currentDms.map(msg => (
              <div key={msg.id} className="br-chat-message">
                <div className="br-avatar-small">{msg.author === 'You' ? mentor.avatar : activeDm.avatar}</div>
                <div className="br-chat-message-content">
                  <div className="br-chat-message-header">
                    <span className="br-chat-author">{msg.author === 'You' ? mentor.name : activeDm.name}</span>
                    <span className="br-chat-time">{msg.time}</span>
                  </div>
                  <div className="br-chat-text">{msg.text}</div>
                </div>
              </div>
            ))}
            <div ref={dmEndRef} />
          </div>
          <div className="br-chat-input-wrapper">
            <form className="br-chat-input" onSubmit={handleSendDmMessage}>
              <input 
                type="text" 
                placeholder={`Message ${activeDm.name}...`} 
                value={dmInputText}
                onChange={(e) => setDmInputText(e.target.value)}
              />
              <Smile size={20} color="#80848e" style={{cursor: 'pointer'}} />
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Default Members Panel
  const filteredInterns = interns.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.room.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const allMembers = [mentor, ...interns];

  return (
    <div className="br-right-sidebar">
      <div className="br-right-header">
        <span>MEMBERS — {allMembers.length}</span>
        <button className="br-icon-btn" onClick={onClose}><X size={18} /></button>
      </div>
      <div style={{ padding: '16px 16px 0' }}>
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
        <div className="br-section-title">MENTOR — 1</div>
        <div className="br-member-item">
          <div className="br-avatar-small" style={{ position: 'relative' }}>
            {mentor.avatar}
            <div className={`br-status-dot ${mentor.online ? 'online' : 'idle'}`}></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '14px', fontWeight: '500', color: '#313338' }}>{mentor.name}</span>
            <span style={{ fontSize: '11px', color: '#5c5e66' }}>{mentor.room || 'Mentor'}</span>
          </div>
        </div>

        <div className="br-section-title">INTERNS — {filteredInterns.length}</div>
        {filteredInterns.map(intern => (
          <div 
            key={intern.id} 
            className="br-member-item" 
            onClick={() => setActiveDm(intern)}
            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            title="Click to send a Direct Message"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div className="br-avatar-small" style={{ position: 'relative' }}>
                {intern.avatar}
                <div className={`br-status-dot ${intern.online ? 'online' : 'idle'}`}></div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#313338' }}>{intern.name}</span>
                <span style={{ fontSize: '11px', color: '#5c5e66' }}>{intern.room}</span>
              </div>
            </div>
            
            {/* Kick Button */}
            {onKickIntern && intern.id !== 'intern-you' && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onKickIntern(intern.id);
                }}
                className="br-icon-btn"
                style={{ color: '#da373c', opacity: 0.7, padding: '4px' }}
                title={`Kick ${intern.name} from meeting`}
              >
                <UserX size={16} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
