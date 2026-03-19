import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Home, MapPin, ShoppingBag, User, LogOut, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AnimatedLogo from "./AnimatedLogo";

const MobileNav = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const navItems = [
    { label: "Marketplace", href: "/marketplace", icon: Home },
    { label: "Venues", href: "/venues", icon: MapPin },
    { label: "For Business", href: "/onboarding", icon: Briefcase },
  ];

  const userItems = user
    ? [
        { label: "My Orders", href: "/my-orders", icon: ShoppingBag },
        { label: "Seller Dashboard", href: "/seller-dashboard", icon: ShoppingBag },
        { label: "Venue Dashboard", href: "/venue-owner-dashboard", icon: MapPin },
      ]
    : [];

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[280px] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <AnimatedLogo />
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
              Explore
            </p>
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                className="w-full justify-start gap-3 h-12 text-base font-medium hover:bg-primary/10 hover:text-primary"
                onClick={() => navigate(item.href)}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Button>
            ))}

            {user && userItems.length > 0 && (
              <>
                <div className="my-4 border-t border-border" />
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                  Dashboard
                </p>
                {userItems.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className="w-full justify-start gap-3 h-12 text-base font-medium hover:bg-primary/10 hover:text-primary"
                    onClick={() => navigate(item.href)}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Button>
                ))}
              </>
            )}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            {user ? (
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-12"
                onClick={() => signOut()}
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </Button>
            ) : (
              <Button
                className="w-full h-12 font-semibold"
                onClick={() => navigate("/auth")}
              >
                <User className="w-5 h-5 mr-2" />
                Sign In
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileNav;
