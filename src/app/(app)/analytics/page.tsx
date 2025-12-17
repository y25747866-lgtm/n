
'use client';

import { Bar, BarChart, CartesianGrid, XAxis, Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { DollarSign, ShoppingCart } from 'lucide-react';

const salesData = [
    { month: 'January', sales: Math.floor(Math.random() * 200) + 50 },
    { month: 'February', sales: Math.floor(Math.random() * 200) + 70 },
    { month: 'March', sales: Math.floor(Math.random() * 200) + 90 },
    { month: 'April', sales: Math.floor(Math.random() * 200) + 110 },
    { month: 'May', sales: Math.floor(Math.random() * 200) + 130 },
    { month: 'June', sales: Math.floor(Math.random() * 200) + 150 },
];

const revenueData = [
  { month: 'January', revenue: Math.floor(Math.random() * 5000) + 1000 },
  { month: 'February', revenue: Math.floor(Math.random() * 5000) + 1500 },
  { month: 'March', revenue: Math.floor(Math.random() * 5000) + 2000 },
  { month: 'April', revenue: Math.floor(Math.random() * 5000) + 2500 },
  { month: 'May', revenue: Math.floor(Math.random() * 5000) + 3000 },
  { month: 'June', revenue: Math.floor(Math.random() * 5000) + 4000 },
];

const chartConfig = {
  sales: {
    label: 'Sales',
    color: 'hsl(var(--primary))',
  },
  revenue: {
    label: 'Revenue',
    color: 'hsl(var(--accent-1-end))',
  }
};

export default function AnalyticsPage() {
    const totalRevenue = revenueData.reduce((acc, item) => acc + item.revenue, 0);
    const totalSales = salesData.reduce((acc, item) => acc + item.sales, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Your sales and revenue dashboard.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">+{totalSales.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+180.1% from last month</p>
            </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>A look at the number of sales per month.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart accessibilityLayer data={salesData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="sales" fill="var(--color-sales)" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>A look at the revenue generated per month.</CardDescription>
          </CardHeader>
          <CardContent>
             <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <AreaChart accessibilityLayer data={revenueData}>
                    <CartesianGrid vertical={false} />
                    <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <defs>
                        <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1}/>
                        </linearGradient>
                    </defs>
                    <Area
                        dataKey="revenue"
                        type="natural"
                        fill="url(#fillRevenue)"
                        stroke="var(--color-revenue)"
                    />
                </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
