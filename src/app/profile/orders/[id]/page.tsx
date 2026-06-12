"use client";

import { useQuery, gql } from "@apollo/client";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Package, Calendar, Clock, MapPin, Truck, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const GET_ORDER = gql`
  query GetOrder($id: ID!) {
    getOrder(id: $id) {
      id
      totalAmount
      status
      createdAt
      estimatedDeliveryAt
      buyer {
        name
        email
        phone
        address
        zipCode
      }
      items {
        quantity
        priceAtTime
        product {
          id
          name
          brand
          images
        }
      }
    }
  }
`;

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const { data, loading, error } = useQuery(GET_ORDER, {
    variables: { id },
    fetchPolicy: "network-only"
  });

  if (loading) {
    return (
      <div className="container mx-auto py-24 flex items-center justify-center min-h-[50vh]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !data?.getOrder) {
    return (
      <div className="container mx-auto py-24 px-4">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-900 max-w-2xl mx-auto text-center">
          <p className="font-semibold mb-2">Error loading order</p>
          <p className="text-sm">{error?.message || "Order not found or you don't have permission to view it."}</p>
        </div>
      </div>
    );
  }

  const order = data.getOrder;
  const buyer = order.buyer;
  const createdAt = new Date(Number(order.createdAt));
  const estimatedDeliveryAt = order.estimatedDeliveryAt ? new Date(isNaN(Number(order.estimatedDeliveryAt)) ? order.estimatedDeliveryAt : Number(order.estimatedDeliveryAt)) : null;

  return (
    <div className="container mx-auto px-4 py-8 pb-20 max-w-4xl">
      <div className="mb-8 flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()} className="rounded-full shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Order Details</h1>
          <p className="text-muted-foreground">Order #{order.id.split('-')[0].toUpperCase()}</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Order Status Header */}
        <div className="rounded-2xl border bg-card p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-lg font-semibold">Status:</span>
              <Badge variant={order.status === 'PENDING' ? 'secondary' : order.status === 'DELIVERED' ? 'default' : 'outline'} className="rounded-full px-4 py-1 text-sm">
                {order.status}
              </Badge>
            </div>
            {estimatedDeliveryAt && (
              <div className={`flex items-center text-sm ${order.status === 'DELIVERED' ? 'text-green-600' : 'text-amber-600'}`}>
                {order.status === 'DELIVERED' ? (
                  <><CheckCircle2 className="h-4 w-4 mr-2" /> Delivered on {estimatedDeliveryAt.toLocaleDateString()} at {estimatedDeliveryAt.toLocaleTimeString()}</>
                ) : (
                  <><Truck className="h-4 w-4 mr-2" /> Expected Delivery: {estimatedDeliveryAt.toLocaleDateString()} at {estimatedDeliveryAt.toLocaleTimeString()}</>
                )}
              </div>
            )}
          </div>
          <div className="text-left md:text-right w-full md:w-auto p-4 bg-muted/30 rounded-xl">
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Order Total</p>
            <p className="text-3xl font-bold text-primary">₹{order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Info */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
              Order Information
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between">
                <span className="text-muted-foreground">Order ID</span>
                <span className="font-medium font-mono">{order.id}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Date Placed</span>
                <span className="font-medium">{createdAt.toLocaleDateString()}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Time Placed</span>
                <span className="font-medium">{createdAt.toLocaleTimeString()}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span className="font-medium">Credit Card (Demo)</span>
              </li>
            </ul>
          </div>

          {/* Shipping Info */}
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <MapPin className="mr-2 h-5 w-5 text-muted-foreground" />
              Shipping Address
            </h3>
            <div className="text-sm space-y-1">
              <p className="font-medium text-base">{buyer.name}</p>
              {buyer.phone ? <p className="text-muted-foreground">{buyer.phone}</p> : null}
              <p className="text-muted-foreground mt-2">
                {buyer.address || "No address provided"}
              </p>
              {buyer.zipCode ? <p className="text-muted-foreground">Zip Code: {buyer.zipCode}</p> : null}
              <p className="text-muted-foreground">{buyer.email}</p>
            </div>
          </div>
        </div>

        {/* Items List */}
        <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
          <div className="p-6 border-b bg-muted/10">
            <h3 className="font-semibold text-lg flex items-center">
              <Package className="mr-2 h-5 w-5 text-muted-foreground" />
              Order Items ({order.items.length})
            </h3>
          </div>
          <div className="divide-y">
            {order.items.map((item: any, idx: number) => {
              const p = item.product;
              const imageUrl = p.images && p.images.length > 0 ? p.images[0] : "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000&auto=format&fit=crop";
              
              return (
                <div key={idx} className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 hover:bg-muted/5 transition-colors">
                  <div className="relative h-24 w-24 bg-muted rounded-xl overflow-hidden shrink-0 border">
                    <Image src={imageUrl} alt={p.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-primary font-bold uppercase tracking-wider mb-1">{p.brand}</div>
                    <Link href={`/laptops/${p.id}`} className="font-semibold text-lg hover:text-primary transition-colors block truncate mb-1">
                      {p.name}
                    </Link>
                    <div className="text-sm text-muted-foreground flex gap-4">
                      <span>Qty: {item.quantity}</span>
                      <span>Price: ₹{item.priceAtTime.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                  <div className="text-right sm:pl-4 shrink-0 mt-2 sm:mt-0">
                    <div className="text-sm text-muted-foreground mb-1">Subtotal</div>
                    <div className="font-bold text-lg">₹{(item.quantity * item.priceAtTime).toLocaleString('en-IN')}</div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Order Summary Footer */}
          <div className="p-6 bg-muted/10 border-t flex justify-end">
            <div className="w-full sm:w-64 space-y-3">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-primary">₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
