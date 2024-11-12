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
import {
  Laptop,
  Users,
  LineChart,
  Sun,
  Building2,
  SearchCheckIcon,
} from "lucide-react";
import axios from "axios";
import ThemeSwitcher from "@/_components/theme/ThemeSwitcher";
import PropTypes from "prop-types";

const services = [
  {
    title: "Get Estimate",
    href: "/solar-estimation",
    description:
      "Estimate savings from solar panel installation with our advanced calculator.",
    icon: <LineChart className="h-5 w-5 text-primary" />,
  },
  {
    title: "Search Installers",
    href: "/installers",
    description: "Connect with certified solar professionals in your area.",
    icon: <Users className="h-5 w-5 text-primary" />,
  },
  {
    title: "Solar Solutions",
    href: "/solar-solutions",
    description: "Compare and find the perfect solar setup for your needs.",
    icon: <Sun className="h-5 w-5 text-primary" />,
  },
];

const information = [
  {
    title: "About EcoSync",
    href: "/about",
    description:
      "Learn about our mission to make solar energy accessible to everyone.",
    icon: <Building2 className="h-5 w-5 text-primary" />,
  },
  {
    title: "Technology",
    href: "/technology",
    description:
      "Discover the innovative technology behind our solar solutions.",
    icon: <Laptop className="h-5 w-5 text-primary" />,
  },
  {
    title: "Incentives",
    href: "/incentives",
    description: "Access guides, articles, and tools to help you go solar.",
    icon: <SearchCheckIcon className="h-5 w-5 text-primary" />,
  },
];

function NavBar() {
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const navHeight = "h-16";
  const [isHovered, setIsHovered] = useState(false);

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
        const response = await axios.get("http://localhost:5000/api/auth/me", {
          withCredentials: true, // Include credentials in the request
        });
        setUser(response.data.user);
      } catch (error) {
        if (error.response?.status === 403) {
          console.error("Error fetching user:", error);
        }
      }
    };

    fetchUser();
  }, []);

  return (
    <>
      <div
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-500",
          navHeight,
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm"
            : "bg-background/0",
          isHovered && "bg-background/90 backdrop-blur-xl"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="h-full mx-auto px-4">
          <div className="flex items-center justify-between h-full">
            <div className="flex-1 flex justify-start">
              <Link to="/">
                <EcoSyncLogo className="transition-transform duration-300 hover:scale-105" />
              </Link>
            </div>

            <div className="flex-1 flex justify-center">
              <div className="hidden md:flex">
                <NavigationMenu>
                  <NavigationMenuList className="space-x-2">
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="text-sm font-medium bg-transparent data-[state=open]:bg-accent/30 hover:bg-accent/20 transition-colors duration-300">
                        Services
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="w-[400px] p-4 bg-background/95 backdrop-blur-xl rounded-xl shadow-lg">
                          <div className="grid gap-3">
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
                      <NavigationMenuTrigger className="text-sm font-medium bg-transparent data-[state=open]:bg-accent/30 hover:bg-accent/20 transition-colors duration-300">
                        Info
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        <div className="w-[400px] p-4 bg-background/95 backdrop-blur-xl rounded-xl shadow-lg">
                          <div className="grid gap-3">
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

              <div className="hidden md:flex items-center space-x-4">
                <ThemeSwitcher />
                {user ? (
                  <ProfileDropdown user={user} />
                ) : (
                  <Link to="/signin">
                    <Button
                      variant="default"
                      size="sm"
                      className="font-medium transition-all duration-300 hover:scale-105 hover:shadow-md"
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
            "flex items-center gap-4 rounded-lg p-3 transition-all duration-300",
            "hover:bg-accent/30 active:scale-98",
            "no-underline outline-none focus:ring-2 focus:ring-primary/20",
            className
          )}
          {...props}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background/50 backdrop-blur-sm shadow-sm">
            {icon}
          </div>
          <div>
            <div className="text-sm font-semibold leading-none mb-1.5">
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
