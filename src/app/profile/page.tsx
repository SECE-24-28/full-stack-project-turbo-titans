"use client";

import { useState, useEffect, Suspense } from "react";
import { User, Lock, Save, Loader2, Package, Calendar, Clock } from "lucide-react";
import { gql, useMutation, useQuery } from "@apollo/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      role
      phone
      address
      zipCode
    }
  }
`;

const GET_MY_ORDERS = gql`
  query GetMyOrders {
    getMyOrders {
      id
      totalAmount
      status
      createdAt
      estimatedDeliveryAt
      items {
        quantity
        priceAtTime
        product {
          id
          name
          images
        }
      }
    }
  }
`;

const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($name: String, $email: String, $phone: String, $address: String, $zipCode: String) {
    updateProfile(name: $name, email: $email, phone: $phone, address: $address, zipCode: $zipCode) {
      id
      name
      email
      phone
      address
      zipCode
    }
  }
`;

function ProfileContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "profile";
  const { data: userData, loading: userLoading } = useQuery(ME_QUERY);
  const { data: ordersData, loading: ordersLoading } = useQuery(GET_MY_ORDERS, {
    skip: !userData?.me,
    fetchPolicy: "network-only"
  });
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [profileForm, setProfileForm] = useState({ name: "", email: "", phone: "", address: "", zipCode: "" });

  useEffect(() => {
    if (userData?.me) {
      setProfileForm({ 
        name: userData.me.name || "", 
        email: userData.me.email || "",
        phone: userData.me.phone || "",
        address: userData.me.address || "",
        zipCode: userData.me.zipCode || ""
      });
    }
  }, [userData]);

  const [updateProfile, { loading: updatingProfile }] = useMutation(UPDATE_PROFILE_MUTATION, {
    onCompleted: () => {
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update profile", { description: error.message });
    }
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ variables: { 
      name: profileForm.name, 
      email: profileForm.email,
      phone: profileForm.phone,
      address: profileForm.address,
      zipCode: profileForm.zipCode
    } });
  };

  if (userLoading) {
    return (
      <div className="container mx-auto py-24 flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userData?.me) {
    return (
      <div className="container mx-auto py-24">
        <p className="text-center text-muted-foreground">You must be logged in to view this page.</p>
      </div>
    );
  }

  const orders = ordersData?.getMyOrders || [];

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-muted/30 md:flex">
        <div className="p-6">
          <h2 className="text-lg font-bold tracking-tight">Dashboard</h2>
        </div>
        <nav className="flex-1 space-y-1 px-4 py-2">
          <div className="mb-6">
            <h3 className="mb-2 px-2 text-xs font-semibold text-primary uppercase tracking-wider">USER PORTAL</h3>
            <button 
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ${activeTab === 'profile' ? 'bg-accent text-accent-foreground' : ''}`}
            >
              <User className="h-4 w-4" />
              Profile Information
            </button>
            <button 
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground mt-1 ${activeTab === 'orders' ? 'bg-accent text-accent-foreground' : ''}`}
            >
              <Package className="h-4 w-4" />
              My Orders
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-muted/10 p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Mobile Navigation (Visible only on small screens) */}
          <div className="md:hidden flex gap-2 mb-6 overflow-x-auto pb-2">
             <Button 
                variant={activeTab === 'profile' ? 'default' : 'outline'}
                onClick={() => setActiveTab("profile")}
                className="whitespace-nowrap rounded-full"
             >
                <User className="mr-2 h-4 w-4" /> Profile Information
             </Button>
             <Button 
                variant={activeTab === 'orders' ? 'default' : 'outline'}
                onClick={() => setActiveTab("orders")}
                className="whitespace-nowrap rounded-full"
             >
                <Package className="mr-2 h-4 w-4" /> My Orders
             </Button>
          </div>

          {activeTab === 'profile' && (
            <div className="rounded-2xl border bg-card text-card-foreground shadow-sm">
              <div className="flex flex-col space-y-1.5 p-6 md:p-8 border-b border-border/50">
                <h3 className="font-bold text-xl leading-none tracking-tight">
                  Profile Information
                </h3>
                <p className="text-sm text-muted-foreground mt-1.5">Update your account details here.</p>
              </div>
              <div className="p-6 md:p-8">
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      className="h-12 bg-muted/30"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      className="h-12 bg-muted/30"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number (Optional)</Label>
                    <Input
                      id="phone"
                      type="tel"
                      className="h-12 bg-muted/30"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Shipping Address</Label>
                    <Input
                      id="address"
                      className="h-12 bg-muted/30"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Zip Code</Label>
                    <Input
                      id="zipCode"
                      className="h-12 bg-muted/30"
                      value={profileForm.zipCode}
                      onChange={(e) => setProfileForm({ ...profileForm, zipCode: e.target.value })}
                    />
                  </div>
                  <div className="pt-4 flex flex-col sm:flex-row items-center gap-4 justify-between border-t border-border/50">
                    <Button type="submit" size="lg" disabled={updatingProfile} className="w-full sm:w-auto rounded-full">
                      {updatingProfile ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Changes
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="lg"
                      className="w-full sm:w-auto rounded-full"
                      onClick={() => window.location.href = '/change-password'}
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      Change Password
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="rounded-2xl border bg-card text-card-foreground shadow-sm overflow-hidden">
              <div className="flex flex-col space-y-1.5 p-6 md:p-8 border-b border-border/50 bg-muted/30">
                <h3 className="font-bold text-xl leading-none tracking-tight">
                  Order History
                </h3>
                <p className="text-sm text-muted-foreground mt-1.5">Check the status of your recent purchases.</p>
              </div>
              
              <div className="p-0">
                {ordersLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                    <Package className="h-16 w-16 text-muted-foreground opacity-50 mb-4" />
                    <h3 className="text-xl font-semibold">No orders yet</h3>
                    <p className="text-muted-foreground mt-2 max-w-sm mb-6">You haven't placed any orders. Discover our amazing laptops and make your first purchase!</p>
                    <Link href="/">
                      <Button className="rounded-full">Start Shopping</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {orders.map((order: any) => (
                      <div 
                        key={order.id} 
                        onClick={() => router.push(`/profile/orders/${order.id}`)}
                        className="p-6 md:p-8 hover:bg-muted/10 transition-colors cursor-pointer"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-lg">{order.id.split('-')[0].toUpperCase()}</span>
                              <Badge variant={order.status === 'PENDING' ? 'secondary' : order.status === 'DELIVERED' ? 'default' : 'outline'} className="rounded-full">
                                {order.status}
                              </Badge>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center"><Calendar className="h-4 w-4 mr-1.5" /> Ordered: {new Date(Number(order.createdAt)).toLocaleDateString()} at {new Date(Number(order.createdAt)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                              {order.estimatedDeliveryAt && (
                                <span className={`flex items-center ${order.status === 'PENDING' ? 'text-amber-500 font-medium' : 'text-green-600 font-medium'}`}>
                                  <Clock className="h-4 w-4 mr-1.5" /> 
                                  {order.status === 'PENDING' ? 'Expected Delivery: ' : 'Delivered at: '}
                                  {new Date(isNaN(Number(order.estimatedDeliveryAt)) ? order.estimatedDeliveryAt : Number(order.estimatedDeliveryAt)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-left md:text-right">
                            <div className="text-sm text-muted-foreground uppercase tracking-wider mb-1">Total Amount</div>
                            <div className="text-2xl font-bold text-primary">₹{order.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {order.items.map((item: any, idx: number) => {
                            const p = item.product;
                            const imageUrl = p.images && p.images.length > 0 ? p.images[0] : "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000&auto=format&fit=crop";
                            
                            return (
                              <div key={idx} className="flex items-center gap-4 bg-background border rounded-xl p-3">
                                <div className="relative h-16 w-16 bg-muted rounded-md overflow-hidden shrink-0">
                                  <Image src={imageUrl} alt={p.name} fill className="object-cover" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium line-clamp-1">
                                    {p.name}
                                  </div>
                                  <div className="text-sm text-muted-foreground mt-1">
                                    Qty: {item.quantity} × ₹{item.priceAtTime.toLocaleString('en-IN')}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        
                        <div className="mt-6 flex justify-end">
                          <Link href={`/profile/orders/${order.id}`}>
                            <Button variant="outline" size="sm" className="rounded-full">
                              View Order Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="container mx-auto py-24 flex items-center justify-center min-h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <ProfileContent />
    </Suspense>
  );
}
