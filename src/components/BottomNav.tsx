import { Home, MapPin, ShoppingBag, User, ClipboardList } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const tabs = [
    { icon: Home, label: "Home", path: "/" },
    { icon: MapPin, label: "Venues", path: "/venues" },
    { icon: ClipboardList, label: "Orders", path: "/my-orders" },
    { icon: ShoppingBag, label: "Market", path: "/marketplace" },
    { icon: User, label: user ? "Account" : "Sign In", path: user ? "/seller-dashboard" : "/auth" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      <div className="absolute inset-0 bg-card/90 backdrop-blur-xl border-t border-border/50" />
      <div className="relative flex items-center justify-around px-2 pt-2 pb-[env(safe-area-inset-bottom,8px)]">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          return (
            <button
              key={tab.label}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-xl transition-all duration-300 min-w-[56px] ${
                active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className={`relative p-1.5 rounded-xl transition-all duration-300 ${
                active ? "bg-primary/15" : ""
              }`}>
                <tab.icon className={`w-5 h-5 transition-all ${active ? "scale-110" : ""}`} />
                {active && (
                  <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </div>
              <span className={`text-[10px] font-bold leading-none ${active ? "text-primary" : ""}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
