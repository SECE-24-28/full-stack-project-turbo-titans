"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useQuery, useMutation, gql } from "@apollo/client";
import { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, SlidersHorizontal, Flame, FilterX, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const SEARCH_PRODUCTS = gql`
  query SearchProducts(
    $q: String
    $brand: String
    $minPrice: Float
    $maxPrice: Float
    $ram: String
    $storage: String
    $sort: String
    $processor: String
    $graphics: String
    $minRating: Float
  ) {
    searchProducts(
      q: $q
      brand: $brand
      minPrice: $minPrice
      maxPrice: $maxPrice
      ram: $ram
      storage: $storage
      sort: $sort
      processor: $processor
      graphics: $graphics
      minRating: $minRating
    ) {
      id
      name
      brand
      processor
      ram
      storage
      price
      discountPercent
      images
      averageRating
      reviewCount
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

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Read URL params
  const initialQ = searchParams.get("q") || "";
  const initialBrand = searchParams.get("brand") || "";
  const initialMinPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined;
  const initialMaxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;
  const initialRam = searchParams.get("ram") || "";
  const initialStorage = searchParams.get("storage") || "";
  const initialProcessor = searchParams.get("processor") || "";
  const initialGraphics = searchParams.get("graphics") || "";
  const initialMinRating = searchParams.get("minRating") ? parseFloat(searchParams.get("minRating")!) : undefined;
  const initialSort = searchParams.get("sort") || "newest";

  // Local state for filter sidebar
  const [q, setQ] = useState(initialQ);
  const [brand, setBrand] = useState(initialBrand);
  const [minPrice, setMinPrice] = useState<number | undefined>(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(initialMaxPrice);
  const [ram, setRam] = useState(initialRam);
  const [storage, setStorage] = useState(initialStorage);
  const [processor, setProcessor] = useState(initialProcessor);
  const [graphics, setGraphics] = useState(initialGraphics);
  const [minRating, setMinRating] = useState<number | undefined>(initialMinRating);
  const [sort, setSort] = useState(initialSort);

  // Sync state if URL changes directly
  useEffect(() => {
    setQ(searchParams.get("q") || "");
    setBrand(searchParams.get("brand") || "");
    setMinPrice(searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined);
    setMaxPrice(searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined);
    setRam(searchParams.get("ram") || "");
    setStorage(searchParams.get("storage") || "");
    setProcessor(searchParams.get("processor") || "");
    setGraphics(searchParams.get("graphics") || "");
    setMinRating(searchParams.get("minRating") ? parseFloat(searchParams.get("minRating")!) : undefined);
    setSort(searchParams.get("sort") || "newest");
  }, [searchParams]);

  const { data, loading, error } = useQuery(SEARCH_PRODUCTS, {
    variables: {
      q: initialQ || undefined,
      brand: initialBrand || undefined,
      minPrice: initialMinPrice,
      maxPrice: initialMaxPrice,
      ram: initialRam || undefined,
      storage: initialStorage || undefined,
      processor: initialProcessor || undefined,
      graphics: initialGraphics || undefined,
      minRating: initialMinRating,
      sort: initialSort
    }
  });

  const { data: wishlistData, refetch: refetchWishlist } = useQuery(GET_WISHLIST, {
    fetchPolicy: "network-only"
  });

  const [toggleWishlist] = useMutation(TOGGLE_WISHLIST);
  const [addToCart] = useMutation(ADD_TO_CART);

  const products = data?.searchProducts || [];
  const wishlistIds = wishlistData?.getWishlist?.map((w: any) => w.id) || [];

  const handleApplyFilters = () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (brand) params.set("brand", brand);
    if (minPrice) params.set("minPrice", minPrice.toString());
    if (maxPrice) params.set("maxPrice", maxPrice.toString());
    if (ram) params.set("ram", ram);
    if (storage) params.set("storage", storage);
    if (processor) params.set("processor", processor);
    if (graphics) params.set("graphics", graphics);
    if (minRating) params.set("minRating", minRating.toString());
    if (sort) params.set("sort", sort);
    
    router.push(`/search?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setQ("");
    setBrand("");
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setRam("");
    setStorage("");
    setProcessor("");
    setGraphics("");
    setMinRating(undefined);
    setSort("newest");
    router.push('/search');
  };

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 shrink-0 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5" /> Filters
            </h2>
            <Button variant="ghost" size="sm" onClick={handleClearFilters} className="text-xs text-muted-foreground h-8">
              Clear all
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1 block">Search Query</label>
              <input 
                type="text" 
                value={q} 
                onChange={(e) => setQ(e.target.value)}
                className="w-full text-sm rounded-md border bg-background px-3 py-2"
                placeholder="Laptop name..."
              />
            </div>
            
            <div>
              <label className="text-sm font-semibold mb-1 block">Brand</label>
              <select 
                value={brand} 
                onChange={(e) => setBrand(e.target.value)}
                className="w-full text-sm rounded-md border bg-background px-3 py-2"
              >
                <option value="">All Brands</option>
                <option value="Apple">Apple</option>
                <option value="HP">HP</option>
                <option value="Dell">Dell</option>
                <option value="Lenovo">Lenovo</option>
                <option value="Asus">Asus</option>
                <option value="Acer">Acer</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-semibold mb-1 block">Min Price</label>
                <input 
                  type="number" 
                  value={minPrice || ""} 
                  onChange={(e) => setMinPrice(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full text-sm rounded-md border bg-background px-3 py-2"
                  placeholder="₹0"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Max Price</label>
                <input 
                  type="number" 
                  value={maxPrice || ""} 
                  onChange={(e) => setMaxPrice(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full text-sm rounded-md border bg-background px-3 py-2"
                  placeholder="₹200000"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold mb-1 block">RAM</label>
              <select 
                value={ram} 
                onChange={(e) => setRam(e.target.value)}
                className="w-full text-sm rounded-md border bg-background px-3 py-2"
              >
                <option value="">Any</option>
                <option value="8GB">8GB</option>
                <option value="16GB">16GB</option>
                <option value="32GB">32GB</option>
                <option value="64GB">64GB</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold mb-1 block">Storage</label>
              <select 
                value={storage} 
                onChange={(e) => setStorage(e.target.value)}
                className="w-full text-sm rounded-md border bg-background px-3 py-2"
              >
                <option value="">Any</option>
                <option value="256GB">256GB</option>
                <option value="512GB">512GB</option>
                <option value="1TB">1TB</option>
                <option value="2TB">2TB</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold mb-1 block">Processor</label>
              <select 
                value={processor} 
                onChange={(e) => setProcessor(e.target.value)}
                className="w-full text-sm rounded-md border bg-background px-3 py-2"
              >
                <option value="">Any</option>
                <option value="Intel Core i3">Intel Core i3</option>
                <option value="Intel Core i5">Intel Core i5</option>
                <option value="Intel Core i7">Intel Core i7</option>
                <option value="Intel Core i9">Intel Core i9</option>
                <option value="Ryzen 3">AMD Ryzen 3</option>
                <option value="Ryzen 5">AMD Ryzen 5</option>
                <option value="Ryzen 7">AMD Ryzen 7</option>
                <option value="Ryzen 9">AMD Ryzen 9</option>
                <option value="Apple">Apple M1/M2/M3</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold mb-1 block">Graphics</label>
              <select 
                value={graphics} 
                onChange={(e) => setGraphics(e.target.value)}
                className="w-full text-sm rounded-md border bg-background px-3 py-2"
              >
                <option value="">Any</option>
                <option value="Integrated">Integrated Graphics</option>
                <option value="NVIDIA GTX">NVIDIA GTX Series</option>
                <option value="NVIDIA RTX">NVIDIA RTX Series</option>
                <option value="AMD Radeon">AMD Radeon</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold mb-1 block">Minimum Rating</label>
              <select 
                value={minRating || ""} 
                onChange={(e) => setMinRating(e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full text-sm rounded-md border bg-background px-3 py-2"
              >
                <option value="">Any Rating</option>
                <option value="4">4+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="2">2+ Stars</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold mb-1 block">Sort By</label>
              <select 
                value={sort} 
                onChange={(e) => setSort(e.target.value)}
                className="w-full text-sm rounded-md border bg-background px-3 py-2"
              >
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            <Button onClick={handleApplyFilters} className="w-full mt-4">
              Apply Filters
            </Button>
          </div>
        </aside>

        {/* Results Area */}
        <div className="flex-1">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">
              {initialQ ? `Search results for "${initialQ}"` : "Browse Laptops"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Showing {products.length} {products.length === 1 ? 'result' : 'results'}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-900">
              Failed to load search results: {error.message}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center rounded-2xl border bg-card">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <FilterX className="h-8 w-8 text-muted-foreground opacity-50" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No products found</h2>
              <p className="text-muted-foreground mb-6">We couldn't find any laptops matching your current filters.</p>
              <Button onClick={handleClearFilters} variant="outline">
                Clear all filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((laptop: any, index: number) => {
                const isDiscounted = laptop.discountPercent > 0;
                const salePrice = isDiscounted ? laptop.price * (1 - laptop.discountPercent / 100) : laptop.price;
                const imageUrl = laptop.images && laptop.images.length > 0 ? laptop.images[0] : "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=1000&auto=format&fit=crop";

                return (
                  <div
                    key={laptop.id}
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
                        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1 shadow-sm">
                          <Flame className="h-3 w-3" />
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
                        <Button size="sm" onClick={() => handleAddToCart(laptop.id)} className="rounded-full">Add</Button>
                      </div>
                      
                      {/* Rating display */}
                      {laptop.reviewCount > 0 ? (
                        <div className="mt-3 flex items-center gap-1 text-sm font-medium">
                          <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                          <span>{laptop.averageRating.toFixed(1)}</span>
                          <span className="text-muted-foreground ml-1">({laptop.reviewCount})</span>
                        </div>
                      ) : (
                        <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="h-4 w-4 text-muted-foreground/30" />
                          <span>No reviews yet</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-24 flex justify-center items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div></div>}>
      <SearchContent />
    </Suspense>
  );
}
