
'use client';

import {
  LayoutDashboard,
  CreditCard,
  Settings,
  LogOut,
  ArrowRight,
  Wand2,
  X,
  Search,
  History,
  ExternalLink,
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
import { useSubscription } from '@/contexts/subscription-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { useSidebar } from '@/contexts/sidebar-provider';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Separator } from '../ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { Logo } from './logo';
import { cn } from '@/lib/utils';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/generate', label: 'Generator', icon: Wand2 },
  { href: '/history', label: 'History', icon: History },
  { href: '/subscription', label: 'Subscription', icon: CreditCard },
  { href: '/settings', label: 'Settings', icon: Settings },
];

function ProfileSection({ session }: { session: Session }) {
    const { isOpen } = useSidebar();
    const router = useRouter();
    const { user } = session;
    const avatarImage = user?.user_metadata?.avatar_url;
    const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('') : 'U';

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
    }

    if (!user) return null;

    if (!isOpen) {
        return (
            <div className="p-2">
                <TooltipProvider delayDuration={0}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                             <Link href="/settings">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={avatarImage} alt={user.user_metadata?.full_name || "User Avatar"} />
                                    <AvatarFallback>{getInitials(user.user_metadata?.full_name || "User")}</AvatarFallback>
                                </Avatar>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                           <p>{user.user_metadata?.full_name || "Anonymous User"}</p>
                           <p className="text-xs text-muted-foreground">{user.email || `UID: ${user.id.slice(0,6)}...`}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        )
    }

    return (
        <div className="p-4">
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={avatarImage} alt={user.user_metadata?.full_name || "User Avatar"} />
                    <AvatarFallback>{getInitials(user.user_metadata?.full_name || "User")}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-semibold leading-none">{user.user_metadata?.full_name || "Anonymous User"}</p>
                    <p className="text-xs leading-none text-muted-foreground mt-1">{user.email || `UID: ${user.id.slice(0,12)}...`}</p>
                </div>
            </div>
            <Button variant="ghost" className="w-full justify-start mt-2" onClick={handleSignOut}>
                <LogOut />
                <span>Log out</span>
            </Button>
        </div>
    )
}

function SidebarInnerContent({ session }: { session: Session }) {
    const pathname = usePathname();
    const { subscription } = useSubscription();
    const { isOpen } = useSidebar();

    return (
        <>
            <SidebarHeader>
                <Logo />
            </SidebarHeader>
            <SidebarContent>
                <TooltipProvider delayDuration={0}>
                    <SidebarMenu>
                        {menuItems.map((item) => (
                            <SidebarMenuItem key={item.href}>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <Link href={item.href}>
                                            <SidebarMenuButton
                                                isActive={pathname === item.href}
                                            >
                                                <item.icon />
                                                {isOpen && <span>{item.label}</span>}
                                            </SidebarMenuButton>
                                        </Link>
                                    </TooltipTrigger>
                                    {!isOpen && (
                                        <TooltipContent side="right">
                                            {item.label}
                                        </TooltipContent>
                                    )}
                                </Tooltip>
                            </SidebarMenuItem>
                        ))}
                         <SidebarMenuItem>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <a href="https://whop.com/?a=zm1a" target="_blank" rel="noopener noreferrer">
                                        <SidebarMenuButton>
                                            <ExternalLink />
                                            {isOpen && <span>Whop</span>}
                                        </SidebarMenuButton>
                                    </a>
                                </TooltipTrigger>
                                {!isOpen && (
                                    <TooltipContent side="right">
                                        Whop
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </SidebarMenuItem>
                        <SidebarMenuItem>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <a href="https://payhip.com?fp_ref=yesh-malik48" target="_blank" rel="noopener noreferrer">
                                        <SidebarMenuButton>
                                            <ExternalLink />
                                            {isOpen && <span>Payhip</span>}
                                        </SidebarMenuButton>
                                    </a>
                                </TooltipTrigger>
                                {!isOpen && (
                                    <TooltipContent side="right">
                                        Payhip
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </TooltipProvider>
            </SidebarContent>
            <SidebarFooter>
                {isOpen && (
                    <div className="p-2">
                        <Card className="bg-transparent border-dashed">
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
                    </div>
                )}
                <Separator />
                <ProfileSection session={session} />
            </SidebarFooter>
        </>
    );
}

export default function AppSidebar({ session }: { session: Session }) {
  const { isMobile, isOpen, setIsOpen, isNavVisible, isClient } = useSidebar();

  if (!isClient || !isNavVisible) {
      return null;
  }

  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="left" className="w-72 bg-card p-0 flex flex-col">
            <VisuallyHidden>
              <SheetHeader>
                <SheetTitle>Main Menu</SheetTitle>
                <SheetDescription>
                  This is the main navigation menu for the application.
                </SheetDescription>
              </SheetHeader>
            </VisuallyHidden>
            <SidebarInnerContent session={session} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sidebar>
      <SidebarInnerContent session={session} />
    </Sidebar>
  );
}
