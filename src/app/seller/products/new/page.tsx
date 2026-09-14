import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { UploadCloud, Image as ImageIcon } from "lucide-react";
import Link from "next/link";

export default function AddProductPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Add New Product</h1>
          <p className="text-muted-foreground">Create a new product listing on the TSLA marketplace.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/seller/products">Cancel</Link>
          </Button>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white">Save Draft</Button>
          <Button>Submit for Review</Button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Details</CardTitle>
              <CardDescription>Essential information about your digital product.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" placeholder="e.g. USA Travel eSIM 10GB" />
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select id="category">
                    <option>Select a category...</option>
                    <option>eSIM & Travel Data</option>
                    <option>Gift Cards</option>
                    <option>Digital Subscriptions</option>
                    <option>Software Licenses</option>
                    <option>Gaming Credits</option>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₦)</Label>
                  <Input id="price" type="number" placeholder="0.00" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="desc">Description</Label>
                <Textarea id="desc" placeholder="Detailed description of the product and its features..." className="min-h-[150px]" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
              <CardDescription>How will the customer receive this product?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="delivery-type">Delivery Method</Label>
                <Select id="delivery-type">
                  <option>Instant (API Integration)</option>
                  <option>Manual (Email within 24hrs)</option>
                  <option>Direct Download</option>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions for Buyer</Label>
                <Textarea id="instructions" placeholder="e.g. Scan the QR code to install your eSIM..." />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Media</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer mb-4">
                <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <UploadCloud className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium mb-1">Click to upload image</p>
                <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
              </div>
              
              <div className="flex gap-2 items-center text-sm text-muted-foreground p-3 rounded-lg bg-muted">
                <ImageIcon className="h-4 w-4 shrink-0" />
                <span>Upload a high-quality 1:1 image without text overlays for best results.</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="stock">Available Stock</Label>
                <Input id="stock" type="number" placeholder="Unlimited" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU (Optional)</Label>
                <Input id="sku" placeholder="Internal product code" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
