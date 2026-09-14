import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, ShieldAlert, MoreHorizontal } from "lucide-react";

export default function AdminUsersPage() {
  const users = [
    { id: "USR-001", name: "Oluwaseun A.", email: "olu@example.com", balance: "₦248,500.00", status: "Active", joined: "Jan 12, 2026" },
    { id: "USR-002", name: "Sarah Smith", email: "sarah@example.com", balance: "₦12,000.00", status: "Active", joined: "Feb 04, 2026" },
    { id: "USR-003", name: "Michael Johnson", email: "mj@example.com", balance: "₦0.00", status: "Suspended", joined: "Mar 15, 2026" },
    { id: "USR-004", name: "David O.", email: "david@tsla.com", balance: "₦1,450,000.00", status: "Active", joined: "Dec 01, 2025" },
    { id: "USR-005", name: "Emeka U.", email: "emeka@example.com", balance: "₦45,200.00", status: "Pending KYC", joined: "Sep 10, 2026" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">User Management</h1>
          <p className="text-muted-foreground">Manage users, view balances, and handle account statuses.</p>
        </div>
        <Button className="bg-slate-900 text-white dark:bg-white dark:text-black">
          Export Users
        </Button>
      </div>

      <Card>
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex gap-4 items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users by name, email, or ID..." className="pl-9 h-9" />
            </div>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Filter className="h-4 w-4 mr-2" /> Filters
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User ID</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Wallet Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium text-xs text-muted-foreground">{user.id}</TableCell>
                  <TableCell>
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </TableCell>
                  <TableCell className="font-semibold">{user.balance}</TableCell>
                  <TableCell>
                    {user.status === 'Active' && <Badge variant="success" className="bg-success/10 text-success border-0 hover:bg-success/20">Active</Badge>}
                    {user.status === 'Suspended' && <Badge variant="destructive" className="bg-danger/10 text-danger border-0 hover:bg-danger/20">Suspended</Badge>}
                    {user.status === 'Pending KYC' && <Badge variant="warning" className="bg-warning/10 text-warning-foreground border-0 hover:bg-warning/20">Pending KYC</Badge>}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{user.joined}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8">View</Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 ml-1">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Manual Wallet Adjustment Mock View */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-warning" />
          Critical Actions
        </h2>
        <Card className="border-danger/20 bg-danger/5">
          <CardHeader>
            <CardTitle className="text-danger">Manual Balance Adjustment</CardTitle>
            <CardDescription className="text-danger/80">
              Adjusting a user's wallet balance manually requires an explicit reason and creates a permanent audit log.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-4 max-w-3xl">
              <div className="space-y-2 flex-1">
                <label className="text-sm font-medium">User ID</label>
                <Input placeholder="USR-XXX" className="bg-background" />
              </div>
              <div className="space-y-2 flex-1">
                <label className="text-sm font-medium">Amount</label>
                <Input type="number" placeholder="0.00" className="bg-background" />
              </div>
              <div className="space-y-2 flex-[2]">
                <label className="text-sm font-medium">Reason (Required)</label>
                <Input placeholder="e.g. Refund for failed transaction TRX-8933" className="bg-background" />
              </div>
              <Button variant="destructive">Execute Adjustment</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
