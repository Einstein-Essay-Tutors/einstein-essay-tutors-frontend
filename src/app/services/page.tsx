'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  GraduationCap, 
  FileText, 
  Edit, 
  Clock, 
  CheckCircle, 
  Star,
  ArrowRight,
  Users,
  Award,
  Shield
} from 'lucide-react';

const services = [
  {
    id: 'essay-writing',
    title: 'Essay Writing',
    description: 'Professional essay writing services for all academic levels and subjects.',
    icon: BookOpen,
    features: ['Original Content', 'Proper Citations', 'Any Topic', 'All Formats'],
    pricing: 'Starting at $12/page',
    turnaround: '3 hours - 14 days',
    href: '/services/essay-writing'
  },
  {
    id: 'research-papers',
    title: 'Research Papers',
    description: 'In-depth research papers with comprehensive analysis and proper methodology.',
    icon: FileText,
    features: ['Thorough Research', 'Data Analysis', 'Academic Sources', 'Methodology'],
    pricing: 'Starting at $15/page',
    turnaround: '6 hours - 21 days',
    href: '/services/research-papers'
  },
  {
    id: 'dissertations',
    title: 'Dissertations & Theses',
    description: 'Comprehensive dissertation and thesis writing support from proposal to defense.',
    icon: GraduationCap,
    features: ['Chapter-by-Chapter', 'Literature Review', 'Data Collection', 'Defense Prep'],
    pricing: 'Starting at $18/page',
    turnaround: '14 days - 60 days',
    href: '/services/dissertations'
  },
  {
    id: 'editing',
    title: 'Editing & Proofreading',
    description: 'Professional editing and proofreading services to polish your work.',
    icon: Edit,
    features: ['Grammar Check', 'Style Enhancement', 'Structure Review', 'Plagiarism Check'],
    pricing: 'Starting at $8/page',
    turnaround: '1 hour - 7 days',
    href: '/services/editing'
  }
];

const qualityFeatures = [
  {
    icon: CheckCircle,
    title: 'Quality Guarantee',
    description: 'We guarantee high-quality work that meets your requirements or we revise it for free.'
  },
  {
    icon: Clock,
    title: 'On-Time Delivery',
    description: 'Your work will be delivered exactly when you need it, guaranteed.'
  },
  {
    icon: Shield,
    title: 'Plagiarism-Free',
    description: 'All work is 100% original and comes with a plagiarism report.'
  },
  {
    icon: Users,
    title: 'Expert Writers',
    description: 'PhD holders and subject experts from top universities worldwide.'
  },
  {
    icon: Award,
    title: 'Academic Excellence',
    description: 'Proven track record of helping students achieve top grades.'
  },
  {
    icon: Star,
    title: '24/7 Support',
    description: 'Round-the-clock customer support for all your questions and concerns.'
  }
];

const academicLevels = [
  { name: 'High School', description: 'Basic essays and assignments' },
  { name: 'Undergraduate', description: 'Bachelor\'s degree coursework' },
  { name: 'Master\'s', description: 'Graduate-level research and analysis' },
  { name: 'PhD', description: 'Doctoral dissertations and advanced research' }
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Academic Writing
              <span className="text-primary"> Services</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Professional academic writing help from expert tutors across all subjects and academic levels.
              Quality work, on-time delivery, guaranteed.
            </p>
            <Link href="/order">
              <Button size="lg" className="text-lg px-8 py-3">
                Get Started Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Our Writing Services
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose from our comprehensive range of academic writing services tailored to your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {services.map((service) => (
              <Card key={service.id} className="group hover:shadow-xl transition-all duration-300 cursor-pointer">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <service.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl text-gray-900">{service.title}</CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <Badge variant="outline">{service.pricing}</Badge>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {service.turnaround}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
                  
                  <div>
                    <h4 className="font-semibold mb-3 text-gray-900">Key Features:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {service.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex gap-3 pt-4">
                    <Link href={service.href} className="flex-1">
                      <Button variant="outline" className="w-full">
                        Learn More
                      </Button>
                    </Link>
                    <Link href="/order" className="flex-1">
                      <Button className="w-full">
                        Order Now
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Academic Levels */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              All Academic Levels
            </h2>
            <p className="text-lg text-gray-600">
              We provide writing assistance for students at every academic level.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {academicLevels.map((level, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{level.name}</h3>
                  <p className="text-gray-600 text-sm">{level.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quality Features */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Einstein Essay Tutors?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're committed to delivering excellence in every aspect of our service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {qualityFeatures.map((feature, index) => (
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
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of students who trust Einstein Essay Tutors for their academic success.
            Place your order now and experience the difference.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/order">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
                Place Your Order
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-primary">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}