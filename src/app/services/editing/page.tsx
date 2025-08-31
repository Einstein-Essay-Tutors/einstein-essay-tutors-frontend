import type { Metadata } from 'next';
import Link from 'next/link';
import { generateSEO, seoConfigs } from '@/lib/seo';

export const metadata: Metadata = generateSEO(seoConfigs.editing);
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Edit, Clock, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

export default function EditingPage() {
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
                <Edit className="h-12 w-12 text-primary" />
              </div>
              <div className="text-left">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
                  Editing & Proofreading
                </h1>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="secondary">Starting at $8/page</Badge>
                  <span className="flex items-center gap-1 text-gray-600">
                    <Clock className="h-4 w-4" />1 hour - 7 days
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Professional editing and proofreading services to polish your academic work to
              perfection. Grammar, style, structure, and plagiarism checks included.
            </p>

            <Link href="/order">
              <Button size="lg" className="text-lg px-8 py-3">
                Get Editing Help
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Editing Services</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                {
                  title: 'Proofreading',
                  price: '$8/page',
                  description: 'Grammar, spelling, and punctuation corrections.',
                  features: [
                    'Grammar check',
                    'Spelling correction',
                    'Punctuation fix',
                    'Basic formatting',
                  ],
                },
                {
                  title: 'Copy Editing',
                  price: '$12/page',
                  description: 'Language improvement and clarity enhancement.',
                  features: [
                    'Style improvement',
                    'Clarity enhancement',
                    'Sentence structure',
                    'Word choice',
                  ],
                },
                {
                  title: 'Substantive Editing',
                  price: '$15/page',
                  description: 'Structure, logic, and argument improvement.',
                  features: [
                    'Structure review',
                    'Logic check',
                    'Argument flow',
                    'Content organization',
                  ],
                },
                {
                  title: 'Complete Package',
                  price: '$18/page',
                  description: 'All editing services plus plagiarism check.',
                  features: [
                    'All editing services',
                    'Plagiarism check',
                    'Formatting',
                    'Quality report',
                  ],
                },
              ].map((service, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-semibold">{service.title}</h3>
                      <Badge variant="secondary">{service.price}</Badge>
                    </div>
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
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Polish Your Academic Work</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Professional editing to make your work shine. Fast turnaround available.
          </p>
          <Link href="/order">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Start Editing
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
