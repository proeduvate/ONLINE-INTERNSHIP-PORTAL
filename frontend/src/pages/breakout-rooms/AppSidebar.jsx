import React from 'react';
import { Home, Code, GraduationCap, Plus, Settings } from 'lucide-react';

export default function AppSidebar({ activeWorkspace, setActiveWorkspace }) {
  const workspaces = [
    { id: 'home', icon: <Home size={24} />, name: 'Home' },
    { id: 'web', icon: <Code size={24} />, name: 'Web Development' },
    { id: 'ai', icon: <GraduationCap size={24} />, name: 'AI Internship' },
  ];

  return (
    <div className="br-app-sidebar">
      {workspaces.map(ws => (
        <div 
          key={ws.id} 
          className={`br-app-icon ${activeWorkspace === ws.id ? 'active' : ''}`}
          onClick={() => setActiveWorkspace(ws.id)}
          title={ws.name}
        >
          {ws.icon}
        </div>
      ))}
      <div className="br-app-icon-divider"></div>
      <div className="br-app-icon" title="Add Workspace">
        <Plus size={24} />
      </div>
      <div className="br-app-icon-divider" style={{ marginTop: 'auto', marginBottom: '8px' }}></div>
      <div className="br-app-icon" title="Settings" style={{ marginBottom: '12px' }}>
        <Settings size={24} />
      </div>
    </div>
  );
}
