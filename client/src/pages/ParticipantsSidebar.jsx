import React, { useEffect, useRef } from "react";
import { User, Mic, MicOff, Video, VideoOff, X, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ParticipantsSidebar({
  show,
  onClose,
  participants = [],
  isHost,
  socket,
  roomID,
}) {
  const panelRef = useRef();
  console.log(isHost);

  // 🔹 Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (
        document.getElementById("participant-toggle-btn")?.contains(e.target)
      ) {
        return;
      }
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    }
    if (show) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            ref={panelRef}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed z-50 bg-surface shadow-xl text-foreground
              w-full lg:w-96 h-1/2 lg:h-full bottom-0 lg:top-0 lg:right-0
              rounded-t-xl lg:rounded-none overflow-y-auto bg-black/80"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center bg-black/80 justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                <h3 className="text-lg font-semibold">Participants</h3>
                <span className="ml-2 text-sm text-muted-foreground">
                  ({participants.length})
                </span>
              </div>
              <button
                onClick={onClose}
                aria-label="Close participants"
                className="p-2 rounded hover:bg-muted/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="p-3">
              {participants.length === 0 ? (
                <div className="text-sm text-muted-foreground p-4">
                  No participants yet
                </div>
              ) : (
                <ul className="space-y-2">
                  {participants.map((p) => (
                    <motion.li
                      key={p.peerID}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center justify-between gap-3 p-2 rounded-md hover:bg-muted/30"
                    >
                      {/* User Info */}
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 flex items-center justify-center rounded-full bg-muted text-sm font-medium">
                          {p.name ? p.name.charAt(0).toUpperCase() : "U"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {p.name}
                            </span>
                            {p.isYou && (
                              <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                                You
                              </span>
                            )}
                            {p.isHost && (
                              <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                                Host
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status + Host Controls */}
                      <div className="flex items-center gap-2">
                        
                        {/* 🔹 Host-only controls */}
                        {isHost && !p.isYou && (
                          <div className="flex gap-1">
                            {p.micOn && (
                              <button
                                onClick={() =>
                                  socket.emit("host-force-mute", {
                                    roomID,
                                    targetId: p.peerID,
                                  })
                                }
                                className="px-2 py-1 text-xs bg-red-500/80 hover:bg-red-500 text-white rounded"
                              >
                                Mute
                              </button>
                            )}
                            <button
                              onClick={() =>
                                socket.emit("host-remove-user", {
                                  roomID,
                                  targetId: p.peerID,
                                })
                              }
                              className="px-2 py-1 text-xs bg-red-600/80 hover:bg-red-600 text-white rounded"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                        {p.camOn ? (
                          <Video className="w-4 h-4 text-green-500" />
                        ) : (
                          <VideoOff className="w-4 h-4 text-red-500" />
                        )}
                        {p.micOn ? (
                          <Mic className="w-4 h-4 text-green-500" />
                        ) : (
                          <MicOff className="w-4 h-4 text-red-500" />
                        )}

                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
