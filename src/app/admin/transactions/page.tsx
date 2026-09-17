"use client";

import { useState, useEffect } from "react";
import { 
  CreditCard, Search, RefreshCw, CheckCircle2, 
  ArrowDownLeft, ArrowUpRight, RotateCcw, DollarSign, 
  ArrowDownToLine, ArrowUpFromLine, ShoppingBag 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminTransactionItem } from "@/app/api/admin/transactions/route";

function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<AdminTransactionItem[]>([]);
  const [stats, setStats] = useState({
    totalCount: 0,
    totalInflow: 0,
    totalOutflow: 0,
    netFlow: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/transactions?type=${typeFilter}`);
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load transactions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter]);

  const filteredTxns = transactions.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.reference.toLowerCase().includes(q) ||
      t.customerName.toLowerCase().includes(q) ||
      t.customerEmail.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q)
    );
  });

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "deposit":
        return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">Deposit</Badge>;
      case "purchase":
        return <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30">Purchase</Badge>;
      case "refund":
        return <Badge className="bg-purple-500/15 text-purple-600 border-purple-500/30">Refund</Badge>;
      case "withdrawal":
        return <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30">Withdrawal</Badge>;
      case "bonus":
        return <Badge className="bg-indigo-500/15 text-indigo-600 border-indigo-500/30">Bonus</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1 flex items-center gap-2.5">
            <CreditCard className="h-6 w-6 text-primary" />
            Master Financial Ledger
          </h1>
          <p className="text-muted-foreground text-sm">
            Comprehensive audit trail of all customer wallet debits, credits, purchases, refunds, and payvessel deposits.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchTransactions} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Ledger Entries</span>
              <CreditCard className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-black">{stats.totalCount}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Direct database audits</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Gross Deposits</span>
              <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-500">₦{formatNaira(stats.totalInflow)}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Total platform inflow</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Gross Purchases</span>
              <ArrowUpRight className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-black text-indigo-500">₦{formatNaira(stats.totalOutflow)}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Spent by users on services</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Net Cash Position</span>
              <DollarSign className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-500">₦{formatNaira(stats.netFlow)}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Inflow minus outflow</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reference, description, customer..."
            className="pl-9 h-10 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Type Filter Tabs */}
        <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
          {["all", "deposit", "purchase", "refund", "withdrawal"].map((tab) => (
            <button
              key={tab}
              onClick={() => setTypeFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                typeFilter === tab
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Table Card */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              <span>Querying live transaction records...</span>
            </div>
          ) : filteredTxns.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <CreditCard className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="font-semibold text-sm">No transaction records found</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Every wallet top-up, service payment, or refund will be permanently audited here.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Reference & Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description / Audit Reason</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTxns.map((t) => (
                  <TableRow key={t.id} className="hover:bg-muted/40">
                    <TableCell>
                      <div>
                        <code className="text-xs font-mono font-bold text-foreground">{t.reference}</code>
                        <div className="text-[11px] text-muted-foreground">
                          {new Date(t.createdAt).toLocaleDateString("en-NG", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-semibold text-xs text-foreground">{t.customerName}</div>
                        <div className="text-[11px] text-muted-foreground">{t.customerEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(t.type)}</TableCell>
                    <TableCell>
                      <span
                        className={`font-black text-sm ${
                          t.type === "deposit" || t.type === "refund" || t.type === "bonus"
                            ? "text-emerald-500"
                            : "text-foreground"
                        }`}
                      >
                        {t.type === "deposit" || t.type === "refund" || t.type === "bonus" ? "+" : "-"}
                        ₦{formatNaira(t.amount)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                        {t.description}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-[11px] ${
                          t.status === "completed"
                            ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                            : t.status === "pending"
                            ? "bg-amber-500/15 text-amber-600 border-amber-500/30"
                            : "bg-red-500/15 text-red-600 border-red-500/30"
                        }`}
                      >
                        {t.status}
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
