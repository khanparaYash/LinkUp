import Header from "./components/Header";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";

export default function App() {
  return (
    <div
      className="min-h-screen 
                 bg-gradient-to-b from-white to-slate-100 
                 dark:from-slate-950 dark:to-slate-900
                 transition-colors duration-500"
    >
      <Header />
      <motion.main
        key={location.pathname} // re-animates when route changes
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        
      >
        <Outlet />
      </motion.main>
    </div>
  );
}
