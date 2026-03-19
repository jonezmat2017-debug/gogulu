import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Percent, ArrowRight, ShoppingCart, Flame } from "lucide-react";

interface ClearanceProduct {
  id: string;
  title: string;
  price: number;
  discount_percentage: number;
  image_url: string | null;
  category: string | null;
}

const ClearanceBanner = () => {
  const [products, setProducts] = useState<ClearanceProduct[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchClearanceProducts();
  }, []);

  const fetchClearanceProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("id, title, price, discount_percentage, image_url, category")
      .eq("is_clearance", true)
      .eq("is_active", true)
      .gt("stock_quantity", 0)
      .gt("discount_percentage", 0)
      .order("discount_percentage", { ascending: false })
      .limit(6);
    if (data) setProducts(data);
  };

  const handleAddToCart = async (productId: string) => {
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
      toast({ title: "Added to cart", description: "Clearance item added!" });
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err.message });
    }
  };

  if (products.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-destructive text-destructive-foreground font-bold text-sm shadow-lg shadow-destructive/25">
          <Flame className="w-4 h-4 fill-current" />
          CLEARANCE SALE
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
          <Percent className="w-4 h-4" />
          Massive discounts from sellers
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {products.map((product) => {
          const discountedPrice = Math.round(product.price * (1 - product.discount_percentage / 100));
          return (
            <div
              key={product.id}
              className="group relative bg-card rounded-2xl overflow-hidden border border-destructive/20 hover:border-destructive/50 transition-all duration-300 hover:shadow-[0_4px_20px_-4px_hsl(var(--destructive)/0.3)]"
            >
              {/* Discount badge */}
              <div className="absolute top-2 right-2 z-10">
                <div className="bg-destructive text-destructive-foreground rounded-xl px-2 py-1 shadow-lg">
                  <div className="text-sm font-black leading-none">-{product.discount_percentage}%</div>
                </div>
              </div>

              <div className="aspect-square overflow-hidden">
                {product.image_url ? (
                  <img src={product.image_url} alt={product.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Percent className="w-8 h-8 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              <div className="p-3 space-y-2">
                <h4 className="text-sm font-bold line-clamp-1">{product.title}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-primary">UGX {discountedPrice.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground line-through">UGX {product.price.toLocaleString()}</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => handleAddToCart(product.id)}
                  className="w-full h-8 rounded-lg text-xs font-bold"
                >
                  <ShoppingCart className="mr-1 w-3 h-3" />
                  Add
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ClearanceBanner;
