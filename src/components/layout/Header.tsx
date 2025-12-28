import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/UserMenu";
import { SoundToggle } from "@/components/SoundToggle";
import { Calculator, Gamepad2, Home, Lightbulb, Trophy } from "lucide-react";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/tables", label: "Tables", icon: Calculator },
    { path: "/#games", label: "Games", icon: Gamepad2 },
    { path: "/tips", label: "Tips", icon: Lightbulb },
    { path: "/progress", label: "Progress", icon: Trophy },
  ];

  const handleNavClick = (path: string) => {
    if (path === "/#games") {
      if (location.pathname === "/") {
        // Already on home, just scroll
        document
          .getElementById("games")
          ?.scrollIntoView({ behavior: "smooth" });
      } else {
        // Navigate to home, then scroll after a brief delay
        navigate("/");
        setTimeout(() => {
          document
            .getElementById("games")
            ?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-card/80 backdrop-blur-md border-b border-border shadow-soft no-print">
      <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between gap-2">
          <Link
            to="/"
            className="flex items-center gap-1.5 sm:gap-2 group shrink-0"
          >
            <span className="text-2xl sm:text-3xl animate-bounce-gentle">
              ✨
            </span>
            <h1 className="text-base sm:text-xl md:text-2xl font-extrabold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent whitespace-nowrap">
              <span className="hidden xs:inline">Times Table Fun!</span>
              <span className="xs:hidden">TTF!</span>
            </h1>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-1.5 md:gap-2 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.path.startsWith("/#")
                ? location.pathname === "/" &&
                  location.hash === item.path.slice(1)
                : location.pathname === item.path;
              const isGamesLink = item.path === "/#games";

              if (isGamesLink) {
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleNavClick(item.path)}
                    className={`min-w-[40px] min-h-[40px] p-2 ${
                      isActive
                        ? ""
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="hidden md:inline ml-1">{item.label}</span>
                  </Button>
                );
              }

              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={`min-w-[40px] min-h-[40px] p-2 ${
                      isActive
                        ? ""
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    <span className="hidden md:inline ml-1">{item.label}</span>
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
