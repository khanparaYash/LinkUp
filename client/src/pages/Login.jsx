import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, fetchUser } from "../slices/authSlice";
import { useNavigate, Link } from "react-router-dom";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { motion } from "framer-motion";

export default function Login() {
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((s) => s.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUser());
      navigate("/");
    }
  }, [isAuthenticated]);

  const [form, setForm] = useState({ email: "", password: "" });
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(loginUser(form)).unwrap();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 
                 bg-gradient-to-br from-pink-200 via-yellow-100 to-orange-200
                 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900
                 transition-colors duration-500"
    >
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card>
          <h2 className="text-3xl font-extrabold text-center mb-6 
                         bg-gradient-to-r from-pink-500 to-orange-500 
                         bg-clip-text text-transparent">
            Welcome back to LinkUp
          </h2>

          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              name="email"
              label="Email"
              type="email"
              value={form.email}
              onChange={onChange}
              required
            />
            <Input
              name="password"
              label="Password"
              type="password"
              value={form.password}
              onChange={onChange}
              required
            />
            {error && (
              <div className="text-sm text-red-500 font-medium">{String(error)}</div>
            )}
            <Button
              type="submit"
              className="w-full"
              variant="primary"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login 🚀"}
            </Button>
          </form>

          <p className="mt-4 text-sm text-center text-slate-600 dark:text-slate-400">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-pink-600 hover:text-orange-500 dark:text-pink-400"
            >
              Register
            </Link>
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
