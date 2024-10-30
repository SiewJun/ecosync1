import { Link, Routes, Route, useLocation } from "react-router-dom";
import {
  User,
  FileCheck,
  ClipboardList,
  Building,
  MessageCircle,
  Menu,
  LogOut,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";
import EcoSyncLogo from "../nav/EcoSyncLogo";
import ProfileDropdown from "../nav/ProfileDropdown";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Description } from "@radix-ui/react-dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import CompanyDetail from "./CompanyDetails";
import CompanyEditDetailsForm from "./CompanyEditDetailsForm";
import CompanyProfile from "./CompanyProfile";
import CompanyProfileEditForm from "./CompanyEditProfileForm";
import CompanyGalleryEditForm from "./CompanyGalleryEditForm";
import CompanyAddSolutionForm from "./CompanyAddSolutionForm";
import CompanyEditSolutionForm from "./CompanyEditSolutionForm";
import ChatListCompany from "../communication/ChatListCompany";
import ChatCompany from "../communication/ChatCompany";
import CompanyQuotation from "./CompanyQuotation";
import QuotationDraft from "./QuotationDraft";
import CompanyProject from "./CompanyProject";
import CompanyProjectStep from "./CompanyProjectStep";
import StripeOnboarding from "./StripeOnboarding";
import useStripeOnboarding from "../../hooks/useStripeOnboarding";
import OnboardingReminder from "./OnboardingReminder";
import NotFoundPage from "@/pages/NotFoundPage";

const CompanyDashboard = () => {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const { isOnboarded, isLoading } = useStripeOnboarding();
  const isOnboardingPage = location.pathname === '/company-dashboard/stripe-onboarding';

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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col bg-background/40">
        <div className="flex h-14 items-center px-4 lg:h-[60px] lg:px-6">
          <EcoSyncLogo className="h-6 w-6" />
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <Link
            to="/company-dashboard/company-details"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 my-1 transition-all ${getLinkClasses(
              "/company-dashboard/company-details"
            )} ${getLinkClasses(
              "/company-dashboard/company-details/company-edit-details"
            )}`}
          >
            <Building className="h-4 w-4" />
            Company Details
          </Link>
          <Link
            to="/company-dashboard/company-profile"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 my-1 transition-all ${getLinkClasses(
              "/company-dashboard/company-profile"
            )} ${getLinkClasses(
              "/company-dashboard/company-profile/company-profile-edit"
            )} ${getLinkClasses(
              "/company-dashboard/company-profile/company-gallery-edit"
            )} ${getLinkClasses(
              "/company-dashboard/company-profile/company-add-solution"
            )} ${getLinkClasses(
              "/company-dashboard/company-profile/company-edit-solution/:id"
            )}`}
          >
            <User className="h-4 w-4" />
            Company Profile
          </Link>
          <Link
            to="/company-dashboard/company-chat"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 my-1 transition-all ${getLinkClasses(
              "/company-dashboard/company-chat"
            )} ${getLinkClasses("/company-dashboard/company-chat/:id")}`}
          >
            <MessageCircle className="h-4 w-4" />
            Chat
          </Link>
          <Link
            to="/company-dashboard/company-quotation"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 my-1 transition-all ${getLinkClasses(
              "/company-dashboard/company-quotation"
            )} ${getLinkClasses("/company-dashboard/company-quotation/:id")}`}
          >
            <FileCheck className="h-4 w-4" />
            Quotation
          </Link>
          <Link
            to="/company-dashboard/company-project"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 my-1 transition-all ${getLinkClasses(
              "/company-dashboard/company-project"
            )} ${getLinkClasses(
              "/company-dashboard/company-project/:projectId"
            )}`}
          >
            <ClipboardList className="h-4 w-4" />
            Projects
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
                  This is a mobile menu for company dashboard
                </DialogTitle>
                <Description>Menu for navigating the dashboard</Description>
              </div>
              <nav className="flex flex-col flex-1 gap-2 text-lg font-medium">
                <div className="flex items-center gap-2 text-lg font-semibold">
                  <EcoSyncLogo />
                </div>
                <Link
                  to="/company-dashboard/company-details"
                  className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 ${getLinkClasses(
                    "/company-dashboard/company-details"
                  )} ${getLinkClasses(
                    "/company-dashboard/company-details/company-edit-details"
                  )}`}
                >
                  <Building className="h-5 w-5" />
                  Company Details
                </Link>
                <Link
                  to="/company-dashboard/company-profile"
                  className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 ${getLinkClasses(
                    "/company-dashboard/company-profile"
                  )} ${getLinkClasses(
                    "/company-dashboard/company-profile/company-add-solution"
                  )}`}
                >
                  <User className="h-4 w-4" />
                  Company Profile
                </Link>
                <Link
                  to="/company-dashboard/company-chat"
                  className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 ${getLinkClasses(
                    "/company-dashboard/company-chat"
                  )} ${getLinkClasses("/company-dashboard/company-chat/:id")}`}
                >
                  <MessageCircle className="h-4 w-4" />
                  Chat
                </Link>
                <Link
                  to="/company-dashboard/company-quotation"
                  className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 ${getLinkClasses(
                    "/company-dashboard/company-quotation"
                  )} ${getLinkClasses(
                    "/company-dashboard/company-quotation/:id"
                  )}`}
                >
                  <FileCheck className="h-4 w-4" />
                  Quotation
                </Link>
                <Link
                  to="/company-dashboard/company-project"
                  className={`mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 ${getLinkClasses(
                    "/company-dashboard/company-project"
                  )} ${getLinkClasses(
                    "/company-dashboard/company-project/:projectId"
                  )}`}
                >
                  <ClipboardList className="h-4 w-4" />
                  Project
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
            {/* Onboarding reminder */}
            {!isOnboarded &&  !isOnboardingPage && <div className="p-6"><OnboardingReminder /></div> }
            <Routes>
              <Route path="company-details" element={<CompanyDetail />} />
              <Route
                path="company-details/company-edit-details"
                element={<CompanyEditDetailsForm />}
              />
              <Route path="/company-profile" element={<CompanyProfile />} />
              <Route
                path="/company-profile/company-profile-edit"
                element={<CompanyProfileEditForm />}
              />
              <Route
                path="/company-profile/company-gallery-edit"
                element={<CompanyGalleryEditForm />}
              />
              <Route
                path="/company-profile/company-add-solution"
                element={<CompanyAddSolutionForm />}
              />
              <Route
                path="/company-profile/company-edit-solution/:id"
                element={<CompanyEditSolutionForm />}
              />
              <Route path="/company-chat" element={<ChatListCompany />} />
              <Route
                path="/company-chat/:consumerId"
                element={<ChatCompany />}
              />
              <Route path="/company-quotation" element={<CompanyQuotation />} />
              <Route
                path="company-quotation/:quotationId"
                element={<QuotationDraft />}
              />
              <Route path="/company-project" element={<CompanyProject />} />
              <Route
                path="/company-project/:projectId"
                element={<CompanyProjectStep />}
              />
              <Route path="/stripe-onboarding" element={<StripeOnboarding />} />
              <Route path="*" element={<NotFoundPage />} />
              {/* Add other routes here */}
            </Routes>
          </ScrollArea>
        </main>
      </div>
    </div>
  );
};
export default CompanyDashboard;
