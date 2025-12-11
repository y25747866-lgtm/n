
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useSubscription } from "@/contexts/subscription-provider";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { testApiKey } from "@/ai/flows/test-api-key-flow";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { subscription } = useSubscription();
  const { toast } = useToast();
  const [isTesting, setIsTesting] = useState(false);

  const handleTestApiKey = async () => {
    setIsTesting(true);
    const result = await testApiKey();
    setIsTesting(false);

    toast({
      title: result.success ? "Success" : "Error",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });
  };
  
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
            <Input id="name" defaultValue="Boss User" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="boss@example.com" />
          </div>
          <Button>Save Changes</Button>
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
      
      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Developer Settings</CardTitle>
          <CardDescription>
            Verify your integration with external services.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleTestApiKey} disabled={isTesting}>
            {isTesting ? <Loader2 className="animate-spin" /> : null}
            Test Gemini API Key
          </Button>
           <p className="text-sm text-muted-foreground mt-2">
            Checks if the <code>GEMINI_API_KEY</code> is correctly configured in your <code>.env</code> file.
          </p>
        </CardContent>
      </Card>

    </div>
  );
}
