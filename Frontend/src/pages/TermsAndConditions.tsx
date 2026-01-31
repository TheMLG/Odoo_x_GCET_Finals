import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollText, FileText, AlertCircle } from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const TermsAndConditions = () => {
  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative bg-primary/5 py-16">
          <div className="container mx-auto px-4">
            <motion.div
              className="mx-auto max-w-4xl text-center"
              {...fadeIn}
            >
              <div className="mb-6 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <ScrollText className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
                Terms and Conditions
              </h1>
              <p className="text-lg text-muted-foreground">
                Last Updated: February 1, 2026
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <motion.div
              className="mx-auto max-w-4xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="mb-6 border-amber-500/20 bg-amber-50 dark:bg-amber-950/20">
                <CardContent className="p-6">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-900 dark:text-amber-100">
                      Please read these terms and conditions carefully before using our service. 
                      By accessing or using RentX, you agree to be bound by these terms.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-8">
                {/* Section 1 */}
                <Card>
                  <CardContent className="p-8">
                    <div className="mb-4 flex items-center gap-3">
                      <FileText className="h-6 w-6 text-primary" />
                      <h2 className="text-2xl font-bold">1. Acceptance of Terms</h2>
                    </div>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        By accessing and using RentX's website and services, you accept and agree to be bound 
                        by the terms and provisions of this agreement. If you do not agree to these terms, you 
                        should not access or use our services.
                      </p>
                      <p>
                        These terms apply to all users of the site, including without limitation users who are 
                        browsers, vendors, customers, merchants, and/or contributors of content.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 2 */}
                <Card>
                  <CardContent className="p-8">
                    <h2 className="mb-4 text-2xl font-bold">2. User Accounts</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        To access certain features of our service, you may be required to create an account. 
                        You must provide accurate, complete, and current information during the registration process.
                      </p>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>You are responsible for maintaining the confidentiality of your account credentials</li>
                        <li>You must be at least 18 years old to create an account</li>
                        <li>You are responsible for all activities that occur under your account</li>
                        <li>You must notify us immediately of any unauthorized use of your account</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 3 */}
                <Card>
                  <CardContent className="p-8">
                    <h2 className="mb-4 text-2xl font-bold">3. Rental Services</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <h3 className="text-lg font-semibold text-foreground">3.1 Product Listings</h3>
                      <p>
                        All products listed on RentX are provided by independent vendors. We act as a 
                        platform connecting renters with vendors but are not responsible for the quality, 
                        safety, or legality of the items listed.
                      </p>
                      
                      <h3 className="text-lg font-semibold text-foreground">3.2 Rental Agreements</h3>
                      <p>
                        When you rent a product, you enter into a separate agreement with the vendor. 
                        You must comply with all rental terms specified by the vendor, including:
                      </p>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>Rental duration and return dates</li>
                        <li>Security deposits and insurance requirements</li>
                        <li>Usage restrictions and prohibited activities</li>
                        <li>Damage and liability terms</li>
                      </ul>

                      <h3 className="text-lg font-semibold text-foreground">3.3 Payment and Pricing</h3>
                      <p>
                        All prices are displayed in the local currency and may be subject to additional fees 
                        such as taxes, service charges, or delivery fees. Payment must be made in full before 
                        the rental period begins unless otherwise specified.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 4 */}
                <Card>
                  <CardContent className="p-8">
                    <h2 className="mb-4 text-2xl font-bold">4. Vendor Responsibilities</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>Vendors using our platform agree to:</p>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>Provide accurate descriptions and images of rental products</li>
                        <li>Maintain products in good working condition</li>
                        <li>Respond promptly to rental inquiries and issues</li>
                        <li>Comply with all applicable laws and regulations</li>
                        <li>Honor all confirmed rental bookings</li>
                        <li>Provide proper documentation for insurance and liability coverage</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 5 */}
                <Card>
                  <CardContent className="p-8">
                    <h2 className="mb-4 text-2xl font-bold">5. User Conduct</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>Users of RentX agree not to:</p>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>Violate any laws or regulations</li>
                        <li>Post false, inaccurate, or misleading information</li>
                        <li>Infringe on intellectual property rights</li>
                        <li>Transmit viruses or malicious code</li>
                        <li>Harass, abuse, or harm other users or vendors</li>
                        <li>Use the platform for any unauthorized commercial purposes</li>
                        <li>Attempt to gain unauthorized access to any part of the service</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 6 */}
                <Card>
                  <CardContent className="p-8">
                    <h2 className="mb-4 text-2xl font-bold">6. Cancellation and Refunds</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        Cancellation and refund policies vary by vendor. Please review the specific vendor's 
                        cancellation policy before making a rental reservation. Generally:
                      </p>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>Cancellations made 48+ hours before rental: Full refund</li>
                        <li>Cancellations made 24-48 hours before: 50% refund</li>
                        <li>Cancellations made less than 24 hours before: No refund</li>
                        <li>RentX reserves the right to cancel any rental at any time</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 7 */}
                <Card>
                  <CardContent className="p-8">
                    <h2 className="mb-4 text-2xl font-bold">7. Liability and Insurance</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        Renters are responsible for any damage to or loss of rented equipment during the 
                        rental period. We strongly recommend purchasing rental insurance when available.
                      </p>
                      <p>
                        RentX acts as a platform only and is not liable for any damages, losses, or 
                        injuries arising from the use of rented equipment. Users engage with vendors at 
                        their own risk.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 8 */}
                <Card>
                  <CardContent className="p-8">
                    <h2 className="mb-4 text-2xl font-bold">8. Intellectual Property</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        All content on RentX, including text, graphics, logos, images, and software, 
                        is the property of RentX or its content suppliers and is protected by 
                        intellectual property laws.
                      </p>
                      <p>
                        Users may not reproduce, distribute, modify, or create derivative works from any 
                        content without express written permission.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 9 */}
                <Card>
                  <CardContent className="p-8">
                    <h2 className="mb-4 text-2xl font-bold">9. Limitation of Liability</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        To the maximum extent permitted by law, RentX shall not be liable for any 
                        indirect, incidental, special, consequential, or punitive damages, or any loss 
                        of profits or revenues.
                      </p>
                      <p>
                        Our total liability for any claims related to the service shall not exceed the 
                        amount paid by you to RentX in the 12 months preceding the claim.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 10 */}
                <Card>
                  <CardContent className="p-8">
                    <h2 className="mb-4 text-2xl font-bold">10. Dispute Resolution</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        Any disputes arising from these terms or your use of RentX shall first be 
                        attempted to be resolved through good faith negotiations. If negotiations fail, 
                        disputes shall be resolved through binding arbitration.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 11 */}
                <Card>
                  <CardContent className="p-8">
                    <h2 className="mb-4 text-2xl font-bold">11. Changes to Terms</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        We reserve the right to modify these terms at any time. Changes will be effective 
                        immediately upon posting to the website. Your continued use of the service after 
                        changes are posted constitutes acceptance of the modified terms.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 12 */}
                <Card>
                  <CardContent className="p-8">
                    <h2 className="mb-4 text-2xl font-bold">12. Termination</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        We reserve the right to terminate or suspend your account and access to our services 
                        at our sole discretion, without notice, for conduct that we believe violates these 
                        terms or is harmful to other users, us, or third parties.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Section */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-8">
                    <h2 className="mb-4 text-2xl font-bold">Contact Information</h2>
                    <p className="text-muted-foreground">
                      If you have any questions about these Terms and Conditions, please contact us at:
                    </p>
                    <div className="mt-4 space-y-2">
                      <p className="font-medium">Email: legal@rentx.com</p>
                      <p className="font-medium">Phone: +1 (555) 123-4567</p>
                      <p className="font-medium">Address: 123 Business St, Tech City, TC 12345</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default TermsAndConditions;
