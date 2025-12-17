'use client';

import { useState, useMemo } from 'react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, ExternalLink, TrendingUp, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useTheme } from 'next-themes';

const chartData = [
  { month: "Jan", revenue: 4523, sales: 82 },
  { month: "Feb", revenue: 5120, sales: 95 },
  { month: "Mar", revenue: 6245, sales: 110 },
  { month: "Apr", revenue: 5890, sales: 105 },
  { month: "May", revenue: 7812, sales: 142 },
  { month: "Jun", revenue: 8345, sales: 155 },
  { month: "Jul", revenue: 9123, sales: 168 },
  { month: "Aug", revenue: 8890, sales: 160 },
  { month: "Sep", revenue: 10250, sales: 185 },
  { month: "Oct", revenue: 11500, sales: 210 },
  { month: "Nov", revenue: 12890, sales: 230 },
  { month: "Dec", revenue: 14500, sales: 260 },
];

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "hsl(var(--primary))",
  },
  sales: {
    label: "Sales",
    color: "hsl(var(--accent-1-end))",
  },
} satisfies ChartConfig;


function AnalyticsDashboard() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const primaryColor = 'hsl(var(--primary))';
  
  const { totalRevenue, totalSales, revenueChange, salesChange } = useMemo(() => {
    const totalRevenue = chartData.reduce((acc, item) => acc + item.revenue, 0);
    const totalSales = chartData.reduce((acc, item) => acc + item.sales, 0);

    const lastMonth = chartData[chartData.length - 1];
    const secondLastMonth = chartData[chartData.length - 2];

    const revenueChange = ((lastMonth.revenue - secondLastMonth.revenue) / secondLastMonth.revenue) * 100;
    const salesChange = ((lastMonth.sales - secondLastMonth.sales) / secondLastMonth.sales) * 100;
    
    return { totalRevenue, totalSales, revenueChange, salesChange };
  }, []);

  const formatCurrency = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground flex items-center">
              {revenueChange > 0 ? <TrendingUp className="h-4 w-4 text-green-500 mr-1" /> : <TrendingDown className="h-4 w-4 text-red-500 mr-1" />}
              {revenueChange.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{totalSales.toLocaleString()}</div>
             <p className="text-xs text-muted-foreground flex items-center">
              {salesChange > 0 ? <TrendingUp className="h-4 w-4 text-green-500 mr-1" /> : <TrendingDown className="h-4 w-4 text-red-500 mr-1" />}
              {salesChange.toFixed(1)}% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>A look at the number of sales per month.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="sales" fill="var(--color-sales)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>A look at the revenue generated per month.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px] w-full">
              <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={primaryColor} stopOpacity={0.8}/>
                    <stop offset="95%" stopColor={primaryColor} stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} tickFormatter={(value) => `$${Number(value) / 1000}k`} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Area type="monotone" dataKey="revenue" stroke={primaryColor} fillOpacity={1} fill="url(#fillRevenue)" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = () => {
    // In a real application, this would trigger an OAuth flow.
    // For this simulation, we'll just toggle the state.
    setIsConnected(true);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <LineChart className="h-8 w-8" />
            Analytics
        </h1>
        <p className="text-muted-foreground">
          {isConnected ? "Your sales and revenue dashboard." : "Connect your Whop account to see your sales data."}
        </p>
      </div>
      
      {isConnected ? (
        <AnalyticsDashboard />
      ) : (
        <Card className="text-center p-8 glass-card">
          <CardHeader>
            <CardTitle className="text-2xl">Connect to Whop Analytics</CardTitle>
            <CardDescription className="max-w-md mx-auto">
                You will need to grant permission for this application to access your sales data from Whop. If you grant permission, we can connect and show you how much you've sold.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" onClick={handleConnect}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Connect to Whop
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
