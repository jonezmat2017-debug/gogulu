import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import AuctionCard from "./AuctionCard";
import AuctionBidDialog from "./AuctionBidDialog";
import ClearanceBanner from "./ClearanceBanner";
import ChatDialog from "./ChatDialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search,
  MapPin,
  LayoutGrid,
  List,
  Gavel,
  Clock,
  Car,
  Home,
  Smartphone,
  Monitor,
  Sofa,
  Shirt,
  Sparkles,
  Wrench,
  HardHat,
  Baby,
  PawPrint,
  Wheat,
  Dumbbell,
  Briefcase,
  ChevronRight,
  Heart,
  ShoppingCart,
  Phone,
  MessageCircle,
} from "lucide-react";

// Dummy images
import officeChairImg from "@/assets/dummy/office-chair.jpg";
import flatTvImg from "@/assets/dummy/flat-tv.jpg";
import smartphoneImg from "@/assets/dummy/smartphone.jpg";
import diningTableImg from "@/assets/dummy/dining-table.jpg";
import laptopImg from "@/assets/dummy/laptop.jpg";
import speakerImg from "@/assets/dummy/speaker.jpg";
import microwaveImg from "@/assets/dummy/microwave.jpg";
import fabricImg from "@/assets/dummy/fabric.jpg";
import jewelryImg from "@/assets/dummy/jewelry.jpg";
import avocadosImg from "@/assets/dummy/avocados.jpg";

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  category: string | null;
  image_url: string | null;
  condition: "brand_new" | "refurbished" | "used";
  seller_id: string;
  seller_name: string;
  seller_rating: number | null;
  seller_review_count: number;
  location?: string;
}

const sidebarCategories = [
  { icon: Car, label: "Vehicles", count: 1243 },
  { icon: Home, label: "Property", count: 892 },
  { icon: Smartphone, label: "Phones & Tablets", count: 3415 },
  { icon: Monitor, label: "Electronics", count: 5621 },
  { icon: Sofa, label: "Home & Furniture", count: 4102 },
  { icon: Shirt, label: "Fashion", count: 2876 },
  { icon: Sparkles, label: "Beauty & Care", count: 1534 },
  { icon: Wrench, label: "Services", count: 987 },
  { icon: HardHat, label: "Repair & Construction", count: 2103 },
  { icon: Briefcase, label: "Commercial Equipment", count: 1876 },
  { icon: Dumbbell, label: "Leisure & Activities", count: 1245 },
  { icon: Baby, label: "Babies & Kids", count: 1678 },
  { icon: PawPrint, label: "Animals & Pets", count: 543 },
  { icon: Wheat, label: "Agriculture & Farming", count: 876 },
];

const locations = ["All Gulu", "Gulu City Centre", "Laroo", "Pece", "Layibi", "Bardege", "Bar-dege Division", "Unyama", "Lacor", "Bungatira"];

// Dummy product listings (jiji-style, Gulu-focused)
const dummyProducts: Product[] = [
  {
    id: "jiji-1",
    title: "Samsung Galaxy S24 Ultra 256GB",
    description: "Brand new sealed. Comes with warranty. Free delivery within Gulu City.",
    price: 3800000,
    stock_quantity: 3,
    category: "Phones & Tablets",
    image_url: smartphoneImg,
    condition: "brand_new",
    seller_id: "dummy",
    seller_name: "TechWorld Gulu",
    seller_rating: 4.8,
    seller_review_count: 124,
    location: "Gulu City Centre",
  },
  {
    id: "jiji-2",
    title: '55" Smart TV 4K UHD Android',
    description: "Wifi only, smart TV with all streaming apps. Minor cosmetic scratch on frame.",
    price: 450000,
    stock_quantity: 1,
    category: "Electronics",
    image_url: flatTvImg,
    condition: "used",
    seller_id: "dummy",
    seller_name: "Electronics Hub Gulu",
    seller_rating: 4.3,
    seller_review_count: 47,
    location: "Laroo, Gulu",
  },
  {
    id: "jiji-3",
    title: "Executive Leather Office Chair",
    description: "Premium leather office chair, barely used. Ergonomic design with lumbar support.",
    price: 280000,
    stock_quantity: 2,
    category: "Home & Furniture",
    image_url: officeChairImg,
    condition: "refurbished",
    seller_id: "dummy",
    seller_name: "Office Liquidators",
    seller_rating: 4.5,
    seller_review_count: 31,
    location: "Pece, Gulu",
  },
  {
    id: "jiji-4",
    title: "Dining Table Set with 4 Chairs",
    description: "Solid wood dining set. Great condition, minor surface wear. Pick up only.",
    price: 350000,
    stock_quantity: 1,
    category: "Home & Furniture",
    image_url: diningTableImg,
    condition: "used",
    seller_id: "dummy",
    seller_name: "Grace Furniture Gulu",
    seller_rating: 4.6,
    seller_review_count: 23,
    location: "Layibi, Gulu",
  },
  {
    id: "jiji-5",
    title: "HP ProBook 15-inch Laptop",
    description: "8GB RAM, 256GB SSD. Refurbished with new battery. 6-month warranty included.",
    price: 780000,
    stock_quantity: 3,
    category: "Electronics",
    image_url: laptopImg,
    condition: "refurbished",
    seller_id: "dummy",
    seller_name: "TechHub Gulu",
    seller_rating: 4.8,
    seller_review_count: 67,
    location: "Gulu City Centre",
  },
  {
    id: "jiji-6",
    title: "JBL Bluetooth Speaker",
    description: "Portable wireless speaker, powerful bass. Like-new condition with original box.",
    price: 85000,
    stock_quantity: 5,
    category: "Electronics",
    image_url: speakerImg,
    condition: "used",
    seller_id: "dummy",
    seller_name: "SoundWave Gulu",
    seller_rating: 4.3,
    seller_review_count: 15,
    location: "Bardege, Gulu",
  },
  {
    id: "jiji-7",
    title: "Microwave Oven 20L Samsung",
    description: "Fully functional microwave, cleaned and tested. Perfect for small kitchen.",
    price: 120000,
    stock_quantity: 2,
    category: "Home & Furniture",
    image_url: microwaveImg,
    condition: "used",
    seller_id: "dummy",
    seller_name: "Home Essentials Gulu",
    seller_rating: 4.1,
    seller_review_count: 8,
    location: "Lacor, Gulu",
  },
  {
    id: "jiji-8",
    title: "Ankara Fabric Bundle 6 Yards",
    description: "Beautiful African print fabric. High quality cotton material. Multiple designs available.",
    price: 45000,
    stock_quantity: 20,
    category: "Fashion",
    image_url: fabricImg,
    condition: "brand_new",
    seller_id: "dummy",
    seller_name: "Mama Fashion Gulu",
    seller_rating: 4.7,
    seller_review_count: 89,
    location: "Gulu Main Market",
  },
  {
    id: "jiji-9",
    title: "Gold Plated Jewelry Set",
    description: "Elegant necklace, earrings and bracelet set. Gift box included.",
    price: 65000,
    stock_quantity: 10,
    category: "Fashion",
    image_url: jewelryImg,
    condition: "brand_new",
    seller_id: "dummy",
    seller_name: "Bling Gulu",
    seller_rating: 4.4,
    seller_review_count: 56,
    location: "Pece, Gulu",
  },
  {
    id: "jiji-10",
    title: "Fresh Organic Avocados (10kg)",
    description: "Farm-fresh Hass avocados from Nwoya. Delivery available in Gulu City.",
    price: 35000,
    stock_quantity: 50,
    category: "Agriculture & Farming",
    image_url: avocadosImg,
    condition: "brand_new",
    seller_id: "dummy",
    seller_name: "Farm Direct Gulu",
    seller_rating: 4.9,
    seller_review_count: 203,
    location: "Bungatira, Gulu",
  },
];

const conditionLabels: Record<string, string> = {
  brand_new: "New",
  refurbished: "Refurbished",
  used: "Used",
};

const SecondHandMarketplace = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState("All Gulu");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [auctions, setAuctions] = useState<any[]>([]);
  const [selectedAuction, setSelectedAuction] = useState<any>(null);
  const [auctionDialogOpen, setAuctionDialogOpen] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatRecipient, setChatRecipient] = useState<{ id: string; name: string; contextId?: string } | null>(null);

  const openChat = (sellerId: string, sellerName: string, productId: string) => {
    setChatRecipient({ id: sellerId, name: sellerName, contextId: productId });
    setChatOpen(true);
  };
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
    fetchAuctions();
  }, []);

  useEffect(() => {
    let filtered = products;
    if (selectedCategory) {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q)
      );
    }
    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery]);

  const fetchProducts = async () => {
    try {
      const { data: productsData, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .gt("stock_quantity", 0)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const sellerIds = Array.from(new Set(productsData?.map((p) => p.seller_id) || []));

      const { data: sellersData } = await supabase
        .from("public_seller_profiles")
        .select("id, full_name")
        .in("id", sellerIds);

      const sellersMap = new Map(
        sellersData?.map((s) => [s.id, s.full_name || "Unknown Seller"]) || []
      );

      const { data: ratingsData } = await supabase
        .from("seller_rating_summary")
        .select("*")
        .in("seller_id", sellerIds);

      const ratingsMap = new Map(
        ratingsData?.map((r) => [r.seller_id, { avg_rating: r.avg_rating, review_count: r.review_count }]) || []
      );

      const enriched: Product[] = (productsData || []).map((p) => {
        const rating = ratingsMap.get(p.seller_id);
        return {
          ...p,
          condition: (p.condition as Product["condition"]) || "used",
          seller_name: sellersMap.get(p.seller_id) || "Unknown Seller",
          seller_rating: rating ? Number(rating.avg_rating) : null,
          seller_review_count: rating ? Number(rating.review_count) : 0,
          location: "Gulu City",
        };
      });

      const allProducts = enriched.length > 0 ? enriched : dummyProducts;
      setProducts(allProducts);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts(dummyProducts);
    }
  };

  const fetchAuctions = async () => {
    try {
      const { data } = await supabase
        .from("auctions")
        .select("*, products(title, description, image_url, category)")
        .eq("status", "active")
        .order("end_time", { ascending: true });
      if (data) {
        setAuctions(data.map((a: any) => ({ ...a, product: a.products })));
      }
    } catch (err) {
      console.error("Error fetching auctions:", err);
    }
  };

  const handleAddToCart = async (productId: string) => {
    if (productId.startsWith("jiji") || productId.startsWith("dummy")) {
      toast({ title: "Demo item", description: "This is a preview item. Real items coming soon!" });
      return;
    }
    if (!user) {
      toast({ variant: "destructive", title: "Sign in required", description: "Please sign in to add items to cart" });
      return;
    }
    try {
      const { data: existing } = await supabase
        .from("cart_items")
        .select("id, quantity")
        .eq("user_id", user.id)
        .eq("product_id", productId)
        .maybeSingle();

      if (existing) {
        await supabase.from("cart_items").update({ quantity: existing.quantity + 1 }).eq("id", existing.id);
      } else {
        await supabase.from("cart_items").insert({ user_id: user.id, product_id: productId, quantity: 1 });
      }
      toast({ title: "Added to cart", description: "Item has been added to your cart" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to add to cart" });
    }
  };

  const visibleCategories = showAllCategories ? sidebarCategories : sidebarCategories.slice(0, 10);

  return (
    <section className="bg-muted/30 min-h-screen">
      {/* ===== SEARCH HEADER (jiji-style) ===== */}
      <div className="bg-primary py-8 md:py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-center text-2xl md:text-3xl font-bold text-primary-foreground mb-6">
            What are you looking for?
          </h2>
          <div className="flex items-center gap-2 max-w-2xl mx-auto">
            {/* Location dropdown */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="h-12 px-4 rounded-l-xl bg-card text-foreground border border-border text-sm font-medium min-w-[130px] focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {locations.map((loc) => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
            {/* Search input */}
            <div className="relative flex-1">
              <Input
                placeholder="I am looking for..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 rounded-none rounded-r-xl border-l-0 bg-card text-foreground border-border pl-4 pr-12 text-sm focus-visible:ring-ring"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors">
                <Search className="w-4 h-4 text-primary-foreground" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* ===== CLEARANCE BANNER ===== */}
        <ClearanceBanner />

        {/* ===== LIVE AUCTIONS ===== */}
        {auctions.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground font-bold text-sm shadow-lg shadow-primary/25 animate-pulse">
                <Gavel className="w-4 h-4" />
                LIVE AUCTIONS
              </div>
              <span className="text-muted-foreground text-sm flex items-center gap-1.5">
                <Clock className="w-4 h-4" /> Bid now — buy now available
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {auctions.map((auction) => (
                <AuctionCard
                  key={auction.id}
                  id={auction.id}
                  title={auction.product?.title || "Auction Item"}
                  description={auction.product?.description}
                  image_url={auction.product?.image_url}
                  start_price={auction.start_price}
                  buy_now_price={auction.buy_now_price}
                  current_highest_bid={auction.current_highest_bid}
                  end_time={auction.end_time}
                  status={auction.status}
                  onClick={() => { setSelectedAuction(auction); setAuctionDialogOpen(true); }}
                />
              ))}
            </div>
          </div>
        )}

        {/* ===== MAIN LAYOUT: SIDEBAR + LISTINGS ===== */}
        <div className="flex gap-6">
          {/* Left Sidebar - Categories */}
          <aside className="hidden md:block w-64 flex-shrink-0">
            <div className="bg-card rounded-xl border border-border overflow-hidden sticky top-4">
              <div className="p-4 border-b border-border">
                <h3 className="font-bold text-foreground text-sm">Categories</h3>
              </div>
              <nav className="py-1">
                {/* All items */}
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-primary/5 ${
                    !selectedCategory ? "bg-primary/10 text-primary font-semibold border-l-3 border-primary" : "text-foreground"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4 text-muted-foreground" />
                  <span className="flex-1 text-left">All Categories</span>
                </button>

                {visibleCategories.map((cat) => (
                  <button
                    key={cat.label}
                    onClick={() => setSelectedCategory(cat.label)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-primary/5 ${
                      selectedCategory === cat.label ? "bg-primary/10 text-primary font-semibold border-l-3 border-primary" : "text-foreground"
                    }`}
                  >
                    <cat.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="flex-1 text-left">{cat.label}</span>
                    <span className="text-xs text-muted-foreground">{cat.count.toLocaleString()}</span>
                  </button>
                ))}

                {!showAllCategories && sidebarCategories.length > 10 && (
                  <button
                    onClick={() => setShowAllCategories(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-primary font-medium hover:bg-primary/5 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span>Show all categories</span>
                  </button>
                )}
              </nav>
            </div>
          </aside>

          {/* Main content area */}
          <div className="flex-1 min-w-0">
            {/* Mobile category pills */}
            <div className="md:hidden flex gap-2 overflow-x-auto pb-4 -mx-1 px-1 scrollbar-hide">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  !selectedCategory
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-foreground border-border hover:border-primary/40"
                }`}
              >
                All
              </button>
              {sidebarCategories.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => setSelectedCategory(cat.label)}
                  className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                    selectedCategory === cat.label
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:border-primary/40"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Toolbar: title + view toggle */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-foreground text-lg">
                {selectedCategory ? selectedCategory : "Trending ads"}
                <span className="text-muted-foreground text-sm font-normal ml-2">
                  {filteredProducts.length} ads
                </span>
              </h3>
              <div className="flex items-center gap-1 bg-card border border-border rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ===== PRODUCT GRID (jiji-style cards) ===== */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 cursor-pointer"
                  >
                    {/* Image */}
                    <div className="aspect-[4/3] overflow-hidden relative bg-muted">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                      )}
                      {/* Condition badge */}
                      <Badge className="absolute bottom-2 left-2 bg-card/90 backdrop-blur-sm text-foreground border-border/50 text-[10px] font-medium px-2 py-0.5">
                        {conditionLabels[product.condition] || "Used"}
                      </Badge>
                      {/* Wishlist */}
                      <button className="absolute top-2 right-2 w-8 h-8 rounded-full bg-card/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-card">
                        <Heart className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>

                    {/* Content */}
                    <div className="p-3 space-y-1.5">
                      <p className="text-primary font-bold text-base md:text-lg leading-tight">
                        UGX {product.price.toLocaleString()}
                      </p>
                      <h4 className="text-foreground font-medium text-sm line-clamp-2 leading-snug">
                        {product.title}
                      </h4>
                      {product.description && (
                        <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed">
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center gap-1 text-muted-foreground pt-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="text-xs truncate">{product.location || "Gulu City"}</span>
                      </div>
                    </div>

                    {/* Action bar */}
                    <div className="px-3 pb-3 flex gap-2">
                      <Button
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(product.id); }}
                        disabled={product.stock_quantity === 0}
                        size="sm"
                        className="flex-1 h-9 rounded-lg text-xs font-semibold"
                      >
                        <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                        Add to Cart
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 rounded-lg"
                        onClick={(e) => { e.stopPropagation(); openChat(product.seller_id, product.seller_name, product.id); }}
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* ===== LIST VIEW ===== */
              <div className="space-y-3">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg hover:border-primary/30 transition-all duration-300 flex cursor-pointer"
                  >
                    {/* Image */}
                    <div className="w-40 md:w-52 flex-shrink-0 overflow-hidden relative bg-muted">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="w-10 h-10 text-muted-foreground/30" />
                        </div>
                      )}
                      <Badge className="absolute bottom-2 left-2 bg-card/90 backdrop-blur-sm text-foreground border-border/50 text-[10px] font-medium px-2 py-0.5">
                        {conditionLabels[product.condition] || "Used"}
                      </Badge>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                      <div className="space-y-1">
                        <p className="text-primary font-bold text-lg">
                          UGX {product.price.toLocaleString()}
                        </p>
                        <h4 className="text-foreground font-medium text-sm line-clamp-1">{product.title}</h4>
                        {product.description && (
                          <p className="text-muted-foreground text-xs line-clamp-2">{product.description}</p>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          <span className="text-xs">{product.location || "Gulu City"}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={(e) => { e.stopPropagation(); handleAddToCart(product.id); }}
                            disabled={product.stock_quantity === 0}
                            size="sm"
                            className="h-8 rounded-lg text-xs font-semibold"
                          >
                            <ShoppingCart className="w-3.5 h-3.5 mr-1" />
                            Add to Cart
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 rounded-lg"
                            onClick={(e) => { e.stopPropagation(); openChat(product.seller_id, product.seller_name, product.id); }}
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Wishlist */}
                    <div className="p-3 flex items-start">
                      <button className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors">
                        <Heart className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredProducts.length === 0 && (
              <div className="text-center py-16 bg-card rounded-xl border border-border">
                <Search className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="font-semibold text-foreground mb-1">No ads found</h3>
                <p className="text-muted-foreground text-sm">Try adjusting your search or category filter</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Auction Bid Dialog */}
      <AuctionBidDialog
        auction={selectedAuction}
        open={auctionDialogOpen}
        onOpenChange={setAuctionDialogOpen}
      />

      {/* Chat Dialog */}
      {chatRecipient && (
        <ChatDialog
          open={chatOpen}
          onOpenChange={setChatOpen}
          recipientId={chatRecipient.id}
          recipientName={chatRecipient.name}
          contextType="product"
          contextId={chatRecipient.contextId}
        />
      )}
    </section>
  );
};

export default SecondHandMarketplace;
