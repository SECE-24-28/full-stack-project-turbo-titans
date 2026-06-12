export const typeDefs = `#graphql
  enum Role {
    ADMIN
    SELLER
    BUYER
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
    phone: String
    address: String
    zipCode: String
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Review {
    id: ID!
    user: User!
    product: Product!
    rating: Int!
    comment: String
    createdAt: String!
  }

  type Product {
    id: ID!
    sellerId: String!
    seller: User!
    name: String!
    brand: String!
    modelNumber: String!
    series: String
    description: String!
    processor: String!
    ram: String!
    storage: String!
    graphics: String!
    displaySize: String!
    displayRes: String!
    os: String!
    battery: String
    price: Float!
    stock: Int!
    images: [String!]!
    warrantyPeriod: String
    warrantyType: String
    discountPercent: Int!
    status: String!
    createdAt: String!
    updatedAt: String!
    
    reviews: [Review!]!
    averageRating: Float!
    reviewCount: Int!
  }

  type MonthlyRevenue {
    name: String!
    total: Float!
    orders: Int!
  }

  type SellerAnalytics {
    totalRevenue: Float!
    salesLast30Days: Float!
    totalOrders: Int!
    topModel: String
    monthlyRevenue: [MonthlyRevenue!]!
  }

  type ActivityItem {
    id: ID!
    type: String!
    message: String!
    time: String!
  }

  type AdminAnalytics {
    totalRevenue: Float!
    activeUsers: Int!
    activeSellers: Int!
    pendingApprovals: Int!
    recentActivity: [ActivityItem!]!
    monthlyRevenue: [MonthlyRevenue!]!
  }

  type CartItem {
    id: ID!
    product: Product!
    quantity: Int!
  }

  type OrderItem {
    id: ID!
    product: Product!
    quantity: Int!
    priceAtTime: Float!
    sellerId: String!
    order: Order!
    createdAt: String!
  }

  type Order {
    id: ID!
    buyerId: String!
    buyer: User!
    totalAmount: Float!
    status: String!
    estimatedDeliveryAt: String
    createdAt: String!
    updatedAt: String!
    items: [OrderItem!]!
  }

  type Query {
    me: User
    getMyProducts: [Product!]!
    getSellerAnalytics: SellerAnalytics!
    getPublicProducts: [Product!]!
    getWishlist: [Product!]!
    getCart: [CartItem!]!
    getMyOrders: [Order!]!
    getOrder(id: ID!): Order
    getProduct(id: ID!): Product
    
    # Search System
    searchProducts(
      q: String
      brand: String
      minPrice: Float
      maxPrice: Float
      ram: String
      storage: String
      sort: String
      processor: String
      graphics: String
      minRating: Float
    ): [Product!]!
    
    getAdminAnalytics: AdminAnalytics!
    getSystemLogs: [ActivityItem!]!
    getPendingProducts: [Product!]!
    getLiveInventory: [Product!]!
    getSellerOrders: [OrderItem!]!
    getAllUsers: [User!]!
    getAllOrders: [Order!]!
  }

  type Mutation {
    register(name: String!, email: String!, password: String!, role: Role!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    logout: Boolean!
    forgotPassword(email: String!): Boolean!
    resetPassword(token: String!, password: String!): Boolean!
    updateProfile(name: String, email: String, phone: String, address: String, zipCode: String): User!
    changePassword(currentPassword: String!, newPassword: String!): Boolean!
    
    createProduct(
      name: String!
      brand: String!
      modelNumber: String!
      series: String
      description: String!
      processor: String!
      ram: String!
      storage: String!
      graphics: String!
      displaySize: String!
      displayRes: String!
      os: String!
      battery: String
      price: Float!
      stock: Int!
      images: [String!]!
      warrantyPeriod: String
      warrantyType: String
    ): Product!
    
    updateProduct(
      id: ID!
      price: Float
      stock: Int
      discountPercent: Int
    ): Product!
    
    deleteProduct(id: ID!): Boolean!
    toggleWishlist(productId: ID!): Boolean!
    
    addToCart(productId: ID!): Boolean!
    removeFromCart(productId: ID!): Boolean!
    updateCartQuantity(productId: ID!, quantity: Int!): Boolean!
    
    updateProductStatus(id: ID!, status: String!): Product!
    updateOrderStatus(id: ID!, status: String!): Order!
    
    checkout(
      address: String!
      city: String!
      zipCode: String!
      phone: String!
    ): ID!
    
    addReview(productId: ID!, rating: Int!, comment: String): Review!
    deleteReview(productId: ID!): Boolean!
    deleteUser(id: ID!): Boolean!
  }
`;
