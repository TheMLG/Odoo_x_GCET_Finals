import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, Star, Package, Shield, Clock, Share2, Heart } from 'lucide-react';
import { MainLayout } from '@/components/layout/MainLayout';
import { RentalConfigurator } from '@/components/products/RentalConfigurator';
import { ReviewSection } from '@/components/products/ReviewSection';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRentalStore } from '@/stores/rentalStore';
import { useWishlistStore } from '@/stores/wishlistStore';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { products, fetchProducts, isLoadingProducts } = useRentalStore();
  const { addItem, removeItem, isInWishlist } = useWishlistStore();

  const product = products.find((p) => p.id === id);

  useEffect(() => {
    if (!product && products.length === 0) {
      fetchProducts();
    }
  }, [product, products, fetchProducts]);

  const inWishlist = product ? isInWishlist(product.id) : false;

  const { isAuthenticated } = useAuthStore();

  const handleWishlistToggle = async () => {
    if (!product) return;

    if (!isAuthenticated) {
      toast.info('Please login to use wishlist', {
        action: {
          label: 'Login',
          onClick: () => navigate('/login')
        }
      });
      return;
    }

    if (inWishlist) {
      await removeItem(product.id);
      toast.success("Removed from wishlist");
    } else {
      await addItem(product);
      toast.success("Added to wishlist");
    }
  };

  if (isLoadingProducts) {
    return (
      <MainLayout>
        <div className="container flex min-h-[50vh] flex-col items-center justify-center px-4 py-12">
          <p>Loading...</p>
        </div>
      </MainLayout>
    );
  }

  if (!product) {
    return (
      <MainLayout>
        <div className="container flex min-h-[50vh] flex-col items-center justify-center px-4 py-12">
          <h1 className="mb-4 text-2xl font-bold">Product Not Found</h1>
          <p className="mb-6 text-muted-foreground">
            The product you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate("/products")} className="rounded-xl">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container px-4 py-8 md:px-6 md:py-12">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="gap-2 rounded-xl"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-[1fr_500px]">
          {/* Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="flex gap-4"
          >
            {/* Image Thumbnails */}
            <div className="flex flex-col gap-4">
              {product.images.slice(0, 5).map((img, idx) => (
                <div
                  key={idx}
                  className="h-20 w-20 cursor-pointer overflow-hidden rounded-xl border-2 border-border bg-muted transition-colors hover:border-primary"
                >
                  <img
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    className="h-full w-full object-cover"
                  />
                </div>
              ))}
            </div>

            {/* Main Image */}
            <div className="relative flex-1">
              <div className="absolute right-4 top-4 z-10 flex gap-2">
                <button
                  onClick={handleWishlistToggle}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full shadow-lg transition-all hover:scale-110",
                    inWishlist ?
                      "bg-pink-500 text-white hover:bg-pink-600"
                      : "bg-white hover:bg-gray-50",
                  )}
                >
                  <Heart
                    className={cn("h-5 w-5", inWishlist && "fill-current")}
                  />
                </button>
                <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg hover:bg-gray-50">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
              <div className="overflow-hidden rounded-2xl bg-muted">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
              <div className="mt-2 text-center text-sm text-muted-foreground">
                1 of {product.images.length} Images
              </div>
            </div>
          </motion.div>

          {/* Rental Configurator */}
          <div>
            <RentalConfigurator product={product} />
          </div>
        </div>

        {/* Product Details Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12"
        >
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="mb-6 w-full justify-start rounded-xl bg-muted/50 p-1">
              <TabsTrigger value="description" className="rounded-lg">
                Description
              </TabsTrigger>
              <TabsTrigger value="specifications" className="rounded-lg">
                Specifications
              </TabsTrigger>
              <TabsTrigger value="reviews" className="rounded-lg">
                Reviews
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="space-y-4">
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="mb-4 text-lg font-semibold">
                  About This Product
                </h3>
                <p className="text-muted-foreground">{product.description}</p>

                <div className="mt-6">
                  <h4 className="mb-3 font-medium">What's Included:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-success" />
                      Main equipment unit
                    </li>
                    <li className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-success" />
                      Carrying case/bag
                    </li>
                    <li className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-success" />
                      Charger and cables
                    </li>
                    <li className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-success" />
                      User manual
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="specifications">
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="mb-4 text-lg font-semibold">
                  Product Specifications
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  {product.attributes && Object.entries(product.attributes).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b border-border pb-2">
                      <span className="text-muted-foreground capitalize">{key}</span>
                      <span className="font-medium">{value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">Category</span>
                    <Badge variant="secondary">{product.category}</Badge>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2">
                    <span className="text-muted-foreground">
                      Available Units
                    </span>
                    <span className="font-medium">
                      {product.quantityOnHand}
                    </span>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <ReviewSection productId={product.id} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </div >
    </MainLayout >
  );
}
