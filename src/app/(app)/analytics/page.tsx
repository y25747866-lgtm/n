
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart className="h-8 w-8" />
            Analytics
        </h1>
        <p className="text-muted-foreground">Your sales and revenue dashboard.</p>
      </div>

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
          <Button size="lg" asChild>
            <Link href="https://whop.com/?a=zm1a" target="_blank">
              Connect to Whop & Grant Permission
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
