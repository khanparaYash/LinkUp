import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";

export default function JoinMeeting() {
  const navigate = useNavigate();
  const [meetingId, setMeetingId] = useState("");
  const [userName, setUserName] = useState("");

  const createMeeting = () => {
    if (!meetingId || !userName) {
      alert("Please enter both Meeting ID and Name");
      return;
    }
    navigate(`/meeting/${meetingId}`, { state: { userName } });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="rounded-2xl shadow-lg">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
              Join a Meeting
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
              Enter your Meeting ID and Name to join
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <Input
              label="Meeting ID"
              placeholder="Enter Meeting ID / Link"
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
            />
            <Input
              label="Your Name"
              placeholder="Enter Your Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            <Button onClick={createMeeting} className="w-full mt-4">
               Join Meeting
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
