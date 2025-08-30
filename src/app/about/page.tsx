'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  BookOpen,
  Users,
  Award,
  Globe,
  Shield,
  Clock,
  CheckCircle,
  Star,
  ArrowRight,
  Target,
  Heart,
  Lightbulb,
} from 'lucide-react';

const stats = [
  { value: '10,000+', label: 'Happy Students', icon: Users },
  { value: '15,000+', label: 'Projects Completed', icon: BookOpen },
  { value: '500+', label: 'Expert Writers', icon: Award },
  { value: '98%', label: 'Success Rate', icon: Star },
];

const values = [
  {
    icon: Target,
    title: 'Excellence',
    description: 'We strive for nothing less than excellence in every piece of work we deliver.',
  },
  {
    icon: Heart,
    title: 'Student Success',
    description: 'Your academic success is our primary goal and motivation for everything we do.',
  },
  {
    icon: Shield,
    title: 'Integrity',
    description: 'We maintain the highest standards of academic integrity and ethical practices.',
  },
  {
    icon: Lightbulb,
    title: 'Innovation',
    description: 'We continuously improve our services using the latest technology and methods.',
  },
];

const teamFeatures = [
  'PhD holders from top universities',
  'Subject matter experts',
  'Native English speakers',
  'Experienced academic writers',
  'Rigorous selection process',
  'Ongoing training programs',
];

const whyChooseUs = [
  {
    icon: CheckCircle,
    title: 'Quality Guarantee',
    description:
      'We guarantee high-quality work that meets your requirements or we revise it for free.',
  },
  {
    icon: Clock,
    title: 'On-Time Delivery',
    description: 'Your work will be delivered exactly when you need it, guaranteed.',
  },
  {
    icon: Shield,
    title: 'Plagiarism-Free',
    description: 'All work is 100% original and comes with a plagiarism report.',
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'We serve students worldwide with 24/7 support in multiple time zones.',
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              About
              <span className="text-primary"> Einstein Essay Tutors</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              We are a leading academic writing service dedicated to helping students achieve their
              educational goals through expert writing assistance and personalized support.
            </p>
            <Link href="/order">
              <Button size="lg" className="text-lg px-8 py-3">
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Story</h2>
            <div className="prose prose-lg mx-auto text-gray-600">
              <p className="text-lg leading-relaxed mb-6">
                Einstein Essay Tutors was founded with a simple yet powerful mission: to provide
                students worldwide with access to high-quality academic writing support. Named after
                one of history&apos;s greatest minds, we embody the spirit of intellectual
                curiosity, critical thinking, and academic excellence that Albert Einstein
                represented.
              </p>
              <p className="text-lg leading-relaxed mb-6">
                Since our inception, we have helped thousands of students navigate the complex world
                of academic writing. From high school essays to doctoral dissertations, our team of
                expert writers has the knowledge and experience to assist students at every academic
                level and across all disciplines.
              </p>
              <p className="text-lg leading-relaxed">
                Today, we continue to evolve and improve our services, leveraging technology and
                pedagogical best practices to provide the most effective academic support possible.
                Our commitment to quality, integrity, and student success remains unwavering.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Our Impact in Numbers</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
              {stats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                    <stat.icon className="h-8 w-8" />
                  </div>
                  <div className="text-4xl font-bold mb-2">{stat.value}</div>
                  <div className="text-lg opacity-90">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">Our Core Values</h2>
            <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              These values guide everything we do and shape our commitment to student success.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <div key={index} className="text-center">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <value.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Team */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
              Our Expert Writing Team
            </h2>
            <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              Our writers are carefully selected academics and professionals with proven expertise
              in their respective fields.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="h-full">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-semibold mb-6 text-center">Writer Qualifications</h3>
                  <ul className="space-y-4">
                    {teamFeatures.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="h-full">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-semibold mb-6 text-center">Our Selection Process</h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-1">
                        1
                      </div>
                      <p className="text-gray-700">Academic credential verification</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-1">
                        2
                      </div>
                      <p className="text-gray-700">Writing sample evaluation</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-1">
                        3
                      </div>
                      <p className="text-gray-700">Subject knowledge assessment</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-1">
                        4
                      </div>
                      <p className="text-gray-700">Communication skills testing</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-1">
                        5
                      </div>
                      <p className="text-gray-700">Ongoing performance monitoring</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
              Why Students Trust Us
            </h2>
            <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              We&apos;ve built our reputation on delivering exceptional service and outstanding
              results.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {whyChooseUs.map((feature, index) => (
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

      {/* Mission Statement */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Mission</h2>
            <blockquote className="text-2xl text-gray-600 italic font-light leading-relaxed">
              &quot;To empower students worldwide with expert academic writing support, fostering
              intellectual growth and helping them achieve their educational goals while maintaining
              the highest standards of quality and academic integrity.&quot;
            </blockquote>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Experience the Difference?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have trusted Einstein Essay Tutors for their academic
            writing needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/order">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                Place Your Order
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-primary"
              >
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
