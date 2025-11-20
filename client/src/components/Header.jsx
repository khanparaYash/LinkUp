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
    <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur-xl sticky top-0 z-50 shadow-lg dark:shadow-slate-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link 
            to="/" 
            className="group relative text-xl sm:text-2xl font-bold"
          >
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent transition-all duration-300 group-hover:scale-105 inline-block">
              LinkUp
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent opacity-0 blur-sm group-hover:opacity-50 transition-opacity duration-300">
              LinkUp
            </span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center gap-2 sm:gap-3">
            {!isAuthenticated ? (
              <>
                <Link to="/login">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-sm hidden sm:inline-flex hover:bg-accent/50"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white border-0 shadow-md hover:shadow-lg transition-all"
                  >
                    Register
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent/50 border border-border/50">
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    Welcome,
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-foreground">
                    {user?.name || "User"}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-sm hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors"
                >
                  Logout
                </Button>
              </>
            )}
            <ModeToggle/>
          </nav>
        </div>
      </div>
    </header>
  );
}
