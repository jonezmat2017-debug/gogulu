import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Gavel, Clock, Zap, TrendingUp } from "lucide-react";

interface AuctionCardProps {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  start_price: number;
  buy_now_price: number | null;
  current_highest_bid: number;
  end_time: string;
  status: string;
  onClick: () => void;
}

const AuctionCard = ({
  title, description, image_url, start_price, buy_now_price,
  current_highest_bid, end_time, status, onClick,
}: AuctionCardProps) => {
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(end_time).getTime();
      const diff = end - now;
      if (diff <= 0) {
        setTimeLeft("Ended");
        setIsExpired(true);
        clearInterval(timer);
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setTimeLeft(`${hours}h ${minutes}m`);
    }, 1000);
    return () => clearInterval(timer);
  }, [end_time]);

  return (
    <Card
      onClick={onClick}
      className="group cursor-pointer overflow-hidden border-border/50 bg-gradient-to-br from-card via-card to-primary/[0.05] hover:border-primary/50 transition-all duration-500 hover:shadow-[0_8px_40px_-8px_hsl(var(--primary)/0.3)] rounded-2xl relative"
    >
      {/* Live badge */}
      {!isExpired && status === "active" && (
        <div className="absolute top-4 left-4 z-20">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/90 text-white text-xs font-bold animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white" />
            LIVE
          </div>
        </div>
      )}

      {/* Timer */}
      <div className="absolute top-4 right-4 z-20">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-sm ${isExpired ? "bg-muted/80 text-muted-foreground" : "bg-black/70 text-white"}`}>
          <Clock className="w-3 h-3" />
          {timeLeft}
        </div>
      </div>

      <div className="aspect-[4/3] overflow-hidden relative">
        {image_url ? (
          <img src={image_url} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Gavel className="w-16 h-16 text-muted-foreground/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      </div>

      <CardContent className="p-5 space-y-3">
        <h3 className="font-bold text-lg line-clamp-1 text-foreground group-hover:text-primary transition-colors">{title}</h3>
        {description && <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>}

        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Current Bid
            </div>
            <div className="text-xl font-black text-primary">
              UGX {(current_highest_bid || start_price).toLocaleString()}
            </div>
          </div>
          {buy_now_price && (
            <div className="text-right">
              <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                <Zap className="w-3 h-3" /> Buy Now
              </div>
              <div className="text-sm font-bold text-accent">
                UGX {buy_now_price.toLocaleString()}
              </div>
            </div>
          )}
        </div>

        <Button
          className="w-full rounded-xl h-11 font-bold bg-primary hover:bg-primary/90 text-primary-foreground border-0 shadow-lg shadow-primary/20"
          disabled={isExpired || status !== "active"}
        >
          <Gavel className="mr-2 w-4 h-4" />
          {isExpired ? "Auction Ended" : "Place Bid"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default AuctionCard;
