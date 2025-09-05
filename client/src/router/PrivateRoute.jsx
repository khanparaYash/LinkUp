import { useSelector } from "react-redux";
import {  useNavigate } from "react-router-dom";


export default function PrivateRoute({ children }) {
  const Navigate=useNavigate()
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}