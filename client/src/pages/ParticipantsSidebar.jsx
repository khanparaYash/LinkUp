import { User, Mic, MicOff, Video, VideoOff } from "lucide-react"

export default function ParticipantsSidebar({ participants }) {
  return (
    <div className="w-64 bg-gray-900 text-white rounded-xl p-4 shadow-lg">
      <h2 className="text-lg font-semibold mb-3">Participants ({participants.length})</h2>
      <ul className="space-y-2">
        {participants.map((p) => (
          <li
            key={p.peerId}
            className="flex items-center justify-between bg-gray-800 p-2 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <User className="w-5 h-5" />
              <span>{p.name}</span>
            </div>
            <div className="flex gap-2">
              {p.micOn ? (
                <Mic className="w-4 h-4 text-green-400" />
              ) : (
                <MicOff className="w-4 h-4 text-red-400" />
              )}
              {p.camOn ? (
                <Video className="w-4 h-4 text-green-400" />
              ) : (
                <VideoOff className="w-4 h-4 text-red-400" />
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
