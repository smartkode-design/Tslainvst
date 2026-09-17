"use client";

import { useState, useEffect } from "react";
import { 
  Store, UserCheck, ShieldAlert, Search, RefreshCw, Plus, 
  CheckCircle2, XCircle, MoreVertical, Mail, Phone 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminSellersPage() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUserToPromote, setSelectedUserToPromote] = useState("");
  const [isPromoting, setIsPromoting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/sellers");
      const data = await res.json();
      if (data.success) {
        setSellers(data.sellers);
        setCandidates(data.candidates);
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

  const handlePromote = async (userId: string, newRole: string) => {
    setIsPromoting(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Account updated to ${newRole} successfully!`);
        fetchSellers();
      } else {
        setMessage(data.error || "Failed to update role");
      }
    } catch (err: any) {
      setMessage(err.message || "Failed to promote user");
    } finally {
      setIsPromoting(false);
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
              Seller & Merchant Management
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Verify marketplace merchants, manage storefront authorizations, and review seller credentials.
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
          Refresh Sellers
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs">
          <CardContent className="p-5">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Total Verified Sellers</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{sellers.length}</h3>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">Authorized marketplace merchants</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs">
          <CardContent className="p-5">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Platform Users</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white">{candidates.length}</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1">Potential merchant candidates</p>
          </CardContent>
        </Card>
        <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs">
          <CardContent className="p-5">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Seller Payout Status</p>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">100% Automated</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold mt-1">Direct wallet clearing enabled</p>
          </CardContent>
        </Card>
      </div>

      {/* Promote User To Seller Action Card */}
      <Card className="border border-indigo-200/80 dark:border-indigo-900/50 bg-indigo-50/50 dark:bg-indigo-950/20 shadow-xs">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-black text-sm">
            <UserCheck className="h-4 w-4" />
            <span>Authorize New Merchant / Promote User to Seller</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Select an existing registered user to grant them instant merchant listing permissions on TSLA Marketplace.
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
                  {u.name} ({u.email}) — Role: {u.role}
                </option>
              ))}
            </select>
            <Button
              disabled={!selectedUserToPromote || isPromoting}
              onClick={() => handlePromote(selectedUserToPromote, "seller")}
              className="h-11 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold text-xs px-6 gap-2 shrink-0"
            >
              <Plus className="h-4 w-4" />
              Promote to Verified Seller
            </Button>
          </div>
          {message && (
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 pt-1">{message}</p>
          )}
        </CardContent>
      </Card>

      {/* Sellers List */}
      <Card className="border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-xs">
        <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-black text-slate-900 dark:text-white">Active Merchants</CardTitle>
            <p className="text-xs text-slate-500 dark:text-slate-400">Users with active seller credentials</p>
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
                    <th className="p-4">Merchant</th>
                    <th className="p-4">Contact</th>
                    <th className="p-4">Products</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Joined</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredSellers.map((seller) => (
                    <tr key={seller.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 dark:text-white">{seller.storeName}</div>
                        <div className="text-[11px] text-slate-400">{seller.merchantName}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-medium text-slate-700 dark:text-slate-300">{seller.email}</div>
                        <div className="text-[11px] text-slate-400">{seller.phone}</div>
                      </td>
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
                          className="text-xs text-rose-500 hover:text-rose-600 font-bold"
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
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Verified Sellers Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Promote any registered customer to a seller using the authorization tool above to allow them to list products.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
