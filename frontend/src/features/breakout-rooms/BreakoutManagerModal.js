import React, { useState } from 'react';
import { X, Volume2, Trash2, Plus, CheckSquare, Square, Search } from 'lucide-react';

export default function BreakoutManagerModal({ onClose, rooms, setRooms, interns, setInterns, activeRoom, setActiveRoom }) {
  const [activeMultiSelectRoomId, setActiveMultiSelectRoomId] = useState(null);
  const [selectedInternIds, setSelectedInternIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  const breakoutRooms = rooms.filter(r => r.type === 'breakout');
  const unassignedInterns = interns.filter(i => i.room === 'Main Meeting');

  const moveIntern = (internId, targetRoomName) => {
    setInterns(interns.map(i => i.id === internId ? { ...i, room: targetRoomName } : i));
  };

  const assignSelectedInternsToRoom = (targetRoomName) => {
    if (selectedInternIds.length === 0) return;
    setInterns(interns.map(i => selectedInternIds.includes(i.id) ? { ...i, room: targetRoomName } : i));
    setSelectedInternIds([]);
    setActiveMultiSelectRoomId(null);
  };

  const toggleSelectIntern = (internId) => {
    if (selectedInternIds.includes(internId)) {
      setSelectedInternIds(selectedInternIds.filter(id => id !== internId));
    } else {
      setSelectedInternIds([...selectedInternIds, internId]);
    }
  };

  const toggleSelectAll = (filteredInterns) => {
    const allFilteredIds = filteredInterns.map(i => i.id);
    const areAllSelected = allFilteredIds.every(id => selectedInternIds.includes(id));

    if (areAllSelected) {
      setSelectedInternIds(selectedInternIds.filter(id => !allFilteredIds.includes(id)));
    } else {
      const combined = new Set([...selectedInternIds, ...allFilteredIds]);
      setSelectedInternIds(Array.from(combined));
    }
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

  const openMultiSelect = (roomId) => {
    setActiveMultiSelectRoomId(roomId);
    setSelectedInternIds([]);
    setSearchTerm('');
  };

  return (
    <div className="br-modal-overlay">
      <div className="br-modal" style={{ width: '640px', maxWidth: '92vw', maxHeight: '88vh', display: 'flex', flexDirection: 'column' }}>
        <div className="br-modal-header" style={{ flexShrink: 0 }}>
          <span>Manual Breakout Room Assignment</span>
          <button className="br-icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div className="br-modal-content" style={{ flex: 1, maxHeight: 'calc(88vh - 130px)', overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column' }}>
          
          {/* Top Summary Bar */}
          <div style={{ padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '8px', fontWeight: 600, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '15px', color: '#1e293b', fontWeight: 700 }}>Breakout Rooms ({breakoutRooms.length})</span>
              <span style={{ fontSize: '12px', backgroundColor: '#e2e8f0', color: '#475569', padding: '4px 12px', borderRadius: '12px', fontWeight: 600 }}>
                Unassigned Interns: {unassignedInterns.length}
              </span>
            </div>
            <button className="br-btn br-btn-primary" style={{ padding: '6px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={addRoom}>
              <Plus size={16} /> Add Room
            </button>
          </div>

          {/* Breakout Rooms List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {breakoutRooms.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '80px 20px', color: '#94a3b8', fontSize: '14px', fontWeight: 500 }}>
                No breakout rooms created yet.
              </div>
            ) : (
              breakoutRooms.map(room => {
                const roomInterns = interns.filter(i => i.room === room.name);
                const isMultiSelectOpen = activeMultiSelectRoomId === room.id;

                return (
                  <div key={room.id} style={{ border: '1px solid #cbd5e1', borderRadius: '10px', overflow: 'hidden', backgroundColor: '#ffffff', boxShadow: '0 2px 4px rgba(0,0,0,0.03)' }}>
                    {/* Room Header */}
                    <div style={{ padding: '10px 14px', backgroundColor: '#f8f9fa', fontWeight: 500, fontSize: '14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, color: '#1e293b' }}>
                        <Volume2 size={18} color="#5865f2" /> {room.name}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {unassignedInterns.length > 0 && (
                          <button
                            onClick={() => openMultiSelect(isMultiSelectOpen ? null : room.id)}
                            style={{
                              padding: '5px 12px',
                              fontSize: '13px',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: isMultiSelectOpen ? '#4338ca' : '#5865f2',
                              color: '#ffffff',
                              cursor: 'pointer',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Plus size={15} /> Add
                          </button>
                        )}
                        <button 
                          onClick={() => deleteRoom(room.name)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', color: '#da373c', borderRadius: '4px' }}
                          title="Delete Room"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Multi-Select Assignment Panel */}
                    {isMultiSelectOpen && (
                      <div style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 700, color: '#1e293b' }}>
                              Select Interns to Assign:
                            </span>
                            {unassignedInterns.length > 0 && (
                              <button
                                onClick={() => {
                                  const filtered = unassignedInterns.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
                                  toggleSelectAll(filtered);
                                }}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#4f46e5', fontWeight: 700 }}
                              >
                                {unassignedInterns.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).every(i => selectedInternIds.includes(i.id)) ? 'Deselect All' : 'Select All'}
                              </button>
                            )}
                          </div>
                          <button 
                            onClick={() => setActiveMultiSelectRoomId(null)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: '13px', fontWeight: 600 }}
                          >
                            Cancel
                          </button>
                        </div>

                        {/* Search Input */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '6px 10px', marginBottom: '10px' }}>
                          <Search size={14} color="#94a3b8" />
                          <input 
                            type="text"
                            placeholder="Search unassigned interns..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '13px', backgroundColor: 'transparent' }}
                          />
                        </div>

                        {/* Unassigned Interns List */}
                        <div style={{ maxHeight: '180px', overflowY: 'auto', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1', padding: '6px' }}>
                          {unassignedInterns.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                            <div style={{ padding: '14px', textAlign: 'center', fontSize: '13px', color: '#94a3b8' }}>
                              No unassigned interns available.
                            </div>
                          ) : (
                            unassignedInterns
                              .filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()))
                              .map(intern => {
                                const isChecked = selectedInternIds.includes(intern.id);
                                return (
                                  <div
                                    key={intern.id}
                                    onClick={() => toggleSelectIntern(intern.id)}
                                    style={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      padding: '8px 12px',
                                      borderRadius: '6px',
                                      cursor: 'pointer',
                                      backgroundColor: isChecked ? '#eef2ff' : 'transparent',
                                      marginBottom: '4px',
                                      border: isChecked ? '1px solid #c7d2fe' : '1px solid transparent',
                                      transition: 'all 0.15s ease'
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <div className="br-avatar-small" style={{ width: '24px', height: '24px', fontSize: '11px' }}>{intern.avatar}</div>
                                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{intern.name}</span>
                                    </div>
                                    <div style={{ color: isChecked ? '#4f46e5' : '#94a3b8', display: 'flex', alignItems: 'center' }}>
                                      {isChecked ? <CheckSquare size={18} color="#4f46e5" /> : <Square size={18} color="#cbd5e1" />}
                                    </div>
                                  </div>
                                );
                              })
                          )}
                        </div>

                        {/* Always Sticky & Visible Assign Action Button Bar */}
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                          <button
                            onClick={() => assignSelectedInternsToRoom(room.name)}
                            disabled={selectedInternIds.length === 0}
                            style={{
                              backgroundColor: selectedInternIds.length > 0 ? '#4f46e5' : '#94a3b8',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '8px 18px',
                              fontSize: '13px',
                              fontWeight: 700,
                              cursor: selectedInternIds.length > 0 ? 'pointer' : 'not-allowed',
                              boxShadow: selectedInternIds.length > 0 ? '0 2px 6px rgba(79, 70, 229, 0.3)' : 'none'
                            }}
                          >
                            Assign {selectedInternIds.length > 0 ? `(${selectedInternIds.length}) ` : ''}to {room.name}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Assigned Interns Container */}
                    <div style={{ padding: '10px 14px' }}>
                      {roomInterns.length === 0 ? (
                        <div style={{ color: '#94a3b8', fontSize: '12px', fontStyle: 'italic', padding: '2px 0' }}>
                          No interns assigned yet.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {roomInterns.map(intern => (
                            <div key={intern.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#eef2ff', color: '#3730a3', border: '1px solid #c7d2fe', padding: '4px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: 500 }}>
                              <div className="br-avatar-small" style={{ width: '18px', height: '18px', fontSize: '10px', backgroundColor: '#4f46e5' }}>{intern.avatar}</div>
                              {intern.name}
                              <button 
                                onClick={() => moveIntern(intern.id, 'Main Meeting')}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', color: '#ef4444', marginLeft: '4px' }}
                                title="Remove & move back to Main Meeting"
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
              })
            )}
          </div>

        </div>
        
        <div className="br-modal-footer" style={{ justifyContent: 'space-between', flexShrink: 0 }}>
          <button className="br-btn br-btn-secondary" style={{ color: '#da373c', borderColor: '#da373c' }} onClick={endAllBreakouts}>Recall All to Main Meeting</button>
          <button className="br-btn br-btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}
