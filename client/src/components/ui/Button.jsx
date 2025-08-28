import { motion } from "framer-motion";

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}) {
  const variants = {
    primary:
      "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md hover:shadow-lg hover:from-indigo-500 hover:to-purple-500 dark:from-indigo-500 dark:to-purple-500",
    ghost:
      "bg-transparent border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/60",
    accent:
      "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md hover:shadow-lg hover:from-emerald-400 hover:to-teal-400 dark:from-emerald-400 dark:to-teal-400",
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={`inline-flex items-center justify-center 
                  px-5 py-2.5 rounded-xl font-medium 
                  transition-all duration-200 
                  ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
