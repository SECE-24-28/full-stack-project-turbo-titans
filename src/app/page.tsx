"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Cpu, Shield, Zap, Star, Heart, Package } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";

import { useQuery, useMutation, gql } from "@apollo/client";

const GET_PUBLIC_PRODUCTS = gql`
  query GetPublicProducts {
    getPublicProducts {
      id
      name
      brand
      processor
      ram
      storage
      price
      discountPercent
      images
    }
  }
`;

const GET_WISHLIST = gql`
  query GetWishlist {
    getWishlist {
      id
    }
  }
`;

const TOGGLE_WISHLIST = gql`
  mutation ToggleWishlist($productId: ID!) {
    toggleWishlist(productId: $productId)
  }
`;

const ADD_TO_CART = gql`
  mutation AddToCart($productId: ID!) {
    addToCart(productId: $productId)
  }
`;

const features = [
  {
    icon: <Cpu className="h-6 w-6 text-primary" />,
    title: "Latest Processors",
    description: "Discover laptops with the newest and most powerful chips for extreme performance.",
  },
  {
    icon: <Zap className="h-6 w-6 text-primary" />,
    title: "Fast Delivery",
    description: "Get your new laptop delivered securely and quickly right to your doorstep.",
  },
  {
    icon: <Shield className="h-6 w-6 text-primary" />,
    title: "Buyer Protection",
    description: "Every purchase is protected with our comprehensive warranty and return policy.",
  },
];

export default function Home() {
  const { data, loading, error } = useQuery(GET_PUBLIC_PRODUCTS, {
    fetchPolicy: "network-only"
  });

  const { data: wishlistData, refetch: refetchWishlist } = useQuery(GET_WISHLIST, {
    fetchPolicy: "network-only"
  });

  const [toggleWishlist] = useMutation(TOGGLE_WISHLIST);
  const [addToCart] = useMutation(ADD_TO_CART);

  const laptops = data?.getPublicProducts || [];
  const wishlistIds = wishlistData?.getWishlist?.map((w: any) => w.id) || [];

  const handleWishlistToggle = async (productId: string) => {
    try {
      await toggleWishlist({ variables: { productId } });
      refetchWishlist();
    } catch (err: any) {
      if (err.message.includes("Not authenticated")) {
        alert("Please log in to save items to your wishlist!");
      } else {
        alert("Failed to update wishlist");
      }
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart({ variables: { productId } });
      alert("Added to cart successfully!");
      // We could use Apollo client cache or refetch the navbar query here, 
      // but reloading the page is easiest to update the navbar badge if we don't have a global state
      // Actually, since GET_CART is a different query, it might not automatically update unless we refetch it.
      // But we will let the navbar update on navigation or we could refresh
      window.location.reload(); 
    } catch (err: any) {
      if (err.message.includes("Not authenticated")) {
        alert("Please log in to add items to your cart!");
      } else {
        alert("Failed to add to cart");
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background pt-16 md:pt-24 lg:pt-32 pb-16">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-50 blur-[100px]"></div>
        
        <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl"
            >
              <h1 className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground">
                The Ultimate <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">
                  Laptop Marketplace
                </span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
                Discover the best laptops for gaming, programming, and business from verified sellers. Upgrade your digital experience today.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="#trending" className={buttonVariants({ size: "lg", className: "rounded-full px-8" })}>
                  Shop Now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
                <Link href="/register" className={buttonVariants({ size: "lg", variant: "outline", className: "rounded-full px-8 bg-background/50 backdrop-blur-sm" })}>
                  Become a Seller
                </Link>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative mx-auto w-full max-w-lg lg:max-w-none"
            >
              <div className="relative rounded-2xl bg-card border shadow-2xl overflow-hidden glassmorphism p-2">
                <Image
                  src="https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=1200&auto=format&fit=crop"
                  alt="Premium Laptop"
                  width={800}
                  height={600}
                  className="rounded-xl w-full object-cover"
                  priority
                />
              </div>
              {/* Floating badges */}
              <motion.div 
                animate={{ y: [0, -10, 0] }} 
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute -right-4 top-10 rounded-full border bg-background/80 backdrop-blur-md px-4 py-2 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 fill-primary text-primary" />
                  <span className="text-sm font-bold">4.9/5 Rating</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section id="trending" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Trending Laptops</h2>
            <Link href="#trending" className="text-primary hover:underline font-medium flex items-center">
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="text-center text-destructive py-12">
              Failed to load laptops. Please try again.
            </div>
          ) : laptops.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No laptops currently available in the marketplace.</p>
              <p className="text-sm mt-2">Admins must approve seller listings before they appear here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {laptops.map((laptop: any, index: number) => {
                const isDiscounted = laptop.discountPercent > 0;
                const salePrice = isDiscounted ? laptop.price * (1 - laptop.discountPercent / 100) : laptop.price;
                const imageUrl = laptop.images && laptop.images.length > 0 ? laptop.images[0] : "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=1000&auto=format&fit=crop";

                return (
                  <motion.div
                    key={laptop.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="group relative rounded-2xl border bg-card p-4 transition-all hover:shadow-xl dark:hover:shadow-primary/5 flex flex-col"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted mb-4">
                      <Image
                        src={imageUrl}
                        alt={laptop.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <button 
                        onClick={() => handleWishlistToggle(laptop.id)}
                        className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:scale-110 active:scale-95"
                      >
                        <Heart 
                          className={`h-4 w-4 transition-colors ${
                            wishlistIds.includes(laptop.id) 
                              ? "fill-red-500 text-red-500" 
                              : "text-muted-foreground hover:text-red-500"
                          }`} 
                        />
                      </button>
                      {isDiscounted && (
                        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                          {laptop.discountPercent}% OFF
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col">
                      <div className="text-xs font-semibold text-primary mb-1 uppercase tracking-wider">{laptop.brand}</div>
                      <h3 className="font-semibold text-lg line-clamp-1">{laptop.name}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 mt-1">
                        {laptop.processor} • {laptop.ram} • {laptop.storage}
                      </p>
                      <div className="mt-auto flex items-end justify-between pt-2">
                        <div className="flex flex-col">
                          {isDiscounted && (
                            <span className="text-xs text-muted-foreground line-through">
                              ₹{laptop.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          )}
                          <span className="font-bold text-lg text-primary">
                            ₹{salePrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <Button size="sm" className="rounded-full">Add to Cart</Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Why Choose Lap Mart?</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We provide the best platform for buying and selling premium laptops with guaranteed security and support.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col items-center text-center p-6 rounded-2xl border bg-card hover:bg-muted/50 transition-colors"
              >
                <div className="p-4 rounded-full bg-primary/10 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
