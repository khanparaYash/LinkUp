import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useCallback } from "react";
import { useSocket } from "../context/SocketProvider";
import { useEffect } from "react";

export default function JoinMeeting() {
  const [email, setEmail] = useState("");
  const [roomId, setRoomId] = useState("");
  const nav = useNavigate();
  const socket = useSocket();

  const handleJoin = useCallback(
    (e) => {
      e.preventDefault();
      if (!email || !roomId) return;
      socket.emit("room:join", { email, roomId });
      
    },
    [email, roomId, socket]
  );

  const handleJoinRoom = useCallback((data) => {
    const {  roomId } = data;
    nav(`/meeting/${roomId}`);
  }, [nav]);

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [handleJoinRoom, socket]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-200 to-cyan-200 p-6">
      <Card className="w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4 text-center">
          Join LinkUp Meeting
        </h3>
        <form onSubmit={handleJoin} className="space-y-3">
          <Input
            label="Your email"
            value={email}
            type="email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Meeting Code / Link"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            required
          />
          <Button type="submit" className="w-full" variant="primary">
            Join
          </Button>
        </form>
      </Card>
    </div>
  );
}
