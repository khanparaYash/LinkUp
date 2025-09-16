import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { callApi } from "../api/callApi"
import { SummaryApi } from "../common/summaryApi"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import { useDispatch } from "react-redux";
import { login } from "@/slices/authSlice";


function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await callApi(SummaryApi.login, { email, password })
      // localStorage.setItem("accesstoken", res.token)
      toast.success("Login successful")
       dispatch(login(res));
      navigate("/dashboard")
    } catch (err) {
      toast.error(err.msg || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "Login"}
            </Button>
          </form>
          <p className="text-sm text-center mt-4">
            Don’t have an account?{" "}
            <Link to="/register" className="text-primary hover:underline">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default Login
