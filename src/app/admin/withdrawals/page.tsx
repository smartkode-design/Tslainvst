import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X } from "lucide-react";

export default function AdminWithdrawalsPage() {
  const withdrawals = [
    { id: "WD-9912", user: "GlobalSim", type: "Seller Payout", amount: "₦450,000", bank: "GTBank •••• 1234", date: "10 mins ago", status: "Pending" },
    { id: "WD-9911", user: "Oluwaseun A.", type: "User Withdrawal", amount: "₦25,000", bank: "Access •••• 9876", date: "2 hours ago", status: "Pending" },
    { id: "WD-9910", user: "GameVault", type: "Seller Payout", amount: "₦1,200,000", bank: "Zenith •••• 5555", date: "Yesterday", status: "Processing" },
    { id: "WD-9909", user: "Sarah Smith", type: "User Withdrawal", amount: "₦5,000", bank: "UBA •••• 4321", date: "Sep 11, 2026", status: "Paid" },
    { id: "WD-9908", user: "SuspiciousUser", type: "User Withdrawal", amount: "₦500,000", bank: "Fidelity •••• 0000", date: "Sep 10, 2026", status: "Rejected" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Withdrawal Requests</h1>
          <p className="text-muted-foreground">Review and process user withdrawals and seller payouts.</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Pending Requests</p>
            <h3 className="text-2xl font-bold text-primary">2</h3>
            <p className="text-xs text-muted-foreground mt-1">Total: ₦475,000</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Processing</p>
            <h3 className="text-2xl font-bold text-warning">1</h3>
            <p className="text-xs text-muted-foreground mt-1">Total: ₦1,200,000</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Paid Today</p>
            <h3 className="text-2xl font-bold text-success">0</h3>
            <p className="text-xs text-muted-foreground mt-1">Total: ₦0</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b border-border/50">
          <CardTitle>Recent Requests</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>User / Store</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {withdrawals.map((wd) => (
                <TableRow key={wd.id}>
                  <TableCell className="font-medium text-xs text-muted-foreground">{wd.id}</TableCell>
                  <TableCell className="font-medium">{wd.user}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{wd.type}</TableCell>
                  <TableCell className="text-xs font-medium">{wd.bank}</TableCell>
                  <TableCell className="font-bold">{wd.amount}</TableCell>
                  <TableCell>
                    {wd.status === 'Pending' && <Badge variant="secondary">Pending</Badge>}
                    {wd.status === 'Processing' && <Badge variant="warning">Processing</Badge>}
                    {wd.status === 'Paid' && <Badge variant="success">Paid</Badge>}
                    {wd.status === 'Rejected' && <Badge variant="destructive">Rejected</Badge>}
                  </TableCell>
                  <TableCell className="text-right">
                    {wd.status === 'Pending' ? (
                      <div className="flex justify-end gap-2">
                        <Button size="icon" variant="outline" className="h-8 w-8 text-success hover:bg-success hover:text-white hover:border-success">
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="outline" className="h-8 w-8 text-danger hover:bg-danger hover:text-white hover:border-danger">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button variant="ghost" size="sm" className="h-8">Details</Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
