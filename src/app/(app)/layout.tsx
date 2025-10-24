import AppSidebar from '@/components/boss-os/app-sidebar';
import Header from '@/components/boss-os/header';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-background">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 p-4 sm:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
