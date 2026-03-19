import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wallet, CreditCard, Smartphone } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const GATEWAY_LABELS: Record<string, { label: string; icon: React.ReactNode }> = {
  iotec: { label: "Iotec Pay", icon: <CreditCard className="h-4 w-4" /> },
  mtn_momo: { label: "MTN MoMo", icon: <Smartphone className="h-4 w-4" /> },
  airtel_money: { label: "Airtel Money", icon: <Smartphone className="h-4 w-4" /> },
};

export default function PaymentGateways() {
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<Record<string, any>>({});

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const { data, error } = await supabase
      .from("payment_gateway_settings" as any)
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSettings(data);
      // Fetch profiles for all user_ids
      const userIds = [...new Set((data as any[]).map((s: any) => s.user_id))];
      if (userIds.length > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", userIds);
        if (profs) {
          const map: Record<string, any> = {};
          profs.forEach((p: any) => { map[p.id] = p; });
          setProfiles(map);
        }
      }
    }
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Wallet className="h-6 w-6 text-primary" />
        <div>
          <h2 className="text-2xl font-bold">Payment Gateways</h2>
          <p className="text-muted-foreground text-sm">
            Overview of all partner payment gateway configurations
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{settings.length}</div>
            <p className="text-sm text-muted-foreground">Total Configurations</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{settings.filter((s: any) => s.is_active).length}</div>
            <p className="text-sm text-muted-foreground">Active Gateways</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-3xl font-bold">{new Set(settings.map((s: any) => s.user_id)).size}</div>
            <p className="text-sm text-muted-foreground">Partners Configured</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Gateway Configurations</CardTitle>
        </CardHeader>
        <CardContent>
          {settings.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No payment gateways configured by partners yet
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Partner</TableHead>
                  <TableHead>Gateway</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {settings.map((setting: any) => {
                  const gw = GATEWAY_LABELS[setting.gateway_type] || { label: setting.gateway_type, icon: null };
                  const profile = profiles[setting.user_id];
                  return (
                    <TableRow key={setting.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{profile?.full_name || "Unknown"}</div>
                          <div className="text-xs text-muted-foreground">{profile?.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {gw.icon}
                          <span>{gw.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{setting.currency}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={setting.is_active ? "default" : "secondary"}>
                          {setting.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(setting.updated_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
