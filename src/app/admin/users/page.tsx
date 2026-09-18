"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Loader2, RefreshCw, DollarSign, Plus, Minus, X, CheckCircle2, AlertCircle, Wallet } from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  balance: number;
  joined: string;
}

function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Fund Wallet Modal States
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showFundModal, setShowFundModal] = useState(false);
  const [fundType, setFundType] = useState<"credit" | "debit">("credit");
  const [fundAmount, setFundAmount] = useState<string>("");
  const [fundReason, setFundReason] = useState<string>("");
  const [submittingFund, setSubmittingFund] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      if (data.success && data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Failed to load users", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenFund = (user: AdminUser) => {
    setSelectedUser(user);
    setFundType("credit");
    setFundAmount("");
    setFundReason("");
    setShowFundModal(true);
  };

  const handleAdjustWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !fundAmount || Number(fundAmount) <= 0) {
      showToast("Please enter a valid amount", "error");
      return;
    }

    setSubmittingFund(true);
    try {
      const res = await fetch("/api/admin/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUser.id,
          type: fundType,
          amount: Number(fundAmount),
          reason: fundReason.trim() || `Admin manual ${fundType}`,
        }),
      });

      const data = await res.json();

      if (data.success) {
        showToast(
          `Successfully ${fundType === "credit" ? "credited" : "debited"} ₦${Number(fundAmount).toLocaleString()} for ${selectedUser.name}`
        );
        setShowFundModal(false);
        fetchUsers();
      } else {
        showToast(data.error || "Operation failed", "error");
      }
    } catch (err: any) {
      showToast(err.message || "Failed to adjust wallet", "error");
    } finally {
      setSubmittingFund(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">User Management</h1>
          <p className="text-muted-foreground text-sm">Manage users, view live balances, and manually fund customer wallets.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchUsers} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* Notification Toast Banner */}
      {notification && (
        <div
          className={`p-3.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
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

      <Card>
        <CardHeader className="border-b border-border/50 pb-4">
          <div className="flex gap-4 items-center justify-between">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email, or ID..."
                className="pl-9 h-9 text-xs sm:text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Loading users from database...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="font-semibold text-sm">No registered users found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Wallet Balance</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-bold text-sm text-foreground">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                        <span className="font-mono text-[10px] text-muted-foreground/60">
                          ID: {user.id.slice(0, 8)}...
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-black font-mono text-sm text-foreground">
                          ₦{formatNaira(user.balance)}
                        </span>
                        {user.balance > 0 && (
                          <Badge className="bg-emerald-500/15 text-emerald-600 border border-emerald-500/20 text-[10px] py-0">
                            Funded
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={user.role === "admin" ? "destructive" : "outline"}
                        className="capitalize text-[10px]"
                      >
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{user.joined}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => handleOpenFund(user)}
                        className="h-8 px-3 rounded-xl font-bold text-xs bg-primary hover:bg-primary/90 text-white shadow-xs flex items-center gap-1 ml-auto"
                      >
                        <DollarSign className="h-3.5 w-3.5" /> Fund Wallet
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* MODAL: FUND / ADJUST CUSTOMER WALLET */}
      {showFundModal && selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Adjust User Balance</h3>
                  <p className="text-xs text-muted-foreground">{selectedUser.name} ({selectedUser.email})</p>
                </div>
              </div>
              <button
                onClick={() => setShowFundModal(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustWallet} className="p-4 sm:p-5 space-y-4">
              {/* Current balance card */}
              <div className="p-3 bg-muted/50 rounded-xl border border-border/60 flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Current Balance:</span>
                <span className="text-base font-black font-mono text-foreground">
                  ₦{formatNaira(selectedUser.balance)}
                </span>
              </div>

              {/* Credit / Debit Tabs */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Action Type
                </label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl">
                  <button
                    type="button"
                    onClick={() => setFundType("credit")}
                    className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      fundType === "credit"
                        ? "bg-emerald-600 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Plus className="h-3.5 w-3.5" /> Credit (Deposit)
                  </button>
                  <button
                    type="button"
                    onClick={() => setFundType("debit")}
                    className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                      fundType === "debit"
                        ? "bg-red-600 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Minus className="h-3.5 w-3.5" /> Debit (Deduct)
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Amount (₦)
                </label>
                <Input
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 5000"
                  value={fundAmount}
                  onChange={(e) => setFundAmount(e.target.value)}
                  className="font-mono text-base font-bold"
                />
                {/* Quick Presets */}
                <div className="grid grid-cols-4 gap-1.5 mt-2">
                  {[1000, 2000, 5000, 10000].map((preset) => (
                    <button
                      type="button"
                      key={preset}
                      onClick={() => setFundAmount(String(preset))}
                      className="py-1 px-2 rounded-lg text-[11px] font-bold border border-border bg-background hover:bg-muted text-muted-foreground"
                    >
                      +₦{preset.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason / Notes */}
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Reason / Internal Note
                </label>
                <Input
                  placeholder="e.g. Manual bank transfer deposit, Support credit"
                  value={fundReason}
                  onChange={(e) => setFundReason(e.target.value)}
                  className="text-xs"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowFundModal(false)}
                  disabled={submittingFund}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submittingFund || !fundAmount}
                  className={fundType === "credit" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}
                >
                  {submittingFund ? (
                    <span className="flex items-center gap-1.5">
                      <RefreshCw className="h-4 w-4 animate-spin" /> Processing...
                    </span>
                  ) : (
                    <span>{fundType === "credit" ? "Credit" : "Debit"} ₦{Number(fundAmount || 0).toLocaleString()}</span>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
