"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  return (
    <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center text-center min-h-[70vh]">
      <div className="relative">
        <div className="absolute -inset-4 rounded-full bg-green-100 dark:bg-green-900/20 animate-pulse"></div>
        <CheckCircle2 className="h-24 w-24 text-green-500 relative z-10 bg-background rounded-full" />
      </div>
      
      <h1 className="mt-8 text-4xl font-extrabold tracking-tight">Order Placed Successfully!</h1>
      <p className="mt-4 text-lg text-muted-foreground max-w-lg">
        Thank you for your purchase. We have received your order and are getting it ready to be shipped.
      </p>

      {orderId && (
        <div className="mt-8 bg-muted/50 border rounded-xl p-6 flex flex-col items-center max-w-sm w-full">
          <Package className="h-8 w-8 text-primary mb-2" />
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Order Reference</span>
          <span className="text-lg font-bold mt-1 font-mono">{orderId.split('-')[0].toUpperCase()}</span>
        </div>
      )}

      <div className="mt-12 flex flex-col sm:flex-row gap-4">
        <Link href="/profile?tab=orders">
          <Button variant="outline" size="lg" className="rounded-full w-full sm:w-auto h-14 px-8">
            View My Orders
          </Button>
        </Link>
        <Link href="/">
          <Button size="lg" className="rounded-full w-full sm:w-auto h-14 px-8 group">
            Continue Shopping <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-24 text-center">Loading...</div>}>
      <SuccessContent />
    </Suspense>
  );
}
