"use client";

import { useState } from "react";
import { useQuery, useMutation, gql } from "@apollo/client";
import Link from "next/link";
import { Package, AlertCircle, Edit, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const GET_MY_PRODUCTS = gql`
  query GetMyProducts {
    getMyProducts {
      id
      name
      brand
      price
      stock
      status
      discountPercent
      createdAt
    }
  }
`;

const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $price: Float, $stock: Int, $discountPercent: Int) {
    updateProduct(id: $id, price: $price, stock: $stock, discountPercent: $discountPercent) {
      id
      price
      stock
      discountPercent
    }
  }
`;

const DELETE_PRODUCT = gql`
  mutation DeleteProduct($id: ID!) {
    deleteProduct(id: $id)
  }
`;

export default function MyProductsPage() {
  const { data, loading, error, refetch } = useQuery(GET_MY_PRODUCTS, {
    fetchPolicy: "network-only"
  });

  const [updateProduct] = useMutation(UPDATE_PRODUCT);
  const [deleteProduct] = useMutation(DELETE_PRODUCT);

  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editForm, setEditForm] = useState({ price: 0, stock: 0, discountPercent: 0 });

  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-destructive">
        <AlertCircle className="h-10 w-10" />
        <p>Error loading products: {error.message}</p>
      </div>
    );
  }

  const products = data?.getMyProducts || [];

  const handleEditClick = (product: any) => {
    setEditingProduct(product);
    setEditForm({
      price: product.price,
      stock: product.stock,
      discountPercent: product.discountPercent || 0
    });
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;
    try {
      await updateProduct({
        variables: {
          id: editingProduct.id,
          price: parseFloat(editForm.price.toString()),
          stock: parseInt(editForm.stock.toString()),
          discountPercent: parseInt(editForm.discountPercent.toString())
        }
      });
      setEditingProduct(null);
      refetch();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update product");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to completely delete this laptop listing? This action cannot be undone.")) return;
    try {
      setIsDeleting(id);
      await deleteProduct({ variables: { id } });
      refetch();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete product");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Products</h1>
          <p className="text-muted-foreground mt-1">
            Manage your laptop listings, run flash sales, and check approval status.
          </p>
        </div>
        <Link href="/dashboard/seller/new" className={buttonVariants({ className: "gap-2 shadow-md" })}>
          Add New Laptop
        </Link>
      </div>

      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="px-6 py-4 font-medium">Product Name</th>
                <th className="px-6 py-4 font-medium">Price</th>
                <th className="px-6 py-4 font-medium">Discount</th>
                <th className="px-6 py-4 font-medium">Stock</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package className="h-8 w-8 opacity-50" />
                      <p>You haven't listed any laptops yet.</p>
                      <Link href="/dashboard/seller/new" className={buttonVariants({ variant: "link", className: "mt-2" })}>
                        List your first product
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product: any) => (
                  <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">
                      <div className="flex flex-col">
                        <span>{product.name}</span>
                        <span className="text-xs text-muted-foreground font-normal">{product.brand}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-primary">
                      {product.discountPercent > 0 ? (
                        <div className="flex flex-col">
                          <span className="line-through text-xs text-muted-foreground">
                            ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                          <span>
                            ₹{(product.price * (1 - product.discountPercent / 100)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      ) : (
                        `₹${product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {product.discountPercent > 0 ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                          {product.discountPercent}% OFF
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        product.stock > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {product.stock} in stock
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize border ${
                        product.status === 'APPROVED' ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-900 dark:text-green-400' :
                        product.status === 'REJECTED' ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-900 dark:text-red-400' :
                        'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-900 dark:text-yellow-500'
                      }`}>
                        {product.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="h-8 px-2"
                          onClick={() => handleEditClick(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="h-8 px-2"
                          disabled={isDeleting === product.id}
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Quick Edit Product</DialogTitle>
          </DialogHeader>
          {editingProduct && (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="price">Base Price (₹)</Label>
                <Input 
                  id="price" 
                  type="number" 
                  value={editForm.price} 
                  onChange={(e) => setEditForm({...editForm, price: parseFloat(e.target.value) || 0})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount">Promotional Discount (%)</Label>
                <Input 
                  id="discount" 
                  type="number" 
                  min="0"
                  max="100"
                  value={editForm.discountPercent} 
                  onChange={(e) => setEditForm({...editForm, discountPercent: parseInt(e.target.value) || 0})} 
                />
                <p className="text-xs text-muted-foreground">
                  Set to 0 to remove the flash sale. A value {'>'} 0 will cross out the base price and show a red sale badge to buyers!
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Available Stock</Label>
                <Input 
                  id="stock" 
                  type="number" 
                  value={editForm.stock} 
                  onChange={(e) => setEditForm({...editForm, stock: parseInt(e.target.value) || 0})} 
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProduct(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
