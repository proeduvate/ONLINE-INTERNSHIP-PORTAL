import React, { useState } from 'react';
import { X, Volume2, Trash2 } from 'lucide-react';
import api from '../../api/axios';

export default function BreakoutManagerModal({ onClose, rooms, setRooms, interns, setInterns, activeRoom, setActiveRoom, meetingId }) {
  const [assigningToRoom, setAssigningToRoom] = useState(null);
  const [selectedInterns, setSelectedInterns] = useState([]);
  const [roomCount, setRoomCount] = useState(2);
  const [roomNamesInput, setRoomNamesInput] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const breakoutRooms = rooms.filter(r => r.type === 'breakout');
  const unassignedInterns = interns.filter(i => i.room === 'Main Meeting');

  const moveIntern = (internId, targetRoomName) => {
    setInterns(prev => prev.map(i => i.id === internId ? { ...i, room: targetRoomName } : i));
  };

  const endAllBreakouts = () => {
    setInterns(prev => prev.map(i => ({ ...i, room: 'Main Meeting' })));
  };

  const generateRoomNames = (count) => {
    const existingNames = new Set(rooms.filter(r => r.type === 'breakout').map(r => r.name));
    const enteredNames = roomNamesInput
      .split(',')
      .map(name => name.trim())
      .filter(Boolean);

    const names = [...enteredNames];

    let nextIndex = 1;
    while (names.length < count) {
      const candidate = `Team ${String.fromCharCode(64 + nextIndex)}`;
      if (!existingNames.has(candidate)) {
        names.push(candidate);
      }
      nextIndex += 1;
    }

    return names.slice(0, count);
  };

  const createRooms = async () => {
    const requestedCount = Math.max(1, Number(roomCount) || 1);
    const names = generateRoomNames(requestedCount);

    setIsCreating(true);
    setErrorMessage('');

    try {
      const createdRooms = [];

      for (const name of names) {
        const roomPayload = { name };

        if (meetingId) {
          const res = await api.post(`/api/meetings/${meetingId}/breakout-rooms`, roomPayload);
          createdRooms.push({
            id: String(res.data.id),
            name: res.data.name,
            type: 'breakout'
          });
        } else {
          createdRooms.push({
            id: `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            name,
            type: 'breakout'
          });
        }
      }

      setRooms(prev => {
        const mainOnly = prev.filter(r => r.type === 'main');
        const existingBreakouts = prev.filter(r => r.type === 'breakout');
        const dedupedExisting = existingBreakouts.filter(existing => !createdRooms.some(room => room.name === existing.name));
        return [...mainOnly, ...dedupedExisting, ...createdRooms];
      });

      setRoomNamesInput('');
      setRoomCount(2);
    } catch (err) {
      console.error('Failed to create breakout rooms:', err);
      setErrorMessage('Could not create breakout rooms. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const deleteRoom = async (roomName) => {
    const targetRoom = rooms.find(r => r.name === roomName);
    if (!targetRoom) return;

    if (targetRoom.id !== 'main') {
      try {
        if (meetingId) {
          await api.delete(`/api/breakout-rooms/${targetRoom.id}`);
        }
      } catch (err) {
        console.error('Failed to delete breakout room:', err);
      }
    }

    if (targetRoom && targetRoom.id === activeRoom) {
      if (setActiveRoom) setActiveRoom('main');
    }

    setInterns(prev => prev.map(i => i.room === roomName ? { ...i, room: 'Main Meeting' } : i));
    setRooms(prev => prev.filter(r => r.name !== roomName));
  };

  const handleAssignSelected = (roomName) => {
    setInterns(prev => prev.map(i => selectedInterns.includes(i.id) ? { ...i, room: roomName } : i));
    setAssigningToRoom(null);
    setSelectedInterns([]);
  };

  const toggleInternSelection = (internId) => {
    setSelectedInterns(prev => prev.includes(internId) ? prev.filter(id => id !== internId) : [...prev, internId]);
  };

  return (
    <div className="br-modal-overlay">
      <div className="br-modal" style={{ width: '600px', maxWidth: '90vw' }}>
        <div className="br-modal-header">
          Manual Breakout Room Assignment
          <button className="br-icon-btn" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="br-modal-content" style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '500px', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#4b4d54' }}>Unassigned Interns: {unassignedInterns.length}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <input
                type="number"
                min="1"
                max="10"
                value={roomCount}
                onChange={(e) => setRoomCount(Math.max(1, Number(e.target.value) || 1))}
                style={{ width: '70px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}
                placeholder="Count"
              />
              <input
                type="text"
                value={roomNamesInput}
                onChange={(e) => setRoomNamesInput(e.target.value)}
                style={{ minWidth: '200px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px' }}
                placeholder="Optional names: Team A, Team B"
              />
              <button className="br-btn br-btn-primary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={createRooms} disabled={isCreating}>
                {isCreating ? 'Creating...' : '+ Create Rooms'}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div style={{ padding: '10px 12px', borderRadius: '8px', backgroundColor: '#fef2f2', color: '#b91c1c', fontSize: '13px', border: '1px solid #fecaca' }}>
              {errorMessage}
            </div>
          )}

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {breakoutRooms.map(room => {
              const roomInterns = interns.filter(i => i.room === room.name);
              const isAssigning = assigningToRoom === room.id;

              return (
                <div key={room.id} style={{ border: '1px solid #e3e5e8', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', backgroundColor: '#f8f9fa', fontWeight: 600, fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: isAssigning ? '1px solid #e3e5e8' : 'none' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Volume2 size={18} /> {room.name}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ color: '#4b4d54', fontSize: '13px', fontWeight: 500 }}>{roomInterns.length} / 6</span>

                      {!isAssigning && unassignedInterns.length > 0 && (
                        <button
                          onClick={() => { setAssigningToRoom(room.id); setSelectedInterns([]); }}
                          className="br-btn br-btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '12px' }}
                        >
                          Add Interns
                        </button>
                      )}

                      <button
                        onClick={() => deleteRoom(room.name)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#da373c' }}
                        title="Delete Room"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {isAssigning && (
                    <div style={{ padding: '12px', backgroundColor: '#fff', borderBottom: '1px solid #e3e5e8' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: '#4b4d54' }}>Select interns to assign:</div>
                      <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #e3e5e8', borderRadius: '6px', marginBottom: '12px' }}>
                        {unassignedInterns.map(intern => (
                          <div
                            key={intern.id}
                            onClick={() => toggleInternSelection(intern.id)}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderBottom: '1px solid #f2f3f5', cursor: 'pointer', backgroundColor: selectedInterns.includes(intern.id) ? '#f2f9ff' : '#fff' }}
                          >
                            <input
                              type="checkbox"
                              checked={selectedInterns.includes(intern.id)}
                              readOnly
                              style={{ cursor: 'pointer' }}
                            />
                            <div className="br-avatar-small" style={{ width: '20px', height: '20px', fontSize: '11px' }}>{intern.avatar}</div>
                            <span style={{ fontSize: '13px' }}>{intern.name}</span>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        <button className="br-btn br-btn-secondary" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => setAssigningToRoom(null)}>Cancel</button>
                        <button className="br-btn br-btn-primary" style={{ padding: '4px 12px', fontSize: '12px' }} onClick={() => handleAssignSelected(room.name)} disabled={selectedInterns.length === 0}>Assign ({selectedInterns.length})</button>
                      </div>
                    </div>
                  )}

                  {!isAssigning && (
                    <div style={{ padding: '12px', backgroundColor: '#fff' }}>
                      {roomInterns.length === 0 ? (
                        <div style={{ color: '#80848e', fontSize: '13px', textAlign: 'center', padding: '12px 0' }}>Empty</div>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {roomInterns.map(intern => (
                            <div key={intern.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#ebedef', padding: '6px 10px', borderRadius: '6px', fontSize: '13px' }}>
                              <div className="br-avatar-small" style={{ width: '18px', height: '18px', fontSize: '10px' }}>{intern.avatar}</div>
                              {intern.name}
                              <button
                                onClick={() => moveIntern(intern.id, 'Main Meeting')}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#da373c', marginLeft: '6px' }}
                                title="Remove from room"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {breakoutRooms.length === 0 && (
              <div style={{ textAlign: 'center', color: '#80848e', marginTop: '40px', fontSize: '14px' }}>
                No breakout rooms created yet.
              </div>
            )}
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
