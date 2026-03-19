import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Trash2, AlertTriangle, MessageSquare, Store, Building2 } from "lucide-react";
import { format } from "date-fns";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface VenueReview {
  id: string;
  venue_id: string;
  reviewer_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  venue_name?: string;
  reviewer_name?: string;
}

interface SellerReview {
  id: string;
  seller_id: string;
  reviewer_id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  seller_name?: string;
  reviewer_name?: string;
}

const StarDisplay = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        className={`w-4 h-4 ${s <= rating ? "fill-accent text-accent" : "text-muted-foreground/30"}`}
      />
    ))}
  </div>
);

export default function ReviewModeration() {
  const { toast } = useToast();
  const [venueReviews, setVenueReviews] = useState<VenueReview[]>([]);
  const [sellerReviews, setSellerReviews] = useState<SellerReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchVenueReviews(), fetchSellerReviews()]);
    setLoading(false);
  };

  const fetchVenueReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("venue_reviews")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      // Enrich with names
      const venueIds = [...new Set(data?.map((r) => r.venue_id) || [])];
      const reviewerIds = [...new Set(data?.map((r) => r.reviewer_id) || [])];

      const [venuesRes, profilesRes] = await Promise.all([
        venueIds.length > 0
          ? supabase.from("venues").select("id, name").in("id", venueIds)
          : { data: [] },
        reviewerIds.length > 0
          ? supabase.from("profiles").select("id, full_name").in("id", reviewerIds)
          : { data: [] },
      ]);

      const venueMap: Record<string, string> = {};
      venuesRes.data?.forEach((v: any) => { venueMap[v.id] = v.name; });
      const profileMap: Record<string, string> = {};
      profilesRes.data?.forEach((p: any) => { profileMap[p.id] = p.full_name; });

      setVenueReviews(
        (data || []).map((r) => ({
          ...r,
          venue_name: venueMap[r.venue_id] || "Unknown Venue",
          reviewer_name: profileMap[r.reviewer_id] || "Unknown User",
        }))
      );
    } catch (err) {
      console.error("Error fetching venue reviews:", err);
    }
  };

  const fetchSellerReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("seller_ratings")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;

      const sellerIds = [...new Set(data?.map((r) => r.seller_id) || [])];
      const reviewerIds = [...new Set(data?.map((r) => r.reviewer_id) || [])];
      const allIds = [...new Set([...sellerIds, ...reviewerIds])];

      const { data: profiles } = allIds.length > 0
        ? await supabase.from("profiles").select("id, full_name").in("id", allIds)
        : { data: [] };

      const profileMap: Record<string, string> = {};
      profiles?.forEach((p: any) => { profileMap[p.id] = p.full_name; });

      setSellerReviews(
        (data || []).map((r) => ({
          ...r,
          seller_name: profileMap[r.seller_id] || "Unknown Seller",
          reviewer_name: profileMap[r.reviewer_id] || "Unknown User",
        }))
      );
    } catch (err) {
      console.error("Error fetching seller reviews:", err);
    }
  };

  const deleteVenueReview = async (id: string) => {
    try {
      const { error } = await supabase.from("venue_reviews").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Venue review removed" });
      setVenueReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to delete", description: err.message });
    }
  };

  const deleteSellerReview = async (id: string) => {
    try {
      const { error } = await supabase.from("seller_ratings").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Seller review removed" });
      setSellerReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      toast({ variant: "destructive", title: "Failed to delete", description: err.message });
    }
  };

  const ReviewCard = ({
    review,
    type,
    targetName,
    onDelete,
  }: {
    review: { id: string; rating: number; review_text: string | null; created_at: string; reviewer_name?: string };
    type: "venue" | "seller";
    targetName: string;
    onDelete: (id: string) => void;
  }) => (
    <Card className="border-border">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs">
                {type === "venue" ? <Building2 className="w-3 h-3 mr-1" /> : <Store className="w-3 h-3 mr-1" />}
                {targetName}
              </Badge>
              <StarDisplay rating={review.rating} />
              <span className="text-xs text-muted-foreground">
                {format(new Date(review.created_at), "MMM d, yyyy")}
              </span>
            </div>
            <p className="text-sm font-medium">by {review.reviewer_name}</p>
            {review.review_text ? (
              <p className="text-sm text-muted-foreground">{review.review_text}</p>
            ) : (
              <p className="text-xs text-muted-foreground italic">No text provided</p>
            )}
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon" className="flex-shrink-0">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove this review?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this review and update the {type}'s rating. This cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDelete(review.id)}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <MessageSquare className="w-8 h-8" />
          Review Moderation
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor and manage reviews across venues and sellers
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{venueReviews.length + sellerReviews.length}</p>
            <p className="text-xs text-muted-foreground">Total Reviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{venueReviews.length}</p>
            <p className="text-xs text-muted-foreground">Venue Reviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{sellerReviews.length}</p>
            <p className="text-xs text-muted-foreground">Seller Reviews</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-destructive">
              {[...venueReviews, ...sellerReviews].filter((r) => r.rating <= 2).length}
            </p>
            <p className="text-xs text-muted-foreground">Low Ratings (≤2★)</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All Reviews</TabsTrigger>
          <TabsTrigger value="venues">Venue Reviews</TabsTrigger>
          <TabsTrigger value="sellers">Seller Reviews</TabsTrigger>
          <TabsTrigger value="flagged" className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Low Ratings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3 mt-4">
          {loading ? (
            <p className="text-muted-foreground">Loading...</p>
          ) : (
            [...venueReviews.map((r) => ({ ...r, _type: "venue" as const, _target: r.venue_name! })),
             ...sellerReviews.map((r) => ({ ...r, _type: "seller" as const, _target: r.seller_name! }))]
              .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
              .map((r) => (
                <ReviewCard
                  key={r.id}
                  review={r}
                  type={r._type}
                  targetName={r._target}
                  onDelete={r._type === "venue" ? deleteVenueReview : deleteSellerReview}
                />
              ))
          )}
          {!loading && venueReviews.length + sellerReviews.length === 0 && (
            <p className="text-muted-foreground text-center py-8">No reviews yet</p>
          )}
        </TabsContent>

        <TabsContent value="venues" className="space-y-3 mt-4">
          {venueReviews.map((r) => (
            <ReviewCard key={r.id} review={r} type="venue" targetName={r.venue_name!} onDelete={deleteVenueReview} />
          ))}
          {venueReviews.length === 0 && <p className="text-muted-foreground text-center py-8">No venue reviews</p>}
        </TabsContent>

        <TabsContent value="sellers" className="space-y-3 mt-4">
          {sellerReviews.map((r) => (
            <ReviewCard key={r.id} review={r} type="seller" targetName={r.seller_name!} onDelete={deleteSellerReview} />
          ))}
          {sellerReviews.length === 0 && <p className="text-muted-foreground text-center py-8">No seller reviews</p>}
        </TabsContent>

        <TabsContent value="flagged" className="space-y-3 mt-4">
          {[...venueReviews.filter((r) => r.rating <= 2).map((r) => ({ ...r, _type: "venue" as const, _target: r.venue_name! })),
           ...sellerReviews.filter((r) => r.rating <= 2).map((r) => ({ ...r, _type: "seller" as const, _target: r.seller_name! }))]
            .sort((a, b) => a.rating - b.rating)
            .map((r) => (
              <ReviewCard key={r.id} review={r} type={r._type} targetName={r._target} onDelete={r._type === "venue" ? deleteVenueReview : deleteSellerReview} />
            ))}
          {[...venueReviews, ...sellerReviews].filter((r) => r.rating <= 2).length === 0 && (
            <p className="text-muted-foreground text-center py-8">No low-rated reviews 🎉</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
