import React, { useState, useEffect } from 'react';
import './BreakoutRooms.css';
import WorkspaceSidebar from './WorkspaceSidebar';
import MeetingArea from './MeetingArea';
import MembersPanel from './MembersPanel';
import BreakoutManagerModal from './BreakoutManagerModal';
import { mockInterns, mockMentor, mockRooms } from './MockData';
import api from '../../api/axios';

export default function BreakoutRoomsApp({ onRoomChange, onLeaveMeeting, isIntern = false, onMinimize }) {
  const [rooms, setRooms] = useState(mockRooms);
  const [mentor, setMentor] = useState(() => {
    const userStr = localStorage.getItem("user");
    let name = "Dr. Sakthi";
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.name || u.full_name) name = u.name || u.full_name;
      } catch (e) {}
    }
    return { id: 2, name: name, role: "Mentor", online: true, room: "Main Meeting", micOn: false, camOn: true, avatar: name.charAt(0).toUpperCase() };
  });
  
  // Real active interns in this meeting session (starts empty - real users added when they join)
  const [interns, setInterns] = useState(() => {
    if (isIntern) {
      const userStr = localStorage.getItem("user");
      let name = "You (Intern)";
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          if (u.name || u.full_name) name = u.name || u.full_name;
        } catch (e) {}
      }
      return [{ id: Date.now(), name: name, role: "Intern", online: true, room: "Main Meeting", micOn: false, camOn: false, avatar: name.charAt(0).toUpperCase() }];
    }
    return [];
  });
  
  const [activeRoom, setActiveRoom] = useState(isIntern ? 'main' : 'main');
  const [rightPanelMode, setRightPanelMode] = useState('members'); // 'members', 'chat', 'closed'
  const [isManagerOpen, setIsManagerOpen] = useState(false);

  useEffect(() => {
    // Poll backend for real joined participants or waiting list
    const checkActiveParticipants = async () => {
      try {
        const res = await api.get('/api/meetings/main-meeting/waiting-list');
        if (res.data && res.data.waiting) {
          const waitingEntries = Object.entries(res.data.waiting);
          if (waitingEntries.length > 0) {
            const realJoined = waitingEntries.map(([id, info]) => ({
              id: id,
              name: info.name || `Intern ${id}`,
              role: 'Intern',
              online: true,
              room: 'Main Meeting',
              micOn: false,
              camOn: false,
              avatar: (info.name || 'I').charAt(0).toUpperCase()
            }));
            setInterns(realJoined);
          }
        }
      } catch (err) {
        // Silently ignore if waiting list endpoint not active
      }
    };
    checkActiveParticipants();
  }, []);

  // Safe fallback if activeRoom is deleted
  const currentRoomData = rooms.find(r => r.id === activeRoom) || rooms[0] || { id: 'main', name: 'Main Meeting', type: 'main' };
  
  // Mentor joins the currently active room being viewed
  const updatedMentor = { ...mentor, room: currentRoomData.name };

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

  return (
    <div className="br-app-container">
      <WorkspaceSidebar 
        rooms={rooms}
        activeRoom={activeRoom}
        setActiveRoom={handleSetActiveRoom}
        participants={allParticipants}
        isIntern={isIntern}
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
