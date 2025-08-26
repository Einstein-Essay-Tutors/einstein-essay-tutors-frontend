'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText, Calendar } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Link href="/">
              <Button variant="outline" className="mb-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-primary/10 rounded-lg">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  Terms of Service
                </h1>
                <div className="flex items-center gap-2 text-gray-600 mt-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-lg">
              <CardContent className="p-8 prose prose-gray max-w-none">
                <div className="space-y-8">
                  <section>
                    <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
                    <p>
                      By accessing and using Einstein Essay Tutors ("we", "our", or "us"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-4">2. Service Description</h2>
                    <p>
                      Einstein Essay Tutors provides academic writing assistance, including but not limited to essays, research papers, dissertations, and editing services. Our services are intended for research and study purposes only.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-4">3. User Responsibilities</h2>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Provide accurate and complete information when placing orders</li>
                      <li>Use our services ethically and in accordance with your institution's policies</li>
                      <li>Respect intellectual property rights and avoid plagiarism</li>
                      <li>Communicate respectfully with our staff and writers</li>
                      <li>Make payments according to agreed terms</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-4">4. Payment Terms</h2>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Payment is required before work begins on your order</li>
                      <li>All prices are stated in US dollars</li>
                      <li>We accept various payment methods including credit cards and PayPal</li>
                      <li>Refunds are subject to our refund policy</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-4">5. Quality Guarantee</h2>
                    <p>
                      We guarantee that all work delivered meets the specified requirements. If you are not satisfied with the quality of work, you may request revisions within 14 days of delivery at no additional cost, provided the revision requests are within the original order requirements.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-4">6. Refund Policy</h2>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Full refund available if no writer has been assigned to your order</li>
                      <li>Partial refunds may be available in case of service failure</li>
                      <li>Refund requests must be submitted within 14 days of order completion</li>
                      <li>Refunds are processed within 5-14 business days</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
                    <p>
                      Upon full payment, you receive full ownership rights to the completed work. However, we retain the right to use anonymized versions of completed work for quality assurance and training purposes.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-4">8. Privacy and Confidentiality</h2>
                    <p>
                      We are committed to protecting your privacy and maintaining the confidentiality of your personal information. Please refer to our Privacy Policy for detailed information about how we collect, use, and protect your data.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
                    <p>
                      Einstein Essay Tutors shall not be liable for any direct, indirect, incidental, special, or consequential damages arising from your use of our services, except where prohibited by law.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-4">10. Modifications to Terms</h2>
                    <p>
                      We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting on our website. Your continued use of our services after any such changes constitutes acceptance of the new terms.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-4">11. Contact Information</h2>
                    <p>
                      If you have any questions about these Terms of Service, please contact us at:
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg mt-4">
                      <p><strong>Email:</strong> legal@einsteinessaytutors.com</p>
                      <p><strong>Address:</strong> Einstein Essay Tutors Legal Department</p>
                    </div>
                  </section>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}