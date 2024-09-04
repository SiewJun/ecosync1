import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  Server,
  Calculator,
  Settings,
  CircleGauge,
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

const MobileMenu = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-14 items-center gap-4 px-4">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="link" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="flex flex-col">
          <DialogTitle className="sr-only">Navigation Menu</DialogTitle>
          <DialogDescription className="sr-only">
            This is the navigation menu for the Ecosync website.
          </DialogDescription>
          <h1 className="text-xl mb-3 font-semibold">Ecosync</h1>
          <nav className="space-y-2 text-lg font-medium">
            <Accordion type="single" collapsible>
              {/* Services Accordion */}
              <AccordionItem value="services">
                <AccordionTrigger className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  Services
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="pl-4 mt-2 space-y-1">
                    <li>
                      <Link
                        to="/about"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        About Ecosync
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/solar-installers"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Search Solar Installers
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/solar-solutions"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Search/Compare Solar Solutions
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/solar-incentives"
                        className="text-muted-foreground hover:text-foreground"
                      >
                        Solar Incentives for Residential
                      </Link>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* Calculator Accordion */}
              <AccordionItem value="calculator">
                <AccordionTrigger className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Calculator
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="pl-4 mt-2 space-y-1">
                    {components.map((component) => (
                      <li key={component.title}>
                        <Link
                          to={component.href}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {component.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* Dashboard Accordion */}
              <AccordionItem value="dashboard">
                <AccordionTrigger className="flex items-center gap-2">
                  <CircleGauge className="h-5 w-5" />
                  Dashboard
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="pl-4 mt-2 space-y-1">
                    <li>
                      <Link
                        to="/chat"
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                      >
                        Chat
                      </Link>
                    </li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              {/* Settings Accordion */}
              <AccordionItem value="settings">
                <AccordionTrigger className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Settings
                </AccordionTrigger>
                <AccordionContent>
                  <ul className="pl-4 mt-2 space-y-1">
                    <li className="flex items-center space-x-2">
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

export default MobileMenu;
