'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  CheckCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  BarChart,
  Search,
  BookOpen,
} from 'lucide-react';

export default function ResearchPapersPage() {
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
                <FileText className="h-12 w-12 text-primary" />
              </div>
              <div className="text-left">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">Research Papers</h1>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="secondary">Starting at $15/page</Badge>
                  <span className="flex items-center gap-1 text-gray-600">
                    <Clock className="h-4 w-4" />6 hours - 21 days
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Comprehensive research papers with in-depth analysis, proper methodology, and academic
              sources from expert researchers.
            </p>

            <Link href="/order">
              <Button size="lg" className="text-lg px-8 py-3">
                Order Research Paper
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              Research Paper Features
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Search,
                  title: 'Thorough Research',
                  description:
                    'Comprehensive literature review using academic databases and peer-reviewed sources.',
                },
                {
                  icon: BarChart,
                  title: 'Data Analysis',
                  description:
                    'Statistical analysis and interpretation of data using appropriate research methods.',
                },
                {
                  icon: BookOpen,
                  title: 'Proper Citations',
                  description:
                    'Accurate citations in APA, MLA, Chicago, Harvard, or any required format.',
                },
                {
                  icon: CheckCircle,
                  title: 'Quality Methodology',
                  description: 'Sound research methodology appropriate for your field of study.',
                },
                {
                  icon: FileText,
                  title: 'Structured Format',
                  description:
                    'Proper academic structure with abstract, methodology, results, and conclusion.',
                },
                {
                  icon: Clock,
                  title: 'Timely Delivery',
                  description: 'Research papers delivered on schedule with time for revisions.',
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

      {/* What's Included */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              What's Included in Your Research Paper
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Research Components</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      'Abstract and keywords',
                      'Introduction with thesis',
                      'Literature review',
                      'Methodology section',
                      'Results and analysis',
                      'Discussion and conclusion',
                      'Reference list',
                      'Appendices (if needed)',
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quality Assurance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {[
                      'Plagiarism report included',
                      'Professional editing',
                      'Fact-checking process',
                      'Format verification',
                      'Grammar and style check',
                      'Reference accuracy',
                      'Unlimited revisions',
                      '24/7 customer support',
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Need a Research Paper?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Get expert help with your research paper from experienced academic writers.
          </p>
          <Link href="/order">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Start Your Order
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
