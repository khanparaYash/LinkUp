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
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors">
      {/* Navbar */}

      <Header />
      {/* Main content */}
      <main className="flex-1 container mx-auto p-6">
        <Outlet />
       
      </main>

      {/* Footer */}
      <footer className="border-t text-center p-4 text-sm text-muted-foreground">
        © {new Date().getFullYear()} LinkUp. All rights reserved.
      </footer>
    </div>
  );
}
