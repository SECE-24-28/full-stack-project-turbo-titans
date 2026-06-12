"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, Shield, Zap, Heart, Package, Flame, Clock, 
  Gamepad2, Briefcase, Palette, GraduationCap, Truck, CreditCard, RotateCcw,
  Cpu, Sparkles, Scan
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { useQuery, useMutation, gql } from "@apollo/client";
import { toast } from "sonner";
import { LuxuryCard } from "@/components/ui/luxury-card";

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
      createdAt
    }
  }
`;

const GET_MY_ORDERS = gql`
  query GetMyOrders {
    getMyOrders {
      id
      items {
        product {
          brand
          processor
          ram
        }
      }
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

const heroSlides = [
  {
    title: "The Ultimate Gaming Experience",
    subtitle: "Level up your gameplay with the latest RTX 40-Series laptops.",
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=1200&auto=format&fit=crop",
    gradient: "from-premium-violet/50 to-electric-blue/50"
  },
  {
    title: "Unleash Your Creativity",
    subtitle: "Color-accurate OLED displays and massive power for creators.",
    image: "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?q=80&w=1200&auto=format&fit=crop",
    gradient: "from-electric-blue/50 to-teal-600/50"
  }
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const { data, loading, error } = useQuery(GET_PUBLIC_PRODUCTS);

  const { data: wishlistData, refetch: refetchWishlist } = useQuery(GET_WISHLIST, {
    fetchPolicy: "network-only",
    errorPolicy: "ignore"
  });

  const { data: ordersData, loading: ordersLoading } = useQuery(GET_MY_ORDERS, {
    fetchPolicy: "network-only",
    errorPolicy: "ignore"
  });

  const [toggleWishlist] = useMutation(TOGGLE_WISHLIST);
  const [addToCart] = useMutation(ADD_TO_CART);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const laptops = data?.getPublicProducts || [];
  const wishlistIds = wishlistData?.getWishlist?.map((w: any) => w.id) || [];
  const myOrders = ordersData?.getMyOrders || [];

  const discountedLaptops = [...laptops].filter(l => l.discountPercent > 0).sort((a, b) => b.discountPercent - a.discountPercent).slice(0, 4);
  const newArrivals = [...laptops].sort((a, b) => parseInt(b.createdAt) - parseInt(a.createdAt)).slice(0, 4);

  // Recommendation Engine Logic
  let recommendations = [];
  if (myOrders.length > 0) {
    // Find preferred brands/specs based on previous orders
    const preferredBrands = new Set();
    myOrders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        if (item.product?.brand) preferredBrands.add(item.product.brand);
      });
    });
    
    recommendations = [...laptops]
      .filter(l => preferredBrands.has(l.brand))
      .slice(0, 4);
      
    // If not enough recommendations from preferred brands, fill with random
    if (recommendations.length < 4) {
      const remaining = [...laptops].filter(l => !preferredBrands.has(l.brand)).slice(0, 4 - recommendations.length);
      recommendations = [...recommendations, ...remaining];
    }
  } else {
    // If no orders, just pick 4 random/top laptops
    recommendations = [...laptops].sort(() => 0.5 - Math.random()).slice(0, 4);
  }

  const handleWishlistToggle = async (productId: string) => {
    try {
      await toggleWishlist({ variables: { productId } });
      refetchWishlist();
    } catch (err: any) {
      if (err.message.includes("Not authenticated")) {
        toast.error("Please log in to save items to your wishlist!");
      } else {
        toast.error("Failed to update wishlist");
      }
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart({ variables: { productId } });
      toast.success("Added to cart successfully!");
      window.location.reload(); 
    } catch (err: any) {
      if (err.message.includes("Not authenticated")) {
        toast.error("Please log in to add items to your cart!");
      } else {
        toast.error("Failed to add to cart");
      }
    }
  };

  const renderProductCard = (laptop: any, index: number, isDeal: boolean = false) => {
    const isDiscounted = laptop.discountPercent > 0;
    const salePrice = isDiscounted ? laptop.price * (1 - laptop.discountPercent / 100) : laptop.price;
    const imageUrl = laptop.images && laptop.images.length > 0 ? laptop.images[0] : "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=1000&auto=format&fit=crop";

    return (
      <motion.div
        key={laptop.id}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
      >
        <LuxuryCard className={`h-full flex flex-col p-5 ${isDeal ? 'border-orange-500/30' : ''}`}>
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-primary/10 dark:bg-deep-black/50 mb-5 flex items-center justify-center p-4">
            <Link href={`/laptops/${laptop.id}`} className="relative w-full h-full">
              <Image
                src={imageUrl}
                alt={laptop.name}
                fill
                className="object-contain transition-transform duration-700 group-hover:scale-110 drop-shadow-xl mix-blend-multiply dark:mix-blend-normal"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
            </Link>
            <button 
              onClick={(e) => { e.preventDefault(); handleWishlistToggle(laptop.id); }}
              className="absolute top-3 right-3 bg-black/50 backdrop-blur-md rounded-full p-2.5 opacity-0 group-hover:opacity-100 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:bg-black/80 hover:scale-110 z-10"
            >
              <Heart 
                className={`h-5 w-5 transition-colors ${
                  wishlistIds.includes(laptop.id) 
                    ? "fill-red-500 text-red-500" 
                    : "text-white hover:text-red-500"
                }`} 
              />
            </button>
            {isDiscounted && (
              <div className="absolute top-3 left-3 bg-red-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-[0_0_20px_rgba(220,38,38,0.5)] pointer-events-none">
                <Flame className="h-3.5 w-3.5" />
                {laptop.discountPercent}% OFF
              </div>
            )}
          </div>
          <div className="flex-1 flex flex-col z-10">
            <div className="text-xs font-bold text-primary dark:text-electric-blue mb-2 uppercase tracking-[0.2em]">{laptop.brand}</div>
            <Link href={`/laptops/${laptop.id}`} className="hover:text-primary dark:hover:text-premium-violet transition-colors">
              <h3 className="font-bold text-xl line-clamp-1 mb-2 tracking-tight text-foreground">{laptop.name}</h3>
            </Link>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-5 mt-1 font-medium bg-muted/50 dark:bg-black/20 p-2 rounded-md border border-border/50 dark:border-white/5">
              <Cpu className="h-4 w-4 text-foreground/50 dark:text-metallic-silver" />
              <span className="line-clamp-1">{laptop.processor} • {laptop.ram} • {laptop.storage}</span>
            </div>
            <div className="mt-auto flex items-end justify-between pt-3 border-t border-border/50 dark:border-white/10">
              <div className="flex flex-col">
                {isDiscounted && (
                  <span className="text-sm text-muted-foreground line-through decoration-red-500/50">
                    ₹{laptop.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                )}
                <span className={`font-black text-2xl tracking-tight ${isDeal ? 'text-orange-500' : 'text-foreground dark:text-white dark:drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]'}`}>
                  ₹{salePrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <Button size="default" onClick={(e) => { e.preventDefault(); handleAddToCart(laptop.id); }} className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-white dark:text-black dark:hover:bg-metallic-silver font-bold dark:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all hover:scale-105 active:scale-95">
                Buy Now
              </Button>
            </div>
          </div>
        </LuxuryCard>
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background dark:bg-deep-black text-foreground dark:text-white selection:bg-primary dark:selection:bg-electric-blue selection:text-primary-foreground dark:selection:text-white">
      
      {/* 1. Ultra-Premium Hero Section */}
      <section className="relative h-[85vh] w-full overflow-hidden bg-background dark:bg-deep-black">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <Image
              src={heroSlides[currentSlide].image}
              alt="Hero"
              fill
              className="object-cover opacity-60"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/50 to-transparent dark:from-deep-black/90 dark:via-deep-black/50"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent dark:from-deep-black"></div>
            
            <div className="container relative z-10 mx-auto px-6 h-full flex flex-col justify-center items-start pt-20">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                className="max-w-3xl"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 dark:border-white/20 bg-background/50 dark:bg-white/5 backdrop-blur-md mb-6">
                  <Sparkles className="h-4 w-4 text-primary dark:text-electric-blue" />
                  <span className="text-sm font-semibold tracking-widest uppercase text-foreground/80 dark:text-metallic-silver">Next-Gen Technology</span>
                </div>
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-foreground dark:text-white mb-6 leading-[1.1] dark:drop-shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                  {heroSlides[currentSlide].title}
                </h1>
                <p className="text-xl md:text-2xl text-foreground/70 dark:text-metallic-silver mb-10 font-medium max-w-2xl leading-relaxed">
                  {heroSlides[currentSlide].subtitle}
                </p>
                <Link href="#explore" className={buttonVariants({ size: "lg", className: "rounded-full px-10 h-16 text-lg font-bold bg-gradient-to-r from-primary to-primary/80 dark:from-electric-blue dark:to-premium-violet text-primary-foreground dark:text-white border-0 dark:shadow-[0_0_40px_rgba(100,50,255,0.4)] transition-all hover:scale-105" })}>
                  Explore Collection <ArrowRight className="ml-3 h-6 w-6" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Animated grid overlay - Visible in both modes but tailored */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>
      </section>

      {/* 2. Personalized Recommendations */}
      <section id="explore" className="py-24 relative overflow-hidden bg-gradient-to-b from-primary/10 to-background dark:from-deep-black dark:to-card/20">
        <div className="container relative mx-auto px-6 z-10">
          <div className="flex items-center gap-4 mb-16">
            <div className="p-4 bg-primary/10 dark:bg-electric-blue/20 rounded-2xl border border-primary/20 dark:border-electric-blue/30 text-primary dark:text-electric-blue dark:shadow-[0_0_30px_rgba(0,100,255,0.2)]">
              <Sparkles className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-4xl font-black tracking-tight text-foreground dark:text-white drop-shadow-sm dark:drop-shadow-md">For You</h2>
              <p className="text-muted-foreground dark:text-metallic-silver font-medium mt-1">
                {myOrders.length > 0 
                  ? "Curated recommendations based on your purchase history."
                  : "Hand-picked flagship models to elevate your experience."}
              </p>
            </div>
          </div>
          
          {loading || ordersLoading ? (
            <div className="flex justify-center py-20">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-electric-blue border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
              {recommendations.map((laptop, i) => renderProductCard(laptop, i))}
            </div>
          )}
        </div>
      </section>

      {/* 3. New Arrivals (Luxury Grid) */}
      <section className="py-24 bg-primary/5 dark:bg-card/20 border-y border-primary/10 dark:border-white/5 relative">
        <div className="absolute inset-0 opacity-30 dark:opacity-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent pointer-events-none"></div>
        <div className="container relative mx-auto px-6 z-10">
          <div className="flex items-end justify-between mb-16">
            <div>
              <h2 className="text-4xl font-black tracking-tight mb-4 text-foreground">Latest Innovations</h2>
              <p className="text-muted-foreground dark:text-metallic-silver text-lg">The newest flagship models just hit the platform.</p>
            </div>
            <Link href="/search" className="text-primary dark:text-electric-blue hover:text-primary/80 dark:hover:text-white font-bold tracking-widest uppercase text-sm flex items-center transition-colors">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary dark:border-electric-blue border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
              {newArrivals.map((laptop, i) => renderProductCard(laptop, i))}
            </div>
          )}
        </div>
      </section>

      {/* 4. Flash Deals */}
      {discountedLaptops.length > 0 && (
        <section className="py-24 relative bg-background dark:bg-transparent">
          <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />
          <div className="absolute inset-0 opacity-20 dark:opacity-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-orange-500/20 via-transparent to-transparent pointer-events-none"></div>
          <div className="container relative mx-auto px-6 z-10">
            <div className="flex items-center gap-4 mb-16">
              <div className="p-4 bg-orange-100 dark:bg-orange-500/20 rounded-2xl border border-orange-200 dark:border-orange-500/30 text-orange-600 dark:text-orange-500 dark:shadow-[0_0_30px_rgba(249,115,22,0.2)]">
                <Flame className="h-8 w-8" />
              </div>
              <div>
                <h2 className="text-4xl font-black tracking-tight text-foreground dark:text-white drop-shadow-sm dark:drop-shadow-md">Exclusive Offers</h2>
                <p className="text-orange-600/80 dark:text-orange-200/60 font-medium mt-1">Limited time pricing on premium models.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
              {discountedLaptops.map((laptop, i) => renderProductCard(laptop, i, true))}
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
