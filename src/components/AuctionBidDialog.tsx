import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Gavel, Clock, Zap, TrendingUp, Users, ShoppingCart } from "lucide-react";

interface Auction {
  id: string;
  product_id: string;
  seller_id: string;
  start_price: number;
  buy_now_price: number | null;
  current_highest_bid: number;
  highest_bidder_id: string | null;
  end_time: string;
  status: string;
  product?: {
    title: string;
    description: string | null;
    image_url: string | null;
    category: string | null;
  };
}

interface Bid {
  id: string;
  bidder_id: string;
  amount: number;
  created_at: string;
}

interface AuctionBidDialogProps {
  auction: Auction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuctionBidDialog = ({ auction, open, onOpenChange }: AuctionBidDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bidAmount, setBidAmount] = useState("");
  const [bids, setBids] = useState<Bid[]>([]);
  const [timeLeft, setTimeLeft] = useState("");
  const [isExpired, setIsExpired] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!auction || !open) return;
    fetchBids();

    // Subscribe to realtime bids
    const channel = supabase
      .channel(`auction-${auction.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "bids", filter: `auction_id=eq.${auction.id}` }, (payload) => {
        setBids((prev) => [payload.new as Bid, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [auction?.id, open]);

  useEffect(() => {
    if (!auction) return;
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(auction.end_time).getTime();
      const diff = end - now;
      if (diff <= 0) {
        setTimeLeft("Ended");
        setIsExpired(true);
        clearInterval(timer);
        return;
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      setIsExpired(false);
    }, 1000);
    return () => clearInterval(timer);
  }, [auction?.end_time]);

  const fetchBids = async () => {
    if (!auction) return;
    const { data } = await supabase
      .from("bids")
      .select("*")
      .eq("auction_id", auction.id)
      .order("amount", { ascending: false })
      .limit(10);
    if (data) setBids(data);
  };

  const handlePlaceBid = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "Sign in required", description: "Please sign in to place a bid" });
      return;
    }
    if (!auction) return;
    const amount = parseFloat(bidAmount);
    const minBid = Math.max(auction.start_price, auction.current_highest_bid + 1000);
    if (isNaN(amount) || amount < minBid) {
      toast({ variant: "destructive", title: "Bid too low", description: `Minimum bid is UGX ${minBid.toLocaleString()}` });
      return;
    }
    setIsSubmitting(true);
    const { error } = await supabase.from("bids").insert({ auction_id: auction.id, bidder_id: user.id, amount });
    setIsSubmitting(false);
    if (error) {
      toast({ variant: "destructive", title: "Error", description: error.message });
      return;
    }
    toast({ title: "Bid placed! 🎉", description: `Your bid of UGX ${amount.toLocaleString()} was submitted` });
    setBidAmount("");
  };

  const handleBuyNow = async () => {
    if (!user || !auction?.buy_now_price) return;
    setIsSubmitting(true);
    // Place a bid at buy_now_price and close the auction
    const { error: bidError } = await supabase.from("bids").insert({ auction_id: auction.id, bidder_id: user.id, amount: auction.buy_now_price });
    if (!bidError) {
      await supabase.from("auctions").update({ status: "sold", current_highest_bid: auction.buy_now_price, highest_bidder_id: user.id }).eq("id", auction.id);
    }
    setIsSubmitting(false);
    if (bidError) {
      toast({ variant: "destructive", title: "Error", description: bidError.message });
      return;
    }
    toast({ title: "Purchased! 🎉", description: "You bought this item at the Buy Now price" });
    onOpenChange(false);
  };

  if (!auction) return null;

  const minBid = Math.max(auction.start_price, auction.current_highest_bid + 1000);
  const isWinning = user && auction.highest_bidder_id === user.id;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gavel className="w-5 h-5 text-primary" />
            Live Auction
          </DialogTitle>
        </DialogHeader>

        {/* Product info */}
        {auction.product?.image_url && (
          <img src={auction.product.image_url} alt={auction.product.title} className="w-full h-48 object-cover rounded-xl" />
        )}
        <h3 className="text-xl font-bold">{auction.product?.title}</h3>
        {auction.product?.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{auction.product.description}</p>
        )}

        {/* Auction stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/50 rounded-xl p-4 text-center border border-border/50">
            <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
              <TrendingUp className="w-3 h-3" /> Current Bid
            </div>
            <div className="text-2xl font-black text-primary">
              UGX {auction.current_highest_bid.toLocaleString()}
            </div>
          </div>
          <div className={`rounded-xl p-4 text-center border ${isExpired ? "bg-destructive/10 border-destructive/30" : "bg-muted/50 border-border/50"}`}>
            <div className="text-xs text-muted-foreground mb-1 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" /> Time Left
            </div>
            <div className={`text-xl font-bold ${isExpired ? "text-destructive" : "text-foreground"}`}>
              {timeLeft}
            </div>
          </div>
        </div>

        {/* Buy Now option */}
        {auction.buy_now_price && !isExpired && auction.status === "active" && (
          <Button onClick={handleBuyNow} disabled={isSubmitting} className="w-full h-12 rounded-xl font-bold text-lg bg-accent hover:bg-accent/90 text-accent-foreground" size="lg">
            <ShoppingCart className="mr-2 w-5 h-5" />
            Buy Now — UGX {auction.buy_now_price.toLocaleString()}
          </Button>
        )}

        {/* Place bid */}
        {!isExpired && auction.status === "active" && (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder={`Min UGX ${minBid.toLocaleString()}`}
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="flex-1 h-12 rounded-xl text-lg"
                min={minBid}
                step={1000}
              />
              <Button onClick={handlePlaceBid} disabled={isSubmitting} className="h-12 px-6 rounded-xl font-bold">
                <Gavel className="mr-2 w-4 h-4" />
                Bid
              </Button>
            </div>
            {isWinning && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                ✓ You're the highest bidder!
              </Badge>
            )}
          </div>
        )}

        {isExpired && (
          <div className="text-center py-3">
            <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-sm px-4 py-2">
              Auction Ended
            </Badge>
          </div>
        )}

        {/* Bid history */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Users className="w-4 h-4" />
            Recent Bids ({bids.length})
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {bids.map((bid, i) => (
              <div key={bid.id} className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${i === 0 ? "bg-primary/10 border border-primary/20" : "bg-muted/30"}`}>
                <span className="text-muted-foreground">
                  {bid.bidder_id === user?.id ? "You" : `Bidder ${bid.bidder_id.slice(0, 6)}`}
                </span>
                <span className="font-bold">UGX {bid.amount.toLocaleString()}</span>
              </div>
            ))}
            {bids.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-4">No bids yet. Be the first!</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuctionBidDialog;
