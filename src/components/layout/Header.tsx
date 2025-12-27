import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/UserMenu";
import { SoundToggle } from "@/components/SoundToggle";
import { Calculator, Gamepad2, Home, Lightbulb, Trophy } from "lucide-react";

const Header = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/tables", label: "Tables", icon: Calculator },
    { path: "/quiz", label: "Games", icon: Gamepad2 },
    { path: "/tips", label: "Tips", icon: Lightbulb },
    { path: "/progress", label: "Progress", icon: Trophy },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-card/80 backdrop-blur-md border-b border-border shadow-soft no-print">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-3xl animate-bounce-gentle">✨</span>
            <h1 className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Times Table Fun!
            </h1>
          </Link>

          <nav className="flex items-center gap-1 md:gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={
                      isActive
                        ? ""
                        : "text-muted-foreground hover:text-foreground"
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline">{item.label}</span>
                  </Button>
                </Link>
              );
            })}
            <SoundToggle />
            <UserMenu />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
