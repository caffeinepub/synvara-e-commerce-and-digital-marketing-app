import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  useGetProducts,
  useAddProduct,
  useUpdateProduct,
  useDeleteProduct,
  useSetFeaturedProduct,
  useIsStripeConfigured,
} from '../hooks/useQueries';
import { ExternalBlob, Product } from '../backend';
import { Pencil, Trash2, Plus, Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import StripeSetupModal from '../components/StripeSetupModal';
import { toast } from 'sonner';

export default function AdminPage() {
  const { data: products, isLoading } = useGetProducts();
  const { data: isStripeConfigured } = useIsStripeConfigured();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const setFeaturedProduct = useSetFeaturedProduct();

  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showStripeSetup, setShowStripeSetup] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: (Number(product.price) / 100).toString(),
        description: product.description,
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', price: '', description: '' });
      setImageFiles([]);
    }
    setShowProductDialog(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImageFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadProgress(0);

    try {
      const priceInCents = BigInt(Math.round(parseFloat(formData.price) * 100));
      let imageRefs: ExternalBlob[] = [];

      if (imageFiles.length > 0) {
        const uploadPromises = imageFiles.map(async (file) => {
          const arrayBuffer = await file.arrayBuffer();
          const uint8Array = new Uint8Array(arrayBuffer);
          return ExternalBlob.fromBytes(uint8Array).withUploadProgress((percentage) => {
            setUploadProgress(percentage);
          });
        });
        imageRefs = await Promise.all(uploadPromises);
      } else if (editingProduct) {
        imageRefs = editingProduct.imageRefs;
      }

      if (editingProduct) {
        await updateProduct.mutateAsync({
          productId: editingProduct.id,
          name: formData.name,
          price: priceInCents,
          description: formData.description,
          imageRefs,
        });
      } else {
        await addProduct.mutateAsync({
          name: formData.name,
          price: priceInCents,
          description: formData.description,
          imageRefs,
        });
      }

      setShowProductDialog(false);
      setFormData({ name: '', price: '', description: '' });
      setImageFiles([]);
      setUploadProgress(0);
    } catch (error: any) {
      toast.error(`Failed to save product: ${error.message}`);
    }
  };

  const handleDelete = async (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProduct.mutateAsync(productId);
    }
  };

  const handleToggleFeatured = async (productId: string, isFeatured: boolean) => {
    await setFeaturedProduct.mutateAsync({ productId, isFeatured });
  };

  return (
    <div className="container py-12">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your products and store settings</p>
          </div>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Products</h2>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Product
              </Button>
            </div>

            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-64 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => {
                  const imageUrl = product.imageRefs[0]?.getDirectURL() || '/assets/generated/product-placeholder.dim_400x400.png';
                  const priceInDollars = Number(product.price) / 100;

                  return (
                    <Card key={product.id}>
                      <CardContent className="p-4 space-y-4">
                        <div className="aspect-square overflow-hidden rounded-lg bg-muted">
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="space-y-2">
                          <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {product.description}
                          </p>
                          <p className="text-lg font-bold text-primary">
                            ${priceInDollars.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={product.isFeatured}
                              onCheckedChange={(checked) =>
                                handleToggleFeatured(product.id, checked)
                              }
                            />
                            <Label className="text-sm">Featured</Label>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleOpenDialog(product)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleDelete(product.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No products yet. Add your first product to get started.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Stripe Configuration</CardTitle>
                <CardDescription>
                  Configure Stripe payment processing for your store
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">
                        Status: {isStripeConfigured ? 'Configured' : 'Not Configured'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {isStripeConfigured
                          ? 'Stripe is ready to process payments'
                          : 'Configure Stripe to enable payments'}
                      </p>
                    </div>
                    <Button onClick={() => setShowStripeSetup(true)}>
                      {isStripeConfigured ? 'Update Configuration' : 'Configure Stripe'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update product details' : 'Create a new product for your store'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price (USD)</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="0.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter product description"
                rows={4}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="images">Product Images</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="flex-1"
                />
                <Upload className="h-5 w-5 text-muted-foreground" />
              </div>
              {imageFiles.length > 0 && (
                <p className="text-sm text-muted-foreground">
                  {imageFiles.length} file(s) selected
                </p>
              )}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="space-y-1">
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Uploading: {uploadProgress}%
                  </p>
                </div>
              )}
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={addProduct.isPending || updateProduct.isPending}
              >
                {addProduct.isPending || updateProduct.isPending
                  ? 'Saving...'
                  : editingProduct
                  ? 'Update Product'
                  : 'Add Product'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowProductDialog(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <StripeSetupModal open={showStripeSetup} onOpenChange={setShowStripeSetup} />
    </div>
  );
}

