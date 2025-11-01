
'use client';

import { Logo } from './logo';
import { ThemeToggle } from './theme-toggle';
import { useSidebar } from '@/contexts/sidebar-provider';
import { Button } from '@/components/ui/button';
import { PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Header() {
    const { setIsOpen, isDesktop, isNavVisible } = useSidebar();

  return (
    <header className={cn("sticky top-0 z-30 flex h-20 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md sm:px-6", !isNavVisible && "justify-end")}>
        <div className="flex items-center gap-4">
            <Button
                variant="ghost"
                size="icon"
                className={cn(!isDesktop && !isNavVisible && "hidden")}
                onClick={() => setIsOpen(true)}
            >
                <PanelLeft />
                <span className="sr-only">Toggle Menu</span>
            </Button>
            <Logo className={cn(!isDesktop && 'hidden')} />
        </div>
      <div className="flex items-center gap-4">
        {/* Placeholder for future buttons like "My Library" */}
        <ThemeToggle />
      </div>
    </header>
  );
}
