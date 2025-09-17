
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
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            Host a Meeting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleHost} className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Set Meeting Password"
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
            <Input
              type="number"
              placeholder="Duration (minutes)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min="5"
              max="180"
              disabled={loading}
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <Loader2 className="animate-spin w-4 h-4 mr-2" />
              ) : (
                "Create Meeting"
              )}
              {loading && "Creating..."}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default HostMeeting;
