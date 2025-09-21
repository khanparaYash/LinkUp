import express from "express";
import bcrypt from "bcryptjs";
import Meeting from "../models/Meeting.js";
import { protect, optionalAuth } from "../middlewere/authMiddlewere.js";

const router = express.Router();

/**
 * POST /api/meetings/create
 * Host creates a meeting (login required)
 * body: { password, expiresAt }
 */

router.post("/create", protect, async (req, res) => {
  try {
    const { password, expiresInHours = 1 } = req.body;

    const meetingId = Math.random().toString().slice(2, 11);
    const hashedPassword = await bcrypt.hash(password, 10);
    const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
    const meeting = await Meeting.create({
      meetingId,
      password: hashedPassword,
      host: req.user._id,
      expiresAt,
    });

    const shareLink = `${process.env.CLIENT_URL}/join?meetingId=${meetingId}&pwd=${password}`;
    
    res.status(201).json({
      meetingId: meeting.meetingId,
      host: {name:req.user.name,
        id: req.user._id,
      },
      participants:[],
      expiresAt: meeting.expiresAt,
      joinLink:shareLink, // host can copy this
    });
  } catch (err) {
    console.error("Create meeting error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * POST /api/meetings/join
 * Anyone (user or guest) can join
 * body: { meetingId, password, guestName? }
 */
router.post("/join", optionalAuth, async (req, res) => {
  try {
    const { meetingId, password, guestName } = req.body;

    if (!meetingId || !password) {
      return res.status(400).json({ msg: "Meeting ID and password required" });
    }

    const meeting = await Meeting.findOne({ meetingId }).populate(
      "host",
      "name email"
    );
    if (!meeting) return res.status(404).json({ msg: "Meeting not found" });

    // check expiry
    if (meeting.expiresAt && new Date() > meeting.expiresAt) {
      return res.status(400).json({ msg: "Meeting expired" });
    }

    // check password
    const isMatch = await bcrypt.compare(password, meeting.password);
    if (!isMatch) return res.status(401).json({ msg: "Invalid password" });
    
    

    res.json({
      meetingId: meeting.meetingId,
      host: meeting.host,
      participants: meeting.participants,
      expiresAt: meeting.expiresAt,
      joinLink: `${process.env.CLIENT_URL}/join?meetingId=${meeting.meetingId}&pwd=${password}`,
    });
  } catch (err) {
    console.error("Join meeting error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * POST /api/meetings/end
 * Only host can end meeting
 * body: { meetingId }
 */
router.post("/end", protect, async (req, res) => {
  try {
    const { meetingId } = req.body;

    const meeting = await Meeting.findOne({ meetingId });
    if (!meeting) return res.status(404).json({ msg: "Meeting not found" });

    if (meeting.host.toString() !== req.user._id.toString()) {
      return res.status(403).json({ msg: "Only host can end the meeting" });
    }

    await meeting.deleteOne();

    res.json({ msg: "Meeting ended successfully" });
  } catch (err) {
    console.error("End meeting error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

/**
 * POST /api/meetings/leave
 * body: { meetingId, participantId OR guestName }
 */
router.post("/leave", async (req, res) => {
  try {
    const { meetingId, participantId, guestName } = req.body;

    const meeting = await Meeting.findOne({ meetingId });
    if (!meeting) return res.status(404).json({ msg: "Meeting not found" });

    // Remove participant (logged-in user OR guest)
    meeting.participants = meeting.participants.filter((p) => {
      if (participantId && p.user) {
        return p.user.toString() !== participantId;
      }
      if (guestName && p.guestName) {
        return p.guestName !== guestName;
      }
      return true;
    });

    await meeting.save();

    res.json({ msg: "Left meeting successfully" });
  } catch (err) {
    console.error("Leave meeting error:", err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

// GET /meetings/:id
router.get("/:id", async (req, res) => {
  const meeting = await Meeting.findOne({ meetingId: req.params.id })
    .populate("host", "name email")
    .select("-password"); // never send hash

  if (!meeting) return res.status(404).json({ msg: "Meeting not found" });

  res.json({
    meetingId: meeting.meetingId,
    hostName: meeting.host?.name || "Unknown",
    participants: meeting.participants.map(p => ({ name: p.name })),
    createdAt: meeting.createdAt,
    expiresAt: meeting.expiresAt
  });
});


export default router;
