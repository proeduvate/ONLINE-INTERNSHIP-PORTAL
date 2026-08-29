import React from 'react';
import { X, Users, Volume2, UserMinus, Trash2 } from 'lucide-react';

export default function BreakoutManagerModal({ onClose, rooms, setRooms, interns, setInterns, activeRoom, setActiveRoom }) {
  const breakoutRooms = rooms.filter(r => r.type === 'breakout');
  const unassignedInterns = interns.filter(i => i.room === 'Main Meeting');

  const moveIntern = (internId, targetRoomName) => {
    setInterns(interns.map(i => i.id === internId ? { ...i, room: targetRoomName } : i));
  };

  const endAllBreakouts = () => {
    setInterns(interns.map(i => ({ ...i, room: 'Main Meeting' })));
  };

  const addRoom = () => {
    let charCode = 65; // 'A'
    while (rooms.some(r => r.name === `Team ${String.fromCharCode(charCode)}`)) {
      charCode++;
    }
    const newRoomName = `Team ${String.fromCharCode(charCode)}`;
    const newRoomId = newRoomName.toLowerCase().replace(' ', '-');
    setRooms([...rooms, { id: newRoomId, name: newRoomName, type: 'breakout' }]);
  };

  const deleteRoom = (roomName) => {
    const targetRoom = rooms.find(r => r.name === roomName);
    if (targetRoom && targetRoom.id === activeRoom) {
      if (setActiveRoom) setActiveRoom('main');
    }
    // Move any interns in this room back to Main Meeting
    setInterns(interns.map(i => i.room === roomName ? { ...i, room: 'Main Meeting' } : i));
    // Remove the room
    setRooms(rooms.filter(r => r.name !== roomName));
  };

  return (
    <div className="br-modal-overlay">
      <div className="br-modal" style={{ width: '800px', maxWidth: '90vw' }}>
        <div className="br-modal-header">
          Manual Breakout Room Assignment
          <button className="br-icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="br-modal-content" style={{ display: 'flex', gap: '24px', height: '500px', padding: '16px' }}>
          
          {/* Left Column: Unassigned Interns */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid #e3e5e8', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ padding: '12px', backgroundColor: '#f2f3f5', fontWeight: 600, borderBottom: '1px solid #e3e5e8', display: 'flex', justifyContent: 'space-between' }}>
              <span>Main Meeting (Unassigned)</span>
              <span>{unassignedInterns.length}</span>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
              {unassignedInterns.length === 0 ? (
                <div style={{ color: '#5c5e66', textAlign: 'center', marginTop: '40px', fontSize: '14px' }}>All interns assigned.</div>
              ) : (
                unassignedInterns.map(intern => (
                  <div key={intern.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px', borderBottom: '1px solid #f2f3f5' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div className="br-avatar-small">{intern.avatar}</div>
                      <span style={{ fontSize: '14px', fontWeight: 500 }}>{intern.name}</span>
                    </div>
                    <select 
                      className="br-input" 
                      style={{ padding: '4px 8px', fontSize: '12px', width: 'auto' }}
                      onChange={(e) => {
                        if (e.target.value) moveIntern(intern.id, e.target.value);
                      }}
                      value=""
                    >
                      <option value="" disabled>Assign to...</option>
                      {breakoutRooms.map(r => (
                        <option key={r.id} value={r.name}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right Column: Breakout Rooms */}
          <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', border: '1px solid #e3e5e8', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ padding: '12px', backgroundColor: '#f2f3f5', fontWeight: 600, borderBottom: '1px solid #e3e5e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Breakout Rooms ({breakoutRooms.length})</span>
              <button className="br-btn br-btn-secondary" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={addRoom}>+ Add Room</button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {breakoutRooms.map(room => {
                const roomInterns = interns.filter(i => i.room === room.name);
                return (
                  <div key={room.id} style={{ border: '1px solid #e3e5e8', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ padding: '8px 12px', backgroundColor: '#f8f9fa', fontWeight: 500, fontSize: '13px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Volume2 size={16} /> {room.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span>{roomInterns.length} / 6</span>
                        <button 
                          onClick={() => deleteRoom(room.name)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#da373c' }}
                          title="Delete Room"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div style={{ padding: '8px' }}>
                      {roomInterns.length === 0 ? (
                        <div style={{ color: '#80848e', fontSize: '12px', padding: '4px' }}>Empty</div>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {roomInterns.map(intern => (
                            <div key={intern.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#ebedef', padding: '4px 8px', borderRadius: '4px', fontSize: '13px' }}>
                              <div className="br-avatar-small" style={{ width: '16px', height: '16px', fontSize: '10px' }}>{intern.avatar}</div>
                              {intern.name}
                              <button 
                                onClick={() => moveIntern(intern.id, 'Main Meeting')}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#da373c', marginLeft: '4px' }}
                                title="Move back to Main Meeting"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
        
        <div className="br-modal-footer" style={{ justifyContent: 'space-between' }}>
          <button className="br-btn br-btn-secondary" style={{ color: '#da373c', borderColor: '#da373c' }} onClick={endAllBreakouts}>Recall All to Main Meeting</button>
          <button className="br-btn br-btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}
