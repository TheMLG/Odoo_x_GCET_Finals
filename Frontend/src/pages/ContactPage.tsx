import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock, MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const contactInfo = [
  {
    icon: Mail,
    title: "Email Us",
    details: "support@rentalx.com",
    subDetails: "info@rentalx.com",
    color: "text-blue-500",
  },
  {
    icon: Phone,
    title: "Call Us",
    details: "+91 1234567892",
    subDetails: "+91 9876543210",
    color: "text-green-500",
  },
  {
    icon: MapPin,
    title: "Visit Us",
    details: "Ahemdabad",
    subDetails: "Gujarat, India",
    color: "text-red-500",
  },
  {
    icon: Clock,
    title: "Business Hours",
    details: "Mon - Fri: 9:00 AM - 6:00 PM",
    subDetails: "Sat - Sun: 10:00 AM - 4:00 PM",
    color: "text-purple-500",
  },
];

const faqs = [
  {
    question: "How do I rent equipment?",
    answer:
      "Browse our catalog, select your desired items, choose rental duration, and proceed to checkout. We'll handle the rest!",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit cards, debit cards, and PayPal for secure transactions.",
  },
  {
    question: "Is insurance included in rentals?",
    answer:
      "Yes, all rentals come with comprehensive insurance coverage for your peace of mind.",
  },
  {
    question: "Can I extend my rental period?",
    answer:
      "Absolutely! Contact us or use your dashboard to extend rentals before the return date.",
  },
];

const ContactPage = () => {

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
                Get in <motion.span 
                  className="text-primary"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >Touch</motion.span>
              </motion.h1>
              <motion.p 
                className="text-base leading-relaxed text-muted-foreground sm:text-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                Have questions? We're here to help. Reach out to our friendly team anytime.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 40, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: index * 0.12, ease: "easeOut" }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                >
                  <Card className="group h-full rounded-2xl border-2 border-border/50 bg-card text-center shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-xl">
                    <CardContent className="p-8">
                      <motion.div
                        className={`mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 ${info.color}`}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <info.icon className="h-8 w-8" />
                      </motion.div>
                      <h3 className="mb-3 text-lg font-bold text-foreground">
                        {info.title}
                      </h3>
                      <p className="text-sm font-medium text-muted-foreground">
                        {info.details}
                      </p>
                      <p className="text-sm font-medium text-muted-foreground">
                        {info.subDetails}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
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
                Frequently Asked Questions
              </motion.h2>
              <motion.p 
                className="mx-auto max-w-2xl text-base text-muted-foreground"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                Find quick answers to common questions. Can't find what you're looking for? Contact us!
              </motion.p>
            </motion.div>

            <div className="mx-auto max-w-3xl space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
                  whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                >
                  <Card className="rounded-2xl border-2 border-border/50 shadow-sm transition-all hover:border-primary/30 hover:shadow-lg">
                    <CardContent className="p-6">
                      <h3 className="mb-3 text-lg font-bold text-foreground">{faq.question}</h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {faq.answer}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default ContactPage;
