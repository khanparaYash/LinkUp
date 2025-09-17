import React from "react";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  Users,
  MessageCircleMore,
  ScreenShare,
  ScreenShareOff,
} from "lucide-react";

import { Button } from "@/components/ui/Button";

function MeetingControl({active,setChatShow,setPShowInfo,PshowInfo,chatShow,screenSharing,toggleScreenShare,micOn,toggleMic,toggleCam,camOn,leaveMeeting}) {
  return (
    <footer
      className={`fixed bottom-0 left-0 w-full flex justify-center items-center gap-6 p-4 transition-opacity duration-300 ${
        active ? "opacity-100" : "opacity-0 pointer-events-none"
      } bg-background/80 backdrop-blur-md border-t `}
    >
      <Button
        onClick={() => setPShowInfo((p) => !p)}
        variant={PshowInfo ? "default" : "secondary"}
        id="participant-toggle-btn"
      >
        <Users className="w-5 h-5" />
      </Button>

      <Button
        onClick={() => setChatShow((p) => !p)}
        variant={chatShow ? "default" : "secondary"}
        id="chat-toggle-btn"
      >
        <MessageCircleMore className="w-5 h-5" />
      </Button>

      <Button
        variant={screenSharing ? "default" : "secondary"}
        size="icon"
        onClick={toggleScreenShare}
      >
        {screenSharing ? (
          <ScreenShareOff className="w-5 h-5" />
        ) : (
          <ScreenShare className="w-5 h-5" />
        )}
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
  );
}

export default MeetingControl;
