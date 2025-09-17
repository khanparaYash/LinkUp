import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import Meeting from "./models/Meeting.js";
import authRoutes from "./routes/auth.js";
import meetingRoutes from "./routes/meeting.js";
import chatRoutes from "./routes/chat.js";
import Chat from "./models/Chat.js";
import { log } from "console";

dotenv.config();

const app = express();
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/chat", chatRoutes);

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "*", methods: ["GET", "POST"] },
});

// ---------------- SOCKET.IO -----------------// --- Socket.IO state ---
const MAX_PEERS_PER_ROOM = 4;

// roomID -> Map(socketId -> { name })
const roomUsers = new Map();
// socketId -> roomID
const socketRoom = new Map();
// socketId -> name
const socketName = new Map();
const roomHosts = new Map(); // roomID -> socketId

io.on("connection", (socket) => {
  console.log("⚡ New socket:", socket.id);

  // Client must send: { roomID, name }
  socket.on(
    "join room",
    async ({
      roomID,
      name = "User",
      userId = null,
      video = true,
      audio = true,
      
    } = {}) => {
      if (!roomID) return;
      try {
        const meeting = await Meeting.findOne({ meetingId: roomID });
        let isHost = false;
      if (meeting&&userId && meeting.host.toString() === userId.toString()) {
        isHost = true;
      }
        const usersMap = roomUsers.get(roomID) || new Map();
        if (usersMap.size >= MAX_PEERS_PER_ROOM) {
          socket.emit("room full");
          return;
        }
        console.log(isHost);
        console.log(roomHosts);

        if (isHost) {
          roomHosts.set(roomID, socket.id);
          io.to(roomID).emit("host-joined"); // notify everyone waiting
          console.log(`👑 Host joined for room ${roomID}`);
        } else {
          // ✅ If not host → check if host exists
          const hostId = roomHosts.get(roomID);
          if (!hostId || !io.sockets.sockets.get(hostId)) {
            socket.emit("waiting-for-host");
            console.log(`⏳ ${name} is waiting for host in room ${roomID}`);
          }
        }

        // save metadata
        usersMap.set(socket.id, { name, audio, video });
        roomUsers.set(roomID, usersMap);
        socketRoom.set(socket.id, roomID);
        socketName.set(socket.id, name);

        socket.join(roomID);

        // send existing users (except self)
        const others = [...usersMap.entries()]
          .filter(([id]) => id !== socket.id)
          .map(([socketId, meta]) => ({
            socketId,
            name: meta.name,
            audio: meta.audio,
            video: meta.video,
          }));
        socket.emit("all users", others);

        // notify room (except self)
        socket.to(roomID).emit("new participant", {
          socketId: socket.id,
          name,
        });

        console.log(`📢 ${socket.id} (${name}) joined room ${roomID}`);

        let participantData;

        if (userId) {
          // logged-in user
          participantData = { user: userId, joinedAt: new Date() };
        } else {
          // guest (no userId)
          participantData = { guestName: name, joinedAt: new Date() };
        }

        await Meeting.findOneAndUpdate(
          { meetingId: roomID },
          { $addToSet: { participants: participantData } },
          { new: true, upsert: false }
        );
      } catch (err) {
        console.error("❌ Error saving participant:", err);
      }
    }
  );

  socket.on("sendMessage", async ({ meetingId, user, message }) => {
    const msg = new Chat({ meetingId, user, message });
    await msg.save();
    io.to(meetingId).emit("receiveMessage", msg);
  });

  // WebRTC signaling (unchanged names added)
  socket.on("sending signal", (payload) => {
    const { userToSignal, signal } = payload;
    const callerID = socket.id;
    const callerName = socketName.get(socket.id) || "User";
    if (userToSignal) {
      io.to(userToSignal).emit("user joined", {
        signal,
        callerID,
        callerName,
      });
    }
  });

  socket.on("returning signal", (payload = {}) => {
    const { signal, callerID } = payload;
    const responderName = socketName.get(socket.id) || "User";
    if (callerID) {
      io.to(callerID).emit("receiving returned signal", {
        signal,
        id: socket.id,
        responderName,
      });
    }
  });

  socket.on("media-update", ({ meetingId, peerId, video, audio }) => {
    const usersMap = roomUsers.get(meetingId);
    if (usersMap && usersMap.has(peerId)) {
      const meta = usersMap.get(peerId);
      meta.video = video;
      meta.audio = audio;
      usersMap.set(peerId, meta);
      roomUsers.set(meetingId, usersMap);
    }
    socket
      .to(meetingId)
      .emit("participant-media-update", { peerId, video, audio });
  });

  socket.on("leave room", ({ meetingId, peerId }) => {
    socket.to(meetingId).emit("participant-left", peerId);
  });

  socket.on("disconnect", () => {
    const roomID = socketRoom.get(socket.id);
    const name = socketName.get(socket.id) || "User";

    if (roomID && roomHosts.get(roomID) === socket.id) {
      roomHosts.delete(roomID);
      io.to(roomID).emit("host-left");
      console.log(`👑 Host left room ${roomID}`);
      console.log(roomHosts + "193");
    }
    console.log(roomHosts + "196");

    if (roomID && roomUsers.has(roomID)) {
      const usersMap = roomUsers.get(roomID);
      usersMap.delete(socket.id);
      if (usersMap.size === 0) {
        roomUsers.delete(roomID);
      } else {
        roomUsers.set(roomID, usersMap);
      }
      socket.leave(roomID);
      io.to(roomID).emit("participant left", { socketId: socket.id, name });
    }

    socketRoom.delete(socket.id);
    socketName.delete(socket.id);
    console.log(`❌ Disconnected: ${socket.id} (${name})`);
  });
});

// ---------------- START SERVER -----------------
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    server.listen(PORT, () =>
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    );
  })
  .catch((err) => console.error("❌ MongoDB connection error:", err));
