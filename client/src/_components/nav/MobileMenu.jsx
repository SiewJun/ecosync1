import { useState } from "react";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  Server,
  Calculator,
  Settings,
  CircleGauge,
  User,
  MessageSquare,
  FileText,
  LogOut,
  LayoutDashboard,
  Building,
  MessageCircle,
  FileCheck,
  ClipboardList,
} from "lucide-react";
import { Link } from "react-router-dom";
import ThemeSwitcher from "@/_components/theme/ThemeSwitcher";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { DialogTitle, DialogDescription } from "@radix-ui/react-dialog";

// Helper function for logout handling
const handleLogout = async () => {
  try {
    localStorage.removeItem("token");
    window.location.href = "/signin";
  } catch (error) {
    console.error("Error during logout:", error);
  }
};

// Function to render dashboard links based on the user role
const renderDashboardLinks = (user, linkClasses) => {
  const links = {
    CONSUMER: [
      { to: "/consumer-dashboard/consumer-profile", label: "Profile", icon: User },
      { to: "/consumer-dashboard/chat", label: "Chat", icon: MessageSquare },
      { to: "/consumer-dashboard/consumer-quotation", label: "Quotation", icon: FileText },
      { to: "/consumer-dashboard/consumer-project", label: "Projects", icon: ClipboardList },
    ],
    COMPANY: [
      { to: "/company-dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/company-dashboard/company-details", label: "Company Details", icon: Building },
      { to: "/company-dashboard/company-profile", label: "Company Profile", icon: User },
      { to: "/company-dashboard/company-chat", label: "Chat", icon: MessageCircle },
      { to: "/company-dashboard/company-quotation", label: "Quotation", icon: FileCheck },
      { to: "/company-dashboard/company-project", label: "Projects", icon: ClipboardList },
    ],
    ADMIN: [
      { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  };

  return (
    <>
      {links[user?.role]?.map(({ to, label, icon: Icon }) => (
        <Link key={to} to={to}>
          <li className={linkClasses}>
            <Icon className="inline-block mr-2" />
            {label}
          </li>
        </Link>
      ))}
      <li
        className="py-2 px-4 rounded-md text-red-600 hover:text-red-800 hover:bg-red-100 font-semibold cursor-pointer transition-colors"
        onClick={handleLogout}
      >
        <LogOut className="inline-block mr-2" />
        Logout
      </li>
    </>
  );
};

const MobileMenu = ({ user }) => {
  const [open, setOpen] = useState(false);
  const linkClasses =
    "py-2 px-4 rounded-md text-muted-foreground hover:text-primary-foreground hover:bg-primary transition-colors cursor-pointer";

  return (
    <div className="flex h-14 items-center gap-4">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="link" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>

        <SheetContent side="right" className="flex flex-col p-4">
          <DialogTitle className="sr-only">Navigation Menu</DialogTitle>
          <DialogDescription className="sr-only">
            Mobile navigation menu for the Ecosync website.
          </DialogDescription>

          {/* Main Navigation */}
          <nav className="space-y-4 mt-8 text-lg font-medium">
            <Accordion type="single" collapsible>
              <AccordionItem value="services">
                <AccordionTrigger className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Services
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="pl-4 mt-2 space-y-2">
                    <li className={linkClasses}>
                      <Link to="/about">About Ecosync</Link>
                    </li>
                    <li className={linkClasses}>
                      <Link to="/solar-estimation">Get Estimate</Link>
                    </li>
                    <li className={linkClasses}>
                      <Link to="/installers">Search Solar Installers</Link>
                    </li>
                    <li className={linkClasses}>
                      <Link to="/solar-solutions">Search/Compare Solar Solutions</Link>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="calculator">
                <AccordionTrigger className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Calculator
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="pl-4 mt-2 space-y-2">
                    {/* Add Calculator Links if needed */}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="dashboard">
                <AccordionTrigger className="flex items-center gap-2">
                  <CircleGauge className="h-5 w-5" />
                  Dashboard
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="pl-4 mt-2 space-y-2">
                    {user ? (
                      renderDashboardLinks(user, linkClasses)
                    ) : (
                      <Link to="/signin">
                        <li className="py-2 px-4 rounded-md text-muted-foreground transition-colors">
                          <Button>Sign In</Button>
                        </li>
                      </Link>
                    )}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="settings">
                <AccordionTrigger className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Settings
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="pl-4 mt-2 space-y-2">
                    <li className="py-2 flex items-center space-x-2">
                      <ThemeSwitcher />
                      <p>Switch Theme</p>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
};

MobileMenu.propTypes = {
  user: PropTypes.shape({
    role: PropTypes.string,
  }),
};

export default MobileMenu;
