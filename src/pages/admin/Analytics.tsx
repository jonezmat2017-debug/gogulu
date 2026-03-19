import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Users, ShoppingCart, DollarSign } from "lucide-react";
import { format, subDays } from "date-fns";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface SignupData {
  date: string;
  count: number;
}

interface TransactionData {
  date: string;
  total: number;
  count: number;
}

interface Stats {
  totalUsers: number;
  newUsersToday: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
}

export default function Analytics() {
  const [signupData, setSignupData] = useState<SignupData[]>([]);
  const [transactionData, setTransactionData] = useState<TransactionData[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    newUsersToday: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // Fetch overall stats
      const { data: profiles } = await supabase.from("profiles").select("created_at");
      const { data: orders } = await supabase.from("orders").select("created_at, total_amount, status");

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const newUsersToday = profiles?.filter(
        (p) => new Date(p.created_at) >= today
      ).length || 0;

      const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;
      const pendingOrders = orders?.filter((o) => o.status === "pending").length || 0;

      setStats({
        totalUsers: profiles?.length || 0,
        newUsersToday,
        totalOrders: orders?.length || 0,
        totalRevenue,
        pendingOrders,
      });

      // Generate signup data for last 7 days
      const signupsByDay: Record<string, number> = {};
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        const dateStr = format(date, "yyyy-MM-dd");
        signupsByDay[dateStr] = 0;
        return dateStr;
      });

      profiles?.forEach((profile) => {
        const dateStr = format(new Date(profile.created_at), "yyyy-MM-dd");
        if (signupsByDay[dateStr] !== undefined) {
          signupsByDay[dateStr]++;
        }
      });

      const signupChartData = last7Days.map((date) => ({
        date: format(new Date(date), "MMM dd"),
        count: signupsByDay[date],
      }));
      setSignupData(signupChartData);

      // Generate transaction data for last 7 days
      const transactionsByDay: Record<string, { total: number; count: number }> = {};
      last7Days.forEach((date) => {
        transactionsByDay[date] = { total: 0, count: 0 };
      });

      orders?.forEach((order) => {
        const dateStr = format(new Date(order.created_at), "yyyy-MM-dd");
        if (transactionsByDay[dateStr]) {
          transactionsByDay[dateStr].total += Number(order.total_amount);
          transactionsByDay[dateStr].count++;
        }
      });

      const transactionChartData = last7Days.map((date) => ({
        date: format(new Date(date), "MMM dd"),
        total: transactionsByDay[date].total,
        count: transactionsByDay[date].count,
      }));
      setTransactionData(transactionChartData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-lg">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Monitor signups, transactions, and user activity</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">+{stats.newUsersToday} today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">{stats.pendingOrders} pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">UGX {stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              UGX {stats.totalOrders ? Math.round(stats.totalRevenue / stats.totalOrders).toLocaleString() : 0}
            </div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="signups" className="space-y-4">
        <TabsList>
          <TabsTrigger value="signups">User Signups</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="signups" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Signups (Last 7 Days)</CardTitle>
              <CardDescription>Daily new user registrations</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={signupData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="New Users"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction Volume (Last 7 Days)</CardTitle>
              <CardDescription>Daily order count and revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={transactionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="count" fill="hsl(var(--primary))" name="Order Count" />
                  <Bar yAxisId="right" dataKey="total" fill="hsl(var(--accent))" name="Revenue (UGX)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
