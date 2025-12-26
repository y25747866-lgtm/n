import { AuthCard } from "@/components/boss-os/auth-card";
import { MailCheck } from "lucide-react";

export default function CheckEmailPage() {
  return (
    <AuthCard
      title="Check Your Email"
      description="We've sent a verification link to your email address. Please click the link to continue."
      footerContent={
        <div className="text-center text-muted-foreground">
            <p>Didn't receive an email? Check your spam folder.</p>
        </div>
      }
    >
        <div className="flex justify-center items-center p-8">
            <MailCheck className="h-24 w-24 text-primary animate-pulse" />
        </div>
    </AuthCard>
  );
}
