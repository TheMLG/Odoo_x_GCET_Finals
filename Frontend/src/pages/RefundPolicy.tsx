import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, DollarSign, Clock, AlertCircle } from 'lucide-react';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
};

const RefundPolicy = () => {
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
                  <RefreshCw className="h-8 w-8 text-primary" />
                </div>
              </div>
              <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
                Refund & Cancellation Policy
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
              <Card className="mb-6 border-green-500/20 bg-green-50 dark:bg-green-950/20">
                <CardContent className="p-6">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-900 dark:text-green-100">
                      At RentX, we strive to provide the best rental experience. Please review our 
                      refund and cancellation policy carefully before making a reservation.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-8">
                {/* Section 1 */}
                <Card>
                  <CardContent className="p-8">
                    <div className="mb-4 flex items-center gap-3">
                      <Clock className="h-6 w-6 text-primary" />
                      <h2 className="text-2xl font-bold">1. Cancellation Policy</h2>
                    </div>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        Our cancellation policy is designed to be fair to both renters and vendors. 
                        The amount refunded depends on when you cancel your reservation.
                      </p>

                      <h3 className="text-lg font-semibold text-foreground">1.1 Standard Cancellation Timeline</h3>
                      
                      <div className="space-y-3">
                        <div className="rounded-lg border border-border p-4">
                          <h4 className="font-semibold text-foreground mb-2">
                            Cancellation 48+ Hours Before Rental Start Time
                          </h4>
                          <ul className="list-disc space-y-1 pl-6">
                            <li>100% refund of the rental amount</li>
                            <li>Full refund of security deposit (if applicable)</li>
                            <li>Processing within 5-7 business days</li>
                          </ul>
                        </div>

                        <div className="rounded-lg border border-border p-4">
                          <h4 className="font-semibold text-foreground mb-2">
                            Cancellation 24-48 Hours Before Rental Start Time
                          </h4>
                          <ul className="list-disc space-y-1 pl-6">
                            <li>50% refund of the rental amount</li>
                            <li>Full refund of security deposit (if applicable)</li>
                            <li>Processing within 5-7 business days</li>
                          </ul>
                        </div>

                        <div className="rounded-lg border border-border p-4">
                          <h4 className="font-semibold text-foreground mb-2">
                            Cancellation Less Than 24 Hours Before Rental Start Time
                          </h4>
                          <ul className="list-disc space-y-1 pl-6">
                            <li>No refund of the rental amount</li>
                            <li>Security deposit will be refunded (if applicable)</li>
                            <li>Exception may be made for emergency situations</li>
                          </ul>
                        </div>
                      </div>

                      <h3 className="text-lg font-semibold text-foreground">1.2 Vendor-Specific Policies</h3>
                      <p>
                        Some vendors may have their own cancellation policies that differ from our 
                        standard policy. These will be clearly displayed on the product listing page 
                        and during the booking process. Vendor-specific policies always take precedence 
                        over our standard policy.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 2 */}
                <Card>
                  <CardContent className="p-8">
                    <div className="mb-4 flex items-center gap-3">
                      <DollarSign className="h-6 w-6 text-primary" />
                      <h2 className="text-2xl font-bold">2. Refund Process</h2>
                    </div>
                    <div className="space-y-4 text-muted-foreground">
                      <h3 className="text-lg font-semibold text-foreground">2.1 How to Request a Refund</h3>
                      <p>To cancel your booking and request a refund:</p>
                      <ol className="list-decimal space-y-2 pl-6">
                        <li>Log in to your RentX account</li>
                        <li>Navigate to "My Orders" or "My Rentals"</li>
                        <li>Find the booking you wish to cancel</li>
                        <li>Click on "Cancel Booking"</li>
                        <li>Confirm the cancellation and provide a reason (optional)</li>
                        <li>You will receive a confirmation email with refund details</li>
                      </ol>

                      <h3 className="text-lg font-semibold text-foreground">2.2 Refund Timeline</h3>
                      <ul className="list-disc space-y-2 pl-6">
                        <li><strong>Credit/Debit Cards:</strong> 5-7 business days after cancellation approval</li>
                        <li><strong>Digital Wallets:</strong> 3-5 business days after cancellation approval</li>
                        <li><strong>Bank Transfer:</strong> 7-10 business days after cancellation approval</li>
                        <li><strong>UPI:</strong> 2-3 business days after cancellation approval</li>
                      </ul>

                      <h3 className="text-lg font-semibold text-foreground">2.3 Refund Method</h3>
                      <p>
                        Refunds will be processed to the original payment method used for the booking. 
                        If the original payment method is no longer available, please contact our 
                        support team to arrange an alternative refund method.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 3 */}
                <Card>
                  <CardContent className="p-8">
                    <h2 className="mb-4 text-2xl font-bold">3. Vendor-Initiated Cancellations</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        In rare cases, a vendor may need to cancel a confirmed booking due to unforeseen 
                        circumstances such as equipment failure or unavailability.
                      </p>

                      <h3 className="text-lg font-semibold text-foreground">3.1 Full Refund Guarantee</h3>
                      <p>
                        If a vendor cancels your booking for any reason:
                      </p>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>You will receive a 100% refund of the rental amount</li>
                        <li>Full refund of any deposits or fees paid</li>
                        <li>Refund processing within 3-5 business days</li>
                        <li>We will help you find an alternative rental if desired</li>
                      </ul>

                      <h3 className="text-lg font-semibold text-foreground">3.2 Compensation</h3>
                      <p>
                        In addition to a full refund, you may be eligible for:
                      </p>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>A discount coupon for your next rental (10-20% off)</li>
                        <li>Priority support for finding alternative equipment</li>
                        <li>Expedited refund processing</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 4 */}
                <Card>
                  <CardContent className="p-8">
                    <h2 className="mb-4 text-2xl font-bold">4. No-Show Policy</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        A "no-show" occurs when a renter fails to pick up the rental equipment at the 
                        agreed-upon time without prior cancellation.
                      </p>

                      <h3 className="text-lg font-semibold text-foreground">4.1 No-Show Consequences</h3>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>No refund will be provided for no-shows</li>
                        <li>The full rental amount will be charged</li>
                        <li>Security deposits will be returned (if applicable)</li>
                        <li>Future bookings may require advance payment</li>
                      </ul>

                      <h3 className="text-lg font-semibold text-foreground">4.2 Grace Period</h3>
                      <p>
                        We provide a 30-minute grace period after the scheduled pickup time. If you 
                        anticipate being late, please contact the vendor immediately to avoid being 
                        marked as a no-show.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 5 */}
                <Card>
                  <CardContent className="p-8">
                    <h2 className="mb-4 text-2xl font-bold">5. Early Returns</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <h3 className="text-lg font-semibold text-foreground">5.1 Standard Policy</h3>
                      <p>
                        If you return rental equipment earlier than the agreed-upon rental period:
                      </p>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>No refund for unused rental time (standard policy)</li>
                        <li>Some vendors may offer partial refunds at their discretion</li>
                        <li>Check with the specific vendor regarding their early return policy</li>
                      </ul>

                      <h3 className="text-lg font-semibold text-foreground">5.2 Equipment Issues</h3>
                      <p>
                        If you need to return equipment early due to malfunction or quality issues:
                      </p>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>Contact the vendor immediately to report the issue</li>
                        <li>Document the problem with photos/videos if possible</li>
                        <li>You may be eligible for a full or partial refund</li>
                        <li>Alternative equipment may be provided at no extra cost</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 6 */}
                <Card>
                  <CardContent className="p-8">
                    <h2 className="mb-4 text-2xl font-bold">6. Damaged or Lost Equipment</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <h3 className="text-lg font-semibold text-foreground">6.1 Damage Charges</h3>
                      <p>
                        If rental equipment is returned damaged:
                      </p>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>Minor damage: Deduction from security deposit</li>
                        <li>Major damage: Additional charges may apply</li>
                        <li>Total loss: Full replacement cost will be charged</li>
                        <li>Insurance coverage applies if purchased</li>
                      </ul>

                      <h3 className="text-lg font-semibold text-foreground">6.2 Dispute Resolution</h3>
                      <p>
                        If you disagree with damage charges:
                      </p>
                      <ol className="list-decimal space-y-2 pl-6">
                        <li>Contact the vendor to discuss the charges</li>
                        <li>Provide evidence (photos taken at pickup time)</li>
                        <li>If unresolved, escalate to RentX support</li>
                        <li>We will mediate and make a final determination</li>
                      </ol>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 7 */}
                <Card>
                  <CardContent className="p-8">
                    <h2 className="mb-4 text-2xl font-bold">7. Security Deposit Refunds</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <h3 className="text-lg font-semibold text-foreground">7.1 Standard Refund Process</h3>
                      <p>
                        Security deposits are held to cover potential damage or late returns:
                      </p>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>Deposits are refunded within 3-7 business days after equipment return</li>
                        <li>Vendor inspects equipment before releasing the deposit</li>
                        <li>Deductions are made only for documented damage or violations</li>
                        <li>You will receive a detailed breakdown of any deductions</li>
                      </ul>

                      <h3 className="text-lg font-semibold text-foreground">7.2 Hold Period</h3>
                      <p>
                        Vendors have up to 48 hours to inspect returned equipment and report any issues. 
                        If no issues are reported within this timeframe, the full deposit will be 
                        automatically released.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 8 */}
                <Card>
                  <CardContent className="p-8">
                    <h2 className="mb-4 text-2xl font-bold">8. Weather and Force Majeure</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <h3 className="text-lg font-semibold text-foreground">8.1 Severe Weather</h3>
                      <p>
                        In cases of severe weather that prevent safe use of rental equipment:
                      </p>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>You may reschedule without penalty</li>
                        <li>Full refund available if rescheduling is not possible</li>
                        <li>Weather must be officially declared severe by local authorities</li>
                      </ul>

                      <h3 className="text-lg font-semibold text-foreground">8.2 Force Majeure Events</h3>
                      <p>
                        In cases of natural disasters, pandemics, or other unforeseeable circumstances:
                      </p>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>100% refund or credit for future use</li>
                        <li>No cancellation fees will be charged</li>
                        <li>Valid for government-mandated closures or travel restrictions</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 9 */}
                <Card>
                  <CardContent className="p-8">
                    <h2 className="mb-4 text-2xl font-bold">9. Modification of Bookings</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <h3 className="text-lg font-semibold text-foreground">9.1 Date Changes</h3>
                      <p>
                        You may modify your booking dates subject to availability:
                      </p>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>Changes made 48+ hours before: Free of charge</li>
                        <li>Changes made 24-48 hours before: May incur a small fee</li>
                        <li>Changes less than 24 hours before: Subject to vendor approval</li>
                        <li>Price differences may apply based on new dates</li>
                      </ul>

                      <h3 className="text-lg font-semibold text-foreground">9.2 Equipment Changes</h3>
                      <p>
                        If you need to change the equipment you're renting:
                      </p>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>Subject to availability of alternative equipment</li>
                        <li>Price difference will be charged or refunded</li>
                        <li>May be considered a new booking in some cases</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 10 */}
                <Card>
                  <CardContent className="p-8">
                    <h2 className="mb-4 text-2xl font-bold">10. Disputes and Appeals</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <h3 className="text-lg font-semibold text-foreground">10.1 Filing a Dispute</h3>
                      <p>
                        If you disagree with a refund decision:
                      </p>
                      <ol className="list-decimal space-y-2 pl-6">
                        <li>Contact RentX support within 48 hours</li>
                        <li>Provide detailed explanation and supporting documentation</li>
                        <li>We will review your case within 3-5 business days</li>
                        <li>A decision will be communicated via email</li>
                      </ol>

                      <h3 className="text-lg font-semibold text-foreground">10.2 Escalation Process</h3>
                      <p>
                        If you're not satisfied with the initial decision:
                      </p>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>Request escalation to senior support team</li>
                        <li>Additional review will be conducted</li>
                        <li>Final decision will be made within 7 business days</li>
                        <li>Our decision on escalated cases is final</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 11 */}
                <Card>
                  <CardContent className="p-8">
                    <h2 className="mb-4 text-2xl font-bold">11. Special Circumstances</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <h3 className="text-lg font-semibold text-foreground">11.1 Medical Emergencies</h3>
                      <p>
                        In case of documented medical emergencies:
                      </p>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>Full refund may be provided regardless of timing</li>
                        <li>Medical documentation required</li>
                        <li>Contact support immediately to explain the situation</li>
                      </ul>

                      <h3 className="text-lg font-semibold text-foreground">11.2 Long-Term Rentals</h3>
                      <p>
                        Rentals exceeding 30 days may have different cancellation terms:
                      </p>
                      <ul className="list-disc space-y-2 pl-6">
                        <li>Specific terms agreed upon at booking time</li>
                        <li>May require longer notice periods</li>
                        <li>Prorated refunds may be available</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>

                {/* Section 12 */}
                <Card>
                  <CardContent className="p-8">
                    <h2 className="mb-4 text-2xl font-bold">12. Policy Changes</h2>
                    <div className="space-y-4 text-muted-foreground">
                      <p>
                        RentX reserves the right to modify this refund policy at any time. Changes 
                        will be effective immediately upon posting. However, bookings made before policy 
                        changes will be governed by the policy in effect at the time of booking.
                      </p>
                      <p>
                        We recommend reviewing this policy before each booking to ensure you understand 
                        the current terms.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Section */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-8">
                    <h2 className="mb-4 text-2xl font-bold">Contact Us</h2>
                    <p className="text-muted-foreground mb-4">
                      If you have questions about our refund policy or need assistance with a cancellation:
                    </p>
                    <div className="space-y-2">
                      <p className="font-medium">Email: refunds@rentx.com</p>
                      <p className="font-medium">Support: support@rentx.com</p>
                      <p className="font-medium">Phone: +1 (555) 123-4567</p>
                      <p className="font-medium">Hours: Monday-Friday, 9 AM - 6 PM (Local Time)</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-4">
                      For urgent issues, please call our support line. For non-urgent matters, 
                      email is preferred and we'll respond within 24 hours.
                    </p>
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

export default RefundPolicy;
