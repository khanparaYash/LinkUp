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

// ---------------- SOCKET.IO ----------------- //
const MAX_PEERS_PER_ROOM = 20;

// roomID -> Map(socketId -> { name, audio, video, deviceId })
const roomUsers = new Map();
// socketId -> roomID
const socketRoom = new Map();
// socketId -> name
const socketName = new Map();
// roomID -> hostSocketId
const roomHosts = new Map();

io.on("connection", (socket) => {
  console.log("⚡ New socket:", socket.id);

  // ---- JOIN ROOM ----
  socket.on(
    "join room",
    async ({
      roomID,
      name = "User",
      userId = null,
      video = true,
      audio = true,
      deviceId,
    } = {}) => {
      if (!roomID) return;

      try {
        const meeting = await Meeting.findOne({ meetingId: roomID });
        let isHost = false;
        if (
          meeting &&
          userId &&
          meeting.host.toString() === userId.toString()
        ) {
          isHost = true;
        }

        const usersMap = roomUsers.get(roomID) || new Map();

        // Prevent duplicate device
        if (deviceId) {
          for (const [sid, meta] of usersMap.entries()) {
            if (meta.deviceId === deviceId) {
              console.log(`👀 Duplicate device. Kicking old socket ${sid}`);
              const oldSocket = io.sockets.sockets.get(sid);
              if (oldSocket) {
                oldSocket.leave(roomID);
                oldSocket.emit("duplicate-kicked");
                oldSocket.disconnect(true);
              }
              usersMap.delete(sid);
              await Meeting.findOneAndUpdate(
                { meetingId: roomID },
                { $pull: { participants: { deviceId } } }
              );
            }
          }
        }

        if (usersMap.size >= MAX_PEERS_PER_ROOM) {
          socket.emit("room full");
          return;
        }

        // Host check
        if (isHost) {
          roomHosts.set(roomID, socket.id);
          io.to(roomID).emit("host-joined");
          console.log(`👑 Host joined for room ${roomID}`);
        } else {
          const hostId = roomHosts.get(roomID);
          if (!hostId || !io.sockets.sockets.get(hostId)) {
            socket.emit("waiting-for-host");
            console.log(`⏳ ${name} is waiting for host in room ${roomID}`);
          }
        }

        // Save metadata
        usersMap.set(socket.id, { name, audio, video, deviceId });
        roomUsers.set(roomID, usersMap);
        socketRoom.set(socket.id, roomID);
        socketName.set(socket.id, name);

        socket.join(roomID);

        // Send existing users (except self)
        const others = [...usersMap.entries()]
          .filter(([id]) => id !== socket.id)
          .map(([socketId, meta]) => ({
            socketId,
            name: meta.name,
            audio: meta.audio,
            video: meta.video,
          }));
        socket.emit("all users", others);

        // Notify others
        socket.to(roomID).emit("new participant", {
          socketId: socket.id,
          name,
        });

        console.log(`📢 ${socket.id} (${name}) joined room ${roomID}`);

        // Save participant in DB
        const participantData = userId
          ? { user: userId, deviceId, joinedAt: new Date() }
          : { guestName: name, deviceId, joinedAt: new Date() };

        if (userId) {
          await Meeting.findOneAndUpdate(
            { meetingId: roomID },
            { $pull: { participants: { user: userId } } }
          );
        } else if (deviceId) {
          await Meeting.findOneAndUpdate(
            { meetingId: roomID },
            { $pull: { participants: { deviceId } } }
          );
        }

        await Meeting.findOneAndUpdate(
          { meetingId: roomID },
          { $push: { participants: participantData } },
          { new: true }
        );
      } catch (err) {
        console.error("❌ Error saving participant:", err);
      }
    }
  );

  // ---- CHAT ----
  socket.on("sendMessage", async ({ meetingId, user, message }) => {
    const msg = new Chat({ meetingId, user, message });
    await msg.save();
    io.to(meetingId).emit("receiveMessage", msg);
  });

  // ---- WebRTC signaling ----
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

  // ---- Media state update ----
  socket.on("media-update", ({ meetingId, peerId, video, audio }) => {
    const usersMap = roomUsers.get(meetingId);
    if (usersMap && usersMap.has(peerId)) {
      const meta = usersMap.get(peerId);
      meta.video = video;
      meta.audio = audio;
      usersMap.set(peerId, meta);
    }
    socket
      .to(meetingId)
      .emit("participant-media-update", { peerId, video, audio });
  });

  // ---- Host controls ----
  socket.on("host-force-mute", ({ roomID, targetId }) => {
    if (roomHosts.get(roomID) !== socket.id) {
      console.log("219");
      return;
      console.log("222");
    }
    // only host
    io.to(targetId).emit("force-mute",{targetId});
  });

  socket.on("host-remove-user", ({ roomID, targetId }) => {
    if (roomHosts.get(roomID) !== socket.id) return;

      io.to(targetId).emit("removed-by-host");
    
  });

  socket.on("host-end-meeting", ({ roomID }) => {
    if (roomHosts.get(roomID) !== socket.id) return;
    io.to(roomID).emit("meeting-ended");
    const usersMap = roomUsers.get(roomID);
    if (usersMap) {
      for (const sid of usersMap.keys()) {
        const targetSocket = io.sockets.sockets.get(sid);
        if (targetSocket) {
          targetSocket.leave(roomID);
          targetSocket.disconnect(true);
        }
      }
    }
    roomUsers.delete(roomID);
    roomHosts.delete(roomID);
  });

  // ---- Leaving / disconnect ----
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
    }

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
