import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Lock, Eye, Database, AlertCircle } from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const PrivacyPolicy = () => {
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
                  <Shield className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
                Privacy Policy
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
              <Card className="mb-6 border-blue-500/20 bg-blue-50 dark:bg-blue-950/20">
                <CardContent className="p-6">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      At RentX, we take your privacy seriously. This policy describes how we collect, 
                      use, and protect your personal information.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-8">
                {/* Section 1 */}
                <Card>
                  <CardContent className="p-8">
                    <div className="mb-4 flex items-center gap-3">
                      <Database className="h-6 w-6 text-primary" />
                      <h2 className="text-2xl font-bold">1. Information We Collect</h2>
                    </div>
                    <div className="space-y-4 text-muted-foreground">
                      <h3 className="text-lg font-semibold text-foreground">1.1 Personal Information</h3>
                      <p>
                        When you create an account or use our services, we may collect the following 
                        personal information:
                      </p>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>Full name and contact information (email, phone number, address)</li>
                        <li>Account credentials (username, password)</li>
                        <li>Payment information (credit card details, billing address)</li>
                        <li>Government-issued ID for identity verification (for vendors)</li>
                        <li>Profile information and preferences</li>
                      </ul>

                      <h3 className="text-lg font-semibold text-foreground">1.2 Automatically Collected Information</h3>
                      <p>
                        When you use our platform, we automatically collect certain information:
                      </p>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>Device information (IP address, browser type, operating system)</li>
                        <li>Usage data (pages visited, features used, time spent)</li>
                        <li>Location data (with your permission)</li>
                        <li>Cookies and similar tracking technologies</li>
                      </ul>

                      <h3 className="text-lg font-semibold text-foreground">1.3 Information from Third Parties</h3>
                      <p>
                        We may receive information from third-party services you connect to your account, 
                        such as social media platforms or payment processors.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 2 */}
                <Card>
                  <CardContent className="p-8">
                    <div className="mb-4 flex items-center gap-3">
                      <Eye className="h-6 w-6 text-primary" />
                      <h2 className="text-2xl font-bold">2. How We Use Your Information</h2>
                    </div>
                    <div className="space-y-4 text-muted-foreground">
                      <p>We use the information we collect for the following purposes:</p>
                      
                      <h3 className="text-lg font-semibold text-foreground">2.1 Service Delivery</h3>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>Process and fulfill rental transactions</li>
                        <li>Facilitate communication between renters and vendors</li>
                        <li>Provide customer support and respond to inquiries</li>
                        <li>Send transactional emails and notifications</li>
                      </ul>

                      <h3 className="text-lg font-semibold text-foreground">2.2 Platform Improvement</h3>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>Analyze usage patterns to improve our services</li>
                        <li>Develop new features and functionality</li>
                        <li>Conduct research and analytics</li>
                        <li>Optimize user experience and interface design</li>
                      </ul>

                      <h3 className="text-lg font-semibold text-foreground">2.3 Security and Safety</h3>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>Verify user identity and prevent fraud</li>
                        <li>Protect against unauthorized access and abuse</li>
                        <li>Enforce our terms of service and policies</li>
                        <li>Comply with legal obligations</li>
                      </ul>

                      <h3 className="text-lg font-semibold text-foreground">2.4 Marketing and Communications</h3>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>Send promotional offers and updates (with your consent)</li>
                        <li>Personalize content and recommendations</li>
                        <li>Conduct surveys and gather feedback</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 3 */}
                <Card>
                  <CardContent className="p-8">
                    <h2 className="mb-4 text-2xl font-bold">3. Information Sharing and Disclosure</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>We may share your information in the following circumstances:</p>
                      
                      <h3 className="text-lg font-semibold text-foreground">3.1 With Vendors</h3>
                      <p>
                        When you make a rental reservation, we share necessary information with the vendor 
                        to facilitate the transaction (name, contact information, rental details).
                      </p>

                      <h3 className="text-lg font-semibold text-foreground">3.2 With Service Providers</h3>
                      <p>
                        We work with third-party service providers who perform services on our behalf, 
                        including:
                      </p>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>Payment processing companies</li>
                        <li>Cloud hosting providers</li>
                        <li>Email service providers</li>
                        <li>Analytics and marketing platforms</li>
                        <li>Customer support tools</li>
                      </ul>

                      <h3 className="text-lg font-semibold text-foreground">3.3 For Legal Reasons</h3>
                      <p>
                        We may disclose your information when required by law or in response to legal 
                        processes, to protect our rights, or to prevent fraud or illegal activities.
                      </p>

                      <h3 className="text-lg font-semibold text-foreground">3.4 Business Transfers</h3>
                      <p>
                        If RentX is involved in a merger, acquisition, or sale of assets, your 
                        information may be transferred as part of that transaction.
                      </p>

                      <h3 className="text-lg font-semibold text-foreground">3.5 With Your Consent</h3>
                      <p>
                        We may share your information with third parties when you explicitly consent to 
                        such sharing.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 4 */}
                <Card>
                  <CardContent className="p-8">
                    <div className="mb-4 flex items-center gap-3">
                      <Lock className="h-6 w-6 text-primary" />
                      <h2 className="text-2xl font-bold">4. Data Security</h2>
                    </div>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        We implement industry-standard security measures to protect your personal information:
                      </p>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>Encryption of data in transit and at rest using SSL/TLS protocols</li>
                        <li>Secure password hashing using bcrypt</li>
                        <li>Regular security audits and vulnerability assessments</li>
                        <li>Access controls and authentication mechanisms</li>
                        <li>Employee training on data protection and privacy</li>
                        <li>Secure data storage with reputable cloud providers</li>
                      </ul>
                      <p className="mt-4">
                        However, no method of transmission over the internet or electronic storage is 100% 
                        secure. While we strive to protect your information, we cannot guarantee absolute security.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 5 */}
                <Card>
                  <CardContent className="p-8">
                    <h2 className="mb-4 text-2xl font-bold">5. Data Retention</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        We retain your personal information for as long as necessary to fulfill the purposes 
                        outlined in this privacy policy, unless a longer retention period is required by law.
                      </p>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>Account information: Retained while your account is active</li>
                        <li>Transaction records: Retained for 7 years for legal and accounting purposes</li>
                        <li>Usage data: Typically retained for 2 years</li>
                        <li>Marketing data: Retained until you opt out or withdraw consent</li>
                      </ul>
                      <p>
                        When we no longer need your information, we will securely delete or anonymize it.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 6 */}
                <Card>
                  <CardContent className="p-8">
                    <h2 className="mb-4 text-2xl font-bold">6. Your Privacy Rights</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>Depending on your location, you may have the following rights:</p>
                      
                      <h3 className="text-lg font-semibold text-foreground">6.1 Access and Portability</h3>
                      <p>
                        You have the right to access your personal information and request a copy of your 
                        data in a portable format.
                      </p>

                      <h3 className="text-lg font-semibold text-foreground">6.2 Correction and Updates</h3>
                      <p>
                        You can update or correct your personal information through your account settings 
                        or by contacting us.
                      </p>

                      <h3 className="text-lg font-semibold text-foreground">6.3 Deletion</h3>
                      <p>
                        You can request deletion of your personal information, subject to certain legal 
                        obligations and legitimate interests.
                      </p>

                      <h3 className="text-lg font-semibold text-foreground">6.4 Opt-Out</h3>
                      <p>
                        You can opt out of marketing communications at any time by clicking the unsubscribe 
                        link in our emails or updating your preferences.
                      </p>

                      <h3 className="text-lg font-semibold text-foreground">6.5 Objection and Restriction</h3>
                      <p>
                        You can object to certain processing activities or request restriction of processing 
                        in specific circumstances.
                      </p>

                      <p className="mt-4">
                        To exercise any of these rights, please contact us at privacy@rentx.com.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 7 */}
                <Card>
                  <CardContent className="p-8">
                    <h2 className="mb-4 text-2xl font-bold">7. Cookies and Tracking Technologies</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>We use cookies and similar technologies to:</p>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>Remember your preferences and settings</li>
                        <li>Authenticate your account and maintain sessions</li>
                        <li>Analyze site usage and performance</li>
                        <li>Provide personalized content and advertisements</li>
                      </ul>
                      
                      <h3 className="text-lg font-semibold text-foreground mt-4">Types of Cookies We Use:</h3>
                      <ul className="list-disc space-y-2 pl-6">
                        <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
                        <li><strong>Performance Cookies:</strong> Help us understand how visitors interact with our site</li>
                        <li><strong>Functional Cookies:</strong> Remember your preferences and choices</li>
                        <li><strong>Advertising Cookies:</strong> Deliver relevant ads based on your interests</li>
                      </ul>
                      
                      <p className="mt-4">
                        You can control cookies through your browser settings. However, disabling cookies 
                        may affect your ability to use certain features of our website.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 8 */}
                <Card>
                  <CardContent className="p-8">
                    <h2 className="mb-4 text-2xl font-bold">8. Third-Party Links and Services</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        Our website may contain links to third-party websites or services that are not 
                        operated by us. We are not responsible for the privacy practices of these third parties.
                      </p>
                      <p>
                        We encourage you to review the privacy policies of any third-party sites you visit 
                        or services you use.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 9 */}
                <Card>
                  <CardContent className="p-8">
                    <h2 className="mb-4 text-2xl font-bold">9. Children's Privacy</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        RentX is not intended for use by children under the age of 18. We do not 
                        knowingly collect personal information from children under 18.
                      </p>
                      <p>
                        If we become aware that we have collected personal information from a child under 
                        18, we will take steps to delete that information as quickly as possible.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 10 */}
                <Card>
                  <CardContent className="p-8">
                    <h2 className="mb-4 text-2xl font-bold">10. International Data Transfers</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        Your information may be transferred to and processed in countries other than your 
                        country of residence. These countries may have different data protection laws.
                      </p>
                      <p>
                        When we transfer your information internationally, we take appropriate safeguards 
                        to ensure your data remains protected in accordance with this privacy policy.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 11 */}
                <Card>
                  <CardContent className="p-8">
                    <h2 className="mb-4 text-2xl font-bold">11. Changes to This Privacy Policy</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        We may update this privacy policy from time to time to reflect changes in our 
                        practices or for legal reasons. We will notify you of any material changes by 
                        posting the new policy on this page and updating the "Last Updated" date.
                      </p>
                      <p>
                        We encourage you to review this privacy policy periodically to stay informed about 
                        how we protect your information.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 12 */}
                <Card>
                  <CardContent className="p-8">
                    <h2 className="mb-4 text-2xl font-bold">12. California Privacy Rights (CCPA)</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        If you are a California resident, you have additional rights under the California 
                        Consumer Privacy Act (CCPA):
                      </p>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>Right to know what personal information we collect, use, and disclose</li>
                        <li>Right to request deletion of your personal information</li>
                        <li>Right to opt-out of the sale of personal information (we do not sell personal information)</li>
                        <li>Right to non-discrimination for exercising your privacy rights</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 13 */}
                <Card>
                  <CardContent className="p-8">
                    <h2 className="mb-4 text-2xl font-bold">13. European Privacy Rights (GDPR)</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        If you are in the European Economic Area (EEA), you have rights under the General 
                        Data Protection Regulation (GDPR), including:
                      </p>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>Right of access to your personal data</li>
                        <li>Right to rectification of inaccurate data</li>
                        <li>Right to erasure ("right to be forgotten")</li>
                        <li>Right to restrict processing</li>
                        <li>Right to data portability</li>
                        <li>Right to object to processing</li>
                        <li>Right to withdraw consent</li>
                        <li>Right to lodge a complaint with a supervisory authority</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Section */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-8">
                    <h2 className="mb-4 text-2xl font-bold">Contact Us</h2>
                    <p className="text-muted-foreground mb-4">
                      If you have any questions or concerns about this Privacy Policy or our data practices, 
                      please contact us:
                    </p>
                    <div className="space-y-2">
                      <p className="font-medium">Email: privacy@rentx.com</p>
                      <p className="font-medium">Phone: +1 (555) 123-4567</p>
                      <p className="font-medium">Address: 123 Business St, Tech City, TC 12345</p>
                      <p className="font-medium mt-4">Data Protection Officer: dpo@rentx.com</p>
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

export default PrivacyPolicy;
