import Link from "next/link";
import { Laptop, Globe, Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t bg-background">
      <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Laptop className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-heading text-xl font-bold tracking-tight">
                Lap Mart
              </span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Your premium destination for high-performance laptops. Buy from trusted sellers or become a vendor today.
            </p>
            <div className="flex items-center gap-4">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Globe className="h-5 w-5" />
                <span className="sr-only">Website</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-5 w-5" />
                <span className="sr-only">Email</span>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Phone className="h-5 w-5" />
                <span className="sr-only">Phone</span>
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Shop</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/laptops/gaming" className="hover:text-primary transition-colors">Gaming Laptops</Link></li>
              <li><Link href="/laptops/business" className="hover:text-primary transition-colors">Business Laptops</Link></li>
              <li><Link href="/laptops/student" className="hover:text-primary transition-colors">Student Laptops</Link></li>
              <li><Link href="/laptops/creator" className="hover:text-primary transition-colors">Creator Laptops</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Sell</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/become-seller" className="hover:text-primary transition-colors">Become a Seller</Link></li>
              <li><Link href="/seller/guidelines" className="hover:text-primary transition-colors">Seller Guidelines</Link></li>
              <li><Link href="/seller/fees" className="hover:text-primary transition-colors">Fees & Pricing</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">Support</h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link href="/track-order" className="hover:text-primary transition-colors">Track Order</Link></li>
              <li><Link href="/returns" className="hover:text-primary transition-colors">Returns & Refunds</Link></li>
              <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between border-t pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Lap Mart. All rights reserved.
          </p>
          <div className="mt-4 flex gap-4 sm:mt-0">
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
