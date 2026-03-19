import { User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";
import CartSheet from "./CartSheet";
import AnimatedLogo from "./AnimatedLogo";
import MobileNav from "./MobileNav";
import NotificationBell from "./NotificationBell";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSectionNav = (section: string) => {
    if (location.pathname !== "/") {
      navigate("/");
    }
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("select-section", { detail: section }));
    }, location.pathname !== "/" ? 200 : 50);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <AnimatedLogo onClick={() => navigate("/")} />

          <div className="hidden md:flex items-center gap-1">
            <button onClick={() => navigate("/marketplace")} className="px-4 py-2 rounded-lg text-foreground hover:text-primary hover:bg-primary/5 transition-all font-medium text-sm">
              Marketplace
            </button>
            <button onClick={() => navigate("/venues")} className="px-4 py-2 rounded-lg text-foreground hover:text-primary hover:bg-primary/5 transition-all font-medium text-sm">
              Venues
            </button>
            <a href="/onboarding" className="px-4 py-2 rounded-lg text-foreground hover:text-primary hover:bg-primary/5 transition-all font-medium text-sm">
              For Business
            </a>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {user && <NotificationBell />}
            {user && <CartSheet />}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hover:text-primary hover:bg-primary/5 hidden md:flex rounded-xl">
                    <User className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <DropdownMenuItem onClick={() => navigate("/my-orders")}>
                    My Orders
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/seller-dashboard")}>
                    Seller Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/venue-owner-dashboard")}>
                    Venue Owner Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button onClick={() => navigate("/auth")} size="sm" className="hidden md:flex rounded-xl font-bold px-5">
                Sign In
              </Button>
            )}
            <MobileNav />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
