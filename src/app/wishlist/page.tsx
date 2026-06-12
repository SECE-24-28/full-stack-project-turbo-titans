"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation, gql } from "@apollo/client";
import { Heart, HeartCrack, ShoppingCart, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { toast } from "sonner";

const GET_WISHLIST = gql`
  query GetWishlist {
    getWishlist {
      id
      name
      brand
      processor
      ram
      storage
      price
      discountPercent
      stock
      images
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

export default function WishlistPage() {
  const { data, loading, error, refetch } = useQuery(GET_WISHLIST, {
    fetchPolicy: "network-only"
  });
  
  const [toggleWishlist] = useMutation(TOGGLE_WISHLIST);
  const [addToCart] = useMutation(ADD_TO_CART);

  const handleRemove = async (productId: string) => {
    try {
      await toggleWishlist({ variables: { productId } });
      refetch(); // Refresh the wishlist data
    } catch (err: any) {
      toast.error("Failed to remove item: " + err.message);
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      await addToCart({ variables: { productId } });
      toast.success("Added to cart successfully!");
      window.location.reload(); 
    } catch (err: any) {
      toast.error("Failed to add to cart: " + err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Handle unauthenticated state
  if (error && error.message.includes("Not authenticated")) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <HeartCrack className="h-16 w-16 text-muted-foreground mb-4" />
        <h2 className="text-2xl font-bold mb-2">Please Log In</h2>
        <p className="text-muted-foreground max-w-md mb-6">
          You need to be logged into an account to view and manage your personalized wishlist.
        </p>
        <Link href="/login" className={buttonVariants({ size: "lg" })}>
          Log In
        </Link>
      </div>
    );
  }

  const wishlistItems = data?.getWishlist || [];

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold tracking-tight">Your Wishlist</h1>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-24 w-24 rounded-full bg-muted flex items-center justify-center mb-6">
            <HeartCrack className="h-10 w-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold mb-2">Your wishlist is empty</h2>
          <p className="text-muted-foreground mb-8">Save items you love to view them later.</p>
          <Link href="/#trending" className={buttonVariants({ size: "lg", className: "rounded-full" })}>
            Discover Laptops
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item: any) => {
            const inStock = item.stock > 0;
            const isDiscounted = item.discountPercent > 0;
            const salePrice = isDiscounted ? item.price * (1 - item.discountPercent / 100) : item.price;
            const imageUrl = item.images && item.images.length > 0 ? item.images[0] : "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=1000&auto=format&fit=crop";

            return (
              <div key={item.id} className="group flex flex-col rounded-2xl border bg-card p-4 transition-all hover:shadow-xl dark:hover:shadow-primary/5">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted mb-4">
                  <Image
                    src={imageUrl}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {isDiscounted && (
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                      {item.discountPercent}% OFF
                    </div>
                  )}
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    onClick={() => handleRemove(item.id)}
                    className="absolute top-2 right-2 h-8 w-8 rounded-full shadow-md bg-background/80 backdrop-blur-sm text-red-500 hover:text-red-600 hover:bg-background"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-1">
                     <span className="text-xs font-semibold text-primary uppercase tracking-wider">{item.brand}</span>
                     {inStock ? (
                        <span className="text-xs font-medium text-green-500">In Stock</span>
                     ) : (
                        <span className="text-xs font-medium text-destructive">Out of Stock</span>
                     )}
                  </div>
                  <Link href={`/laptops/${item.id}`} className="block">
                    <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">{item.name}</h3>
                  </Link>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1 mt-1">
                    {item.processor} • {item.ram} • {item.storage}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col">
                      {isDiscounted && (
                        <span className="text-xs text-muted-foreground line-through">
                          ₹{item.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      )}
                      <span className="font-bold text-lg text-primary">
                        ₹{salePrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <Button 
                      size="sm" 
                      className="rounded-full gap-2" 
                      disabled={!inStock}
                      onClick={() => handleAddToCart(item.id)}
                    >
                      <ShoppingCart className="h-4 w-4" />
                      Add
                    </Button>
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
