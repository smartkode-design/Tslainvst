"use client";

import { useState, useEffect } from "react";
import {
  Store, UserCheck, Search, RefreshCw, Plus,
  CheckCircle2, Clock, XCircle, ChevronDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUserToPromote, setSelectedUserToPromote] = useState("");
  const [isPromoting, setIsPromoting] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sellers");
      const data = await res.json();
      if (data.success) {
        setSellers(data.sellers);
        setCandidates(data.candidates);
        setApplications(data.applications || []);
      }
    } catch (err) {
      console.error("Failed to load sellers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const showMsg = (text: string, type: "success" | "error" = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  };

  const handlePromote = async (userId: string, newRole: string) => {
    setIsPromoting(true);
    try {
      const res = await fetch("/api/admin/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        showMsg(`Account updated to ${newRole} successfully!`);
        fetchSellers();
        setSelectedUserToPromote("");
      } else {
        showMsg(data.error || "Failed to update role", "error");
      }
    } catch (err: any) {
      showMsg(err.message || "Failed to promote user", "error");
    } finally {
      setIsPromoting(false);
    }
  };

  const handleApplication = async (userId: string, applicationId: string, action: "approve" | "reject") => {
    setProcessingId(applicationId);
    try {
      const res = await fetch("/api/admin/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          applicationId,
          role: "seller",
          action: action === "approve" ? undefined : "reject",
        }),
      });
      const data = await res.json();
      if (data.success) {
        showMsg(action === "approve" ? "Application approved! User is now a seller." : "Application rejected.");
        fetchSellers();
      } else {
        showMsg(data.error || "Failed to process application", "error");
      }
    } catch (err: any) {
      showMsg(err.message || "Failed to process application", "error");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredSellers = sellers.filter((s) =>
    s.storeName.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    s.merchantName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-6 w-6 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-600 dark:text-sky-400">
              <Store className="h-3.5 w-3.5" />
            </span>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Seller Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Review applications, authorize merchants, and manage seller permissions.
          </p>
        </div>
        <Button
          onClick={fetchSellers}
          variant="outline"
          size="sm"
          className="self-start sm:self-auto gap-2 border-slate-200 dark:border-slate-800 font-bold"
          disabled={loading}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Toast */}
      {message && (
        <div className={`p-3.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
          message.type === "success"
            ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900"
            : "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900"
        }`}>
          {message.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          {message.text}
        </div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs">
          <CardContent className="p-5">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Active Sellers</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{sellers.length}</h3>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">Authorized merchants</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs">
          <CardContent className="p-5">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Pending Applications</p>
            <h3 className={`text-2xl font-black ${applications.length > 0 ? "text-amber-600 dark:text-amber-400" : "text-slate-900 dark:text-white"}`}>
              {applications.length}
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1">Awaiting review</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs">
          <CardContent className="p-5">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Payout System</p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">90/10</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1">Seller 90% / Platform 10%</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Applications */}
      {applications.length > 0 && (
        <Card className="border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20 shadow-xs">
          <CardHeader className="p-5 border-b border-amber-100 dark:border-amber-900/50">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <CardTitle className="text-base font-black text-slate-900 dark:text-white">
                Pending Seller Applications ({applications.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-amber-100 dark:divide-amber-900/30">
              {applications.map((app) => (
                <div key={app.id} className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-black text-slate-900 dark:text-white">{app.full_name || app.email}</p>
                      <Badge className="text-[10px] py-0 bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800">
                        Pending
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{app.email}</p>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 bg-white dark:bg-slate-900/60 p-2.5 rounded-lg border border-amber-100 dark:border-amber-900/40">
                      {app.reason}
                    </p>
                    {app.social_handles && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Socials: {app.social_handles}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-400">
                      Applied {new Date(app.created_at).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      onClick={() => handleApplication(app.user_id, app.id, "reject")}
                      disabled={processingId === app.id}
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-rose-600 border-rose-200 hover:bg-rose-50 font-bold rounded-xl text-xs"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </Button>
                    <Button
                      onClick={() => handleApplication(app.user_id, app.id, "approve")}
                      disabled={processingId === app.id}
                      size="sm"
                      className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Promote */}
      <Card className="border border-indigo-200/80 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-xs">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-black text-sm">
            <UserCheck className="h-4 w-4" />
            <span>Manually Promote User to Seller</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Grant any registered user instant seller access without requiring an application.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <select
              value={selectedUserToPromote}
              onChange={(e) => setSelectedUserToPromote(e.target.value)}
              className="h-11 px-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-bold text-xs text-slate-900 dark:text-white flex-1"
            >
              <option value="">-- Select Registered User --</option>
              {candidates.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email}) — {u.role}
                </option>
              ))}
            </select>
            <Button
              disabled={!selectedUserToPromote || isPromoting}
              onClick={() => handlePromote(selectedUserToPromote, "seller")}
              className="h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs px-6 gap-2 shrink-0"
            >
              <Plus className="h-4 w-4" />
              {isPromoting ? "Promoting..." : "Promote to Seller"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Sellers List */}
      <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs">
        <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-black text-slate-900 dark:text-white">Active Sellers</CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400">Users with seller role</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sellers..."
              className="h-9 pl-9 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredSellers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 uppercase font-black tracking-wider text-[10px] border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="p-4">Seller</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Listings</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Joined</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredSellers.map((seller) => (
                    <tr key={seller.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white">{seller.merchantName}</div>
                        <div className="text-[11px] text-slate-400">{seller.storeName}</div>
                      </td>
                      <td className="p-4 font-medium text-slate-700 dark:text-slate-300">{seller.email}</td>
                      <td className="p-4 font-bold text-slate-700 dark:text-slate-300">
                        {seller.activeProducts} Listings
                      </td>
                      <td className="p-4">
                        <span className="text-[10px] font-black bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full">
                          {seller.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500">{seller.joined}</td>
                      <td className="p-4 text-right">
                        <Button
                          onClick={() => handlePromote(seller.id, "user")}
                          variant="ghost"
                          size="sm"
                          className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 font-bold rounded-lg"
                        >
                          Revoke Seller
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-sky-50 dark:bg-sky-950/50 text-sky-500 flex items-center justify-center mx-auto">
                <Store className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Active Sellers Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Approve applications above or manually promote users using the tool above.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
