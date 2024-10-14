import { Link, Routes, Route, useLocation } from "react-router-dom";
import {
  Home,
  User,
  MessageSquare,
  FileText,
  ReceiptText,
  Menu,
  LogOut,
  ClipboardList,
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import EcoSyncLogo from "../nav/EcoSyncLogo";
import ProfileDropdown from "../nav/ProfileDropdown";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Description } from "@radix-ui/react-dialog";
import ConsumerProfile from "./ConsumerProfile";
import ConsumerEditProfileForm from "./ConsumerEditProfileForm";
import Chat from "../communication/Chat";
import ChatList from "../communication/ChatList";
import ConsumerQuotation from "./ConsumerQuotation";
import ConsumerQuotationView from "./ConsumerQuotationView";
import ConsumerProject from "./ConsumerProject";
import ConsumerProjectStep from "./ConsumerProjectStep";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col bg-background/40">
        <div className="flex h-14 items-center px-4 lg:h-[60px] lg:px-6">
          <EcoSyncLogo className="h-6 w-6" />
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <Link
            to="/consumer-dashboard"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 my-1 transition-all ${getLinkClasses(
              "/consumer-dashboard"
            )}`}
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
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
            )} ${getLinkClasses("/consumer-dashboard/chat/:id")}`}
          >
            <MessageSquare className="h-4 w-4" />
            Chat
          </Link>
          <Link
            to="/consumer-dashboard/consumer-quotation"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 my-1 transition-all ${getLinkClasses(
              "/consumer-dashboard/consumer-quotation"
            )} ${getLinkClasses(
              "/consumer-dashboard/consumer-quotation/:id"
            )}`}
          >
            <FileText className="h-4 w-4" />
            Quotation
          </Link>
          <Link
            to="/consumer-dashboard/consumer-project"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 my-1 transition-all ${getLinkClasses(
              "/consumer-dashboard/consumer-project"
            )} ${getLinkClasses(
              "/consumer-dashboard/consumer-project/:id"
            )}`}
          >
            <ClipboardList className="h-4 w-4" />
            Projects
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
        <div className="p-4">
          <button
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-red-600 hover:bg-red-100 hover:text-red-800"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>
      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex md:hidden h-14 items-center border-b bg-background/40 px-4 lg:h-[60px] lg:px-6">
          {/* Mobile menu button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[80%] sm:w-[350px]">
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
                  className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 ${getLinkClasses(
                    "/consumer-dashboard/chat"
                  )} ${getLinkClasses("/consumer-dashboard/chat/:id")}`}
                >
                  <MessageSquare className="h-4 w-4" />
                  Chat
                </Link>
                <Link
                  to="/consumer-dashboard/consumer-quotation"
                  className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 ${getLinkClasses(
                    "/consumer-dashboard/consumer-quotation"
                  )} ${getLinkClasses(
                    "/consumer-dashboard/consumer-quotation/:id"
                  )}`}
                >
                  <FileText className="h-4 w-4" />
                  Quotation
                </Link>
                <Link
                  to="/consumer-dashboard/consumer-project"
                  className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 ${getLinkClasses(
                    "/consumer-dashboard/consumer-project"
                  )} ${getLinkClasses(
                    "/consumer-dashboard/consumer-project/:id"
                  )}`}
                >
                  <ClipboardList className="h-4 w-4" />
                  Projects
                </Link>
                <Link
                  to="/consumer-dashboard/company-quotation"
                  className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 ${getLinkClasses(
                    "/consumer-dashboard/company-quotation"
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
          <div className="ml-auto">
            <ProfileDropdown user={user} />
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <Routes>
              <Route path="/consumer-profile" element={<ConsumerProfile />} />
              <Route
                path="/consumer-profile/consumer-edit-profile"
                element={<ConsumerEditProfileForm />}
              />
              <Route path="/chat" element={<ChatList />} />
              <Route path="/chat/:companyId" element={<Chat />} />
              <Route
                path="/consumer-quotation"
                element={<ConsumerQuotation />}
              />
              <Route
                path="/consumer-quotation/:versionId"
                element={<ConsumerQuotationView />}
              />
              <Route path="/consumer-project" element={<ConsumerProject />} />
              <Route
                path="/consumer-project/:projectId"
                element={<ConsumerProjectStep />}
              />
            </Routes>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
};

export default ConsumerDashboard;