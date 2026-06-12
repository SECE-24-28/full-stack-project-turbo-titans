const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const orderItems = await prisma.orderItem.findMany({
    include: { product: true }
  });

  let totalRevenue = 0;
  let salesLast30Days = 0;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const modelCounts = {};

  const currentYear = new Date().getFullYear();
  const monthlyRevenueMap = {
    Jan: 0, Feb: 0, Mar: 0, Apr: 0, May: 0, Jun: 0,
    Jul: 0, Aug: 0, Sep: 0, Oct: 0, Nov: 0, Dec: 0
  };
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  orderItems.forEach(item => {
    let itemDate;
    if (typeof item.createdAt === "string") {
      itemDate = new Date(isNaN(Number(item.createdAt)) ? item.createdAt : Number(item.createdAt));
    } else {
      itemDate = new Date(item.createdAt);
    }

    if (itemDate.getFullYear() === currentYear) {
      const monthStr = monthNames[itemDate.getMonth()];
      monthlyRevenueMap[monthStr] += (item.priceAtTime * item.quantity);
    }
  });

  const monthlyRevenue = monthNames.map(name => ({
    name,
    total: monthlyRevenueMap[name]
  }));

  console.log(JSON.stringify(monthlyRevenue, null, 2));
}
main();
