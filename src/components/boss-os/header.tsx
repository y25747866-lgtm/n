
'use client';

import { Logo } from './logo';
import { useSidebar } from '@/contexts/sidebar-provider';
import { Button } from '@/components/ui/button';
import { PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VisuallyHidden } from '@/components/ui/visually-hidden';

export default function Header() {
    const { isNavVisible, toggleSidebar, isClient } = useSidebar();

  if (!isClient) {
    // Render a placeholder or null on the server to avoid hydration mismatch
    return (
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
            <div className="flex items-center gap-4">
               <Logo />
            </div>
            <div className="flex items-center gap-4">
                
            </div>
        </header>
    );
  }

  return (
    <header className={cn("sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md sm:px-6")}>
        <div className="flex items-center gap-4">
            {!isNavVisible && <Logo />}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
            >
              <PanelLeft />
              <VisuallyHidden>Toggle Menu</VisuallyHidden>
            </Button>
        </div>
      <div className="flex items-center gap-4">
      </div>
    </header>
  );
}
