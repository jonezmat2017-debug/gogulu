import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, UtensilsCrossed, ShoppingCart, Store, Edit, Trash2, Wallet, Star, TrendingUp, Users, MessageSquare } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MultiImageUpload from "@/components/MultiImageUpload";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PaymentGatewaySettings from "@/components/PaymentGatewaySettings";
import VenueOrdersTab from "@/components/VenueOrdersTab";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function VenueOwnerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [venue, setVenue] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [venueReviews, setVenueReviews] = useState<any[]>([]);

  const [venueForm, setVenueForm] = useState({ name: "", venue_type: "restaurant", description: "", location: "", address: "", phone: "", email: "" });
  const [menuForm, setMenuForm] = useState({ name: "", description: "", price: "", category: "", image_url: "", images: [] as string[] });
  const [editingMenuItem, setEditingMenuItem] = useState<any>(null);

  useEffect(() => { checkVenueOwnerAccess(); }, [user]);

  const checkVenueOwnerAccess = async () => {
    if (!user) { navigate("/auth"); return; }
    const { data: roles } = await supabase.from("user_roles").select("*").eq("user_id", user.id).eq("role", "venue_owner");
    if (!roles || roles.length === 0) { toast({ title: "Access Denied", description: "You need a venue owner account to access this page", variant: "destructive" }); navigate("/"); return; }
    await Promise.all([fetchVenue(), fetchProfile()]);
    setIsLoading(false);
  };

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (data) setProfile(data);
  };

  const fetchVenue = async () => {
    const result = await supabase.from("venues").select("*").eq("submitted_by", user?.id).maybeSingle();
    const { data, error } = result;
    if (!error && data) {
      setVenue(data);
      const venueData = data as any;
      setVenueForm({ name: venueData.name || "", venue_type: venueData.venue_type || "restaurant", description: venueData.description || "", location: venueData.location || "", address: venueData.address || "", phone: venueData.phone || "", email: venueData.email || "" });
      fetchMenuItems(data.id);
      fetchVenueReviewsData(data.id);
    }
  };

  const fetchMenuItems = async (venueId: string) => {
    const { data, error } = await supabase.from("menu_items" as any).select("*").eq("venue_id", venueId).order("created_at", { ascending: false });
    if (!error && data) setMenuItems(data);
  };

  const fetchVenueReviewsData = async (venueId: string) => {
    const { data } = await supabase.from("venue_reviews").select("*").eq("venue_id", venueId).order("created_at", { ascending: false });
    if (data) setVenueReviews(data);
  };

  const handleVenueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (venue) {
      const { error } = await supabase.from("venues").update({ ...venueForm, updated_at: new Date().toISOString() }).eq("id", venue.id);
      if (error) { toast({ title: "Error", description: "Failed to update venue", variant: "destructive" }); return; }
      toast({ title: "Success", description: "Venue updated successfully" });
    } else {
      const categoryMap: Record<string, string> = { restaurant: "Restaurant", pork_joint: "Pork Joint", grill_spot: "Grill Spot", bar: "Bar", cafe: "Café", lounge: "Lounge", food_truck: "Food Truck" };
      const { data, error } = await supabase.from("venues").insert({ name: venueForm.name, description: venueForm.description, location: venueForm.location, address: venueForm.address, phone: venueForm.phone, email: venueForm.email, submitted_by: user?.id, category: categoryMap[venueForm.venue_type] || venueForm.venue_type, approved: true, rating: 0, review_count: 0, price_level: 2, is_open: true, featured: false }).select().single();
      if (error) { toast({ title: "Error", description: "Failed to create venue", variant: "destructive" }); return; }
      toast({ title: "Success", description: "Venue created successfully!" }); setVenue(data);
    }
    fetchVenue();
  };

  const handleMenuSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!venue) { toast({ title: "Error", description: "Please create a venue first", variant: "destructive" }); return; }
    const menuData = { name: menuForm.name, description: menuForm.description, price: parseFloat(menuForm.price), category: menuForm.category, image_url: menuForm.images[0] || menuForm.image_url || null, venue_id: venue.id, is_available: true };
    if (editingMenuItem) {
      const { error } = await supabase.from("menu_items" as any).update(menuData).eq("id", editingMenuItem.id);
      if (error) { toast({ title: "Error", description: "Failed to update menu item", variant: "destructive" }); return; }
      toast({ title: "Success", description: "Menu item updated" });
    } else {
      const { error } = await supabase.from("menu_items" as any).insert(menuData);
      if (error) { toast({ title: "Error", description: "Failed to add menu item", variant: "destructive" }); return; }
      toast({ title: "Success", description: "Menu item added" });
    }
    setMenuForm({ name: "", description: "", price: "", category: "", image_url: "", images: [] }); setEditingMenuItem(null); fetchMenuItems(venue.id);
  };

  const handleEditMenuItem = (item: any) => {
    setEditingMenuItem(item); setMenuForm({ name: item.name, description: item.description || "", price: item.price.toString(), category: item.category || "", image_url: item.image_url || "", images: item.image_url ? [item.image_url] : [] });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteMenuItem = async (itemId: string) => {
    if (!confirm("Delete this menu item?")) return;
    const { error } = await supabase.from("menu_items" as any).delete().eq("id", itemId);
    if (error) { toast({ title: "Error", description: "Failed to delete", variant: "destructive" }); return; }
    toast({ title: "Success", description: "Menu item deleted" }); if (venue) fetchMenuItems(venue.id);
  };

  const handleToggleAvailable = async (itemId: string, currentStatus: boolean) => {
    const { error } = await supabase.from("menu_items" as any).update({ is_available: !currentStatus }).eq("id", itemId);
    if (error) { toast({ title: "Error", description: "Failed to update", variant: "destructive" }); return; }
    if (venue) fetchMenuItems(venue.id);
  };

  if (isLoading) {
    return (<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>);
  }

  const avgRating = venue ? Number(venue.rating) || 0 : 0;
  const reviewCount = venue ? venue.review_count || 0 : 0;
  const availableItems = menuItems.filter((m: any) => m.is_available).length;

  const monthlyData = [
    { month: "Jan", reviews: 1 }, { month: "Feb", reviews: 2 }, { month: "Mar", reviews: 4 },
    { month: "Apr", reviews: 6 }, { month: "May", reviews: 8 }, { month: "Jun", reviews: 10 },
    { month: "Jul", reviews: 14 }, { month: "Aug", reviews: reviewCount },
  ];

  const pieData = [
    { name: "Available", value: availableItems, color: "hsl(var(--primary))" },
    { name: "Unavailable", value: menuItems.length - availableItems, color: "hsl(var(--muted-foreground))" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="flex items-center gap-4 mb-8">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
              {profile?.full_name?.charAt(0)?.toUpperCase() || "V"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">Hi {profile?.full_name || "Venue Owner"} 👋</h1>
            <p className="text-muted-foreground text-sm">{venue ? `Managing ${venue.name}` : "Set up your venue"}</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2"><Star className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">Rating</span></div>
              <span className="text-3xl font-bold">{avgRating.toFixed(1)}</span>
              <p className="text-xs text-muted-foreground mt-1">{reviewCount} reviews</p>
              <div className="mt-3 h-8">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData.slice(-5)}>
                    <Area type="monotone" dataKey="reviews" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.1)" strokeWidth={1.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2"><UtensilsCrossed className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">Menu Items</span></div>
              <span className="text-3xl font-bold">{menuItems.length}</span>
              <p className="text-xs text-muted-foreground mt-1">{availableItems} available</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2"><MessageSquare className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">Reviews</span></div>
              <span className="text-3xl font-bold">{venueReviews.length}</span>
              <div className="flex items-center gap-1 text-xs text-green-500 mt-1"><TrendingUp className="w-3 h-3" />Growing</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2"><Store className="h-4 w-4 text-muted-foreground" /><span className="text-sm text-muted-foreground">Status</span></div>
              <Badge variant={venue?.approved ? "default" : "secondary"} className="mt-2 text-sm">
                {venue?.approved ? "Approved" : venue ? "Pending" : "No Venue"}
              </Badge>
              <p className="text-xs text-muted-foreground mt-2">{venue?.is_open ? "Currently Open" : "Closed"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-5 mb-8">
          <Card className="lg:col-span-3">
            <CardHeader className="pb-2"><CardTitle className="text-lg">Review Growth</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                    <Area type="monotone" dataKey="reviews" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" strokeWidth={2} name="Reviews" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2"><CardTitle className="text-lg">Menu Status</CardTitle></CardHeader>
            <CardContent>
              <div className="h-[180px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                      {pieData.map((entry, i) => (<Cell key={`cell-${i}`} fill={entry.color} />))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold">{menuItems.length}</span>
                  <span className="text-xs text-muted-foreground">Items</span>
                </div>
              </div>
              <div className="space-y-2 mt-2">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} /><span className="text-muted-foreground">{item.name}</span></div>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="venue" className="space-y-6">
          <TabsList>
            <TabsTrigger value="venue"><Store className="h-4 w-4 mr-2" />Venue</TabsTrigger>
            <TabsTrigger value="menu"><UtensilsCrossed className="h-4 w-4 mr-2" />Menu</TabsTrigger>
            <TabsTrigger value="orders"><ShoppingCart className="h-4 w-4 mr-2" />Orders</TabsTrigger>
            <TabsTrigger value="wallet"><Wallet className="h-4 w-4 mr-2" />Wallet</TabsTrigger>
          </TabsList>

          <TabsContent value="venue" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>{venue ? "Update Venue" : "Create Your Venue"}</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleVenueSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div><Label htmlFor="name">Venue Name</Label><Input id="name" value={venueForm.name} onChange={(e) => setVenueForm({ ...venueForm, name: e.target.value })} required /></div>
                    <div><Label htmlFor="venue_type">Venue Type</Label>
                      <Select value={venueForm.venue_type} onValueChange={(v) => setVenueForm({ ...venueForm, venue_type: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="restaurant">Restaurant</SelectItem><SelectItem value="pork_joint">Pork Joint</SelectItem><SelectItem value="grill_spot">Grill Spot</SelectItem><SelectItem value="bar">Bar</SelectItem><SelectItem value="cafe">Café</SelectItem><SelectItem value="lounge">Lounge</SelectItem><SelectItem value="food_truck">Food Truck</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div><Label htmlFor="phone">Phone</Label><Input id="phone" value={venueForm.phone} onChange={(e) => setVenueForm({ ...venueForm, phone: e.target.value })} placeholder="+256XXXXXXXXX" required /></div>
                    <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={venueForm.email} onChange={(e) => setVenueForm({ ...venueForm, email: e.target.value })} /></div>
                  </div>
                  <div><Label htmlFor="description">Description</Label><Textarea id="description" value={venueForm.description} onChange={(e) => setVenueForm({ ...venueForm, description: e.target.value })} rows={3} required /></div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div><Label htmlFor="location">Location/Neighborhood</Label><Input id="location" value={venueForm.location} onChange={(e) => setVenueForm({ ...venueForm, location: e.target.value })} placeholder="e.g., Gulu City Centre, Laroo, Pece" required /></div>
                    <div><Label htmlFor="address">Full Address</Label><Input id="address" value={venueForm.address} onChange={(e) => setVenueForm({ ...venueForm, address: e.target.value })} placeholder="e.g., Plot 12 Main Street, Gulu City" required /></div>
                  </div>
                  <Button type="submit">{venue ? "Update Venue" : "Create Venue"}</Button>
                  {venue && (<p className="text-sm text-muted-foreground">Your venue is live and visible to customers</p>)}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="menu" className="space-y-6">
            {!venue ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">Please create a venue first</CardContent></Card>
            ) : (
              <>
                <Card>
                  <CardHeader><CardTitle>{editingMenuItem ? "Edit Menu Item" : "Add Menu Item"}</CardTitle></CardHeader>
                  <CardContent>
                    <form onSubmit={handleMenuSubmit} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div><Label htmlFor="item_name">Item Name *</Label><Input id="item_name" value={menuForm.name} onChange={(e) => setMenuForm({ ...menuForm, name: e.target.value })} placeholder="e.g., Grilled Chicken" required /></div>
                        <div><Label htmlFor="item_category">Category *</Label>
                          <Select value={menuForm.category} onValueChange={(v) => setMenuForm({ ...menuForm, category: v })}>
                            <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                            <SelectContent><SelectItem value="Appetizers">Appetizers</SelectItem><SelectItem value="Main Course">Main Course</SelectItem><SelectItem value="Sides">Sides</SelectItem><SelectItem value="Desserts">Desserts</SelectItem><SelectItem value="Drinks">Drinks</SelectItem><SelectItem value="Alcoholic Beverages">Alcoholic Beverages</SelectItem><SelectItem value="Specials">Specials</SelectItem></SelectContent>
                          </Select>
                        </div>
                        <div><Label htmlFor="item_price">Price (UGX) *</Label><Input id="item_price" type="number" min="0" step="500" value={menuForm.price} onChange={(e) => setMenuForm({ ...menuForm, price: e.target.value })} placeholder="15000" required /></div>
                      </div>
                      <div><Label htmlFor="item_description">Description</Label><Textarea id="item_description" value={menuForm.description} onChange={(e) => setMenuForm({ ...menuForm, description: e.target.value })} rows={3} placeholder="Describe the dish" /></div>
                      <MultiImageUpload bucket="venue-images" folder="menu-items/" currentImages={menuForm.images} onUploadComplete={(urls) => setMenuForm({ ...menuForm, images: urls, image_url: urls[0] || "" })} maxImages={3} />
                      <div className="flex gap-2">
                        <Button type="submit">{editingMenuItem ? "Update Item" : "Add to Menu"}</Button>
                        {editingMenuItem && (<Button type="button" variant="outline" onClick={() => { setEditingMenuItem(null); setMenuForm({ name: "", description: "", price: "", category: "", image_url: "", images: [] }); }}>Cancel</Button>)}
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* Menu Items Table */}
                <Card>
                  <CardHeader><CardTitle>Menu Items</CardTitle></CardHeader>
                  <CardContent>
                    {menuItems.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground"><UtensilsCrossed className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>No menu items yet</p></div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow><TableHead>Item</TableHead><TableHead>Category</TableHead><TableHead>Price</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow>
                        </TableHeader>
                        <TableBody>
                          {menuItems.map((item: any) => (
                            <TableRow key={item.id} className={!item.is_available ? "opacity-60" : ""}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  {item.image_url && <img src={item.image_url} alt={item.name} className="w-10 h-10 rounded-lg object-cover" />}
                                  <span className="font-medium text-sm">{item.name}</span>
                                </div>
                              </TableCell>
                              <TableCell><Badge variant="outline" className="text-xs">{item.category}</Badge></TableCell>
                              <TableCell className="font-medium">UGX {item.price.toLocaleString()}</TableCell>
                              <TableCell><Badge variant={item.is_available ? "default" : "secondary"} className="text-xs">{item.is_available ? "Available" : "Unavailable"}</Badge></TableCell>
                              <TableCell className="text-right">
                                <div className="flex gap-1 justify-end">
                                  <Button size="sm" variant="ghost" onClick={() => handleEditMenuItem(item)}><Edit className="h-4 w-4" /></Button>
                                  <Button size="sm" variant="ghost" onClick={() => handleToggleAvailable(item.id, item.is_available)}>{item.is_available ? "Hide" : "Show"}</Button>
                                  <Button size="sm" variant="ghost" onClick={() => handleDeleteMenuItem(item.id)}><Trash2 className="h-4 w-4" /></Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <VenueOrdersTab venueId={venue?.id} />
          </TabsContent>

          <TabsContent value="wallet" className="space-y-6">
            <PaymentGatewaySettings />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
