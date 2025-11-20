import React, { useEffect, useRef, useState } from "react"
import { User, MicOff, Maximize, Minimize, Monitor } from "lucide-react"

const Video = ({ stream, muted = false, label = "Participant", camOn = true, micOn = true, isScreenShare = false }) => {
  const ref = useRef(null)
  const containerRef = useRef(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // Detect if stream is screen share
  const checkIsScreenShare = () => {
    if (!stream) return false
    const videoTrack = stream.getVideoTracks()[0]
    if (!videoTrack) return false
    // Screen share tracks typically have "screen" in their label
    return videoTrack.label.toLowerCase().includes('screen') || 
           videoTrack.label.toLowerCase().includes('display') ||
           videoTrack.label.toLowerCase().includes('monitor') ||
           videoTrack.label.toLowerCase().includes('window')
  }

  const isScreen = isScreenShare || checkIsScreenShare()

  useEffect(() => {
    if (ref.current && stream) {
      ref.current.srcObject = stream
    }
  }, [stream])

  // Ensure screen shares are never flipped - remove any transform
  useEffect(() => {
    if (ref.current) {
      if (isScreen) {
        // Screen share: no mirroring, ensure normal orientation
        ref.current.style.transform = 'scaleX(1)'
      } else {
        // Camera: mirror for self-view (only if it's the local user)
        // We'll handle this via CSS class instead
      }
    }
  }, [isScreen, stream])

  // 🎤 Speaking detection
  useEffect(() => {
    if (!stream || !micOn) return
    const audioContext = new AudioContext()
    const source = audioContext?.createMediaStreamSource(stream)
    const analyser = audioContext?.createAnalyser()
    analyser.fftSize = 512
    source.connect(analyser)

    const dataArray = new Uint8Array(analyser.frequencyBinCount)

    const checkSpeaking = () => {
      analyser.getByteFrequencyData(dataArray)
      const volume = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
      setIsSpeaking(volume > 20) // threshold for speech
      requestAnimationFrame(checkSpeaking)
    }
    checkSpeaking()
    return () => {
      audioContext.close()
    }
  }, [stream, micOn])

  // 🔳 Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl overflow-hidden flex items-center justify-center shadow-2xl border border-slate-700/50 group hover:border-slate-600/70 transition-all duration-300 hover:shadow-3xl hover:scale-[1.01]"
    >
      {/* Video */}
      {stream ? (
        <video
          ref={ref}
          autoPlay
          playsInline
          muted={muted}
          className={`w-full h-full transition-all duration-300 ${
            isScreen ? "object-contain" : "object-cover"
          } ${!isScreen && muted ? "scale-x-[-1]" : ""} ${camOn ? "opacity-100" : "opacity-0"}`}
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-muted-foreground">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4 ring-4 ring-indigo-500/20">
            <User className="w-10 h-10 text-indigo-400" />
          </div>
          <p className="text-sm font-semibold text-slate-300">{label}</p>
        </div>
      )}

      {/* Screen Share Badge */}
      {isScreen && (
        <div className="absolute top-3 left-3 bg-indigo-600/90 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-full font-semibold shadow-lg border border-indigo-400/30 flex items-center gap-1.5 z-10">
          <Monitor className="w-3.5 h-3.5" />
          <span>Screen Share</span>
        </div>
      )}

      {/* Avatar if cam is off */}
      {!camOn && !isScreen && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-sm">
          <div
            className={`relative flex items-center justify-center rounded-full w-20 h-20 bg-gradient-to-br from-indigo-500/30 via-purple-500/30 to-pink-500/30 transition-all duration-300 ${
              isSpeaking && micOn ? "ring-4 ring-green-500/80 ring-offset-2 ring-offset-slate-900 animate-pulse scale-110" : "ring-2 ring-slate-700/50"
            }`}
          >
            <User className="w-10 h-10 text-white" />
          </div>
          <p className="text-sm text-white mt-3 font-medium">{label}</p>
        </div>
      )}

      {/* Label */}
      <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg font-semibold shadow-xl border border-white/10 flex items-center gap-2 z-10">
        {isScreen && <Monitor className="w-3.5 h-3.5 text-indigo-400" />}
        <span>{label}</span>
      </div>

      {/* Mic off icon */}
      {!micOn && (
        <div className="absolute bottom-3 right-3 bg-red-600/90 backdrop-blur-md text-white p-2 rounded-full shadow-xl border border-red-400/30 z-10 hover:bg-red-500/90 transition-colors">
          <MicOff className="w-4 h-4" />
        </div>
      )}

      {/* 🔥 Speaking highlight overlay */}
      {isSpeaking && micOn && camOn && !isScreen && (
        <div className="absolute inset-0 border-4 border-green-500/80 rounded-2xl animate-pulse pointer-events-none shadow-[0_0_30px_rgba(34,197,94,0.5)]" />
      )}

      {/* Fullscreen button */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white p-2 rounded-lg hover:bg-black/90 transition-all duration-200 shadow-lg border border-white/10 z-10 hover:scale-110 active:scale-95"
        aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
      </button>

      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none rounded-2xl" />
    </div>
  )
}

export default Video
