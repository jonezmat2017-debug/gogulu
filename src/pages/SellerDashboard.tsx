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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Package, ShoppingCart, Settings, Edit, Trash2, Wallet, TrendingUp, DollarSign, Star, BarChart3, Phone, Gavel, Percent } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MultiImageUpload from "@/components/MultiImageUpload";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PaymentGatewaySettings from "@/components/PaymentGatewaySettings";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function SellerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSeller, setIsSeller] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [sellerStats, setSellerStats] = useState({ totalRevenue: 0, avgRating: 0, reviewCount: 0 });

  // Product form state
  const [productForm, setProductForm] = useState({
    title: "", description: "", price: "", stock_quantity: "", category: "",
    condition: "brand_new" as string, image_url: "", images: [] as string[],
    is_clearance: false, discount_percentage: "0"
  });
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Auction form state
  const [auctionForm, setAuctionForm] = useState({ product_id: "", start_price: "", buy_now_price: "", duration_hours: "24" });
  const [showAuctionForm, setShowAuctionForm] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({ full_name: "", phone: "", bio: "" });

  useEffect(() => { checkSellerAccess(); }, [user]);

  const checkSellerAccess = async () => {
    if (!user) { navigate("/auth"); return; }
    const { data: roles } = await supabase.from("user_roles").select("*").eq("user_id", user.id).eq("role", "seller");
    if (!roles || roles.length === 0) { toast({ title: "Access Denied", description: "You need a seller account to access this page", variant: "destructive" }); navigate("/"); return; }
    setIsSeller(true);
    await Promise.all([fetchProducts(), fetchOrders(), fetchProfile(), fetchSellerStats()]);
    setIsLoading(false);
  };

  const fetchProducts = async () => {
    const { data, error } = await supabase.from("products").select("*").eq("seller_id", user?.id).order("created_at", { ascending: false });
    if (!error && data) setProducts(data);
  };

  const fetchOrders = async () => {
    const { data, error } = await supabase.from("order_items").select("*, orders(*), products(*)").eq("seller_id", user?.id).order("created_at", { ascending: false });
    if (!error && data) setOrders(data);
  };

  const fetchProfile = async () => {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", user?.id).single();
    if (!error && data) { setProfile(data); setProfileForm({ full_name: data.full_name || "", phone: data.phone || "", bio: data.bio || "" }); }
  };

  const fetchSellerStats = async () => {
    if (!user) return;
    const { data: ratings } = await supabase.from("seller_ratings").select("rating").eq("seller_id", user.id);
    const totalRevenue = orders.reduce((sum, o) => sum + (o.quantity * o.price_at_purchase || 0), 0);
    const avgRating = ratings && ratings.length > 0 ? ratings.reduce((s, r) => s + r.rating, 0) / ratings.length : 0;
    setSellerStats({ totalRevenue, avgRating, reviewCount: ratings?.length || 0 });
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const productData = { title: productForm.title, description: productForm.description, price: parseFloat(productForm.price), stock_quantity: parseInt(productForm.stock_quantity), category: productForm.category, condition: productForm.condition as "brand_new" | "refurbished" | "used", image_url: productForm.images[0] || productForm.image_url || null, is_active: true, is_clearance: productForm.is_clearance, discount_percentage: parseInt(productForm.discount_percentage) || 0 };
    if (editingProduct) {
      const { error } = await supabase.from("products").update(productData).eq("id", editingProduct.id);
      if (error) { toast({ title: "Error", description: "Failed to update product", variant: "destructive" }); return; }
      toast({ title: "Success", description: "Product updated successfully" });
    } else {
      const { error } = await supabase.from("products").insert({ ...productData, seller_id: user?.id });
      if (error) { toast({ title: "Error", description: "Failed to create product", variant: "destructive" }); return; }
      toast({ title: "Success", description: "Product created successfully" });
    }
    setProductForm({ title: "", description: "", price: "", stock_quantity: "", category: "", condition: "brand_new", image_url: "", images: [], is_clearance: false, discount_percentage: "0" });
    setEditingProduct(null); fetchProducts();
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({ title: product.title, description: product.description || "", price: product.price.toString(), stock_quantity: product.stock_quantity.toString(), category: product.category || "", condition: product.condition || "brand_new", image_url: product.image_url || "", images: product.image_url ? [product.image_url] : [], is_clearance: product.is_clearance || false, discount_percentage: (product.discount_percentage || 0).toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (error) { toast({ title: "Error", description: "Failed to delete product", variant: "destructive" }); return; }
    toast({ title: "Success", description: "Product deleted successfully" }); fetchProducts();
  };

  const handleToggleActive = async (productId: string, currentStatus: boolean) => {
    const { error } = await supabase.from("products").update({ is_active: !currentStatus }).eq("id", productId);
    if (error) { toast({ title: "Error", description: "Failed to update product status", variant: "destructive" }); return; }
    fetchProducts();
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("profiles").update(profileForm).eq("id", user?.id);
    if (error) { toast({ title: "Error", description: "Failed to update profile", variant: "destructive" }); return; }
    toast({ title: "Success", description: "Profile updated successfully" }); fetchProfile();
  };

  const handleUpdateOrderStatus = async (orderId: string | undefined, status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled") => {
    if (!orderId) return;
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) {
      toast({ title: "Error", description: "Failed to update order status", variant: "destructive" });
      return;
    }
    toast({ title: "Order updated", description: `Order ${status}` });
    fetchOrders();
  };

  if (isLoading) {
    return (<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>);
  }

  const activeProducts = products.filter(p => p.is_active).length;
  const totalStock = products.reduce((sum, p) => sum + p.stock_quantity, 0);

  const monthlyData = [
    { month: "Jan", sales: 2 }, { month: "Feb", sales: 5 }, { month: "Mar", sales: 8 },
    { month: "Apr", sales: 12 }, { month: "May", sales: 18 }, { month: "Jun", sales: 22 },
    { month: "Jul", sales: 28 }, { month: "Aug", sales: orders.length },
  ];

  const pieData = [
    { name: "Active", value: activeProducts, color: "hsl(var(--primary))" },
    { name: "Inactive", value: products.length - activeProducts, color: "hsl(var(--muted-foreground))" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) { case "delivered": return "text-green-500"; case "confirmed": case "shipped": return "text-blue-500"; case "pending": return "text-yellow-500"; default: return "text-muted-foreground"; }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="flex items-center gap-4 mb-8">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
              {profile?.full_name?.charAt(0)?.toUpperCase() || "S"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">Hi {profile?.full_name || "Seller"} 👋</h1>
            <p className="text-muted-foreground text-sm">Welcome to your seller dashboard</p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Products</span>
              </div>
              <span className="text-3xl font-bold">{products.length}</span>
              <p className="text-xs text-muted-foreground mt-1">{activeProducts} active</p>
              <div className="mt-3 h-8">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData.slice(-5)}>
                    <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.1)" strokeWidth={1.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Orders</span>
              </div>
              <span className="text-3xl font-bold">{orders.length}</span>
              <div className="flex items-center gap-1 text-xs text-green-500 mt-1"><TrendingUp className="w-3 h-3" />Growing</div>
              <div className="mt-3 h-8">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData.slice(-5)}>
                    <Area type="monotone" dataKey="sales" stroke="hsl(var(--accent))" fill="hsl(var(--accent) / 0.1)" strokeWidth={1.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Avg Rating</span>
              </div>
              <span className="text-3xl font-bold">{sellerStats.avgRating.toFixed(1)}</span>
              <p className="text-xs text-muted-foreground mt-1">{sellerStats.reviewCount} reviews</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Total Stock</span>
              </div>
              <span className="text-3xl font-bold">{totalStock}</span>
              <p className="text-xs text-muted-foreground mt-1">across {products.length} items</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 lg:grid-cols-5 mb-8">
          <Card className="lg:col-span-3">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Sales Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", color: "hsl(var(--foreground))" }} />
                    <Area type="monotone" dataKey="sales" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" strokeWidth={2} name="Sales" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Product Status</CardTitle>
            </CardHeader>
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
                  <span className="text-2xl font-bold">{products.length}</span>
                  <span className="text-xs text-muted-foreground">Total</span>
                </div>
              </div>
              <div className="space-y-2 mt-2">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products"><Package className="h-4 w-4 mr-2" />Products</TabsTrigger>
            <TabsTrigger value="auctions"><Gavel className="h-4 w-4 mr-2" />Auctions</TabsTrigger>
            <TabsTrigger value="orders"><ShoppingCart className="h-4 w-4 mr-2" />Orders</TabsTrigger>
            <TabsTrigger value="wallet"><Wallet className="h-4 w-4 mr-2" />Wallet</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="h-4 w-4 mr-2" />Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>{editingProduct ? "Edit Product" : "Add New Product"}</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleProductSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div><Label htmlFor="title">Product Title *</Label><Input id="title" value={productForm.title} onChange={(e) => setProductForm({ ...productForm, title: e.target.value })} placeholder="e.g., Handmade African Basket" required /></div>
                    <div><Label htmlFor="category">Category *</Label>
                      <Select value={productForm.category} onValueChange={(v) => setProductForm({ ...productForm, category: v })}>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Fashion">Fashion & Clothing</SelectItem><SelectItem value="Electronics">Electronics</SelectItem><SelectItem value="Home">Home & Garden</SelectItem><SelectItem value="Beauty">Beauty & Health</SelectItem><SelectItem value="Sports">Sports & Outdoors</SelectItem><SelectItem value="Toys">Toys & Games</SelectItem><SelectItem value="Books">Books & Media</SelectItem><SelectItem value="Food">Food & Beverages</SelectItem><SelectItem value="Crafts">Crafts & Handmade</SelectItem><SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div><Label htmlFor="condition">Item Condition *</Label>
                      <Select value={productForm.condition} onValueChange={(v) => setProductForm({ ...productForm, condition: v })}>
                        <SelectTrigger><SelectValue placeholder="Select condition" /></SelectTrigger>
                        <SelectContent><SelectItem value="brand_new">Brand New</SelectItem><SelectItem value="refurbished">Refurbished</SelectItem><SelectItem value="used">Used / Second Hand</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div><Label htmlFor="price">Price (UGX) *</Label><Input id="price" type="number" min="0" step="100" value={productForm.price} onChange={(e) => setProductForm({ ...productForm, price: e.target.value })} placeholder="10000" required /></div>
                    <div><Label htmlFor="stock">Stock Quantity *</Label><Input id="stock" type="number" min="0" value={productForm.stock_quantity} onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })} placeholder="10" required /></div>
                  </div>

                  {/* Clearance Sale Toggle */}
                  <div className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-muted/30">
                    <div className="flex items-center gap-2">
                      <Switch checked={productForm.is_clearance} onCheckedChange={(checked) => setProductForm({ ...productForm, is_clearance: checked, discount_percentage: checked ? productForm.discount_percentage : "0" })} />
                      <Label className="flex items-center gap-2 cursor-pointer">
                        <Percent className="w-4 h-4 text-destructive" />
                        Clearance Sale
                      </Label>
                    </div>
                    {productForm.is_clearance && (
                      <div className="flex items-center gap-2">
                        <Label htmlFor="discount" className="text-sm whitespace-nowrap">Discount %</Label>
                        <Input id="discount" type="number" min="1" max="90" value={productForm.discount_percentage} onChange={(e) => setProductForm({ ...productForm, discount_percentage: e.target.value })} className="w-20 h-8" placeholder="20" />
                      </div>
                    )}
                  </div>

                  <div><Label htmlFor="description">Product Description</Label><Textarea id="description" value={productForm.description} onChange={(e) => setProductForm({ ...productForm, description: e.target.value })} rows={4} placeholder="Describe your product in detail" /></div>
                  <MultiImageUpload bucket="venue-images" folder="products/" currentImages={productForm.images} onUploadComplete={(urls) => setProductForm({ ...productForm, images: urls, image_url: urls[0] || "" })} maxImages={5} />
                  <div className="flex gap-2">
                    <Button type="submit">{editingProduct ? "Update Product" : "Add Product"}</Button>
                    {editingProduct && (<Button type="button" variant="outline" onClick={() => { setEditingProduct(null); setProductForm({ title: "", description: "", price: "", stock_quantity: "", category: "", condition: "brand_new", image_url: "", images: [], is_clearance: false, discount_percentage: "0" }); }}>Cancel Edit</Button>)}
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Products Table */}
            <Card>
              <CardHeader><CardTitle>Your Products</CardTitle></CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground"><Package className="h-12 w-12 mx-auto mb-3 opacity-50" /><p>No products yet. Add your first product above!</p></div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead><TableHead>Category</TableHead><TableHead>Price</TableHead><TableHead>Stock</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id} className={!product.is_active ? "opacity-60" : ""}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {product.image_url && <img src={product.image_url} alt={product.title} className="w-10 h-10 rounded-lg object-cover" />}
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{product.title}</span>
                                {product.is_clearance && <Badge variant="outline" className="text-xs text-destructive border-destructive/30">-{product.discount_percentage}%</Badge>}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell><Badge variant="outline" className="text-xs">{product.category}</Badge></TableCell>
                          <TableCell className="font-medium">UGX {product.price.toLocaleString()}</TableCell>
                          <TableCell>{product.stock_quantity}</TableCell>
                          <TableCell><Badge variant={product.is_active ? "default" : "secondary"} className="text-xs">{product.is_active ? "Active" : "Inactive"}</Badge></TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-1 justify-end">
                              <Button size="sm" variant="ghost" onClick={() => handleEditProduct(product)}><Edit className="h-4 w-4" /></Button>
                              <Button size="sm" variant="ghost" onClick={() => handleToggleActive(product.id, product.is_active)}>{product.is_active ? "Hide" : "Show"}</Button>
                              <Button size="sm" variant="ghost" onClick={() => handleDeleteProduct(product.id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="auctions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="h-5 w-5 text-primary" />
                  Create Auction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">List one of your products as a buy-now + bid hybrid auction.</p>
                <div className="space-y-4">
                  <div>
                    <Label>Select Product</Label>
                    <Select value={auctionForm.product_id} onValueChange={(v) => setAuctionForm({ ...auctionForm, product_id: v })}>
                      <SelectTrigger><SelectValue placeholder="Choose a product to auction" /></SelectTrigger>
                      <SelectContent>
                        {products.filter(p => p.is_active).map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.title} (UGX {p.price.toLocaleString()})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><Label>Starting Bid (UGX)</Label><Input type="number" min="0" step="1000" value={auctionForm.start_price} onChange={(e) => setAuctionForm({ ...auctionForm, start_price: e.target.value })} placeholder="50000" /></div>
                    <div><Label>Buy Now Price (UGX)</Label><Input type="number" min="0" step="1000" value={auctionForm.buy_now_price} onChange={(e) => setAuctionForm({ ...auctionForm, buy_now_price: e.target.value })} placeholder="200000 (optional)" /></div>
                  </div>
                  <div>
                    <Label>Auction Duration</Label>
                    <Select value={auctionForm.duration_hours} onValueChange={(v) => setAuctionForm({ ...auctionForm, duration_hours: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="6">6 hours</SelectItem>
                        <SelectItem value="12">12 hours</SelectItem>
                        <SelectItem value="24">24 hours</SelectItem>
                        <SelectItem value="48">48 hours</SelectItem>
                        <SelectItem value="72">3 days</SelectItem>
                        <SelectItem value="168">7 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={async () => {
                    if (!auctionForm.product_id || !auctionForm.start_price) {
                      toast({ variant: "destructive", title: "Missing fields", description: "Select a product and set a starting price" });
                      return;
                    }
                    const endTime = new Date(Date.now() + parseInt(auctionForm.duration_hours) * 60 * 60 * 1000).toISOString();
                    const { error } = await supabase.from("auctions").insert({
                      product_id: auctionForm.product_id,
                      seller_id: user?.id,
                      start_price: parseFloat(auctionForm.start_price),
                      buy_now_price: auctionForm.buy_now_price ? parseFloat(auctionForm.buy_now_price) : null,
                      end_time: endTime,
                      status: "active",
                    });
                    if (error) {
                      toast({ variant: "destructive", title: "Error", description: error.message });
                      return;
                    }
                    toast({ title: "Auction Created! 🎉", description: "Your auction is now live" });
                    setAuctionForm({ product_id: "", start_price: "", buy_now_price: "", duration_hours: "24" });
                  }} className="w-full font-bold">
                    <Gavel className="mr-2 w-4 h-4" />
                    Start Auction
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Incoming Orders</CardTitle></CardHeader>
              <CardContent>
                {orders.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No orders yet</p>
                    <p className="text-xs mt-1">Orders from customers will appear here</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Buyer</TableHead>
                        <TableHead>Qty</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((orderItem) => {
                        const status = orderItem.orders?.status || "pending";
                        const statusColor = status === "delivered" || status === "confirmed" ? "text-green-600" : status === "pending" ? "text-yellow-600" : status === "cancelled" ? "text-destructive" : "text-muted-foreground";
                        return (
                          <TableRow key={orderItem.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {orderItem.products?.image_url && <img src={orderItem.products.image_url} alt="" className="w-8 h-8 rounded object-cover" />}
                                <span className="font-medium text-sm">{orderItem.products?.title}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {orderItem.orders?.phone ? (
                                <a href={`tel:${orderItem.orders.phone}`} className="flex items-center gap-1 text-sm text-primary hover:underline">
                                  <Phone className="h-3 w-3" />
                                  {orderItem.orders.phone}
                                </a>
                              ) : (
                                <span className="text-xs text-muted-foreground">N/A</span>
                              )}
                            </TableCell>
                            <TableCell>{orderItem.quantity}</TableCell>
                            <TableCell className="font-medium">UGX {(orderItem.quantity * orderItem.price_at_purchase).toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`text-xs capitalize ${statusColor}`}>
                                {status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(orderItem.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-1 justify-end">
                                {status === "pending" && (
                                  <>
                                    <Button size="sm" variant="ghost" className="h-7 text-xs text-green-600" onClick={() => handleUpdateOrderStatus(orderItem.orders?.id, "confirmed")}>
                                      Approve
                                    </Button>
                                    <Button size="sm" variant="ghost" className="h-7 text-xs text-destructive" onClick={() => handleUpdateOrderStatus(orderItem.orders?.id, "cancelled")}>
                                      Reject
                                    </Button>
                                  </>
                                )}
                                {status === "confirmed" && (
                                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleUpdateOrderStatus(orderItem.orders?.id, "shipped")}>
                                    Mark Shipped
                                  </Button>
                                )}
                                {status === "shipped" && (
                                  <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleUpdateOrderStatus(orderItem.orders?.id, "delivered")}>
                                    Mark Delivered
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader><CardTitle>Contact & Profile Settings</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div><Label htmlFor="full_name">Full Name</Label><Input id="full_name" value={profileForm.full_name} onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })} required /></div>
                  <div><Label htmlFor="phone">Phone Number</Label><Input id="phone" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="+256XXXXXXXXX" /></div>
                  <div><Label htmlFor="bio">Bio</Label><Textarea id="bio" value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} rows={3} placeholder="Tell customers about your business..." /></div>
                  <Button type="submit">Update Profile</Button>
                </form>
              </CardContent>
            </Card>
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
