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
            className="fixed z-50 bg-background/95 backdrop-blur-xl shadow-2xl text-foreground
              w-full lg:w-96 h-1/2 lg:h-full bottom-0 lg:top-0 lg:right-0
              rounded-t-2xl lg:rounded-none overflow-hidden flex flex-col border-l border-border/50"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-border/50 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                    Participants
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {participants.length} {participants.length === 1 ? 'person' : 'people'}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close participants"
                className="p-2 rounded-lg hover:bg-accent/50 transition-colors border border-border/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
              {participants.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No participants yet</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {participants.map((p, index) => (
                    <motion.li
                      key={p.peerID}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="group flex items-center justify-between gap-3 p-3 rounded-xl bg-accent/30 border border-border/50 hover:bg-accent/50 hover:border-border transition-all duration-200"
                    >
                      {/* User Info */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold text-sm flex-shrink-0 ring-2 ring-indigo-500/20">
                          {p.name ? p.name.charAt(0).toUpperCase() : "U"}
                          {p.camOn && (
                            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background"></span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-semibold text-sm text-foreground truncate">
                              {p.name}
                            </span>
                            {p.isYou && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-medium border border-indigo-500/30">
                                You
                              </span>
                            )}
                            {p.isHost && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 font-medium border border-amber-500/30">
                                Host
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Status + Host Controls */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Status Icons */}
                        <div className="flex items-center gap-1.5">
                          {p.camOn ? (
                            <div className="p-1.5 rounded-lg bg-green-500/20 border border-green-500/30">
                              <Video className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                          ) : (
                            <div className="p-1.5 rounded-lg bg-red-500/20 border border-red-500/30">
                              <VideoOff className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </div>
                          )}
                          {p.micOn ? (
                            <div className="p-1.5 rounded-lg bg-green-500/20 border border-green-500/30">
                              <Mic className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                          ) : (
                            <div className="p-1.5 rounded-lg bg-red-500/20 border border-red-500/30">
                              <MicOff className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* 🔹 Host-only controls */}
                        {isHost && !p.isYou && (
                          <div className="flex gap-1.5 ml-2">
                            {p.micOn && (
                              <button
                                onClick={() =>
                                  socket.emit("host-force-mute", {
                                    roomID,
                                    targetId: p.peerID,
                                  })
                                }
                                className="px-3 py-1.5 text-xs font-medium bg-red-500/90 hover:bg-red-500 text-white rounded-lg transition-all hover:scale-105 shadow-md hover:shadow-lg"
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
                              className="px-3 py-1.5 text-xs font-medium bg-red-600/90 hover:bg-red-600 text-white rounded-lg transition-all hover:scale-105 shadow-md hover:shadow-lg"
                            >
                              Remove
                            </button>
                          </div>
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
