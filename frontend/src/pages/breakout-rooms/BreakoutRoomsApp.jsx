import React, { useState } from 'react';
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
  const [activeRoom, setActiveRoom] = useState(isIntern ? 'main' : 'alpha');
  const [rightPanelMode, setRightPanelMode] = useState('members'); // 'members', 'chat', 'closed'
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(false);

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
    setIsLeftPanelOpen(false); // Close mobile menu on select
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

  return (
    <div className="br-app-container">
      <WorkspaceSidebar 
        rooms={rooms}
        activeRoom={activeRoom}
        setActiveRoom={handleSetActiveRoom}
        participants={allParticipants}
        isIntern={isIntern}
        isOpen={isLeftPanelOpen}
        onClose={() => setIsLeftPanelOpen(false)}
      />
      <MeetingArea 
        room={currentRoomData}
        participants={currentRoomParticipants}
        rightPanelMode={rightPanelMode}
        setRightPanelMode={setRightPanelMode}
        onLeave={handleLeave}
        openManager={() => setIsManagerOpen(true)}
        isIntern={isIntern}
        onMinimize={onMinimize}
        toggleLeftPanel={() => setIsLeftPanelOpen(prev => !prev)}
      />
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
