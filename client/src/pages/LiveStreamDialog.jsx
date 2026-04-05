import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

function LiveStreamDialog({ 
  show, 
  onClose, 
  isLive, 
  startStream, 
  stopStream, 
  participants 
}) {
  const [rtmpKey, setRtmpKey] = useState(localStorage.getItem("yt_rtmp_key") || "");
  const [selectedPeers, setSelectedPeers] = useState(participants.map(p => p.peerID));

  useEffect(() => {
    setSelectedPeers(participants.map(p => p.peerID));
  }, [participants]);

  const handleStart = () => {
    if (!rtmpKey) {
      alert("Please enter an RTMP Key");
      return;
    }
    localStorage.setItem("yt_rtmp_key", rtmpKey);
    const selectedParticipants = participants.filter(p => selectedPeers.includes(p.peerID));
    startStream(rtmpKey, selectedParticipants);
  };

  const togglePeer = (peerID) => {
    if (selectedPeers.includes(peerID)) {
      setSelectedPeers(selectedPeers.filter(id => id !== peerID));
    } else {
      setSelectedPeers([...selectedPeers, peerID]);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-background border border-border shadow-2xl rounded-2xl p-6 w-full max-w-md m-4">
        <h2 className="text-xl font-bold mb-2">YouTube Live Streaming</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Broadcast the meeting to YouTube using your Stream Key.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Stream Key</label>
            <Input
              type="password"
              placeholder="YouTube Stream Key"
              value={rtmpKey}
              onChange={(e) => setRtmpKey(e.target.value)}
              disabled={isLive}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Select Participants loop</label>
            <div className="max-h-48 overflow-y-auto space-y-2 border border-border rounded-lg p-3 bg-accent/10">
              {participants.map((p) => (
                <div key={p.peerID} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id={p.peerID}
                    checked={selectedPeers.includes(p.peerID)}
                    onChange={() => togglePeer(p.peerID)}
                    disabled={isLive}
                    className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor={p.peerID} className="text-sm font-medium leading-none cursor-pointer">
                    {p.name} {p.isYou && "(You)"}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isLive}>
            Close
          </Button>
          {isLive ? (
            <Button variant="destructive" onClick={stopStream}>
              Stop Broadcast
            </Button>
          ) : (
             <Button onClick={handleStart} className="bg-red-600 hover:bg-red-700 text-white">
              Go Live on YouTube
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default LiveStreamDialog;
