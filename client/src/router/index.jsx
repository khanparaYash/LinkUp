import { createBrowserRouter } from "react-router-dom";
import App from "../App.jsx";
import Home from "../pages/Home.jsx";
import Login from "../pages/Login.jsx";
import Register from "../pages/Register.jsx";
import JoinMeeting from "../pages/JoinMeeting";
import Dashboard from "../layouts/Dashboard";
import Profile from "../pages/Profile";
import MeetingRoom from "../pages/MeetingRoom.jsx";
import HostMeeting from "../pages/HostMeeting.jsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "", element: <Home /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "join", element: <JoinMeeting /> },
      { path: "host", element: <HostMeeting /> },
      {
        path: "meeting/:roomId",
        element: <MeetingRoom />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
        children: [{ path: "profile", element: <Profile /> }],
      },
    ],
  },
]);

export default router;
