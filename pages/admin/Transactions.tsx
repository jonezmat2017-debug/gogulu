import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Eye, RefreshCw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  payment_method: string;
  shipping_address: string;
  phone: string;
  notes: string | null;
  buyer_id: string;
  buyer_name?: string;
  items?: OrderItem[];
}

interface OrderItem {
  id: string;
  quantity: number;
  price_at_purchase: number;
  product_id: string;
  product_title?: string;
  seller_name?: string;
}

export default function Transactions() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data: ordersData, error } = await supabase
        .from("orders")
        .select(`
          *,
          profiles!orders_buyer_id_fkey(full_name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const ordersWithBuyers = ordersData.map((order: any) => ({
        ...order,
        buyer_name: order.profiles?.full_name || "Unknown",
      }));

      setOrders(ordersWithBuyers);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId: string) => {
    try {
      const { data: itemsData } = await supabase
        .from("order_items")
        .select(`
          *,
          products(title),
          profiles!order_items_seller_id_fkey(full_name)
        `)
        .eq("order_id", orderId);

      const items = itemsData?.map((item: any) => ({
        ...item,
        product_title: item.products?.title || "Unknown Product",
        seller_name: item.profiles?.full_name || "Unknown Seller",
      }));

      const order = orders.find((o) => o.id === orderId);
      if (order) {
        setSelectedOrder({ ...order, items });
        setDetailsOpen(true);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      pending: "secondary",
      processing: "default",
      shipped: "default",
      delivered: "default",
      cancelled: "destructive",
    };
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const filterOrdersByStatus = (status: string | null) => {
    if (!status) return orders;
    return orders.filter((order) => order.status === status);
  };

  const OrdersTable = ({ data }: { data: Order[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Buyer</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Payment</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-muted-foreground">
              No orders found
            </TableCell>
          </TableRow>
        ) : (
          data.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}...</TableCell>
              <TableCell>{format(new Date(order.created_at), "MMM dd, yyyy")}</TableCell>
              <TableCell>{order.buyer_name}</TableCell>
              <TableCell className="font-semibold">UGX {Number(order.total_amount).toLocaleString()}</TableCell>
              <TableCell className="capitalize">{order.payment_method.replace("_", " ")}</TableCell>
              <TableCell>{getStatusBadge(order.status)}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fetchOrderDetails(order.id)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading transactions...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transaction Monitoring</h1>
          <p className="text-muted-foreground">View and monitor all marketplace transactions</p>
        </div>
        <Button onClick={fetchOrders} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filterOrdersByStatus("pending").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filterOrdersByStatus("processing").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Delivered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filterOrdersByStatus("delivered").length}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Transactions</CardTitle>
              <CardDescription>Complete list of all orders</CardDescription>
            </CardHeader>
            <CardContent>
              <OrdersTable data={orders} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Orders</CardTitle>
              <CardDescription>Orders awaiting processing</CardDescription>
            </CardHeader>
            <CardContent>
              <OrdersTable data={filterOrdersByStatus("pending")} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="processing">
          <Card>
            <CardHeader>
              <CardTitle>Processing Orders</CardTitle>
              <CardDescription>Orders currently being processed</CardDescription>
            </CardHeader>
            <CardContent>
              <OrdersTable data={filterOrdersByStatus("processing")} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivered">
          <Card>
            <CardHeader>
              <CardTitle>Delivered Orders</CardTitle>
              <CardDescription>Successfully completed orders</CardDescription>
            </CardHeader>
            <CardContent>
              <OrdersTable data={filterOrdersByStatus("delivered")} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cancelled">
          <Card>
            <CardHeader>
              <CardTitle>Cancelled Orders</CardTitle>
              <CardDescription>Orders that were cancelled</CardDescription>
            </CardHeader>
            <CardContent>
              <OrdersTable data={filterOrdersByStatus("cancelled")} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>Complete information about this order</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Order ID</p>
                  <p className="text-sm text-muted-foreground font-mono">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedOrder.created_at), "PPP")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Buyer</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.buyer_name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <div>
                  <p className="text-sm font-medium">Payment Method</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {selectedOrder.payment_method.replace("_", " ")}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Total Amount</p>
                  <p className="text-sm font-semibold">
                    UGX {Number(selectedOrder.total_amount).toLocaleString()}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm font-medium">Shipping Address</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.shipping_address}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Phone</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.phone}</p>
                </div>
                {selectedOrder.notes && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium">Notes</p>
                    <p className="text-sm text-muted-foreground">{selectedOrder.notes}</p>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Order Items</p>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Subtotal</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.product_title}</TableCell>
                        <TableCell>{item.seller_name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>UGX {Number(item.price_at_purchase).toLocaleString()}</TableCell>
                        <TableCell className="font-semibold">
                          UGX {(item.quantity * Number(item.price_at_purchase)).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
