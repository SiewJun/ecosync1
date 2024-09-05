import { Link } from "react-router-dom";
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
  ShoppingCart,
  ReceiptText,
  LogOut,
  LayoutDashboard,
  Building,
  MessageCircle,
  FileCheck,
  ClipboardList,
} from "lucide-react";

const ProfileDropdown = ({ user }) => {
  const handleLogout = async () => {
    try {
      localStorage.removeItem("token");
      window.location.href = "/signin";
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const renderMenuItems = () => {
    switch (user.role) {
      case "CONSUMER":
        return (
          <>
            <DropdownMenuItem asChild>
              <Link
                to="/profile"
                className="flex items-center gap-2 p-2 rounded-md cursor-pointer"
              >
                <User className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/chat"
                className="flex items-center gap-2 p-2 rounded-md cursor-pointer"
              >
                <MessageSquare className="h-4 w-4" />
                Chat
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/quotation"
                className="flex items-center gap-2 p-2 rounded-md cursor-pointer"
              >
                <FileText className="h-4 w-4" />
                Quotation
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/order"
                className="flex items-center gap-2 p-2 rounded-md cursor-pointer"
              >
                <ShoppingCart className="h-4 w-4" />
                Order
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/invoice"
                className="flex items-center gap-2 p-2 rounded-md cursor-pointer"
              >
                <ReceiptText className="h-4 w-4" />
                Invoice
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
                to="/company-dashboard"
                className="flex items-center gap-2 p-2 rounded-md cursor-pointer"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
            </DropdownMenuItem>
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
                to="/company-dashboard/chat"
                className="flex items-center gap-2 p-2 rounded-md cursor-pointer"
              >
                <MessageCircle className="h-4 w-4" />
                Chat
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/company-dashboard/quotation"
                className="flex items-center gap-2 p-2 rounded-md cursor-pointer"
              >
                <FileCheck className="h-4 w-4" />
                Quotation
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link
                to="/company-dashboard/projects"
                className="flex items-center gap-2 p-2 rounded-md cursor-pointer"
              >
                <ClipboardList className="h-4 w-4" />
                Projects
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
                to="/admindashboard"
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-2 cursor-pointer">
          <Avatar>
            <AvatarImage
              src={user.avatarUrl || "https://via.placeholder.com/150"}
              alt="User Avatar"
            />
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

export default ProfileDropdown;
