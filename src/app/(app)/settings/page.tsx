
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/boss-os/theme-toggle";
import { useSubscription } from "@/contexts/subscription-provider";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { saveApiKey } from "@/app/actions/settings";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function SettingsPage() {
  const { subscription } = useSubscription();
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState("");
                     
  const handleSaveApiKey = async () => {
    try {
      await saveApiKey(apiKey);
      toast({
        title: "API Key Saved",
        description: "Your Gemini API key has been securely saved.",
      });
      setApiKey("");
    } catch (error) {
      toast({
        title: "Error Saving Key",
        description: "There was a problem saving your API key. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    }
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
          <CardTitle>API Keys</CardTitle>
          <CardDescription>Manage your third-party API keys here.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gemini-api-key">Gemini API Key</Label>
            <Input 
              id="gemini-api-key" 
              type="password" 
              placeholder="Enter your Google AI Studio API Key" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              You can get your key from {" "}
              <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline">
                Google AI Studio
              </a>.
            </p>
          </div>
          <Button onClick={handleSaveApiKey} disabled={!apiKey}>Save API Key</Button>
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
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Customize the look and feel of the application.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <Label>Theme</Label>
              <p className="text-sm text-muted-foreground">Select your preferred color scheme.</p>
            </div>
            <ThemeToggle />
          </div>
        </CardContent>
      </Card>

    </div>
  );
}
