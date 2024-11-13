import { useState } from "react";
import PropTypes from "prop-types";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  ChevronRight,
  User,
  MessageSquare,
  FileText,
  LogOut,
  Building,
  MessageCircle,
  FileCheck,
  ClipboardList,
  Construction,
  Calculator,
  Search,
  Info,
  SearchCheckIcon,
  Sun,
  LayoutDashboard,
} from "lucide-react";
import { Link } from "react-router-dom";
import { DialogTitle, DialogDescription } from "@radix-ui/react-dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import axios from "axios";

const handleLogout = async () => {
  try {
    await axios.post("http://localhost:5000/api/auth/logout", {}, { withCredentials: true });
    window.location.href = "/signin";
  } catch (error) {
    console.error("Error during logout:", error);
  }
};

const MenuItem = ({
  icon: Icon,
  label,
  onClick,
  to,
  rightIcon: RightIcon,
  className,
  iconClassName, // Add iconClassName prop
}) => {
  const Wrapper = to ? Link : "button";
  const props = to ? { to } : { onClick };

  return (
    <Wrapper
      {...props}
      className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-accent/50 rounded-lg transition-colors duration-200 ${className}`}
    >
      <div className="flex items-center gap-3">
        <Icon className={`h-5 w-5 text-primary ${iconClassName}`} />{" "}
        {/* Apply iconClassName */}
        <span>{label}</span>
      </div>
      {RightIcon && <RightIcon className="h-4 w-4 text-muted-foreground" />}
    </Wrapper>
  );
};

const MenuSection = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="px-4 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
      {title}
    </h3>
    <div className="space-y-1">{children}</div>
  </div>
);

const MobileMenu = ({ user }) => {
  const [open, setOpen] = useState(false);

  const mainMenuItems = [
    {
      to: "/solar-estimation",
      label: "Get Estimate",
      icon: Calculator,
    },
    {
      to: "/installers",
      label: "Find Installers",
      icon: Search,
    },
    {
      to: "/solar-solutions",
      label: "Explore Solar Solutions",
      icon: Sun,
    },
    {
      to: "/about",
      label: "About EcoSync",
      icon: Info,
    },
    {
      to: "/incentives",
      label: "Incentives",
      icon: SearchCheckIcon,
    },
  ];

  const getDashboardItems = (role) => {
    const items = {
      CONSUMER: [
        {
          to: "/consumer-dashboard/consumer-profile",
          label: "Profile",
          icon: User,
        },
        { to: "/consumer-dashboard/chat", label: "Chat", icon: MessageSquare },
        {
          to: "/consumer-dashboard/consumer-quotation",
          label: "Quotation",
          icon: FileText,
        },
        {
          to: "/consumer-dashboard/consumer-project",
          label: "Projects",
          icon: ClipboardList,
        },
        {
          to: "/consumer-dashboard/consumer-maintenance",
          label: "Maintenance",
          icon: Construction,
        },
      ],
      COMPANY: [
        {
          to: "/company-dashboard/company-details",
          label: "Company Details",
          icon: Building,
        },
        {
          to: "/company-dashboard/company-profile",
          label: "Profile",
          icon: User,
        },
        {
          to: "/company-dashboard/company-chat",
          label: "Chat",
          icon: MessageCircle,
        },
        {
          to: "/company-dashboard/company-quotation",
          label: "Quotation",
          icon: FileCheck,
        },
        {
          to: "/company-dashboard/company-project",
          label: "Projects",
          icon: ClipboardList,
        },
        {
          to: "/company-dashboard/company-maintenance",
          label: "Maintenance",
          icon: Construction,
        },
      ],
      ADMIN: [
        {
          to: "/dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
        },
      ],
      SUPERADMIN: [
        {
          to: "/dashboard",
          label: "Dashboard",
          icon: LayoutDashboard,
        },
      ],
    };
    return items[role] || [];
  };

  const BASE_URL = "http://localhost:5000/";

  return (
    <div className="flex h-14 items-center">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>

        <SheetContent
          side="right"
          className="w-full sm:max-w-sm p-0 bg-background/95 backdrop-blur-xl"
        >
          <DialogTitle className="sr-only">Menu</DialogTitle>
          <DialogDescription className="sr-only">
            Mobile navigation menu
          </DialogDescription>
          <div className="h-full flex flex-col overflow-y-auto py-6">
            <div className="px-4 mb-8">
              <div className="h-12 w-12 bg-primary/10 rounded-xl flex items-center justify-center">
                {user?.avatarUrl ? (
                  <Avatar>
                    <AvatarImage
                      src={`${BASE_URL}${user.avatarUrl}`}
                      alt={user.username}
                    />
                    <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
                  </Avatar>
                ) : (
                  <User className="h-6 w-6 text-primary" />
                )}
              </div>
              {user ? (
                <div className="mt-4">
                  <p className="font-semibold text-lg">{user.username}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              ) : (
                <Link
                  to="/signin"
                  className="mt-4 inline-flex items-center px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>

            <div className="flex-1 px-2 space-y-8">
              <MenuSection title="Main Menu">
                {mainMenuItems.map((item) => (
                  <MenuItem key={item.to} {...item} rightIcon={ChevronRight} />
                ))}
              </MenuSection>

              {user && (
                <MenuSection title="Dashboard">
                  {getDashboardItems(user.role).map((item) => (
                    <MenuItem
                      key={item.to}
                      {...item}
                      rightIcon={ChevronRight}
                    />
                  ))}
                </MenuSection>
              )}

              <MenuSection title="Preferences">
                {user && (
                  <MenuItem
                    icon={LogOut}
                    label="Sign Out"
                    onClick={handleLogout}
                    className="text-red-500 hover:text-red-600"
                    iconClassName="text-red-500" // Add this line to change the icon color
                  />
                )}
              </MenuSection>
            </div>

            <div className="px-4 mt-4">
              <p className="text-xs text-center text-muted-foreground">
                EcoSync © {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

MobileMenu.propTypes = {
  user: PropTypes.shape({
    username: PropTypes.string,
    email: PropTypes.string,
    role: PropTypes.string,
    avatarUrl: PropTypes.string,
  }),
};

MenuItem.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  to: PropTypes.string,
  rightIcon: PropTypes.elementType,
  className: PropTypes.string,
  iconClassName: PropTypes.string,
};

MenuSection.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node,
};

MenuSection.defaultProps = {
  children: null,
};

export default MobileMenu;
