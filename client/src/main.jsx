import { createRoot } from "react-dom/client";
import "./index.css";
import { Provider } from "react-redux";
import store from "./store/store.js";
import { RouterProvider } from "react-router-dom";
import router from "./router/index.jsx";
import SocketProvider from "./context/SocketProvider.jsx";
import { Buffer } from 'buffer'
import process from 'process'
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/Toaster";

if (!window.Buffer) window.Buffer = Buffer
if (!window.process) window.process = process

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <SocketProvider>
      <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme" attribute="class">
      <RouterProvider router={router} />
       <Toaster />
      </ThemeProvider>
    </SocketProvider>
  </Provider>
);
