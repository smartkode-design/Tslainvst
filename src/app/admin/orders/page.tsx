"use client";

import { useState, useEffect } from "react";
import { 
  ShoppingBag, Search, Filter, RefreshCw, CheckCircle2, 
  Clock, AlertCircle, RotateCcw, Eye, X, ExternalLink, 
  Smartphone, Rocket, ShieldCheck, ArrowRight, Check, DollarSign, Mail 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminOrder } from "@/app/api/admin/orders/route";

function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    refunded: 0,
    totalVolumeNgn: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders?status=${statusFilter}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleUpdateStatus = async (orderId: string, status: string, refundWallet: boolean = false) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status, refundWallet }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || `Order updated to ${status}`);
        setSelectedOrder(null);
        fetchOrders();
      } else {
        showToast(data.error || "Failed to update order", "error");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleResendRefundEmail = async (orderId: string) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action: "resend_refund_email" }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message || "System Refund email sent to customer");
      } else {
        showToast(data.error || "Failed to send email", "error");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const q = searchQuery.toLowerCase();
    return (
      o.id.toLowerCase().includes(q) ||
      o.customerEmail.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.serviceName.toLowerCase().includes(q) ||
      o.target.toLowerCase().includes(q) ||
      o.providerOrderId.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">Completed</Badge>;
      case "processing":
        return <Badge className="bg-blue-500/15 text-blue-600 border-blue-500/30">Processing</Badge>;
      case "pending":
        return <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30">Pending</Badge>;
      case "refunded":
        return <Badge className="bg-purple-500/15 text-purple-600 border-purple-500/30">Refunded</Badge>;
      case "canceled":
        return <Badge className="bg-red-500/15 text-red-600 border-red-500/30">Canceled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case "sms":
        return <Smartphone className="h-4 w-4 text-emerald-500" />;
      case "smm":
        return <Rocket className="h-4 w-4 text-indigo-500" />;
      case "log":
        return <ShieldCheck className="h-4 w-4 text-amber-500" />;
      default:
        return <ShoppingBag className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1 flex items-center gap-2.5">
            <ShoppingBag className="h-6 w-6 text-primary" />
            Platform Order Ledger
          </h1>
          <p className="text-muted-foreground text-sm">
            Live real-time feed of all SMS activations, SMM boosts, and marketplace credentials purchased by users.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
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
              <span className="text-xs font-semibold uppercase tracking-wider">Total Orders</span>
              <ShoppingBag className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-black">{stats.total}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Direct database records</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Completed</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-500">{stats.completed}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Successfully fulfilled</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-500">{stats.pending}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Awaiting OTP or boost</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Gross Order Vol</span>
              <DollarSign className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-black text-indigo-500">₦{formatNaira(stats.totalVolumeNgn)}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Total revenue generated</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search order ID, user, target..."
            className="pl-9 h-10 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status Tabs */}
        <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
          {["all", "completed", "processing", "pending", "refunded", "canceled"].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap ${
                statusFilter === tab
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
              <span>Querying live database orders...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="font-semibold text-sm">No orders found</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                When customers purchase SMS numbers, social boosts, or marketplace credentials, orders will automatically appear here.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Order ID & Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service / Item</TableHead>
                  <TableHead>Target / Contact</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted/40">
                    <TableCell>
                      <div>
                        <code className="text-xs font-mono font-bold text-foreground">
                          #{order.id.slice(0, 8)}
                        </code>
                        <div className="text-[11px] text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString("en-NG", {
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
                        <div className="font-semibold text-xs text-foreground">{order.customerName}</div>
                        <div className="text-[11px] text-muted-foreground">{order.customerEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getServiceIcon(order.serviceType)}
                        <div>
                          <div className="font-medium text-xs text-foreground line-clamp-1">
                            {order.serviceName}
                          </div>
                          <div className="text-[10px] text-muted-foreground uppercase font-mono">
                            {order.provider} · Qty: {order.quantity}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-mono text-muted-foreground max-w-[150px] truncate block">
                        {order.target}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-xs text-foreground">₦{formatNaira(order.amountNgn)}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(order.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs gap-1.5"
                        onClick={() => setSelectedOrder(order)}
                      >
                        <Eye className="h-3.5 w-3.5" /> Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* MODAL: ORDER DETAILS */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-card border border-border w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/60 shrink-0">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-base">Order #{selectedOrder.id.slice(0, 8)}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 text-sm overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-muted/40">
                <div>
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Customer
                  </span>
                  <div className="font-semibold text-foreground mt-0.5">{selectedOrder.customerName}</div>
                  <div className="text-xs text-muted-foreground">{selectedOrder.customerEmail}</div>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Total Charged
                  </span>
                  <div className="font-bold text-foreground text-lg mt-0.5">
                    ₦{formatNaira(selectedOrder.amountNgn)}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Wholesale: ${selectedOrder.costUsd.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Service</span>
                  <span className="font-medium text-foreground">{selectedOrder.serviceName}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Provider Source</span>
                  <span className="font-mono uppercase text-xs">{selectedOrder.provider}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Provider Order Ref</span>
                  <span className="font-mono text-xs">{selectedOrder.providerOrderId}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-border/40">
                  <span className="text-muted-foreground">Target / Link</span>
                  <span className="font-mono text-xs text-primary">{selectedOrder.target}</span>
                </div>
                {selectedOrder.otpCode && (
                  <div className="flex justify-between py-1.5 border-b border-border/40 bg-emerald-500/10 px-2 rounded-lg">
                    <span className="font-bold text-emerald-600">Delivered OTP Code</span>
                    <span className="font-mono font-black text-emerald-600 text-base">
                      {selectedOrder.otpCode}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-1.5">
                  <span className="text-muted-foreground">Current Status</span>
                  <span>{getStatusBadge(selectedOrder.status)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-border/60 flex flex-col sm:flex-row gap-2">
                {selectedOrder.status !== "completed" && (
                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus(selectedOrder.id, "completed")}
                  >
                    <CheckCircle2 className="h-4 w-4" /> Mark as Completed
                  </Button>
                )}
                {selectedOrder.status !== "refunded" && (
                  <Button
                    variant="outline"
                    className="w-full text-purple-600 hover:bg-purple-500/10 hover:border-purple-500/30 gap-2"
                    disabled={actionLoading}
                    onClick={() => {
                      if (confirm(`Refund ₦${formatNaira(selectedOrder.amountNgn)} to ${selectedOrder.customerName}'s wallet?`)) {
                        handleUpdateStatus(selectedOrder.id, "refunded", true);
                      }
                    }}
                  >
                    <RotateCcw className="h-4 w-4" /> Refund to Customer Wallet
                  </Button>
                )}
                {selectedOrder.status === "refunded" && (
                  <Button
                    variant="outline"
                    className="w-full text-blue-500 hover:bg-blue-500/10 hover:border-blue-500/30 gap-2"
                    disabled={actionLoading}
                    onClick={() => handleResendRefundEmail(selectedOrder.id)}
                  >
                    <Mail className="h-4 w-4" /> Resend System Refund Email
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
