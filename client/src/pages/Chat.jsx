import React, { useState, useEffect, useRef } from "react"
import { X, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { callApi } from "@/api/callApi"
import { SummaryApi } from "@/common/summaryApi"

export default function Chat({ socket, meetingId, currentUser, show, onClose }) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([])
  useEffect(() => {
    if (!show) return
    const fetchChatHistory = async () => {
      try {
        const res = await callApi(SummaryApi.get_history, { meetingId })
        setMessages(res.message || [])
      } catch (err) {
        console.error("Failed to fetch chat history", err)
      }
    }
    fetchChatHistory()
  }, [meetingId, show])

  // Listen for new messages
  useEffect(() => {
    if (!socket) return
    socket.on("receiveMessage", (history) => {
      setMessages((prev) => [...prev, history])
    })
    return () => {
      socket.off("receiveMessage")
    }
  }, [socket])

  const sendMessage = (e) => {
    e.preventDefault()
    if (!message.trim()) return

    socket.emit("sendMessage", {
      meetingId,
      user: currentUser,
      message,
    })

    setMessage("")
  }

  // Close on ESC
  useEffect(() => {
    if (!show) return
    const onKey = (e) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [show, onClose])

  if (!show) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        aria-hidden="true"
      />

      {/* Drawer (desktop: right; mobile: bottom sheet) */}
      <aside
        className={`fixed z-50 bg-surface shadow-xl text-foreground bg-background transition-all
          w-full lg:w-96 h-1/2 lg:h-full bottom-0 lg:top-0 lg:right-0 rounded-t-xl lg:rounded-none flex flex-col`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <MessageCircle className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Chat</h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close chat"
            className="p-2 rounded hover:bg-muted/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-muted/40">
          {messages.length === 0 ? (
            <div className="text-sm text-muted-foreground p-4">
              No messages yet
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-md max-w-[75%] ${
                  msg.user === currentUser
                    ? "ml-auto bg-blue-600 text-white"
                    : "mr-auto bg-muted text-foreground"
                }`}
              >
                {msg.user !== currentUser && (
                  <span className="block font-semibold text-sm text-primary">
                    {msg.user}
                  </span>
                )}
                <span className="text-sm">{msg.message}</span>
              </div>
            ))
          )}
          
        </div>

        {/* Input */}
        <form
          onSubmit={sendMessage}
          className="flex items-center gap-2 border-t p-2"
        >
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border rounded px-3 py-2 text-sm"
          />
          <Button type="submit" className="shrink-0">
            Send
          </Button>
        </form>
      </aside>
    </>
  )
}
