import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE } from '../api';
import { useAuth } from '../services/AuthContext';
import './MeetingPage.css';

function MeetingPage() {
    const [meetings, setMeetings] = useState([]);
    const [title, setTitle] = useState('');
    const [roomCode, setRoomCode] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const { user, authToken } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchMeetings();
    }, []);

    const fetchMeetings = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/meetings`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch meetings');
            }
            const data = await response.json();
            setMeetings(data);
        } catch (error) {
            console.error('Error fetching meetings:', error);
            // Optionally, handle error display to the user
        }
    };

    const handleCreateMeeting = async (e) => {
        e.preventDefault();
        try {
            const meetingData = {
                title,
                room_code: roomCode || undefined, // Send if provided, otherwise let backend generate
                scheduled_time: scheduledTime ? new Date(scheduledTime).toISOString() : undefined
            };

            const response = await fetch(`${API_BASE}/api/meetings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(meetingData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to create meeting');
            }

            setTitle('');
            setRoomCode('');
            setScheduledTime('');
            fetchMeetings(); // Refresh the list of meetings
        } catch (error) {
            console.error('Error creating meeting:', error);
            alert(`Error: ${error.message}`); // Display error to user
        }
    };

    const handleJoinMeeting = (meetingId) => {
        navigate(`/meetings/${meetingId}/live`);
    };

    return (
        <div className="meeting-page-container">
            <h1>Meetings</h1>

            {(user.role === 'admin' || user.role === 'mentor') && (
                <div className="create-meeting-section">
                    <h2>Create New Meeting</h2>
                    <form onSubmit={handleCreateMeeting}>
                        <div className="form-group">
                            <label htmlFor="title">Meeting Title:</label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="roomCode">Room Code (Optional):</label>
                            <input
                                type="text"
                                id="roomCode"
                                value={roomCode}
                                onChange={(e) => setRoomCode(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="scheduledTime">Scheduled Time (Optional):</label>
                            <input
                                type="datetime-local"
                                id="scheduledTime"
                                value={scheduledTime}
                                onChange={(e) => setScheduledTime(e.target.value)}
                            />
                        </div>
                        <button type="submit" className="create-button">Create Meeting</button>
                    </form>
                </div>
            )}

            <div className="meeting-list-section">
                <h2>Available Meetings</h2>
                {meetings.length === 0 ? (
                    <p>No meetings available.</p>
                ) : (
                    <ul className="meeting-list">
                        {meetings.map(meeting => (
                            <li key={meeting.id} className="meeting-item">
                                <h3>{meeting.title}</h3>
                                <p><strong>Room Code:</strong> {meeting.room_code}</p>
                                <p><strong>Status:</strong> {meeting.status}</p>
                                {meeting.scheduled_time && (
                                    <p><strong>Scheduled:</strong> {new Date(meeting.scheduled_time).toLocaleString()}</p>
                                )}
                                <p><strong>Created:</strong> {new Date(meeting.created_at).toLocaleString()}</p>
                                <button
                                    onClick={() => handleJoinMeeting(meeting.id)}
                                    className="join-button"
                                >
                                    Join Meeting
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default MeetingPage;
