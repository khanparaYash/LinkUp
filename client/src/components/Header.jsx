import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/slices/authSlice";
import { Button } from "@/components/ui/Button";
import { ModeToggle } from "@/components/mode-toggle";

export default function Header() {
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header className="w-full border-b bg-background/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-xl font-bold text-primary">
          LinkUp
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-sm">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="secondary" size="sm" className="text-sm">
                  Register
                </Button>
              </Link>
            </>
          ) : (
            <>
              <span className="text-sm text-muted-foreground">
                Welcome, <span className="font-semibold">{user?.name}</span>
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
          <ModeToggle/>
        </nav>
      </div>
    </header>
  );
}
