import React, { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Link as LinkIcon, X } from "lucide-react"

const InfoPanel = ({ show, onClose, roomID, hostName, joinLink }) => {
  const panelRef = useRef()

  // 🔹 Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose()
      }
    }
    if (show) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [show, onClose])

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert("✅ Invite link copied")
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 300, opacity: 0 }}
          transition={{ duration: 0.3 }}
          ref={panelRef}
          className="fixed top-0 right-0 h-full w-80 
                     bg-background text-foreground 
                     border-l border-border 
                     shadow-xl z-50 
                     flex flex-col rounded-l-2xl"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b border-border">
            <h2 className="text-base font-semibold tracking-tight">Meeting Details</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 p-5 space-y-4 text-sm overflow-y-auto">
            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">
                Meeting ID
              </p>
              <p className="font-medium">{roomID}</p>
            </div>

            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">
                Host
              </p>
              <p className="font-medium">{hostName}</p>
            </div>

            <div>
              <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">
                Invite Link
              </p>
              <a
                href={joinLink}
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline break-words text-sm"
              >
                {joinLink}
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <Button onClick={() => copyToClipboard(joinLink)} className="w-full">
              <LinkIcon className="w-4 h-4 mr-2" /> Copy Invite Link
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default InfoPanel
