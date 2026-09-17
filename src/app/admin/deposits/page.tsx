"use client";

import { useState, useEffect } from "react";
import { 
  ArrowDownToLine, Search, RefreshCw, CheckCircle2, 
  Clock, AlertCircle, Building, DollarSign, ArrowUpRight, 
  CreditCard, ShieldCheck 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminDepositItem } from "@/app/api/admin/deposits/route";

function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function AdminDepositsPage() {
  const [deposits, setDeposits] = useState<AdminDepositItem[]>([]);
  const [stats, setStats] = useState({
    totalDepositsCount: 0,
    totalDepositedAmount: 0,
    successfulCount: 0,
    pendingCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/deposits");
      const data = await res.json();
      if (data.success) {
        setDeposits(data.deposits || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load deposits", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  const filteredDeposits = deposits.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.reference.toLowerCase().includes(q) ||
      d.customerName.toLowerCase().includes(q) ||
      d.customerEmail.toLowerCase().includes(q) ||
      (d.senderName && d.senderName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1 flex items-center gap-2.5">
            <ArrowDownToLine className="h-6 w-6 text-primary" />
            Wallet Funding & Deposits
          </h1>
          <p className="text-muted-foreground text-sm">
            Live audit log of all automated Payvessel bank deposits and manual administrative wallet funding.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchDeposits} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Inflow</span>
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-500">₦{formatNaira(stats.totalDepositedAmount)}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Verified wallet deposits</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Transactions</span>
              <ArrowDownToLine className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-black">{stats.totalDepositsCount}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Direct database deposits</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Successful</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-500">{stats.successfulCount}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Credited to customer balances</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-500">{stats.pendingCount}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Awaiting webhook callback</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search reference, user, or sender..."
          className="pl-9 h-10 text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Table Card */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              <span>Querying live deposit ledger...</span>
            </div>
          ) : filteredDeposits.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <ArrowDownToLine className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="font-semibold text-sm">No deposit transactions found</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                When users fund their wallets via automated Payvessel bank transfer or admin manual credit, entries will appear here.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Reference & Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount Credited</TableHead>
                  <TableHead>Method / Gateway</TableHead>
                  <TableHead>Bank / Channel</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDeposits.map((d) => (
                  <TableRow key={d.id} className="hover:bg-muted/40">
                    <TableCell>
                      <div>
                        <code className="text-xs font-mono font-bold text-foreground">{d.reference}</code>
                        <div className="text-[11px] text-muted-foreground">
                          {new Date(d.createdAt).toLocaleDateString("en-NG", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-semibold text-xs text-foreground">{d.customerName}</div>
                        <div className="text-[11px] text-muted-foreground">{d.customerEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-black text-sm text-emerald-500">
                        +₦{formatNaira(d.amount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {d.paymentMethod}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Building className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{d.bankName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-[11px] ${
                          d.status === "completed"
                            ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                            : d.status === "pending"
                            ? "bg-amber-500/15 text-amber-600 border-amber-500/30"
                            : "bg-red-500/15 text-red-600 border-red-500/30"
                        }`}
                      >
                        {d.status === "completed" ? "Success" : d.status}
                      </Badge>
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
