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
            className="fixed z-50 bg-background/95 backdrop-blur-xl text-foreground shadow-2xl
              w-full lg:w-96 h-1/2 lg:h-full bottom-0 lg:top-0 lg:right-0
              rounded-t-2xl lg:rounded-none flex flex-col border-l border-border/50"
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 sm:p-6 border-b border-border/50 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                    Meeting Chat
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {messages.length} {messages.length === 1 ? 'message' : 'messages'}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Close chat"
                className="p-2 rounded-lg hover:bg-accent/50 transition-colors border border-border/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-gradient-to-b from-background to-accent/5">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center mb-4">
                    <MessageCircle className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground">No messages yet</p>
                  <p className="text-xs text-muted-foreground mt-1">Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0.9, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: idx * 0.02 }}
                    className={`flex ${
                      msg.user.includes("(you)")
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm shadow-lg backdrop-blur-sm
                        ${
                          msg.user.includes("(you)")
                            ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white"
                            : "bg-accent/50 border border-border/50 text-foreground"
                        }`}
                    >
                      {!msg.user.includes("(you)") && (
                        <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1.5">
                          {msg.user.replace("(you)", "")}
                        </p>
                      )}
                      <p className="leading-relaxed">{msg.message}</p>
                    </div>
                  </motion.div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              onSubmit={sendMessage}
              className="flex items-center gap-2 border-t border-border/50 p-4 sm:p-5 bg-background/50 backdrop-blur-sm"
            >
              <Input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 bg-background/80 border-border/50 focus:border-indigo-500/50 rounded-xl h-11"
              />
              <Button
                type="submit"
                size="icon"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl h-11 w-11 shadow-lg hover:shadow-xl transition-all"
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
