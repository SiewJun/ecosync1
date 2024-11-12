import { Navigate } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({ element, roles }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/auth/me", {
          withCredentials: true,
        });
        setIsAuthenticated(true);
        setUserRole(response.data.user.role);
        // eslint-disable-next-line no-unused-vars
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || (roles && !roles.includes(userRole))) {
    return <Navigate to="/signin" />;
  }

  return element;
};

ProtectedRoute.propTypes = {
  element: PropTypes.element.isRequired,
  roles: PropTypes.arrayOf(PropTypes.string),
};

export default ProtectedRoute;
