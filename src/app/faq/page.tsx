'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getApiUrl } from '@/lib/config';
import {
  ChevronDown,
  ChevronUp,
  Search,
  HelpCircle,
  ArrowRight,
  MessageCircle,
  Phone,
  Mail,
} from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
}

interface FAQCategory {
  id: string;
  name: string;
  description: string;
  order: number;
  faqs: FAQ[];
  faq_count: number;
}

interface FAQResponse {
  categories: FAQCategory[];
  total_categories: number;
  total_faqs: number;
}

export default function FAQPage() {
  const [faqData, setFaqData] = useState<FAQResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [filteredData, setFilteredData] = useState<FAQCategory[]>([]);

  useEffect(() => {
    fetchFAQs();
  }, []);

  useEffect(() => {
    if (faqData && searchQuery) {
      // Filter FAQs based on search query
      const filtered = faqData.categories
        .map(category => ({
          ...category,
          faqs: category.faqs.filter(
            faq =>
              faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
              faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter(category => category.faqs.length > 0);

      setFilteredData(filtered);
    } else if (faqData) {
      setFilteredData(faqData.categories);
    }
  }, [searchQuery, faqData]);

  const fetchFAQs = async () => {
    try {
      const response = await fetch(getApiUrl('faqs/'));

      if (response.ok) {
        const data: FAQResponse = await response.json();
        setFaqData(data);
        setFilteredData(data.categories);
      }
    } catch (error) {
      console.error('Error fetching FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (faqId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(faqId)) {
      newExpanded.delete(faqId);
    } else {
      newExpanded.add(faqId);
    }
    setExpandedItems(newExpanded);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading FAQs...</p>
        </div>
      </div>
    );
  }

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
              Frequently Asked
              <span className="text-primary"> Questions</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Find answers to common questions about our academic writing services, ordering
              process, and policies.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-8">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="Search frequently asked questions..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 text-lg"
              />
            </div>

            {faqData && (
              <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                <span>{faqData.total_categories} Categories</span>
                <span>•</span>
                <span>{faqData.total_faqs} Questions</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {filteredData.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg text-gray-600 mb-2">
                    {searchQuery
                      ? 'No FAQs found matching your search.'
                      : 'No FAQs available at the moment.'}
                  </p>
                  {searchQuery && (
                    <Button variant="outline" onClick={() => setSearchQuery('')} className="mt-4">
                      Clear Search
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {filteredData.map(category => (
                  <Card key={category.id} className="shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <div className="w-2 h-8 bg-primary rounded"></div>
                        <div>
                          <h2 className="text-2xl font-bold">{category.name}</h2>
                          {category.description && (
                            <p className="text-gray-800 font-medium text-base mt-1">
                              {category.description}
                            </p>
                          )}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {category.faqs.map(faq => {
                        const isExpanded = expandedItems.has(faq.id);
                        return (
                          <div key={faq.id} className="border rounded-lg">
                            <button
                              onClick={() => toggleExpanded(faq.id)}
                              className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                            >
                              <h3 className="font-semibold text-gray-900 pr-4">{faq.question}</h3>
                              {isExpanded ? (
                                <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                              )}
                            </button>
                            {isExpanded && (
                              <div className="px-6 pb-4 border-t bg-gray-50/50">
                                <div className="prose prose-gray max-w-none pt-4">
                                  <div
                                    className="text-gray-900 leading-relaxed font-medium"
                                    dangerouslySetInnerHTML={{
                                      __html: faq.answer.replace(/\n/g, '<br />'),
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Still Need Help Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Still Need Help?</h2>
            <p className="text-lg text-gray-600 mb-8">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <MessageCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2 text-gray-900">Live Chat</h3>
                  <p className="text-sm text-gray-800 mb-4 font-medium">
                    Chat with our support team in real-time
                  </p>
                  <Button size="sm" className="w-full">
                    Start Chat
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Mail className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2 text-gray-900">Email Support</h3>
                  <p className="text-sm text-gray-800 mb-4 font-medium">
                    Send us an email and we&apos;ll respond within 24 hours
                  </p>
                  <Link href="/contact">
                    <Button variant="outline" size="sm" className="w-full">
                      Contact Us
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <Phone className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="font-semibold mb-2 text-gray-900">Phone Support</h3>
                  <p className="text-sm text-gray-800 mb-4 font-medium">Call us for immediate assistance</p>
                  <Button variant="outline" size="sm" className="w-full">
                    Call Now
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Link href="/order">
              <Button size="lg" className="text-lg px-8 py-3">
                Place Your Order
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
