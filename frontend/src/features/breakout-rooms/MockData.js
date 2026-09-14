export const mockInterns = [
  { id: 1, name: 'John Doe (You)', role: 'Intern', online: true, room: 'Main Meeting', micOn: true, camOn: true, avatar: 'JD' },
  { id: 2, name: 'Tobi', role: 'Intern', online: true, room: 'Main Meeting', micOn: true, camOn: false, avatar: 'T' },
  { id: 3, name: 'Rahul', role: 'Intern', online: true, room: 'Main Meeting', micOn: false, camOn: true, avatar: 'R' },
  { id: 4, name: 'Priya', role: 'Intern', online: true, room: 'Main Meeting', micOn: true, camOn: true, avatar: 'P' },
  { id: 5, name: 'Sarah', role: 'Intern', online: true, room: 'Main Meeting', micOn: false, camOn: false, avatar: 'S' },
  { id: 6, name: 'Alex', role: 'Intern', online: true, room: 'Main Meeting', micOn: false, camOn: false, avatar: 'A' },
  { id: 7, name: 'Karan', role: 'Intern', online: true, room: 'Main Meeting', micOn: true, camOn: false, avatar: 'K' },
  { id: 8, name: 'Meera', role: 'Intern', online: true, room: 'Main Meeting', micOn: false, camOn: false, avatar: 'M' },
  { id: 9, name: 'David', role: 'Intern', online: false, room: 'Main Meeting', micOn: false, camOn: false, avatar: 'D' },
];

export const mockMentor = { id: 10, name: 'Ananya', role: 'Mentor', online: true, room: 'Main Meeting', micOn: false, camOn: true, avatar: 'An' };

export const mockRooms = [
  { id: 'main', name: 'Main Meeting', type: 'main' },
];

export const mockChatMessages = [
  { id: 1, author: 'Priya', time: '10:45 AM', text: "Welcome everyone to the main standup!" },
  { id: 2, author: 'Ananya (Mentor)', time: '10:46 AM', text: "Let's review today's objectives before splitting into breakout rooms." },
];
