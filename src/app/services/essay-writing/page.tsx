'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  CheckCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  Star,
  FileText,
  Users,
} from 'lucide-react';

const essayTypes = [
  'Argumentative Essays',
  'Descriptive Essays',
  'Narrative Essays',
  'Expository Essays',
  'Compare & Contrast',
  'Cause & Effect',
  'Process Essays',
  'Critical Analysis',
  'Persuasive Essays',
  'Reflective Essays',
  'Application Essays',
  'Scholarship Essays',
];

const subjects = [
  'English Literature',
  'History',
  'Psychology',
  'Sociology',
  'Philosophy',
  'Political Science',
  'Business Studies',
  'Economics',
  'Nursing',
  'Education',
  'Law',
  'And 50+ More Subjects',
];

const processSteps = [
  {
    step: 1,
    title: 'Place Your Order',
    description: 'Provide essay requirements, topic, length, and deadline.',
  },
  {
    step: 2,
    title: 'Writer Assignment',
    description: 'We match you with an expert writer in your subject area.',
  },
  {
    step: 3,
    title: 'Writing Process',
    description: 'Your writer researches and crafts your essay with regular updates.',
  },
  {
    step: 4,
    title: 'Quality Review',
    description: 'Our editors review the essay for quality and plagiarism.',
  },
  {
    step: 5,
    title: 'Delivery',
    description: 'Receive your completed essay on time, ready for submission.',
  },
];

export default function EssayWritingPage() {
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
                <BookOpen className="h-12 w-12 text-primary" />
              </div>
              <div className="text-left">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
                  Essay Writing Service
                </h1>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="secondary">Starting at $12/page</Badge>
                  <span className="flex items-center gap-1 text-gray-600">
                    <Clock className="h-4 w-4" />3 hours - 14 days
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Professional essay writing help from expert writers. Original, well-researched essays
              delivered on time for all academic levels and subjects.
            </p>

            <Link href="/order">
              <Button size="lg" className="text-lg px-8 py-3">
                Order Your Essay Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              What You Get With Our Essay Writing Service
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: FileText,
                  title: 'Original Content',
                  description:
                    'Every essay is written from scratch according to your specific requirements.',
                },
                {
                  icon: Users,
                  title: 'Expert Writers',
                  description:
                    'PhD holders and subject experts with proven academic writing experience.',
                },
                {
                  icon: CheckCircle,
                  title: 'Quality Guarantee',
                  description: 'Free revisions until you are completely satisfied with your essay.',
                },
                {
                  icon: Clock,
                  title: 'On-Time Delivery',
                  description: 'Your essay will be delivered exactly when you need it, guaranteed.',
                },
                {
                  icon: Star,
                  title: 'Top Grades',
                  description:
                    'Our essays are crafted to help you achieve the highest possible grades.',
                },
                {
                  icon: CheckCircle,
                  title: 'Plagiarism-Free',
                  description:
                    'All work is 100% original and comes with a detailed plagiarism report.',
                },
              ].map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Essay Types */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
              Types of Essays We Write
            </h2>
            <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              Our expert writers can handle any type of essay across all academic disciplines.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Essay Types</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {essayTypes.map((type, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{type}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Subject Areas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {subjects.map((subject, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{subject}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
              How Our Essay Writing Process Works
            </h2>
            <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              Simple, transparent process from order to delivery.
            </p>

            <div className="space-y-8">
              {processSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-6">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {step.step}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Transparent Pricing</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  level: 'High School',
                  price: '$12',
                  turnaround: '3 hours minimum',
                },
                {
                  level: 'Undergraduate',
                  price: '$15',
                  turnaround: '3 hours minimum',
                },
                {
                  level: 'Graduate',
                  price: '$18',
                  turnaround: '6 hours minimum',
                },
              ].map((tier, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6 text-center">
                    <h3 className="text-xl font-semibold mb-2">{tier.level}</h3>
                    <div className="text-3xl font-bold text-primary mb-2">
                      {tier.price}
                      <span className="text-lg font-normal text-gray-600">/page</span>
                    </div>
                    <p className="text-sm text-gray-600">{tier.turnaround}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <p className="text-sm text-gray-600 mt-6">
              * Prices may vary based on deadline and complexity. Final price calculated at
              checkout.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Ready to Order Your Essay?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Get professional essay writing help from our expert writers. Quality guaranteed,
            delivered on time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/order">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                Order Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-primary"
              >
                Ask Questions
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
