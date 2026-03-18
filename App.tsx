import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import CustomCursor from "@/components/CustomCursor";
import BottomNav from "@/components/BottomNav";
import Index from "./pages/Index";
import Venues from "./pages/Venues";
import Marketplace from "./pages/Marketplace";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminVenues from "./pages/admin/Venues";
import AdminProducts from "./pages/admin/Products";
import ImportPlaces from "./pages/admin/ImportPlaces";
import SiteSettings from "./pages/admin/Settings";
import SellerOnboarding from "./pages/admin/SellerOnboarding";
import AdminUsers from "./pages/admin/Users";
import VenueOnboarding from "./pages/admin/VenueOnboarding";
import Analytics from "./pages/admin/Analytics";
import Transactions from "./pages/admin/Transactions";
import AIFeatures from "./pages/admin/AIFeatures";
import ReviewModeration from "./pages/admin/ReviewModeration";
import PaymentGateways from "./pages/admin/PaymentGateways";
import SellerDashboard from "./pages/SellerDashboard";
import VenueOwnerDashboard from "./pages/VenueOwnerDashboard";
import Onboarding from "./pages/Onboarding";
import ActivityLogs from "./pages/admin/ActivityLogs";
import MyOrders from "./pages/MyOrders";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" storageKey="goeat-theme">
      <AuthProvider>
        <TooltipProvider>
          <CustomCursor />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <BottomNav />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/venues" element={<Venues />} />
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/seller-dashboard" element={<SellerDashboard />} />
              <Route path="/venue-owner-dashboard" element={<VenueOwnerDashboard />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/my-orders" element={<MyOrders />} />
              <Route path="/admin" element={<Admin />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="seller-onboarding" element={<SellerOnboarding />} />
              <Route path="venue-onboarding" element={<VenueOnboarding />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="ai-features" element={<AIFeatures />} />
              <Route path="payment-gateways" element={<PaymentGateways />} />
              <Route path="venues" element={<AdminVenues />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="reviews" element={<ReviewModeration />} />
                <Route path="import-places" element={<ImportPlaces />} />
                <Route path="settings" element={<SiteSettings />} />
                <Route path="activity-logs" element={<ActivityLogs />} />
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
