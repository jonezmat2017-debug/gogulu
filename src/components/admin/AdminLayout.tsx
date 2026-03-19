import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Home, Building2, ShoppingBag, Settings, Download, LogOut, UserCheck, BarChart, CreditCard, Sparkles, Wallet, MessageSquare, Activity } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const menuItems = [
  { title: "Dashboard", url: "/admin", icon: Home, end: true },
  { title: "User Management", url: "/admin/users", icon: UserCheck },
  { title: "Seller Onboarding", url: "/admin/seller-onboarding", icon: UserCheck },
  { title: "Venue Owner Onboarding", url: "/admin/venue-onboarding", icon: Building2 },
  { title: "Analytics", url: "/admin/analytics", icon: BarChart },
  { title: "Transactions", url: "/admin/transactions", icon: CreditCard },
  { title: "Payment Gateways", url: "/admin/payment-gateways", icon: Wallet },
  { title: "AI Features", url: "/admin/ai-features", icon: Sparkles },
  { title: "Venues", url: "/admin/venues", icon: Building2 },
  { title: "Products", url: "/admin/products", icon: ShoppingBag },
  { title: "Review Moderation", url: "/admin/reviews", icon: MessageSquare },
  { title: "Activity Logs", url: "/admin/activity-logs", icon: Activity },
  { title: "Import Places", url: "/admin/import-places", icon: Download },
  { title: "Site Settings", url: "/admin/settings", icon: Settings },
];

function AdminSidebarContent() {
  const { state } = useSidebar();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Logged out successfully" });
    navigate("/");
  };

  const collapsed = state === "collapsed";

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"}>
      <div className="p-4 border-b">
        <h2 className={collapsed ? "text-xs" : "text-lg font-bold"}>
          {collapsed ? "Admin" : "Admin Dashboard"}
        </h2>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.end}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-accent text-accent-foreground font-medium"
                          : "hover:bg-accent/50"
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}

export function AdminLayout() {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebarContent />
        
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b flex items-center px-4 bg-background">
            <SidebarTrigger />
          </header>
          
          <main className="flex-1 p-6 bg-muted/30">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
