import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { protect } from "../middlewere/authMiddlewere.js";
import Chat from "../models/Chat.js";

const router = express.Router();

/**
 * POST /api/chat/history
 * body: { meetingId }
 */router.post("/history", async (req, res) => {
  try {
    const { meetingId } = req.body; // ✅ 
    console.log("meetingId:", meetingId);

    if (!meetingId) {
      return res.status(400).json({ msg: "meetingId is required" });
    }

    const message = await Chat.find({ meetingId });
    res.status(200).json({ message });
  } catch (err) {
    console.error("error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});


export default router;
