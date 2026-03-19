import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Star, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";

interface SellerReviewDialogProps {
  sellerId: string;
  sellerName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Review {
  id: string;
  seller_id: string;
  reviewer_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  reviewer_name?: string;
}

const StarRating = ({ rating, onRate, interactive = false }: { rating: number; onRate?: (r: number) => void; interactive?: boolean }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`w-5 h-5 transition-colors ${
          star <= rating ? "fill-accent text-accent" : "text-muted-foreground/30"
        } ${interactive ? "cursor-pointer hover:text-accent" : ""}`}
        onClick={() => interactive && onRate?.(star)}
      />
    ))}
  </div>
);

const SellerReviewDialog = ({ sellerId, sellerName, open, onOpenChange }: SellerReviewDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newText, setNewText] = useState("");
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [avgRating, setAvgRating] = useState(0);

  useEffect(() => {
    if (open) fetchReviews();
  }, [open, sellerId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("seller_ratings")
        .select("*")
        .eq("seller_id", sellerId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const reviewerIds = [...new Set(data?.map((r) => r.reviewer_id) || [])];
      let profileMap: Record<string, string> = {};

      if (reviewerIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", reviewerIds);
        profiles?.forEach((p) => { profileMap[p.id] = p.full_name; });
      }

      const enriched = (data || []).map((r) => ({
        ...r,
        reviewer_name: profileMap[r.reviewer_id] || "Anonymous",
      }));

      setReviews(enriched);

      if (enriched.length > 0) {
        setAvgRating(enriched.reduce((sum, r) => sum + r.rating, 0) / enriched.length);
      }

      if (user) {
        const existing = enriched.find((r) => r.reviewer_id === user.id);
        if (existing) {
          setUserReview(existing);
          setNewRating(existing.rating);
          setNewText(existing.review_text || "");
        } else {
          setUserReview(null);
          setNewRating(0);
          setNewText("");
        }
      }
    } catch (err) {
      console.error("Error fetching seller reviews:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({ variant: "destructive", title: "Please sign in to leave a review" });
      return;
    }
    if (user.id === sellerId) {
      toast({ variant: "destructive", title: "You cannot review yourself" });
      return;
    }
    if (newRating === 0) {
      toast({ variant: "destructive", title: "Please select a rating" });
      return;
    }

    setSubmitting(true);
    try {
      if (userReview) {
        const { error } = await supabase
          .from("seller_ratings")
          .update({ rating: newRating, review_text: newText.trim() || null })
          .eq("id", userReview.id);
        if (error) throw error;
        toast({ title: "Review updated!" });
      } else {
        const { error } = await supabase
          .from("seller_ratings")
          .insert({
            seller_id: sellerId,
            reviewer_id: user.id,
            rating: newRating,
            review_text: newText.trim() || null,
          });
        if (error) throw error;
        toast({ title: "Review submitted!" });
      }
      await fetchReviews();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to submit review", description: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!userReview) return;
    try {
      const { error } = await supabase
        .from("seller_ratings")
        .delete()
        .eq("id", userReview.id);
      if (error) throw error;
      toast({ title: "Review deleted" });
      setUserReview(null);
      setNewRating(0);
      setNewText("");
      await fetchReviews();
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to delete", description: err.message });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Reviews for {sellerName}</DialogTitle>
        </DialogHeader>

        {reviews.length > 0 && (
          <div className="flex items-center gap-2 mb-2">
            <StarRating rating={Math.round(avgRating)} />
            <span className="font-semibold">{avgRating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
          </div>
        )}

        {/* Review form */}
        <div className="space-y-3 p-4 rounded-xl bg-muted/50 border border-border">
          <p className="text-sm font-medium">
            {userReview ? "Update your review" : "Rate this seller"}
          </p>
          <StarRating rating={newRating} onRate={setNewRating} interactive />
          <Textarea
            placeholder="Share your experience (optional)"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            maxLength={1000}
            className="resize-none"
            rows={3}
          />
          <div className="flex gap-2">
            <Button onClick={handleSubmit} disabled={submitting || newRating === 0} size="sm">
              <Send className="w-4 h-4 mr-1" />
              {userReview ? "Update" : "Submit"}
            </Button>
            {userReview && (
              <Button onClick={handleDelete} variant="destructive" size="sm">
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>

        <Separator />

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : reviews.length === 0 ? (
          <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>
        ) : (
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
            {reviews.map((review) => (
              <div key={review.id} className="flex gap-3">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {review.reviewer_name?.charAt(0)?.toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm">{review.reviewer_name}</span>
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(review.created_at), "MMM d, yyyy")}
                    </span>
                  </div>
                  {review.review_text && (
                    <p className="text-sm text-muted-foreground mt-1">{review.review_text}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SellerReviewDialog;
