"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Star, ShieldCheck, Truck, ArrowLeft, Heart, ShoppingCart, Share2, Package, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQuery, useMutation, gql } from "@apollo/client";
import { toast } from "sonner";

const GET_PRODUCT = gql`
  query GetProduct($id: ID!) {
    me {
      id
    }
    getProduct(id: $id) {
      id
      name
      brand
      modelNumber
      series
      description
      processor
      ram
      storage
      graphics
      displaySize
      displayRes
      os
      battery
      price
      discountPercent
      stock
      images
      warrantyPeriod
      warrantyType
      seller {
        name
      }
      averageRating
      reviewCount
      reviews {
        id
        rating
        comment
        createdAt
        user {
          id
          name
        }
      }
    }
  }
`;

const ADD_TO_CART = gql`
  mutation AddToCart($productId: ID!) {
    addToCart(productId: $productId)
  }
`;

const TOGGLE_WISHLIST = gql`
  mutation ToggleWishlist($productId: ID!) {
    toggleWishlist(productId: $productId)
  }
`;

const ADD_REVIEW = gql`
  mutation AddReview($productId: ID!, $rating: Int!, $comment: String) {
    addReview(productId: $productId, rating: $rating, comment: $comment) {
      id
      rating
      comment
      createdAt
      user {
        id
        name
      }
    }
  }
`;

const DELETE_REVIEW = gql`
  mutation DeleteReview($productId: ID!) {
    deleteReview(productId: $productId)
  }
`;

export default function ProductDetailsPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [activeImage, setActiveImage] = useState(0);
  
  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data, loading, error, refetch } = useQuery(GET_PRODUCT, {
    variables: { id: params.id as string }
  });

  const [addToCart] = useMutation(ADD_TO_CART);
  const [toggleWishlist] = useMutation(TOGGLE_WISHLIST);
  const [addReview] = useMutation(ADD_REVIEW);
  const [deleteReview] = useMutation(DELETE_REVIEW);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 flex justify-center items-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const laptop = data?.getProduct;

  if (!laptop) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
        <h1 className="text-2xl font-bold mb-2">Product Not Found</h1>
        <p className="text-muted-foreground mb-8">This laptop might have been removed or is unavailable.</p>
        <Link href="/">
          <Button>Back to Store</Button>
        </Link>
      </div>
    );
  }

  const isDiscounted = laptop.discountPercent > 0;
  const salePrice = isDiscounted ? laptop.price * (1 - laptop.discountPercent / 100) : laptop.price;
  const fallbackImages = ["https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=1000&auto=format&fit=crop"];
  const displayImages = laptop.images && laptop.images.length > 0 ? laptop.images : fallbackImages;

  const handleAddToCart = async () => {
    try {
      await addToCart({ variables: { productId: laptop.id } });
      toast.success("Added to cart successfully!");
      window.dispatchEvent(new Event('cart-updated')); // Dispatch event to update navbar cart count if you have one
    } catch (err: any) {
      if (err.message.includes("Not authenticated")) {
        toast.error("Please log in to add items to your cart.");
      } else {
        toast.error("Failed to add to cart: " + err.message);
      }
    }
  };

  const handleBuyNow = async () => {
    try {
      await addToCart({ variables: { productId: laptop.id } });
      router.push('/cart'); // Redirect to cart to begin checkout immediately
    } catch (err: any) {
      if (err.message.includes("Not authenticated")) {
        toast.error("Please log in to make a purchase.");
      } else {
        toast.error("Failed to process Buy Now: " + err.message);
      }
    }
  };

  const handleWishlistToggle = async () => {
    try {
      await toggleWishlist({ variables: { productId: laptop.id } });
      toast.success("Wishlist updated!");
    } catch (err: any) {
      if (err.message.includes("Not authenticated")) {
        toast.error("Please log in to save items to your wishlist.");
      } else {
        toast.error("Failed to update wishlist: " + err.message);
      }
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    try {
      await addReview({
        variables: {
          productId: laptop.id,
          rating: reviewRating,
          comment: reviewComment
        }
      });
      setReviewComment("");
      setReviewRating(5);
      await refetch();
      toast.success("Review submitted successfully!");
    } catch (err: any) {
      if (err.message.includes("Not authenticated")) {
        toast.error("Please log in to submit a review.");
      } else {
        toast.error("Failed to submit review: " + err.message);
      }
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleEditReview = (review: any) => {
    setReviewRating(review.rating);
    setReviewComment(review.comment || "");
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    toast.success("Review loaded for editing. Scroll down to update.");
  };

  const handleDeleteReview = async () => {
    try {
      await deleteReview({ variables: { productId: laptop.id } });
      await refetch();
      toast.success("Review deleted successfully!");
    } catch (err: any) {
      toast.error("Failed to delete review: " + err.message);
    } finally {
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Store
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted border">
            <Image
              src={displayImages[activeImage]}
              alt={laptop.name}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <Button size="icon" variant="secondary" className="rounded-full shadow-sm bg-background/80 backdrop-blur-sm" onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Link copied to clipboard!");
              }}>
                <Share2 className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="secondary" onClick={handleWishlistToggle} className="rounded-full shadow-sm bg-background/80 backdrop-blur-sm hover:text-red-500">
                <Heart className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {displayImages.length > 1 && (
            <div className="flex gap-4 overflow-x-auto pb-2">
              {displayImages.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`relative h-24 w-32 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${activeImage === idx ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-primary/50'}`}
                >
                  <Image src={img} alt={`Thumbnail ${idx+1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          <Badge className="w-fit mb-4">{laptop.brand}</Badge>
          <h1 className="text-3xl font-bold sm:text-4xl">{laptop.name}</h1>
          
          <div className="mt-4 flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              <span className="font-medium">{laptop.averageRating > 0 ? laptop.averageRating.toFixed(1) : "No rating"}</span>
            </div>
            <span className="text-muted-foreground underline cursor-pointer">
              {laptop.reviewCount} {laptop.reviewCount === 1 ? 'Review' : 'Reviews'}
            </span>
          </div>

          <div className="mt-6 flex items-baseline gap-4">
            <span className="text-4xl font-extrabold tracking-tight text-primary">₹{salePrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            {isDiscounted && (
              <>
                <span className="text-xl text-muted-foreground line-through">₹{laptop.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                <Badge variant="destructive" className="ml-2 bg-red-600 text-white border-transparent hover:bg-red-700">{laptop.discountPercent}% OFF</Badge>
              </>
            )}
          </div>

          <p className="mt-6 text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {laptop.description}
          </p>

          <div className="mt-8 space-y-4 rounded-xl border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium text-muted-foreground">Seller</span>
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-green-500" />
                <span className="font-semibold">{laptop.seller?.name || "Lap Mart Official"}</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-muted-foreground">Availability</span>
              <span className={`font-semibold ${laptop.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {laptop.stock > 0 ? `In Stock (${laptop.stock} left)` : 'Out of Stock'}
              </span>
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
            <Button size="lg" className="flex-1 rounded-full h-14 text-lg" disabled={laptop.stock === 0} onClick={handleBuyNow}>
              Buy Now
            </Button>
            <Button size="lg" variant="outline" className="flex-1 rounded-full h-14 text-lg border-2" disabled={laptop.stock === 0} onClick={handleAddToCart}>
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-border/50">
                <span className="capitalize font-medium text-muted-foreground w-1/3">Processor</span>
                <span className="font-medium text-foreground w-2/3">{laptop.processor}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-border/50">
                <span className="capitalize font-medium text-muted-foreground w-1/3">RAM</span>
                <span className="font-medium text-foreground w-2/3">{laptop.ram}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-border/50">
                <span className="capitalize font-medium text-muted-foreground w-1/3">Storage</span>
                <span className="font-medium text-foreground w-2/3">{laptop.storage}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-border/50">
                <span className="capitalize font-medium text-muted-foreground w-1/3">Graphics</span>
                <span className="font-medium text-foreground w-2/3">{laptop.graphics}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-border/50">
                <span className="capitalize font-medium text-muted-foreground w-1/3">Display Size</span>
                <span className="font-medium text-foreground w-2/3">{laptop.displaySize}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-border/50">
                <span className="capitalize font-medium text-muted-foreground w-1/3">Resolution</span>
                <span className="font-medium text-foreground w-2/3">{laptop.displayRes}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-border/50">
                <span className="capitalize font-medium text-muted-foreground w-1/3">Operating System</span>
                <span className="font-medium text-foreground w-2/3">{laptop.os}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-border/50">
                <span className="capitalize font-medium text-muted-foreground w-1/3">Battery</span>
                <span className="font-medium text-foreground w-2/3">{laptop.battery}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-border/50">
                <span className="capitalize font-medium text-muted-foreground w-1/3">Model Number</span>
                <span className="font-medium text-foreground w-2/3">{laptop.modelNumber}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3 border-b border-border/50">
                <span className="capitalize font-medium text-muted-foreground w-1/3">Warranty</span>
                <span className="font-medium text-foreground w-2/3">{laptop.warrantyPeriod} - {laptop.warrantyType}</span>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="reviews" className="p-6 rounded-xl border bg-card">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Reviews List */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold">Customer Reviews ({laptop.reviewCount})</h3>
                {laptop.reviews && laptop.reviews.length > 0 ? (
                  <div className="space-y-4">
                    {laptop.reviews.map((review: any) => (
                      <div key={review.id} className="p-4 rounded-xl border bg-muted/20 relative group">
                        {data?.me?.id === review.user.id && (
                          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEditReview(review)} className="p-1 text-muted-foreground hover:text-primary transition-colors" title="Edit Review">
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button onClick={() => setShowDeleteConfirm(true)} className="p-1 text-muted-foreground hover:text-red-500 transition-colors" title="Delete Review">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold">{review.user.name}</span>
                          <span className="text-xs text-muted-foreground">{new Date(parseInt(review.createdAt)).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1 mb-3">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} className={`h-4 w-4 ${star <= review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                          ))}
                        </div>
                        {review.comment && (
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border rounded-xl border-dashed">
                    <Star className="mx-auto h-12 w-12 text-muted-foreground/30 mb-4" />
                    <h3 className="text-xl font-bold">No reviews yet</h3>
                    <p className="text-muted-foreground mt-2">Be the first to review this product!</p>
                  </div>
                )}
              </div>

              {/* Write Review Form */}
              <div className="bg-muted/10 p-6 rounded-xl border h-fit">
                <h3 className="text-xl font-bold mb-6">Write a Review</h3>
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Rating</label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="hover:scale-110 transition-transform focus:outline-none"
                        >
                          <Star className={`h-8 w-8 ${star <= reviewRating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Review Comment (Optional)</label>
                    <textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="What did you like or dislike about this laptop?"
                      className="w-full min-h-[120px] p-3 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-y"
                    />
                  </div>
                  <Button type="submit" className="w-full h-12" disabled={isSubmittingReview}>
                    {isSubmittingReview ? "Submitting..." : "Submit Review"}
                  </Button>
                </form>
              </div>
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

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your review from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteReview} className="bg-red-600 hover:bg-red-700 text-white">
              Delete Review
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
