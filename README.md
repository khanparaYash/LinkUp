<br/>
<div align="center">
  <h1 align="center">LinkUp 🎥</h1>
  <p align="center">
    A Full-Stack MERN Video Conferencing & Live Streaming Application
    <br />
    <br />
    <a href="#1-project-overview">Overview</a> ·
    <a href="#2-features">Features</a> ·
    <a href="#3-core-working-flows">Workflows</a> ·
    <a href="#4-installation-guide">Installation</a> ·
    <a href="#5-api-socket-reference">API Docs</a>
  </p>
</div>

---

## 1. Project Overview

**LinkUp** is a powerful, full-stack video conferencing application designed for low-latency, peer-to-peer audio and video communication. Built on the **MERN stack** (MongoDB, Express.js, React, Node.js) and powered by **WebRTC**, **Socket.io**, and **FFmpeg**, LinkUp allows users to host robust video meetings from the browser. 

Recently infused with RTMP capabilities, LinkUp now supports **live broadcasting directly to YouTube**, compositing multiple peers' video and audio on the fly directly from the client's browser, and forwarding it via server-side FFmpeg processing.

## 2. Features

- **Real-Time Video & Audio Calling**: Low-latency mesh P2P network established via WebRTC.
- **YouTube Live Streaming Integration**: Server-side RTMP broadcasting directly to YouTube using client-side grid mixing and media recording.
- **Screen Sharing**: Effortlessly share browser tabs, windows, or entire screens during meetings.
- **Comprehensive Host Controls**: Waiting room, force mute, participant kick, and absolute meeting termination.
- **Persistent Text Chat**: In-meeting group chat functionality saved in the database.
- **Secure Authentication**: JWT-based user registration, login, and secured APIs.
- **Interactive UI**: Fluid animations, dark/light theme support, and responsive shadcn UI design.

---

## 3. Core Working Flows

LinkUp's architecture is event-driven and decoupled, separating pure API logic from intensive Real-Time functionalities. The core workflows that make up the system include:

### 3.1 Authentication & Security Flow
1. **Registration & Passwords**: Users sign up; passwords are cryptographically hashed using `bcryptjs` before hitting MongoDB.
2. **Login & Token Issuance**: Successfully verified credentials return a signed **JWT (JSON Web Token)** payload.
3. **Protected Routes**: Custom Express middleware intercepts protected API calls (like meeting creation). If valid, user context is attached; if invalid, it rejects with a 401.

### 3.2 Meeting Management & Pre-Join Flow
1. **Creation**: An authenticated user creates a room via REST (`/api/meetings/create`), making them the official host.
2. **Joining & Device validation**: When a user clicks join, their device generates a unique UUID (DeviceID). The socket connection checks for redundant DeviceIDs in the same room. If detected, the older socket is kicked to prevent echoes and double participations.
3. **Waiting Room Lobby**: If a participant joins before the host, the server places them in a "Waiting for Host" state by emitting `waiting-for-host`. They are granted entry upon the host emitting `host-joined`.

### 3.3 WebRTC Signaling & P2P Media Flow
To establish video calls without routing media through a central server, strict WebRTC signaling occurs:
1. **Local Capture**: Client invokes `navigator.mediaDevices.getUserMedia` for mic/cam access.
2. **Room Registration**: Client emits `join room` to the Socket.io Node server.
3. **Participant Discovery**: The server responds with `all users`, a list of everyone currently active.
4. **Peer Connection Initiation**: The client loops through participants, creating an **initiator** `simple-peer` instance for each, generating an SDP Offer.
5. **Signaling Exchange**: 
   - Initiator emits `sending signal` to the server.
   - Server routes offering to target via `user joined`.
   - Target responds, generating an SDP Answer and emitting `returning signal`.
   - Server routes the answer back to the initiator via `receiving returned signal`.
6. **Direct Connection**: The SDPs are resolved, NATs are traversed via ICE, and the P2P pipeline opens. The `stream` event brings the `<video>` elements to life.

### 3.4 YouTube Live Streaming (RTMP) Flow
LinkUp features a state-of-the-art live broadcasting engine to push meetings to YouTube:
1. **Canvas & Audio Mixing (Grid Compositor)**: The host selects peers. A hidden HTML5 `<canvas>` calculates a dynamic layout grid and draws the incoming `<video>` streams in real-time. The Web Audio API simultaneously connects their audio tracks to a single `MediaStreamDestination`.
2. **Chunking**: A `MediaRecorder` takes this composited WebM MediaStream and chunks it continuously on a 2000ms interval.
3. **WebSocket Transmission**: Binary chunks are immediately emitted to the Node server via the `stream-data` socket event.
4. **Server FFmpeg Transcoding**: The backend spawns an `ffmpeg` child process connected via standard input (`stdin`). It ingests the WebM array buffers, transcodes video to `libx264` and audio to `aac` to meet YouTube requirements.
5. **RTMP Push**: FFmpeg natively pushes the FLV transcoded stream to the specified YouTube RTMP Ingest URL using the Host's Stream Key.

### 3.5 Screen Sharing Flow
1. **Capture**: Client requests `navigator.mediaDevices.getDisplayMedia`.
2. **Track Replacement**: Instead of renegotiating the entire SDP pipeline, LinkUp iterates through all active `peerConnection` senders and dynamically swaps the user’s camera video track with the newly acquired screen video track.
3. **Termination**: Upon stopping, the system retrieves the standard `getUserMedia` camera feed and swaps the tracks back.

### 3.6 Host Control Flow
Hosts have elevated privileges validated securely on the socket server:
- **Muta/Kick**: Emitting `host-force-mute` or `host-remove-user` with a target ID. The server verifies if the requester's socket ID matches the room's host mapping. If so, instructions are pushed exclusively to the targeted client to drop tracks or redirect home.
- **End Meeting**: `host-end-meeting` shuts down the RTMP ffmpeg processes, severs all socket connections mapping to the room, and flushes the data footprint from node's memory map.

---

## 4. Installation Guide

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB Database (Local or MongoDB Atlas)
- FFmpeg installed locally (Required for the backend)

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

### Environment Variables
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
VITE_BACKEND=http://localhost:5000
```

### Running the Application

**Terminal 1 (Backend Server)**
```bash
cd server
npm run dev
# Server running on http://localhost:5000
```

**Terminal 2 (React Frontend)**
```bash
cd client
npm run dev
# Frontend running on http://localhost:5173
```

---

## 5. API & Socket Reference

### REST Endpoints
| Context | Method | Endpoint | Description |
| --- | --- | --- | --- |
| **Auth** | `POST` | `/api/auth/register` | Create a new user account |
| **Auth** | `POST` | `/api/auth/login` | Authenticate user and receive JWT |
| **Auth** | `GET` | `/api/auth/me` | Get currently logged-in user profile (Protected) |
| **Meeting** | `POST` | `/api/meetings/create` | Generate a new meeting room (Protected) |
| **Meeting** | `GET` | `/api/meetings/:id` | Fetch specific meeting details |
| **Chat** | `POST` | `/api/chat/history` | Fetch persistent chat logs for a room |

### Socket.io Events
- **Connections & Rooms**: `join room`, `leave room`, `all users`, `user joined`, `participant left`, `disconnect`.
- **Signaling**: `sending signal`, `returning signal`, `receiving returned signal`.
- **Media Status**: `media-update`, `participant-media-update`.
- **Host Settings**: `host-joined`, `host-left`, `waiting-for-host`, `host-remove-user`, `removed-by-host`, `host-force-mute`, `force-mute`, `host-end-meeting`, `meeting-ended`.
- **Live Stream Engine**: `start-live-stream`, `stream-data`, `stop-live-stream`, `live-stream-started`, `live-stream-stopped`.
- **Chat Engine**: `sendMessage`, `receiveMessage`.

---

## 6. Project Architecture Structure

```
LinkUp
├── client/
│   ├── src/
│   │   ├── api/          # Axios interceptors and API service calls
│   │   ├── components/   # Reusable UI components (Buttons, Modals, Shadcn)
│   │   ├── pages/        # Main route views (Home, Login, MeetingRoom)
│   │   └── ...           # Libs, Store, Assets 
│   └── package.json
│
└── server/
    ├── ffmpeg/           # FFmpeg executable pathing
    ├── middlewere/       # Express middlewares (Auth protect)
    ├── models/           # Mongoose Database Schemas (User, Meeting, Chat)
    ├── routes/           # Express REST API endpoint definitions
    ├── server.js         # Entry point, Express App, and Socket.io controller
    └── package.json
```

---

## 7. Future Improvements

While LinkUp is a fully operational application, the architecture allows for expansive future capabilities:
1. **Adaptive Bitrate Streaming**: Analyzing UDP packet drops via WebRTC stats and automatically scaling video resolutions.
2. **Breakout Rooms**: Virtual segmentation of Socket namespaces internally.
3. **Cloud Session Recordings**: Re-purposing the canvas stream array buffers to synthesize local .webm files to an S3 bucket instead of RTMP server.
4. **AI Summaries**: Utilizing voice-to-text plugins on the Audio `MediaStream` object to provide live transcriptions.

---

## 8. License

This project is licensed under the **ISC License**. 

```text
Copyright (c) 2024, LinkUp Contributors

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.
```
