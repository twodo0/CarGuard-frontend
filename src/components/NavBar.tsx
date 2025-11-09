import { Link, useNavigate, useLocation } from "react-router-dom";
import { Car } from "lucide-react";
import { Button } from "./ui/button";

export function NavBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";

  const scrollToSection = (sectionId: string) => {
    if (!isHome) {
      navigate("/");
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-bold text-primary">
          <Car className="h-6 w-6" />
          <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
            CarGuard AI
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Button
            variant="ghost"
            onClick={() => scrollToSection("hero")}
            className="text-foreground hover:text-primary transition-colors"
          >
            Home
          </Button>
          <Button
            variant="ghost"
            onClick={() => scrollToSection("about")}
            className="text-foreground hover:text-primary transition-colors"
          >
            About
          </Button>
          <Button
            variant="ghost"
            onClick={() => scrollToSection("services")}
            className="text-foreground hover:text-primary transition-colors"
          >
            Services
          </Button>
          <Link to="/recent">
            <Button variant="ghost" className="text-foreground hover:text-primary transition-colors">
              Recent
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
