import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import PropTypes from "prop-types";
import HomePage from "./pages/HomePage";
import ThemeProvider from "./context/ThemeContext";
import SignInPage from "./pages/auth/SignInPage";
import SignUpPage from "./pages/auth/SignUpPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import CompanyRegistrationPage from "./pages/auth/CompanySignUpPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import CompletedCompanySignUpPage from "./pages/auth/CompletedCompanySignUpPage";
import CompanyDashboard from "./_components/company/CompanyDashboard";
import ConsumerDashboard from "./_components/consumer/ConsumerDashboard";
import SearchSolarInstallers from "./_components/services/SearchSolarInstallers";
import CompanyPublicProfile from "./_components/company/CompanyPublicProfile";
import SolarSolutionComparison from "./_components/services/SolarSolutionComparison";
import SolarEstimation from "./pages/services/SolarEstimation";
import IncentivesInfo from "./pages/info/IncentivesInfo";
// Custom ProtectedRoute component
const ProtectedRoute = ({ element, role }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/signin" />;
  }

  try {
    const decodedToken = jwtDecode(token);
    const currentTime = Date.now() / 1000; // current time in seconds

    if (decodedToken.exp && decodedToken.exp > currentTime) {
      if (!role || decodedToken.role === role) {
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

const App = () => {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/company-signup" element={<CompanyRegistrationPage />} />
          <Route path="/incentives" element={<IncentivesInfo />} />
          <Route
            path="/dashboard/*"
            element={<ProtectedRoute element={<AdminDashboardPage />} role="ADMIN" />}
          />
          <Route path="/complete-registration" element={<CompletedCompanySignUpPage />} />
          <Route path="/company-dashboard/*" element={<ProtectedRoute element={<CompanyDashboard />} role="COMPANY" />} />
          <Route path="/consumer-dashboard/*" element={<ProtectedRoute element={<ConsumerDashboard />} role="CONSUMER" />} />
          <Route path="/installers" element={<SearchSolarInstallers />} />
          <Route path="/installers/companypublicprofile/:companyId" element={<CompanyPublicProfile />} />
          <Route path="/solar-solutions" element={<SolarSolutionComparison />} />
          <Route path="/solar-estimation" element={<SolarEstimation />} />
        </Routes>
      </Router>
    </div>
  );
};

ProtectedRoute.propTypes = {
  element: PropTypes.element.isRequired,
  role: PropTypes.string,
};

const AppWrapper = () => (
  <ThemeProvider>
    <App />
  </ThemeProvider>
);

export default AppWrapper;
