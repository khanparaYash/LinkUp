import { useSelector, useDispatch } from "react-redux";
import { logout } from "../slices/authSlice";
import Button from "../components/ui/Button";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Home() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const navigate=useNavigate()
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-6 
                 bg-gradient-to-br from-indigo-50 via-white to-purple-50 
                 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900
                 transition-colors duration-500"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-3xl w-full text-center"
      >
        {/* Hero Heading */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-5xl font-extrabold mb-3 
                     text-slate-800 dark:text-white
                     tracking-tight"
        >
          Welcome to{" "}
          <span className="bg-gradient-to-r from-indigo-500 to-purple-500 text-transparent bg-clip-text">
            LinkUp 👋
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.7 }}
          className="text-lg text-slate-600 dark:text-slate-400 mb-8"
        >
          Fast, modern web meetings built for Gen-Z.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="flex items-center gap-4 justify-center flex-wrap"
        >
          <Link to="/join">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="primary">Join as Guest</Button>
            </motion.div>
          </Link>

          {user ? (
            <>
              <Link to="/dashboard">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button variant="ghost">Dashboard</Button>
                </motion.div>
              </Link>
              <Link to="/host">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="accent" >
                  Host
                </Button>
              </motion.div>
              </Link>
            </>
          ) : (
            <Link to="/login">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="ghost">Login</Button>
              </motion.div>
            </Link>
          )}
        </motion.div>

        {/* Logged in info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="mt-8 text-sm text-slate-500 dark:text-slate-400"
        >
          Logged in as:{" "}
          <span className="font-medium">
            {user?.name || "Guest"}
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
