"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation, gql } from "@apollo/client";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag, ShoppingCart } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

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
        processor
        ram
        storage
        stock
      }
    }
  }
`;

const REMOVE_FROM_CART = gql`
  mutation RemoveFromCart($productId: ID!) {
    removeFromCart(productId: $productId)
  }
`;

const UPDATE_CART_QUANTITY = gql`
  mutation UpdateCartQuantity($productId: ID!, $quantity: Int!) {
    updateCartQuantity(productId: $productId, quantity: $quantity)
  }
`;

export default function CartPage() {
  const { data, loading, error, refetch } = useQuery(GET_CART, {
    fetchPolicy: "network-only"
  });

  const [removeFromCart] = useMutation(REMOVE_FROM_CART);
  const [updateCartQuantity] = useMutation(UPDATE_CART_QUANTITY);

  const cartItems = data?.getCart || [];

  const handleRemove = async (productId: string) => {
    try {
      await removeFromCart({ variables: { productId } });
      refetch();
    } catch (err: any) {
      alert("Failed to remove item.");
    }
  };

  const handleQuantityChange = async (productId: string, currentQuantity: number, change: number) => {
    const newQuantity = currentQuantity + change;
    if (newQuantity < 1) return; // Prevent going below 1 (use remove button instead)
    
    try {
      await updateCartQuantity({ variables: { productId, quantity: newQuantity } });
      refetch();
    } catch (err: any) {
      alert("Failed to update quantity.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error && error.message.includes("Not authenticated")) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Please Log In</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          You need to be logged into an account to view and manage your shopping cart.
        </p>
        <Link href="/login" className={buttonVariants({ size: "lg" })}>
          Log In
        </Link>
      </div>
    );
  }

  // Calculate Subtotal with Sales included
  const subtotal = cartItems.reduce((acc: number, item: any) => {
    const p = item.product;
    const isDiscounted = p.discountPercent > 0;
    const price = isDiscounted ? p.price * (1 - p.discountPercent / 100) : p.price;
    return acc + (price * item.quantity);
  }, 0);
  
  const tax = subtotal * 0.08;
  const total = subtotal + tax;

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 mb-8">
        <ShoppingCart className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Shopping Cart</h1>
      </div>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-6">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-8">Looks like you haven't added any laptops yet.</p>
          <Link href="/#trending" className={buttonVariants({ size: "lg", className: "rounded-full" })}>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item: any) => {
              const p = item.product;
              const isDiscounted = p.discountPercent > 0;
              const price = isDiscounted ? p.price * (1 - p.discountPercent / 100) : p.price;
              const imageUrl = p.images && p.images.length > 0 ? p.images[0] : "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000&auto=format&fit=crop";

              return (
                <div key={item.id} className="flex flex-col sm:flex-row gap-6 rounded-2xl border bg-card p-4 sm:p-6 shadow-sm">
                  <div className="relative h-32 w-full sm:w-48 shrink-0 overflow-hidden rounded-xl bg-muted">
                    <Image
                      src={imageUrl}
                      alt={p.name}
                      fill
                      className="object-cover"
                    />
                    {isDiscounted && (
                      <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                        {p.discountPercent}% OFF
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-xs font-semibold text-primary uppercase tracking-wider">{p.brand}</span>
                        <Link href={`/laptops/${p.id}`} className="hover:text-primary transition-colors">
                          <h3 className="font-semibold text-lg line-clamp-1 mt-1">{p.name}</h3>
                        </Link>
                        <p className="text-sm text-muted-foreground mt-1">{p.processor} • {p.ram} • {p.storage}</p>
                      </div>
                      <div className="flex flex-col items-end text-right">
                        {isDiscounted && (
                           <span className="text-xs text-muted-foreground line-through">
                             ₹{p.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                           </span>
                        )}
                        <span className="font-bold text-xl text-primary">
                          ₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center gap-3 bg-muted/50 rounded-full p-1 border">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full"
                          onClick={() => handleQuantityChange(p.id, item.quantity, -1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="font-semibold text-sm w-4 text-center">{item.quantity}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full"
                          onClick={() => handleQuantityChange(p.id, item.quantity, 1)}
                          disabled={item.quantity >= p.stock}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleRemove(p.id)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border bg-card p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              
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

              <Button size="lg" className="w-full mt-8 rounded-full text-lg h-14 group">
                Checkout <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              
              <p className="text-xs text-center text-muted-foreground mt-6">
                Secure checkout. 30-day money-back guarantee.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
