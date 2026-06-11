"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Filter, SlidersHorizontal, Star, Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider"; // Might need to add if not added
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const MOCK_LAPTOPS = [
  {
    id: 1,
    name: "MacBook Pro 16\"",
    brand: "Apple",
    price: 2499,
    rating: 4.9,
    reviews: 128,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=1000&auto=format&fit=crop",
    specs: "M3 Max / 36GB RAM / 1TB SSD",
  },
  {
    id: 2,
    name: "ROG Zephyrus G14",
    brand: "ASUS",
    price: 1599,
    rating: 4.8,
    reviews: 95,
    image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=1000&auto=format&fit=crop",
    specs: "Ryzen 9 / RTX 4070 / 32GB RAM",
  },
  {
    id: 3,
    name: "XPS 15",
    brand: "Dell",
    price: 1899,
    rating: 4.7,
    reviews: 210,
    image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?q=80&w=1000&auto=format&fit=crop",
    specs: "Core i9 / RTX 4060 / 32GB RAM",
  },
  {
    id: 4,
    name: "ThinkPad X1 Carbon",
    brand: "Lenovo",
    price: 1499,
    rating: 4.9,
    reviews: 340,
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=1000&auto=format&fit=crop",
    specs: "Core i7 / 16GB RAM / 512GB SSD",
  },
  {
    id: 5,
    name: "Razer Blade 15",
    brand: "Razer",
    price: 2299,
    rating: 4.6,
    reviews: 78,
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=1000&auto=format&fit=crop",
    specs: "Core i7 / RTX 4070 / 16GB RAM",
  },
  {
    id: 6,
    name: "Spectre x360",
    brand: "HP",
    price: 1399,
    rating: 4.5,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=1000&auto=format&fit=crop",
    specs: "Core i7 / 16GB RAM / 1TB SSD",
  },
];

const FILTERS = {
  brands: ["Apple", "Dell", "HP", "Lenovo", "ASUS", "Razer", "MSI", "Acer"],
  processors: ["Intel Core i9", "Intel Core i7", "Intel Core i5", "AMD Ryzen 9", "AMD Ryzen 7", "Apple M3 Max", "Apple M3 Pro", "Apple M3"],
  ram: ["8GB", "16GB", "32GB", "64GB"],
  storage: ["256GB SSD", "512GB SSD", "1TB SSD", "2TB SSD"],
  gpu: ["NVIDIA RTX 4090", "NVIDIA RTX 4080", "NVIDIA RTX 4070", "NVIDIA RTX 4060", "AMD Radeon RX 7600S", "Apple Integrated"],
};

export default function LaptopsPage() {
  const [priceRange, setPriceRange] = useState([500, 5000]);

  const FilterSidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4 text-lg">Filters</h3>
        {/* We can use standard input type="range" or a custom slider if Shadcn slider is missing, but assuming we have it or can use basic input */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3">Price Range</h4>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm">${priceRange[0]}</span>
            <span className="text-sm text-muted-foreground">-</span>
            <span className="text-sm">${priceRange[1]}</span>
          </div>
          {/* Note: If Slider component fails, replace with basic input range */}
          <input 
            type="range" 
            min="500" 
            max="5000" 
            value={priceRange[1]} 
            onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])} 
            className="w-full accent-primary" 
          />
        </div>

        <Accordion className="w-full">
          <AccordionItem value="brands">
            <AccordionTrigger className="text-sm">Brand</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {FILTERS.brands.map((brand) => (
                  <div key={brand} className="flex items-center space-x-2">
                    <Checkbox id={`brand-${brand}`} />
                    <label htmlFor={`brand-${brand}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {brand}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="processors">
            <AccordionTrigger className="text-sm">Processor</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {FILTERS.processors.map((cpu) => (
                  <div key={cpu} className="flex items-center space-x-2">
                    <Checkbox id={`cpu-${cpu}`} />
                    <label htmlFor={`cpu-${cpu}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {cpu}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="ram">
            <AccordionTrigger className="text-sm">RAM</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {FILTERS.ram.map((ram) => (
                  <div key={ram} className="flex items-center space-x-2">
                    <Checkbox id={`ram-${ram}`} />
                    <label htmlFor={`ram-${ram}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {ram}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
          
          <AccordionItem value="storage">
            <AccordionTrigger className="text-sm">Storage</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {FILTERS.storage.map((storage) => (
                  <div key={storage} className="flex items-center space-x-2">
                    <Checkbox id={`storage-${storage}`} />
                    <label htmlFor={`storage-${storage}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {storage}
                    </label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumbs & Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">All Laptops</h1>
        <p className="text-muted-foreground mt-2">Showing 1-6 of {MOCK_LAPTOPS.length} products</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mobile Filters */}
        <div className="flex items-center justify-between lg:hidden mb-4">
          <Sheet>
            <SheetTrigger>
              <Button variant="outline" className="flex gap-2">
                <Filter className="h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
              <div className="py-6">
                <FilterSidebar />
              </div>
            </SheetContent>
          </Sheet>
          
          <Select defaultValue="featured">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="featured">Featured</SelectItem>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-[280px] shrink-0 sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto pr-6">
          <FilterSidebar />
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {/* Desktop Sort */}
          <div className="hidden lg:flex items-center justify-between mb-6 bg-muted/30 p-4 rounded-xl border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <SlidersHorizontal className="h-4 w-4" />
              <span>Sort options</span>
            </div>
            <Select defaultValue="featured">
              <SelectTrigger className="w-[200px] bg-background">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {MOCK_LAPTOPS.map((laptop) => (
              <div
                key={laptop.id}
                className="group flex flex-col rounded-2xl border bg-card p-4 transition-all hover:shadow-xl dark:hover:shadow-primary/5"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted mb-4">
                  <Image
                    src={laptop.image}
                    alt={laptop.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-md bg-background/80 backdrop-blur-sm hover:bg-background">
                      <Heart className="h-4 w-4 text-muted-foreground hover:text-red-500" />
                    </Button>
                  </div>
                  <Badge className="absolute top-2 left-2 shadow-md">
                    {laptop.brand}
                  </Badge>
                </div>
                
                <div className="flex flex-col flex-1">
                  <Link href={`/laptops/${laptop.id}`} className="block">
                    <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">{laptop.name}</h3>
                  </Link>
                  <div className="flex items-center gap-1 mt-1 mb-2">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium">{laptop.rating}</span>
                    <span className="text-sm text-muted-foreground">({laptop.reviews})</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                    {laptop.specs}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="font-bold text-xl">${laptop.price.toLocaleString()}</span>
                    <Button size="sm" className="rounded-full gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-12 flex items-center justify-center gap-2">
            <Button variant="outline" size="icon" disabled>
              &lt;
            </Button>
            <Button variant="default" size="icon">1</Button>
            <Button variant="outline" size="icon">2</Button>
            <Button variant="outline" size="icon">3</Button>
            <Button variant="outline" size="icon">
              &gt;
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
