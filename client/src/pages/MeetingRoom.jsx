import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import Video from "./Video";
import InfoPanel from "./InfoPanel";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Video as VideoIcon, PhoneOff, Info } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import MeetingControl from "./MeetingControl";
import ParticipantsSidebar from "./ParticipantsSidebar";
import Chat from "./Chat";
import { toast } from "sonner";
import WaitingForHost from "./WaitingForHost";

const MeetingRoom = () => {
  const location = useLocation();
  const res = location?.state?.res;

  const navigate = useNavigate();
  const [remoteStreams, setRemoteStreams] = useState([]); // [{ peerID, stream, name,video,audio }]
  const [micOn, setMicOn] = useState(false);
  const [camOn, setCamOn] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [active, setActive] = useState(true);
  const [PshowInfo, setPShowInfo] = useState(false);
  const [chatShow, setChatShow] = useState(false);
  const [screenSharing, setScreenSharing] = useState(false);
  const [waitingForHost, setWaitingForHost] = useState(false);
  const [hostPresent, setHostPresent] = useState(false);

  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]); // [{ peerID, peer, name }]
  const localStream = useRef();
  const roomID = window.location.pathname.split("/meeting/")[1];

  // Prefer a value you store on Join/Host: localStorage.setItem('displayName', 'Alice')
  const displayName = localStorage.getItem("displayName") || "Guest";

  const hostName = res?.host?.name;
  // console.log(res.host);
  
  const joinLink = res?.joinLink;
  const userId = JSON.parse(localStorage?.getItem("user"))?.id;

  function getDeviceId() {
    let id = localStorage.getItem("deviceId");
    if (!id) {
      id = crypto.randomUUID(); // Unique per device
      localStorage.setItem("deviceId", id);
    }
    return id;
  }
  const fakeStream = new MediaStream();

  useEffect(() => {
    socketRef.current = io(
      import.meta.env.VITE_BACKEND || "http://localhost:5000"
    );
    if (!res) {
      navigate(`/join?meetingId=${roomID}`);
    }
    socketRef.current.on("waiting-for-host", () => {
      setWaitingForHost(true);
    });
    socketRef.current.on("duplicate-kicked", () => {
      toast.warning("⚠️ You are already in this meeting on this device.");
      leaveMeeting();
    });

    socketRef.current.on("force-mute", () => {
      const track = localStream.current?.getAudioTracks()?.[0];
      if (track) {
        track.enabled = false;
        setMicOn(track.enabled);

        socketRef.current.emit("media-update", {
          meetingId: roomID,
          peerId: socketRef.current.id,
          stream: localStream.current,
          video: camOn,
          audio: track.enabled,
        });
        toast.error(" Host mute your mic");
      }
      // also update UI + notify others
    });

    socketRef.current.on("removed-by-host", () => {
      leaveMeeting();
      toast.error(" Host removed you from the meeting");
    });

    socketRef.current.on("meeting-ended", () => {
      toast.error("⚠️ Host ended the meeting");
      leaveMeeting();
    });

    socketRef.current.on("host-joined", () => {
      setHostPresent(true);
      setWaitingForHost(false);
    });
    socketRef.current.on("host-left", () => {
      setHostPresent(false);
      setWaitingForHost(true);
      toast.error("Host left. You are waiting until host rejoins.");
    });

    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        // ✅ User allowed permissions
        localStream.current = stream;
        if (userVideo.current) userVideo.current.srcObject = stream;

        joinRoom(camOn , micOn, stream);
      })
      .catch((err) => {
        console.warn("⚠️ User denied mic/camera:", err);

        // Fake stream with empty tracks

        // Add disabled tracks so peers know about this user
        const audioCtx = new AudioContext();
        const oscillator = audioCtx.createOscillator();
        const dst = oscillator.connect(audioCtx.createMediaStreamDestination());
        fakeStream.addTrack(dst.stream.getAudioTracks()[0]);
        oscillator.start();
        oscillator.stop();

        // Create a fake video track (black screen)
        const canvas = document.createElement("canvas");
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const streamTrack = canvas.captureStream().getVideoTracks()[0];
        fakeStream.addTrack(streamTrack);

        joinRoom(false, false, fakeStream);
      });

    function joinRoom(video, audio, stream) {
      socketRef.current.emit("join room", {
        roomID,
        name: displayName,
        userId,
        deviceId: getDeviceId(),
        video,
        audio,
      });

      // Existing users -> create offer for each
      socketRef.current.on("all users", (users = []) => {
        users.forEach(({ socketId, name, audio, video }) => {
          const peer = createPeer(socketId, socketRef.current.id, stream);
          peersRef.current.push({ peerID: socketId, peer, name });
          peer.on("stream", (remoteStream) => {
            addRemoteStream(remoteStream, socketId, name,  video,audio);
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
            // console.log("🔄 Updated remoteStreams:", updated);
            return updated;
          });
        }
      );

      // Remove UI when someone leaves
      socketRef.current.on("participant left", ({ socketId }) => {
        peersRef.current = peersRef.current.filter(
          (p) => p.peerID !== socketId
        );
        setRemoteStreams((prev) => prev.filter((s) => s.peerID !== socketId));
      });
    }

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

  function isScreenShareSupported() {
    return !!navigator.mediaDevices?.getDisplayMedia;
  }

  const toggleScreenShare = async () => {
    if (!screenSharing) {
      try {
        if (!isScreenShareSupported()) {
          toast.error("Screen sharing is not supported on this browser");
          return;
        }
        if (!camOn) {
          toggleCam();
        }
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100,
          },
        });
        const screenTrack = screenStream.getVideoTracks()[0];
        const audioTrack = screenStream.getAudioTracks()[0]; // 🔥 NEW

        // Replace video track in local stream
        peersRef.current.forEach((peerObj) => {
          const videoSender = peerObj.peer._pc
            .getSenders()
            .find((s) => s.track && s.track.kind === "video");
          if (videoSender) videoSender.replaceTrack(screenTrack);

          if (audioTrack) {
            const audioSender = peerObj.peer._pc
              .getSenders()
              .find((s) => s.track && s.track.kind === "audio");
            if (audioSender) audioSender.replaceTrack(audioTrack);
          }
        });

        // Update local video preview
        if (userVideo.current) userVideo.current.srcObject = screenStream;

        // When screen share ends (user presses stop in browser UI)
        screenTrack.onended = () => toggleScreenShare();

        setScreenSharing(true);
      } catch (err) {
        console.error("Error sharing screen:", err);
      }
    } else {
      // Switch back to camera
      const camStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: micOn,
      });

      const camTrack = camStream.getVideoTracks()[0];
      const micTrack = camStream.getAudioTracks()[0];

      peersRef.current.forEach((peerObj) => {
        const videoSender = peerObj.peer._pc
          .getSenders()
          .find((s) => s.track && s.track.kind === "video");
        if (videoSender) videoSender.replaceTrack(camTrack);

        const audioSender = peerObj.peer._pc
          .getSenders()
          .find((s) => s.track && s.track.kind === "audio");
        if (audioSender && micTrack) audioSender.replaceTrack(micTrack);
      });

      // Restore local video preview
      if (userVideo.current) userVideo.current.srcObject = camStream;

      localStream.current = camStream;
      setScreenSharing(false);
    }
  };

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
      track.enabled = !track.enabled||!micOn;
      setMicOn(track.enabled);

      socketRef.current.emit("media-update", {
        meetingId: roomID,
        peerId: socketRef.current.id,
        stream: localStream.current,
        video: camOn,
        audio: track.enabled,
      });
    } else {
      toast.error(
        "Microphone permission denied. Please allow access in your browser settings."
      );
    }
  };

  const toggleCam = () => {
    const track = localStream.current?.getVideoTracks()?.[0];
    if (track) {
      track.enabled = !track.enabled||!camOn;
      setCamOn(track.enabled);

      socketRef.current.emit("media-update", {
        meetingId: roomID,
        peerId: socketRef.current.id,
        stream: localStream.current,
        video: track.enabled,
        audio: micOn,
      });
    } else {
      toast.error(
        "Camera permission denied. Please allow access in your browser settings."
      );
    }
  };
  const leaveMeeting = () => {
    socketRef.current?.disconnect();
    localStream.current?.getTracks().forEach((t) => t.stop());
    window.location.href = "/";
  };
console.log(res?.host?.id +""+userId);

  return waitingForHost && !hostPresent ? (
    <WaitingForHost leaveMeeting={leaveMeeting} />
  ) : (
    <div className="relative flex flex-col min-h-screen bg-background">
      <InfoPanel
        show={showInfo}
        onClose={() => setShowInfo(false)}
        roomID={roomID}
        hostName={hostName}
        joinLink={joinLink}
      />

      <Chat
        show={chatShow}
        onClose={() => setChatShow(false)}
        socket={socketRef.current}
        meetingId={roomID}
        currentUser={displayName}
      />

      <ParticipantsSidebar
        show={PshowInfo}
        onClose={() => setPShowInfo(false)}
        socket={socketRef.current}
        isHost={res?.host?.id != null && userId != null && res?.host?.id == userId}
        roomID={roomID}
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
      <MeetingControl
        active={active}
        setChatShow={setChatShow}
        setPShowInfo={setPShowInfo}
        PshowInfo={PshowInfo}
        chatShow={chatShow}
        screenSharing={screenSharing}
        toggleScreenShare={toggleScreenShare}
        micOn={micOn}
        toggleMic={toggleMic}
        toggleCam={toggleCam}
        camOn={camOn}
        leaveMeeting={leaveMeeting}
      />
    </div>
  );
};

export default MeetingRoom;
