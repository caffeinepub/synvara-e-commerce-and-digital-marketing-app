import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetProduct, useAddToCart } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, ArrowLeft, Star } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

export default function ProductDetailPage() {
  const { productId } = useParams({ from: '/products/$productId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: product, isLoading } = useGetProduct(productId);
  const addToCart = useAddToCart();

  const handleAddToCart = async () => {
    if (!identity) {
      navigate({ to: '/' });
      return;
    }
    await addToCart.mutateAsync({ productId, quantity: BigInt(1) });
  };

  if (isLoading) {
    return (
      <div className="container py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-8 w-32 bg-muted rounded" />
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="aspect-square bg-muted rounded-lg" />
            <div className="space-y-4">
              <div className="h-10 bg-muted rounded w-3/4" />
              <div className="h-6 bg-muted rounded w-1/4" />
              <div className="h-24 bg-muted rounded" />
              <div className="h-12 bg-muted rounded w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container py-12">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Product not found</h1>
          <Button onClick={() => navigate({ to: '/products' })}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </div>
      </div>
    );
  }

  const priceInDollars = Number(product.price) / 100;
  const images = product.imageRefs.length > 0
    ? product.imageRefs.map((ref) => ref.getDirectURL())
    : ['/assets/generated/product-placeholder.dim_400x400.png'];

  return (
    <div className="container py-12">
      <Button
        variant="ghost"
        onClick={() => navigate({ to: '/products' })}
        className="mb-8"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Button>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          {images.length === 1 ? (
            <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
              <img
                src={images[0]}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <Carousel className="w-full">
              <CarouselContent>
                {images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
                      <img
                        src={image}
                        alt={`${product.name} - Image ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          )}
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">{product.name}</h1>
              {product.isFeatured && (
                <Badge variant="secondary">
                  <Star className="mr-1 h-3 w-3 fill-current" />
                  Featured
                </Badge>
              )}
            </div>
            <p className="text-3xl font-bold text-primary">${priceInDollars.toFixed(2)}</p>
          </div>

          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground">{product.description}</p>
          </div>

          <div className="space-y-4 pt-4">
            <Button
              size="lg"
              className="w-full"
              onClick={handleAddToCart}
              disabled={addToCart.isPending || !identity}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              {addToCart.isPending ? 'Adding to Cart...' : 'Add to Cart'}
            </Button>
            {!identity && (
              <p className="text-sm text-muted-foreground text-center">
                Please log in to add items to your cart
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

