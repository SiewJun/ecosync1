import { Link, useLocation } from "react-router-dom";
import ThemeSwitcher from "@/_components/theme/ThemeSwitcher";
import EcoSyncLogo from "./EcoSyncLogo";
import { Button } from "@/components/ui/button";

function AuthNavBar() {
  const location = useLocation();
  const isSignInPage = location.pathname === "/signin";
  const isSignUpPage = location.pathname === "/signup";
  const isCompanySignUpPage = location.pathname === "/company-signup";

  return (
    <>
      <div className="flex w-full items-center justify-between px-5 py-3 md:px-4 border-b">
          <EcoSyncLogo />
        <div className="flex items-center">
          <ThemeSwitcher />
          {isSignInPage && (
            <Link to="/signup">
              <Button variant="link">Sign Up</Button>
            </Link>
          )}
          {isSignUpPage && (
            <Link to="/signin">
              <Button variant="link">Sign In</Button>
            </Link>
          )}
          {isCompanySignUpPage && (
            <Link to="/signin">
              <Button variant="link">Sign In</Button>
            </Link>
          )}
        </div>
      </div>
    </>
  );
}

export default AuthNavBar;
