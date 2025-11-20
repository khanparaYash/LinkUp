import React, { useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/Button"
import { Link as LinkIcon, X } from "lucide-react"
import { toast } from "sonner";

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

  // 🔹 Close on ESC
  useEffect(() => {
    if (!show) return
    const handleEsc = (e) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", handleEsc)
    return () => window.removeEventListener("keydown", handleEsc)
  }, [show, onClose])

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Invite link copied", {
        description: "You can now share it with others.",
      })
    } catch (err) {
      console.error("Copy failed", err)
    }
  }

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60"
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ duration: 0.3 }}
            ref={panelRef}
            className="fixed top-0 right-0 h-full w-80 sm:w-96
                       bg-background/95 backdrop-blur-md text-foreground 
                       border-l border-border/50 
                       shadow-2xl z-50 
                       flex flex-col"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-5 sm:p-6 border-b border-border/50 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">ℹ️</span>
                </div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Meeting Details
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-accent/50 transition-colors border border-border/50"
                aria-label="Close details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-5 sm:p-6 space-y-6 text-sm overflow-y-auto">
              <div className="space-y-2 p-4 rounded-xl bg-accent/30 border border-border/50">
                <p className="text-muted-foreground text-xs uppercase tracking-wide font-semibold">
                  Meeting ID
                </p>
                <p className="font-mono font-bold text-base text-foreground break-all">{roomID}</p>
              </div>

              <div className="space-y-2 p-4 rounded-xl bg-accent/30 border border-border/50">
                <p className="text-muted-foreground text-xs uppercase tracking-wide font-semibold">
                  Host
                </p>
                <p className="font-semibold text-base text-foreground">{hostName}</p>
              </div>

              <div className="space-y-2 p-4 rounded-xl bg-accent/30 border border-border/50">
                <p className="text-muted-foreground text-xs uppercase tracking-wide font-semibold mb-2">
                  Invite Link
                </p>
                <a
                  href={joinLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline break-words text-sm font-medium block"
                >
                  {joinLink}
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="p-5 sm:p-6 border-t border-border/50 bg-background/50">
              <Button 
                onClick={() => copyToClipboard(joinLink)} 
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all font-semibold"
              >
                <LinkIcon className="w-4 h-4 mr-2" /> Copy Invite Link
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default InfoPanel
