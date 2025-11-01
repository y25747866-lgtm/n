
'use client';

import { Logo } from './logo';
import { ThemeToggle } from './theme-toggle';
import { useSidebar } from '@/contexts/sidebar-provider';
import { Button } from '@/components/ui/button';
import { PanelLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VisuallyHidden } from '@/components/ui/visually-hidden';

export default function Header() {
    const { isNavVisible, toggleSidebar, isDesktop } = useSidebar();

  return (
    <header className={cn("sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md sm:px-6")}>
        <div className="flex items-center gap-4">
            {!isNavVisible && <Logo />}
        </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
      </div>
    </header>
  );
}
