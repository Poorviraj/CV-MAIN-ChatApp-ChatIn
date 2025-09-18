const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Parse query params
const query = Qs.parse(location.search, { ignoreQueryPrefix: true });
let { username, room, customRoom } = query;

// If custom room provided, override predefined room
if (customRoom && customRoom.trim() !== '') {
   room = customRoom.trim();
}

// Validation: make sure we have a room
if (!room || room.trim() === '') {
   alert("⚠️ You must select a predefined room or enter a custom room name.");
   window.location.href = "index.html";
}

const socket = io();

// Join room
socket.emit('joinRoom', { username, room });

// Get room and users
socket.on('roomUsers', ({ room, users }) => {
   outputRoomName(room);
   outputUsers(users);
});

// Listen for messages
socket.on('message', (message) => {
   outputMessage(message);

   // Scroll down
   chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', (e) => {
   e.preventDefault();

   // Get message text
   const msg = e.target.elements.msg.value;

   // Emit message to server
   socket.emit('chatMessage', msg);

   // Clear input
   e.target.elements.msg.value = '';
   e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
   const div = document.createElement('div');
   div.classList.add('message');
   div.innerHTML = `
      <p class="meta">${message.username} <span>${message.time}</span></p>
      <p class="text">${message.text}</p>
   `;
   document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
   roomName.innerHTML = room;
}

// Add users to DOM
function outputUsers(users) {
   userList.innerHTML = `
      ${users.map((user) => `<li>${user.username}</li>`).join('')}
   `;
}
