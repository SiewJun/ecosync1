import { Home, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/signin");
  };

  return (
    <div
      className={cn(
        "fixed top-0 left-0 h-full border-r flex flex-col items-center shadow-lg bg-background"
      )}
    >
      <Link to="/">
        <div className="flex gap-2 justify-center items-center py-4">
          <img src="/ecosync.svg" alt="Ecosync Logo" width="30" height="30" />
        </div>
      </Link>
      <nav className="flex-1 w-full">
        <ul className="flex flex-col items-center w-full">
          <li className="mb-4 w-full">
            <Link to="/admindashboard">
              <Button variant="ghost">
                <Home className="w-6 h-6" />
              </Button>
            </Link>
          </li>
          {/* Add other navigation items here */}
        </ul>
      </nav>
      <div className="mt-auto mb-4 w-full">
        <Button variant="destructive" onClick={handleLogout} className="rounded-none">
          <LogOut className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
