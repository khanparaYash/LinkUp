import React, { useEffect, useRef, useState } from "react"
import { User, MicOff, Maximize, Minimize } from "lucide-react"

const Video = ({ stream, muted = false, label = "Participant", camOn = true, micOn = true }) => {
  const ref = useRef(null)
  const containerRef = useRef(null)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    if (ref.current && stream) {
      ref.current.srcObject = stream
    }
  }, [stream])

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
      className="relative w-full h-full bg-muted rounded-xl overflow-hidden flex items-center justify-center"
    >
      {/* Video */}
      {stream ? (
        <video
          ref={ref}
          autoPlay
          playsInline
          muted={muted}
          className={`w-full h-full object-cover scale-x-[-1] transition-opacity duration-300 ${
            camOn ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-muted-foreground">
          <User className="w-12 h-12 mb-2" />
          <p className="text-sm">{label}</p>
        </div>
      )}

      {/* Avatar if cam is off */}
      {!camOn && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground bg-black/60">
          <div
            className={`relative flex items-center justify-center rounded-full w-16 h-16 ${
              isSpeaking && micOn ? "ring-4 ring-green-500 animate-pulse" : ""
            }`}
          >
            <User className="w-10 h-10 text-white" />
          </div>
          <p className="text-sm text-white mt-2">{label}</p>
        </div>
      )}

      {/* Label */}
      <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
        {label}
      </div>

      {/* Mic off icon */}
      {!micOn && (
        <div className="absolute bottom-2 right-2 bg-red-600 text-white p-1 rounded-full">
          <MicOff className="w-4 h-4" />
        </div>
      )}

      {/* 🔥 Speaking highlight overlay */}
      {isSpeaking && micOn && camOn && (
        <div className="absolute inset-0 border-4 border-green-500 rounded-xl animate-pulse pointer-events-none" />
      )}

      {/* Fullscreen button */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded hover:bg-black/80 transition"
      >
        {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
      </button>
    </div>
  )
}

export default Video
