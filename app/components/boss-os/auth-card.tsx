import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/boss-os/logo";
import { cn } from "@/lib/utils";

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
  footerContent: React.ReactNode;
  className?: string;
}

export function AuthCard({ title, description, children, footerContent, className }: AuthCardProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
            <Logo showText={true} />
        </div>
        <Card className={cn("w-full", className)}>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            {children}
          </CardContent>
          <CardFooter className="flex flex-col items-center justify-center text-sm">
            {footerContent}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
