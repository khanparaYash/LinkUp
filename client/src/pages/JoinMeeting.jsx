import { useEffect, useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { callApi } from "../api/callApi"
import { SummaryApi } from "../common/summaryApi"
import { toast } from "sonner"
import { Loader2, Eye, EyeOff } from "lucide-react"
import { useSelector } from "react-redux"

function JoinMeeting() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated } = useSelector((state) => state.auth)

  const [meetingId, setMeetingId] = useState("")
  const [password, setPassword] = useState("")
  const [guestName, setGuestName] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // 🔹 Auto-fill if link has query params
  useEffect(() => {
    const id = searchParams.get("meetingId")
    const pwd = searchParams.get("pwd")
    if (id) setMeetingId(id)
    if (pwd) setPassword(pwd)
  }, [searchParams])

  const handleJoin = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = { meetingId, password }
      if (!isAuthenticated) {
        payload.guestName = guestName || localStorage.getItem("displayName")||"guest"
      }else{
        payload.guestName = JSON.parse(localStorage.getItem("user")).name||"guest"

        // console.log(payload);
        
      }
      
      
      
      
      const res = await callApi(SummaryApi.join_meeting, payload)
      
      localStorage.setItem("displayName",guestName|| payload.guestName);
      toast.success("Joined meeting successfully 🎉");
      navigate(`/meeting/${res?.meetingId}`,{ state: {res}});
    } catch (err) {
      toast.error(err.msg || "Unable to join meeting")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Join a Meeting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="space-y-4">
            <Input
              type="text"
              placeholder="Meeting ID"
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              required
              disabled={loading}
            />

            {/* Password with toggle */}
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Meeting Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Guest Name (only if not logged in) */}
            {!isAuthenticated && (
              <Input
                type="text"
                placeholder="Your Name"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
                disabled={loading}
              />
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                  Joining...
                </>
              ) : (
                "Join Meeting"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default JoinMeeting
