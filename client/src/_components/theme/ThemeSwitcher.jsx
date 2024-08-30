import { useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { Sun, Moon, Monitor } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const ThemeSwitcher = () => {
  const { theme, setAndStoreTheme } = useContext(ThemeContext);

  const handleThemeChange = (newTheme) => {
    setAndStoreTheme(newTheme);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          {theme === "light" ? (
            <Sun size={20} />
          ) : theme === "dark" ? (
            <Moon size={20} />
          ) : (
            <Monitor size={20} />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onSelect={() => handleThemeChange("light")}>
          <Sun size={16} className="mr-2" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleThemeChange("dark")}>
          <Moon size={16} className="mr-2" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => handleThemeChange("system")}>
          <Monitor size={16} className="mr-2" /> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSwitcher;
