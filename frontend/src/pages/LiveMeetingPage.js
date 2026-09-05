import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../services/AuthContext';
import { API_BASE } from '../api';
import './LiveMeetingPage.css';

const LiveMeetingPage = () => {
    const { meetingId } = useParams();
    const navigate = useNavigate();
    const { user, authToken } = useAuth();
    const [meeting, setMeeting] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [localParticipant, setLocalParticipant] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [activeRoom, setActiveRoom] = useState(meetingId); // State to track the current active room
    const ws = useRef(null);

    const localVideoRef = useRef(null);
    const remoteVideoRefs = useRef({});

    // State for media controls
    const [micEnabled, setMicEnabled] = useState(false);
    const [videoEnabled, setVideoEnabled] = useState(false);
    const [screenSharing, setScreenSharing] = useState(false);
    const [handRaised, setHandRaised] = useState(false);
    const [thumbsUp, setThumbsUp] = useState(false);

    // MediaStream references
    const localStreamRef = useRef(null);
    const screenStreamRef = useRef(null);
    const peerConnections = useRef({}); // To store RTCPeerConnection for each participant

    useEffect(() => {
        if (!authToken) {
            navigate('/login');
            return;
        }

        fetchMeetingDetails();
        joinMeeting();

        return () => {
            // Clean up WebSocket and media on component unmount
            if (ws.current) {
                ws.current.close();
            }
            leaveMeeting();
            stopLocalStream();
            stopScreenShare();
            closeAllPeerConnections();
        };
    }, [meetingId, authToken]);

    const fetchMeetingDetails = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/meetings/${meetingId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch meeting details');
            }
            const data = await response.json();
            setMeeting(data);
            setParticipants(data.participants.filter(p => !p.left_at)); // Filter active participants

            const currentUserParticipant = data.participants.find(p => p.user_id === user.id);
            if (currentUserParticipant) {
                setLocalParticipant(currentUserParticipant);
                setMicEnabled(currentUserParticipant.has_mic);
                setVideoEnabled(currentUserParticipant.has_video);
                setScreenSharing(currentUserParticipant.is_sharing_screen);
                setHandRaised(currentUserParticipant.hand_raised);
                setThumbsUp(currentUserParticipant.thumbs_up);
            }

        } catch (error) {
            console.error('Error fetching meeting details:', error);
            alert('Error fetching meeting details. Please try again.');
            navigate('/meetings'); // Redirect if meeting details can't be fetched
        }
    };

    const joinMeeting = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/meetings/${meetingId}/join`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to join meeting');
            }
            const data = await response.json();
            setLocalParticipant(data); // Update local participant status from backend
            initializeWebSocket();

        } catch (error) {
            console.error('Error joining meeting:', error);
            alert(`Error joining meeting: ${error.message}`);
            navigate('/meetings');
        }
    };

    const leaveMeeting = async () => {
        try {
            await fetch(`${API_BASE}/api/meetings/${meetingId}/leave`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
        } catch (error) {
            console.error('Error leaving meeting:', error);
        }
    };

    const updateParticipantStatus = async (statusUpdate) => {
        try {
            const response = await fetch(`${API_BASE}/api/meetings/${meetingId}/participants/${user.id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(statusUpdate)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Failed to update status');
            }
            const updatedParticipant = await response.json();
            setLocalParticipant(updatedParticipant); // Update local state based on backend response
            // Also broadcast this change via WebSocket
            if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                ws.current.send(JSON.stringify({
                    type: 'status_update',
                    user_id: user.id,
                    ...statusUpdate
                }));
            }

        } catch (error) {
            console.error('Error updating participant status:', error);
        }
    };

    const initializeWebSocket = () => {
        ws.current = new WebSocket(`${API_BASE.replace('http', 'ws')}/ws/rooms/${meetingId}`);

        ws.current.onopen = () => {
            console.log('WebSocket connected');
            // Announce presence or initial status
            ws.current.send(JSON.stringify({
                type: 'user_joined',
                user_id: user.id,
                name: user.name,
                role: user.role,
                has_mic: micEnabled,
                has_video: videoEnabled,
                is_sharing_screen: screenSharing,
                hand_raised: handRaised,
                thumbs_up: thumbsUp,
            }));
        };

        ws.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            console.log('WebSocket message received:', message);

            if (message.payload) {
                switch (message.payload.type) {
                    case 'user_joined':
                        if (message.payload.user_id !== user.id) {
                            // Add new participant or update existing one
                            setParticipants(prev => {
                                const exists = prev.some(p => p.user_id === message.payload.user_id);
                                if (!exists) {
                                    return [...prev, { ...message.payload, joined_at: new Date().toISOString() }];
                                }
                                return prev; // Participant already in list
                            });
                            // Initiate WebRTC connection with new user
                            handleNewParticipant(message.payload.user_id);
                        }
                        break;
                    case 'user_left':
                        setParticipants(prev => prev.filter(p => p.user_id !== message.payload.user_id));
                        handleParticipantLeft(message.payload.user_id);
                        break;
                    case 'status_update':
                        setParticipants(prev => prev.map(p =>
                            p.user_id === message.payload.user_id ? { ...p, ...message.payload } : p
                        ));
                        // Also update UI for media streams if relevant
                        break;
                    case 'chat_message':
                        setMessages(prev => [...prev, { ...message.payload, timestamp: message.timestamp }]);
                        break;
                    case 'offer':
                        handleOffer(message.payload.user_id, message.payload.offer);
                        break;
                    case 'answer':
                        handleAnswer(message.payload.user_id, message.payload.answer);
                        break;
                    case 'candidate':
                        handleCandidate(message.payload.user_id, message.payload.candidate);
                        break;
                    // Handle other event types like breakout room changes here
                    default:
                        // For now, treat unknown types as chat messages
                        setMessages(prev => [...prev, { content: message.payload.content || JSON.stringify(message.payload), user: 'System', timestamp: message.timestamp }]);
                        break;
                }
            } else if (message.event === 'user_joined' && message.room_id === meetingId) {
                // This is the initial user_joined broadcast from the backend
                console.log('Initial user joined broadcast:', message);
                fetchMeetingDetails(); // Re-fetch to get updated participant list with join/leave status
            }
            else if (message.event === 'user_left' && message.room_id === meetingId) {
                console.log('Initial user left broadcast:', message);
                fetchMeetingDetails(); // Re-fetch to get updated participant list with join/leave status
            }
        };

        ws.current.onclose = () => {
            console.log('WebSocket disconnected');
        };

        ws.current.onerror = (error) => {
            console.error('WebSocket error:', error);
        };
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() && ws.current && ws.current.readyState === WebSocket.OPEN) {
            const messagePayload = {
                type: 'chat_message',
                user_id: user.id,
                user_name: user.name,
                content: newMessage,
                timestamp: new Date().toISOString()
            };
            ws.current.send(JSON.stringify(messagePayload));
            setMessages(prev => [...prev, messagePayload]); // Add to local messages immediately
            setNewMessage('');
        }
    };

    // WebRTC Functions
    const createPeerConnection = (participantId) => {
        const pc = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                // Add more STUN/TURN servers for robustness in production
            ],
        });

        pc.onicecandidate = (event) => {
            if (event.candidate) {
                ws.current.send(JSON.stringify({
                    type: 'candidate',
                    target_user_id: participantId,
                    candidate: event.candidate,
                }));
            }
        };

        pc.ontrack = (event) => {
            console.log('Remote track received:', event.track, 'for participant:', participantId);
            if (remoteVideoRefs.current[participantId]) {
                remoteVideoRefs.current[participantId].srcObject = event.streams[0];
            }
        };

        pc.onconnectionstatechange = () => {
            console.log(`PC for ${participantId} state: ${pc.connectionState}`);
        };

        // Add local tracks if available
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
        }
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(track => pc.addTrack(track, screenStreamRef.current));
        }

        peerConnections.current[participantId] = pc;
        return pc;
    };

    const handleNewParticipant = async (participantId) => {
        const pc = createPeerConnection(participantId);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        ws.current.send(JSON.stringify({
            type: 'offer',
            target_user_id: participantId,
            offer: offer,
        }));
    };

    const handleOffer = async (senderId, offer) => {
        const pc = createPeerConnection(senderId);
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        ws.current.send(JSON.stringify({
            type: 'answer',
            target_user_id: senderId,
            answer: answer,
        }));
    };

    const handleAnswer = async (senderId, answer) => {
        const pc = peerConnections.current[senderId];
        if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
        }
    };

    const handleCandidate = async (senderId, candidate) => {
        const pc = peerConnections.current[senderId];
        if (pc) {
            await pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
    };

    const handleParticipantLeft = (participantId) => {
        if (peerConnections.current[participantId]) {
            peerConnections.current[participantId].close();
            delete peerConnections.current[participantId];
        }
        if (remoteVideoRefs.current[participantId]) {
            remoteVideoRefs.current[participantId].srcObject = null;
        }
    };

    const closeAllPeerConnections = () => {
        for (const id in peerConnections.current) {
            if (peerConnections.current[id]) {
                peerConnections.current[id].close();
            }
        }
        peerConnections.current = {};
    };

    const startLocalStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localVideoRef.current.srcObject = stream;
            localStreamRef.current = stream;
            // Add tracks to all existing peer connections
            for (const id in peerConnections.current) {
                stream.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
                // Need to re-negotiate for new tracks
                createOfferAndSend(id);
            }
        } catch (error) {
            console.error('Error accessing media devices:', error);
        }
    };

    const stopLocalStream = () => {
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach(track => track.stop());
            localVideoRef.current.srcObject = null;
            localStreamRef.current = null;
            // Remove tracks from peer connections (more complex, might require renegotiation or just stopping the track)
            for (const id in peerConnections.current) {
                peerConnections.current[id].getSenders().forEach(sender => {
                    if (sender.track && (sender.track.kind === 'audio' || sender.track.kind === 'video')) {
                        peerConnections.current[id].removeTrack(sender);
                    }
                });
                createOfferAndSend(id);
            }
        }
    };

    const createOfferAndSend = async (targetUserId) => {
        const pc = peerConnections.current[targetUserId];
        if (pc) {
            try {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                ws.current.send(JSON.stringify({
                    type: 'offer',
                    target_user_id: targetUserId,
                    offer: offer,
                }));
            } catch (error) {
                console.error('Error creating and sending offer:', error);
            }
        }
    };

    const toggleMic = async () => {
        const newMicEnabled = !micEnabled;
        setMicEnabled(newMicEnabled);
        await updateParticipantStatus({ has_mic: newMicEnabled });

        if (localStreamRef.current) {
            localStreamRef.current.getAudioTracks().forEach(track => (track.enabled = newMicEnabled));
        }
    };

    const toggleVideo = async () => {
        const newVideoEnabled = !videoEnabled;
        setVideoEnabled(newVideoEnabled);
        await updateParticipantStatus({ has_video: newVideoEnabled });

        if (newVideoEnabled && !localStreamRef.current) {
            await startLocalStream();
        } else if (!newVideoEnabled && localStreamRef.current) {
            localStreamRef.current.getVideoTracks().forEach(track => (track.enabled = false));
            // Optionally, stop stream completely if only video was active
            if (localStreamRef.current.getAudioTracks().length === 0) {
                stopLocalStream();
            }
        } else if (localStreamRef.current) {
            localStreamRef.current.getVideoTracks().forEach(track => (track.enabled = newVideoEnabled));
        }
    };

    const startScreenShare = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            screenStreamRef.current = stream;
            setScreenSharing(true);
            await updateParticipantStatus({ is_sharing_screen: true });

            // Add screen share tracks to all peer connections
            for (const id in peerConnections.current) {
                stream.getTracks().forEach(track => peerConnections.current[id].addTrack(track, stream));
                createOfferAndSend(id); // Re-negotiate
            }

            // When screen share stops (e.g., user clicks stop in browser UI)
            stream.getVideoTracks()[0].onended = () => {
                stopScreenShare();
            };

        } catch (error) {
            console.error('Error starting screen share:', error);
            setScreenSharing(false);
            await updateParticipantStatus({ is_sharing_screen: false });
        }
    };

    const stopScreenShare = async () => {
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach(track => track.stop());
            screenStreamRef.current = null;
            setScreenSharing(false);
            await updateParticipantStatus({ is_sharing_screen: false });

            // Remove screen share tracks from all peer connections
            for (const id in peerConnections.current) {
                peerConnections.current[id].getSenders().forEach(sender => {
                    if (sender.track && sender.track.kind === 'video' && sender.track.label.includes('screen')) {
                        peerConnections.current[id].removeTrack(sender);
                    }
                });
                createOfferAndSend(id); // Re-negotiate
            }
        }
    };

    const toggleScreenShare = async () => {
        if (screenSharing) {
            await stopScreenShare();
        } else {
            await startScreenShare();
        }
    };

    const toggleHandRaise = async () => {
        const newHandRaised = !handRaised;
        setHandRaised(newHandRaised);
        await updateParticipantStatus({ hand_raised: newHandRaised });
    };

    const toggleThumbsUp = async () => {
        const newThumbsUp = !thumbsUp;
        setThumbsUp(newThumbsUp);
        await updateParticipantStatus({ thumbs_up: newThumbsUp });
    };

    // Function to switch rooms
    const switchRoom = async (newRoomId) => {
        if (!authToken) {
            alert('You must be logged in to switch rooms.');
            navigate('/login');
            return;
        }

        // If trying to switch to the same room, do nothing
        if (newRoomId === activeRoom) {
            console.log(`Already in room: ${newRoomId}`);
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/api/meetings/token?room_id=${newRoomId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json();
                // Throw an error to be caught by the catch block
                throw new Error(errorData.detail || `Failed to switch room. Status: ${response.status}`);
            }

            const roomTokenData = await response.json();
            console.log("Successfully switched room, got token: ", roomTokenData);

            // Update local state
            setActiveRoom(newRoomId);
            // You might want to re-initialize WebRTC or WebSocket connections for the new room here.
            // For simplicity, this example assumes the existing WebSocket can handle multiple rooms or is re-initialized.
            // If a new WebSocket connection is needed per room, you'd close the old one and open a new one.
            // For now, we'll just update the active room state.
            alert(`Successfully joined room: ${newRoomId}`);

            // Potentially navigate or update UI to reflect the new room context
            // If the room switch implies a different URL, navigate:
            // navigate(`/meetings/${newRoomId}`);

        } catch (error) {
            console.error('Error switching room:', error);
            alert(`Error: ${error.message}`);
            // If the error is due to authorization, the user might be redirected or shown a specific message.
            // No need to change activeRoom if an error occurred.
        }
    };

    if (!meeting) {
        return <div className="live-meeting-page">Loading meeting...</div>;
    }

    return (
        <div className="live-meeting-page">
            <div className="meeting-header">
                <h1>{meeting.title}</h1>
                <p>Room Code: <strong>{meeting.room_code}</strong></p>
                <button onClick={() => navigate('/meetings')} className="leave-meeting-btn">Leave Meeting</button>
            </div>

            <div className="meeting-layout">
                <div className="main-content">
                    <div className="video-grid">
                        {/* Local Video Stream */}
                        <div className="video-container local-video">
                            <video ref={localVideoRef} autoPlay muted playsInline></video>
                            <div className="participant-name">You ({user.name})</div>
                            <div className="status-icons">
                                {micEnabled ? <span role="img" aria-label="mic-on">🎤</span> : <span role="img" aria-label="mic-off">🔇</span>}
                                {videoEnabled ? <span role="img" aria-label="video-on">📹</span> : <span role="img" aria-label="video-off">📷</span>}
                                {screenSharing && <span role="img" aria-label="screen-share">🖥️</span>}
                                {handRaised && <span role="img" aria-label="hand-raised">✋</span>}
                                {thumbsUp && <span role="img" aria-label="thumbs-up">👍</span>}
                            </div>
                        </div>

                        {/* Remote Video Streams */}
                        {participants.map(p => p.user_id !== user.id && (
                            <div key={p.user_id} className="video-container remote-video">
                                <video
                                    ref={el => (remoteVideoRefs.current[p.user_id] = el)}
                                    autoPlay
                                    playsInline
                                ></video>
                                <div className="participant-name">{p.user_name || `User ${p.user_id}`} ({p.role})</div>
                                <div className="status-icons">
                                    {p.has_mic ? <span role="img" aria-label="mic-on">🎤</span> : <span role="img" aria-label="mic-off">🔇</span>}
                                    {p.has_video ? <span role="img" aria-label="video-on">📹</span> : <span role="img" aria-label="video-off">📷</span>}
                                    {p.is_sharing_screen && <span role="img" aria-label="screen-share">🖥️</span>}
                                    {p.hand_raised && <span role="img" aria-label="hand-raised">✋</span>}
                                    {p.thumbs_up && <span role="img" aria-label="thumbs-up">👍</span>}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="meeting-controls">
                        <button onClick={toggleMic} className={micEnabled ? 'control-btn active' : 'control-btn'}>
                            {micEnabled ? 'Mute Mic' : 'Unmute Mic'}
                        </button>
                        <button onClick={toggleVideo} className={videoEnabled ? 'control-btn active' : 'control-btn'}>
                            {videoEnabled ? 'Stop Video' : 'Start Video'}
                        </button>
                        <button onClick={toggleScreenShare} className={screenSharing ? 'control-btn active' : 'control-btn'}>
                            {screenSharing ? 'Stop Share' : 'Share Screen'}
                        </button>
                        <button onClick={toggleHandRaise} className={handRaised ? 'control-btn active' : 'control-btn'}>
                            {handRaised ? 'Lower Hand' : 'Raise Hand'} ✋
                        </button>
                        {(user.role === 'admin' || user.role === 'mentor' || user.role === 'intern') && (
                            <button onClick={toggleThumbsUp} className={thumbsUp ? 'control-btn active' : 'control-btn'}>
                                {thumbsUp ? 'Thumbs Down' : 'Thumbs Up'} 👍
                            </button>
                        )}
                    </div>
                </div>

                <div className="sidebar">
                    <div className="chat-section">
                        <h2>Chat</h2>
                        <div className="chat-messages">
                            {messages.map((msg, index) => (
                                <div key={index} className={`chat-message ${msg.user_id === user.id ? 'my-message' : ''}`}>
                                    <strong>{msg.user_name || 'System'}:</strong> {msg.content}
                                    <span className="timestamp">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleSendMessage} className="chat-input-form">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                            />
                            <button type="submit">Send</button>
                        </form>
                    </div>

                    {(user.role === 'admin' || user.role === 'mentor') && ( // Only Admin/Mentor can manage breakout rooms
                        <div className="breakout-room-section">
                            <h2>Breakout Rooms</h2>
                            {meeting.breakout_rooms.length === 0 ? (
                                <p>No breakout rooms created.</p>
                            ) : (
                                <ul className="breakout-room-list">
                                    {meeting.breakout_rooms.map(room => (
                                        <li key={room.id} className="breakout-room-item">
                                            <strong>{room.name}</strong> ({room.sub_room_code})
                                            <p>Participants: {room.participants.length}</p>
                                            {/* Implement join/assign logic here */}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {/* Add functionality to create new breakout rooms */}
                            <button className="create-breakout-btn">Create Breakout Room</button>
                        </div>
                    )}

                    <div className="channels-section">
                        <h2>Channels</h2>
                        <ul className="channel-list">
                            <li className="channel-item" onClick={() => switchRoom('main-meeting')} style={{ fontWeight: activeRoom === 'main-meeting' ? 'bold' : 'normal' }}>
                                Main Meeting
                            </li>
                            <li className="channel-item" onClick={() => switchRoom('team-alpha')} style={{ fontWeight: activeRoom === 'team-alpha' ? 'bold' : 'normal' }}>
                                Team Alpha
                            </li>
                            <li className="channel-item" onClick={() => switchRoom('team-beta')} style={{ fontWeight: activeRoom === 'team-beta' ? 'bold' : 'normal' }}>
                                Team Beta
                            </li>
                            <li className="channel-item" onClick={() => switchRoom('team-gamma')} style={{ fontWeight: activeRoom === 'team-gamma' ? 'bold' : 'normal' }}>
                                Team Gamma
                            </li>
                            <li className="channel-item" onClick={() => switchRoom('team-delta')} style={{ fontWeight: activeRoom === 'team-delta' ? 'bold' : 'normal' }}>
                                Team Delta
                            </li>
                            <li className="channel-item" onClick={() => switchRoom('mentor-room')} style={{ fontWeight: activeRoom === 'mentor-room' ? 'bold' : 'normal' }}>
                                Mentor Room 🔒
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveMeetingPage;

