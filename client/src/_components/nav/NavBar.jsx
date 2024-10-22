import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import EcoSyncLogo from "./EcoSyncLogo";
import MobileMenu from "@/_components/nav/MobileMenu";
import ProfileDropdown from "./ProfileDropdown";
import { Laptop, Users, LineChart, Sun, Building2, SearchCheckIcon } from "lucide-react";
import axios from "axios";
import ThemeSwitcher from "@/_components/theme/ThemeSwitcher";
import PropTypes from "prop-types";

const services = [
  {
    title: "Get Estimate",
    href: "/solar-estimation",
    description:
      "Estimate savings from solar panel installation with our advanced calculator.",
    icon: <LineChart className="h-5 w-5 text-primary/70" />,
  },
  {
    title: "Search Installers",
    href: "/installers",
    description: "Connect with certified solar professionals in your area.",
    icon: <Users className="h-5 w-5 text-primary/70" />,
  },
  {
    title: "Solar Solutions",
    href: "/solar-solutions",
    description: "Compare and find the perfect solar setup for your needs.",
    icon: <Sun className="h-5 w-5 text-primary/70" />,
  },
];

const information = [
  {
    title: "About EcoSync",
    href: "/about",
    description:
      "Learn about our mission to make solar energy accessible to everyone.",
    icon: <Building2 className="h-5 w-5 text-primary/70" />,
  },
  {
    title: "Technology",
    href: "/technology",
    description:
      "Discover the innovative technology behind our solar solutions.",
    icon: <Laptop className="h-5 w-5 text-primary/70" />,
  },
  {
    title: "Incentives",
    href: "/Incentives",
    description: "Access guides, articles, and tools to help you go solar.",
    icon: <SearchCheckIcon className="h-5 w-5 text-primary/70" />,
  },
];

function NavBar() {
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const navHeight = "h-16"; // Define a consistent height for the navbar

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        if (error.response?.status === 403) {
          localStorage.removeItem("token");
        }
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, []);

  return (
    <>
      <div
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-300",
          navHeight,
          scrolled
            ? "opacity-95 backdrop-blur-lg border-b shadow-sm"
            : ""
        )}
      >
        <div className="mx-auto h-full">
          <div className="flex items-center justify-between px-4 h-full">
            <div className="flex-1 flex justify-start">
              <EcoSyncLogo className="transition-transform duration-200 hover:scale-105" />
            </div>

            <div className="flex-1 flex justify-center">
              <div className="hidden md:flex">
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="text-sm font-medium bg-transparent hover:bg-accent/40">
                        Services
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="w-[400px] p-3">
                          <div className="grid gap-2">
                            {services.map((service) => (
                              <ListItem
                                key={service.title}
                                title={service.title}
                                href={service.href}
                                icon={service.icon}
                              >
                                {service.description}
                              </ListItem>
                            ))}
                          </div>
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="text-sm font-medium bg-transparent hover:bg-accent/40">
                        Info
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="w-[400px] p-3">
                          <div className="grid gap-2">
                            {information.map((item) => (
                              <ListItem
                                key={item.title}
                                title={item.title}
                                href={item.href}
                                icon={item.icon}
                              >
                                {item.description}
                              </ListItem>
                            ))}
                          </div>
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
              </div>
            </div>

            <div className="flex-1 flex justify-end">
              <div className="md:hidden">
                <MobileMenu user={user} />
              </div>

              <div className="hidden md:flex items-center space-x-3">
                <ThemeSwitcher />
                {user ? (
                  <ProfileDropdown user={user} />
                ) : (
                  <Link to="/signin">
                    <Button
                      variant="default"
                      size="sm"
                      className="font-medium transition-all hover:scale-105"
                    >
                      Sign in
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Add spacing div to prevent content overlap */}
      <div className={navHeight} />
    </>
  );
}

const ListItem = React.forwardRef(
  ({ className, title, children, icon, ...props }, ref) => {
    return (
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "flex items-center gap-3 rounded-md p-2.5 transition-colors hover:bg-accent/50",
            "no-underline outline-none",
            className
          )}
          {...props}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-md border bg-background">
            {icon}
          </div>
          <div>
            <div className="text-sm font-medium leading-none mb-1">
              {title}
            </div>
            <p className="line-clamp-2 text-xs text-muted-foreground">
              {children}
            </p>
          </div>
        </a>
      </NavigationMenuLink>
    );
  }
);

ListItem.displayName = "ListItem";

ListItem.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  icon: PropTypes.node.isRequired,
};

export default NavBar;