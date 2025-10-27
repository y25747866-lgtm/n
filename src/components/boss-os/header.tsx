
'use client';

import { PanelLeft, PanelRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useSidebar } from '@/contexts/sidebar-provider';
import { cn } from '@/lib/utils';
import { Logo } from './logo';

export default function Header() {
  const { toggleSidebar, isOpen, isDesktop, isMobile } = useSidebar();

  return (
    <header className={cn("sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-md sm:px-6", 
       "transition-all duration-300 ease-in-out"
    )}>
        <div className="flex items-center gap-2">
            {/* On mobile, show the logo in the header. It will be hidden if sidebar is open. */}
            {isMobile && 
              <div className={cn(isOpen && "hidden")}>
                  <Logo />
              </div>
            }
            {/* On desktop, hide the logo in the header since it's in the sidebar */}
            {!isMobile && <div className="w-[170px]"/>}
            
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                {isOpen ? <PanelLeft className="h-5 w-5" /> : <PanelRight className="h-5 w-5" />}
                <span className="sr-only">Toggle Sidebar</span>
            </Button>
        </div>
    </header>
  );
}
