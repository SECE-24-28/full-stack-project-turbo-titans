import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { signToken, setAuthCookie, clearAuthCookie } from '../lib/auth';
import { sendPasswordResetEmail } from '../lib/email';
import { SearchService } from '../services/search.service';

const ADMIN_EMAIL = 'dwarkeshrm707@gmail.com';

export const resolvers = {
  Query: {
    searchProducts: async (_: any, args: any) => {
      return await SearchService.searchProducts(args);
    },
    me: async (_: any, __: any, context: any) => {
      if (!context.user) return null;
      return await prisma.user.findUnique({ where: { id: context.user.id } });
    },
    getMyProducts: async (_: any, __: any, context: any) => {
      if (!context.user || context.user.role !== 'SELLER') {
        throw new Error('Not authorized as a seller');
      }
      return await prisma.product.findMany({
        where: { sellerId: context.user.id },
        orderBy: { createdAt: 'desc' }
      });
    },
    getSellerAnalytics: async (_: any, __: any, context: any) => {
      if (!context.user || context.user.role !== 'SELLER') {
        throw new Error('Not authorized as a seller');
      }
      
      // Calculate real analytics based on OrderItem model
      const orderItems = await prisma.orderItem.findMany({
        where: { sellerId: context.user.id },
        include: { product: true }
      });

      let totalRevenue = 0;
      let salesLast30Days = 0;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const modelCounts: Record<string, number> = {};

      orderItems.forEach(item => {
        const itemTotal = item.priceAtTime * item.quantity;
        totalRevenue += itemTotal;
        
        if (item.createdAt >= thirtyDaysAgo) {
          salesLast30Days += itemTotal;
        }

        const modelName = item.product.name;
        if (!modelCounts[modelName]) modelCounts[modelName] = 0;
        modelCounts[modelName] += item.quantity;
      });

      let topModel = null;
      let maxCount = 0;
      for (const [model, count] of Object.entries(modelCounts)) {
        if (count > maxCount) {
          maxCount = count;
          topModel = model;
        }
      }

      // Calculate monthly revenue for the current year
      const currentYear = new Date().getFullYear();
      const monthlyRevenueMap: Record<string, number> = {
        Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
        Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0
      };
      const monthlyOrdersMap: Record<string, number> = {
        Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
        Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0
      };
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      orderItems.forEach(item => {
        let itemDate;
        if (typeof item.createdAt === "string") {
          // If it's a string, it might be a timestamp string like "1718182054000"
          itemDate = new Date(isNaN(Number(item.createdAt)) ? item.createdAt : Number(item.createdAt));
        } else {
          itemDate = new Date(item.createdAt);
        }

        if (itemDate.getFullYear() === currentYear) {
          const monthStr = monthNames[itemDate.getMonth()];
          monthlyRevenueMap[monthStr] += (item.priceAtTime * item.quantity);
          monthlyOrdersMap[monthStr] += item.quantity; // Summing up the quantity of items sold
        }
      });

      const monthlyRevenue = monthNames.map(name => ({
        name,
        total: monthlyRevenueMap[name],
        orders: monthlyOrdersMap[name]
      }));

      return {
        totalRevenue,
        salesLast30Days,
        totalOrders: orderItems.length,
        topModel,
        monthlyRevenue
      };
    },
    getPublicProducts: async () => {
      return await prisma.product.findMany({
        where: { status: 'APPROVED' },
        orderBy: { createdAt: 'desc' },
        take: 12 // Limit to 12 recent laptops for the homepage
      });
    },
    getWishlist: async (_: any, __: any, context: any) => {
      if (!context.user) return [];
      const wishlistItems = await prisma.wishlistItem.findMany({
        where: { userId: context.user.id },
        include: { product: true }
      });
      return wishlistItems.map(item => item.product);
    },
    getProduct: async (_: any, { id }: { id: string }) => {
      return await prisma.product.findUnique({
        where: { id },
        include: { seller: true }
      });
    },
    getCart: async (_: any, __: any, context: any) => {
      if (!context.user) return [];
      return await prisma.cartItem.findMany({
        where: { userId: context.user.id },
        include: { product: true },
        orderBy: { createdAt: 'asc' }
      });
    },
    getAdminAnalytics: async (_: any, __: any, context: any) => {
      if (!context.user || context.user.role !== 'ADMIN') throw new Error("Unauthorized");
      
      const totalUsers = await prisma.user.count();
      const totalSellers = await prisma.user.count({ where: { role: 'SELLER' } });
      const pendingApprovals = await prisma.product.count({ where: { status: 'PENDING' } });
      
      const orders = await prisma.order.findMany({
        include: { items: true }
      });
      const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

      // Calculate monthly revenue for the current year
      const currentYear = new Date().getFullYear();
      const monthlyRevenueMap: Record<string, number> = {
        Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
        Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0
      };
      const monthlyOrdersMap: Record<string, number> = {
        Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
        Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0
      };
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      orders.forEach(order => {
        let orderDate;
        if (typeof order.createdAt === "string") {
          orderDate = new Date(isNaN(Number(order.createdAt)) ? order.createdAt : Number(order.createdAt));
        } else {
          orderDate = new Date(order.createdAt);
        }

        if (orderDate.getFullYear() === currentYear) {
          const monthStr = monthNames[orderDate.getMonth()];
          monthlyRevenueMap[monthStr] += order.totalAmount;
          monthlyOrdersMap[monthStr] += 1; // Count each order as 1 order for admin
        }
      });

      const monthlyRevenue = monthNames.map(name => ({
        name,
        total: monthlyRevenueMap[name],
        orders: monthlyOrdersMap[name]
      }));
      
      // Fetch recent things for activity feed
      const recentUsers = await prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 3 });
      const recentProducts = await prisma.product.findMany({ orderBy: { createdAt: 'desc' }, take: 3, include: { seller: true } });
      const recentOrders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 3, include: { buyer: true } });
      
      const activity: any[] = [];
      recentUsers.forEach(u => activity.push({ id: `user-${u.id}`, type: 'USER', message: `New ${u.role.toLowerCase()} registered: ${u.name}`, time: u.createdAt.toISOString() }));
      recentProducts.forEach(p => activity.push({ id: `prod-${p.id}`, type: 'PRODUCT', message: `Product ${p.status === 'PENDING' ? 'submitted for approval' : 'added'}: ${p.name}`, time: p.createdAt.toISOString() }));
      recentOrders.forEach(o => activity.push({ id: `order-${o.id}`, type: 'ORDER', message: `Order #${o.id.substring(0,6)} placed by ${o.buyer.name}`, time: o.createdAt.toISOString() }));
      
      // Sort by time desc and take top 6
      activity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      
      return {
        totalRevenue,
        activeUsers: totalUsers,
        activeSellers: totalSellers,
        pendingApprovals,
        recentActivity: activity.slice(0, 6),
        monthlyRevenue
      };
    },
    getSystemLogs: async (_: any, __: any, context: any) => {
      if (!context.user || context.user.role !== 'ADMIN') throw new Error("Unauthorized");
      
      // Fetch more records for the dedicated logs page
      const recentUsers = await prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
      const recentProducts = await prisma.product.findMany({ orderBy: { createdAt: 'desc' }, take: 50, include: { seller: true } });
      const recentOrders = await prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 50, include: { buyer: true } });
      
      const activity: any[] = [];
      recentUsers.forEach(u => activity.push({ id: `user-${u.id}`, type: 'USER', message: `New ${u.role.toLowerCase()} registered: ${u.name}`, time: u.createdAt.toISOString() }));
      recentProducts.forEach(p => activity.push({ id: `prod-${p.id}`, type: 'PRODUCT', message: `Product ${p.status === 'PENDING' ? 'submitted for approval' : 'added'}: ${p.name}`, time: p.createdAt.toISOString() }));
      recentOrders.forEach(o => activity.push({ id: `order-${o.id}`, type: 'ORDER', message: `Order #${o.id.substring(0,6)} placed by ${o.buyer.name}`, time: o.createdAt.toISOString() }));
      
      // Sort by time desc and take top 100
      activity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      return activity.slice(0, 100);
    },
    getPendingProducts: async (_: any, __: any, context: any) => {
      if (!context.user || context.user.role !== 'ADMIN') throw new Error("Unauthorized");
      return await prisma.product.findMany({
        where: { status: 'PENDING' },
        include: { seller: true },
        orderBy: { createdAt: 'desc' }
      });
    },
    getLiveInventory: async (_: any, __: any, context: any) => {
      if (!context.user || context.user.role !== 'ADMIN') throw new Error("Unauthorized");
      return await prisma.product.findMany({
        where: { status: 'APPROVED' },
        include: { seller: true },
        orderBy: { createdAt: 'desc' }
      });
    },
    getAllUsers: async (_: any, __: any, context: any) => {
      if (!context.user || context.user.role !== 'ADMIN') throw new Error("Unauthorized");
      return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
      });
    },
    getSellerOrders: async (_: any, __: any, context: any) => {
      if (!context.user || context.user.role !== 'SELLER') {
        throw new Error("Not authorized as a seller");
      }
      
      // Fetch all order items belonging to this seller
      return await prisma.orderItem.findMany({
        where: { sellerId: context.user.id },
        include: {
          product: true,
          order: {
            include: { buyer: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    },
    getMyOrders: async (_: any, __: any, context: any) => {
      if (!context.user) return [];
      
      // JIT update for demo: if delivery time passed, set to DELIVERED
      await prisma.order.updateMany({
        where: {
          buyerId: context.user.id,
          status: 'PENDING',
          estimatedDeliveryAt: { lte: new Date() }
        },
        data: { status: 'DELIVERED' }
      });

      return await prisma.order.findMany({
        where: { buyerId: context.user.id },
        include: { 
          items: {
            include: { product: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    },
    getOrder: async (_: any, { id }: any, context: any) => {
      if (!context.user) throw new Error("Unauthorized");
      
      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          buyer: true,
          items: {
            include: { product: true }
          }
        }
      });
      
      if (!order) throw new Error("Order not found");
      
      // Ensure the user is either the buyer or an admin
      if (order.buyerId !== context.user.id && context.user.role !== 'ADMIN') {
        throw new Error("Unauthorized");
      }
      
      return order;
    },
    getAllOrders: async (_: any, __: any, context: any) => {
      if (!context.user || context.user.role !== 'ADMIN') throw new Error("Unauthorized");
      
      // JIT update for demo
      await prisma.order.updateMany({
        where: {
          status: 'PENDING',
          estimatedDeliveryAt: { lte: new Date() }
        },
        data: { status: 'DELIVERED' }
      });

      return await prisma.order.findMany({
        include: { 
          buyer: true,
          items: {
            include: { product: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    }
  },
  Mutation: {
    register: async (_: any, { name, email, password, role }: any) => {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) throw new Error('Email already exists');

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword, role },
      });

      const token = signToken({ id: user.id, email: user.email, role: user.role });
      setAuthCookie(token);

      return { token, user };
    },
    login: async (_: any, { email, password }: any) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) throw new Error('Invalid email or password');

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new Error('Invalid email or password');

      const token = signToken({ id: user.id, email: user.email, role: user.role });
      setAuthCookie(token);

      return { token, user };
    },
    logout: () => {
      clearAuthCookie();
      return true;
    },
    forgotPassword: async (_: any, { email }: any) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new Error('Email address not found in our records');
      }

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExpiry }
      });

      const emailSent = await sendPasswordResetEmail(user.email, resetToken);
      if (!emailSent) {
        throw new Error('Failed to send email. Check SMTP credentials in server console.');
      }
      return true;
    },
    resetPassword: async (_: any, { token, password }: any) => {
      const user = await prisma.user.findFirst({
        where: {
          resetToken: token,
          resetTokenExpiry: { gt: new Date() }
        }
      });

      if (!user) throw new Error('Invalid or expired reset token');

      const hashedPassword = await bcrypt.hash(password, 10);
      
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null
        }
      });

      return true;
    },
    updateProfile: async (_: any, { name, email, phone, address, zipCode }: any, context: any) => {
      if (!context.user) throw new Error('Not authenticated');

      const data: any = {};
      if (name !== undefined) data.name = name;
      if (phone !== undefined) data.phone = phone;
      if (address !== undefined) data.address = address;
      if (zipCode !== undefined) data.zipCode = zipCode;
      
      if (email) {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser && existingUser.id !== context.user.id) {
          throw new Error('Email already in use');
        }
        data.email = email;
      }

      return await prisma.user.update({
        where: { id: context.user.id },
        data
      });
    },
    changePassword: async (_: any, { currentPassword, newPassword }: any, context: any) => {
      if (!context.user) throw new Error('Not authenticated');

      const user = await prisma.user.findUnique({ where: { id: context.user.id } });
      if (!user) throw new Error('User not found');

      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) throw new Error('Incorrect current password');

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword }
      });

      return true;
    },
    createProduct: async (_: any, args: any, context: any) => {
      if (!context.user || context.user.role !== 'SELLER') {
        throw new Error('Not authorized as a seller');
      }

      const product = await prisma.product.create({
        data: {
          sellerId: context.user.id,
          name: args.name,
          brand: args.brand,
          modelNumber: args.modelNumber,
          series: args.series,
          description: args.description,
          processor: args.processor,
          ram: args.ram,
          storage: args.storage,
          graphics: args.graphics,
          displaySize: args.displaySize,
          displayRes: args.displayRes,
          os: args.os,
          battery: args.battery,
          price: args.price,
          stock: args.stock,
          images: args.images,
          warrantyPeriod: args.warrantyPeriod,
          warrantyType: args.warrantyType,
          status: 'PENDING'
        }
      });

      return product;
    },
    updateProduct: async (_: any, { id, price, stock, discountPercent }: any, context: any) => {
      if (!context.user || context.user.role !== 'SELLER') {
        throw new Error('Not authorized');
      }

      const product = await prisma.product.findUnique({ where: { id } });
      if (!product || product.sellerId !== context.user.id) {
        throw new Error('Product not found or not owned by you');
      }

      const data: any = {};
      if (price !== undefined) data.price = price;
      if (stock !== undefined) data.stock = stock;
      if (discountPercent !== undefined) data.discountPercent = discountPercent;

      return await prisma.product.update({
        where: { id },
        data
      });
    },
    deleteProduct: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.user) throw new Error("Not authenticated");
      const product = await prisma.product.findUnique({ where: { id } });
      if (!product || product.sellerId !== context.user.id) throw new Error("Unauthorized");
      
      await prisma.product.delete({ where: { id } });
      return true;
    },
    toggleWishlist: async (_: any, { productId }: { productId: string }, context: any) => {
      if (!context.user) throw new Error("Not authenticated");
      
      // Check if product exists in wishlist
      const existingItem = await prisma.wishlistItem.findUnique({
        where: {
          userId_productId: {
            userId: context.user.id,
            productId: productId
          }
        }
      });
      
      if (existingItem) {
        // Remove it
        await prisma.wishlistItem.delete({
          where: { id: existingItem.id }
        });
        return false; // False means removed
      } else {
        // Add it
        await prisma.wishlistItem.create({
          data: {
            userId: context.user.id,
            productId: productId
          }
        });
        return true; // True means added
      }
    },
    addToCart: async (_: any, { productId }: { productId: string }, context: any) => {
      if (!context.user) throw new Error("Not authenticated");
      
      const existingItem = await prisma.cartItem.findUnique({
        where: {
          userId_productId: {
            userId: context.user.id,
            productId: productId
          }
        }
      });
      
      if (existingItem) {
        await prisma.cartItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + 1 }
        });
      } else {
        await prisma.cartItem.create({
          data: {
            userId: context.user.id,
            productId: productId,
            quantity: 1
          }
        });
      }
      return true;
    },
    removeFromCart: async (_: any, { productId }: { productId: string }, context: any) => {
      if (!context.user) throw new Error("Not authenticated");
      
      await prisma.cartItem.deleteMany({
        where: {
          userId: context.user.id,
          productId: productId
        }
      });
      return true;
    },
    updateCartQuantity: async (_: any, { productId, quantity }: { productId: string, quantity: number }, context: any) => {
      if (!context.user) throw new Error("Not authenticated");
      
      if (quantity <= 0) {
        await prisma.cartItem.deleteMany({
          where: {
            userId: context.user.id,
            productId: productId
          }
        });
      } else {
        await prisma.cartItem.updateMany({
          where: {
            userId: context.user.id,
            productId: productId
          },
          data: { quantity }
        });
      }
      return true;
    },
    updateProductStatus: async (_: any, { id, status }: { id: string, status: any }, context: any) => {
      if (!context.user || context.user.role !== 'ADMIN') throw new Error("Unauthorized");
      return await prisma.product.update({
        where: { id },
        data: { status }
      });
    },
    updateOrderStatus: async (_: any, { id, status }: { id: string, status: any }, context: any) => {
      if (!context.user) throw new Error("Unauthorized");
      if (context.user.role !== 'ADMIN' && context.user.role !== 'SELLER') {
        throw new Error("Unauthorized: Only Admins or Sellers can update order status.");
      }
      return await prisma.order.update({
        where: { id },
        data: { status }
      });
    },
    deleteUser: async (_: any, { id }: { id: string }, context: any) => {
      if (!context.user || context.user.role !== 'ADMIN') throw new Error("Unauthorized");
      // Prevent deleting yourself
      if (context.user.id === id) throw new Error("Cannot delete your own account");
      
      await prisma.user.delete({ where: { id } });
      return true;
    },
    addReview: async (_: any, { productId, rating, comment }: { productId: string, rating: number, comment?: string }, context: any) => {
      if (!context.user) throw new Error("Not authenticated");
      
      // Upsert the review (create if not exists, update if exists)
      return await prisma.review.upsert({
        where: {
          userId_productId: {
            userId: context.user.id,
            productId
          }
        },
        update: {
          rating,
          comment
        },
        create: {
          userId: context.user.id,
          productId,
          rating,
          comment
        },
        include: {
          user: true,
          product: true
        }
      });
    },
    deleteReview: async (_: any, { productId }: { productId: string }, context: any) => {
      if (!context.user) throw new Error("Not authenticated");
      
      try {
        await prisma.review.delete({
          where: {
            userId_productId: {
              userId: context.user.id,
              productId
            }
          }
        });
        return true;
      } catch (e) {
        throw new Error("Review not found or you don't have permission to delete it.");
      }
    },
    checkout: async (_: any, args: { address: string, city: string, zipCode: string, phone: string }, context: any) => {
      if (!context.user) throw new Error("Not authenticated");
      const userId = context.user.id;

      // 1. Get cart items
      const cartItems = await prisma.cartItem.findMany({
        where: { userId },
        include: { product: true }
      });

      if (cartItems.length === 0) {
        throw new Error("Cart is empty");
      }

      // 2. Calculate total
      let subtotal = 0;
      for (const item of cartItems) {
        const p = item.product;
        const isDiscounted = p.discountPercent > 0;
        const price = isDiscounted ? p.price * (1 - p.discountPercent / 100) : p.price;
        subtotal += price * item.quantity;
      }
      const tax = subtotal * 0.08;
      const totalAmount = subtotal + tax;

      // Calculate estimated delivery: if city length is even, 2 mins. If odd, 5 mins.
      const deliveryMins = args.city.length % 2 === 0 ? 2 : 5;
      const estimatedDeliveryAt = new Date(Date.now() + deliveryMins * 60000);

      // 3. Create Order and OrderItems in a transaction
      const order = await prisma.$transaction(async (tx) => {
        const newOrder = await tx.order.create({
          data: {
            buyerId: userId,
            totalAmount,
            status: "PENDING",
            estimatedDeliveryAt,
            // Note: Schema doesn't currently store address/phone directly on order, but typically we'd add fields or store it.
            // For now, we proceed as the schema defines it.
            items: {
              create: cartItems.map(item => {
                const p = item.product;
                const isDiscounted = p.discountPercent > 0;
                const priceAtTime = isDiscounted ? p.price * (1 - p.discountPercent / 100) : p.price;
                return {
                  productId: item.productId,
                  sellerId: p.sellerId,
                  quantity: item.quantity,
                  priceAtTime,
                };
              })
            }
          }
        });

        // 4. Update stock and clear cart
        for (const item of cartItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { decrement: item.quantity } }
          });
        }

        await tx.cartItem.deleteMany({
          where: { userId }
        });

        return newOrder;
      });

      return order.id;
    }
  },
  Product: {
    reviews: async (parent: any) => {
      return await prisma.review.findMany({
        where: { productId: parent.id },
        include: { user: true },
        orderBy: { createdAt: 'desc' }
      });
    },
    averageRating: async (parent: any) => {
      const result = await prisma.review.aggregate({
        where: { productId: parent.id },
        _avg: { rating: true }
      });
      return result._avg.rating || 0;
    },
    reviewCount: async (parent: any) => {
      return await prisma.review.count({
        where: { productId: parent.id }
      });
    }
  }
};
