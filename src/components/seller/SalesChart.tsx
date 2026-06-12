"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

interface SalesChartProps {
  data: {
    name: string;
    total: number;
    orders: number;
  }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="rounded-lg border bg-card p-3 shadow-sm min-w-[120px]">
        <p className="text-sm font-medium text-muted-foreground mb-2 pb-2 border-b">{label}</p>
        <div className="space-y-1">
          <p className="text-sm font-bold text-primary flex justify-between">
            <span>Sales:</span> 
            <span>₹{data.total.toLocaleString('en-IN')}</span>
          </p>
          <p className="text-sm font-medium text-muted-foreground flex justify-between">
            <span>Orders:</span> 
            <span>{data.orders} {data.orders === 1 ? 'laptop' : 'laptops'}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function SalesChart({ data }: SalesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `₹${value}`}
        />
        <Tooltip cursor={{ fill: "var(--accent)" }} content={<CustomTooltip />} />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
