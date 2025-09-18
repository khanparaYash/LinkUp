import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({
  meetingId: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // hashed
  host: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // reference User
  createdAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  participants: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // link to User
      guestName: { type: String }, // if not logged in
      joinedAt: { type: Date, default: Date.now },
      deviceId:{type: String},
    },
  ],
});

export default mongoose.model("Meeting", meetingSchema);
