
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
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/generate', label: 'Generator', icon: Wand2 },
  { href: '/history', label: 'History', icon: History },
  { href: '/subscription', label: 'Subscription', icon: CreditCard },
  { href: '/settings', label: 'Settings', icon: Settings },
];

const WhopLogo = () => (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="text-muted-foreground group-hover/menu-item:text-accent-foreground"
    >
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.62 12.37C16.62 12.58 16.55 12.78 16.41 12.92L13.11 16.22C12.92 16.41 12.66 16.5 12.4 16.5C12.21 16.5 12.02 16.44 11.85 16.33L9.04 14.49C8.78 14.33 8.62 14.04 8.62 13.73V10.27C8.62 9.96 8.78 9.67 9.04 9.51L11.85 7.67C12.02 7.56 12.21 7.5 12.4 7.5C12.66 7.5 12.92 7.59 13.11 7.78L16.41 11.08C16.55 11.22 16.62 11.42 16.62 11.63V12.37ZM8.38 12.37C8.38 12.58 8.31 12.78 8.17 12.92L4.87 16.22C4.68 16.41 4.42 16.5 4.16 16.5C3.97 16.5 3.78 16.44 3.61 16.33L0.8 14.49C0.54 14.33 0.38 14.04 0.38 13.73V10.27C0.38 9.96 0.54 9.67 0.8 9.51L3.61 7.67C3.78 7.56 3.97 7.5 4.16 7.5C4.42 7.5 4.68 7.59 4.87 7.78L8.17 11.08C8.31 11.22 8.38 11.42 8.38 11.63V12.37Z" transform="translate(0 0)" fill="currentColor"/>
    </svg>
);


function ProfileSection() {
    const { isOpen } = useSidebar();
    const { user } = useUser();
    const auth = useAuth();
    const avatarImage = PlaceHolderImages.find(p => p.id === 'avatar-1');
    const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('') : 'U';

    const handleSignOut = () => {
        if (auth) {
            signOut(auth);
        }
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
                                    <AvatarImage src={user.photoURL || avatarImage?.imageUrl} alt={user.displayName || "User Avatar"} data-ai-hint={avatarImage?.imageHint} />
                                    <AvatarFallback>{getInitials(user.displayName || "User")}</AvatarFallback>
                                </Avatar>
                            </Link>
                        </TooltipTrigger>
                        <TooltipContent side="right">
                           <p>{user.displayName || "Anonymous User"}</p>
                           <p className="text-xs text-muted-foreground">{user.email || `UID: ${user.uid.slice(0,6)}...`}</p>
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
                    <AvatarImage src={user.photoURL || avatarImage?.imageUrl} alt={user.displayName || "User Avatar"} data-ai-hint={avatarImage?.imageHint} />
                    <AvatarFallback>{getInitials(user.displayName || "User")}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="text-sm font-semibold leading-none">{user.displayName || "Anonymous User"}</p>
                    <p className="text-xs leading-none text-muted-foreground mt-1">{user.email || `UID: ${user.uid.slice(0,12)}...`}</p>
                </div>
            </div>
            <Button variant="ghost" className="w-full justify-start mt-2" onClick={handleSignOut}>
                <LogOut />
                <span>Log out</span>
            </Button>
        </div>
    )
}

function SidebarInnerContent() {
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
                        {/* Whop Link */}
                         <SidebarMenuItem>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                     <a href="https://whop.com/?a=zm1a" target="_blank" rel="noopener noreferrer" className={cn(
                                         "flex w-full items-center gap-3 rounded-md py-2 text-left text-sm font-medium text-muted-foreground outline-none ring-ring transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 active:bg-accent disabled:pointer-events-none disabled:opacity-50",
                                         isOpen ? "px-3" : "h-10 w-10 justify-center"
                                     )}>
                                        <WhopLogo />
                                        {isOpen && <span>Whop</span>}
                                    </a>
                                </TooltipTrigger>
                                {!isOpen && (
                                    <TooltipContent side="right">
                                        Whop
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
                <ProfileSection />
            </SidebarFooter>
        </>
    );
}

export default function AppSidebar() {
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
            <SidebarInnerContent />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sidebar>
      <SidebarInnerContent />
    </Sidebar>
  );
}

    

    
