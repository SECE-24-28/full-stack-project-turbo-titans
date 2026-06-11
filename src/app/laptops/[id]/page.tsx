"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Star, ShieldCheck, Truck, ArrowLeft, Heart, ShoppingCart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function ProductDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const [activeImage, setActiveImage] = useState(0);

  // Mock data for the product
  const laptop = {
    id,
    name: "MacBook Pro 16\"",
    brand: "Apple",
    price: 2499,
    originalPrice: 2699,
    rating: 4.9,
    reviews: 128,
    seller: "Apple Official Store",
    sellerRating: 4.9,
    stock: 15,
    description: "The most powerful MacBook Pro ever is here. With the blazing-fast M3 Max chip, you get game-changing performance and up to 22 hours of battery life. A stunning Liquid Retina XDR display makes it the best pro laptop.",
    images: [
      "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=1000&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=1000&auto=format&fit=crop"
    ],
    specs: {
      processor: "Apple M3 Max (16-core CPU)",
      ram: "36GB Unified Memory",
      storage: "1TB SSD",
      gpu: "40-core GPU",
      display: "16.2-inch Liquid Retina XDR display",
      os: "macOS Sonoma",
      weight: "4.8 lbs (2.16 kg)"
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/laptops" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Laptops
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted border">
            <Image
              src={laptop.images[activeImage]}
              alt={laptop.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <Button size="icon" variant="secondary" className="rounded-full shadow-sm bg-background/80 backdrop-blur-sm">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="secondary" className="rounded-full shadow-sm bg-background/80 backdrop-blur-sm hover:text-red-500">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {laptop.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(idx)}
                className={`relative aspect-[4/3] overflow-hidden rounded-xl border-2 transition-all ${activeImage === idx ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-primary/50'}`}
              >
                <Image src={img} alt={`Thumbnail ${idx+1}`} fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <Badge className="w-fit mb-4">{laptop.brand}</Badge>
          <h1 className="text-3xl font-bold sm:text-4xl">{laptop.name}</h1>
          
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              <span className="font-medium">{laptop.rating}</span>
            </div>
            <span className="text-muted-foreground underline cursor-pointer">{laptop.reviews} Reviews</span>
          </div>

          <div className="mt-6 flex items-baseline gap-4">
            <span className="text-4xl font-extrabold tracking-tight">${laptop.price.toLocaleString()}</span>
            <span className="text-xl text-muted-foreground line-through">${laptop.originalPrice.toLocaleString()}</span>
            <Badge variant="destructive" className="ml-2">Save ${(laptop.originalPrice - laptop.price).toLocaleString()}</Badge>
          </div>

          <p className="mt-6 text-base text-muted-foreground leading-relaxed">
            {laptop.description}
          </p>

          <div className="mt-8 space-y-4 rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium text-muted-foreground">Seller</span>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-500" />
                <span className="font-semibold">{laptop.seller}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-muted-foreground">Availability</span>
              <span className="font-semibold text-green-500">In Stock ({laptop.stock} left)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-muted-foreground">Shipping</span>
              <div className="flex items-center gap-2 text-primary">
                <Truck className="h-5 w-5" />
                <span className="font-semibold">Free Delivery</span>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="flex-1 rounded-full h-14 text-lg">
              Buy Now
            </Button>
            <Button size="lg" variant="outline" className="flex-1 rounded-full h-14 text-lg border-2">
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>

      {/* Details Tabs */}
      <div className="mt-16">
        <Tabs defaultValue="specs" className="w-full">
          <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-8 overflow-x-auto">
            <TabsTrigger value="specs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 py-4 text-base font-semibold">Specifications</TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 py-4 text-base font-semibold">Reviews</TabsTrigger>
            <TabsTrigger value="shipping" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 py-4 text-base font-semibold">Shipping & Returns</TabsTrigger>
          </TabsList>
          
          <TabsContent value="specs" className="p-6 rounded-xl border bg-card">
            <h3 className="text-xl font-bold mb-6">Technical Specifications</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              {Object.entries(laptop.specs).map(([key, value]) => (
                <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-border/50">
                  <span className="capitalize font-medium text-muted-foreground w-1/3">{key}</span>
                  <span className="font-medium text-foreground w-2/3">{value}</span>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="p-6 rounded-xl border bg-card">
            <div className="text-center py-12">
              <Star className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-xl font-bold">Reviews coming soon</h3>
              <p className="text-muted-foreground mt-2">Be the first to review this product!</p>
            </div>
          </TabsContent>
          
          <TabsContent value="shipping" className="p-6 rounded-xl border bg-card">
             <div className="space-y-6">
                <div>
                  <h4 className="font-bold flex items-center gap-2 mb-2"><Truck className="h-5 w-5 text-primary"/> Fast Shipping</h4>
                  <p className="text-muted-foreground">We offer free standard shipping on all orders. Express shipping is available for an additional fee during checkout.</p>
                </div>
                <div>
                  <h4 className="font-bold flex items-center gap-2 mb-2"><ShieldCheck className="h-5 w-5 text-primary"/> Returns Policy</h4>
                  <p className="text-muted-foreground">You can return any undamaged product within 30 days of purchase for a full refund. Return shipping is free.</p>
                </div>
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
