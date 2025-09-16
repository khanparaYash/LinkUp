import React, { useState, useEffect, useRef } from "react";
import { X, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { callApi } from "@/api/callApi";
import { SummaryApi } from "@/common/summaryApi";
import { motion, AnimatePresence } from "framer-motion";

export default function Chat({
  socket,
  meetingId,
  currentUser,
  show,
  onClose,
}) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const panelRef = useRef();

  // 🔹 Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (document.getElementById("chat-toggle-btn")?.contains(e.target)) {
        console.log(document.getElementById("chat-toggle-btn"));
        return;
      }
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    }
    if (show) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [show, onClose]);

  // Fetch history
  useEffect(() => {
    if (!show) return;
    const fetchChatHistory = async () => {
      try {
        const res = await callApi(SummaryApi.get_history, { meetingId });
        setMessages(res.message || []);
      } catch (err) {
        console.error("Failed to fetch chat history", err);
      }
    };
    fetchChatHistory();
  }, [meetingId, show]);

  // Listen for new messages
  useEffect(() => {
    if (!socket) return;
    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });
    return () => socket.off("receiveMessage");
  }, [socket]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    socket.emit("sendMessage", { meetingId, user: currentUser, message });
    setMessage("");
  };

  // Close on ESC
  useEffect(() => {
    if (!show) return;
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [show, onClose]);

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
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          />

          {/* Drawer */}
          <motion.aside
            key="drawer"
            ref={panelRef}
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed z-50 bg-background text-foreground shadow-xl
              w-full lg:w-96 h-1/2 lg:h-full bottom-0 lg:top-0 lg:right-0
              rounded-t-xl lg:rounded-none flex flex-col"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                <h3 className="text-base font-semibold">Meeting Chat</h3>
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
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
              {messages.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center mt-6">
                  No messages yet
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${
                      msg.user.includes("(you)")
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm shadow
                        ${
                          msg.user.includes("(you)")
                            ? "bg-blue-600 text-white"
                            : "bg-muted text-foreground"
                        }`}
                    >
                      {!msg.user.includes("(you)") && (
                        <p className="text-xs font-medium text-primary mb-1">
                          {msg.user}
                        </p>
                      )}
                      <p>{msg.message}</p>
                    </motion.div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={sendMessage}
              className="flex items-center gap-2 border-t border-border p-3 bg-muted/30"
            >
              <Input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-muted/40 border-border"
              />
              <Button
                type="submit"
                size="icon"
                className="bg-blue-600 hover:bg-blue-700 rounded-full"
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
