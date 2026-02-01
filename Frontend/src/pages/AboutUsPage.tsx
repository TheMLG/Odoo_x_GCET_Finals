import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Users, Award, Heart, ShieldCheck, TrendingUp } from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const values = [
  {
    icon: ShieldCheck,
    title: 'Trust & Security',
    description: 'We ensure every rental is secure, insured, and meets the highest quality standards.',
  },
  {
    icon: Users,
    title: 'Customer First',
    description: 'Your satisfaction is our priority. We provide 24/7 support and seamless experiences.',
  },
  {
    icon: TrendingUp,
    title: 'Innovation',
    description: 'Constantly evolving our platform to bring you the best rental technology and services.',
  },
  {
    icon: Heart,
    title: 'Sustainability',
    description: 'Promoting a sharing economy that reduces waste and supports environmental responsibility.',
  },
];

const team = [
  {
    name: 'Manthan Goswami',
    role: 'CEO & Founder',
    description: 'Visionary leader with 15+ years in tech and e-commerce.',
  },
  {
    name: 'Meet Bhuva',
    role: 'CTO',
    description: 'Technology expert passionate about building scalable platforms.',
  },
  {
    name: 'Ronit Dhimmar',
    role: 'Head of Operations',
    description: 'Ensures smooth operations and exceptional customer experiences.',
  },
];

const stats = [
  { value: '50,000+', label: 'Happy Customers' },
  { value: '10,000+', label: 'Products Available' },
  { value: '500+', label: 'Trusted Vendors' },
  { value: '99%', label: 'Satisfaction Rate' },
];

const AboutUsPage = () => {
  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative bg-background py-24 md:py-32">
          <div className="container mx-auto px-4">
            <motion.div
              className="mx-auto max-w-4xl text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <motion.h1 
                className="mb-6 text-5xl font-bold leading-tight tracking-tight text-foreground sm:text-6xl md:text-7xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                About <motion.span 
                  className="text-primary"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >RentX</motion.span>
              </motion.h1>
              <motion.p 
                className="text-base leading-relaxed text-muted-foreground sm:text-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                Revolutionizing the way people and businesses access equipment through a trusted, innovative rental platform.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7 }}
                whileHover={{ y: -8 }}
              >
                <Card className="h-full rounded-2xl border-2 border-border/50 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-xl">
                  <CardContent className="p-8">
                    <motion.div 
                      className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Target className="h-8 w-8 text-primary" />
                    </motion.div>
                    <h2 className="mb-4 text-3xl font-bold text-foreground">Our Mission</h2>
                    <p className="text-base leading-relaxed text-muted-foreground">
                      To democratize access to high-quality equipment by connecting individuals and businesses 
                      with trusted vendors, making rentals simple, affordable, and sustainable. We believe 
                      in the power of sharing and aim to reduce waste while empowering our community.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7 }}
                whileHover={{ y: -8 }}
              >
                <Card className="h-full rounded-2xl border-2 border-border/50 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-xl">
                  <CardContent className="p-8">
                    <motion.div 
                      className="mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Award className="h-8 w-8 text-primary" />
                    </motion.div>
                    <h2 className="mb-4 text-3xl font-bold text-foreground">Our Vision</h2>
                    <p className="text-base leading-relaxed text-muted-foreground">
                      To become the world's most trusted equipment rental marketplace, where anyone can 
                      access the tools they need, when they need them. We envision a future where 
                      ownership is optional, and access is universal, creating a more sustainable economy.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-y border-border/50 bg-card py-20">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30, scale: 0.8 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ 
                    delay: index * 0.15, 
                    duration: 0.6,
                    ease: "easeOut"
                  }}
                  whileHover={{ 
                    scale: 1.08, 
                    transition: { duration: 0.3 } 
                  }}
                  className="text-center"
                >
                  <motion.div 
                    className="mb-3 text-5xl font-bold text-primary"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ delay: index * 0.15 + 0.3, duration: 0.5, type: "spring" }}
                    viewport={{ once: true }}
                  >
                    {stat.value}
                  </motion.div>
                  <motion.div 
                    className="text-sm font-medium text-muted-foreground"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: index * 0.15 + 0.5 }}
                    viewport={{ once: true }}
                  >
                    {stat.label}
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <motion.div
              className="mb-16 text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
            >
              <motion.h2 
                className="mb-4 text-4xl font-bold text-foreground md:text-5xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                Our Core Values
              </motion.h2>
              <motion.p 
                className="mx-auto max-w-2xl text-base text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                These principles guide everything we do and shape our commitment to our customers and partners.
              </motion.p>
            </motion.div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: index * 0.12, ease: "easeOut" }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                >
                  <Card className="group h-full rounded-2xl border-2 border-border/50 bg-card shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-xl">
                    <CardContent className="p-6">
                      <motion.div 
                        className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10"
                        whileHover={{ scale: 1.1, rotate: 5, transition: { duration: 0.3 } }}
                      >
                        <value.icon className="h-7 w-7 text-primary transition-transform group-hover:scale-110" />
                      </motion.div>
                      <h3 className="mb-3 text-xl font-bold text-foreground">{value.title}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="bg-muted/30 py-24">
          <div className="container mx-auto px-4">
            <motion.div
              className="mb-16 text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7 }}
            >
              <motion.h2 
                className="mb-4 text-4xl font-bold text-foreground md:text-5xl"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                Meet Our Team
              </motion.h2>
              <motion.p 
                className="mx-auto max-w-2xl text-base text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                Dedicated professionals working together to make equipment rental seamless and accessible.
              </motion.p>
            </motion.div>

            <div className="flex justify-center gap-8 mx-auto max-w-6xl">
              {team.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: index * 0.15, ease: "easeOut" }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="flex-1 max-w-xs"
                >
                  <Card className="h-full rounded-2xl border-2 border-border/50 bg-card text-center shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-xl">
                    <CardContent className="p-8">
                      <motion.div 
                        className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Users className="h-12 w-12 text-primary" />
                      </motion.div>
                      <h3 className="mb-2 text-xl font-bold text-foreground">{member.name}</h3>
                      <p className="mb-4 text-sm font-semibold text-primary">{member.role}</p>
                      <p className="text-sm leading-relaxed text-muted-foreground">{member.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              className="mx-auto max-w-4xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="mb-6 text-center text-3xl font-bold">Our Story</h2>
              <div className="space-y-4 text-muted-foreground">
                <p>
                  RentX was born from a simple observation: too many valuable tools and equipment sit 
                  idle while others struggle to afford or access them. Founded in 2020, we set out to 
                  bridge this gap and create a marketplace that benefits everyone.
                </p>
                <p>
                  What started as a small platform connecting local equipment owners has grown into a 
                  thriving community of thousands of vendors and customers across the country. We've 
                  facilitated over 100,000 rentals, helping businesses save costs, individuals complete 
                  projects, and vendors maximize the value of their assets.
                </p>
                <p>
                  Today, we continue to innovate and expand, adding new categories, improving our 
                  technology, and building stronger relationships with our community. Our commitment 
                  remains the same: making equipment rental simple, safe, and sustainable for everyone.
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default AboutUsPage;
