export const mockInterns = [
  { id: 1, name: 'Tobi', role: 'Intern', online: true, room: 'Team Alpha', micOn: true, camOn: false, avatar: 'T' },
  { id: 2, name: 'Rahul', role: 'Intern', online: true, room: 'Team Alpha', micOn: false, camOn: true, avatar: 'R' },
  { id: 3, name: 'Priya', role: 'Intern', online: true, room: 'Team Alpha', micOn: true, camOn: true, avatar: 'P' },
  { id: 4, name: 'Sarah', role: 'Intern', online: true, room: 'Team Alpha', micOn: false, camOn: false, avatar: 'S' },
  { id: 5, name: 'Alex', role: 'Intern', online: false, room: 'Team Beta', micOn: false, camOn: false, avatar: 'A' },
  { id: 6, name: 'John', role: 'Intern', online: true, room: 'Team Gamma', micOn: true, camOn: true, avatar: 'J' },
  { id: 7, name: 'Karan', role: 'Intern', online: true, room: 'Team Beta', micOn: true, camOn: false, avatar: 'K' },
  { id: 8, name: 'Meera', role: 'Intern', online: true, room: 'Main Meeting', micOn: false, camOn: false, avatar: 'M' },
  { id: 9, name: 'David', role: 'Intern', online: false, room: 'Main Meeting', micOn: false, camOn: false, avatar: 'D' },
];

export const mockMentor = { id: 10, name: 'Ananya', role: 'Mentor', online: true, room: 'Main Meeting', micOn: false, camOn: true, avatar: 'An' };

export const mockRooms = [
  { id: 'main', name: 'Main Meeting', type: 'main' },
  { id: 'alpha', name: 'Team Alpha', type: 'breakout' },
  { id: 'beta', name: 'Team Beta', type: 'breakout' },
  { id: 'gamma', name: 'Team Gamma', type: 'breakout' },
  { id: 'delta', name: 'Team Delta', type: 'breakout' },
  { id: 'mentor', name: 'Mentor Room', type: 'locked' },
];

export const mockChatMessages = [
  { id: 1, author: 'Priya', time: '10:45 AM', text: "Let's finalize the presentation." },
  { id: 2, author: 'Rahul', time: '10:46 AM', text: "I will handle the architecture slide." },
  { id: 3, author: 'Tobi', time: '10:47 AM', text: "I'll complete the UI section." },
];
