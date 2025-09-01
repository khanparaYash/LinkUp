import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import Video from "./Video";
import Card from "../components/ui/Card";
const MeetingRoom = () => {
  const [remoteStreams, setRemoteStreams] = useState([]);
  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]);
  const roomID = window.location.pathname.split("/meeting/")[1];

  useEffect(() => {
    socketRef.current = io("http://localhost:5000");

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        userVideo.current.srcObject = stream;

        socketRef.current.emit("join room", roomID);

        socketRef.current.on("all users", (users) => {
          console.log("all user");

          users.forEach((userID) => {
            const peer = createPeer(userID, socketRef.current.id, stream);
            peersRef.current.push({ peerID: userID, peer });
            peer.on("stream", (remoteStream) => {
              setRemoteStreams((prev) => [...prev, remoteStream]);
            });
          });
        });

        socketRef.current.on("user joined", (payload) => {
          console.log("user join");
          const peer = addPeer(payload.signal, payload.callerID, stream);
          peersRef.current.push({ peerID: payload.callerID, peer });

          peer.on("stream", (remoteStream) => {
            setRemoteStreams((prev) => [...prev, remoteStream]);
          });
        });

        socketRef.current.on("receiving returned signal", (payload) => {
          const item = peersRef.current.find((p) => p.peerID === payload.id);
          if (item) {
            item.peer.signal(payload.signal);
          }
        });
      });

    return () => {
      socketRef.current.disconnect();
    };
  }, [roomID]);

  function createPeer(userToSignal, callerID, stream) {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      },
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("sending signal", {
        userToSignal,
        callerID,
        signal,
      });
    });

    return peer;
  }

  function addPeer(incomingSignal, callerID, stream) {
    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
      config: {
        iceServers: [
          { urls: "stun:stun.l.google.com:19302" },
          { urls: "stun:stun1.l.google.com:19302" },
        ],
      },
    });

    peer.on("signal", (signal) => {
      socketRef.current.emit("returning signal", { signal, callerID });
    });

    peer.signal(incomingSignal);

    return peer;
  }

  return (
     <div className="min-h-screen bg-gray-100 dark:bg-slate-900 p-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
        Meeting Room: {roomID}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {/* Local User Video */}
        <Card className="p-0">
          <video
            muted
            ref={userVideo}
            autoPlay
            playsInline
            className="w-full h-64 object-cover rounded-2xl"
          />
          <p className="text-center text-sm mt-1 text-gray-700 dark:text-gray-200">
            You
          </p>
        </Card>

        {/* Remote Videos */}
        {remoteStreams.map((stream, index) => (
          <Card key={index} className="p-0">
            <Video stream={stream} />
          </Card>
        ))}
      </div>
    </div>
  );
};

export default MeetingRoom;
