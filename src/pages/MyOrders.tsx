import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ShoppingBag, UtensilsCrossed, Phone, Package, Clock, CheckCircle, XCircle, Truck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  pending: { label: "Pending", color: "bg-amber-500/10 text-amber-600 border-amber-500/20", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-blue-500/10 text-blue-600 border-blue-500/20", icon: CheckCircle },
  approved: { label: "Approved", color: "bg-green-500/10 text-green-600 border-green-500/20", icon: CheckCircle },
  shipped: { label: "Shipped", color: "bg-purple-500/10 text-purple-600 border-purple-500/20", icon: Truck },
  delivered: { label: "Delivered", color: "bg-green-600/10 text-green-700 border-green-600/20", icon: CheckCircle },
  completed: { label: "Completed", color: "bg-green-600/10 text-green-700 border-green-600/20", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
  rejected: { label: "Rejected", color: "bg-destructive/10 text-destructive border-destructive/20", icon: XCircle },
};

export default function MyOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [productOrders, setProductOrders] = useState<any[]>([]);
  const [venueOrders, setVenueOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    if (!user) return;

    const [productRes, venueRes] = await Promise.all([
      supabase
        .from("orders")
        .select("*, order_items(*, products(title, image_url))")
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("venue_orders")
        .select("*, venue_order_items(*, menu_items(name, image_url)), venues(name, phone)")
        .eq("customer_id", user.id)
        .order("created_at", { ascending: false }),
    ]);

    if (productRes.data) setProductOrders(productRes.data);
    if (venueRes.data) setVenueOrders(venueRes.data as any[]);
    setLoading(false);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    return (
      <Badge variant="outline" className={`${config.color} gap-1`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 pb-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Orders</h1>
          <p className="text-muted-foreground">Track all your orders in one place</p>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="products" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              Products ({productOrders.length})
            </TabsTrigger>
            <TabsTrigger value="venues" className="gap-2">
              <UtensilsCrossed className="h-4 w-4" />
              Venues ({venueOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-4">
            {productOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
                  <p className="text-muted-foreground">No product orders yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Browse the marketplace to find great deals</p>
                </CardContent>
              </Card>
            ) : (
              productOrders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div>
                        <CardTitle className="text-base">
                          Order #{order.id.slice(0, 8).toUpperCase()}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {order.order_items?.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3">
                        {item.products?.image_url ? (
                          <img src={item.products.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                            <Package className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.products?.title || "Product"}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold">UGX {Number(item.price_at_purchase).toLocaleString()}</p>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="text-sm text-muted-foreground">Total</span>
                      <span className="font-bold">UGX {Number(order.total_amount).toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <p>📍 {order.shipping_address}</p>
                      <p>📱 {order.phone}</p>
                      <p>💳 Payment on Delivery (Mobile Money)</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="venues" className="space-y-4">
            {venueOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <UtensilsCrossed className="h-12 w-12 mx-auto mb-3 text-muted-foreground/40" />
                  <p className="text-muted-foreground">No venue orders yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Explore venues and order your favorite meals</p>
                </CardContent>
              </Card>
            ) : (
              venueOrders.map((order: any) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div>
                        <CardTitle className="text-base">
                          {order.venues?.name || "Venue Order"}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                        </p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {order.venue_order_items?.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-3">
                        {item.menu_items?.image_url ? (
                          <img src={item.menu_items.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                            <UtensilsCrossed className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.menu_items?.name || "Item"}</p>
                          <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold">UGX {Number(item.price_at_order).toLocaleString()}</p>
                      </div>
                    ))}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="text-sm text-muted-foreground">Total</span>
                      <span className="font-bold">UGX {Number(order.total_amount).toLocaleString()}</span>
                    </div>
                    {order.venues?.phone && (
                      <a href={`tel:${order.venues.phone}`} className="flex items-center gap-2 text-sm text-primary hover:underline">
                        <Phone className="h-3.5 w-3.5" />
                        Call venue: {order.venues.phone}
                      </a>
                    )}
                    {order.notes && (
                      <p className="text-xs text-muted-foreground">📝 {order.notes}</p>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}
