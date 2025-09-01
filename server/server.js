import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.js";
import morgan from "morgan";

dotenv.config();
const app = express();
const server = http.createServer(app);
app.use(morgan());

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || "*", methods: ["GET", "POST"] },
});



const users = {};
const socketToRoom = {};

io.on('connection', socket => {
     console.log("⚡ New socket connected:", socket.id);
    socket.on("join room", roomID => {
        console.log(`📢 ${socket.id} joined room: ${roomID}`);
        if (users[roomID]) {
            const length = users[roomID].length;
            if (length === 4) {
                socket.emit("room full");
                return;
            }
            users[roomID].push(socket.id);
        } else {
            users[roomID] = [socket.id];
        }
        socketToRoom[socket.id] = roomID;
        const usersInThisRoom = users[roomID].filter(id => id !== socket.id);

        socket.emit("all users", usersInThisRoom);
    });

    socket.on("sending signal", payload => {
        console.log(`📤 Signal from ${socket.id} to ${payload.userToSignal}`);
        io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
    });

    socket.on("returning signal", payload => {
        console.log(`📤 Returning signal from ${socket.id}  to ${payload.callerID}`);
        io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
    });

    socket.on('disconnect', () => {
        console.log(`❌ Disconnected: ${socket.id}`);
        const roomID = socketToRoom[socket.id];
        let room = users[roomID];
        if (room) {
            room = room.filter(id => id !== socket.id);
            users[roomID] = room;
        }
    });

});







app.use(cors({ origin: process.env.CLIENT_URL || "*", credentials: true }));
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => res.send("LinkUp API running"));

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => {
    console.log("MongoDB connected");
    server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
