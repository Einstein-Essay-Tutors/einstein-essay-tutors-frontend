'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  HelpCircle, 
  BookOpen, 
  CreditCard, 
  FileText, 
  MessageCircle,
  ArrowRight,
  Search,
  Users,
  Shield,
  Clock
} from 'lucide-react';

const helpCategories = [
  {
    icon: BookOpen,
    title: 'Getting Started',
    description: 'Learn how to place your first order and navigate our platform',
    topics: [
      'How to create an account',
      'Placing your first order',
      'Understanding our services',
      'Choosing the right service level'
    ],
    link: '/faq'
  },
  {
    icon: CreditCard,
    title: 'Payments & Pricing',
    description: 'Information about pricing, payment methods, and billing',
    topics: [
      'Payment methods accepted',
      'How pricing is calculated',
      'Refund policy',
      'Billing questions'
    ],
    link: '/faq'
  },
  {
    icon: FileText,
    title: 'Orders & Delivery',
    description: 'Managing your orders and understanding the delivery process',
    topics: [
      'Tracking your order progress',
      'Revision requests',
      'Download completed work',
      'Order status meanings'
    ],
    link: '/faq'
  },
  {
    icon: MessageCircle,
    title: 'Communication',
    description: 'How to communicate with writers and support team',
    topics: [
      'Messaging your writer',
      'Contacting support',
      'Live chat support',
      'Email notifications'
    ],
    link: '/contact'
  }
];

const quickActions = [
  {
    icon: Search,
    title: 'Search FAQs',
    description: 'Find answers to common questions',
    link: '/faq',
    buttonText: 'Browse FAQs'
  },
  {
    icon: MessageCircle,
    title: 'Contact Support',
    description: 'Get help from our support team',
    link: '/contact',
    buttonText: 'Contact Us'
  },
  {
    icon: FileText,
    title: 'Place an Order',
    description: 'Start your order now',
    link: '/order',
    buttonText: 'Order Now'
  }
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <HelpCircle className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Help
              <span className="text-primary"> Center</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Find answers, get support, and learn how to make the most of our 
              academic writing services.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              Quick Actions
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {quickActions.map((action, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow text-center">
                  <CardContent className="p-6">
                    <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <action.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{action.title}</h3>
                    <p className="text-gray-600 mb-4">{action.description}</p>
                    <Link href={action.link}>
                      <Button className="w-full">
                        {action.buttonText}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 text-center">
              Browse Help Topics
            </h2>
            <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto">
              Find detailed information organized by category to help you get the most out of our services.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {helpCategories.map((category, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <category.icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{category.title}</CardTitle>
                        <p className="text-gray-600 text-sm mt-1">{category.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {category.topics.map((topic, topicIndex) => (
                        <li key={topicIndex} className="flex items-center gap-2 text-sm text-gray-700">
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                          {topic}
                        </li>
                      ))}
                    </ul>
                    <Link href={category.link}>
                      <Button variant="outline" className="w-full">
                        Learn More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              Why Students Choose Us
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Expert Writers</h3>
                <p className="text-gray-600">
                  PhD holders and subject experts with proven academic writing experience.
                </p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">24/7 Support</h3>
                <p className="text-gray-600">
                  Round-the-clock customer support for all your questions and concerns.
                </p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Quality Guarantee</h3>
                <p className="text-gray-600">
                  100% plagiarism-free work with unlimited revisions until you're satisfied.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Still Need Help?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Our support team is available 24/7 to assist you with any questions or concerns.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="text-lg px-8 py-3">
                  Contact Support
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/faq">
                <Button variant="outline" size="lg" className="text-lg px-8 py-3">
                  Browse FAQs
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}