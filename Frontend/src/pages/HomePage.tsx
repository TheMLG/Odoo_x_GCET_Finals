import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Package, Shield, Clock, Truck, Star, CheckCircle, Camera, Drill, Headphones, Speaker, Monitor, Laptop, Projector, Mic, Video, Wrench, HardHat, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProductCard } from '@/components/products/ProductCard';
import { useRentalStore } from '@/stores/rentalStore';
import { useAuthStore } from '@/stores/authStore';
import { RoleBasedRedirect } from '@/components/RoleBasedRedirect';
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import type { Review } from '@/types/rental';

// Floating icons configuration for hero section
const floatingIcons = [
  { Icon: Camera, color: '#3B82F6', top: '15%', left: '8%', rotate: -15, size: 32 },
  { Icon: Drill, color: '#F59E0B', top: '25%', right: '10%', rotate: 20, size: 36 },
  { Icon: Headphones, color: '#8B5CF6', top: '60%', left: '5%', rotate: 12, size: 28 },
  { Icon: Speaker, color: '#10B981', bottom: '20%', right: '8%', rotate: -25, size: 34 },
  { Icon: Monitor, color: '#EC4899', top: '12%', right: '18%', rotate: 8, size: 30 },
  { Icon: Laptop, color: '#06B6D4', bottom: '30%', left: '12%', rotate: -10, size: 32 },
  { Icon: Projector, color: '#F97316', top: '45%', right: '5%', rotate: 15, size: 28 },
  { Icon: Mic, color: '#6366F1', bottom: '15%', left: '18%', rotate: -20, size: 26 },
  { Icon: Video, color: '#EF4444', top: '35%', left: '3%', rotate: 25, size: 30 },
  { Icon: Wrench, color: '#14B8A6', bottom: '35%', right: '15%', rotate: -12, size: 28 },
  { Icon: HardHat, color: '#FBBF24', top: '70%', right: '12%', rotate: 18, size: 32 },
  { Icon: Palette, color: '#A855F7', top: '8%', left: '20%', rotate: -8, size: 26 },
];

const features = [
  {
    icon: Package,
    title: 'Wide Selection',
    description: 'Browse thousands of professional equipment from cameras to construction tools.',
  },
  {
    icon: Shield,
    title: 'Fully Insured',
    description: 'All rentals include comprehensive insurance coverage for peace of mind.',
  },
  {
    icon: Clock,
    title: 'Flexible Duration',
    description: 'Rent hourly, daily, or weekly. Choose what works best for your project.',
  },
  {
    icon: Truck,
    title: 'Easy Pickup & Return',
    description: 'Convenient pickup locations and hassle-free return process.',
  },
];

const stats = [
  { value: '10K+', label: 'Products' },
  { value: '50K+', label: 'Happy Customers' },
  { value: '99%', label: 'On-time Delivery' },
  { value: '24/7', label: 'Support' },
];

export default function HomePage() {
  const { products, fetchProducts } = useRentalStore();
  const { isAuthenticated } = useAuthStore();
  const [topReviews, setTopReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const featuredProducts = products.filter((p) => p.isPublished).slice(0, 4);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Fetch top reviews on mount
  useEffect(() => {
    const fetchTopReviews = async () => {
      try {
        setLoadingReviews(true);
        const response = await api.get('/reviews/top');
        setTopReviews(response.data.data);
      } catch (error) {
        console.error('Error fetching top reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchTopReviews();
  }, []);

  return (
    <RoleBasedRedirect>
      <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background py-24 md:py-32">
        {/* Floating Colorful Icons with Improved Animation */}
        {floatingIcons.map((item, index) => (
          <motion.div
            key={index}
            className="absolute hidden md:block"
            style={{
              top: item.top,
              left: item.left,
              right: item.right,
              bottom: item.bottom,
            }}
            initial={{ opacity: 0, scale: 0, rotate: item.rotate }}
            animate={{ 
              opacity: [0.4, 0.7, 0.4], 
              scale: [0.9, 1, 0.9],
              y: [0, -20, 0],
              rotate: [item.rotate, item.rotate + 10, item.rotate],
            }}
            transition={{ 
              duration: 0.8, 
              delay: index * 0.08,
              opacity: {
                duration: 4 + index * 0.3,
                repeat: Infinity,
                ease: "easeInOut",
              },
              scale: {
                duration: 4 + index * 0.3,
                repeat: Infinity,
                ease: "easeInOut",
              },
              y: {
                duration: 3 + index * 0.4,
                repeat: Infinity,
                ease: "easeInOut",
              },
              rotate: {
                duration: 5 + index * 0.5,
                repeat: Infinity,
                ease: "easeInOut",
              }
            }}
          >
            <motion.div 
              className="rounded-2xl bg-white p-3 shadow-xl"
              whileHover={{ scale: 1.2, rotate: 0 }}
              transition={{ duration: 0.3 }}
            >
              <item.Icon 
                size={item.size} 
                style={{ color: item.color }}
                strokeWidth={2}
              />
            </motion.div>
          </motion.div>
        ))}
        
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="mx-auto max-w-4xl text-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-5 py-2.5 text-sm font-semibold text-primary"
            >
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Star className="h-4 w-4 fill-primary" />
              </motion.div>
              Trusted by 50,000+ businesses
            </motion.div>
            
            <motion.h1 
              className="mb-6 text-5xl font-bold leading-tight tracking-tight text-foreground md:text-7xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              Rental{' '}
              <motion.span 
                className="text-primary"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                Products
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="mb-10 text-base leading-relaxed text-muted-foreground md:text-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
            >
              Browse our extensive collection of professional equipment available for rent. High quality, fully insured, and ready for your project.
            </motion.p>
            
            <motion.div 
              className="flex flex-col items-center justify-center gap-4 sm:flex-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" asChild className="rounded-lg px-8 text-base font-semibold shadow-lg transition-all hover:shadow-xl">
                  <Link to="/products">
                    Browse Products
                    <motion.div
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </motion.div>
                  </Link>
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button size="lg" variant="outline" asChild className="rounded-lg border-2 px-8 text-base font-semibold transition-all hover:bg-primary/5">
                  <Link to="/signup">Get Started Free</Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border/50 bg-card py-16">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  delay: index * 0.15, 
                  duration: 0.6,
                  ease: "easeOut"
                }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ 
                  scale: 1.08, 
                  transition: { duration: 0.3 } 
                }}
                className="text-center"
              >
                <motion.p 
                  className="text-4xl font-bold text-primary md:text-5xl"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: index * 0.15 + 0.3, duration: 0.5, type: "spring" }}
                  viewport={{ once: true }}
                >
                  {stat.value}
                </motion.p>
                <motion.p 
                  className="mt-2 text-sm font-medium text-muted-foreground"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: index * 0.15 + 0.5 }}
                  viewport={{ once: true }}
                >
                  {stat.label}
                </motion.p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-background">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-16 text-center"
          >
            <motion.h2 
              className="mb-4 text-4xl font-bold text-foreground md:text-5xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Why Choose RentX?
            </motion.h2>
            <motion.p 
              className="mx-auto max-w-2xl text-base text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
            >
              We make equipment rental simple, reliable, and affordable for businesses of all sizes.
            </motion.p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: index * 0.12, 
                  duration: 0.6,
                  ease: "easeOut"
                }}
                viewport={{ once: true, margin: "-50px" }}
                whileHover={{ 
                  y: -8,
                  transition: { duration: 0.3 }
                }}
              >
                <Card className="group h-full rounded-2xl border-2 border-border/50 bg-card shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-xl">
                  <CardContent className="p-6">
                    <motion.div 
                      className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10"
                      whileHover={{ 
                        scale: 1.1, 
                        rotate: 5,
                        transition: { duration: 0.3 }
                      }}
                    >
                      <feature.icon className="h-7 w-7 text-primary transition-transform group-hover:scale-110" />
                    </motion.div>
                    <h3 className="mb-3 text-xl font-bold text-foreground">{feature.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="bg-muted/30 py-24">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-16 flex flex-col items-center justify-between gap-6 md:flex-row md:items-end"
          >
            <div>
              <motion.h2 
                className="mb-4 text-4xl font-bold text-foreground md:text-5xl"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                Featured Products
              </motion.h2>
              <motion.p 
                className="text-base text-muted-foreground"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                viewport={{ once: true }}
              >
                Popular equipment ready for your next project
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05 }}
            >
              <Button variant="ghost" asChild className="hidden font-semibold md:inline-flex">
                <Link to="/products">
                  View All Products
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </motion.div>
                </Link>
              </Button>
            </motion.div>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product, index) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 40, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  delay: index * 0.1, 
                  duration: 0.6,
                  ease: "easeOut"
                }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <ProductCard product={product} index={index} />
              </motion.div>
            ))}
          </div>

          <motion.div 
            className="mt-10 text-center md:hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            viewport={{ once: true }}
          >
            <Button asChild className="rounded-lg font-semibold">
              <Link to="/products">
                View All Products
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-background">
        <div className="container px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-16 text-center"
          >
            <motion.h2 
              className="mb-4 text-4xl font-bold text-foreground md:text-5xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              What Our Customers Say
            </motion.h2>
            <motion.p 
              className="mx-auto max-w-2xl text-base text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
            >
              Join thousands of satisfied businesses who trust RentX
            </motion.p>
          </motion.div>

          {loadingReviews ? (
            <div className="grid gap-6 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="h-full rounded-2xl border-2">
                  <CardContent className="p-8">
                    <div className="mb-4 h-4 w-24 animate-pulse rounded bg-muted" />
                    <div className="mb-4 space-y-2">
                      <div className="h-3 w-full animate-pulse rounded bg-muted" />
                      <div className="h-3 w-5/6 animate-pulse rounded bg-muted" />
                    </div>
                    <div className="space-y-1">
                      <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                      <div className="h-3 w-24 animate-pulse rounded bg-muted" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : topReviews.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3">
              {topReviews.map((review, index) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 40, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ 
                    delay: index * 0.15, 
                    duration: 0.6,
                    ease: "easeOut"
                  }}
                  viewport={{ once: true, margin: "-50px" }}
                  whileHover={{ 
                    y: -8,
                    transition: { duration: 0.3 }
                  }}
                >
                  <Card className="group h-full rounded-2xl border-2 border-border/50 bg-card shadow-sm transition-all duration-300 hover:border-primary/20 hover:shadow-xl">
                    <CardContent className="p-8">
                      <motion.div 
                        className="mb-5 flex gap-1"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.15 + 0.3 }}
                        viewport={{ once: true }}
                      >
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <motion.div
                            key={i}
                            initial={{ scale: 0, rotate: -180 }}
                            whileInView={{ scale: 1, rotate: 0 }}
                            transition={{ 
                              delay: index * 0.15 + 0.4 + i * 0.1,
                              type: "spring",
                              stiffness: 200
                            }}
                            viewport={{ once: true }}
                          >
                            <Star className="h-5 w-5 fill-warning text-warning" />
                          </motion.div>
                        ))}
                      </motion.div>
                      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                        {review.comment || 'Great product and excellent service!'}
                      </p>
                      <div>
                        <p className="font-bold text-foreground">
                          {review.user.firstName} {review.user.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">{review.product.category}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              className="text-center text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p>No reviews available yet. Be the first to review our products!</p>
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA */}
      {!isAuthenticated && (
        <section className="bg-primary py-24">
          <div className="container px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true, margin: "-100px" }}
              className="mx-auto max-w-4xl text-center"
            >
              <motion.h2 
                className="mb-6 text-4xl font-bold text-primary-foreground md:text-5xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                viewport={{ once: true }}
              >
                Ready to Get Started?
              </motion.h2>
              <motion.p 
                className="mb-10 text-base leading-relaxed text-primary-foreground/90 md:text-lg"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                viewport={{ once: true }}
              >
                Sign up today and get access to thousands of rental products with flexible pricing.
              </motion.p>
              <motion.div 
                className="flex flex-col items-center justify-center gap-4 sm:flex-row"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="lg" variant="secondary" asChild className="rounded-lg px-8 text-base font-semibold shadow-xl transition-all hover:shadow-2xl">
                    <Link to="/signup">
                      <CheckCircle className="mr-2 h-5 w-5" />
                      Create Free Account
                    </Link>
                  </Button>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="rounded-lg border-2 border-primary-foreground/20 bg-transparent px-8 text-base font-semibold text-primary-foreground transition-all hover:bg-primary-foreground/10 hover:border-primary-foreground/40"
                  >
                    <Link to="/contact">Contact Sales</Link>
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      )}
    </MainLayout>
    </RoleBasedRedirect>
  );
}
