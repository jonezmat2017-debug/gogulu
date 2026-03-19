import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";

type Venue = Tables<"venues">;

export default function AdminVenues() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchVenues = async () => {
    const { data, error } = await supabase
      .from("venues")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch venues",
        variant: "destructive",
      });
      return;
    }

    setVenues(data || []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const handleApprove = async (venueId: string) => {
    setProcessingId(venueId);
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase
      .from("venues")
      .update({
        approved: true,
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
      })
      .eq("id", venueId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to approve venue",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Venue approved successfully",
      });
      fetchVenues();
    }

    setProcessingId(null);
  };

  const handleReject = async (venueId: string) => {
    setProcessingId(venueId);

    const { error } = await supabase
      .from("venues")
      .delete()
      .eq("id", venueId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to reject venue",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Venue rejected and removed",
      });
      fetchVenues();
    }

    setProcessingId(null);
  };

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
        <h1 className="text-3xl font-bold">Venue Management</h1>
        <p className="text-muted-foreground">Review and approve venue submissions</p>
      </div>

      <div className="grid gap-4">
        {venues.map((venue) => (
          <Card key={venue.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{venue.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{venue.category}</p>
                </div>
                <Badge variant={venue.approved ? "default" : "secondary"}>
                  {venue.approved ? "Approved" : "Pending"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4">
                <p className="text-sm"><strong>Location:</strong> {venue.location}</p>
                <p className="text-sm"><strong>Address:</strong> {venue.address}</p>
                {venue.phone && <p className="text-sm"><strong>Phone:</strong> {venue.phone}</p>}
                {venue.email && <p className="text-sm"><strong>Email:</strong> {venue.email}</p>}
                {venue.description && <p className="text-sm"><strong>Description:</strong> {venue.description}</p>}
              </div>

              {!venue.approved && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleApprove(venue.id)}
                    disabled={processingId === venue.id}
                    size="sm"
                  >
                    {processingId === venue.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleReject(venue.id)}
                    disabled={processingId === venue.id}
                    size="sm"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {venues.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No venues found
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
