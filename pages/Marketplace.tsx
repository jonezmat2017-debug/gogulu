import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SecondHandMarketplace from "@/components/SecondHandMarketplace";
import StaticLogo from "@/components/StaticLogo";
import { useNavigate } from "react-router-dom";

const Marketplace = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <StaticLogo word="Shop" onClick={() => navigate("/marketplace")} size="lg" />
          <div className="h-8 w-px bg-border" />
          <p className="text-muted-foreground text-sm font-medium">Gulu City Marketplace</p>
        </div>
      </div>
      <main className="flex-1">
        <SecondHandMarketplace />
      </main>
      <Footer />
    </div>
  );
};

export default Marketplace;
