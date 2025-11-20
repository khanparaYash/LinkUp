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
      className={`fixed bottom-0 left-0 w-full flex justify-center items-center gap-3 sm:gap-4 p-4 sm:p-5 transition-all duration-300 ${
        active ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      } bg-background/95 backdrop-blur-xl border-t border-border/50 shadow-2xl z-40`}
    >
      <div className="flex items-center gap-2 sm:gap-3 bg-accent/30 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-2xl border border-border/50">
        <Button
          onClick={() => setPShowInfo((p) => !p)}
          variant={PshowInfo ? "default" : "ghost"}
          size="icon"
          id="participant-toggle-btn"
          className={`h-10 w-10 rounded-xl transition-all ${
            PshowInfo 
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg" 
              : "hover:bg-accent/50"
          }`}
        >
          <Users className="w-5 h-5" />
        </Button>

        <Button
          onClick={() => setChatShow((p) => !p)}
          variant={chatShow ? "default" : "ghost"}
          size="icon"
          id="chat-toggle-btn"
          className={`h-10 w-10 rounded-xl transition-all ${
            chatShow 
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg" 
              : "hover:bg-accent/50"
          }`}
        >
          <MessageCircleMore className="w-5 h-5" />
        </Button>

        <div className="w-px h-6 bg-border/50 mx-1" />

        <Button
          variant={screenSharing ? "default" : "ghost"}
          size="icon"
          onClick={toggleScreenShare}
          className={`h-10 w-10 rounded-xl transition-all ${
            screenSharing 
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg" 
              : "hover:bg-accent/50"
          }`}
        >
          {screenSharing ? (
            <ScreenShareOff className="w-5 h-5" />
          ) : (
            <ScreenShare className="w-5 h-5" />
          )}
        </Button>

        <Button
          variant={micOn ? "default" : "ghost"}
          size="icon"
          onClick={toggleMic}
          className={`h-10 w-10 rounded-xl transition-all ${
            micOn 
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg" 
              : "bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-400"
          }`}
        >
          {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </Button>

        <Button
          variant={camOn ? "default" : "ghost"}
          size="icon"
          onClick={toggleCam}
          className={`h-10 w-10 rounded-xl transition-all ${
            camOn 
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg" 
              : "bg-red-500/20 hover:bg-red-500/30 text-red-600 dark:text-red-400"
          }`}
        >
          {camOn ? (
            <VideoIcon className="w-5 h-5" />
          ) : (
            <VideoOff className="w-5 h-5" />
          )}
        </Button>

        <div className="w-px h-6 bg-border/50 mx-1" />

        <Button 
          variant="destructive" 
          size="icon" 
          onClick={leaveMeeting}
          className="h-10 w-10 rounded-xl bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all"
        >
          <PhoneOff className="w-5 h-5" />
        </Button>
      </div>
    </footer>
  );
}

export default MeetingControl;
