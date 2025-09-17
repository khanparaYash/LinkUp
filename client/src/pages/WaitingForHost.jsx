import React from "react"
import { Hourglass, LogOut } from "lucide-react"
import { Button } from "@/components/ui/Button"

const WaitingForHost = ({ leaveMeeting }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground space-y-6">
      {/* Icon + Title */}
      <div className="flex flex-col items-center space-y-3">
        <div className="p-4 rounded-full bg-muted/20">
          <Hourglass className="w-12 h-12 text-yellow-500 animate-pulse" />
        </div>
        <h2 className="text-2xl font-bold text-center">
          Waiting for host to start the meeting...
        </h2>
        <p className="text-sm text-muted-foreground">
          Please stay on this page until the host joins.
        </p>
      </div>

      {/* Leave Button */}
      <Button 
        variant="destructive"
        size="lg"
        onClick={leaveMeeting}
        className="flex items-center space-x-2"
      >
        <LogOut className="w-4 h-4" />
        <span>Leave Meeting</span>
      </Button>
    </div>
  )
}

export default WaitingForHost
