"use client";

import * as React from "react";
import Link from "next/link";
import { Laptop, Search, ShoppingCart, Heart, User, UserIcon } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { gql, useQuery, useMutation } from '@apollo/client';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";

const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      role
    }
  }
`;

const GET_CART = gql`
  query GetCart {
    getCart {
      id
      quantity
    }
  }
`;

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

export function Navbar() {
  const router = useRouter();
  const { data, loading, client } = useQuery(ME_QUERY, {
    fetchPolicy: 'network-only',
  });
  
  const { data: cartData } = useQuery(GET_CART, {
    fetchPolicy: 'network-only',
    skip: !data?.me, // only fetch if user is logged in
  });

  const [logout] = useMutation(LOGOUT_MUTATION, {
    onCompleted: () => {
      client.resetStore();
      router.push('/login');
    }
  });

  const user = data?.me;
  
  // Calculate total number of items (summing quantities) or just number of distinct items
  // Let's sum the quantities
  const cartCount = cartData?.getCart?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Laptop className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="hidden font-heading text-xl font-bold tracking-tight sm:inline-block">
                Lap Mart
              </span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden flex-1 max-w-md items-center md:flex">
            <div className="relative w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for laptops..."
                className="w-full rounded-full bg-muted/50 pl-9 pr-4 transition-colors focus-visible:bg-background"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>

            <ThemeToggle />

            <Link
              href="/wishlist"
              className={buttonVariants({ variant: "ghost", size: "icon", className: "hidden sm:inline-flex" })}
            >
              <Heart className="h-5 w-5" />
              <span className="sr-only">Wishlist</span>
            </Link>

            <Link
              href="/cart"
              className={buttonVariants({ variant: "ghost", size: "icon", className: "relative" })}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {cartCount}
                </span>
              )}
              <span className="sr-only">Cart</span>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-input bg-background hover:bg-muted transition-colors focus-visible:outline-none"
                aria-label="User menu"
              >
                <User className="h-5 w-5" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {loading ? (
                    <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
                  ) : user ? (
                    <>
                      <div className="px-2 py-1.5 text-sm font-medium">
                        <div className="font-bold">{user.name}</div>
                        <div className="text-xs text-muted-foreground">{user.email}</div>
                        <div className="text-[10px] mt-1 tracking-wider uppercase text-primary font-semibold">{user.role}</div>
                      </div>
                      <DropdownMenuSeparator />
                      {user.role === 'SELLER' && (
                        <DropdownMenuItem onClick={() => router.push('/dashboard/seller')} className="cursor-pointer">
                          Seller Dashboard
                        </DropdownMenuItem>
                      )}
                      {user.role === 'ADMIN' && (
                        <DropdownMenuItem onClick={() => router.push('/dashboard/admin')} className="cursor-pointer">
                          Admin Dashboard
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => router.push('/profile')} className="cursor-pointer flex items-center">
                        <UserIcon className="mr-2 h-4 w-4" />
                        Manage Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => logout()} className="text-red-600 focus:text-red-600 focus:bg-red-100 dark:focus:bg-red-900/20 cursor-pointer">
                        Sign out
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onClick={() => router.push('/login')} className="cursor-pointer">
                        Login
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => router.push('/register')} className="cursor-pointer">
                        Register
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
