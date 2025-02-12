import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  MessageSquare,
  FileText,
  LogOut,
  LayoutDashboard,
  Building,
  MessageCircle,
  FileCheck,
  ClipboardList,
  Construction,
} from "lucide-react";
import axios from "axios";

const ProfileDropdown = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/logout", {}, { withCredentials: true });
      window.location.href = "/signin";
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [isOpen]);

  if (!user) {
    return null;
  }

  const BASE_URL = "http://localhost:5000/";
  const imageUrl = `${BASE_URL}${user.avatarUrl}`;

  const renderMenuItems = () => {
    switch (user.role) {
      case "CONSUMER":
        return (
          <>
            <DropdownMenuItem asChild>
              <Link
                to="/consumer-dashboard/consumer-profile"
                className="flex items-center gap-2 p-2 rounded-md cursor-pointer"
              >
                <User className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/consumer-dashboard/chat"
                className="flex items-center gap-2 p-2 rounded-md cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" />
                Chat
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/consumer-dashboard/consumer-quotation"
                className="flex items-center gap-2 p-2 rounded-md cursor-pointer"
              >
                <FileText className="h-4 w-4" />
                Quotation
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/consumer-dashboard/consumer-project"
                className="flex items-center gap-2 p-2 rounded-md cursor-pointer"
              >
                <ClipboardList className="h-4 w-4" />
                Project
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/consumer-dashboard/consumer-maintenance"
                className="flex items-center gap-2 p-2 rounded-md cursor-pointer"
              >
                <Construction className="h-4 w-4" />
                Maintenance
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-2 p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md font-semibold cursor-pointer transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </>
        );
      case "COMPANY":
        return (
          <>
            <DropdownMenuItem asChild>
              <Link
                to="/company-dashboard/company-details"
                className="flex items-center gap-2 p-2 rounded-md cursor-pointer"
              >
                <Building className="h-4 w-4" />
                Company Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/company-dashboard/company-profile"
                className="flex items-center gap-2 p-2 rounded-md cursor-pointer"
              >
                <User className="h-4 w-4" />
                Company Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/company-dashboard/company-chat"
                className="flex items-center gap-2 p-2 rounded-md cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                Chat
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/company-dashboard/company-quotation"
                className="flex items-center gap-2 p-2 rounded-md cursor-pointer"
              >
                <FileCheck className="h-4 w-4" />
                Quotation
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/company-dashboard/company-project"
                className="flex items-center gap-2 p-2 rounded-md cursor-pointer"
              >
                <ClipboardList className="h-4 w-4" />
                Project
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/company-dashboard/company-maintenance"
                className="flex items-center gap-2 p-2 rounded-md cursor-pointer"
              >
                <Construction className="h-4 w-4" />
                Maintenance
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-2 p-2 text-red-600 hover:text-red-800  rounded-md font-semibold cursor-pointer transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </>
        );
      case "ADMIN":
        return (
          <>
            <DropdownMenuItem asChild>
              <Link
                to="/dashboard/pendingapp"
                className="flex items-center gap-2 p-2 rounded-md cursor-pointer"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-2 p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md font-semibold cursor-pointer transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </>
        );
      case "SUPERADMIN":
        return (
          <>
            <DropdownMenuItem asChild>
              <Link
                to="/dashboard/pendingapp"
                className="flex items-center gap-2 p-2 rounded-md cursor-pointer"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="flex items-center gap-2 p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-md font-semibold cursor-pointer transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </>
        );
      default:
        return null;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-2 cursor-pointer">
          <Avatar>
            <AvatarImage src={imageUrl} alt="User Avatar" />
            <AvatarFallback>{user.username[0]}</AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-50 p-2 shadow-lg rounded-md">
        <DropdownMenuLabel className="font-semibold text-muted-foreground">
          Hi {user.username}
        </DropdownMenuLabel>
        {renderMenuItems()}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

ProfileDropdown.propTypes = {
  user: PropTypes.shape({
    role: PropTypes.string.isRequired,
    avatarUrl: PropTypes.string,
    username: PropTypes.string.isRequired,
  }).isRequired,
};

export default ProfileDropdown;