import Link from "next/link";
import { Laptop, Globe, Mail, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-primary/10 dark:border-white/5 bg-primary/5 dark:bg-card/20 relative overflow-hidden">
      <div className="absolute inset-0 opacity-40 dark:opacity-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none"></div>
      <div className="container relative mx-auto px-4 py-12 sm:px-6 lg:px-8 z-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-[0_0_15px_rgba(var(--color-primary),0.5)]">
                <Laptop className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-heading text-xl font-black tracking-tight text-foreground dark:text-white">
                Lap Mart
              </span>
            </Link>
            <p className="text-sm text-muted-foreground dark:text-metallic-silver">
              Your premium destination for high-performance laptops. Buy from trusted sellers or become a vendor today.
            </p>
            <div className="flex items-center gap-4 pt-2">
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
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-primary dark:text-electric-blue">Shop</h3>
            <ul className="space-y-3 text-sm text-foreground/80 dark:text-metallic-silver">
              <li><Link href="/laptops/gaming" className="hover:text-primary dark:hover:text-white transition-colors">Gaming Laptops</Link></li>
              <li><Link href="/laptops/business" className="hover:text-primary dark:hover:text-white transition-colors">Business Laptops</Link></li>
              <li><Link href="/laptops/student" className="hover:text-primary dark:hover:text-white transition-colors">Student Laptops</Link></li>
              <li><Link href="/laptops/creator" className="hover:text-primary dark:hover:text-white transition-colors">Creator Laptops</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-primary dark:text-electric-blue">Sell</h3>
            <ul className="space-y-3 text-sm text-foreground/80 dark:text-metallic-silver">
              <li><Link href="/become-seller" className="hover:text-primary dark:hover:text-white transition-colors">Become a Seller</Link></li>
              <li><Link href="/seller/guidelines" className="hover:text-primary dark:hover:text-white transition-colors">Seller Guidelines</Link></li>
              <li><Link href="/seller/fees" className="hover:text-primary dark:hover:text-white transition-colors">Fees & Pricing</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-primary dark:text-electric-blue">Support</h3>
            <ul className="space-y-3 text-sm text-foreground/80 dark:text-metallic-silver">
              <li><Link href="/help" className="hover:text-primary dark:hover:text-white transition-colors">Help Center</Link></li>
              <li><Link href="/track-order" className="hover:text-primary dark:hover:text-white transition-colors">Track Order</Link></li>
              <li><Link href="/returns" className="hover:text-primary dark:hover:text-white transition-colors">Returns & Refunds</Link></li>
              <li><Link href="/contact" className="hover:text-primary dark:hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between border-t border-primary/10 dark:border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-muted-foreground dark:text-metallic-silver">
            &copy; {new Date().getFullYear()} Lap Mart. All rights reserved.
          </p>
          <div className="mt-4 flex gap-6 sm:mt-0">
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-primary dark:hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-primary dark:hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
