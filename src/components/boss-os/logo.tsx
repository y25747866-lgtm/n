import { Rocket } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 text-lg font-bold tracking-tighter", className)}>
      <div className="flex items-center justify-center rounded-lg bg-primary p-1.5">
        <Rocket className="h-5 w-5 text-primary-foreground" />
      </div>
      <span className="font-headline">Boss OS</span>
    </div>
  );
}
