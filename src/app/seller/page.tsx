import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownRight, Package, ShoppingBag, Wallet, TrendingUp } from "lucide-react";

export default function SellerDashboard() {
  const recentOrders = [
    { id: "ORD-9912", product: "USA Travel eSIM 10GB", customer: "user@example.com", date: "10 mins ago", status: "Delivered", amount: "₦12,500" },
    { id: "ORD-9911", product: "Europe Travel eSIM 20GB", customer: "john@doe.com", date: "45 mins ago", status: "Delivered", amount: "₦22,000" },
    { id: "ORD-9910", product: "Asia Travel eSIM 5GB", customer: "sarah@smith.com", date: "2 hours ago", status: "Delivered", amount: "₦8,500" },
    { id: "ORD-9909", product: "USA Travel eSIM 10GB", customer: "mike@jones.com", date: "3 hours ago", status: "Pending", amount: "₦12,500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">Store Overview</h1>
        <p className="text-muted-foreground">Monitor your store's performance and recent activity.</p>
      </div>

      {/* Metrics */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Wallet className="h-5 w-5 text-orange-500" />
              </div>
              <Badge variant="success" className="bg-success/10 text-success border-0">+14%</Badge>
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Sales Today</p>
            <h3 className="text-2xl font-bold">₦84,200</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <ShoppingBag className="h-5 w-5 text-blue-500" />
              </div>
              <Badge variant="success" className="bg-success/10 text-success border-0">+5%</Badge>
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Orders Today</p>
            <h3 className="text-2xl font-bold">12</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Package className="h-5 w-5 text-purple-500" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Active Products</p>
            <h3 className="text-2xl font-bold">24</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Available Payout</p>
            <h3 className="text-2xl font-bold">₦450,000</h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
              <CardTitle className="text-lg">Recent Orders</CardTitle>
              <Button variant="outline" size="sm">View All</Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium text-xs text-muted-foreground">{order.id}</TableCell>
                      <TableCell className="font-medium">{order.product}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{order.date}</TableCell>
                      <TableCell>
                        <Badge variant={order.status === 'Delivered' ? 'success' : 'warning'} className="text-[10px]">
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">{order.amount}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="border-b border-border/50 pb-4">
              <CardTitle className="text-lg">Top Products</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40">
                {[
                  { name: "USA Travel eSIM 10GB", sales: 145, revenue: "₦1,812,500" },
                  { name: "Europe Travel eSIM 20GB", sales: 89, revenue: "₦1,958,000" },
                  { name: "Global eSIM 5GB", sales: 56, revenue: "₦840,000" },
                ].map((item, i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.sales} sales</p>
                    </div>
                    <p className="font-semibold text-sm">{item.revenue}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
