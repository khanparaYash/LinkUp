import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";

export default function Dashboard() {
  return (
    <div
      className="min-h-screen 
                 bg-gradient-to-b from-white to-slate-100 
                 dark:from-slate-950 dark:to-slate-900
                 transition-colors duration-500 p-6"
    >
      <div className="max-w-6xl mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-6"
        >
          <h2 className="text-2xl font-extrabold 
                         bg-gradient-to-r from-indigo-500 to-purple-500 
                         bg-clip-text text-transparent tracking-tight">
            LinkUp Dashboard
          </h2>
        </motion.header>

        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
}
