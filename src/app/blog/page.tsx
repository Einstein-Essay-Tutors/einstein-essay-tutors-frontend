'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getApiUrl } from '@/lib/config';
import { BookOpen, Calendar, ArrowRight, User } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  cover_image: string | null;
  subject: {
    id: string;
    name: string;
  } | null;
  author: {
    name: string;
  };
  tags: string[];
  view_count: number;
  published_at: string;
  created_at: string;
  updated_at: string;
}

interface BlogResponse {
  blogs: BlogPost[];
  count: number;
}

export default function BlogPage() {
  const [blogData, setBlogData] = useState<BlogResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      const response = await fetch(getApiUrl('blog_posts/?limit=12'));

      if (response.ok) {
        const data: BlogResponse = await response.json();
        setBlogData(data);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog posts...</p>
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
              <BookOpen className="h-16 w-16 text-primary" />
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              Academic Writing
              <span className="text-primary"> Blog</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Insights, tips, and resources for academic success. Learn from our experts and improve
              your writing skills.
            </p>

            {blogData && (
              <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                <span>{blogData.count} Articles</span>
                <span>•</span>
                <span>Updated Regularly</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto">
            {blogData && blogData.blogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogData.blogs.map(post => (
                  <Link key={post.id} href={`/blog/${post.slug}`}>
                    <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer group">
                      {post.cover_image && (
                        <div className="relative h-48 overflow-hidden rounded-t-lg">
                          <img
                            src={post.cover_image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}

                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          {post.subject && (
                            <Badge variant="secondary" className="text-xs">
                              {post.subject.name}
                            </Badge>
                          )}
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {formatDate(post.created_at)}
                          </div>
                        </div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">
                          {post.title}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <p className="text-gray-600 leading-relaxed line-clamp-3">
                          {post.excerpt ||
                            post.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'}
                        </p>

                        <div className="flex items-center justify-between pt-4 border-t">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <User className="h-4 w-4" />
                            <span>{post.author.name}</span>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="group-hover:bg-primary group-hover:text-white transition-colors"
                          >
                            Read More
                            <ArrowRight className="ml-1 h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="text-center py-16">
                <CardContent>
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Blog Posts Yet</h3>
                  <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                    We're working on creating valuable content for you. Check back soon for helpful
                    articles about academic writing and study tips.
                  </p>
                  <Link href="/services">
                    <Button size="lg">
                      Explore Our Services
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter Signup */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Stay Updated</h2>
            <p className="text-lg text-gray-600 mb-8">
              Subscribe to our newsletter to get the latest academic writing tips and resources.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto mb-8">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button className="px-8 py-3">Subscribe</Button>
            </div>

            <p className="text-sm text-gray-500">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Need Academic Writing Help?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Our expert writers are here to help you succeed in your academic journey.
          </p>
          <Link href="/order">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Get Writing Help
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
