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
            className="fixed top-0 right-0 h-full w-80 
                       bg-background text-foreground 
                       border-l border-border 
                       shadow-xl z-50 
                       flex flex-col rounded-l-2xl"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-border">
              <h2 className="text-base font-semibold tracking-tight">Meeting Details</h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-muted transition-colors"
                aria-label="Close details"
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
        </>
      )}
    </AnimatePresence>
  )
}

export default InfoPanel
