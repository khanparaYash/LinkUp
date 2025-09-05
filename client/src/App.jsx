// src/App.jsx
import { Outlet, Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { Toaster } from "@/components/ui/toaster"
import Header from "./components/Header"


export default function App() {
  return (
    
      <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
        {/* Navbar */}
        
    <Header/>
        {/* Main content */}
        <main className="flex-1 container mx-auto p-6">

          <Outlet />
          <Toaster />
        </main>

        {/* Footer */}
        <footer className="border-t text-center p-4 text-sm text-muted-foreground">
          © {new Date().getFullYear()} LinkUp. All rights reserved.
        </footer>
      </div>
    
  )
}
