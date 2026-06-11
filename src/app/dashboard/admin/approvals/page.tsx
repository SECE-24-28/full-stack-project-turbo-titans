"use client";

import { useQuery, useMutation, gql } from "@apollo/client";
import Image from "next/image";
import Link from "next/link";
import { Check, X, AlertCircle, ArrowRight } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

const GET_PENDING_PRODUCTS = gql`
  query GetPendingProducts {
    getPendingProducts {
      id
      name
      brand
      price
      images
      processor
      ram
      storage
      createdAt
      seller {
        name
        email
      }
    }
  }
`;

const UPDATE_PRODUCT_STATUS = gql`
  mutation UpdateProductStatus($id: ID!, $status: String!) {
    updateProductStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export default function AdminApprovalsPage() {
  const { data, loading, error, refetch } = useQuery(GET_PENDING_PRODUCTS, {
    fetchPolicy: "network-only"
  });

  const [updateStatus] = useMutation(UPDATE_PRODUCT_STATUS);

  const handleStatusChange = async (id: string, status: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault(); // Prevent navigating if they click the button
    try {
      await updateStatus({ variables: { id, status } });
      refetch();
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-900">
        Error loading pending products: {error.message}
      </div>
    );
  }

  const products = data?.getPendingProducts || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Approval Window</h1>
        <p className="text-muted-foreground">Review and approve laptops submitted by sellers to make them live on the marketplace. Click any laptop to view its full details.</p>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border bg-card">
          <div className="h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-6">
            <Check className="h-10 w-10 text-green-600 dark:text-green-500" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">All Caught Up!</h2>
          <p className="text-muted-foreground">There are no pending laptops requiring your approval right now.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {products.map((product: any) => (
            <Link 
              key={product.id} 
              href={`/dashboard/admin/approvals/${product.id}`}
              className="flex flex-col sm:flex-row gap-6 rounded-2xl border bg-card p-6 shadow-sm hover:border-primary/50 hover:shadow-md transition-all group"
            >
              <div className="relative h-40 w-full sm:w-56 shrink-0 overflow-hidden rounded-xl bg-muted">
                <Image
                  src={product.images && product.images.length > 0 ? product.images[0] : "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000&auto=format&fit=crop"}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-xs font-semibold text-primary uppercase tracking-wider">{product.brand}</span>
                      <h3 className="font-semibold text-xl mt-1 group-hover:text-primary transition-colors">{product.name}</h3>
                    </div>
                    <span className="font-bold text-xl">₹{product.price.toLocaleString('en-IN')}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-sm">
                    <div><span className="text-muted-foreground">Processor:</span> {product.processor}</div>
                    <div><span className="text-muted-foreground">RAM:</span> {product.ram}</div>
                    <div><span className="text-muted-foreground">Storage:</span> {product.storage}</div>
                    <div><span className="text-muted-foreground">Seller:</span> <span className="font-medium">{product.seller.name}</span></div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mt-6 pt-4 border-t">
                  <Button 
                    onClick={(e) => handleStatusChange(product.id, "APPROVED", e)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Approve
                  </Button>
                  <Button 
                    onClick={(e) => handleStatusChange(product.id, "REJECTED", e)}
                    variant="outline" 
                    className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10 gap-2 border-red-200 dark:border-red-900/30"
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </Button>
                  <div className={`flex items-center justify-center px-4 ${buttonVariants({ variant: "secondary" })} gap-2`}>
                    View Details
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
