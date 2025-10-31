'use client';

import { Logo } from './logo';
import { ThemeToggle } from './theme-toggle';

export default function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md sm:px-6">
      <Logo />
      <div className="flex items-center gap-4">
        {/* Placeholder for future buttons like "My Library" */}
        <ThemeToggle />
      </div>
    </header>
  );
}
