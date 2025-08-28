import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Sun, Moon, LogOut } from "lucide-react";
import { useState } from "react";
import { logout } from "../slices/authSlice";
import { motion } from "framer-motion";

export default function Header() {
  const { user } = useSelector((s) => s.auth);
  const dispatch = useDispatch();
  const [dark, setDark] = useState(false);

  const toggle = () => {
    setDark((v) => !v);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="flex items-center justify-between py-4 px-6 
                 backdrop-blur-lg bg-white/60 dark:bg-slate-900/60 
                 border-b border-slate-200/50 dark:border-slate-800/50 
                 sticky top-0 z-30 shadow-sm"
    >
      {/* Logo / Brand */}
      <Link to="/" className="flex items-center gap-3 group">
        <motion.div
          whileHover={{ rotate: 10, scale: 1.05 }}
          className="w-10 h-10 rounded-xl 
                     bg-gradient-to-br from-indigo-500 to-purple-500 
                     flex items-center justify-center 
                     text-white font-extrabold shadow-md"
        >
          LU
        </motion.div>
        <span className="text-xl font-extrabold tracking-tight 
                         bg-gradient-to-r from-indigo-500 to-purple-500 
                         text-transparent bg-clip-text group-hover:opacity-80 
                         transition">
          LinkUp
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex items-center gap-5">
        <Link
          to="/join"
          className="relative text-sm font-medium 
                     text-slate-700 dark:text-slate-300
                     after:content-[''] after:absolute after:w-0 after:h-0.5 
                     after:bg-indigo-500 after:left-0 after:-bottom-1 
                     after:transition-all after:duration-300
                     hover:after:w-full
                     hover:text-indigo-500 dark:hover:text-indigo-400"
        >
          Join
        </Link>

        {user ? (
          <Link
            to="/dashboard"
            className="relative text-sm font-medium 
                       text-slate-700 dark:text-slate-300
                       after:content-[''] after:absolute after:w-0 after:h-0.5 
                       after:bg-indigo-500 after:left-0 after:-bottom-1 
                       after:transition-all after:duration-300
                       hover:after:w-full
                       hover:text-indigo-500 dark:hover:text-indigo-400"
          >
            Dashboard
          </Link>
        ) : (
          <Link
            to="/login"
            className="relative text-sm font-medium 
                       text-slate-700 dark:text-slate-300
                       after:content-[''] after:absolute after:w-0 after:h-0.5 
                       after:bg-indigo-500 after:left-0 after:-bottom-1 
                       after:transition-all after:duration-300
                       hover:after:w-full
                       hover:text-indigo-500 dark:hover:text-indigo-400"
          >
            Login
          </Link>
        )}

        {/* Theme Toggle */}
        <motion.button
          onClick={toggle}
          whileTap={{ scale: 0.9 }}
          className="p-2 rounded-full hover:bg-slate-200 
                     dark:hover:bg-slate-700 transition-colors"
        >
          {dark ? <Sun size={18} className="text-yellow-400 transition"/> : <Moon size={18}  className="text-slate-700 dark:text-slate-300 transition"  />}
        </motion.button>

        {/* Logout */}
        {user && (
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => dispatch(logout())}
            className="p-2 rounded-full bg-gradient-to-br from-red-500 to-pink-500 
                       text-white hover:opacity-90 shadow-md transition"
          >
            <LogOut size={18} />
          </motion.button>
        )}
      </nav>
    </motion.header>
  );
}
