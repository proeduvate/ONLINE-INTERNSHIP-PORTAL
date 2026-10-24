import React, { useState, useEffect, useMemo } from 'react';
import './BreakoutRooms.css';
import WorkspaceSidebar from './WorkspaceSidebar';
import MeetingArea from './MeetingArea';
import MembersPanel from './MembersPanel';
import BreakoutManagerModal from './BreakoutManagerModal';
import { mockRooms } from './MockData';
import { useAuth } from '../../services/AuthContext';

export default function BreakoutRoomsApp({ onRoomChange, onLeaveMeeting, isIntern = false, onMinimize, user: propUser }) {
  const auth = useAuth() || {};
  const user = propUser || auth.user || (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch (e) { return null; }
  })();
  const [rooms, setRooms] = useState(mockRooms);
  // Default both Mentor and Intern to 'main' so they enter the same meeting room!
  const [activeRoom, setActiveRoom] = useState('main');
  const [rightPanelMode, setRightPanelMode] = useState('members'); // 'members', 'chat', 'closed'
  const [isManagerOpen, setIsManagerOpen] = useState(false);

  const currentRoomData = rooms.find(r => r.id === activeRoom) || rooms[0] || { id: 'main', name: 'Main Meeting', type: 'main' };

  const [allParticipants, setAllParticipants] = useState([]);

  // Generate a unique tab ID so mentor and intern tabs in the same browser session don't overwrite each other in localStorage
  const [tabId] = useState(() => {
    let tid = sessionStorage.getItem('br_tab_id');
    if (!tid) {
      tid = Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem('br_tab_id', tid);
    }
    return tid;
  });

  const participantId = user?.id 
    ? `${isIntern ? 'intern' : 'mentor'}_${user.id}_${tabId}`
    : `${isIntern ? 'intern' : 'mentor'}_guest_${tabId}`;

  // Sync active room presence & participants state across browser tabs
  useEffect(() => {
    const participantName = user?.name || (isIntern ? 'Intern Participant' : 'Mentor Host');
    const participantAvatar = user?.name 
      ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() 
      : (isIntern ? 'IN' : 'ME');

    const currentParticipant = {
      id: participantId,
      name: participantName,
      role: isIntern ? 'Intern' : 'Mentor',
      isMentor: !isIntern,
      room: currentRoomData.name,
      avatar: participantAvatar,
      online: true,
      lastSeen: Date.now()
    };

    const isSemanticEqual = (arr1, arr2) => {
      if (!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
      if (arr1.length !== arr2.length) return false;
      for (let i = 0; i < arr1.length; i++) {
        if (
          arr1[i].id !== arr2[i].id ||
          arr1[i].name !== arr2[i].name ||
          arr1[i].room !== arr2[i].room ||
          arr1[i].role !== arr2[i].role ||
          arr1[i].online !== arr2[i].online
        ) {
          return false;
        }
      }
      return true;
    };

    const syncPresence = () => {
      try {
        const stored = localStorage.getItem('breakout_meeting_participants');
        let list = stored ? JSON.parse(stored) : [];
        if (!Array.isArray(list)) list = [];

        const now = Date.now();
        // Remove stale participants (> 6 seconds without heartbeat) and any existing entry for this participant/tab
        list = list.filter(p => p.id !== participantId && !p.id.endsWith(`_${tabId}`) && (now - (p.lastSeen || 0)) < 6000);

        // Append current participant with latest lastSeen timestamp
        list.push({ ...currentParticipant, lastSeen: now });

        // Stable sort by ID so array order doesn't flip back and forth on alternate heartbeats
        list.sort((a, b) => String(a.id).localeCompare(String(b.id)));

        localStorage.setItem('breakout_meeting_participants', JSON.stringify(list));
        setAllParticipants(prev => isSemanticEqual(prev, list) ? prev : list);
      } catch (err) {
        console.error("Presence sync error:", err);
      }
    };

    syncPresence();
    const interval = setInterval(syncPresence, 1500);

    const handleStorage = (e) => {
      if (e.key === 'breakout_meeting_participants') {
        try {
          let list = JSON.parse(e.newValue || '[]');
          if (Array.isArray(list)) {
            const now = Date.now();
            list = list.filter(p => (now - (p.lastSeen || 0)) < 6000);
            list.sort((a, b) => String(a.id).localeCompare(String(b.id)));
            setAllParticipants(prev => isSemanticEqual(prev, list) ? prev : list);
          }
        } catch (err) {}
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorage);
      try {
        const stored = localStorage.getItem('breakout_meeting_participants');
        if (stored) {
          let list = JSON.parse(stored).filter(p => p.id !== participantId && !p.id.endsWith(`_${tabId}`));
          localStorage.setItem('breakout_meeting_participants', JSON.stringify(list));
        }
      } catch (err) {}
    };
  }, [user, activeRoom, currentRoomData.name, isIntern, participantId, tabId]);

  const currentRoomParticipants = useMemo(() => {
    return allParticipants.filter(
      p => p.room === currentRoomData.name && p.online
    );
  }, [allParticipants, currentRoomData.name]);

  const activeMentor = useMemo(() => {
    return allParticipants.find(p => p.isMentor || p.role === 'Mentor') || {
      id: 'mentor-default',
      name: user?.name || "Mentor",
      room: currentRoomData.name,
      avatar: user?.name ? user.name.slice(0, 2).toUpperCase() : "ME",
      online: true
    };
  }, [allParticipants, currentRoomData.name, user?.name]);

  const internsInMeeting = useMemo(() => {
    return allParticipants.filter(p => !p.isMentor && p.role !== 'Mentor');
  }, [allParticipants]);

  // Notify parent when active room changes
  const handleSetActiveRoom = (roomId) => {
    setActiveRoom(roomId);
    const room = rooms.find(r => r.id === roomId);
    if (onRoomChange && room) onRoomChange(room.name);
  };

  const handleLeave = () => {
    try {
      const stored = localStorage.getItem('breakout_meeting_participants');
      if (stored) {
        let list = JSON.parse(stored).filter(p => p.id !== participantId && !p.id.endsWith(`_${tabId}`));
        localStorage.setItem('breakout_meeting_participants', JSON.stringify(list));
      }
    } catch (err) {}
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
      />
      <MeetingArea 
        room={currentRoomData}
        participants={currentRoomParticipants}
        currentParticipantId={participantId}
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
          interns={internsInMeeting}
          mentor={activeMentor}
          isIntern={isIntern}
        />
      )}

      {isManagerOpen && (
        <BreakoutManagerModal 
          onClose={() => setIsManagerOpen(false)}
          rooms={rooms}
          setRooms={setRooms}
          interns={internsInMeeting}
          setInterns={() => {}}
          activeRoom={activeRoom}
          setActiveRoom={setActiveRoom}
        />
      )}
    </div>
  );
}
