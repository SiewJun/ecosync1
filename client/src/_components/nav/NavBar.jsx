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
import axios from "axios";
import ThemeSwitcher from "@/_components/theme/ThemeSwitcher";

const components = [
  {
    title: "Alert Dialog",
    href: "/docs/primitives/alert-dialog",
    description:
      "A modal dialog that interrupts the user with important content and expects a response.",
  },
  {
    title: "Hover Card",
    href: "/docs/primitives/hover-card",
    description:
      "For sighted users to preview content available behind a link.",
  },
  {
    title: "Progress",
    href: "/docs/primitives/progress",
    description:
      "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
  },
];

function NavBar() {
  const [user, setUser] = useState(null);

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
          // Handle 403 Forbidden error
          localStorage.removeItem("token"); // Optionally remove the token
        } else {
          console.error("Error fetching user:", error);
        }
      }
    };

    fetchUser();
  }, []);

  return (
    <div className="flex w-full items-center justify-between px-5 py-3 md:px-4">
      <EcoSyncLogo />
      <div className="md:hidden">
        <MobileMenu user={user} />
      </div>
      <div className="hidden md:flex">
        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Services</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                  <li className="row-span-3">
                    <NavigationMenuLink asChild>
                      <a
                        className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                        href="/"
                      >
                        <div className="mb-2 mt-4 text-lg font-medium">
                          About Ecosync
                        </div>
                        <p className="text-sm leading-tight text-muted-foreground">
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit. Nulla rhoncus, metus at suscipit pulvinar, eros
                          est lacinia sapien, eu blandit lacus diam sed elit.
                        </p>
                      </a>
                    </NavigationMenuLink>
                  </li>
                  <ListItem href="/solar-estimation" title="Get Estimate">
                    Estimate the savings of installing solar panels on your
                    property, including the recommended solar system size.{" "}
                  </ListItem>
                  <ListItem href="/installers" title="Search Solar Installers">
                    Find reliable and experienced solar installers in your area.
                  </ListItem>
                  <ListItem
                    href="/solar-solutions"
                    title="Search/Compare Solar Solutions"
                  >
                    Discover a wide range of solar solutions to fit your needs
                    and budget.
                  </ListItem>
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
            <NavigationMenuItem>
              <NavigationMenuTrigger>Calculator</NavigationMenuTrigger>
              <NavigationMenuContent>
                <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                  {components.map((component) => (
                    <ListItem
                      key={component.title}
                      title={component.title}
                      href={component.href}
                    >
                      {component.description}
                    </ListItem>
                  ))}
                </ul>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <div className="hidden md:flex items-center justify-between">
        <ThemeSwitcher className="mr-2" />
        {user ? (
          <div className="ml-2">
            <ProfileDropdown user={user} />
          </div>
        ) : (
          <Link to="/signin">
            <Button variant="outline" className="ml-2">
              Sign in
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

const ListItem = React.forwardRef(
  // eslint-disable-next-line react/prop-types
  ({ className, title, children, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <a
            ref={ref}
            className={cn(
              "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          </a>
        </NavigationMenuLink>
      </li>
    );
  }
);
ListItem.displayName = "ListItem";

export default NavBar;
