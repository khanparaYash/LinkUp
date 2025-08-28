import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser, fetchUser } from "../slices/authSlice";
import { useNavigate, Link } from "react-router-dom";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { motion } from "framer-motion";

export default function Register() {
  const dispatch = useDispatch();
  const { loading, error, isAuthenticated } = useSelector((s) => s.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchUser());
      navigate("/");
    }
  }, [isAuthenticated]);

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(registerUser(form)).unwrap();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen flex items-center justify-center p-6
                 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100
                 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900"
    >
      <Card className="w-full max-w-md">
        <h2 className="text-3xl font-extrabold mb-6 text-center 
                       bg-gradient-to-r from-indigo-500 to-purple-500 
                       text-transparent bg-clip-text">
          Create LinkUp Account
        </h2>

        <form onSubmit={onSubmit} className="space-y-4">
          <Input
            name="name"
            label="Full name"
            value={form.name}
            onChange={onChange}
            required
          />
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
            <div className="text-sm text-red-600 dark:text-red-400">
              {String(error)}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Registering..." : "Create Account"}
          </Button>
        </form>

        <p className="mt-4 text-sm text-center text-slate-600 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Login
          </Link>
        </p>
      </Card>
    </motion.div>
  );
}
