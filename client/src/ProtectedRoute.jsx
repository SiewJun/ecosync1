import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import PropTypes from 'prop-types';

const ProtectedRoute = ({ element, roles }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/signin" />;
  }

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // current time in seconds

    if (decodedToken.exp && decodedToken.exp > currentTime) {
      if (!roles || roles.includes(decodedToken.role)) {
        return element;
      }
      return <Navigate to="/signin" />;
    } else {
      localStorage.removeItem("token"); // remove expired token
      return <Navigate to="/signin" />;
    }
  } catch (error) {
    console.error("Invalid token:", error);
    localStorage.removeItem("token"); // remove invalid token
    return <Navigate to="/signin" />;
  }
};

ProtectedRoute.propTypes = {
  element: PropTypes.element.isRequired,
  roles: PropTypes.arrayOf(PropTypes.string)
};

export default ProtectedRoute;
