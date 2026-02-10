import { useGetCartSummary, useCreateCheckoutSession, useIsStripeConfigured } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { ShoppingItem } from '../backend';
import { useState } from 'react';
import StripeSetupModal from '../components/StripeSetupModal';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: cartSummary, isLoading } = useGetCartSummary();
  const { data: isStripeConfigured } = useIsStripeConfigured();
  const createCheckoutSession = useCreateCheckoutSession();
  const [showStripeSetup, setShowStripeSetup] = useState(false);

  if (!identity) {
    return (
      <div className="container py-12">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Please log in to checkout</h1>
          <Button onClick={() => navigate({ to: '/' })}>Go to Home</Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-muted rounded" />
          <div className="h-64 bg-muted rounded" />
        </div>
      </div>
    );
  }

  const isEmpty = !cartSummary || cartSummary.items.length === 0;

  if (isEmpty) {
    return (
      <div className="container py-12">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Your cart is empty</h1>
          <Button onClick={() => navigate({ to: '/products' })}>Browse Products</Button>
        </div>
      </div>
    );
  }

  const totalInDollars = Number(cartSummary.totalAmount) / 100;

  const handleCheckout = async () => {
    if (!isStripeConfigured) {
      setShowStripeSetup(true);
      return;
    }

    const items: ShoppingItem[] = cartSummary.items.map((item) => ({
      productName: item.product.name,
      productDescription: item.product.description,
      priceInCents: item.product.price,
      quantity: item.quantity,
      currency: 'usd',
    }));

    const session = await createCheckoutSession.mutateAsync(items);
    window.location.href = session.url;
  };

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {cartSummary.items.map((item) => {
              const priceInDollars = Number(item.product.price) / 100;
              const subtotal = priceInDollars * Number(item.quantity);

              return (
                <div key={item.product.id} className="flex justify-between items-center py-2 border-b last:border-0">
                  <div className="space-y-1">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Quantity: {Number(item.quantity)} × ${priceInDollars.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-semibold">${subtotal.toFixed(2)}</p>
                </div>
              );
            })}
            <div className="flex justify-between items-center pt-4 text-lg font-bold">
              <span>Total</span>
              <span className="text-primary">${totalInDollars.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You will be redirected to Stripe to complete your payment securely.
            </p>
            <Button
              className="w-full"
              size="lg"
              onClick={handleCheckout}
              disabled={createCheckoutSession.isPending}
            >
              {createCheckoutSession.isPending ? 'Processing...' : 'Pay with Stripe'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <StripeSetupModal open={showStripeSetup} onOpenChange={setShowStripeSetup} />
    </div>
  );
}

