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
        <section className="relative bg-primary/5 py-20">
          <div className="container mx-auto px-4">
            <motion.div
              className="mx-auto max-w-4xl text-center"
              {...fadeIn}
            >
              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                About <span className="text-primary">RentX</span>
              </h1>
              <p className="text-lg text-muted-foreground sm:text-xl">
                Revolutionizing the way people and businesses access equipment through a trusted, innovative rental platform.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 md:grid-cols-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Card className="h-full border-primary/20">
                  <CardContent className="p-8">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="mb-4 text-2xl font-bold">Our Mission</h2>
                    <p className="text-muted-foreground">
                      To democratize access to high-quality equipment by connecting individuals and businesses 
                      with trusted vendors, making rentals simple, affordable, and sustainable. We believe 
                      in the power of sharing and aim to reduce waste while empowering our community.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <Card className="h-full border-primary/20">
                  <CardContent className="p-8">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Award className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="mb-4 text-2xl font-bold">Our Vision</h2>
                    <p className="text-muted-foreground">
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
        <section className="bg-primary/5 py-16">
          <div className="container mx-auto px-4">
            <motion.div
              className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="mb-2 text-4xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <motion.div
              className="mb-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="mb-4 text-3xl font-bold">Our Core Values</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                These principles guide everything we do and shape our commitment to our customers and partners.
              </p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full transition-shadow hover:shadow-lg">
                    <CardContent className="p-6">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <value.icon className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="mb-2 text-xl font-semibold">{value.title}</h3>
                      <p className="text-sm text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <motion.div
              className="mb-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="mb-4 text-3xl font-bold">Meet Our Team</h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Dedicated professionals working together to make equipment rental seamless and accessible.
              </p>
            </motion.div>

            <div className="flex justify-center gap-8 mx-auto max-w-6xl">
              {team.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex-1 max-w-xs"
                >
                  <Card className="h-full text-center">
                    <CardContent className="p-6">
                      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                        <Users className="h-10 w-10 text-primary" />
                      </div>
                      <h3 className="mb-1 text-lg font-semibold">{member.name}</h3>
                      <p className="mb-3 text-sm font-medium text-primary">{member.role}</p>
                      <p className="text-sm text-muted-foreground">{member.description}</p>
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
