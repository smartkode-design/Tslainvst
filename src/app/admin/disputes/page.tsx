"use client";

import { useState, useEffect } from "react";
import { 
  AlertTriangle, CheckCircle2, Clock, ShieldCheck, 
  RotateCcw, RefreshCw, Eye, X, MessageSquare 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DisputeItem } from "@/app/api/admin/disputes/route";

function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    underReview: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState<DisputeItem | null>(null);

  const fetchDisputes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/disputes");
      const data = await res.json();
      if (data.success) {
        setDisputes(data.disputes || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load disputes", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisputes();
  }, []);

  const handleUpdateDispute = async (
    disputeId: string,
    status: "open" | "under_review" | "resolved" | "dismissed",
    refundWallet: boolean = false
  ) => {
    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/disputes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          disputeId,
          status,
          refundWallet,
          resolutionNote: refundWallet
            ? "Resolved with full customer wallet refund"
            : `Status changed to ${status}`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedDispute(null);
        fetchDisputes();
      }
    } catch (err) {
      console.error("Error updating dispute", err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1 flex items-center gap-2.5">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            Customer Disputes & Claims
          </h1>
          <p className="text-muted-foreground text-sm">
            Investigate delivery grievances, SMS timeout reports, and issue instant wallet refunds.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchDisputes} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Filed</span>
              <AlertTriangle className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-black">{stats.total}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Grievances logged</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Awaiting Action</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-500">{stats.open}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Pending admin investigation</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Under Review</span>
              <MessageSquare className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-blue-500">{stats.underReview}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Provider confirmation pending</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Resolved</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-500">{stats.resolved}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Successfully settled</p>
          </CardContent>
        </Card>
      </div>

      {/* Table Card */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
              <RefreshCw className="h-5 w-5 animate-spin text-primary" />
              <span>Checking active claims...</span>
            </div>
          ) : disputes.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <ShieldCheck className="h-12 w-12 mx-auto text-emerald-500/60 mb-3" />
              <p className="font-bold text-base text-foreground">Zero Active Customer Disputes</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                Platform delivery fulfillment is running normally. If a user raises an issue with an SMS or log, it will be prioritized here.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Claim Ref & Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service & Amount</TableHead>
                  <TableHead>Customer Statement</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disputes.map((d) => (
                  <TableRow key={d.id} className="hover:bg-muted/40">
                    <TableCell>
                      <div>
                        <code className="text-xs font-mono font-bold text-foreground">#{d.id}</code>
                        <div className="text-[11px] text-muted-foreground">
                          {new Date(d.createdAt).toLocaleDateString()}
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
                      <div>
                        <div className="font-medium text-xs text-foreground">{d.serviceName}</div>
                        <div className="font-bold text-xs text-primary">₦{formatNaira(d.amount)}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-muted-foreground max-w-xs line-clamp-2">{d.reason}</p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-[11px] ${
                          d.status === "resolved"
                            ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30"
                            : d.status === "under_review"
                            ? "bg-blue-500/15 text-blue-600 border-blue-500/30"
                            : "bg-amber-500/15 text-amber-600 border-amber-500/30"
                        }`}
                      >
                        {d.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-xs text-emerald-600 hover:bg-emerald-500/10"
                          onClick={() => handleUpdateDispute(d.id, "resolved", true)}
                          disabled={actionLoading}
                        >
                          <RotateCcw className="h-3.5 w-3.5 mr-1" /> Refund
                        </Button>
                      </div>
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
