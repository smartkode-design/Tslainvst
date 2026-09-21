"use client";

import { useState, useEffect } from "react";
import { 
  Wallet, Search, RefreshCw, CheckCircle2, AlertCircle, 
  ArrowUpRight, ArrowDownRight, Plus, Minus, X, Save, 
  CreditCard, ShieldCheck, DollarSign, Building 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminWalletItem } from "@/app/api/admin/wallets/route";

function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function AdminWalletsPage() {
  const [wallets, setWallets] = useState<AdminWalletItem[]>([]);
  const [stats, setStats] = useState({
    totalWallets: 0,
    totalFloat: 0,
    highestBalance: 0,
    averageBalance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Adjust Modal states
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<AdminWalletItem | null>(null);
  const [adjustType, setAdjustType] = useState<"credit" | "debit">("credit");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchWallets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/wallets");
      const data = await res.json();
      if (data.success) {
        setWallets(data.wallets || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load wallets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWallet || !adjustAmount || Number(adjustAmount) <= 0) {
      showToast("Please provide a valid amount", "error");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedWallet.userId,
          type: adjustType,
          amount: Number(adjustAmount),
          reason: adjustReason.trim() || `Manual admin ${adjustType}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "Balance adjusted successfully!");
        setShowAdjustModal(false);
        setAdjustAmount("");
        setAdjustReason("");
        fetchWallets();
      } else {
        showToast(data.error || "Adjustment failed", "error");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredWallets = wallets.filter((w) => {
    const q = searchQuery.toLowerCase();
    return (
      w.userName.toLowerCase().includes(q) ||
      w.userEmail.toLowerCase().includes(q) ||
      (w.payvesselAccount && w.payvesselAccount.includes(q)) ||
      w.userId.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1 flex items-center gap-2.5">
            <Wallet className="h-6 w-6 text-primary" />
            Customer Wallets & Float
          </h1>
          <p className="text-muted-foreground text-sm">
            Live database balances, automated Payvessel virtual accounts, and administrative balance adjustment.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchWallets} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => {
              if (wallets.length > 0) {
                setSelectedWallet(wallets[0]);
                setShowAdjustModal(true);
              } else {
                showToast("No wallets available to adjust", "error");
              }
            }}
            className="gap-2"
          >
            <DollarSign className="h-4 w-4" /> Adjust Balance
          </Button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-3 rounded-xl text-sm font-semibold flex items-center justify-between transition-all ${
            notification.type === "success"
              ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
              : "bg-red-500/10 text-red-600 border border-red-500/20"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="opacity-70 hover:opacity-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total User Float</span>
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-500">₦{formatNaira(stats.totalFloat)}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Sum of all customer balances</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Wallets</span>
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-black">{stats.totalWallets}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Registered accounts</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Highest Balance</span>
              <ArrowUpRight className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-black text-indigo-500">₦{formatNaira(stats.highestBalance)}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Peak customer holding</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Average Float</span>
              <CreditCard className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-500">₦{formatNaira(stats.averageBalance)}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Per customer balance</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search customer, email, account #..."
          className="pl-9 h-10 text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Wallets Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              <span>Querying database wallets...</span>
            </div>
          ) : filteredWallets.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Wallet className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="font-semibold text-sm">No wallets found matching query</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Customer</TableHead>
                  <TableHead>Wallet Balance</TableHead>
                  <TableHead>Dedicated Payvessel Account</TableHead>
                  <TableHead>Bank Partner</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWallets.map((wallet) => (
                  <TableRow key={wallet.id} className="hover:bg-muted/40">
                    <TableCell>
                      <div>
                        <div className="font-semibold text-sm text-foreground">{wallet.userName}</div>
                        <div className="text-xs text-muted-foreground">{wallet.userEmail}</div>
                        <div className="text-[10px] font-mono text-muted-foreground/60 mt-0.5">
                          ID: {wallet.userId.slice(0, 8)}...
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-foreground">
                          ₦{formatNaira(wallet.balance)}
                        </span>
                        {wallet.balance > 0 && (
                          <Badge className="bg-emerald-500/15 text-emerald-600 text-[10px] py-0">Funded</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {wallet.payvesselAccount ? (
                        <div>
                          <span className="font-mono font-bold text-xs text-primary">
                            {wallet.payvesselAccount}
                          </span>
                          <div className="text-[11px] text-muted-foreground">
                            {wallet.accountName || "TSLA Dedicated Account"}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Generated upon funding request</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Building className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{wallet.bankName || "Wema Bank"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {new Date(wallet.createdAt).toLocaleDateString("en-NG", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs gap-1"
                        onClick={() => {
                          setSelectedWallet(wallet);
                          setShowAdjustModal(true);
                        }}
                      >
                        Adjust Balance
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* MODAL: MANUAL BALANCE ADJUSTMENT */}
      {showAdjustModal && selectedWallet && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-card border border-border w-full max-w-md max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/60 shrink-0">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-base">Adjust User Balance</h3>
              </div>
              <button onClick={() => setShowAdjustModal(false)} className="text-muted-foreground hover:text-foreground p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustBalance} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
              {/* Prominent Target Customer Banner */}
              <div className="p-3.5 bg-primary/10 rounded-xl border border-primary/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-primary block">Crediting / Debiting</span>
                  <h4 className="font-bold text-sm text-foreground">{selectedWallet.userName}</h4>
                  <p className="text-xs text-muted-foreground">{selectedWallet.userEmail}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-semibold text-muted-foreground block">Current Balance</span>
                  <span className="font-mono font-black text-sm text-primary">₦{formatNaira(selectedWallet.balance)}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Change Selected Customer
                </label>
                <select
                  className="w-full h-10 px-3 rounded-md bg-background border border-input text-sm font-medium"
                  value={selectedWallet.userId}
                  onChange={(e) => {
                    const match = wallets.find((w) => w.userId === e.target.value);
                    if (match) setSelectedWallet(match);
                  }}
                >
                  {wallets.map((w) => (
                    <option key={w.userId} value={w.userId}>
                      {w.userName} ({w.userEmail}) — ₦{formatNaira(w.balance)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Adjustment Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setAdjustType("credit")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                      adjustType === "credit"
                        ? "bg-emerald-500/15 border-emerald-500 text-emerald-600 shadow-xs"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Plus className="h-4 w-4" /> Credit Wallet (+)
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType("debit")}
                    className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                      adjustType === "debit"
                        ? "bg-red-500/15 border-red-500 text-red-600 shadow-xs"
                        : "border-border text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <Minus className="h-4 w-4" /> Debit Wallet (-)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Amount in Naira (₦)
                </label>
                <Input
                  type="number"
                  required
                  min="1"
                  placeholder="e.g. 5000"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Reason / Audit Trail Note
                </label>
                <Input
                  placeholder="e.g. Manual bank deposit confirmation / customer refund"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                />
              </div>

              <div className="p-3 bg-muted/40 rounded-xl text-xs space-y-1 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Current Balance:</span>
                  <span className="font-semibold text-foreground">₦{formatNaira(selectedWallet.balance)}</span>
                </div>
                <div className="flex justify-between">
                  <span>New Balance:</span>
                  <span className="font-bold text-emerald-600">
                    ₦{formatNaira(
                      adjustType === "credit"
                        ? selectedWallet.balance + (Number(adjustAmount) || 0)
                        : Math.max(0, selectedWallet.balance - (Number(adjustAmount) || 0))
                    )}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
                <Button type="button" variant="outline" onClick={() => setShowAdjustModal(false)} disabled={actionLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={actionLoading} className="gap-2">
                  {actionLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Confirm Adjustment
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
