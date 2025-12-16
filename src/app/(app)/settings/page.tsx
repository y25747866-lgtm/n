
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useSubscription } from "@/contexts/subscription-provider";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useUser } from "@/firebase";

export default function SettingsPage() {
  const { subscription } = useSubscription();
  const { user } = useUser();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Update your personal details here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" defaultValue={user?.displayName || "Anonymous User"} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue={user?.email || "No email provided"} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="uid">User ID</Label>
            <Input id="uid" type="text" defaultValue={user?.uid} disabled />
          </div>
          <Button disabled>Save Changes (Coming Soon)</Button>
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
          <CardDescription>View and manage your current plan.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                    <h4 className="font-semibold">Current Plan</h4>
                    <p className="text-sm text-muted-foreground">
                        {subscription.renewalDate ? `Renews on ${subscription.renewalDate.toLocaleDateString()}` : "No active plan."}
                    </p>
                </div>
                <Badge variant={subscription.status === 'unsubscribed' ? 'destructive' : 'default'} className="capitalize text-lg px-4 py-1">
                    {subscription.status === 'unsubscribed' ? 'Unsubscribed' : subscription.planId}
                </Badge>
            </div>
            
            <Link href="/subscription">
              <Button variant="outline">Manage Subscription</Button>
            </Link>
        </CardContent>
      </Card>
    </div>
  );
}
