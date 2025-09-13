// import React, { useEffect, useRef, useState } from "react";
// import io from "socket.io-client";
// import Peer from "simple-peer";
// import Video from "./Video";
// import Card from "../components/ui/Card";
// const MeetingRoom = () => {
//   const [remoteStreams, setRemoteStreams] = useState([]);
//   const socketRef = useRef();
//   const userVideo = useRef();
//   const peersRef = useRef([]);
//   const roomID = window.location.pathname.split("/meeting/")[1];

//   useEffect(() => {
//     socketRef.current = io("http://localhost:5000");

//     navigator.mediaDevices
//       .getUserMedia({ video: true, audio: true })
//       .then((stream) => {
//         userVideo.current.srcObject = stream;

//         socketRef.current.emit("join room", roomID);

//         socketRef.current.on("all users", (users) => {
//           console.log("all user");

//           users.forEach((userID) => {
//             const peer = createPeer(userID, socketRef.current.id, stream);
//             peersRef.current.push({ peerID: userID, peer });
//             peer.on("stream", (remoteStream) => {
//               setRemoteStreams((prev) => [...prev, remoteStream]);
//             });
//           });
//         });

//         socketRef.current.on("user joined", (payload) => {
//           console.log("user join");
//           const peer = addPeer(payload.signal, payload.callerID, stream);
//           peersRef.current.push({ peerID: payload.callerID, peer });

//           peer.on("stream", (remoteStream) => {
//             setRemoteStreams((prev) => [...prev, remoteStream]);
//           });
//         });

//         socketRef.current.on("receiving returned signal", (payload) => {
//           const item = peersRef.current.find((p) => p.peerID === payload.id);
//           if (item) {
//             item.peer.signal(payload.signal);
//           }
//         });
//       });

//     return () => {
//       socketRef.current.disconnect();
//     };
//   }, [roomID]);

//   function createPeer(userToSignal, callerID, stream) {
//     const peer = new Peer({
//       initiator: true,
//       trickle: false,
//       stream,
//       config: {
//         iceServers: [
//           { urls: "stun:stun.l.google.com:19302" },
//           { urls: "stun:stun1.l.google.com:19302" },
//         ],
//       },
//     });

//     peer.on("signal", (signal) => {
//       socketRef.current.emit("sending signal", {
//         userToSignal,
//         callerID,
//         signal,
//       });
//     });

//     return peer;
//   }

//   function addPeer(incomingSignal, callerID, stream) {
//     const peer = new Peer({
//       initiator: false,
//       trickle: false,
//       stream,
//       config: {
//         iceServers: [
//           { urls: "stun:stun.l.google.com:19302" },
//           { urls: "stun:stun1.l.google.com:19302" },
//         ],
//       },
//     });

//     peer.on("signal", (signal) => {
//       socketRef.current.emit("returning signal", { signal, callerID });
//     });

//     peer.signal(incomingSignal);

//     return peer;
//   }

//   return (
//      <div className="min-h-screen bg-gray-100 dark:bg-slate-900 p-6">
//       <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 text-center">
//         Meeting Room: {roomID}
//       </h1>

//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
//         {/* Local User Video */}
//         <Card className="p-0">
//           <video
//             muted
//             ref={userVideo}
//             autoPlay
//             playsInline
//             className="w-full h-64 object-cover rounded-2xl"
//           />
//           <p className="text-center text-sm mt-1 text-gray-700 dark:text-gray-200">
//             You
//           </p>
//         </Card>

//         {/* Remote Videos */}
//         {remoteStreams.map((stream, index) => (
//           <Card key={index} className="p-0">
//             <Video stream={stream} />
//           </Card>
//         ))}
//       </div>
//     </div>
//   );
// };

// export default MeetingRoom;

//-------------------------------------------------------------------------------------------

// import React, { useEffect, useRef, useState } from "react";
// import io from "socket.io-client";
// import Peer from "simple-peer";
// import Video from "./Video";
// import InfoPanel from "./InfoPanel";
// import { Card } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import {
//   Mic,
//   MicOff,
//   Video as VideoIcon,
//   VideoOff,
//   PhoneOff,
//   Info,
// } from "lucide-react";

// const MeetingRoom = () => {
//   const [remoteStreams, setRemoteStreams] = useState([]);
//   const [micOn, setMicOn] = useState(true);
//   const [camOn, setCamOn] = useState(true);
//   const [showInfo, setShowInfo] = useState(false);
//   const [active, setActive] = useState(true); // 🔹 UI visible or hidden

//   const socketRef = useRef();
//   const userVideo = useRef();
//   const peersRef = useRef([]);
//   const localStream = useRef();
//   const roomID = window.location.pathname.split("/meeting/")[1];

//   const hostName = "Host User";
//   const meetingPassword = "hidden"; // not shown, only for backend
//   const joinLink = `${window.location.origin}/join?meetingId=${roomID}&pwd=${meetingPassword}`;

//   useEffect(() => {
//     socketRef.current = io(
//       import.meta.env.VITE_BACKEND || "http://localhost:5000"
//     );

//     navigator.mediaDevices
//       .getUserMedia({ video: true, audio: true })
//       .then((stream) => {
//         localStream.current = stream;
//         if (userVideo.current) {
//           userVideo.current.srcObject = stream;
//         }

//         socketRef.current.emit("join room", roomID);

//         socketRef.current.on("all users", (users) => {
//           users.forEach((userID) => {
//             const peer = createPeer(userID, socketRef.current.id, stream);
//             peersRef.current.push({ peerID: userID, peer });

//             peer.on("stream", (remoteStream) => {
//               addRemoteStream(remoteStream, userID);
//             });
//           });
//         });

//         socketRef.current.on("user joined", (payload) => {
//           const peer = addPeer(payload.signal, payload.callerID, stream);
//           peersRef.current.push({ peerID: payload.callerID, peer });

//           peer.on("stream", (remoteStream) => {
//             addRemoteStream(remoteStream, payload.callerID);
//           });
//         });

//         socketRef.current.on("receiving returned signal", (payload) => {
//           const item = peersRef.current.find((p) => p.peerID === payload.id);
//           if (item) {
//             item.peer.signal(payload.signal);
//           }
//         });
//       });

//     return () => {
//       socketRef.current.disconnect();
//       localStream.current?.getTracks().forEach((track) => track.stop());
//     };
//   }, [roomID]);

//   const addRemoteStream = (stream, peerID) => {
//     setRemoteStreams((prev) => {
//       if (prev.find((s) => s.peerID === peerID)) return prev;
//       return [...prev, { stream, peerID }];
//     });
//   };

//   function createPeer(userToSignal, callerID, stream) {
//     const peer = new Peer({
//       initiator: true,
//       trickle: false,
//       stream,
//       config: {
//         iceServers: [
//           { urls: "stun:stun.l.google.com:19302" },
//           { urls: "stun:stun1.l.google.com:19302" },
//         ],
//       },
//     });

//     peer.on("signal", (signal) => {
//       socketRef.current.emit("sending signal", {
//         userToSignal,
//         callerID,
//         signal,
//       });
//     });

//     return peer;
//   }

//   function addPeer(incomingSignal, callerID, stream) {
//     const peer = new Peer({
//       initiator: false,
//       trickle: false,
//       stream,
//       config: {
//         iceServers: [
//           { urls: "stun:stun.l.google.com:19302" },
//           { urls: "stun:stun1.l.google.com:19302" },
//         ],
//       },
//     });

//     peer.on("signal", (signal) => {
//       socketRef.current.emit("returning signal", { signal, callerID });
//     });

//     peer.signal(incomingSignal);
//     return peer;
//   }
//   // 🔹 Detect mouse inactivity
//   useEffect(() => {
//     let timeout;
//     const handleActivity = () => {
//       setActive(true);
//       clearTimeout(timeout);
//       timeout = setTimeout(() => setActive(false), 3000); // hide after 3s
//     };

//     window.addEventListener("mousemove", handleActivity);
//     window.addEventListener("keydown", handleActivity);

//     return () => {
//       window.removeEventListener("mousemove", handleActivity);
//       window.removeEventListener("keydown", handleActivity);
//       clearTimeout(timeout);
//     };
//   }, []);

//   // ... (your socket + peer logic stays same)

//   const toggleMic = () => {
//     const audioTrack = localStream.current?.getAudioTracks()[0];
//     if (audioTrack) {
//       audioTrack.enabled = !audioTrack.enabled;
//       setMicOn(audioTrack.enabled);
//     }
//   };

//   const toggleCam = () => {
//     const videoTrack = localStream.current?.getVideoTracks()[0];
//     if (videoTrack) {
//       videoTrack.enabled = !videoTrack.enabled;
//       setCamOn(videoTrack.enabled);
//     }
//   };

//   const leaveMeeting = () => {
//     socketRef.current.disconnect();
//     localStream.current?.getTracks().forEach((track) => track.stop());
//     window.location.href = "/"; // back home
//   };

//   return (
//     <div className="relative flex flex-col min-h-screen bg-background">
//       {/* Info Panel */}
//       <InfoPanel
//         show={showInfo}
//         onClose={() => setShowInfo(false)}
//         roomID={roomID}
//         hostName={hostName}
//         joinLink={joinLink}
//       />

//       {/* Header (auto-hide) */}
//       <header
//         className={`absolute top-0 left-0 w-full flex justify-between items-center p-4 transition-opacity duration-300 ${
//           active ? "opacity-100" : "opacity-0 pointer-events-none"
//         } bg-background/80 backdrop-blur-md border-b z-10`}
//       >
//         <h1 className="text-lg font-semibold">
//           Meeting <span className="text-muted-foreground">#{roomID}</span>
//         </h1>
//         <div className="flex items-center gap-2">
//           <Button
//             variant="outline"
//             size="icon"
//             onClick={() => setShowInfo(true)}
//           >
//             <Info className="w-5 h-5" />
//           </Button>
//           <Button variant="destructive" size="sm" onClick={leaveMeeting}>
//             <PhoneOff className="w-4 h-4 mr-2" /> Leave
//           </Button>
//         </div>
//       </header>

//       {/* Video Grid */}
//       <main className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
//         {/* Local User Video */}
//         <Card className="overflow-hidden">
//           <Video
//             stream={localStream.current}
//             muted
//             label="You"
//             camOn={camOn}
//             micOn={micOn}
//           />
//         </Card>

//         {/* Remote Users */}
//         {remoteStreams.map(({ stream, peerID }) => (
//           <Card key={peerID} className="overflow-hidden">
//             <Video
//               stream={stream}
//               label={`Peer ${peerID.slice(0, 5)}...`}
//               // For now assume remote peers always have cam/mic on
//               // (can be extended by signaling mic/cam state over socket)
//               camOn={true}
//               micOn={true}
//             />
//           </Card>
//         ))}
//       </main>

//       {/* Controls (auto-hide, sticky bottom) */}
//       <footer
//         className={`absolute bottom-0 left-0 w-full flex justify-center items-center gap-6 p-4 transition-opacity duration-300 ${
//           active ? "opacity-100" : "opacity-0 pointer-events-none"
//         } bg-background/80 backdrop-blur-md border-t`}
//       >
//         <Button
//           variant={micOn ? "default" : "secondary"}
//           size="icon"
//           onClick={toggleMic}
//         >
//           {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
//         </Button>
//         <Button
//           variant={camOn ? "default" : "secondary"}
//           size="icon"
//           onClick={toggleCam}
//         >
//           {camOn ? (
//             <VideoIcon className="w-5 h-5" />
//           ) : (
//             <VideoOff className="w-5 h-5" />
//           )}
//         </Button>
//         <Button variant="destructive" size="icon" onClick={leaveMeeting}>
//           <PhoneOff className="w-5 h-5" />
//         </Button>
//       </footer>
//     </div>
//   );
// };

// export default MeetingRoom;

//-------------------------------------------------------------------------------------------

import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import Video from "./Video";
import InfoPanel from "./InfoPanel";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  Info,
  Users,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import ParticipantsSidebar from "./ParticipantsSidebar";

const MeetingRoom = () => {
  const location = useLocation();
  const res = location.state;

  const [remoteStreams, setRemoteStreams] = useState([]); // [{ peerID, stream, name,video,audio }]
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [active, setActive] = useState(true);
  const [PshowInfo, setPShowInfo] = useState(false);

  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]); // [{ peerID, peer, name }]
  const localStream = useRef();
  const roomID = window.location.pathname.split("/meeting/")[1];

  // Prefer a value you store on Join/Host: localStorage.setItem('displayName', 'Alice')
  const displayName =
    localStorage.getItem("displayName") ||
    localStorage.getItem("guestName") ||
    "Guest";

  const hostName = res.host.name;
  const joinLink = res.joinLink;

  useEffect(() => {
    socketRef.current = io(
      import.meta.env.VITE_BACKEND || "http://localhost:5000"
    );

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStream.current = stream;
        if (userVideo.current) userVideo.current.srcObject = stream;

        // JOIN with name
        socketRef.current.emit("join room", { roomID, name: displayName });

        // Existing users -> create offer for each
        socketRef.current.on("all users", (users = []) => {
          users.forEach(({ socketId, name, audio = true, video = true }) => {
            const peer = createPeer(socketId, socketRef.current.id, stream);
            peersRef.current.push({ peerID: socketId, peer, name });
            peer.on("stream", (remoteStream) => {
              addRemoteStream(remoteStream, socketId, name, audio, video);
            });
          });
        });

        // Someone joined -> we are the callee
        socketRef.current.on("user joined", (payload) => {
          const { signal, callerID, callerName } = payload;
          const peer = addPeer(signal, callerID, stream);
          peersRef.current.push({
            peerID: callerID,
            peer,
            name: callerName || "User",
          });
          peer.on("stream", (remoteStream) => {
            addRemoteStream(remoteStream, callerID, callerName || "User");
          });
        });

        // Answer comes back to initial offer
        socketRef.current.on("receiving returned signal", (payload) => {
          const item = peersRef.current.find((p) => p.peerID === payload.id);
          if (item) item.peer.signal(payload.signal);
        });

        socketRef.current.on(
          "participant-media-update",
          ({ peerId, video, audio }) => {
            setRemoteStreams((prev) => {
              const updated = prev.map((p) =>
                p.peerID === peerId ? { ...p, video, audio } : p
              );
              console.log("🔄 Updated remoteStreams:", updated);
              return updated;
            });

            console.log(remoteStreams);
          }
        );

        // Remove UI when someone leaves
        socketRef.current.on("participant left", ({ socketId }) => {
          peersRef.current = peersRef.current.filter(
            (p) => p.peerID !== socketId
          );
          setRemoteStreams((prev) => prev.filter((s) => s.peerID !== socketId));
          console.log(remoteStreams);
        });

        // Optional: FYI event — not required for tiles
        // socketRef.current.on(
        //   "new participant",
        //   ({ socketId: peerId, name }) => {
        //     // Could update a sidebar participant list if you want
        //     // console.log("🆕 New participant:", socketId, name);

        //   }
        // );
      });

    return () => {
      socketRef.current?.disconnect();
      localStream.current?.getTracks().forEach((t) => t.stop());
    };
  }, [roomID, displayName]);

  const addRemoteStream = (
    stream,
    peerID,
    name,
    video = true,
    audio = true
  ) => {
    setRemoteStreams((prev) => {
      if (prev.find((s) => s.peerID === peerID)) return prev;
      return [...prev, { stream, peerID, name, video, audio }];
    });
  };

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

  // Auto-hide chrome
  useEffect(() => {
    let timeout;
    const handleActivity = () => {
      setActive(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setActive(false), 3000);
    };
    window.addEventListener("mousemove", handleActivity);
    window.addEventListener("keydown", handleActivity);
    return () => {
      window.removeEventListener("mousemove", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      clearTimeout(timeout);
    };
  }, []);

  const toggleMic = () => {
    const track = localStream.current?.getAudioTracks()?.[0];
    if (track) {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);

      socketRef.current.emit("media-update", {
        meetingId: roomID,
        peerId: socketRef.current.id,
        stream: localStream.current,
        video: camOn,
        audio: track.enabled,
      });
    }
  };

  const toggleCam = () => {
    const track = localStream.current?.getVideoTracks()?.[0];
    if (track) {
      track.enabled = !track.enabled;
      setCamOn(track.enabled);

      socketRef.current.emit("media-update", {
        meetingId: roomID,
        peerId: socketRef.current.id,
        stream: localStream.current,
        video: track.enabled,
        audio: micOn,
      });
    }
  };

  const leaveMeeting = () => {
    socketRef.current?.disconnect();
    localStream.current?.getTracks().forEach((t) => t.stop());
    window.location.href = "/";
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-background">
      <InfoPanel
        show={showInfo}
        onClose={() => setShowInfo(false)}
        roomID={roomID}
        hostName={hostName}
        joinLink={joinLink}
      />
      <ParticipantsSidebar
        show={PshowInfo}
        onClose={() => setPShowInfo(false)}
        participants={[
          {
            peerID: socketRef.current?.id,
            name: displayName,
            micOn,
            camOn,
            isYou: true,
          },
          ...remoteStreams.map((p) => ({
            peerID: p.peerID,
            name: p.name,
            micOn: p.audio,
            camOn: p.video,
            isYou: false,
          })),
        ]}
      />

      {/* Header */}
      <header
        className={`absolute top-0 left-0 w-full flex justify-between items-center p-4 transition-opacity duration-300 ${
          active ? "opacity-100" : "opacity-0 pointer-events-none"
        } bg-background/80 backdrop-blur-md border-b z-10`}
      >
        <h1 className="text-lg font-semibold">
          Meeting <span className="text-muted-foreground">#{roomID}</span>
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowInfo(true)}
          >
            <Info className="w-5 h-5" />
          </Button>
          <Button variant="destructive" size="sm" onClick={leaveMeeting}>
            <PhoneOff className="w-4 h-4 mr-2" /> Leave
          </Button>
        </div>
      </header>

      {/* Video Grid */}
      <main className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-5 py-18">
        <Card className="overflow-hidden">
          <Video
            stream={localStream.current}
            muted
            label={displayName + "(You)"}
            camOn={camOn}
            micOn={micOn}
          />
        </Card>

        {remoteStreams.map(({ stream, peerID, name, video, audio }) => (
          <Card key={peerID} className="overflow-hidden">
            <Video
              stream={stream}
              label={name || `User ${peerID.slice(0, 5)}`}
              camOn={video}
              micOn={audio}
            />
          </Card>
        ))}
      </main>

      {/* Controls */}
      <footer
        className={`absolute bottom-0 left-0 w-full flex justify-center items-center gap-6 p-4 transition-opacity duration-300 ${
          active ? "opacity-100" : "opacity-0 pointer-events-none"
        } bg-background/80 backdrop-blur-md border-t`}
      >
        <Button
          onClick={() => setPShowInfo(true)}
          variant={PshowInfo ? "default" : "secondary"}
        >
          <Users className="w-5 h-5" />
          
        </Button>

        <Button
          variant={micOn ? "default" : "secondary"}
          size="icon"
          onClick={toggleMic}
        >
          {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </Button>

        <Button
          variant={camOn ? "default" : "secondary"}
          size="icon"
          onClick={toggleCam}
        >
          {camOn ? (
            <VideoIcon className="w-5 h-5" />
          ) : (
            <VideoOff className="w-5 h-5" />
          )}
        </Button>
        <Button variant="destructive" size="icon" onClick={leaveMeeting}>
          <PhoneOff className="w-5 h-5" />
        </Button>
      </footer>
    </div>
  );
};

export default MeetingRoom;
