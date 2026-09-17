"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

export default function AdminWithdrawalsPage() {
  const [withdrawals] = useState<any[]>([]);

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
            <h3 className="text-2xl font-bold text-primary">0</h3>
            <p className="text-xs text-muted-foreground mt-1">Total: ₦0.00</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Processing</p>
            <h3 className="text-2xl font-bold text-amber-500">0</h3>
            <p className="text-xs text-muted-foreground mt-1">Total: ₦0.00</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-muted-foreground mb-1">Paid Out</p>
            <h3 className="text-2xl font-bold text-emerald-500">0</h3>
            <p className="text-xs text-muted-foreground mt-1">Total: ₦0.00</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b border-border/50">
          <CardTitle>Recent Requests</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {withdrawals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-center text-muted-foreground">
              <Clock className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-sm font-medium">No withdrawal requests found</p>
              <p className="text-xs text-muted-foreground max-w-xs">
                When users or sellers request balance payouts, they will be listed here for approval.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>User / Store</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((w) => (
                  <TableRow key={w.id}>
                    <TableCell className="font-mono text-xs">{w.id}</TableCell>
                    <TableCell>{w.user}</TableCell>
                    <TableCell>{w.type}</TableCell>
                    <TableCell>{w.bank}</TableCell>
                    <TableCell className="font-bold">{w.amount}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{w.status}</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
