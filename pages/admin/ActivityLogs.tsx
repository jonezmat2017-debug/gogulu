import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Activity, ShoppingCart, Store, User, Package } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface LogEntry {
  id: string;
  actor_id: string | null;
  actor_name: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  details: any;
  created_at: string;
}

const iconMap: Record<string, any> = {
  order: ShoppingCart,
  venue_order: Store,
  user: User,
  product: Package,
};

const colorMap: Record<string, string> = {
  order_placed: "bg-primary/10 text-primary",
  venue_order_placed: "bg-primary/10 text-primary",
  order_approved: "bg-green-500/10 text-green-600",
  order_rejected: "bg-destructive/10 text-destructive",
  user_signup: "bg-blue-500/10 text-blue-600",
  product_listed: "bg-amber-500/10 text-amber-600",
  venue_created: "bg-purple-500/10 text-purple-600",
};

export default function ActivityLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const { data } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);
      if (data) setLogs(data as unknown as LogEntry[]);
      setIsLoading(false);
    };
    fetchLogs();

    // Realtime
    const channel = supabase
      .channel("admin-activity-logs")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity_logs" },
        (payload) => {
          setLogs((prev) => [payload.new as unknown as LogEntry, ...prev].slice(0, 100));
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

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
        <h1 className="text-3xl font-bold">Activity Logs</h1>
        <p className="text-muted-foreground">Real-time log of all app activity</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Recent Activity ({logs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No activity yet</p>
          ) : (
            <div className="space-y-1">
              {logs.map((log) => {
                const Icon = iconMap[log.entity_type] || Activity;
                const badgeClass = colorMap[log.action] || "bg-muted text-muted-foreground";

                return (
                  <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                    <div className={`p-2 rounded-lg ${badgeClass}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{log.actor_name || "System"}</span>
                        <Badge variant="outline" className="text-[10px] h-5">
                          {log.action.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {log.details?.description || `${log.action} on ${log.entity_type}`}
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
