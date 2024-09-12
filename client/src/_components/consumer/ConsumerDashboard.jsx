import { Link, Routes, Route, useLocation } from "react-router-dom";
import {
  Home,
  User,
  MessageSquare,
  FileText,
  ShoppingCart,
  ReceiptText,
  Menu,
  LogOut,
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import { Badge } from "@/components/ui/badge";
import EcoSyncLogo from "../nav/EcoSyncLogo";
import ProfileDropdown from "../nav/ProfileDropdown";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Description } from "@radix-ui/react-dialog";
import ConsumerProfile from "./ConsumerProfile";
import ConsumerEditProfileForm from "./ConsumerEditProfileForm";
import Chat from "../communication/Chat";
import ChatList from "../communication/ChatLIst";

const ConsumerDashboard = () => {
  const [user, setUser] = useState(null);
  const location = useLocation();

  const handleLogout = async () => {
    try {
      localStorage.removeItem("token");
      window.location.href = "/signin";
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await axios.get(
            "http://localhost:5000/api/auth/me",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setUser(response.data.user);
        }
      } catch (error) {
        if (error.response && error.response.status === 403) {
          localStorage.removeItem("token");
        } else {
          console.error("Error fetching user:", error);
        }
      }
    };

    fetchUser();
  }, []);

  const getLinkClasses = (path) => {
    const regex = new RegExp(`^${path.replace(/:\w+/g, "\\w+")}$`);
    return regex.test(location.pathname)
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:text-foreground hover:bg-accent";
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden bg-muted/40 md:block">
        <div className="flex h-full flex-col gap-2">
          <div className="flex h-14 items-center px-4 lg:h-[60px] lg:px-6">
            <EcoSyncLogo className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <Link
                to="/consumer-dashboard/consumer-profile"
                className={`flex items-center gap-3 rounded-lg px-4 py-3 my-1 transition-all ${getLinkClasses(
                  "/consumer-dashboard/consumer-profile"
                )} ${getLinkClasses(
                  "/consumer-dashboard/consumer-profile/consumer-edit-profile"
                )}`}
              >
                <User className="h-4 w-4" />
                Profile
              </Link>
              <Link
                to="/consumer-dashboard/chat"
                className={`flex items-center gap-3 rounded-lg px-4 py-3 my-1 transition-all ${getLinkClasses(
                  "/consumer-dashboard/chat"
                )}`}
              >
                <MessageSquare className="h-4 w-4" />
                Chat
                <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                  6
                </Badge>
              </Link>
              <Link
                to="/consumer-dashboard/company-profile"
                className={`flex items-center gap-3 rounded-lg px-4 py-3 my-1 transition-all ${getLinkClasses(
                  "/consumer-dashboard/company-profile"
                )}`}
              >
                <FileText className="h-4 w-4" />
                Quotation
              </Link>
              <Link
                to="/consumer-dashboard/company-chat"
                className={`flex items-center gap-3 rounded-lg px-4 py-3 my-1 transition-all ${getLinkClasses(
                  "/consumer-dashboard/company-chat"
                )}`}
              >
                <ShoppingCart className="h-4 w-4" />
                Order
              </Link>
              <Link
                to="/consumer-dashboard/company-quotation"
                className={`flex items-center gap-3 rounded-lg px-4 py-3 my-1 transition-all ${getLinkClasses(
                  "/consumer-dashboard/company-quotation"
                )}`}
              >
                <ReceiptText className="h-4 w-4" />
                Invoice
              </Link>
            </nav>
          </div>
          <div className="mt-auto p-4">
            <div
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-red-600 hover:text-red-800 hover:bg-red-100 cursor-pointer transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 md:hidden items-center gap-4 border-b md:border-0 bg-muted/40 px-4 lg:h-[60px] lg:px-6 justify-between">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col h-full">
              <div className="hidden">
                <DialogTitle>
                  This is a mobile menu for consumer dashboard
                </DialogTitle>
                <Description>Menu for navigating the dashboard</Description>
              </div>
              <nav className="flex flex-col flex-1 gap-2 text-lg font-medium">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <EcoSyncLogo />
                </div>
                <Link
                  to="/consumer-dashboard"
                  className={`mx-[-0.65rem] flex items-center gap-4 mt-5 rounded-xl px-3 py-2 ${getLinkClasses(
                    "/consumer-dashboard"
                  )}`}
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </Link>
                <Link
                  to="/consumer-dashboard/consumer-profile"
                  className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 ${getLinkClasses(
                    "/consumer-dashboard/company-details"
                  )}`}
                >
                  <User className="h-4 w-4" />
                  Profile
                </Link>
                <Link
                  to="/consumer-dashboard/company-profile"
                  className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 ${getLinkClasses(
                    "/consumer-dashboard/company-profile"
                  )}`}
                >
                  <MessageSquare className="h-4 w-4" />
                  Chat
                </Link>
                <Link
                  to="/consumer-dashboard/company-chat"
                  className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 ${getLinkClasses(
                    "/consumer-dashboard/company-chat"
                  )}`}
                >
                  <FileText className="h-4 w-4" />
                  Quotation
                </Link>
                <Link
                  to="/consumer-dashboard/company-quotation"
                  className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 ${getLinkClasses(
                    "/consumer-dashboard/company-quotation"
                  )}`}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Order
                </Link>
                <Link
                  to="/consumer-dashboard/company-projects"
                  className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 ${getLinkClasses(
                    "/consumer-dashboard/company-projects"
                  )}`}
                >
                  <ReceiptText className="h-4 w-4" />
                  Invoice
                </Link>

                {/* Add mt-auto here to push the logout button to the bottom */}
                <div
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-100 cursor-pointer transition-colors mt-auto"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </div>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="block md:hidden md:ml-auto">
            <ProfileDropdown user={user} />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <Routes>
            <Route path="consumer-profile" element={<ConsumerProfile />} />
            <Route path="consumer-profile/consumer-edit-profile" element={<ConsumerEditProfileForm />} />
            <Route path="chat/:companyId" element={<Chat />} />
            <Route path="chat" element={<ChatList />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default ConsumerDashboard;
