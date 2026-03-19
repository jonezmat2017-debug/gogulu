import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Star, Recycle, PackageCheck, BadgeCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RefurbishedProductCardProps {
  id: string;
  title: string;
  description: string | null;
  price: number;
  image_url: string | null;
  category: string | null;
  condition: "brand_new" | "refurbished" | "used";
  stock_quantity: number;
  seller_name: string;
  seller_rating: number | null;
  seller_review_count: number;
  onAddToCart: () => void;
}

const conditionConfig = {
  brand_new: {
    label: "Brand New",
    icon: PackageCheck,
    className: "bg-primary/20 text-primary border-primary/30",
  },
  refurbished: {
    label: "Refurbished",
    icon: Recycle,
    className: "bg-primary/20 text-primary border-primary/30",
  },
  used: {
    label: "Used",
    icon: BadgeCheck,
    className: "bg-sky-500/20 text-sky-400 border-sky-500/30",
  },
};

const RefurbishedProductCard = ({
  title,
  description,
  price,
  image_url,
  category,
  condition,
  stock_quantity,
  seller_name,
  seller_rating,
  seller_review_count,
  onAddToCart,
}: RefurbishedProductCardProps) => {
  const condInfo = conditionConfig[condition] || conditionConfig.used;
  const CondIcon = condInfo.icon;

  return (
    <Card className="group overflow-hidden border-border/50 bg-gradient-to-b from-card to-card/80 hover:border-primary/40 transition-all duration-500 hover:shadow-[0_8px_40px_-8px_hsl(var(--primary)/0.2)] rounded-2xl relative">
      {/* Subtle corner accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-[3rem] pointer-events-none" />

      <div className="aspect-[4/3] overflow-hidden bg-muted relative">
        {image_url ? (
          <img
            src={image_url}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Recycle className="w-16 h-16 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        <Badge className={`absolute top-3 left-3 ${condInfo.className} border font-semibold text-xs gap-1.5 px-3 py-1`}>
          <CondIcon className="w-3.5 h-3.5" />
          {condInfo.label}
        </Badge>

        {category && (
          <Badge className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white/90 border-white/10 font-medium text-xs">
            {category}
          </Badge>
        )}
      </div>

      <CardContent className="p-5 space-y-3">
        <div>
          <h3 className="font-bold text-lg line-clamp-1 text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-muted/50 border border-border/50">
          <span className="text-xs text-muted-foreground truncate max-w-[60%]">
            {seller_name}
          </span>
          <div className="flex items-center gap-1.5">
            {seller_rating !== null ? (
              <>
                <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                <span className="text-xs font-bold text-foreground">{seller_rating}</span>
                <span className="text-xs text-muted-foreground">({seller_review_count})</span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground italic">New seller</span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            UGX {price.toLocaleString()}
          </span>
          <span className="text-xs text-muted-foreground">
            {stock_quantity > 0 ? `${stock_quantity} avail.` : "Sold"}
          </span>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0">
        <Button
          onClick={onAddToCart}
          disabled={stock_quantity === 0}
          className="w-full rounded-xl h-11 font-bold bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-lg shadow-primary/20"
          size="lg"
        >
          <ShoppingCart className="mr-2 w-4 h-4" />
          {stock_quantity === 0 ? "Sold Out" : "Add to Cart"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RefurbishedProductCard;
