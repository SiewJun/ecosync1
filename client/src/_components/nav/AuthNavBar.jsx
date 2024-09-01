import { Link } from "react-router-dom";
import ThemeSwitcher from "@/_components/theme/ThemeSwitcher";
import EcoSyncLogo from "./EcoSyncLogo";

function AuthNavBar() {
  return (
    <>
      <div className="flex w-full items-center justify-between px-5 py-3 md:px-4">
        <Link to="/">
          <EcoSyncLogo />
        </Link>
        <ThemeSwitcher />
      </div>
    </>
  );
}

export default AuthNavBar;
