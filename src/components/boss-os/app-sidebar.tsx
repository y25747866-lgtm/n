'use client';

import {
  LayoutDashboard,
  PenSquare,
  Flame,
  Download,
  CreditCard,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Sidebar,
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
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';

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

  return (
    <Sidebar>
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
            <CardHeader className="p-4 pb-2">
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
            {subscription.status === 'unsubscribed' && (
              <CardContent className="p-4 pt-0">
                  <Link href="/subscription">
                    <Button size="sm" className="w-full">
                      Subscribe
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
              </CardContent>
            )}
        </Card>
      </SidebarFooter>
    </Sidebar>
  );
}
