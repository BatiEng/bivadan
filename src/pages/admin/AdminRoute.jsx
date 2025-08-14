import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  // Check saved user
  const stored =
    localStorage.getItem("authUser") || sessionStorage.getItem("authUser");
  let user = null;
  try {
    user = stored ? JSON.parse(stored) : null;
  } catch (e) {
    user = null;
  }

  // Not logged in or not admin → redirect to login
  if (!user || user.role !== "Admin") {
    return <Navigate to="/admin/giris" replace />;
  }

  // Otherwise show the page
  return children;
};

export default AdminRoute;
