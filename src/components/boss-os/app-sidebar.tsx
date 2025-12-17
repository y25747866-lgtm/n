
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
      viewBox="0 0 20 20"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 20C4.477 20 0 15.523 0 10S4.477 0 10 0s10 4.477 10 10-4.477 10-10 10ZM7.625 5a.625.625 0 0 0-.625.625v2.736a.626.626 0 0 0 .625.625h2.134l-2.07 4.14a.625.625 0 0 0 .045.698l.006.006a.625.625 0 0 0 .89.045l.005-.005 3.75-3.75a.625.625 0 0 0 .17-.41v-2.736a.625.625 0 0 0-.624-.625H9.625V5.625a.625.625 0 0 0-1.25 0v1.25H7.625V5.625a.625.625 0 0 0-.625-.625h-1.25a.625.625 0 0 0 0 1.25h.625V8.361h-.625a.625.625 0 0 0 0 1.25h1.375l2.07 4.14a.625.625 0 0 0-.045.698l-.006.006a.625.625 0 0 0-.89.045l-.005-.005-3.75-3.75a.625.625 0 0 0-.17-.41V8.36a.625.625 0 0 0-.625-.625H5a.625.625 0 1 0 0-1.25h1.25v-.625a.625.625 0 0 0-.625-.625H5a.625.625 0 0 0 0 1.25h.625v.625H5a.625.625 0 0 0 0 1.25h.625v.711h-.625a.625.625 0 1 0 0 1.25h.625v.625a.625.625 0 1 0 0 1.25h.625v-1.389h-.625a.625.625 0 1 0 0-1.25h.625v-.711h-.625a.625.625 0 1 0 0-1.25h-1.25v-.625h.625a.625.625 0 0 0 .625-.625H7.5V5.625a.625.625 0 0 0 0-1.25h.125ZM15 5a.625.625 0 0 0 0 1.25h-.625v.625h.625a.625.625 0 1 0 0 1.25h-.625v.711h.625a.625.625 0 1 0 0 1.25h-.625v.625a.625.625 0 1 0 0 1.25h.625v-1.389h-.625a.625.625 0 1 0 0-1.25h.625v-.711h-.625a.625.625 0 1 0 0-1.25h.625v-.625h-.625a.625.625 0 0 0-.625.625v2.735a.625.625 0 0 0 .625.625h.754l-2.07 4.14a.625.625 0 0 0 .045.698l.006.006a.625.625 0 0 0 .89.045l.005-.005 3.75-3.75a.625.625 0 0 0 .17-.41V5.625a.625.625 0 0 0-.625-.625H15Z"
      />
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

    

    