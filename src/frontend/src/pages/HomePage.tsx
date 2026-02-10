import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useGetFeaturedProducts } from '../hooks/useQueries';
import ProductCard from '../components/ProductCard';

export default function HomePage() {
  const navigate = useNavigate();
  const { data: featuredProducts, isLoading } = useGetFeaturedProducts();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/5 to-background">
        <div className="container py-20 md:py-32">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm">
                <Sparkles className="mr-2 h-4 w-4 text-primary" />
                <span className="font-medium">Welcome to Synvara</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                Discover Amazing{' '}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Products
                </span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Shop the latest collection of premium products. Secure checkout with Internet Identity and seamless payment processing.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" onClick={() => navigate({ to: '/products' })}>
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate({ to: '/products' })}>
                  Browse Collection
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-2xl border bg-muted shadow-2xl">
                <img
                  src="/assets/generated/hero-banner.dim_1200x400.png"
                  alt="Hero Banner"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-gradient-to-br from-primary to-secondary opacity-20 blur-3xl" />
              <div className="absolute -top-6 -left-6 h-32 w-32 rounded-full bg-gradient-to-br from-secondary to-primary opacity-20 blur-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-20">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg border bg-card">
            <div className="rounded-full bg-primary/10 p-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Secure Payments</h3>
            <p className="text-muted-foreground">
              Shop with confidence using Internet Identity and Stripe payment processing.
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg border bg-card">
            <div className="rounded-full bg-secondary/10 p-4">
              <Zap className="h-8 w-8 text-secondary" />
            </div>
            <h3 className="text-xl font-semibold">Fast Checkout</h3>
            <p className="text-muted-foreground">
              Streamlined checkout process for a seamless shopping experience.
            </p>
          </div>
          <div className="flex flex-col items-center text-center space-y-4 p-6 rounded-lg border bg-card">
            <div className="rounded-full bg-primary/10 p-4">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Premium Quality</h3>
            <p className="text-muted-foreground">
              Curated selection of high-quality products for discerning customers.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="container py-20">
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Featured Products</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Check out our handpicked selection of premium products
              </p>
            </div>
            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-96 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {featuredProducts.slice(0, 4).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
            <div className="text-center">
              <Button variant="outline" size="lg" onClick={() => navigate({ to: '/products' })}>
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Promo Banner Section */}
      <section className="container py-20">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-secondary p-1">
          <div className="rounded-xl bg-background p-8 md:p-12">
            <div className="grid gap-8 lg:grid-cols-2 items-center">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight">Special Offer</h2>
                <p className="text-muted-foreground text-lg">
                  Sign up today and get exclusive access to our latest products and special promotions.
                </p>
                <Button size="lg" onClick={() => navigate({ to: '/products' })}>
                  Shop Now
                </Button>
              </div>
              <div className="aspect-[8/3] overflow-hidden rounded-lg">
                <img
                  src="/assets/generated/promo-banner.dim_800x300.png"
                  alt="Promo Banner"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

