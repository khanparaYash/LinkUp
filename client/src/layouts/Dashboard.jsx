import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";

export default function Dashboard() {
  return (
    <div
      className="min-h-screen 
                 bg-gradient-to-br from-background via-background to-accent/5
                 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950
                 transition-colors duration-500 p-4 sm:p-6 lg:p-8"
    >
      <div className="max-w-7xl mx-auto">
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between mb-8 pb-4 border-b border-border/50"
        >
          <h2 className="text-2xl sm:text-3xl font-extrabold 
                         bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600
                         dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400
                         bg-clip-text text-transparent tracking-tight">
            LinkUp Dashboard
          </h2>
        </motion.header>

        <motion.main
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
