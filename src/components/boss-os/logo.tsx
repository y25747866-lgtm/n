
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useSidebar } from '@/contexts/sidebar-provider';

function useSidebarAwareness(showText: boolean | undefined) {
    // If showText is explicitly provided, we don't need the context.
    if (showText !== undefined) {
        return { shouldShowText: showText };
    }
    // Only call the hook if we need to be aware of the sidebar state.
    const { isOpen } = useSidebar();
    return { shouldShowText: isOpen };
}

export function Logo({ className, showText, ...props }: { className?: string; showText?: boolean; [key: string]: any }) {
  const { shouldShowText } = useSidebarAwareness(showText);
  
  return (
    <Link href="/dashboard">
      <div
        className={cn("flex items-center gap-2 text-lg font-bold tracking-tighter", className)}
        {...props}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="36" height="36" role="img" aria-labelledby="title desc">
          <title id="title">Boss OS Neural Circuit Logo</title>
          <desc id="desc">Stylized brain-shaped circuit logo with adaptable colors for light and dark themes.</desc>

          <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))"/>
                <stop offset="50%" stopColor="#7C3AED" />
                <stop offset="100%" stopColor="#3B82F6"/>
              </linearGradient>
          </defs>

          <path fill="none" stroke="url(#grad)" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round"
                d="M160 160 L240 160 Q320 160 320 240 L320 272 M320 272 Q320 352 400 352 L416 352 M320 240 L400 160 M160 240 Q160 320 240 320 L272 320 M160 160 Q160 120 200 120 L240 120 M160 240 L120 200 M272 320 L240 360 M400 352 L440 400 M320 272 L360 312 M240 160 L200 200 M240 120 L272 80 M160 240 L120 280 M240 320 L200 360 M272 320 L312 360 M200 200 L240 240 M360 312 L400 352"/>

          <circle cx="200" cy="120" r="16" fill="url(#grad)"/>
          <circle cx="272" cy="80" r="16" fill="url(#grad)"/>
          <circle cx="120" cy="200" r="16" fill="url(#grad)"/>
          <circle cx="120" cy="280" r="16" fill="url(#grad)"/>
          <circle cx="200" cy="360" r="16" fill="url(#grad)"/>
          <circle cx="312" cy="360" r="16" fill="url(#grad)"/>
          <circle cx="440" cy="400" r="16" fill="url(#grad)"/>
        </svg>
        {shouldShowText && <span className="font-headline font-black text-xl bg-clip-text text-transparent bg-gradient-to-r from-accent-1-start via-accent-1-mid to-accent-1-end">Boss OS</span>}
      </div>
    </Link>
  );
}
