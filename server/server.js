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

const emailToSocketIdMap = new Map();
const SocketIdToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log(`Socket Connected`, socket.id);

  socket.on("room:join", (data) => {     
    const { email, roomId } = data;
    emailToSocketIdMap.set(email, socket.id);
    SocketIdToEmailMap.set(socket.id, email);
    
    io.to(roomId).emit("user:joined", { email, id: socket.id }); //send message to all existing user that new user added
    socket.join(roomId); //if no one then create rooms otherwise add

    io.to(socket.id).emit("room:join", data);
  });
  socket.on("user:call",({to,offer})=>{   //2
    io.to(to).emit("incoming:call",{from:socket.id,offer})
  })
  socket.on('call:accepted',({to,ans})=>{  //3
    io.to(to).emit("call:accepted",{from:socket.id,ans})
  }) 
  socket.on('peer:nego:needed',({offer,to})=>{ //4
    io.to(to).emit("peer:nego:needed",{from:socket.id,offer})
  }) 
  socket.on('peer:nego:done',({to,ans})=>{ //5
    io.to(to).emit("peer:nego:final",{from:socket.id,ans})
  }) 
  socket.on("peer:candidate", ({ to, candidate }) => {
  io.to(to).emit("peer:candidate", { from: socket.id, candidate });
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
