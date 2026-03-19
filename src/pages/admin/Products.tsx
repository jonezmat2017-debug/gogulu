import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Product = Tables<"products">;

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch products",
          variant: "destructive",
        });
        return;
      }

      setProducts(data || []);
      setIsLoading(false);
    };

    fetchProducts();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Product Management</h1>
        <p className="text-muted-foreground">View all products in the marketplace</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id}>
            <CardHeader>
              <CardTitle className="line-clamp-1">{product.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {product.image_url && (
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-full h-40 object-cover rounded-md mb-3"
                />
              )}
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <p className="text-lg font-bold">UGX {product.price.toLocaleString()}</p>
                  <Badge variant={product.is_active ? "default" : "secondary"}>
                    {product.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-sm">
                  <strong>Stock:</strong> {product.stock_quantity}
                </p>
                {product.category && (
                  <Badge variant="outline">{product.category}</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {products.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="py-8 text-center text-muted-foreground">
              No products found
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
