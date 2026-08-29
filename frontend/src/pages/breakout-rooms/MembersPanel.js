import React, { useState, useRef, useEffect } from 'react';
import { Search, Send, Smile, Paperclip, X } from 'lucide-react';
import { mockChatMessages, mockInterns, mockMentor } from './MockData';

export default function MembersPanel({ mode, onClose, interns = mockInterns, mentor = mockMentor }) {
  const [messages, setMessages] = useState(mockChatMessages);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (mode === 'chat') {
      scrollToBottom();
    }
  }, [messages, mode]);

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

  if (mode === 'chat') {
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
          <div key={intern.id} className="br-member-item">
            <div className="br-avatar-small" style={{ position: 'relative' }}>
              {intern.avatar}
              <div className={`br-status-dot ${intern.online ? 'online' : 'idle'}`}></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#313338' }}>{intern.name}</span>
              <span style={{ fontSize: '11px', color: '#5c5e66' }}>{intern.room}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


