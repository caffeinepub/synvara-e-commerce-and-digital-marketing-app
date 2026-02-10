import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';

export default function PaymentFailurePage() {
  const navigate = useNavigate();

  return (
    <div className="container py-12">
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-6">
            <XCircle className="h-16 w-16 text-destructive" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Payment Failed</h1>
          <p className="text-muted-foreground">
            Your payment was not processed. Please try again or contact support if the problem persists.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button onClick={() => navigate({ to: '/checkout' })}>Try Again</Button>
          <Button variant="outline" onClick={() => navigate({ to: '/cart' })}>
            Return to Cart
          </Button>
        </div>
      </div>
    </div>
  );
}

