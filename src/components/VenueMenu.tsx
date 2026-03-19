import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  UtensilsCrossed,
  Phone,
  ShoppingCart,
  Plus,
  Minus,
  Loader2,
} from "lucide-react";
import { sendNotification, logActivity } from "@/lib/notify";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  image_url: string | null;
  is_available: boolean;
}

interface CartItem extends MenuItem {
  quantity: number;
}

interface VenueMenuProps {
  venueId: string;
  venuePhone: string | null;
  venueName: string;
}

const VenueMenu = ({ venueId, venuePhone, venueName }: VenueMenuProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    notes: "",
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    fetchMenu();
  }, [venueId]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("full_name, phone")
      .eq("id", user.id)
      .single();
    if (data) {
      setCustomerInfo((prev) => ({
        ...prev,
        name: data.full_name || "",
        phone: data.phone || "",
      }));
    }
  };

  const fetchMenu = async () => {
    const { data, error } = await supabase
      .from("menu_items" as any)
      .select("*")
      .eq("venue_id", venueId)
      .eq("is_available", true)
      .order("category")
      .order("name");

    if (!error && data) {
      setMenuItems(data as any);
    }
    setLoading(false);
  };

  const categories = [
    "all",
    ...Array.from(new Set(menuItems.map((i) => i.category).filter(Boolean))),
  ];
  const filtered =
    selectedCategory === "all"
      ? menuItems
      : menuItems.filter((i) => i.category === selectedCategory);

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    toast({ title: `${item.name} added`, description: "Added to your order" });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.id === itemId ? { ...c, quantity: c.quantity + delta } : c
        )
        .filter((c) => c.quantity > 0)
    );
  };

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);

  const handlePlaceOrder = async () => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Please sign in",
        description: "You need to be signed in to place an order",
      });
      return;
    }
    if (!customerInfo.name.trim() || !customerInfo.phone.trim()) {
      toast({
        variant: "destructive",
        title: "Missing info",
        description: "Please provide your name and phone number",
      });
      return;
    }

    setSubmitting(true);
    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from("venue_orders" as any)
        .insert({
          venue_id: venueId,
          customer_id: user.id,
          customer_name: customerInfo.name.trim(),
          customer_phone: customerInfo.phone.trim(),
          notes: customerInfo.notes.trim() || null,
          total_amount: cartTotal,
          status: "pending",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map((c) => ({
        order_id: (order as any).id,
        menu_item_id: c.id,
        quantity: c.quantity,
        price_at_order: c.price,
      }));

      const { error: itemsError } = await supabase
        .from("venue_order_items" as any)
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Notify venue owner
      const { data: venueData } = await supabase
        .from("venues")
        .select("submitted_by, name")
        .eq("id", venueId)
        .single();

      if (venueData?.submitted_by) {
        const itemSummary = cart.map(c => `${c.quantity}x ${c.name}`).join(", ");
        await sendNotification({
          userId: venueData.submitted_by,
          title: "New Order Received! 🔔",
          message: `${customerInfo.name} ordered: ${itemSummary} — Total: UGX ${cartTotal.toLocaleString()}. Phone: ${customerInfo.phone}`,
          type: "venue_order",
          metadata: { order_id: (order as any).id, venue_id: venueId },
        });
      }

      // Log activity
      await logActivity({
        actorId: user.id,
        actorName: customerInfo.name,
        action: "venue_order_placed",
        entityType: "venue_order",
        entityId: (order as any).id,
        details: { description: `Order placed at ${venueName} for UGX ${cartTotal.toLocaleString()}`, venue_name: venueName, total: cartTotal },
      });

      toast({
        title: "Order placed! 🎉",
        description:
          "The venue will review your order. You can also call them to confirm.",
      });

      setCart([]);
      setOrderDialogOpen(false);
      setCustomerInfo((prev) => ({ ...prev, notes: "" }));
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to place order",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (menuItems.length === 0) {
    return (
      <div className="text-center py-8">
        <UtensilsCrossed className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-50" />
        <p className="text-muted-foreground">No menu items available yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Menu</h3>
        <div className="flex gap-2">
          {venuePhone && (
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <a href={`tel:${venuePhone}`}>
                <Phone className="h-4 w-4 mr-1" />
                Call to Order
              </a>
            </Button>
          )}
          {cart.length > 0 && (
            <Button
              size="sm"
              onClick={() => setOrderDialogOpen(true)}
              className="relative"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Cart ({cart.length})
              <Badge className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                {cart.reduce((s, c) => s + c.quantity, 0)}
              </Badge>
            </Button>
          )}
        </div>
      </div>

      {/* Category filter */}
      {categories.length > 2 && (
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <Button
              key={cat}
              size="sm"
              variant={selectedCategory === cat ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat as string)}
              className="text-xs h-7"
            >
              {cat === "all" ? "All" : cat}
            </Button>
          ))}
        </div>
      )}

      {/* Menu items grid */}
      <div className="grid gap-3">
        {filtered.map((item) => {
          const inCart = cart.find((c) => c.id === item.id);
          return (
            <div
              key={item.id}
              className="flex gap-3 p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors"
            >
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-medium text-sm">{item.name}</h4>
                    {item.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {item.description}
                      </p>
                    )}
                    {item.category && (
                      <Badge variant="outline" className="text-[10px] mt-1 h-5">
                        {item.category}
                      </Badge>
                    )}
                  </div>
                  <span className="font-semibold text-sm text-primary whitespace-nowrap">
                    UGX {item.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-end mt-2 gap-2">
                  {inCart ? (
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium w-6 text-center">
                        {inCart.quantity}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-xs"
                      onClick={() => addToCart(item)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Order Dialog */}
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your Order from {venueName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Cart items */}
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => updateQuantity(item.id, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-5 text-center">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => updateQuantity(item.id, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">
                    UGX {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-primary">
                UGX {cartTotal.toLocaleString()}
              </span>
            </div>

            <Separator />

            {/* Customer info */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="cust-name">Your Name *</Label>
                <Input
                  id="cust-name"
                  value={customerInfo.name}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, name: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="cust-phone">Phone Number *</Label>
                <Input
                  id="cust-phone"
                  type="tel"
                  placeholder="+256XXXXXXXXX"
                  value={customerInfo.phone}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, phone: e.target.value })
                  }
                  required
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  The venue will call you to confirm & arrange delivery
                </p>
              </div>
              <div>
                <Label htmlFor="cust-notes">Notes (optional)</Label>
                <Textarea
                  id="cust-notes"
                  placeholder="Any special instructions?"
                  value={customerInfo.notes}
                  onChange={(e) =>
                    setCustomerInfo({ ...customerInfo, notes: e.target.value })
                  }
                  rows={2}
                />
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground">
              <p className="font-medium text-foreground mb-1">💰 Payment on Delivery</p>
              <p>
                Pay via Mobile Money when your order is delivered. The venue will
                contact you to confirm your order first.
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={handlePlaceOrder}
                disabled={submitting || cart.length === 0}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Placing...
                  </>
                ) : (
                  "Place Order"
                )}
              </Button>
              {venuePhone && (
                <Button variant="outline" asChild>
                  <a href={`tel:${venuePhone}`}>
                    <Phone className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VenueMenu;
