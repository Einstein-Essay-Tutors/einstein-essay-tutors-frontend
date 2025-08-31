import type { Metadata } from 'next';
import Link from 'next/link';
import { generateSEO, seoConfigs } from '@/lib/seo';

export const metadata: Metadata = generateSEO(seoConfigs.dissertations);
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Clock, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

export default function DissertationsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/services">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Services
              </Button>
            </Link>
          </div>

          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="p-4 bg-primary/10 rounded-lg">
                <GraduationCap className="h-12 w-12 text-primary" />
              </div>
              <div className="text-left">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
                  Dissertations & Theses
                </h1>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="secondary">Starting at $18/page</Badge>
                  <span className="flex items-center gap-1 text-gray-600">
                    <Clock className="h-4 w-4" />
                    14 days - 60 days
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Complete dissertation and thesis writing support from proposal to defense. Expert
              guidance through every chapter of your doctoral journey.
            </p>

            <Link href="/order">
              <Button size="lg" className="text-lg px-8 py-3">
                Get Dissertation Help
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Offered */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              Comprehensive Dissertation Support
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  title: 'Dissertation Writing',
                  description: 'Complete dissertation writing from introduction to conclusion.',
                  features: [
                    'Full dissertation',
                    'Chapter-by-chapter delivery',
                    'Regular consultations',
                    'Defense preparation',
                  ],
                },
                {
                  title: 'Thesis Writing',
                  description: "Master's thesis writing with comprehensive research and analysis.",
                  features: [
                    'Complete thesis',
                    'Literature review',
                    'Methodology design',
                    'Data analysis',
                  ],
                },
                {
                  title: 'Proposal Writing',
                  description: 'Dissertation and thesis proposals that get approved.',
                  features: [
                    'Research proposal',
                    'Literature review',
                    'Methodology outline',
                    'Timeline planning',
                  ],
                },
                {
                  title: 'Individual Chapters',
                  description: 'Help with specific dissertation or thesis chapters.',
                  features: [
                    'Any chapter',
                    'Literature review',
                    'Methodology',
                    'Results & discussion',
                  ],
                },
              ].map((service, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Start Your Dissertation Journey</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Get expert support for your dissertation or thesis. From proposal to defense.
          </p>
          <Link href="/order">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Order Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
