import React, { useState } from 'react';
import './BreakoutRooms.css';
import WorkspaceSidebar from './WorkspaceSidebar';
import MeetingArea from './MeetingArea';
import MembersPanel from './MembersPanel';
import BreakoutManagerModal from './BreakoutManagerModal';
import { mockInterns, mockMentor, mockRooms } from './MockData';

export default function BreakoutRoomsApp({ isIntern = false, onLeaveMeeting, onMinimize, onRoomChange }) {
  const [rooms, setRooms] = useState(() => {
    const saved = localStorage.getItem('br_mock_rooms');
    return saved ? JSON.parse(saved) : mockRooms;
  });
  const [interns, setInterns] = useState(() => {
    const saved = localStorage.getItem('br_mock_interns');
    return saved ? JSON.parse(saved) : mockInterns;
  });
  const [activeRoom, setActiveRoom] = useState('main');
  const [rightPanelMode, setRightPanelMode] = useState('members');
  const [isManagerOpen, setIsManagerOpen] = useState(false);

  // Sync to localStorage
  React.useEffect(() => {
    localStorage.setItem('br_mock_rooms', JSON.stringify(rooms));
  }, [rooms]);

  React.useEffect(() => {
    localStorage.setItem('br_mock_interns', JSON.stringify(interns));
  }, [interns]);

  // Listen for changes from other tabs
  React.useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'br_mock_rooms' && e.newValue) setRooms(JSON.parse(e.newValue));
      if (e.key === 'br_mock_interns' && e.newValue) setInterns(JSON.parse(e.newValue));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Intern Auto-Routing Workflow
  React.useEffect(() => {
    if (isIntern) {
      const myIntern = interns.find(i => i.name.includes('(You)'));
      if (myIntern) {
        const targetRoomId = rooms.find(r => r.name === myIntern.room)?.id;
        if (targetRoomId && targetRoomId !== activeRoom) {
          setActiveRoom(targetRoomId);
        }
      }
    }
  }, [interns, rooms, isIntern, activeRoom]);

  // Safe fallback if activeRoom is deleted
  const currentRoomData = rooms.find(r => r.id === activeRoom) || rooms[0] || { id: 'main', name: 'Main Meeting', type: 'main' };
  
  // Notify parent of room change for the widget
  React.useEffect(() => {
    if (onRoomChange) {
      onRoomChange(currentRoomData.name);
    }
  }, [currentRoomData.name, onRoomChange]);

  // Mentor joins the currently active room being viewed
  const updatedMentor = { ...mockMentor, room: currentRoomData.name };

  // Combine mentor and interns for easier lookup
  const allParticipants = [updatedMentor, ...interns];

  const currentRoomParticipants = allParticipants.filter(
    p => p.room === currentRoomData.name && p.online
  );

  const handleLeave = () => {
    if (onLeaveMeeting) {
      onLeaveMeeting();
    } else {
      setActiveRoom('main');
    }
  };

  return (
    <div className="br-app-container" style={{ height: '100%' }}>
      <WorkspaceSidebar 
        rooms={rooms}
        activeRoom={activeRoom}
        setActiveRoom={setActiveRoom}
        participants={allParticipants}
        isIntern={isIntern}
      />
      <MeetingArea 
        room={currentRoomData}
        participants={currentRoomParticipants}
        rightPanelMode={rightPanelMode}
        setRightPanelMode={setRightPanelMode}
        onLeave={handleLeave}
        openManager={() => !isIntern && setIsManagerOpen(true)}
        isIntern={isIntern}
        onMinimize={onMinimize}
      />
      {rightPanelMode !== 'closed' && (
        <MembersPanel 
          mode={rightPanelMode}
          onClose={() => setRightPanelMode('closed')}
          interns={interns}
          mentor={updatedMentor}
          onKickIntern={(id) => setInterns(interns.filter(i => i.id !== id))}
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
