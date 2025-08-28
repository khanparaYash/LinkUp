import { motion } from "framer-motion";

export default function Card({ children, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className={`
        bg-white/90 dark:bg-slate-900/90 
        backdrop-blur-md rounded-2xl p-6 
        shadow-soft dark:shadow-none 
        border border-slate-100 dark:border-slate-800 
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
