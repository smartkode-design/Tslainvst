"use client";

import { useState, useEffect } from "react";
import { 
  Settings, Save, RefreshCw, CheckCircle2, AlertCircle, 
  ShieldCheck, Smartphone, Rocket, CreditCard, Database, 
  ToggleLeft, ToggleRight, X 
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SystemSettings } from "@/app/api/admin/settings/route";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error("Failed to load settings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Platform configurations saved successfully!");
      } else {
        showToast(data.error || "Failed to save settings", "error");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1 flex items-center gap-2.5">
            <Settings className="h-6 w-6 text-primary" />
            Platform & Gateway Configuration
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage provider credentials, support channels, minimum top-up amounts, and operational flags.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchSettings} disabled={loading}>
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

      {loading || !settings ? (
        <div className="flex items-center justify-center py-20 gap-2 text-muted-foreground">
          <RefreshCw className="h-5 w-5 animate-spin text-primary" />
          <span>Loading system parameters...</span>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Provider Gateway Integrations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Wholesale Provider Integrations</CardTitle>
              <CardDescription className="text-xs">
                Real-time connection verification for fulfillment APIs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border/40">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-emerald-500" />
                  <div>
                    <div className="font-semibold text-sm">5SIM Provider API</div>
                    <div className="text-xs text-muted-foreground">Virtual Number SMS Activations</div>
                  </div>
                </div>
                <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
                  {settings.fiveSimApiKeyConfigured ? "Key Active" : "Configured (Env)"}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border/40">
                <div className="flex items-center gap-3">
                  <Rocket className="h-5 w-5 text-indigo-500" />
                  <div>
                    <div className="font-semibold text-sm">JustAnotherPanel (JAP) API</div>
                    <div className="text-xs text-muted-foreground">Social Media Boosting (SMM) Services</div>
                  </div>
                </div>
                <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
                  {settings.japApiKeyConfigured ? "Key Active" : "Configured (Env)"}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border/40">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-blue-500" />
                  <div>
                    <div className="font-semibold text-sm">Payvessel Virtual Accounts</div>
                    <div className="text-xs text-muted-foreground">Automated NGN Bank Transfers & Webhook</div>
                  </div>
                </div>
                <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
                  {settings.payvesselConfigured ? "Key Active" : "Configured (Env)"}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/40 border border-border/40">
                <div className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-purple-500" />
                  <div>
                    <div className="font-semibold text-sm">Supabase PostgreSQL</div>
                    <div className="text-xs text-muted-foreground">Auth Engine & Database Storage</div>
                  </div>
                </div>
                <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
                  Connected
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Business & Support Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">General Business Settings</CardTitle>
              <CardDescription className="text-xs">
                Platform identity and customer support channels.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Platform Name
                  </label>
                  <Input
                    value={settings.siteName}
                    onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Currency Symbol
                  </label>
                  <Input
                    value={settings.currency}
                    onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Support WhatsApp Number
                  </label>
                  <Input
                    value={settings.supportWhatsApp}
                    onChange={(e) => setSettings({ ...settings, supportWhatsApp: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Support Email
                  </label>
                  <Input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Minimum Wallet Funding Amount (₦)
                </label>
                <Input
                  type="number"
                  min="100"
                  value={settings.minDepositNgn}
                  onChange={(e) => setSettings({ ...settings, minDepositNgn: Number(e.target.value) })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Operational Flags */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold">Operational Controls</CardTitle>
              <CardDescription className="text-xs">
                Emergency toggles and registration limits.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-border/40">
                <div>
                  <div className="font-semibold text-sm">Allow New Customer Registrations</div>
                  <div className="text-xs text-muted-foreground">When disabled, new signups will be blocked</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.allowSignups}
                  onChange={(e) => setSettings({ ...settings, allowSignups: e.target.checked })}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                />
              </div>

              <div className="flex items-center justify-between py-2 border-b border-border/40">
                <div>
                  <div className="font-semibold text-sm">Allow Seller Applications</div>
                  <div className="text-xs text-muted-foreground">Permit regular users to request seller promotion</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.allowSellerApplications}
                  onChange={(e) =>
                    setSettings({ ...settings, allowSellerApplications: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="font-semibold text-sm text-red-500">Platform Maintenance Mode</div>
                  <div className="text-xs text-muted-foreground">
                    Directs all public non-admin visitors to a maintenance screen
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.maintenanceMode}
                  onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
                  className="h-4 w-4 rounded border-input text-red-600 focus:ring-red-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={saving} className="gap-2 px-6">
              {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Platform Settings
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
