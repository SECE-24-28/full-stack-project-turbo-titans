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
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    token: String!
    user: User!
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
  }

  type SellerAnalytics {
    totalRevenue: Float!
    salesLast30Days: Float!
    totalOrders: Int!
    topModel: String
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
  }

  type CartItem {
    id: ID!
    product: Product!
    quantity: Int!
  }

  type Query {
    me: User
    getMyProducts: [Product!]!
    getSellerAnalytics: SellerAnalytics!
    getPublicProducts: [Product!]!
    getWishlist: [Product!]!
    getCart: [CartItem!]!
    getProduct(id: ID!): Product
    
    getAdminAnalytics: AdminAnalytics!
    getSystemLogs: [ActivityItem!]!
    getPendingProducts: [Product!]!
    getAllUsers: [User!]!
  }

  type Mutation {
    register(name: String!, email: String!, password: String!, role: Role!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    logout: Boolean!
    forgotPassword(email: String!): Boolean!
    resetPassword(token: String!, password: String!): Boolean!
    updateProfile(name: String, email: String): User!
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
    deleteUser(id: ID!): Boolean!
  }
`;
