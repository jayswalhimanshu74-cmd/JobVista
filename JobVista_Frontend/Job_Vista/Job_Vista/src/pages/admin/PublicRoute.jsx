import { Navigate } from "react-router-dom";

import { isAuthenticated } from "../utiils/auth";

const PublicRoute = ({ children }) => {
  if (isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default PublicRoute;
