"use client";

import { useQuery, gql, useMutation } from "@apollo/client";
import { ShoppingCart, Package, MapPin, Calendar, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { buttonVariants, Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

const GET_SELLER_ORDERS = gql`
  query GetSellerOrders {
    getSellerOrders {
      id
      quantity
      priceAtTime
      createdAt
      product {
        id
        name
        images
        brand
      }
      order {
        id
        status
        estimatedDeliveryAt
        buyer {
          name
          email
          phone
          address
        }
      }
    }
  }
`;

const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($id: ID!, $status: String!) {
    updateOrderStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export default function SellerOrdersPage() {
  const { data, loading, error, refetch } = useQuery(GET_SELLER_ORDERS, {
    fetchPolicy: "network-only"
  });

  const [updateStatus, { loading: updating }] = useMutation(UPDATE_ORDER_STATUS, {
    onCompleted: () => {
      toast.success("Order marked as Delivered!");
      refetch();
    },
    onError: (err) => toast.error("Failed to update status: " + err.message)
  });

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-900 mt-8 mx-4">
        Failed to load orders: {error.message}
      </div>
    );
  }

  const orderItems = data?.getSellerOrders || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage laptop orders from your customers.
          </p>
        </div>
      </div>

      {orderItems.length === 0 ? (
        <div className="rounded-xl border bg-card shadow-sm p-12 flex flex-col items-center justify-center text-center">
          <ShoppingCart className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Orders Yet</h2>
          <p className="text-muted-foreground max-w-md mb-6">
            You haven't received any orders for your laptops yet. Make sure your listings are active and approved!
          </p>
          <Link href="/dashboard/seller/products" className={buttonVariants({ variant: "outline" })}>
            Manage My Products
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orderItems.map((item: any) => {
            const p = item.product;
            const o = item.order;
            const buyer = o.buyer;
            const imageUrl = p.images && p.images.length > 0 ? p.images[0] : "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000&auto=format&fit=crop";
            
            return (
              <div key={item.id} className="rounded-xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="bg-muted/50 px-6 py-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                    <div>
                      <div className="text-sm text-muted-foreground font-medium mb-1 flex items-center gap-1">
                        <Calendar className="h-4 w-4" /> Ordered On
                      </div>
                      <div className="font-semibold text-sm">
                        {new Date(parseInt(item.createdAt)).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground font-medium mb-1">
                        Total Amount
                      </div>
                      <div className="font-semibold text-sm">
                        ₹{(item.priceAtTime * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground font-medium mb-1">
                        Order Status
                      </div>
                      <Badge variant={o.status === "DELIVERED" ? "default" : "secondary"} className="font-semibold">
                        {o.status === "DELIVERED" ? (
                          <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3"/> Delivered</span>
                        ) : (
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3"/> Pending</span>
                        )}
                      </Badge>
                    </div>
                  </div>
                  
                  {o.status === "PENDING" && (
                    <Button 
                      size="sm" 
                      disabled={updating}
                      onClick={() => updateStatus({ variables: { id: o.id, status: "DELIVERED" } })}
                    >
                      Mark as Delivered
                    </Button>
                  )}
                </div>

                <div className="p-6 flex flex-col md:flex-row gap-8">
                  {/* Product Details */}
                  <div className="flex-1">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Package className="h-5 w-5 text-primary" /> Item Details
                    </h3>
                    <div className="flex gap-4">
                      <div className="relative h-24 w-24 rounded-lg overflow-hidden border bg-muted shrink-0">
                        <Image src={imageUrl} alt={p.name} fill className="object-cover" />
                      </div>
                      <div>
                        <Badge className="mb-2" variant="outline">{p.brand}</Badge>
                        <Link href={`/laptops/${p.id}`} className="font-bold text-lg hover:text-primary transition-colors block line-clamp-1">
                          {p.name}
                        </Link>
                        <div className="text-muted-foreground mt-1">
                          Qty: {item.quantity} × ₹{item.priceAtTime.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Details */}
                  <div className="md:w-1/3 bg-muted/30 p-4 rounded-lg border">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-primary" /> Shipping To
                    </h3>
                    <div className="text-sm space-y-2">
                      <div className="font-medium text-foreground">{buyer.name}</div>
                      <div className="text-muted-foreground">{buyer.email}</div>
                      {buyer.phone && <div className="text-muted-foreground">{buyer.phone}</div>}
                      {buyer.address && (
                        <div className="text-muted-foreground pt-2 border-t mt-2">
                          {buyer.address}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
