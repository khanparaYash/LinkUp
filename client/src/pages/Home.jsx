// src/pages/Home.jsx
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/slices/authSlice";
import { Video, Users, Shield, Zap } from "lucide-react";

export default function Home() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  return (
    <div className="relative flex flex-col items-center justify-center text-center py-12 sm:py-16 lg:py-24 space-y-12 px-4 overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 50, 0],
            y: [0, -100, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Hero Section */}
      <motion.div
        className="relative space-y-8 max-w-5xl mx-auto z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 backdrop-blur-sm mb-4"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Zap className="w-4 h-4 text-indigo-500" />
          <span className="text-sm font-medium bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
            Modern Video Conferencing
          </span>
        </motion.div>

        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-tight"
        >
          <span className="block">Welcome to</span>
          <span className="block bg-gradient-to-r from-indigo-600 via-purple-600 via-pink-600 to-indigo-600 dark:from-indigo-400 dark:via-purple-400 dark:via-pink-400 dark:to-indigo-400 bg-clip-text text-transparent bg-[length:200%_auto] animate-[shimmer_3s_linear_infinite]">
            LinkUp
          </span>
        </motion.h1>

        <motion.p
          className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Secure, simple, and fast video meetings. Host or join a meeting in
          seconds — no hassle, no limits.
        </motion.p>

        {/* Feature Pills */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {[
            { icon: Shield, text: "Secure" },
            { icon: Zap, text: "Fast" },
            { icon: Users, text: "Collaborative" },
            { icon: Video, text: "HD Quality" },
          ].map((feature, index) => (
            <motion.div
              key={feature.text}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-md border border-border/50 shadow-sm hover:shadow-md transition-all hover:scale-105"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
            >
              <feature.icon className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-medium">{feature.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* CTA Buttons */}
      <motion.div
        className="relative flex flex-wrap gap-4 justify-center items-center z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {/* Always allow joining */}
        <Link to="/join">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              size="lg" 
              className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 text-white border-0 shadow-2xl hover:shadow-indigo-500/50 transition-all px-8 sm:px-10 py-6 text-base sm:text-lg font-semibold overflow-hidden group"
            >
              <span className="relative z-10 flex items-center gap-2">
                <Video className="w-5 h-5" />
                Join a Meeting
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                animate={{
                  x: ["-100%", "100%"],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: 1,
                }}
              />
            </Button>
          </motion.div>
        </Link>

        {isAuthenticated ? (
          <>
            {/* Host only if logged in */}
            <Link to="/host">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-2 border-indigo-500/50 hover:border-indigo-500 hover:bg-indigo-500/10 backdrop-blur-sm transition-all px-8 sm:px-10 py-6 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl"
                >
                  Host a Meeting
                </Button>
              </motion.div>
            </Link>

            {/* Logout */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="lg"
                variant="destructive"
                onClick={() => dispatch(logout())}
                className="px-8 sm:px-10 py-6 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl"
              >
                Logout
              </Button>
            </motion.div>
          </>
        ) : (
          <>
            <Link to="/login">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-indigo-500/50 hover:border-indigo-500 hover:bg-indigo-500/10 backdrop-blur-sm transition-all px-8 sm:px-10 py-6 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl"
                >
                  Login
                </Button>
              </motion.div>
            </Link>
            <Link to="/register">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="secondary" 
                  size="lg"
                  className="px-8 sm:px-10 py-6 text-base sm:text-lg font-semibold shadow-lg hover:shadow-xl bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 hover:from-slate-200 hover:to-slate-300 dark:hover:from-slate-700 dark:hover:to-slate-800"
                >
                  Register
                </Button>
              </motion.div>
            </Link>
          </>
        )}
      </motion.div>

      {/* Extra Info */}
      {!isAuthenticated && (
        <motion.div
          className="relative z-10 max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 backdrop-blur-md shadow-xl">
            <p className="text-sm sm:text-base text-foreground">
              No account? You can still join as a guest.{" "}
              <Link 
                to="/register" 
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 underline font-semibold transition-colors"
              >
                Sign up
              </Link>{" "}
              for more features.
            </p>
          </div>
        </motion.div>
      )}

      {isAuthenticated && (
        <motion.div
          className="relative z-10 max-w-xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 backdrop-blur-md shadow-xl">
            <p className="text-base sm:text-lg text-foreground">
              👋 Hello,{" "}
              <span className="font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                {user?.name || "User"}
              </span>! Ready to start your meeting?
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
