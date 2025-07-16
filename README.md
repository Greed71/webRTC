# WebRTC Video Chat Room

A real-time peer-to-peer video chat application built with WebRTC, Node.js, and WebSocket.

## 🚀 Features

- **Real-time video chat** between two peers
- **Integrated text chat**
- **Video and audio controls** (mute/unmute)
- **Intuitive and responsive** web interface
- **Direct peer-to-peer connection** using WebRTC
- **Room management** with custom names
- **Debug console** to monitor WebRTC status

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6 Modules)
- **Backend**: Node.js, Express.js
- **WebRTC**: For peer-to-peer communication
- **WebSocket**: For signaling between clients
- **STUN Server**: Google STUN servers for NAT traversal

## 📋 Prerequisites

- Node.js (version 14 or higher)
- npm (Node Package Manager)
- Modern browser with WebRTC support (Chrome, Firefox, Safari, Edge)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Greed71/webRTC.git
   cd webRTC
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   node app.js
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

## 🎮 How to Use

### Creating a Room
1. Open the application in your browser
2. Enter a channel/room name
3. Click **"Create"** to create a new room

### Joining a Room
1. Open the application in another tab/browser/device
2. Enter the same channel name
3. Click **"Join"** to join the room

### During Video Chat
- **📹 Toggle Video**: Turn your camera on/off
- **🎤 Toggle Audio**: Turn your microphone on/off
- **Chat**: Use text chat to communicate
- **Exit Room**: Leave the current room
- **Destroy Room**: Completely delete the room

## 📁 Project Structure

```
webRTC/
├── app.js                 # Express server with WebSocket
├── constants.js           # Shared server-side constants
├── package.json           # Project dependencies
├── public/
│   ├── index.html         # Main user interface
│   ├── main.js            # Main client-side script
│   ├── style.css          # CSS styles
│   └── modules/
│       ├── ajax.js        # HTTP request handling
│       ├── constants.js   # Client-side constants
│       ├── state.js       # Application state management
│       ├── uiUtils.js     # User interface utilities
│       ├── webRTCHandler.js # Main WebRTC logic
│       └── ws.js          # Client-side WebSocket handling
└── README.md              # This file
```

## 🔧 API Endpoints

### POST `/create-room`
Creates a new video chat room.

**Body:**
```json
{
  "roomName": "room-name",
  "userId": "unique-user-id"
}
```

**Success Response:**
```json
{
  "data": {
    "type": "ROOM_CREATE_SUCCESS",
    "message": "Room created successfully"
  }
}
```

## 🌐 WebSocket Events

### Client → Server Events
- `ROOM_JOIN_REQUEST`: Request to join a room
- `WEBRTC_OFFER`: Send WebRTC offer
- `WEBRTC_ANSWER`: Send WebRTC answer
- `ICE_CANDIDATE`: Send ICE candidates

### Server → Client Events
- `ROOM_JOIN_SUCCESS/FAILURE`: Result of joining the room
- `PEER_CONNECTION_REQUEST`: Peer connection request
- `WEBRTC_OFFER/ANSWER`: WebRTC message forwarding
- `ICE_CANDIDATE`: ICE candidate forwarding

## 🔍 Debug and Monitoring

The application includes an integrated debug console that shows:
- Unique session ID
- Real-time WebRTC events
- Connection status
- Error and success messages

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

## 📝 TODO / Future Improvements

- [ ] Support for more than two users per room
- [ ] Chat recording and saving
- [ ] Screen sharing
- [ ] Video filters and effects
- [ ] User authentication
- [ ] Persistent rooms
- [ ] Push notifications
- [ ] Improved mobile responsiveness

## 🐛 Known Issues

- Connection may fail behind some corporate firewalls
- Additional TURN servers may be needed on some networks
- Video quality depends on available bandwidth

## 📞 Browser Support

| Browser | Minimum Version | Support |
|---------|----------------|----------|
| Chrome  | 56+            | ✅ Full |
| Firefox | 44+            | ✅ Full |
| Safari  | 11+            | ✅ Full |
| Edge    | 79+            | ✅ Full |

## 📄 License

This project is released under the ISC license. See the `package.json` file for details.

## 👨‍💻 Author

**Greed71** - [GitHub Profile](https://github.com/Greed71)

---

⭐ If this project was helpful to you, please give it a star on GitHub!

## 🔗 Useful Links

- [WebRTC MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [Express.js Documentation](https://expressjs.com/)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)
