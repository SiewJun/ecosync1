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
  ShoppingCart,
  LogOut,
  LayoutDashboard,
  Building,
  ReceiptText,
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

const renderDashboardLinks = (user) => {
  const handleLogout = async () => {
    try {
      localStorage.removeItem("token");
      window.location.href = "/signin";
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const linkClasses =
    "py-2 px-4 rounded-md text-muted-foreground hover:text-primary-foreground hover:bg-primary transition-colors cursor-pointer";

  switch (user?.role) {
    case "CONSUMER":
      return (
        <>
          <Link to="consumer-dashboard/consumer-profile">
            <li className={linkClasses}>
              <User className="inline-block mr-2" />
              Profile
            </li>
          </Link>
          <Link to="consumer-dashboard/chat">
            <li className={linkClasses}>
              <MessageSquare className="inline-block mr-2" />
              Chat
            </li>
          </Link>
          <Link to="consumer-dashboard/quotation">
            <li className={linkClasses}>
              <FileText className="inline-block mr-2" />
              Quotation
            </li>
          </Link>
          <Link to="consumer-dashboard/order">
            <li className={linkClasses}>
              <ShoppingCart className="inline-block mr-2" />
              Order
            </li>
          </Link>
          <Link to="consumer-dashboard/invoice">
            <li className={linkClasses}>
              <ReceiptText className="inline-block mr-2" />
              Invoice
            </li>
          </Link>
          <li
            className="py-2 px-4 rounded-md text-red-600 hover:text-red-800 hover:bg-red-100 font-semibold cursor-pointer transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="inline-block mr-2" />
            Logout
          </li>
        </>
      );
    case "COMPANY":
      return (
        <>
          <Link to="/company-dashboard">
            <li className={linkClasses}>
              <LayoutDashboard className="inline-block mr-2" />
              Dashboard
            </li>
          </Link>
          <Link to="/company-dashboard/company-details">
            <li className={linkClasses}>
              <Building className="inline-block mr-2" />
              Company Details
            </li>
          </Link>
          <Link to="/company-dashboard/company-profile">
            <li className={linkClasses}>
              <User className="inline-block mr-2" />
              Company Profile
            </li>
          </Link>
          <Link to="/company-dashboard/chat">
            <li className={linkClasses}>
              <MessageCircle className="inline-block mr-2" />
              Chat
            </li>
          </Link>
          <Link to="/company-dashboard/quotation">
            <li className={linkClasses}>
              <FileCheck className="inline-block mr-2" />
              Quotation
            </li>
          </Link>
          <Link to="/company-dashboard/projects">
            <li className={linkClasses}>
              <ClipboardList className="inline-block mr-2" />
              Projects
            </li>
          </Link>
          <li
            className="py-2 px-4 rounded-md text-red-600 hover:text-red-800 hover:bg-red-100 font-semibold cursor-pointer transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="inline-block mr-2" />
            Logout
          </li>
        </>
      );
    case "ADMIN":
      return (
        <>
          <Link to="/admindashboard">
            <li className={linkClasses}>
              <LayoutDashboard className="inline-block mr-2" />
              Dashboard
            </li>
          </Link>
          <li
            className="py-2 px-4 rounded-md text-red-600 hover:text-red-800 hover:bg-red-100 font-semibold cursor-pointer transition-colors"
            onClick={handleLogout}
          >
            <LogOut className="inline-block mr-2" />
            Logout
          </li>
        </>
      );
    default:
      return null;
  }
};

const MobileMenu = ({ user }) => {
  const [open, setOpen] = useState(false);

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
            This is the mobile navigation menu for the Ecosync website.
          </DialogDescription>
          <nav className="space-y-4 mt-10 text-lg font-medium">
            <Accordion type="single" collapsible>
              <AccordionItem value="services">
                <AccordionTrigger className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Services
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="pl-4 mt-2 space-y-2">
                    <li className="py-2 px-4 rounded-md text-muted-foreground hover:text-primary-foreground hover:bg-primary transition-colors">
                      <Link to="/about">About Ecosync</Link>
                    </li>
                    <li className="py-2 px-4 rounded-md text-muted-foreground hover:text-primary-foreground hover:bg-primary transition-colors">
                      <Link to="/installers">
                        Search Solar Installers
                      </Link>
                    </li>
                    <li className="py-2 px-4 rounded-md text-muted-foreground hover:text-primary-foreground hover:bg-primary transition-colors">
                      <Link to="/solar-solutions">
                        Search/Compare Solar Solutions
                      </Link>
                    </li>
                    <li className="py-2 px-4 rounded-md text-muted-foreground hover:text-primary-foreground hover:bg-primary transition-colors">
                      <Link to="/solar-incentives">
                        Solar Incentives for Residential
                      </Link>
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
                  <ul className="pl-4 mt-2 space-y-2"></ul>
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
                      renderDashboardLinks(user)
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
