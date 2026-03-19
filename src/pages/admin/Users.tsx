import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users as UsersIcon, Mail, Phone, Shield, Loader2, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  phone: string | null;
  bio: string | null;
  created_at: string;
  roles: Array<{
    id: string;
    role: string;
    approved: boolean;
  }>;
}

interface RoleUpdate {
  role: 'admin' | 'seller' | 'venue_owner' | 'buyer';
  approved: boolean;
}

export default function Users() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [roleUpdates, setRoleUpdates] = useState<RoleUpdate[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user: currentUser } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all user roles
      const { data: rolesData, error: rolesError } = await supabase
        .from("user_roles")
        .select("id, user_id, role, approved");

      if (rolesError) throw rolesError;

      // Combine data
      const usersWithRoles = (profilesData || []).map(profile => ({
        ...profile,
        roles: (rolesData || []).filter(r => r.user_id === profile.id),
      }));

      setUsers(usersWithRoles);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to load users",
      });
    } finally {
      setLoading(false);
    }
  };

  const openRoleDialog = (user: UserProfile) => {
    setSelectedUser(user);
    // Initialize with existing roles
    const existingRoles: RoleUpdate[] = user.roles.map(r => ({
      role: r.role as any,
      approved: r.approved,
    }));
    setRoleUpdates(existingRoles);
  };

  const toggleRole = (role: 'admin' | 'seller' | 'venue_owner' | 'buyer') => {
    const existingIndex = roleUpdates.findIndex(r => r.role === role);
    if (existingIndex >= 0) {
      setRoleUpdates(roleUpdates.filter((_, i) => i !== existingIndex));
    } else {
      setRoleUpdates([...roleUpdates, { role, approved: true }]);
    }
  };

  const hasRole = (role: string) => {
    return roleUpdates.some(r => r.role === role);
  };

  const updateRoleApproval = (role: string, approved: boolean) => {
    setRoleUpdates(roleUpdates.map(r => 
      r.role === role ? { ...r, approved } : r
    ));
  };

  const handleSaveRoles = async () => {
    if (!selectedUser || !currentUser) return;

    setIsUpdating(true);
    try {
      // Get existing roles
      const existingRoles = selectedUser.roles;

      // Delete roles that are no longer present
      const rolesToDelete = existingRoles.filter(
        er => !roleUpdates.some(ru => ru.role === er.role)
      );

      for (const role of rolesToDelete) {
        const { error } = await supabase
          .from("user_roles")
          .delete()
          .eq("id", role.id);

        if (error) throw error;
      }

      // Update or insert roles
      for (const roleUpdate of roleUpdates) {
        const existing = existingRoles.find(er => er.role === roleUpdate.role);

        if (existing) {
          // Update existing role
          const { error } = await supabase
            .from("user_roles")
            .update({
              approved: roleUpdate.approved,
              approved_by: currentUser.id,
              approved_at: new Date().toISOString(),
            })
            .eq("id", existing.id);

          if (error) throw error;
        } else {
          // Insert new role
          const { error } = await supabase
            .from("user_roles")
            .insert({
              user_id: selectedUser.id,
              role: roleUpdate.role,
              approved: roleUpdate.approved,
              approved_by: currentUser.id,
              approved_at: new Date().toISOString(),
            });

          if (error) throw error;
        }
      }

      toast({
        title: "Success",
        description: "User roles updated successfully",
      });

      setSelectedUser(null);
      fetchUsers();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update roles",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts and role assignments
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="h-5 w-5" />
              All Users ({users.length})
            </CardTitle>
            <CardDescription>
              View and manage user roles and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>
                        {user.full_name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{user.full_name}</div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {user.email}
                        </span>
                        {user.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {user.phone}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2 mt-2">
                        {user.roles.length === 0 ? (
                          <Badge variant="outline">No roles</Badge>
                        ) : (
                          user.roles.map((role) => (
                            <Badge
                              key={role.id}
                              variant={role.approved ? "default" : "secondary"}
                            >
                              {role.role}
                              {!role.approved && " (pending)"}
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => openRoleDialog(user)}
                    size="sm"
                    variant="outline"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Manage Roles
                  </Button>
                </div>
              ))}

              {users.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No users found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Manage User Roles</DialogTitle>
            <DialogDescription>
              {selectedUser && (
                <>
                  Assign roles and permissions for{" "}
                  <strong>{selectedUser.full_name}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {(['admin', 'seller', 'venue_owner', 'buyer'] as const).map((role) => (
              <div key={role} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={role}
                    checked={hasRole(role)}
                    onCheckedChange={() => toggleRole(role)}
                  />
                  <Label htmlFor={role} className="flex-1 cursor-pointer capitalize">
                    {role.replace('_', ' ')}
                  </Label>
                </div>
                {hasRole(role) && (
                  <div className="ml-6 space-y-2">
                    <Label className="text-sm text-muted-foreground">Status</Label>
                    <Select
                      value={roleUpdates.find(r => r.role === role)?.approved ? "approved" : "pending"}
                      onValueChange={(value) => updateRoleApproval(role, value === "approved")}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            ))}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSelectedUser(null)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveRoles} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
