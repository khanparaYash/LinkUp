// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { v4 as uuidV4 } from "uuid";
// import Card from "../components/ui/Card";
// import Button from "../components/ui/Button";

// export default function HostMeeting() {
//   const navigate = useNavigate();
//   const [id, setId] = useState("");

//   const create = () => {
//     const newId = uuidV4();
//     setId(newId);
//     navigate(`/meeting/${newId}`);
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-slate-900 p-4">
//       <Card className="max-w-md w-full text-center rounded-2xl shadow-lg p-8">
//         <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
//           Host a Meeting
//         </h1>
//         <p className="text-sm text-gray-500 dark:text-gray-300 mb-6">
//           Click the button below to create a new meeting room.
//         </p>

//         <Button onClick={create} className="w-full mb-4">
//           Create Room
//         </Button>

//         {id && (
//           <p className="text-gray-700 dark:text-gray-200 mt-2 break-words">
//             Meeting ID: <span className="font-mono">{id}</span>
//           </p>
//         )}
//       </Card>
//     </div>
//   );
// }

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

      navigate(`/meeting/${res.meetingId}`,{ state: res });
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
