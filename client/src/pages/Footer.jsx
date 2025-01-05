import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Mail, ArrowUpRight } from "lucide-react";
import EcoSyncLogo from "@/_components/nav/EcoSyncLogo";
import ThemeSwitcher from "@/_components/theme/ThemeSwitcher";

const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-gradient-to-b from-background to-background/95 pt-32 pb-16">
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: 'url("/grid-pattern.jpg")',
            backgroundSize: "30px 30px",
            opacity: 0.1,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-transparent" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <EcoSyncLogo />
            </div>
            <p className="text-muted-foreground">
              Empowering Your Green Energy Journey
            </p>
            <div className="flex gap-6"></div>
          </div>
          <div className="space-y-8">
            <h4 className="text-xl font-semibold">Services</h4>
            <ul className="space-y-6">
              {[
                { name: "Get Estimate", link: "/solar-estimation" },
                { name: "Search Solar Installers", link: "/installers" },
                { name: "Explore Solar Solutions", link: "/solar-solutions" },
              ].map((item, index) => (
                <li key={index}>
                  <Link to={item.link}>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-muted-foreground hover:text-primary"
                    >
                      {item.name}
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="text-xl font-semibold">Information</h4>
            <ul className="space-y-6">
              {[
                { name: "About", link: "/about" },
                { name: "Incentives", link: "/incentives" },
              ].map((item, index) => (
                <li key={index}>
                  <Link to={item.link}>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-muted-foreground hover:text-primary"
                    >
                      {item.name}
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="text-xl font-semibold">Contact</h4>
            <div className="space-y-6">
              <ThemeSwitcher />
              <Button
                className="w-full group"
                variant="outline"
                onClick={() =>
                  window.open("https://wa.me/601139847577", "_blank")
                }
              >
                <Mail className="mr-3 h-5 w-5" />
                Contact Sales
                <ArrowUpRight className="ml-3 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </Button>
              <p className="text-sm text-muted-foreground">
                Monday - Friday, 9am - 5pm EST
              </p>
              <p className="text-sm text-muted-foreground">
                siewkhaijun57@gmail.com
              </p>
            </div>
          </div>
        </div>

        <motion.div
          className="pt-10 mt-10 border-t border-border"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex flex-col md:flex-row justify-end items-center gap-6">
            <p className="text-sm text-muted-foreground">
              © 2024 EcoSync. All rights reserved.
            </p>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
