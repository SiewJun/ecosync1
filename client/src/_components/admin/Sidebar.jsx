import { Home, LogOut, SearchCheckIcon, ClipboardList, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/signin");
  };

  return (
    <aside className="w-14 h-screen flex flex-col items-center border-r shadow-lg bg-background">
      <Link to="/" className="py-4">
        <img src="/ecosync.svg" alt="Ecosync Logo" width="30" height="30" />
      </Link>
      <nav className="flex-1 w-full">
        <ul className="flex flex-col items-center w-full">
          <li className="mb-4 w-full">
            <Link to="/dashboard" className="block">
              <Button variant="ghost" className="w-full">
                <Home className="w-6 h-6" />
              </Button>
            </Link>
          </li>
          <li className="mb-4 w-full">
            <Link to="/dashboard/pendingapp" className="block">
              <Button variant="ghost" className="w-full">
                <ClipboardList className="w-6 h-6" />
              </Button>
            </Link>
          </li>
          <li className="mb-4 w-full">
            <Link to="/dashboard/incentives" className="block">
              <Button variant="ghost" className="w-full">
                <SearchCheckIcon className="w-6 h-6" />
              </Button>
            </Link>
          </li>
          <li className="mb-4 w-full">
            <Link to="/dashboard/users-management" className="block">
              <Button variant="ghost" className="w-full">
                <User className="w-6 h-6" />
              </Button>
            </Link>
          </li>
          {/* Add other navigation items here */}
        </ul>
      </nav>
      <div className="mt-auto mb-4 w-full">
        <Button variant="destructive" onClick={handleLogout} className="w-full rounded-none">
          <LogOut className="w-6 h-6" />
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;