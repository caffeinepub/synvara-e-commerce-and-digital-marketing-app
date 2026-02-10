import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';
import { useClearCart } from '../hooks/useQueries';

export default function PaymentSuccessPage() {
  const navigate = useNavigate();
  const clearCart = useClearCart();

  useEffect(() => {
    clearCart.mutate();
  }, []);

  return (
    <div className="container py-12">
      <div className="max-w-md mx-auto text-center space-y-6">
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 dark:bg-green-900/20 p-6">
            <CheckCircle className="h-16 w-16 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Payment Successful!</h1>
          <p className="text-muted-foreground">
            Thank you for your purchase. Your order has been confirmed.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <Button onClick={() => navigate({ to: '/products' })}>Continue Shopping</Button>
          <Button variant="outline" onClick={() => navigate({ to: '/' })}>
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  );
}

