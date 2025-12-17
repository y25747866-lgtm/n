
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart as BarChartIcon, Link as LinkIcon, Loader2, DollarSign, ShoppingCart } from 'lucide-react';
import { AreaChart, BarChart, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Area, Bar } from 'recharts';
import {
  ChartTooltip,
  ChartTooltipContent,
  ChartContainer,
} from "@/components/ui/chart"

const salesData = [
    { month: "Jan", sales: 186, revenue: 8000 },
    { month: "Feb", sales: 305, revenue: 9500 },
    { month: "Mar", sales: 237, revenue: 7800 },
    { month: "Apr", sales: 173, revenue: 11000 },
    { month: "May", sales: 209, revenue: 12400 },
    { month: "Jun", sales: 214, revenue: 14000 },
    { month: "Jul", sales: 345, revenue: 17500 },
    { month: "Aug", sales: 310, revenue: 16000 },
    { month: "Sep", sales: 280, revenue: 15000 },
    { month: "Oct", sales: 410, revenue: 19000 },
    { month: "Nov", sales: 450, revenue: 22000 },
    { month: "Dec", sales: 520, revenue: 25000 },
];

const chartConfig = {
  sales: {
    label: "Sales",
    color: "hsl(var(--primary))",
  },
  revenue: {
    label: "Revenue",
    color: "hsl(var(--accent-1-end))",
  },
} satisfies import("@/components/ui/chart").ChartConfig;

const totalRevenue = salesData.reduce((acc, curr) => acc + curr.revenue, 0);
const totalSales = salesData.reduce((acc, curr) => acc + curr.sales, 0);

function AnalyticsDashboard() {
  return (
      <div className="space-y-8 animate-fade-in">
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalRevenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
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

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>Monthly sales performance for the last 12 months.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={salesData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="sales" fill="var(--color-sales)" radius={4} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue trend for the last 12 months.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <AreaChart data={salesData}>
                    <defs>
                        <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop
                            offset="5%"
                            stopColor="var(--color-revenue)"
                            stopOpacity={0.8}
                        />
                        <stop
                            offset="95%"
                            stopColor="var(--color-revenue)"
                            stopOpacity={0.1}
                        />
                        </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" fill="url(#fillRevenue)" />
                </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
  )
}


export default function AnalyticsPage() {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const handleConnect = () => {
    setIsConnecting(true);
    setTimeout(() => {
        setIsConnected(true);
        setIsConnecting(false);
    }, 1500)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChartIcon className="h-8 w-8" />
            Analytics
        </h1>
        <p className="text-muted-foreground">Your sales and revenue dashboard.</p>
      </div>

      {isConnected ? (
        <AnalyticsDashboard />
      ) : (
        <Card className="glass-card text-center max-w-2xl mx-auto">
            <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
                <LinkIcon className="h-6 w-6" />
                Connect Your Whop Account
            </CardTitle>
            <CardDescription>
                To see your live sales and revenue, you will need to grant permission for this app to connect to your Whop account.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <p className="text-muted-foreground mb-4">
               Once you approve the connection via <a href="https://whop.com/?a=zm1a" target="_blank" rel="noopener noreferrer" className="underline text-primary hover:text-primary/80">Whop</a>, this dashboard will show how much you've sold and the revenue you've generated.
            </p>
            <Button size="lg" onClick={handleConnect} disabled={isConnecting}>
                {isConnecting ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Connecting...
                    </>
                ) : (
                    "Connect to Whop & Grant Permission"
                )}
            </Button>
            </CardContent>
        </Card>
      )}

    </div>
  );
}
