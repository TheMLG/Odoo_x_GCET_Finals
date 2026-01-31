import { motion } from "framer-motion";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Clock, MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative bg-primary/5 py-20">
          <div className="container mx-auto px-4">
            <motion.div className="mx-auto max-w-4xl text-center" {...fadeIn}>
              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Get in <span className="text-primary">Touch</span>
              </h1>
              <p className="text-lg text-muted-foreground sm:text-xl">
                Have questions? We're here to help. Reach out to our friendly
                team anytime.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Contact Info Cards */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {contactInfo.map((info, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full text-center transition-shadow hover:shadow-lg">
                    <CardContent className="p-6">
                      <div
                        className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 ${info.color}`}
                      >
                        <info.icon className="h-7 w-7" />
                      </div>
                      <h3 className="mb-2 text-lg font-semibold">
                        {info.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {info.details}
                      </p>
                      <p className="text-sm text-muted-foreground">
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
        <section className="bg-muted/30 py-16">
          <div className="container mx-auto px-4">
            <motion.div
              className="mb-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="mb-4 text-3xl font-bold">
                Frequently Asked Questions
              </h2>
              <p className="mx-auto max-w-2xl text-muted-foreground">
                Find quick answers to common questions. Can't find what you're
                looking for? Contact us!
              </p>
            </motion.div>

            <div className="mx-auto max-w-3xl space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="mb-2 font-semibold">{faq.question}</h3>
                      <p className="text-sm text-muted-foreground">
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
