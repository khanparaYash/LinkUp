// src/components/mode-toggle.jsx
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useEffect, useState } from "react";

export function ModeToggle() {
//   const { theme, setTheme } = useTheme()
    const [theme, setTheme] = useState(
      localStorage.getItem("theme") || "light"
    );
  
    // apply theme to <html>
    useEffect(() => {
      if (theme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      localStorage.setItem("theme", theme);
    }, [theme]);
  

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="hover:bg-accent/50 transition-colors border border-border/50 hover:border-border"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="h-[1.2rem] w-[1.2rem] transition-transform hover:rotate-12" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem] transition-transform hover:rotate-12" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
