import React from "react"
import { Hourglass, LogOut } from "lucide-react"
import { Button } from "@/components/ui/Button"

const WaitingForHost = ({ leaveMeeting }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background via-background to-accent/5 text-foreground space-y-8 px-4">
      {/* Icon + Title */}
      <div className="flex flex-col items-center space-y-4 text-center max-w-md">
        <div className="p-6 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/30 shadow-lg">
          <Hourglass className="w-16 h-16 text-yellow-500 dark:text-yellow-400 animate-pulse" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
          Waiting for Host
        </h2>
        <p className="text-base text-muted-foreground leading-relaxed">
          The meeting will begin once the host joins. Please stay on this page.
        </p>
      </div>

      {/* Leave Button */}
      <Button 
        variant="destructive"
        size="lg"
        onClick={leaveMeeting}
        className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all px-6"
      >
        <LogOut className="w-4 h-4" />
        <span>Leave Meeting</span>
      </Button>
    </div>
  )
}

export default WaitingForHost
