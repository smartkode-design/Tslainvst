"use client";

import { useState, useEffect } from "react";
import { 
  FolderTree, Plus, Search, Edit3, Trash2, CheckCircle2, 
  AlertCircle, RefreshCw, Layers, Sparkles, X, Save, Eye, EyeOff
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CategoryItem } from "@/app/api/admin/categories/route";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditCat, setCurrentEditCat] = useState<CategoryItem | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // New Category Form
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("📦");
  const [newDescription, setNewDescription] = useState("");
  const [newFeatured, setNewFeatured] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/categories");
      const data = await res.json();
      if (data.success && data.categories) {
        setCategories(data.categories);
      }
    } catch (err) {
      console.error("Failed to load categories", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      showToast("Category name is required", "error");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          icon: newIcon.trim() || "📁",
          description: newDescription.trim(),
          featured: newFeatured,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Category added successfully!");
        setShowAddModal(false);
        setNewName("");
        setNewDescription("");
        fetchCategories();
      } else {
        showToast(data.error || "Failed to create category", "error");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEditCat) return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentEditCat.id,
          name: currentEditCat.name,
          description: currentEditCat.description,
          status: currentEditCat.status,
          featured: currentEditCat.featured,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Category updated successfully!");
        setShowEditModal(false);
        fetchCategories();
      } else {
        showToast(data.error || "Failed to update category", "error");
      }
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleStatus = async (cat: CategoryItem) => {
    const nextStatus = cat.status === "active" ? "inactive" : "active";
    try {
      const res = await fetch("/api/admin/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cat.id, status: nextStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) =>
          prev.map((c) => (c.id === cat.id ? { ...c, status: nextStatus } : c))
        );
        showToast(`Category set to ${nextStatus}`);
      }
    } catch (err: any) {
      showToast("Error updating status", "error");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const res = await fetch(`/api/admin/categories?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        showToast("Category deleted successfully");
      }
    } catch (err: any) {
      showToast("Failed to delete category", "error");
    }
  };

  const filteredCategories = categories.filter((c) => {
    const q = searchQuery.toLowerCase();
    return c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q);
  });

  const totalItems = categories.reduce((sum, c) => sum + c.itemCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1 flex items-center gap-2.5">
            <FolderTree className="h-6 w-6 text-primary" />
            Category Management
          </h1>
          <p className="text-muted-foreground text-sm">
            Organize catalog classifications across virtual numbers, social boosting, Google Voice, and aged logs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchCategories} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
          </Button>
          <Button size="sm" onClick={() => setShowAddModal(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Category
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-card border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Categories</span>
              <FolderTree className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-black">{categories.length}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Platform service divisions</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Divisions</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-500">
              {categories.filter((c) => c.status === "active").length}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Visible to consumers</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/60">
          <CardContent className="p-5">
            <div className="flex items-center justify-between text-muted-foreground mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Indexed Offerings</span>
              <Layers className="h-4 w-4 text-indigo-500" />
            </div>
            <div className="text-2xl font-black text-indigo-500">{totalItems}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Services & products cataloged</p>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
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
              <span>Loading categories...</span>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <FolderTree className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="font-semibold text-sm">No categories found matching filters</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[320px]">Category / Title</TableHead>
                  <TableHead>Slug Identifier</TableHead>
                  <TableHead>Catalog Items</TableHead>
                  <TableHead>Featured</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCategories.map((cat) => (
                  <TableRow key={cat.id} className="hover:bg-muted/40">
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl shrink-0 p-1 bg-muted/40 rounded-lg">{cat.icon}</span>
                        <div>
                          <div className="font-semibold text-sm text-foreground">{cat.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                            {cat.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs font-mono bg-muted/60 px-2 py-0.5 rounded text-muted-foreground">
                        {cat.slug}
                      </code>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-bold text-foreground">{cat.itemCount} items</span>
                    </TableCell>
                    <TableCell>
                      {cat.featured ? (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20 text-[10px]">
                          Featured
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={`text-[11px] font-semibold cursor-pointer ${
                          cat.status === "active"
                            ? "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-500/30"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                        onClick={() => handleToggleStatus(cat)}
                      >
                        {cat.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Edit Category"
                          onClick={() => {
                            setCurrentEditCat(cat);
                            setShowEditModal(true);
                          }}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500/70 hover:text-red-600 hover:bg-red-500/10"
                          title="Delete Category"
                          onClick={() => handleDeleteCategory(cat.id)}
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

      {/* MODAL: ADD CATEGORY */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-card border border-border w-full max-w-md max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/60 shrink-0">
              <div className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-base">Add New Category</h3>
              </div>
              <button onClick={() => setShowAddModal(false)} className="text-muted-foreground hover:text-foreground p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-4 gap-3">
                <div className="col-span-1">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Emoji
                  </label>
                  <Input
                    className="text-center text-lg"
                    value={newIcon}
                    onChange={(e) => setNewIcon(e.target.value)}
                  />
                </div>
                <div className="col-span-3">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                    Category Name
                  </label>
                  <Input
                    required
                    placeholder="e.g., Streaming & OTT Accounts"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Description
                </label>
                <textarea
                  className="w-full p-3 rounded-md bg-background border border-input text-xs resize-none focus:outline-hidden focus:ring-2 focus:ring-ring"
                  rows={3}
                  placeholder="Short description of services included in this category..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featCheck"
                  checked={newFeatured}
                  onChange={(e) => setNewFeatured(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-ring"
                />
                <label htmlFor="featCheck" className="text-xs font-medium cursor-pointer">
                  Feature this category on the homepage
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
                <Button type="button" variant="outline" onClick={() => setShowAddModal(false)} disabled={actionLoading}>
                  Cancel
                </Button>
                <Button type="submit" disabled={actionLoading} className="gap-2">
                  {actionLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Create Category
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT CATEGORY */}
      {showEditModal && currentEditCat && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-card border border-border w-full max-w-md max-h-[90vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-border/60 shrink-0">
              <div className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-base">Edit Category</h3>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-muted-foreground hover:text-foreground p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateCategory} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Category Name
                </label>
                <Input
                  value={currentEditCat.name}
                  onChange={(e) =>
                    setCurrentEditCat({ ...currentEditCat, name: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Description
                </label>
                <textarea
                  className="w-full p-3 rounded-md bg-background border border-input text-xs resize-none focus:outline-hidden focus:ring-2 focus:ring-ring"
                  rows={3}
                  value={currentEditCat.description}
                  onChange={(e) =>
                    setCurrentEditCat({ ...currentEditCat, description: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1.5">
                  Status
                </label>
                <select
                  className="w-full h-10 px-3 rounded-md bg-background border border-input text-sm"
                  value={currentEditCat.status}
                  onChange={(e) =>
                    setCurrentEditCat({
                      ...currentEditCat,
                      status: e.target.value as any,
                    })
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border/60">
                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)} disabled={actionLoading}>
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
