<br/>
<div align="center">
  <h1 align="center">LinkUp 🎥</h1>
  <p align="center">
    A Full-Stack MERN Video Conferencing Application with WebRTC & Socket.io
    <br />
    <br />
    <a href="#1-project-overview">Overview</a> ·
    <a href="#2-features">Features</a> ·
    <a href="#13-installation-guide">Installation</a> ·
    <a href="#11-api-endpoints">API Docs</a>
  </p>
</div>

---

## 1. Project Overview

**LinkUp** is a powerful, full-stack video conferencing application designed to bring people together seamlessly. Built on the MERN stack (MongoDB, Express.js, React, Node.js) and powered by **WebRTC** and **Socket.io**, LinkUp provides high-quality, real-time peer-to-peer audio and video communication with minimal latency. It solves the problem of remote communication by offering built-in chat, strict host controls, and secure authentication, ensuring safe and manageable digital meetings for personal and professional use.

## 2. Features

- **Real-Time Video & Audio Calling**: Low-latency communication established via WebRTC.
- **Persistent Text Chat**: In-meeting group chat functionality.
- **Secure Authentication**: JWT-based user registration, login, and protected routes.
- **Meeting Management**: Create instant meetings, join via meeting IDs, and track meeting histories.
- **Comprehensive Host Controls**: 
  - Restrict access with a "Waiting for Host" lobby.
  - Force mute specific participants.
  - Remove/kick users from the active room.
  - End the meeting for all participants.
- **Interactive UI**: Fluid animations, dark/light theme support, and responsive design.

---

## 3. Tech Stack

### **Frontend**
- **React 19**: Modern UI component library.
- **Vite**: Blazing fast frontend build tool.
- **Tailwind CSS 4**: Utility-first styling framework.
- **Redux Toolkit**: Centralized application state management.
- **Shadcn UI & Radix UI**: Accessible, premium pre-built components.
- **Framer Motion**: Complex interactive UI animations.
- **Socket.io-client**: Bi-directional event communication.
- **Simple-Peer**: Abstraction over WebRTC for peer-to-peer data and media streaming.

### **Backend**
- **Node.js & Express.js**: High-performance backend routing and logic.
- **MongoDB & Mongoose**: NoSQL database and Object Data Modeling (ODM).
- **Socket.io**: Real-time WebSocket server.
- **JWT (JSON Web Tokens)**: Secure HTTP authentication.
- **Bcrypt.js**: Cryptographic password hashing.

---

## 4. Architecture

LinkUp employs a decoupled client-server architecture focusing on high-speed real-time data delivery:

- **React Frontend**: Handles all user interactions, video rendering, and state via Redux. It captures local media streams (camera/mic) and renders remote streams.
- **Express Backend**: Exposes basic REST APIs for User management and Meeting records, returning JSON responses.
- **MongoDB Database**: Stores persistent data: User profiles, Meeting logs, and Chat History.
- **Socket.io Signaling**: Acts as the signaling server. It only transmits connection negotiation data (SDP and ICE candidates) and room state data (who is in which room, who muted).
- **WebRTC (Peer-to-Peer)**: Once signaling is complete, WebRTC establishes direct routes between clients. Audio, video, and large data streams travel directly from browser to browser, bypassing the server entirely to ensure zero lag and high privacy.

---

## 5. WebRTC Flow

The establishment of video calls follows a strict signaling process:

1. **Local Media Capture**: Client requests access to microphone and camera via `navigator.mediaDevices.getUserMedia`.
2. **Room Entry**: Client emits a `join room` event to the server.
3. **Fetching Peers**: Server responds with an `all users` event containing socket IDs of everyone currently in the room.
4. **Initiating Connections**: The new user loops over existing users and creates an **initiator** `Peer` (via `simple-peer`) for each. 
5. **Sending Signals**: The initiator generates a WebRTC offer (SDP signal) and emits it to the server via `sending signal`.
6. **Receiving & Answering**: The server relays `user joined` to existing clients, who then generate an **answering** `Peer` and emit their response via `returning signal`.
7. **Connection Established**: The new user processes the `receiving returned signal`. The peer-to-peer data channel is completed, and `stream` events fire locally to render video `<video>` tags.

---

## 6. Real-Time Communication

Socket.io manages essential non-media functionality:
- **Meeting Rooms**: By calling `socket.join(roomID)`, Socket.io logically groups users. Any emit to that room only touches the relevant participants.
- **Signaling**: Passing SDP tokens and ICE candidates reliably to bypass NATs/Firewalls.
- **Chat**: Real-time broadcast of messages without needing to poll a backend database. `sendMessage` events are bounced immediately to the room via `receiveMessage`.
- **Participant Updates**: As users toggle their camera or microphone, `media-update` events notify the room to update UI icons instantly.

---

## 7. Authentication System

Security is managed via **JWT Authentication**:
- **Registration**: User passwords are salted and hashed via `bcryptjs` before entering the MongoDB.
- **Login**: Upon identity verification, the server issues a signed JWT containing the user's ID payload.
- **Protected Routes**: A custom Express middleware (`protect`) intercepts requests to secure endpoints (e.g., getting user profile, creating a meeting). It decodes the JWT to ensure authenticity. The frontend uses React Router to protect private views (e.g., Dashboard).

---

## 8. Meeting Management

- **Creation**: Authenticated users can hit `/api/meetings/create` to generate a unique meeting instance in the database, setting themselves as the "host".
- **Joining**: Anyone with a Meeting ID can attempt to join. The client validates the ID against the backend.
- **Lobby Phase**: If the host is not present in the room, participants are placed in a waiting state (`waiting-for-host` socket event).

---

## 9. Host Controls

Hosts maintain absolute control over their created meeting rooms via specialized Socket events verified against the host's active Socket ID:
- **Muting**: `host-force-mute` triggers the targeted participant's client to disable local audio tracks.
- **Removing Users**: `host-remove-user` kicks the offender out of the WebRTC mesh and redirects them to the home page.
- **Ending Meeting**: `host-end-meeting` completely dismantles the room. All active connections are severed, everyone is redirected, and the room record on the Node memory map is wiped.

---

## 10. Project Folder Structure

```
LinkUp
├── client/
│   ├── src/
│   │   ├── api/          # Axios interceptors and API service calls
│   │   ├── assets/       # Static files (images, SVGs)
│   │   ├── common/       # Shared utility styles/configs
│   │   ├── components/   # Reusable UI components (Buttons, Modals, etc)
│   │   ├── layouts/      # High-level wrapper components
│   │   ├── lib/          # Helper libraries (e.g., Shadcn utilities)
│   │   ├── pages/        # Main route views (Home, Login, MeetingRoom)
│   │   ├── router/       # React Router DOM configurations
│   │   ├── slices/       # Redux Toolkit state slices
│   │   └── store/        # Redux Store configuration
│   └── package.json
│
└── server/
    ├── middlewere/       # Express middlewares (Auth protect)
    ├── models/           # Mongoose Database Schemas (User, Meeting, Chat)
    ├── routes/           # Express REST API endpoint definitions
    ├── server.js         # Entry point, Express App, and Socket.io controller
    ├── vercel.json       # Deployment configuration
    └── package.json
```

---

## 11. API Endpoints

### Auth Routes (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `POST` | `/register` | Create a new user account | No |
| `POST` | `/login` | Authenticate user and receive JWT | No |
| `GET` | `/me` | Get currently logged-in user profile | Yes |

### Meeting Routes (`/api/meetings`)
| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `POST` | `/create` | Generate a new meeting room | Yes |
| `POST` | `/join` | Validate a meeting link | Optional |
| `POST` | `/end` | Log the meeting as terminated | Yes |
| `POST` | `/leave` | Process a participant leaving | No |
| `GET` | `/:id` | Fetch specific meeting details | No |

### Chat Routes (`/api/chat`)
| Method | Endpoint | Description | Auth Required |
| --- | --- | --- | --- |
| `POST` | `/history` | Fetch persistent chat logs for a room | No |

---

## 12. Socket Events

### **Client emits to Server**
- `join room` : User initiates entry into a meeting.
- `sending signal` : Sends WebRTC offer to another specific peer.
- `returning signal` : Sends WebRTC answer back to the offerer.
- `sendMessage` : Broadcasts text chat to the room.
- `media-update` : Announces mute/unmute or cam on/off state.
- `host-force-mute` : Host commands another user to mute.
- `host-remove-user` : Host commands a user disconnect.
- `host-end-meeting` : Host dismantles the room.
- `leave room` / `disconnect` : Cleans up peer references.

### **Server emits to Client**
- `room full` : Rejects user if room is fully occupied.
- `host-joined` : Notifies waiting users that the host arrived.
- `waiting-for-host` : Instructs user to wait in lobby.
- `all users` : Passes all current occupant IDs to the new user.
- `new participant` : Alerts the room of an arrival.
- `user joined` : Relays WebRTC offer to the specific target.
- `receiving returned signal` : Relays WebRTC answer back to the initiator.
- `receiveMessage` : Pushes a new chat payload to everyone.
- `force-mute` : Specifically forces matched client to drop audio tier.
- `removed-by-host` : Forces targeted client to tear down and navigate away.
- `meeting-ended` : Forces everyone to tear down and navigate away.

---

## 13. Installation Guide

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Database (Local or MongoDB Atlas)

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/LinkUp.git
cd LinkUp
```

### 2. Setup Backend Component
```bash
cd server
npm install
```

### 3. Setup Frontend Component
```bash
cd ../client
npm install
```

---

## 14. Environment Variables

Create `.env` files in both the client and server directories:

**`/server/.env`**
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/LinkUp
JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173
```

**`/client/.env`** *(Vite syntax)*
```env
VITE_BACKEND_URL=http://localhost:5000
```

---

## 15. Running the Application

For a fluid development experience, run the frontend and backend concurrently.

**Run Backend (Terminal 1)**
```bash
cd server
npm run dev
# Server running on http://localhost:5000
```

**Run Frontend (Terminal 2)**
```bash
cd client
npm run dev
# Frontend running on http://localhost:5173
```

---

## 16. Deployment

- **Backend (Render / Railway / Vercel)**: 
  You can deploy the server seamlessly using Vercel (using the included `vercel.json`) or platforms like Render. Make sure to define `CLIENT_URL` correctly in production to avoid CORS errors.
  
- **Frontend (Vercel / Netlify)**:
  Connect your GitHub repo to Vercel, assign the build command `npm run build` and output directory `dist`. Remember to embed your deployed backend URL into `VITE_BACKEND_URL`.

---

## 17. Screenshots Section

*(Replace placeholders with actual project screenshots)*

| Home Page | Meeting Room |
| :---: | :---: |
| ![Home Page](https://via.placeholder.com/400x250?text=Home+Dashboard) | ![Meeting Room](https://via.placeholder.com/400x250?text=Active+Video+Call) |

| Waiting For Host | Host Controls |
| :---: | :---: |
| ![Waiting For Host](https://via.placeholder.com/400x250?text=Lobby+View) | ![Host Controls](https://via.placeholder.com/400x250?text=Mute/Kick+Actions) |

---

## 18. Future Improvements

While LinkUp is robust, there is always room to scale:
1. **Screen Sharing Capability**: Integrating desktop media tracking.
2. **Cloud Recording**: Back-end media stitching to record sessions.
3. **Background Blur/Replacement**: Using Canvas/WebAI APIs for privacy.
4. **Pagination for Chat**: Handling massive active text hubs lazily.
5. **Breakout Rooms**: Sub-channels divided dynamically by the host.

---

## 19. Contribution Guide

We love contributions! To contribute:

1. Forge the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a formal **Pull Request**.

Please ensure your code follows the existing style, clears the linter (`npm run lint`), and preserves the socket state integrity.

---

## 20. License

This project is licensed under the **ISC License**. 

```text
Copyright (c) 2024, LinkUp Contributors

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.
```
