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
import LiveStreamDialog from "./LiveStreamDialog";


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
  const [showLiveDialog, setShowLiveDialog] = useState(false);
  const [isLive, setIsLive] = useState(false);

  const mediaRecorderRef = useRef(null);
  const mixerVideoRefs = useRef([]);
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const audioCtxRef = useRef(null);

  const socketRef = useRef();
  const userVideo = useRef();
  const peersRef = useRef([]); // [{ peerID, peer, name }]
  const localStream = useRef();
  const roomID = window.location.pathname.split("/meeting/")[1];

  // Prefer a value you store on Join/Host: localStorage.setItem('displayName', 'Alice')
  const displayName = localStorage.getItem("displayName") || "Guest";

  const hostName = res?.host?.name;
  const joinLink = res?.joinLink;
  const userId = JSON.parse(localStorage?.getItem("user"))?.id;
  const isHost = res?.host?._id != null && userId != null && res?.host?._id == userId;

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
    
    socketRef.current.on("live-stream-stopped", () => {
      setIsLive(false);
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
      cancelAnimationFrame(animFrameRef.current);
      if (mediaRecorderRef.current) {
         mediaRecorderRef.current.stop();
      }
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

  const startStream = async (rtmpKey, selectedParticipants) => {
    if (!canvasRef.current) return;
    try {
      const rtmpUrl = `rtmp://a.rtmp.youtube.com/live2/${rtmpKey}`;

      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const destination = audioCtx.createMediaStreamDestination();

      mixerVideoRefs.current.forEach(v => { v.pause(); v.srcObject = null; });
      mixerVideoRefs.current = [];

      selectedParticipants.forEach(p => {
        let stream;
        if (p.isYou) {
          stream = localStream.current;
        } else {
          const remoteP = remoteStreams.find(s => s.peerID === p.peerID);
          if (remoteP) stream = remoteP.stream;
        }

        if (stream) {
          const audioTracks = stream.getAudioTracks();
          if (audioTracks.length > 0) {
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(destination);
          }
          const videoTracks = stream.getVideoTracks();
          if (videoTracks.length > 0) {
            const vEl = document.createElement("video");
            vEl.srcObject = stream;
            vEl.muted = true;
            vEl.playsInline = true;
            vEl.play().catch(e => console.error("Video play error:", e));
            mixerVideoRefs.current.push(vEl);
          }
        }
      });

      const canvas = canvasRef.current;
      canvas.width = 1280;
      canvas.height = 720;
      const ctx = canvas.getContext("2d");

      const drawMixer = () => {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const count = mixerVideoRefs.current.length;
        if (count > 0) {
          let cols = 1;
          let rows = 1;
          if (count === 2) { cols = 2; rows = 1; }
          else if (count <= 4) { cols = 2; rows = 2; }
          else if (count <= 9) { cols = 3; rows = 3; }
          else { cols = 4; rows = 4; }

          const cellW = canvas.width / cols;
          const cellH = canvas.height / rows;

          mixerVideoRefs.current.forEach((vEl, idx) => {
            const c = idx % cols;
            const r = Math.floor(idx / cols);
            const x = c * cellW;
            const y = r * cellH;
            ctx.drawImage(vEl, x, y, cellW, cellH);
          });
        }
        animFrameRef.current = requestAnimationFrame(drawMixer);
      };
      drawMixer();

      const canvasStream = canvas.captureStream(30);
      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...destination.stream.getAudioTracks()
      ]);

      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: "video/webm;codecs=vp8,opus",
        videoBitsPerSecond: 2500000 
      });

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0 && socketRef.current) {
          socketRef.current.emit("stream-data", { roomID, chunk: e.data });
        }
      };

      mediaRecorderRef.current = mediaRecorder;
      socketRef.current.emit("start-live-stream", { roomID, rtmpUrl });
      mediaRecorder.start(250);
      
      setIsLive(true);
      setShowLiveDialog(false);
      toast.success("Broadcast started");
    } catch (error) {
      console.error("Live streaming error", error);
      toast.error("Failed to start broadcast. Make sure selected streams have video/audio.");
    }
  };

  const stopStream = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    cancelAnimationFrame(animFrameRef.current);
    mixerVideoRefs.current.forEach(v => { v.pause(); v.srcObject = null; });
    mixerVideoRefs.current = [];
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(console.error);
    }
    
    socketRef.current?.emit("stop-live-stream", { roomID });
    setIsLive(false);
    toast.info("Broadcast stopped");
  };

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
  // console.log(res?.host?._id +"   "+userId);

  return waitingForHost && !hostPresent ? (
    <WaitingForHost leaveMeeting={leaveMeeting} />
  ) : (
    <div className="relative flex flex-col min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <InfoPanel
        show={showInfo}
        onClose={() => setShowInfo(false)}
        roomID={roomID}
        hostName={hostName}
        joinLink={joinLink}
      />
      
      <canvas ref={canvasRef} className="hidden" />
      <LiveStreamDialog 
        show={showLiveDialog}
        onClose={() => setShowLiveDialog(false)}
        isLive={isLive}
        startStream={startStream}
        stopStream={stopStream}
        participants={[
          {
            peerID: socketRef.current?.id,
            name: displayName,
            isYou: true,
          },
          ...remoteStreams.map((p) => ({
            peerID: p.peerID,
            name: p.name,
            isYou: false,
          })),
        ]}
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
        isHost={res?.host?._id != null && userId != null && res?.host?._id == userId}
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
        className={`absolute top-0 left-0 w-full flex justify-between items-center px-4 sm:px-6 py-3 sm:py-4 transition-all duration-300 ${
          active ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
        } bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-2xl z-10`}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg ring-1 ring-white/10">
              <span className="text-white text-sm font-bold">LU</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-background shadow" />
          </div>
          <div className="leading-tight">
            <h1 className="text-base sm:text-lg font-extrabold tracking-tight">
              Meeting{" "}
              <span className="text-muted-foreground font-mono text-sm sm:text-base font-semibold">
                #{roomID}
              </span>
            </h1>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="hidden sm:inline">Connected</span>
              {screenSharing && (
                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 border border-indigo-500/20">
                  Sharing screen
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowInfo(true)}
            className="hover:bg-accent/60 border-border/60 transition-all shadow-sm hover:shadow-md"
          >
            <Info className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={leaveMeeting}
            className="bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all"
          >
            <PhoneOff className="w-4 h-4 mr-2" /> 
            <span className="hidden sm:inline">Leave</span>
          </Button>
        </div>
      </header>

      {/* Video Grid */}
      <main className="flex-1 w-full max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5 px-4 sm:px-6 lg:px-8 pt-20 pb-28">
        <Card className="overflow-hidden bg-card/70 backdrop-blur-xl border-border/50">
          <Video
            stream={localStream.current}
            muted
            label={displayName + " (You)"}
            camOn={camOn}
            micOn={micOn}
            isScreenShare={screenSharing}
          />
        </Card>

        {remoteStreams.map(({ stream, peerID, name, video, audio }) => (
          <Card key={peerID} className="overflow-hidden bg-card/70 backdrop-blur-xl border-border/50">
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
        isHost={res?.host?._id != null && userId != null && res?.host?._id == userId}
        isLive={isLive}
        toggleLive={() => setShowLiveDialog(true)}
      />
    </div>
  );
};

export default MeetingRoom;
