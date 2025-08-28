import { useSelector } from "react-redux";
import Card from "../components/ui/Card";
import { motion } from "framer-motion";

export default function Profile() {
  const { user } = useSelector((s) => s.auth);

  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex justify-center items-center min-h-screen 
                 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100
                 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900
                 p-6"
    >
      <Card className="w-full max-w-md text-center">
        {/* Avatar */}
        <div className="flex justify-center mb-4">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center 
                       text-2xl font-bold text-white shadow-lg
                       bg-gradient-to-br from-indigo-500 to-purple-500"
          >
            {initials}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-extrabold mb-6 
                       bg-gradient-to-r from-indigo-500 to-purple-500 
                       text-transparent bg-clip-text">
          Your Profile
        </h3>

        {/* Details */}
        <div className="space-y-3 text-left">
          <div>
            <span className="text-sm text-slate-500 dark:text-slate-400">Name</span>
            <p className="text-lg font-medium text-slate-800 dark:text-slate-200">
              {user?.name || "Guest"}
            </p>
          </div>
          <div>
            <span className="text-sm text-slate-500 dark:text-slate-400">Email</span>
            <p className="text-lg font-medium text-slate-800 dark:text-slate-200">
              {user?.email || "Not provided"}
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
