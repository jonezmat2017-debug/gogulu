import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import VenueCard from "@/components/VenueCard";
import VenueDetailsDialog from "@/components/VenueDetailsDialog";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Sparkles, ShoppingBag, Store, Users, Star, Shield, Utensils, Music, ArrowLeft, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import SecondHandMarketplace from "@/components/SecondHandMarketplace";

// Dummy product images
import avocadosImg from "@/assets/dummy/avocados.jpg";
import jewelryImg from "@/assets/dummy/jewelry.jpg";
import fabricImg from "@/assets/dummy/fabric.jpg";
import speakerImg from "@/assets/dummy/speaker.jpg";
import laptopImg from "@/assets/dummy/laptop.jpg";
import smartphoneImg from "@/assets/dummy/smartphone.jpg";
import officeChairImg from "@/assets/dummy/office-chair.jpg";
import microwaveImg from "@/assets/dummy/microwave.jpg";

interface Product {
  id: string;
  title: string;
  description: string | null;
  price: number;
  stock_quantity: number;
  category: string | null;
  image_url: string | null;
  seller_id: string;
  is_active: boolean;
  seller_name?: string;
  seller_phone?: string | null;
}

interface Venue {
  id: string;
  name: string;
  category: string;
  description: string;
  rating: number;
  review_count: number;
  location: string;
  address: string;
  phone: string | null;
  email: string | null;
  price_level: number;
  is_open: boolean;
  featured: boolean;
  image_url: string | null;
  opening_hours: string | null;
}

const dummyMarketplaceProducts: Product[] = [
  {
    id: "demo-1",
    title: "Fresh Organic Avocados (1kg)",
    description: "Farm-fresh avocados from the finest organic farms.",
    price: 15000, stock_quantity: 50, category: "Fresh Produce",
    image_url: avocadosImg, seller_id: "demo", is_active: true, seller_name: "City Organic Farm",
  },
  {
    id: "demo-2",
    title: "African Beaded Jewelry Set",
    description: "Handcrafted beaded necklace and bracelet set.",
    price: 45000, stock_quantity: 12, category: "Fashion",
    image_url: jewelryImg, seller_id: "demo", is_active: true, seller_name: "Acholi Crafts",
  },
  {
    id: "demo-3",
    title: "Kitenge Fabric (6 yards)",
    description: "Beautiful African print fabric for dresses and decor.",
    price: 35000, stock_quantity: 25, category: "Fashion",
    image_url: fabricImg, seller_id: "demo", is_active: true, seller_name: "Mama Rose Textiles",
  },
  {
    id: "demo-4",
    title: "Portable Bluetooth Speaker",
    description: "Wireless speaker with powerful bass, waterproof.",
    price: 120000, stock_quantity: 8, category: "Electronics",
    image_url: speakerImg, seller_id: "demo", is_active: true, seller_name: "TechHub City",
  },
  {
    id: "demo-5",
    title: "HP Laptop 15-inch",
    description: "Brand new HP laptop, 8GB RAM, 256GB SSD.",
    price: 1500000, stock_quantity: 3, category: "Electronics",
    image_url: laptopImg, seller_id: "demo", is_active: true, seller_name: "CompuStore UG",
  },
  {
    id: "demo-6",
    title: "Smartphone 128GB Unlocked",
    description: "Latest model smartphone, dual SIM, 128GB.",
    price: 850000, stock_quantity: 5, category: "Electronics",
    image_url: smartphoneImg, seller_id: "demo", is_active: true, seller_name: "Mobile World City",
  },
  {
    id: "demo-7",
    title: "Ergonomic Office Chair",
    description: "Premium office chair with lumbar support.",
    price: 450000, stock_quantity: 4, category: "Furniture",
    image_url: officeChairImg, seller_id: "demo", is_active: true, seller_name: "Office Solutions",
  },
  {
    id: "demo-8",
    title: "Microwave Oven 20L",
    description: "Compact microwave oven for quick meals.",
    price: 185000, stock_quantity: 7, category: "Appliances",
    image_url: microwaveImg, seller_id: "demo", is_active: true, seller_name: "Home Essentials",
  },
];

const Index = () => {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [venueSearch, setVenueSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("Gulu City");
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
    fetchVenues();

    // Listen for section selection from BottomNav
    const handleSectionEvent = (e: Event) => {
      const section = (e as CustomEvent).detail as string;
      handleCategorySelect(section);
    };
    window.addEventListener("select-section", handleSectionEvent);
    return () => window.removeEventListener("select-section", handleSectionEvent);
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory, searchQuery]);

  useEffect(() => {
    filterVenues();
  }, [venues, activeSection, venueSearch, selectedCity]);

  const fetchProducts = async () => {
    try {
      const { data: productsData, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .gt("stock_quantity", 0)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (productsData && productsData.length > 0) {
        const sellerIds = Array.from(new Set(productsData.map((p) => p.seller_id)));
        const [{ data: sellersData }, { data: profilesData }] = await Promise.all([
          supabase.from("public_seller_profiles").select("id, full_name").in("id", sellerIds),
          supabase.from("profiles").select("id, phone").in("id", sellerIds),
        ]);

        const sellersMap = new Map(
          sellersData?.map((s) => [s.id, s.full_name || "Unknown Seller"]) || []
        );
        const phonesMap = new Map(
          profilesData?.map((p) => [p.id, p.phone]) || []
        );

        setProducts(productsData.map((p) => ({
          ...p,
          seller_name: sellersMap.get(p.seller_id) || "Unknown Seller",
          seller_phone: phonesMap.get(p.seller_id) || null,
        })));
        setCategories(Array.from(new Set(productsData.map((p) => p.category).filter(Boolean) as string[])));
      } else {
        setProducts(dummyMarketplaceProducts);
        setCategories(Array.from(new Set(dummyMarketplaceProducts.map((p) => p.category).filter(Boolean) as string[])));
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts(dummyMarketplaceProducts);
      setCategories(Array.from(new Set(dummyMarketplaceProducts.map((p) => p.category).filter(Boolean) as string[])));
    }
  };

  const fetchVenues = async () => {
    try {
      const { data, error } = await supabase
        .from("venues")
        .select("*")
        .eq("approved", true)
        .order("rating", { ascending: false });

      if (error) throw error;
      setVenues(data || []);
    } catch (error) {
      console.error("Error fetching venues:", error);
    }
  };

  const filterProducts = () => {
    let filtered = products;
    if (selectedCategory !== "all") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }
    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredProducts(filtered);
  };

  const filterVenues = () => {
    let filtered = venues;
    if (activeSection === "eatery") {
      filtered = filtered.filter((v) => v.category?.toLowerCase().includes("eat") || v.category?.toLowerCase().includes("restaurant") || v.category === "eatery");
    } else if (activeSection === "night_spot") {
      filtered = filtered.filter((v) => v.category?.toLowerCase().includes("night") || v.category?.toLowerCase().includes("bar") || v.category?.toLowerCase().includes("club") || v.category === "night_spot" || v.category?.toLowerCase().includes("leisure"));
    }
    if (selectedCity !== "all") {
      filtered = filtered.filter((v) =>
        v.location.toLowerCase().includes(selectedCity.toLowerCase()) ||
        v.address.toLowerCase().includes(selectedCity.toLowerCase())
      );
    }
    if (venueSearch) {
      filtered = filtered.filter((v) =>
        v.name.toLowerCase().includes(venueSearch.toLowerCase()) ||
        v.description?.toLowerCase().includes(venueSearch.toLowerCase()) ||
        v.location.toLowerCase().includes(venueSearch.toLowerCase())
      );
    }
    setFilteredVenues(filtered);
  };

  const handleAddToCart = async (productId: string) => {
    if (productId.startsWith("demo")) {
      toast({ title: "Demo item", description: "This is a preview product. Real items coming soon!" });
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
        const { error } = await supabase.from("cart_items").update({ quantity: existing.quantity + 1 }).eq("id", existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("cart_items").insert({ user_id: user.id, product_id: productId, quantity: 1 });
        if (error) throw error;
      }
      toast({ title: "Added to cart", description: "Item has been added to your cart" });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message || "Failed to add to cart" });
    }
  };

  const handleCategorySelect = (category: string | null) => {
    setActiveSection(category);
    setSearchQuery("");
    setVenueSearch("");
    setSelectedCategory("all");
    // Scroll to content after render with navbar offset
    if (category) {
      requestAnimationFrame(() => {
        setTimeout(() => {
          const el = document.getElementById('section-content');
          if (el) {
            const navbarHeight = 64; // sticky navbar height
            const top = el.getBoundingClientRect().top + window.scrollY - navbarHeight;
            window.scrollTo({ top, behavior: 'smooth' });
          }
        }, 50);
      });
    }
  };

  const sectionConfig: Record<string, { icon: typeof Utensils; title: string; subtitle: string }> = {
    eatery: { icon: Utensils, title: "GoEat — Restaurants & Eateries", subtitle: "Discover the finest dining spots in Gulu City" },
    market: { icon: ShoppingBag, title: "GoShop — Marketplace", subtitle: "Browse local products with unbeatable deals" },
    night_spot: { icon: Music, title: "GoVibe — Nightspots & Leisure", subtitle: "The coolest bars, clubs, and hangout spots in Gulu" },
  };

  const highlights = [
    { icon: Store, label: "Local Sellers", value: "20+", color: "from-orange-500 to-red-500" },
    { icon: ShoppingBag, label: "Products", value: "100+", color: "from-emerald-500 to-teal-500" },
    { icon: Users, label: "Happy Buyers", value: "1K+", color: "from-purple-500 to-pink-500" },
    { icon: Shield, label: "Secure Payments", value: "100%", color: "from-blue-500 to-cyan-500" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <Hero onCategorySelect={handleCategorySelect} activeCategory={activeSection} />

      {/* Show content ONLY when a category is selected */}
      {activeSection && (
        <main className="flex-1" id="section-content">
          {/* Section Header */}
          <section className="border-b border-border bg-card/50">
            <div className="container mx-auto px-4 py-6 sm:py-8">
              <div className="flex items-center gap-3 mb-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setActiveSection(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              </div>
              <div className="flex items-center gap-3 sm:gap-4">
                {(() => {
                  const config = sectionConfig[activeSection];
                  if (!config) return null;
                  const Icon = config.icon;
                  return (
                    <>
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-primary" />
                      </div>
                      <div>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-foreground">{config.title}</h2>
                        <p className="text-sm sm:text-base text-muted-foreground">{config.subtitle}</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </section>

          {/* === EATERIES SECTION === */}
          {activeSection === "eatery" && (
            <section className="container mx-auto px-4 py-8 sm:py-12">
              <div className="mb-6 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search eateries..."
                    value={venueSearch}
                    onChange={(e) => setVenueSearch(e.target.value)}
                    className="pl-10 h-11 rounded-xl"
                  />
                </div>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="w-full sm:w-48 h-11 rounded-xl">
                    <MapPin className="w-4 h-4 mr-1 text-muted-foreground" />
                    <SelectValue placeholder="All Gulu" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Gulu</SelectItem>
                    {["Gulu City Centre", "Laroo", "Pece", "Layibi", "Bardege", "Unyama", "Lacor", "Bungatira"].map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredVenues.length > 0 ? (
                  filteredVenues.map((venue) => (
                    <VenueCard
                      key={venue.id}
                      name={venue.name}
                      category={venue.category}
                      rating={Number(venue.rating)}
                      reviews={venue.review_count}
                      location={venue.location}
                      priceLevel={venue.price_level}
                      image={venue.image_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"}
                      isOpen={venue.is_open}
                      featured={venue.featured}
                      onClick={() => { setSelectedVenue(venue); setDialogOpen(true); }}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-16">
                    <Utensils className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-muted-foreground text-lg font-medium">No eateries found yet</p>
                    <p className="text-muted-foreground/60 text-sm mt-1">Check back soon for new listings</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* === MARKETPLACE SECTION === */}
          {activeSection === "market" && (
            <>
              <section className="container mx-auto px-4 py-8 sm:py-12">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                  <div className="relative max-w-sm w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search products..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 h-11 rounded-xl"
                    />
                  </div>
                </div>

                <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-6">
                  <TabsList className="bg-card border border-border flex-wrap h-auto gap-1 p-1">
                    <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
                    {categories.map((category) => (
                      <TabsTrigger key={category} value={category} className="text-xs sm:text-sm">
                        {category}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </Tabs>

                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        id={product.id}
                        title={product.title}
                        description={product.description}
                        price={product.price}
                        stock_quantity={product.stock_quantity}
                        category={product.category}
                        image_url={product.image_url}
                        seller_name={product.seller_name || "Unknown Seller"}
                        seller_id={product.seller_id}
                        seller_phone={product.seller_phone}
                        onAddToCart={() => handleAddToCart(product.id)}
                      />
                    ))
                  ) : (
                    <div className="col-span-full text-center py-16">
                      <ShoppingBag className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-muted-foreground text-lg font-medium">
                        {products.length === 0 ? "No products available yet" : "No products match your search"}
                      </p>
                    </div>
                  )}
                </div>
              </section>
              <SecondHandMarketplace />
            </>
          )}

          {/* === NIGHTSPOTS SECTION === */}
          {activeSection === "night_spot" && (
            <section className="container mx-auto px-4 py-8 sm:py-12">
              <div className="mb-6 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search nightspots & leisure..."
                    value={venueSearch}
                    onChange={(e) => setVenueSearch(e.target.value)}
                    className="pl-10 h-11 rounded-xl"
                  />
                </div>
                <Select value={selectedCity} onValueChange={setSelectedCity}>
                  <SelectTrigger className="w-full sm:w-48 h-11 rounded-xl">
                    <MapPin className="w-4 h-4 mr-1 text-muted-foreground" />
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {["Gulu City", "Kampala", "Lira", "Jinja", "Mbarara", "Entebbe", "Fort Portal", "Arua", "Soroti", "Mbale"].map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredVenues.length > 0 ? (
                  filteredVenues.map((venue) => (
                    <VenueCard
                      key={venue.id}
                      name={venue.name}
                      category={venue.category}
                      rating={Number(venue.rating)}
                      reviews={venue.review_count}
                      location={venue.location}
                      priceLevel={venue.price_level}
                      image={venue.image_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"}
                      isOpen={venue.is_open}
                      featured={venue.featured}
                      onClick={() => { setSelectedVenue(venue); setDialogOpen(true); }}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-16">
                    <Music className="w-12 h-12 text-muted-foreground/40 mx-auto mb-3" />
                    <p className="text-muted-foreground text-lg font-medium">No nightspots found yet</p>
                    <p className="text-muted-foreground/60 text-sm mt-1">Check back soon for new listings</p>
                  </div>
                )}
              </div>
            </section>
          )}
        </main>
      )}

      {/* When no section is selected, show a brief highlights bar */}
      {!activeSection && (
        <section className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-8 sm:py-10">
            <div className="text-center mb-6">
              <p className="text-muted-foreground text-sm sm:text-base font-medium">
                Tap a category above to explore
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {highlights.map((item, i) => (
                <div key={i} className="flex items-center gap-3 sm:gap-4 group">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <div className="text-lg sm:text-xl font-bold text-foreground">{item.value}</div>
                    <div className="text-xs sm:text-sm text-muted-foreground">{item.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <VenueDetailsDialog 
        venue={selectedVenue}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <Footer />
    </div>
  );
};

export default Index;
