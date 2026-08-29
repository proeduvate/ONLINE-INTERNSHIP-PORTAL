import React, { useState } from 'react';
import './BreakoutRooms.css';
import WorkspaceSidebar from './WorkspaceSidebar';
import MeetingArea from './MeetingArea';
import MembersPanel from './MembersPanel';
import BreakoutManagerModal from './BreakoutManagerModal';
import { mockInterns, mockMentor, mockRooms } from './MockData';

export default function BreakoutRoomsApp() {
  const [rooms, setRooms] = useState(mockRooms);
  const [interns, setInterns] = useState(mockInterns);
  const [activeRoom, setActiveRoom] = useState('alpha');
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

  const handleLeave = () => {
    // Return to main meeting
    setActiveRoom('main');
  };

  return (
    <div className="br-app-container">
      <WorkspaceSidebar 
        rooms={rooms}
        activeRoom={activeRoom}
        setActiveRoom={setActiveRoom}
        participants={allParticipants}
      />
      <MeetingArea 
        room={currentRoomData}
        participants={currentRoomParticipants}
        rightPanelMode={rightPanelMode}
        setRightPanelMode={setRightPanelMode}
        onLeave={handleLeave}
        openManager={() => setIsManagerOpen(true)}
      />
      {rightPanelMode !== 'closed' && (
        <MembersPanel 
          mode={rightPanelMode}
          onClose={() => setRightPanelMode('closed')}
          interns={interns}
          mentor={updatedMentor}
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
