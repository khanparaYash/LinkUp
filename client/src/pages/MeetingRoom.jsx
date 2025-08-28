import Peer from "simple-peer";
import { useSocket } from "../context/SocketProvider";
import { useEffect } from "react";
import { useCallback } from "react";
import { useState } from "react";

import { useRef } from "react";
import peer from "../service/peer";

export default function MeetingRoom() {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const myVideoRef = useRef(null);

  const handleUserJoined = useCallback((data) => {
    console.log(`user:joined`, data.email);
    setRemoteSocketId(data.id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer }); //2

    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncomingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from)
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      const ans = peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  useEffect(() => {
    if (myVideoRef.current && myStream) {
      myVideoRef.current.srcObject = myStream;
    }
  }, [myStream]);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined); //1
    socket.on("incoming:call", handleIncomingCall); //3

    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incoming:call", handleIncomingCall);
    };
  }, [handleIncomingCall, handleUserJoined, socket]);

  return (
    <div className="min-h-screen flex flex-wrap gap-3 p-4 bg-gray-100 dark:bg-slate-900">
      <h1>Room</h1>
      <h4>{remoteSocketId ? "Connected" : "waiting user"}</h4>
      {remoteSocketId && (
        <button onClick={handleCallUser} className="bg-amber-200 h-7 p-2">
          call
        </button>
      )}
      <h1>My Stream</h1>
      {myStream && (
        <video
          ref={myVideoRef}
          autoPlay
          muted
          playsInline
          style={{ width: "300px", height: "200px", background: "black" }}
        />
      )}
    </div>
  );
}
