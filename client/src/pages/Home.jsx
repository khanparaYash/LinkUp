// src/pages/Home.jsx
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/slices/authSlice";

export default function Home() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  return (
    <div className="flex flex-col items-center justify-center text-center py-20 space-y-8">
      {/* Hero Section */}
      <motion.h1
        className="text-4xl md:text-6xl font-bold tracking-tight"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        Welcome to <span className="text-primary">LinkUp</span>
      </motion.h1>

      <motion.p
        className="text-lg md:text-xl text-muted-foreground max-w-2xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        Secure, simple, and fast video meetings. Host or join a meeting in
        seconds — no hassle, no limits.
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        className="flex flex-wrap gap-4 justify-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        {/* Always allow joining */}
        <Link to="/join">
          <Button size="lg">Join a Meeting</Button>
        </Link>

        {isAuthenticated ? (
          <>
            {/* Host only if logged in */}
            <Link to="/host">
              <Button size="lg" variant="outline">
                Host a Meeting
              </Button>
            </Link>

            {/* Logout */}
            <Button
              size="lg"
              variant="destructive"
              onClick={() => dispatch(logout())}
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link to="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link to="/register">
              <Button variant="secondary">Register</Button>
            </Link>
          </>
        )}
      </motion.div>

      {/* Extra Info */}
      {!isAuthenticated && (
        <motion.p
          className="text-sm text-muted-foreground mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          No account? You can still join as a guest.
          <Link to="/register" className="text-primary underline ml-1">
            Sign up
          </Link>{" "}
          for more features.
        </motion.p>
      )}

      {isAuthenticated && (
        <motion.p
          className="text-sm text-muted-foreground mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          👋 Hello,{" "}
          <span className="font-semibold">{user?.name || "User"}</span>! Ready
          to start your meeting?
        </motion.p>
      )}
    </div>
  );
}
