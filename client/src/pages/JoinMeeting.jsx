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
    <div className="flex justify-center items-center min-h-[calc(100vh-200px)] py-8 px-4 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
      </div>
      
      <Card className="relative w-full max-w-md shadow-2xl border-border/50 bg-card/95 backdrop-blur-md z-10">
        <CardHeader className="space-y-2 text-center pb-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-2">
            <span className="text-2xl">🚀</span>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            Join a Meeting
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Enter meeting details to join
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Meeting ID
              </label>
              <Input
                type="text"
                placeholder="Enter meeting ID"
                value={meetingId}
                onChange={(e) => setMeetingId(e.target.value)}
                required
                disabled={loading}
                className="h-11 bg-background border-border/50 focus:border-primary/50 transition-colors"
              />
            </div>

            {/* Password with toggle */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Meeting Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter meeting password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11 bg-background border-border/50 focus:border-primary/50 transition-colors pr-10"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
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
            </div>

            {/* Guest Name (only if not logged in) */}
            {!isAuthenticated && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Your Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter your display name"
                  value={guestName || ""}
                  onChange={(e) => setGuestName(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11 bg-background border-border/50 focus:border-primary/50 transition-colors"
                />
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all font-semibold" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                  Joining Meeting...
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
