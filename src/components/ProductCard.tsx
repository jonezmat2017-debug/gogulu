import { useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import SellerReviewDialog from "@/components/SellerReviewDialog";
import ChatDialog from "@/components/ChatDialog";

interface ProductCardProps {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  stock_quantity: number;
  seller_id: string;
  seller_name: string;
  seller_phone?: string | null;
  onAddToCart: () => void;
}

const ProductCard = ({
  id,
  title,
  description,
  price,
  image_url,
  category,
  stock_quantity,
  seller_id,
  seller_name,
  onAddToCart,
}: ProductCardProps) => {
  const [reviewOpen, setReviewOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <Card className="group overflow-hidden border-border hover:border-primary/40 transition-all duration-500 hover:shadow-[0_8px_30px_-8px_hsl(var(--primary)/0.25)] rounded-2xl">
        <div className="aspect-square overflow-hidden bg-muted relative">
          {image_url ? (
            <img
              src={image_url}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <ShoppingCart className="w-16 h-16 text-muted-foreground/40" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          {category && (
            <Badge className="absolute top-3 left-3 bg-card/80 backdrop-blur-sm text-foreground border border-border/50 font-medium text-xs">
              {category}
            </Badge>
          )}
          {stock_quantity <= 5 && stock_quantity > 0 && (
            <Badge className="absolute top-3 right-3 bg-destructive/90 text-destructive-foreground text-xs">
              Only {stock_quantity} left
            </Badge>
          )}
        </div>
        <CardContent className="p-5">
          <h3 className="font-bold text-lg mb-1 line-clamp-1 text-foreground group-hover:text-primary transition-colors">{title}</h3>
          <button
            onClick={(e) => { e.stopPropagation(); setReviewOpen(true); }}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mb-2"
          >
            <Star className="w-3 h-3" />
            <span>by {seller_name}</span>
            <span className="underline ml-1">Reviews</span>
          </button>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
              {description}
            </p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              UGX {price.toLocaleString()}
            </span>
            <span className="text-xs text-muted-foreground">
              {stock_quantity > 0 ? `${stock_quantity} in stock` : "Out of stock"}
            </span>
          </div>
        </CardContent>
        <CardFooter className="p-5 pt-0 flex gap-2">
          <Button
            onClick={onAddToCart}
            disabled={stock_quantity === 0}
            className="flex-1 rounded-xl h-11 font-bold group/btn"
            size="lg"
          >
            <ShoppingCart className="mr-2 w-4 h-4 group-hover/btn:scale-110 transition-transform" />
            Add to Cart
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="rounded-xl h-11"
            onClick={(e) => { e.stopPropagation(); setChatOpen(true); }}
            title="Chat with seller"
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
        </CardFooter>
      </Card>

      <SellerReviewDialog
        sellerId={seller_id}
        sellerName={seller_name}
        open={reviewOpen}
        onOpenChange={setReviewOpen}
      />

      <ChatDialog
        open={chatOpen}
        onOpenChange={setChatOpen}
        recipientId={seller_id}
        recipientName={seller_name}
        contextType="product"
        contextId={id}
      />
    </>
  );
};

export default ProductCard;
