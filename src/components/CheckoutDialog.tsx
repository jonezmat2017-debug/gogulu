import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { CreditCard, Banknote } from "lucide-react";
import { z } from "zod";
import { sendNotification, logActivity } from "@/lib/notify";

const checkoutSchema = z.object({
  address: z.string()
    .trim()
    .min(10, 'Address must be at least 10 characters')
    .max(500, 'Address too long'),
  phone: z.string()
    .regex(/^\+256[0-9]{9}$/, 'Invalid phone format. Use +256XXXXXXXXX'),
  notes: z.string()
    .max(1000, 'Notes too long')
    .optional()
    .default('')
});

interface CartItem {
  id: string;
  quantity: number;
  products: {
    id: string;
    title: string;
    price: number;
    seller_id: string;
  };
}

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cartItems: CartItem[];
  totalAmount: number;
  onSuccess: () => void;
}

const CheckoutDialog = ({
  open,
  onOpenChange,
  cartItems,
  totalAmount,
  onSuccess,
}: CheckoutDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"online" | "cash_on_delivery">("cash_on_delivery");
  const [formData, setFormData] = useState({
    address: "",
    phone: "",
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate input
    const validation = checkoutSchema.safeParse(formData);
    if (!validation.success) {
      toast({
        variant: "destructive",
        title: "Invalid input",
        description: validation.error.errors[0].message,
      });
      return;
    }

    setLoading(true);
    const validatedData = validation.data;

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          buyer_id: user.id,
          total_amount: totalAmount,
          payment_method: paymentMethod,
          shipping_address: validatedData.address,
          phone: validatedData.phone,
          notes: validatedData.notes,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.products.id,
        seller_id: item.products.seller_id,
        quantity: item.quantity,
        price_at_purchase: item.products.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear cart
      const { error: clearError } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id);

      if (clearError) throw clearError;

      // Notify each seller
      const sellerIds = [...new Set(cartItems.map((i) => i.products.seller_id))];
      const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();
      const buyerName = profile?.full_name || "A customer";

      for (const sellerId of sellerIds) {
        const sellerItems = cartItems.filter((i) => i.products.seller_id === sellerId);
        const itemSummary = sellerItems.map((i) => `${i.quantity}x ${i.products.title}`).join(", ");
        const sellerTotal = sellerItems.reduce((s, i) => s + i.products.price * i.quantity, 0);

        await sendNotification({
          userId: sellerId,
          title: "New Order Received! 🔔",
          message: `${buyerName} ordered: ${itemSummary} — Total: UGX ${sellerTotal.toLocaleString()}. Phone: ${validatedData.phone}`,
          type: "order",
          metadata: { order_id: order.id },
        });
      }

      // Log activity
      await logActivity({
        actorId: user.id,
        actorName: buyerName,
        action: "order_placed",
        entityType: "order",
        entityId: order.id,
        details: { description: `Order placed for UGX ${totalAmount.toLocaleString()} (${cartItems.length} items)`, total: totalAmount },
      });

      toast({
        title: "Order placed!",
        description: "Your order has been placed successfully.",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to place order",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Checkout</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">Shipping Address *</Label>
            <Textarea
              id="address"
              placeholder="Enter your full address (min 10 characters)"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              required
              minLength={10}
              maxLength={500}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+256XXXXXXXXX"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              required
              pattern="^\+256[0-9]{9}$"
            />
            <p className="text-xs text-muted-foreground">
              Format: +256 followed by 9 digits
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Order Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special instructions?"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              maxLength={1000}
            />
          </div>

          <div className="space-y-2">
            <Label>Payment Method *</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) =>
                setPaymentMethod(value as "online" | "cash_on_delivery")
              }
            >
              <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                <RadioGroupItem value="cash_on_delivery" id="cod" />
                <Label htmlFor="cod" className="flex items-center gap-2 cursor-pointer flex-1">
                  <Banknote className="w-5 h-5" />
                  <div>
                    <div className="font-medium">Cash on Delivery</div>
                    <div className="text-sm text-muted-foreground">
                      Pay when you receive your order
                    </div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-4 cursor-pointer hover:bg-accent">
                <RadioGroupItem value="online" id="online" />
                <Label htmlFor="online" className="flex items-center gap-2 cursor-pointer flex-1">
                  <CreditCard className="w-5 h-5" />
                  <div>
                    <div className="font-medium">Online Payment</div>
                    <div className="text-sm text-muted-foreground">
                      Pay securely with Mobile Money
                    </div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="border-t pt-4">
            <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground mb-4">
              <p className="font-medium text-foreground mb-1">💰 Payment on Delivery</p>
              <p>Pay via Mobile Money when your order is delivered. The seller will contact you to confirm your order first.</p>
            </div>
            <div className="flex justify-between text-lg font-semibold mb-4">
              <span>Total:</span>
              <span className="text-primary">
                UGX {totalAmount.toLocaleString()}
              </span>
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Processing..." : "Place Order"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutDialog;
