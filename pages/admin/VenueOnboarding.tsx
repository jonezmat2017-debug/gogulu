import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CheckCircle, XCircle, Clock, Mail, User } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface VenueOwnerRequest {
  id: string;
  user_id: string;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
    avatar_url: string | null;
    bio: string | null;
    phone: string | null;
  };
}

export default function VenueOnboarding() {
  const [requests, setRequests] = useState<VenueOwnerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<VenueOwnerRequest | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      // Fetch pending venue owner role requests
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("id, user_id, created_at")
        .eq("role", "venue_owner")
        .eq("approved", false)
        .order("created_at", { ascending: false });

      if (rolesError) throw rolesError;

      if (!rolesData || rolesData.length === 0) {
        setRequests([]);
        return;
      }

      // Fetch profiles for these users
      const userIds = rolesData.map(r => r.user_id);
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email, avatar_url, bio, phone")
        .in("id", userIds);

      if (profilesError) throw profilesError;

      // Combine the data
      const profilesMap = new Map(
        profilesData?.map(p => [p.id, p]) || []
      );

      const combined = rolesData.map(role => ({
        id: role.id,
        user_id: role.user_id,
        created_at: role.created_at,
        profiles: profilesMap.get(role.user_id) || {
          full_name: "Unknown",
          email: "unknown@email.com",
          avatar_url: null,
          bio: null,
          phone: null,
        },
      }));

      setRequests(combined);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load venue owner requests",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async () => {
    if (!selectedRequest || !actionType || !user) return;

    setActionLoading(true);
    try {
      if (actionType === "approve") {
        const { error } = await supabase
          .from("user_roles")
          .update({
            approved: true,
            approved_by: user.id,
            approved_at: new Date().toISOString(),
          })
          .eq("id", selectedRequest.id);

        if (error) throw error;

        toast({
          title: "Venue owner approved",
          description: `${selectedRequest.profiles.full_name} has been approved as a venue owner`,
        });
      } else {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("id", selectedRequest.id);

        if (error) throw error;

        toast({
          title: "Request rejected",
          description: `Venue owner request from ${selectedRequest.profiles.full_name} has been rejected`,
        });
      }

      fetchPendingRequests();
      setSelectedRequest(null);
      setActionType(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to process request",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const openDialog = (request: VenueOwnerRequest, type: "approve" | "reject") => {
    setSelectedRequest(request);
    setActionType(type);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Venue Owner Onboarding</h2>
          <p className="text-muted-foreground">Loading venue owner requests...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Venue Owner Onboarding</h2>
          <p className="text-muted-foreground">
            Review and approve pending venue owner applications
          </p>
        </div>

        {requests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <CheckCircle className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
              <p className="text-muted-foreground text-center">
                No pending venue owner requests at the moment
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {requests.map((request) => (
              <Card key={request.id} className="overflow-hidden">
                <CardHeader className="bg-muted/50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={request.profiles.avatar_url || undefined} />
                        <AvatarFallback>
                          {request.profiles.full_name.split(" ").map((n) => n[0]).join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-xl">
                          {request.profiles.full_name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <Mail className="w-4 h-4" />
                          {request.profiles.email}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Pending
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {request.profiles.phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Phone:</span>
                        <span className="text-muted-foreground">
                          {request.profiles.phone}
                        </span>
                      </div>
                    )}
                    {request.profiles.bio && (
                      <div className="space-y-1">
                        <span className="text-sm font-medium">Bio:</span>
                        <p className="text-sm text-muted-foreground">
                          {request.profiles.bio}
                        </p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>Applied:</span>
                      <span>{new Date(request.created_at).toLocaleDateString()}</span>
                    </div>

                    <div className="flex gap-3 pt-4 border-t">
                      <Button
                        onClick={() => openDialog(request, "approve")}
                        className="flex-1"
                        size="lg"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Venue Owner
                      </Button>
                      <Button
                        onClick={() => openDialog(request, "reject")}
                        variant="destructive"
                        className="flex-1"
                        size="lg"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject Request
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog
        open={!!selectedRequest && !!actionType}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedRequest(null);
            setActionType(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "approve" ? "Approve Venue Owner" : "Reject Request"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "approve"
                ? `Are you sure you want to approve ${selectedRequest?.profiles.full_name} as a venue owner? They will be able to submit and manage venues on the platform.`
                : `Are you sure you want to reject the venue owner request from ${selectedRequest?.profiles.full_name}? This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleAction}
              disabled={actionLoading}
              className={actionType === "reject" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
            >
              {actionLoading
                ? "Processing..."
                : actionType === "approve"
                ? "Approve"
                : "Reject"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
