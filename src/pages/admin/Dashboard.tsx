import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, ShoppingBag, Users, Clock, UserCheck, TrendingUp, TrendingDown, Star, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState({
    totalVenues: 0,
    pendingVenues: 0,
    totalProducts: 0,
    totalUsers: 0,
    pendingSellers: 0,
    totalOrders: 0,
    totalReviews: 0,
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
    fetchProfile();
    fetchRecentData();
  }, []);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (data) setProfile(data);
  };

  const fetchStats = async () => {
    const [venues, pendingVenues, products, profiles, sellerRoles, orders, venueReviews, sellerReviews] = await Promise.all([
      supabase.from("venues").select("*", { count: "exact", head: true }),
      supabase.from("venues").select("*", { count: "exact", head: true }).eq("approved", false),
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("user_roles").select("*", { count: "exact", head: true }).eq("role", "seller").eq("approved", false),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("venue_reviews").select("*", { count: "exact", head: true }),
      supabase.from("seller_ratings").select("*", { count: "exact", head: true }),
    ]);

    setStats({
      totalVenues: venues.count || 0,
      pendingVenues: pendingVenues.count || 0,
      totalProducts: products.count || 0,
      totalUsers: profiles.count || 0,
      pendingSellers: sellerRoles.count || 0,
      totalOrders: orders.count || 0,
      totalReviews: (venueReviews.count || 0) + (sellerReviews.count || 0),
    });
  };

  const fetchRecentData = async () => {
    const [usersRes, ordersRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(5),
      supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(5),
    ]);
    if (usersRes.data) setRecentUsers(usersRes.data);
    if (ordersRes.data) setRecentOrders(ordersRes.data);
  };

  // Mock monthly data for the chart (in production, query aggregated data)
  const monthlyData = [
    { month: "Jan", users: 12, orders: 5, venues: 3 },
    { month: "Feb", users: 18, orders: 8, venues: 5 },
    { month: "Mar", users: 25, orders: 12, venues: 7 },
    { month: "Apr", users: 32, orders: 18, venues: 9 },
    { month: "May", users: 40, orders: 22, venues: 11 },
    { month: "Jun", users: 48, orders: 28, venues: 14 },
    { month: "Jul", users: 55, orders: 35, venues: 16 },
    { month: "Aug", users: stats.totalUsers, orders: stats.totalOrders, venues: stats.totalVenues },
  ];

  const pieData = [
    { name: "Venues", value: stats.totalVenues, color: "hsl(var(--primary))" },
    { name: "Products", value: stats.totalProducts, color: "hsl(var(--accent))" },
    { name: "Pending", value: stats.pendingVenues + stats.pendingSellers, color: "hsl(var(--muted-foreground))" },
    { name: "Orders", value: stats.totalOrders, color: "hsl(var(--secondary))" },
  ];
  const pieTotal = pieData.reduce((sum, d) => sum + d.value, 0);

  const statCards = [
    { title: "Total Users", value: stats.totalUsers, icon: Users, trend: "+3.2%", up: true },
    { title: "Total Venues", value: stats.totalVenues, icon: Building2, trend: "+7.2%", up: true },
    { title: "Total Products", value: stats.totalProducts, icon: ShoppingBag, trend: "+4.3%", up: true },
    { title: "Pending Approvals", value: stats.pendingVenues + stats.pendingSellers, icon: Clock, trend: stats.pendingVenues + stats.pendingSellers > 0 ? "Action needed" : "All clear", up: false },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered": return "text-green-500";
      case "confirmed": case "shipped": return "text-blue-500";
      case "pending": return "text-yellow-500";
      case "cancelled": return "text-destructive";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
              {profile?.full_name?.charAt(0)?.toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">Hi {profile?.full_name || "Admin"} 👋</h1>
            <p className="text-muted-foreground text-sm">Welcome back to your dashboard</p>
          </div>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-border">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{stat.title}</span>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold">{stat.value}</span>
                <div className={`flex items-center gap-1 text-xs font-medium ${stat.up ? "text-green-500" : "text-muted-foreground"}`}>
                  {stat.up ? <TrendingUp className="w-3 h-3" /> : null}
                  {stat.trend}
                </div>
              </div>
              {/* Mini sparkline */}
              <div className="mt-3 h-8">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData.slice(-5)}>
                    <Area type="monotone" dataKey="users" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.1)" strokeWidth={1.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Seller Alert */}
      {stats.pendingSellers > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <UserCheck className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold">Pending Seller Approvals</p>
                <p className="text-sm text-muted-foreground">
                  {stats.pendingSellers} {stats.pendingSellers === 1 ? "application" : "applications"} waiting
                </p>
              </div>
            </div>
            <Button size="sm" onClick={() => navigate("/admin/seller-onboarding")}>
              Review Now
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Growth Chart */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Platform Growth</CardTitle>
              <Badge variant="outline" className="text-xs">Yearly</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Area type="monotone" dataKey="users" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.15)" strokeWidth={2} name="Users" />
                  <Area type="monotone" dataKey="orders" stroke="hsl(var(--accent))" fill="hsl(var(--accent) / 0.1)" strokeWidth={2} name="Orders" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Overview Donut */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Platform Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{pieTotal}</span>
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

      {/* Recent Activity Tables */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Users */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Users</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin/users")}>View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">No users yet</TableCell>
                  </TableRow>
                ) : (
                  recentUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {u.full_name?.charAt(0)?.toUpperCase() || "?"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">{u.full_name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Orders</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate("/admin/transactions")}>View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">No orders yet</TableCell>
                  </TableRow>
                ) : (
                  recentOrders.map((o) => (
                    <TableRow key={o.id}>
                      <TableCell className="font-mono text-xs">{o.id.slice(0, 8)}...</TableCell>
                      <TableCell className="font-medium text-sm">UGX {o.total_amount?.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${getStatusColor(o.status)}`}>
                          {o.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(o.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-3">
        <Card className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => navigate("/admin/reviews")}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-xl">
              <MessageSquare className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalReviews}</p>
              <p className="text-xs text-muted-foreground">Total Reviews</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => navigate("/admin/venues")}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Star className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalVenues}</p>
              <p className="text-xs text-muted-foreground">Active Venues</p>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-primary/40 transition-colors" onClick={() => navigate("/admin/transactions")}>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalOrders}</p>
              <p className="text-xs text-muted-foreground">Total Orders</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
