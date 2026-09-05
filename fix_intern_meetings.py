import os
import re

filepath = "frontend/src/pages/Dashboard/InternDashboard.jsx"
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Add import for api
if 'import api from "../../api/axios";' not in content:
    content = content.replace('import { useState, useEffect } from "react";', 'import { useState, useEffect } from "react";\nimport api from "../../api/axios";')

# Add state for meetings
meeting_state = """
  // Live Meeting State
  const [meetings, setMeetings] = useState([]);
  
  useEffect(() => {
    const fetchUpcomingMeetings = async () => {
      try {
        const response = await api.get('/api/meetings');
        setMeetings(response.data);
      } catch (error) {
        console.error("Failed to fetch meetings:", error);
      }
    };
    fetchUpcomingMeetings();
    // Optional refresh interval
    const interval = setInterval(fetchUpcomingMeetings, 30000);
    return () => clearInterval(interval);
  }, []);
"""

content = content.replace("// Live Meeting State", meeting_state)

# Replace the hardcoded table with dynamic mappings
table_block_pattern = re.compile(r'<h3>Upcoming Live Mentoring Calls</h3>.*?</tbody>\s*</table>\s*</div>', re.DOTALL)

dynamic_table = """<h3>Upcoming Live Mentoring Calls</h3>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Topic</th>
                      <th>Scheduled Time</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meetings.length > 0 ? meetings.map((meeting) => (
                      <tr key={meeting.id}>
                        <td>{meeting.title}</td>
                        <td>{new Date().toLocaleDateString()} (Active)</td>
                        <td>
                          <button onClick={() => {
                            setActiveMeetingRoom(meeting.room_code);
                            setIsMeetingActive(true);
                            setIsMeetingMinimized(false);
                          }} className="btn btn-primary" style={{ padding: "4px 8px", fontSize: "12px" }}>Join</button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="3" style={{textAlign: 'center'}}>No upcoming meetings</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>"""

content = table_block_pattern.sub(dynamic_table, content)

# Check if we need to remove the handleJoinMeeting validation since now we can join actual DB meetings
content = content.replace("""const isMeetingRunning = localStorage.getItem("breakout_meeting_active") === "true";
    if (!isMeetingRunning) {
      alert("The mentor has not started this breakout meeting yet. Please try again once the meeting has commenced.");
      return;
    }""", "")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated InternDashboard to fetch live meetings")
