import { prisma } from '@/lib/prisma';

export interface SearchArgs {
  q?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  ram?: string;
  storage?: string;
  sort?: string;
  processor?: string;
  graphics?: string;
  minRating?: number;
}

export const SearchService = {
  async searchProducts(args: SearchArgs) {
    const { q, brand, minPrice, maxPrice, ram, storage, sort, processor, graphics, minRating } = args;

    // Base condition: only show APPROVED products
    const where: any = {
      status: 'APPROVED',
    };

    // Free text search across multiple fields
    if (q) {
      const searchStr = q.trim();
      where.OR = [
        { name: { contains: searchStr, mode: 'insensitive' } },
        { brand: { contains: searchStr, mode: 'insensitive' } },
        { modelNumber: { contains: searchStr, mode: 'insensitive' } },
        { processor: { contains: searchStr, mode: 'insensitive' } },
        { ram: { contains: searchStr, mode: 'insensitive' } },
        { storage: { contains: searchStr, mode: 'insensitive' } },
        { graphics: { contains: searchStr, mode: 'insensitive' } },
      ];
    }

    // Exact or partial match filters
    if (brand) {
      where.brand = { equals: brand, mode: 'insensitive' };
    }

    if (ram) {
      where.ram = { contains: ram, mode: 'insensitive' };
    }

    if (storage) {
      where.storage = { contains: storage, mode: 'insensitive' };
    }

    if (processor) {
      where.processor = { contains: processor, mode: 'insensitive' };
    }

    if (graphics) {
      where.graphics = { contains: graphics, mode: 'insensitive' };
    }

    // Price range filters
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    // Sorting logic
    let orderBy: any = { createdAt: 'desc' }; // default: newest

    if (sort) {
      switch (sort) {
        case 'price_asc':
          orderBy = { price: 'asc' };
          break;
        case 'price_desc':
          orderBy = { price: 'desc' };
          break;
        case 'newest':
          orderBy = { createdAt: 'desc' };
          break;
        default:
          orderBy = { createdAt: 'desc' };
      }
    }

    // Execute query
    let products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        seller: true, // required by the GraphQL schema if seller is requested
        reviews: true, // needed to calculate average rating
      },
    });

    // In-memory filter for minimum rating if requested
    if (minRating !== undefined && minRating > 0) {
      products = products.filter(product => {
        if (!product.reviews || product.reviews.length === 0) return false; // No ratings = 0 rating
        const sum = product.reviews.reduce((acc: number, review: any) => acc + review.rating, 0);
        const avg = sum / product.reviews.length;
        return avg >= minRating;
      });
    }

    return products;
  },
};
