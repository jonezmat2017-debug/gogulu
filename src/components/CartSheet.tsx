import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Trash2, Plus, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import CheckoutDialog from "./CheckoutDialog";

interface CartItem {
  id: string;
  quantity: number;
  products: {
    id: string;
    title: string;
    price: number;
    image_url: string | null;
    stock_quantity: number;
    seller_id: string;
  };
}

const CartSheet = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  const fetchCart = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("cart_items")
      .select(`
        id,
        quantity,
        products (
          id,
          title,
          price,
          image_url,
          stock_quantity,
          seller_id
        )
      `)
      .eq("user_id", user.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load cart",
      });
    } else {
      setCart(data as CartItem[]);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    const { error } = await supabase
      .from("cart_items")
      .update({ quantity: newQuantity })
      .eq("id", itemId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update quantity",
      });
    } else {
      fetchCart();
    }
  };

  const removeItem = async (itemId: string) => {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", itemId);

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove item",
      });
    } else {
      fetchCart();
      toast({
        title: "Removed",
        description: "Item removed from cart",
      });
    }
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.products.price * item.quantity,
    0
  );

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="hover:text-primary relative">
            <ShoppingCart className="w-5 h-5" />
            {cart.length > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {cart.length}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Shopping Cart ({cart.length})</SheetTitle>
          </SheetHeader>
          <div className="mt-8 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 p-4 border rounded-lg bg-card"
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {item.products.image_url ? (
                          <img
                            src={item.products.image_url}
                            alt={item.products.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold line-clamp-1">
                          {item.products.title}
                        </h4>
                        <p className="text-sm text-primary font-semibold">
                          UGX {item.products.price.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">
                            {item.quantity}
                          </span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            disabled={item.quantity >= item.products.stock_quantity}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => removeItem(item.id)}
                        className="flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 space-y-4">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span className="text-primary">
                      UGX {totalAmount.toLocaleString()}
                    </span>
                  </div>
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => {
                      setShowCheckout(true);
                      setIsOpen(false);
                    }}
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>
      <CheckoutDialog
        open={showCheckout}
        onOpenChange={setShowCheckout}
        cartItems={cart}
        totalAmount={totalAmount}
        onSuccess={() => {
          fetchCart();
          setShowCheckout(false);
        }}
      />
    </>
  );
};

export default CartSheet;
