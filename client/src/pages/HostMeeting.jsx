
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { callApi } from "../api/callApi";
import { SummaryApi } from "../common/summaryApi";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";

function HostMeeting() {
  const [password, setPassword] = useState("");
  const [duration, setDuration] = useState(60); // default 60 minutes
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleHost = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        password,
        expiresAt: duration ? new Date(Date.now() + duration * 60000) : null,
      };

      const res = await callApi(SummaryApi.create_meeting, payload);

      localStorage.setItem("displayName",JSON.parse(localStorage.getItem("user")).name );
      toast.success("Meeting created successfully 🎉");
      toast.info(`Meeting ID: ${res.meetingId}`);
      toast.info(`Password: ${password}`);

      navigate(`/meeting/${res.meetingId}`,{ state: {res:res} });
    } catch (err) {
      toast.error(err.msg || "Unable to create meeting");
    } finally {
      setLoading(false);
    }
  };

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
            <span className="text-2xl">🎥</span>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            Host a Meeting
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Create a secure meeting room for your team
          </p>
        </CardHeader>
        <CardContent className="space-y-5">
          <form onSubmit={handleHost} className="space-y-4">
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
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Duration (minutes)
              </label>
              <Input
                type="number"
                placeholder="Meeting duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="5"
                max="180"
                disabled={loading}
                className="h-11 bg-background border-border/50 focus:border-primary/50 transition-colors"
              />
              <p className="text-xs text-muted-foreground">
                Minimum 5 minutes, maximum 180 minutes
              </p>
            </div>

            <Button 
              type="submit" 
              className="w-full h-11 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all font-semibold" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-4 h-4 mr-2" />
                  Creating Meeting...
                </>
              ) : (
                "Create Meeting"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default HostMeeting;
