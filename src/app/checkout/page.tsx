"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery, useMutation, gql } from "@apollo/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, CreditCard, ShoppingBag, Truck } from "lucide-react";

const GET_CART = gql`
  query GetCart {
    getCart {
      id
      quantity
      product {
        id
        name
        brand
        price
        discountPercent
        images
        stock
      }
    }
  }
`;

const CHECKOUT = gql`
  mutation Checkout($address: String!, $city: String!, $zipCode: String!, $phone: String!) {
    checkout(address: $address, city: $city, zipCode: $zipCode, phone: $phone)
  }
`;

export default function CheckoutPage() {
  const router = useRouter();
  const { data, loading, error } = useQuery(GET_CART, {
    fetchPolicy: "network-only"
  });

  const [checkout] = useMutation(CHECKOUT);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
    phone: "",
    cardNumber: "",
    expiryDate: "",
    cvv: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const response = await checkout({
        variables: {
          address: formData.address,
          city: formData.city,
          zipCode: formData.zipCode,
          phone: formData.phone
        }
      });
      
      const orderId = response.data.checkout;
      toast.success("Order placed successfully!");
      window.dispatchEvent(new Event('cart-updated')); // Dispatch event to update navbar cart count to 0
      router.push(`/checkout/success?orderId=${orderId}`);
    } catch (err: any) {
      toast.error("Failed to process order: " + err.message);
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 flex justify-center items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const cartItems = data?.getCart || [];

  if (cartItems.length === 0 && !isProcessing) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">You need items in your cart to checkout.</p>
        <Link href="/">
          <Button>Back to Store</Button>
        </Link>
      </div>
    );
  }

  // Calculations
  const subtotal = cartItems.reduce((acc: number, item: any) => {
    const p = item.product;
    const isDiscounted = p.discountPercent > 0;
    const price = isDiscounted ? p.price * (1 - p.discountPercent / 100) : p.price;
    return acc + (price * item.quantity);
  }, 0);
  
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/cart" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Return to Cart
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <Truck className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-8">
          <form id="checkout-form" onSubmit={handleCheckout} className="space-y-8">
            {/* Contact Info */}
            <div className="bg-card border rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input required id="firstName" name="firstName" value={formData.firstName} onChange={handleInputChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input required id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input required type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input required id="phone" name="phone" value={formData.phone} onChange={handleInputChange} />
                </div>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="bg-card border rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="address">Street Address</Label>
                  <Input required id="address" name="address" value={formData.address} onChange={handleInputChange} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input required id="city" name="city" value={formData.city} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">Postal / Zip Code</Label>
                    <Input required id="zipCode" name="zipCode" value={formData.zipCode} onChange={handleInputChange} />
                  </div>
                </div>
              </div>
            </div>

            {/* Mock Payment */}
            <div className="bg-card border rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Payment Details</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-6">This is a secure mock payment gateway. No real charges will be made.</p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input required id="cardNumber" name="cardNumber" placeholder="0000 0000 0000 0000" maxLength={19} value={formData.cardNumber} onChange={handleInputChange} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiryDate">Expiry Date</Label>
                    <Input required id="expiryDate" name="expiryDate" placeholder="MM/YY" maxLength={5} value={formData.expiryDate} onChange={handleInputChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input required type="password" id="cvv" name="cvv" placeholder="123" maxLength={4} value={formData.cvv} onChange={handleInputChange} />
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 rounded-2xl border bg-card p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 mb-6">
              {cartItems.map((item: any) => {
                const p = item.product;
                const isDiscounted = p.discountPercent > 0;
                const price = isDiscounted ? p.price * (1 - p.discountPercent / 100) : p.price;
                const imageUrl = p.images && p.images.length > 0 ? p.images[0] : "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000&auto=format&fit=crop";

                return (
                  <div key={item.id} className="flex gap-4">
                    <div className="relative h-16 w-16 rounded-md bg-muted overflow-hidden shrink-0">
                      <Image src={imageUrl} alt={p.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <span className="font-medium line-clamp-1 text-sm">{p.name}</span>
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Qty: {item.quantity}</span>
                        <span className="font-medium text-foreground">₹{(price * item.quantity).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Estimated Tax (8%)</span>
                <span>₹{tax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Shipping</span>
                <span className="text-green-500 font-medium">Free</span>
              </div>
              
              <Separator className="my-4" />
              
              <div className="flex justify-between items-center font-bold text-xl">
                <span>Total</span>
                <span className="text-primary">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>

            <Button 
              type="submit" 
              form="checkout-form"
              size="lg" 
              className="w-full mt-8 rounded-full text-lg h-14"
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Place Order"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
