
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart as BarChartIcon, Link as LinkIcon, Loader2, DollarSign, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { AreaChart, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area, Bar } from 'recharts';
import {
  ChartTooltip,
  ChartTooltipContent,
  ChartContainer,
} from "@/components/ui/chart"

const salesData = [
  { month: "January", sales: 186, revenue: 8000 },
  { month: "February", sales: 305, revenue: 9500 },
  { month: "March", sales: 237, revenue: 7800 },
  { month: "April", sales: 173, revenue: 11000 },
  { month: "May", sales: 209, revenue: 12400 },
  { month: "June", sales: 214, revenue: 14000 },
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
              <div className="text-2xl font-bold">$24,852</div>
              <p className="text-xs text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+1,125</div>
              <p className="text-xs text-muted-foreground">+180.1% from last month</p>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>A look at the number of sales per month.</CardDescription>
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
            <CardDescription>A look at the revenue generated per month.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
                <AreaChart data={salesData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="var(--color-revenue)" fill="var(--color-revenue)" fillOpacity={0.4} />
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
                Grant permission to view your live sales data directly from Whop.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <p className="text-muted-foreground mb-4">
                To see your real-time sales and revenue, you will need to grant permission for this app to connect to your Whop account. Once you approve the connection, this dashboard will show how much you've sold and the revenue you've generated.
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
