import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import VenueCard from "@/components/VenueCard";
import VenueDetailsDialog from "@/components/VenueDetailsDialog";
import Footer from "@/components/Footer";
import StaticLogo from "@/components/StaticLogo";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  submitted_by: string | null;
}

const Venues = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [filteredVenues, setFilteredVenues] = useState<Venue[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchVenues();
  }, []);

  useEffect(() => {
    filterVenues();
  }, [venues, selectedCategory, searchQuery]);

  const fetchVenues = async () => {
    try {
      const { data, error } = await supabase
        .from("venues")
        .select("*")
        .eq("approved", true)
        .order("rating", { ascending: false })
        .order("review_count", { ascending: false });

      if (error) throw error;
      setVenues(data || []);

      const uniqueCategories = Array.from(
        new Set(data?.map((v) => v.category).filter(Boolean))
      );
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching venues:", error);
    }
  };

  const filterVenues = () => {
    let filtered = venues;
    if (selectedCategory !== "all") {
      filtered = filtered.filter((v) => v.category === selectedCategory);
    }
    if (searchQuery) {
      filtered = filtered.filter(
        (v) =>
          v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFilteredVenues(filtered);
  };

  const handleVenueClick = (venue: Venue) => {
    setSelectedVenue(venue);
    setDialogOpen(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <div className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <StaticLogo word="Eat" onClick={() => navigate("/venues")} size="lg" />
          <div className="h-8 w-px bg-border" />
          <p className="text-muted-foreground text-sm font-medium">Restaurants & Eateries in Gulu City</p>
        </div>
      </div>

      <main className="flex-1 container mx-auto px-4 py-8">
        <section>
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search venues..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
            <TabsList>
              <TabsTrigger value="all">All Venues</TabsTrigger>
              {categories.map((category) => (
                <TabsTrigger key={category} value={category}>
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          {/* Venues Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVenues.length > 0 ? (
              filteredVenues.map((venue) => (
                <VenueCard
                  key={venue.id}
                  id={venue.id}
                  name={venue.name}
                  category={venue.category}
                  rating={Number(venue.rating)}
                  reviews={venue.review_count}
                  location={venue.location}
                  priceLevel={venue.price_level}
                  image={venue.image_url || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80"}
                  isOpen={venue.is_open}
                  featured={venue.featured}
                  ownerId={venue.submitted_by || undefined}
                  onClick={() => handleVenueClick(venue)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {venues.length === 0
                    ? "No venues available yet"
                    : "No venues match your search"}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <VenueDetailsDialog 
        venue={selectedVenue}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />

      <Footer />
    </div>
  );
};

export default Venues;
