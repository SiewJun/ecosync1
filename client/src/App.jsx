import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
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
import Footer from "./pages/Footer";
import NotFoundPage from "./pages/NotFoundPage";
import AboutPage from "./pages/info/AboutPage";
import AdminSigninForm from "./_components/auth/AdminSigninForm";
import ProtectedRoute from "./ProtectedRoute";
import CompleteRegistration from "./_components/auth/CompleteRegistration";

const App = () => {
  const location = useLocation();
  const noFooterRoutes = [
    "/dashboard",
    "/company-dashboard",
    "/consumer-dashboard",
  ];

  const shouldShowFooter = !noFooterRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  return (
    <div>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin-signin" element={<AdminSigninForm />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/complete-registration/:token" element={<CompleteRegistration />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        <Route path="/company-signup" element={<CompanyRegistrationPage />} />
        <Route path="/incentives" element={<IncentivesInfo />} />
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute
              element={<AdminDashboardPage />}
              roles={["ADMIN", "SUPERADMIN"]}
            />
          }
        />
        <Route
          path="/complete-registration"
          element={<CompletedCompanySignUpPage />}
        />
        <Route
          path="/company-dashboard/*"
          element={
            <ProtectedRoute
              element={<CompanyDashboard />}
              roles={["COMPANY"]}
            />
          }
        />
        <Route
          path="/consumer-dashboard/*"
          element={
            <ProtectedRoute
              element={<ConsumerDashboard />}
              roles={["CONSUMER"]}
            />
          }
        />
        <Route path="/installers" element={<SearchSolarInstallers />} />
        <Route
          path="/installers/companypublicprofile/:companyId"
          element={<CompanyPublicProfile />}
        />
        <Route path="/solar-solutions" element={<SolarSolutionComparison />} />
        <Route path="/solar-estimation" element={<SolarEstimation />} />
        <Route path="/about" element={<AboutPage />} />
        {/* Catch-all route for unmatched paths */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {shouldShowFooter && <Footer />}
    </div>
  );
};

const AppWrapper = () => (
  <ThemeProvider>
    <Router>
      <App />
    </Router>
  </ThemeProvider>
);

export default AppWrapper;
