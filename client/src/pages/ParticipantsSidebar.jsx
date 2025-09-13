import React, { useEffect } from "react";
import { User, Mic, MicOff, Video, VideoOff, X, Users } from "lucide-react";

/**
 * participants: [
 *   { peerID, name, micOn:boolean, camOn:boolean, isYou?:bool, isHost?:bool }
 * ]
 */
export default function ParticipantsSidebar({
  show,
  onClose,
  participants = [],
}) {
  // close on ESC
  useEffect(() => {
    if (!show) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <>
      {/* backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        aria-hidden="true"
      />

      {/* Drawer (desktop: right; mobile: bottom sheet) */}
      <aside
        className={`fixed z-50 bg-surface shadow-xl text-foreground bg-black/60 transition-all
          w-full lg:w-96 h-1/2 lg:h-full bottom-0 lg:top-0 lg:right-0 rounded-t-xl lg:rounded-none overflow-y-auto`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-4 border-b">
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

        <div className="p-3">
          {participants.length === 0 ? (
            <div className="text-sm text-muted-foreground p-4">
              No participants yet
            </div>
          ) : (
            <ul className="space-y-2">
              {participants.map((p) => (
                <li
                  key={p.peerID}
                  className="flex items-center justify-between gap-3 p-2 rounded-md hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    {/* avatar (initial) */}
                    <div className="w-10 h-10 flex items-center justify-center rounded-full bg-muted text-sm font-medium">
                      {p.name ? p.name.charAt(0).toUpperCase() : "U"}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {p.name}
                        </span>
                        {p.isYou && (
                          <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">You</span>
                        )}
                        {p.isHost && (
                          <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-700">Host</span>
                        )}
                      </div>
                      {/* <div className="text-xs text-muted-foreground">
                        {p.peerID}
                      </div> */}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* camera */}
                    {p.camOn ? (
                      <Video className="w-4 h-4 text-green-500" />
                    ) : (
                      <VideoOff className="w-4 h-4 text-red-500" />
                    )}

                    {/* mic */}
                    {p.micOn ? (
                      <Mic className="w-4 h-4 text-green-500" />
                    ) : (
                      <MicOff className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </>
  );
}
