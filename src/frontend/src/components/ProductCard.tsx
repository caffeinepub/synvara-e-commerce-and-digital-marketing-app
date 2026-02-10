import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star } from 'lucide-react';
import { Product } from '../backend';
import { useNavigate } from '@tanstack/react-router';
import { useAddToCart } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const addToCart = useAddToCart();

  const imageUrl = product.imageRefs[0]?.getDirectURL() || '/assets/generated/product-placeholder.dim_400x400.png';
  const priceInDollars = Number(product.price) / 100;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!identity) {
      navigate({ to: '/' });
      return;
    }
    await addToCart.mutateAsync({ productId: product.id, quantity: BigInt(1) });
  };

  return (
    <Card
      className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg"
      onClick={() => navigate({ to: '/products/$productId', params: { productId: product.id } })}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        {product.isFeatured && (
          <Badge className="absolute top-2 right-2 bg-secondary">
            <Star className="mr-1 h-3 w-3 fill-current" />
            Featured
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
        <p className="text-xl font-bold text-primary mt-2">${priceInDollars.toFixed(2)}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          className="w-full"
          onClick={handleAddToCart}
          disabled={addToCart.isPending || !identity}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          {addToCart.isPending ? 'Adding...' : 'Add to Cart'}
        </Button>
      </CardFooter>
    </Card>
  );
}

