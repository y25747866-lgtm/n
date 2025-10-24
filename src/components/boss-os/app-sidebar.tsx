'use client';

import {
  LayoutDashboard,
  PenSquare,
  Flame,
  Download,
  CreditCard,
  Settings,
  Badge,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { Logo } from './logo';
import { useSubscription } from '@/contexts/subscription-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const menuItems = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/generate', label: 'Generate Product', icon: PenSquare },
  { href: '/trending', label: 'Trending Ideas', icon: Flame },
  { href: '/downloads', label: 'My Downloads', icon: Download },
  { href: '/subscription', label: 'Subscription', icon: CreditCard },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export default function AppSidebar() {
  const pathname = usePathname();
  const { subscription } = useSubscription();

  const maxCredits = subscription.status === 'active' && subscription.planId === 'monthly' ? 50 :
                     subscription.status === 'active' && subscription.planId === 'annual' ? 600 : 0;
  const creditUsage = maxCredits > 0 ? (maxCredits - subscription.credits) / maxCredits * 100 : 0;

  return (
    <>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname === item.href}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
         <Card className="m-2 bg-transparent border-dashed">
            <CardHeader className="p-4">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>
                {subscription.status === 'unsubscribed' && 'No Plan'}
                {subscription.status === 'active' && subscription.planId === 'monthly' && 'Monthly Plan'}
                {subscription.status === 'active' && subscription.planId === 'annual' && 'Annual Plan'}
                </span>
                {subscription.status !== 'unsubscribed' && (
                  <Badge variant="default" className="capitalize">
                     {subscription.status}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
               <div className="text-xs text-muted-foreground mb-2">
                {subscription.credits} Credits Remaining
               </div>
               <Progress value={100 - creditUsage} className="h-2"/>
            </CardContent>
        </Card>
      </SidebarFooter>
    </>
  );
}
