import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";



export default function PublicRoute({ children }) {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return !isAuthenticated ? children : <Navigate to="/" replace />;
}