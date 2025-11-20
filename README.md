# MERN LinkUp

A full-stack video conferencing application built with the MERN stack, featuring real-time video/audio communication, chat functionality, and meeting management.

## 🚀 Features

- **Video Conferencing**: Real-time video and audio communication using WebRTC
- **User Authentication**: Secure registration and login with JWT
- **Meeting Management**: Create, join, and manage meetings
- **Host Controls**: 
  - Force mute participants
  - Remove participants
  - End meetings
- **Real-time Chat**: In-meeting chat functionality
- **Participant Management**: Track and display meeting participants
- **Dark Mode**: Theme support with next-themes
- **Responsive UI**: Modern interface built with Tailwind CSS and shadcn/ui

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **React Router** - Routing
- **Socket.io Client** - Real-time communication
- **Simple Peer** - WebRTC peer-to-peer connections
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Framer Motion** - Animations
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.io** - WebSocket server
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or MongoDB Atlas account)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "MERN LinkUp"
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

## ⚙️ Environment Variables

### Server (.env)
Create a `.env` file in the `server` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
```

### Client
The client should be configured to connect to your server URL. Update the API base URL in your client configuration files if needed.

## 🚀 Running the Application

### Development Mode

1. **Start the server**
   ```bash
   cd server
   npm run dev
   ```
   The server will run on `http://localhost:5000`

2. **Start the client** (in a new terminal)
   ```bash
   cd client
   npm run dev
   ```
   The client will run on `http://localhost:5173`

### Production Build

1. **Build the client**
   ```bash
   cd client
   npm run build
   ```

2. **Start the server**
   ```bash
   cd server
   npm start
   ```

## 📁 Project Structure

```
MERN LinkUp/
├── client/                 # React frontend
│   ├── src/
│   │   ├── api/           # API calls
│   │   ├── components/    # React components
│   │   ├── context/       # React context providers
│   │   ├── layouts/       # Layout components
│   │   ├── pages/         # Page components
│   │   ├── router/        # Routing configuration
│   │   ├── slices/        # Redux slices
│   │   ├── store/         # Redux store
│   │   └── utils/         # Utility functions
│   ├── public/            # Static assets
│   └── package.json
│
├── server/                # Express backend
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── middlewere/        # Middleware functions
│   ├── server.js          # Server entry point
│   └── package.json
│
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (protected)

### Meetings
- `POST /api/meetings` - Create a new meeting
- `GET /api/meetings/:id` - Get meeting details
- `GET /api/meetings` - Get user's meetings

### Chat
- `GET /api/chat/:meetingId` - Get chat messages for a meeting
- `POST /api/chat` - Send a chat message

## 🎯 Socket.io Events

### Client → Server
- `join room` - Join a meeting room
- `leave room` - Leave a meeting room
- `sending signal` - Send WebRTC offer
- `returning signal` - Send WebRTC answer
- `sendMessage` - Send chat message
- `media-update` - Update media state (video/audio)
- `host-force-mute` - Host mutes a participant
- `host-remove-user` - Host removes a participant
- `host-end-meeting` - Host ends the meeting

### Server → Client
- `all users` - List of existing users in room
- `new participant` - New user joined
- `participant left` - User left the room
- `user joined` - WebRTC offer received
- `receiving returned signal` - WebRTC answer received
- `receiveMessage` - New chat message
- `participant-media-update` - Participant media state changed
- `force-mute` - Force mute command
- `removed-by-host` - Removed by host notification
- `meeting-ended` - Meeting ended by host

## 🚢 Deployment

The project includes Vercel configuration files for deployment:

- **Client**: Deploy to Vercel using `client/vercel.json`
- **Server**: Deploy to Vercel using `server/vercel.json`

Make sure to set environment variables in your deployment platform.

## 📝 Scripts

### Server
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Client
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.

## 👨‍💻 Author

Built with ❤️ using the MERN stack

---

**Note**: Make sure to configure your MongoDB connection string and JWT secret in the server `.env` file before running the application.

