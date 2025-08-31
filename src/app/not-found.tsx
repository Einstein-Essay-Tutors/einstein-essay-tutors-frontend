'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  Home, 
  BookOpen, 
  MessageCircle, 
  ArrowLeft,
  FileText,
  User,
  HelpCircle,
  ChevronRight,
  Star,
  Clock
} from 'lucide-react';

export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    setIsAnimated(true);
  }, []);

  const popularPages = [
    { name: 'Order New Essay', href: '/orders/new', icon: FileText },
    { name: 'Our Services', href: '/services', icon: BookOpen },
    { name: 'Contact Support', href: '/contact', icon: MessageCircle },
    { name: 'About Us', href: '/about', icon: User },
    { name: 'FAQ', href: '/faq', icon: HelpCircle },
  ];

  const recentBlogPosts = [
    { title: 'Essay Writing Tips for Students', href: '/blog/essay-writing-tips' },
    { title: 'How to Choose a Research Topic', href: '/blog/research-topic-guide' },
    { title: 'Academic Citation Styles Explained', href: '/blog/citation-styles' },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirect to search results or relevant page
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "404 - Page Not Found",
    "description": "The requested page could not be found on Einstein Essay Tutors website.",
    "url": "https://einsteinessaytutors.com/404",
    "isPartOf": {
      "@type": "WebSite",
      "name": "Einstein Essay Tutors",
      "url": "https://einsteinessaytutors.com",
      "description": "Professional academic writing services with expert tutors",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://einsteinessaytutors.com/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://einsteinessaytutors.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "404 Error"
        }
      ]
    },
    "mainEntity": {
      "@type": "Organization",
      "name": "Einstein Essay Tutors",
      "url": "https://einsteinessaytutors.com",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-206-468-7859",
        "contactType": "customer support",
        "availableLanguage": "English",
        "hoursAvailable": "Mo-Su 00:00-23:59"
      }
    }
  };

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div 
            className={`inline-flex items-center justify-center w-24 h-24 bg-primary/10 rounded-full mb-6 transform transition-all duration-1000 ${
              isAnimated ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
            }`}
          >
            <span className="text-4xl font-bold text-primary">404</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Oops! The page you're looking for seems to have wandered off. 
            But don't worry – we're here to help you find what you need!
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-md mx-auto mb-8">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search for essays, services, help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" className="px-6">
                Search
              </Button>
            </div>
          </form>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Contact Support
              </Button>
            </Link>
          </div>
        </div>

        {/* Popular Pages */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Popular Pages
              </h3>
              <div className="space-y-3">
                {popularPages.map((page, index) => {
                  const Icon = page.icon;
                  return (
                    <Link
                      key={index}
                      href={page.href}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <Icon className="h-4 w-4 text-gray-500 group-hover:text-primary transition-colors" />
                      <span className="flex-1 text-gray-700 group-hover:text-gray-900">
                        {page.name}
                      </span>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Our Services
              </h3>
              <div className="space-y-3">
                <Link href="/services/essay-writing" className="block p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="font-medium text-gray-900">Essay Writing</div>
                  <div className="text-sm text-gray-500">Professional essay assistance</div>
                </Link>
                <Link href="/services/research-papers" className="block p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="font-medium text-gray-900">Research Papers</div>
                  <div className="text-sm text-gray-500">In-depth research support</div>
                </Link>
                <Link href="/services/dissertations" className="block p-2 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="font-medium text-gray-900">Dissertations</div>
                  <div className="text-sm text-gray-500">Comprehensive thesis help</div>
                </Link>
                <Link href="/services" className="text-primary hover:underline font-medium text-sm">
                  View all services →
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Recent Blog Posts
              </h3>
              <div className="space-y-3">
                {recentBlogPosts.map((post, index) => (
                  <Link
                    key={index}
                    href={post.href}
                    className="block p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900 text-sm leading-relaxed">
                      {post.title}
                    </div>
                  </Link>
                ))}
                <Link href="/blog" className="text-primary hover:underline font-medium text-sm">
                  Read more articles →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Help Section */}
        <div className="bg-gradient-to-r from-primary/5 to-indigo-50 rounded-2xl p-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Still Can't Find What You're Looking For?
            </h3>
            <p className="text-gray-600 mb-6">
              Our support team is here to help you 24/7. Get assistance with orders, 
              services, or any questions you might have.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button size="lg" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Contact Support
                </Button>
              </Link>
              <Link href="/faq">
                <Button size="lg" variant="outline" className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  Browse FAQ
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="mt-16 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Link href="/" className="hover:text-primary transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span>404 Error</span>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}