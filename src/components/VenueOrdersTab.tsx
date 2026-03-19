import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, Phone, ShoppingCart, Loader2 } from "lucide-react";

interface VenueOrdersTabProps {
  venueId: string | undefined;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  approved: "bg-green-500/10 text-green-600 border-green-500/20",
  rejected: "bg-destructive/10 text-destructive border-destructive/20",
  completed: "bg-primary/10 text-primary border-primary/20",
  cancelled: "bg-muted text-muted-foreground border-muted",
};

const VenueOrdersTab = ({ venueId }: VenueOrdersTabProps) => {
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<Record<string, any[]>>({});

  useEffect(() => {
    if (venueId) fetchOrders();
  }, [venueId]);

  const fetchOrders = async () => {
    if (!venueId) return;
    const { data, error } = await supabase
      .from("venue_orders" as any)
      .select("*")
      .eq("venue_id", venueId)
      .order("created_at", { ascending: false });

    if (!error && data) setOrders(data as any);
    setLoading(false);
  };

  const fetchOrderItems = async (orderId: string) => {
    if (orderItems[orderId]) return;
    const { data } = await supabase
      .from("venue_order_items" as any)
      .select("*, menu_items:menu_item_id(name, price)")
      .eq("order_id", orderId);

    if (data) {
      setOrderItems((prev) => ({ ...prev, [orderId]: data as any }));
    }
  };

  const toggleExpand = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
      fetchOrderItems(orderId);
    }
  };

  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase
      .from("venue_orders" as any)
      .update({ status })
      .eq("id", orderId);

    if (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update order" });
      return;
    }
    toast({ title: "Order updated", description: `Order ${status}` });
    fetchOrders();
  };

  if (!venueId) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Create a venue first to manage orders
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShoppingCart className="h-5 w-5" />
          Incoming Orders
        </CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No orders yet</p>
            <p className="text-xs mt-1">Orders from customers will appear here</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order: any) => (
                <>
                  <TableRow
                    key={order.id}
                    className="cursor-pointer hover:bg-accent/30"
                    onClick={() => toggleExpand(order.id)}
                  >
                    <TableCell>
                      <div>
                        <span className="font-medium text-sm">{order.customer_name}</span>
                        {order.notes && (
                          <p className="text-[10px] text-muted-foreground truncate max-w-[150px]">
                            {order.notes}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <a
                        href={`tel:${order.customer_phone}`}
                        className="flex items-center gap-1 text-primary text-sm hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Phone className="h-3 w-3" />
                        {order.customer_phone}
                      </a>
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      UGX {Number(order.total_amount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs capitalize ${statusColors[order.status] || ""}`}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {order.status === "pending" && (
                        <div className="flex gap-1 justify-end" onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-green-600"
                            onClick={() => updateStatus(order.id, "approved")}
                          >
                            <Check className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-destructive"
                            onClick={() => updateStatus(order.id, "rejected")}
                          >
                            <X className="h-3 w-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                      {order.status === "approved" && (
                        <div onClick={(e) => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={() => updateStatus(order.id, "completed")}
                          >
                            Mark Completed
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                  {expandedOrder === order.id && (
                    <TableRow key={`${order.id}-items`}>
                      <TableCell colSpan={6} className="bg-muted/30">
                        <div className="py-2 space-y-1">
                          <p className="text-xs font-medium text-muted-foreground mb-2">
                            Order Items:
                          </p>
                          {orderItems[order.id] ? (
                            orderItems[order.id].map((item: any) => (
                              <div
                                key={item.id}
                                className="flex justify-between text-sm"
                              >
                                <span>
                                  {item.quantity}x{" "}
                                  {(item as any).menu_items?.name || "Item"}
                                </span>
                                <span className="text-muted-foreground">
                                  UGX{" "}
                                  {(
                                    item.price_at_order * item.quantity
                                  ).toLocaleString()}
                                </span>
                              </div>
                            ))
                          ) : (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default VenueOrdersTab;
