"use client";

import { useState, useEffect } from "react";
import { 
  Package, Plus, Search, Filter, Edit3, Trash2, CheckCircle2, 
  AlertCircle, RefreshCw, Layers, ShieldCheck, DollarSign, 
  ExternalLink, Eye, EyeOff, Save, X, Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AdminProduct } from "@/app/api/admin/products/route";

function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditProduct, setCurrentEditProduct] = useState<AdminProduct | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Form states for new product
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Google Voice");
  const [newPlatform, setNewPlatform] = useState("GOOGLE VOICE");
  const [newCountry, setNewCountry] = useState("United States");
  const [newPrice, setNewPrice] = useState("4500");
  const [newStock, setNewStock] = useState("50");
  const [newDetails, setNewDetails] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/products");
      const data = await res.json();
      if (data.success && data.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error("Failed to load products", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Add Product Handler
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPrice) {
      showToast("Title and price are required", "error");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          category: newCategory,
          platform: newPlatform,
          country: newCountry,
          priceNum: Number(newPrice),
          stock: Number(newStock) || 0,
          details: newDetails.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Product added to marketplace successfully!");
        setShowAddModal(false);
        // Reset form
        setNewTitle("");
        setNewDetails("");
        fetchProducts();
      } else {
        showToast(data.error || "Failed to create product", "error");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Update Product Handler
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEditProduct) return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentEditProduct.id,
          title: currentEditProduct.title,
          priceNum: currentEditProduct.priceNum,
          stock: currentEditProduct.stock,
          status: currentEditProduct.status,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Product details updated successfully!");
        setShowEditModal(false);
        fetchProducts();
      } else {
        showToast(data.error || "Failed to update product", "error");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle Active Status
  const handleToggleStatus = async (product: AdminProduct) => {
    const nextStatus = product.status === "active" ? "disabled" : "active";
    try {
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id, status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === product.id ? { ...p, status: nextStatus } : p))
        );
        showToast(`Product set to ${nextStatus}`);
      }
    } catch (err: any) {
      showToast("Error updating status", "error");
    }
  };

  // Delete Product Handler
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to remove this product from inventory?")) return;

    try {
      const res = await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        showToast("Product removed from inventory");
      }
    } catch (err: any) {
      showToast("Failed to delete product", "error");
    }
  };

  const categories = ["All", ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(q) ||
      p.platform.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);
  const totalValue = products.reduce((sum, p) => sum + p.priceNum * p.stock, 0);
  const inStockCount = products.filter((p) => p.stock > 0 && p.status === "active").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1 flex items-center gap-2.5">
            <Package className="h-6 w-6 text-primary" />
            Product & Inventory Management
          </h1>
          <p className="text-muted-foreground text-sm">
            Control live marketplace stock, Google Voice accounts, aged credentials, and unit wholesale pricing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchProducts} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button size="sm" onClick={() => setShowAddModal(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Product
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

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Listings</span>
              <Layers className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-black">{products.length}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Marketplace active items</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">In Stock Ready</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-500">{inStockCount}</div>
            <p className="text-[11px] text-muted-foreground mt-1">{totalUnits} total credentials</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Out of Stock</span>
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-500">
              {products.filter((p) => p.stock === 0 || p.status === "disabled").length}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Requires restock</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Inventory Value</span>
              <DollarSign className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-black text-indigo-500">₦{formatNaira(totalValue)}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Retail platform worth</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products or platforms..."
            className="pl-9 h-10 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              }`}
            >
              {cat}
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
              <span>Loading inventory from database...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Package className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="font-semibold text-sm">No products found matching filters</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[380px]">Product / Listing</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead>Stock Level</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-muted/40">
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <img
                          src={product.flag}
                          alt={product.country}
                          className="w-5 h-3.5 object-cover rounded shadow-xs mt-1 shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://flagcdn.com/w640/us.png";
                          }}
                        />
                        <div>
                          <div className="font-semibold text-sm text-foreground line-clamp-1">
                            {product.title}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-bold tracking-wider uppercase">
                              {product.platform}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{product.country}</span>
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-medium text-muted-foreground">{product.category}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-sm text-foreground">₦{formatNaira(product.priceNum)}</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            product.stock > 10
                              ? "bg-emerald-500"
                              : product.stock > 0
                              ? "bg-amber-500"
                              : "bg-red-500"
                          }`}
                        />
                        <span className="text-xs font-semibold">{product.stock} pcs</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-[11px] font-semibold cursor-pointer ${
                          product.status === "active"
                            ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-500/30"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                        onClick={() => handleToggleStatus(product)}
                      >
                        {product.status === "active" ? "Active" : "Disabled"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Edit Price & Stock"
                          onClick={() => {
                            setCurrentEditProduct(product);
                            setShowEditModal(true);
                          }}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500/70 hover:text-red-600 hover:bg-red-500/10"
                          title="Delete Product"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* MODAL: ADD PRODUCT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-card border border-border w-full max-w-lg max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/60 shrink-0">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-base">Add New Marketplace Product</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Product Listing Title
                </label>
                <Input
                  required
                  placeholder="e.g., Google Voice (+1 USA) Aged 2023 · High Trust"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Category
                  </label>
                  <select
                    className="w-full h-10 px-3 rounded-md bg-background border border-input text-sm"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  >
                    <option value="Google Voice">Google Voice</option>
                    <option value="Aged Social Accounts">Aged Social Accounts</option>
                    <option value="AI Accounts">AI Accounts</option>
                    <option value="VPNs & Proxies">VPNs & Proxies</option>
                    <option value="General">General Marketplace</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Platform
                  </label>
                  <Input
                    required
                    placeholder="e.g., GOOGLE VOICE, FACEBOOK"
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Retail Price (₦)
                  </label>
                  <Input
                    type="number"
                    required
                    min="100"
                    placeholder="4500"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Initial Stock Count
                  </label>
                  <Input
                    type="number"
                    required
                    min="1"
                    placeholder="50"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Country Origin
                </label>
                <Input
                  placeholder="e.g., United States"
                  value={newCountry}
                  onChange={(e) => setNewCountry(e.target.value)}
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Delivery Credentials Template
                </label>
                <textarea
                  className="w-full p-3 rounded-md bg-background border border-input text-xs font-mono resize-none focus:outline-hidden focus:ring-2 focus:ring-ring"
                  rows={3}
                  placeholder="Gmail: ... | Pass: ... | Recovery: ... | Voice#: ..."
                  value={newDetails}
                  onChange={(e) => setNewDetails(e.target.value)}
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Format delivered to customer upon wallet checkout.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddModal(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={actionLoading} className="gap-2">
                  {actionLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save to Inventory
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT PRODUCT */}
      {showEditModal && currentEditProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-card border border-border w-full max-w-md max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/60 shrink-0">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-base">Quick Edit Product</h3>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-muted-foreground hover:text-foreground p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Title
                </label>
                <Input
                  value={currentEditProduct.title}
                  onChange={(e) =>
                    setCurrentEditProduct({ ...currentEditProduct, title: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Retail Price (₦)
                  </label>
                  <Input
                    type="number"
                    min="100"
                    value={currentEditProduct.priceNum}
                    onChange={(e) =>
                      setCurrentEditProduct({
                        ...currentEditProduct,
                        priceNum: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Stock Units
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={currentEditProduct.stock}
                    onChange={(e) =>
                      setCurrentEditProduct({
                        ...currentEditProduct,
                        stock: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Status
                </label>
                <select
                  className="w-full h-10 px-3 rounded-md bg-background border border-input text-sm"
                  value={currentEditProduct.status}
                  onChange={(e) =>
                    setCurrentEditProduct({
                      ...currentEditProduct,
                      status: e.target.value as any,
                    })
                  }
                >
                  <option value="active">Active (Available for purchase)</option>
                  <option value="disabled">Disabled (Hidden from marketplace)</option>
                  <option value="out_of_stock">Out of Stock</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={actionLoading} className="gap-2">
                  {actionLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
