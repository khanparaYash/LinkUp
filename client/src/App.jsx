// src/App.jsx
import { Outlet} from "react-router-dom";
import Header from "./components/Header";
import {  useEffect } from "react";
import { callApi } from "./api/callApi";
import { SummaryApi } from "./common/summaryApi";
import { useDispatch } from "react-redux";
import { logout } from "./slices/authSlice";
import { toast } from "sonner";

export default function App() {
  const dispatch = useDispatch();

useEffect(() => {
  const fetchUser = async () => {
    try {
      const res = await callApi(SummaryApi.user_details);
      if (res.user) {
        toast.info("welcome back,"+res.user.name);

      }
    } catch (e) {
      console.log(e);
      
      dispatch(logout());
      }
  };
  fetchUser();
}, [dispatch]);
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* Navbar */}

      <Header />
      {/* Main content */}
      <main className="flex-1 container mx-auto p-6 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
       
      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/95 backdrop-blur-xl mt-auto shadow-lg dark:shadow-slate-900/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} <span className="font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">LinkUp</span>. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm">
              <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer hover:underline">Privacy</span>
              <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer hover:underline">Terms</span>
              <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer hover:underline">Support</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
