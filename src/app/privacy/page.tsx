import type { Metadata } from 'next';
import Link from 'next/link';
import { generateSEO, seoConfigs } from '@/lib/seo';

export const metadata: Metadata = generateSEO(seoConfigs.privacy);
import { Button } from '@/components/ui/button';
import { PRIVACY_EMAIL } from '@/lib/config';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Shield, Calendar } from 'lucide-react';

export default function PrivacyPage() {
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
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Privacy Policy</h1>
                <div className="flex items-center gap-2 text-gray-600 mt-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    Last updated:{' '}
                    {new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
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
                    <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
                    <h3 className="text-lg font-semibold mb-2">Personal Information</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Name, email address, and contact information</li>
                      <li>Academic level and institution information</li>
                      <li>
                        Payment information (processed securely through third-party providers)
                      </li>
                      <li>Order details and requirements</li>
                    </ul>

                    <h3 className="text-lg font-semibold mb-2 mt-4">Technical Information</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>IP address and browser information</li>
                      <li>Cookies and similar tracking technologies</li>
                      <li>Usage data and analytics</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Provide and deliver our academic writing services</li>
                      <li>Process payments and manage your account</li>
                      <li>Communicate with you about your orders and our services</li>
                      <li>Improve our services and user experience</li>
                      <li>Send promotional materials (with your consent)</li>
                      <li>Comply with legal obligations</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
                    <p>
                      We do not sell, trade, or rent your personal information to third parties. We
                      may share your information only in the following circumstances:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>With our writers and staff to complete your orders</li>
                      <li>With payment processors to handle transactions</li>
                      <li>When required by law or to protect our rights</li>
                      <li>In case of business transfer (with notification)</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
                    <p>
                      We implement appropriate technical and organizational measures to protect your
                      personal information against unauthorized access, alteration, disclosure, or
                      destruction. These measures include:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>SSL encryption for data transmission</li>
                      <li>Secure servers and data centers</li>
                      <li>Regular security audits and updates</li>
                      <li>Access controls and staff training</li>
                      <li>Secure payment processing</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-4">5. Cookies and Tracking</h2>
                    <p>
                      We use cookies and similar technologies to enhance your browsing experience,
                      analyze usage patterns, and provide personalized content. You can control
                      cookie settings through your browser preferences.
                    </p>
                    <h3 className="text-lg font-semibold mb-2 mt-4">Types of Cookies We Use:</h3>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Essential cookies for website functionality</li>
                      <li>Analytics cookies for usage statistics</li>
                      <li>Preference cookies to remember your settings</li>
                      <li>Marketing cookies for targeted advertising</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
                    <p>You have the following rights regarding your personal information:</p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Access and view your personal data</li>
                      <li>Correct inaccurate or incomplete information</li>
                      <li>Delete your personal data (subject to legal requirements)</li>
                      <li>Restrict or object to processing</li>
                      <li>Data portability</li>
                      <li>Withdraw consent for marketing communications</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
                    <p>
                      We retain your personal information for as long as necessary to provide our
                      services and comply with legal obligations. Typically:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                      <li>Account information: Until account deletion</li>
                      <li>Order information: 7 years for business records</li>
                      <li>Payment information: As required by financial regulations</li>
                      <li>Marketing data: Until you opt out</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-4">8. International Transfers</h2>
                    <p>
                      Your information may be transferred to and processed in countries other than
                      your own. We ensure appropriate safeguards are in place to protect your data
                      in accordance with applicable privacy laws.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-4">9. Children's Privacy</h2>
                    <p>
                      Our services are not intended for children under 16 years of age. We do not
                      knowingly collect personal information from children under 16. If we become
                      aware that we have collected such information, we will take steps to delete
                      it.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
                    <p>
                      We may update this Privacy Policy from time to time. We will notify you of any
                      changes by posting the new policy on our website and updating the "Last
                      updated" date. Your continued use of our services after any changes
                      constitutes acceptance of the updated policy.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-semibold mb-4">11. Contact Us</h2>
                    <p>
                      If you have any questions about this Privacy Policy or our data practices,
                      please contact us:
                    </p>
                    <div className="bg-gray-50 p-4 rounded-lg mt-4">
                      <p>
                        <strong>Email:</strong> {PRIVACY_EMAIL}
                      </p>
                      <p>
                        <strong>Address:</strong> Einstein Essay Tutors Privacy Team
                      </p>
                      <p>
                        <strong>Response Time:</strong> We will respond to your inquiry within 30
                        days
                      </p>
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
