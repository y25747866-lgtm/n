
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function ErrorDisplay({ message }: { message: string }) {
  return (
    <Alert variant="destructive" className="glass-card">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Notice</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

    