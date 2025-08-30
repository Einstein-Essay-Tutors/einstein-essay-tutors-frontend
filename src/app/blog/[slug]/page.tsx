'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getApiUrl } from '@/lib/config';
import { Calendar, ArrowLeft, User, Eye, Share2, BookOpen, Tag, Clock } from 'lucide-react';

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
  meta_title: string;
  meta_description: string;
}

export default function BlogPostPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchBlogPost();
    }
  }, [slug]);

  const fetchBlogPost = async () => {
    try {
      const response = await fetch(getApiUrl(`blog_posts/${slug}/`));

      if (response.ok) {
        const data: BlogPost = await response.json();
        setPost(data);

        // Update document title and meta description
        if (typeof window !== 'undefined') {
          document.title = data.meta_title || data.title;

          // Update meta description
          const metaDescription = document.querySelector('meta[name="description"]');
          if (metaDescription) {
            metaDescription.setAttribute('content', data.meta_description || data.excerpt || '');
          }
        }
      } else if (response.status === 404) {
        setError('Blog post not found');
      } else {
        setError('Failed to load blog post');
      }
    } catch (error) {
      console.error('Error fetching blog post:', error);
      setError('Failed to load blog post');
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

  const handleShare = () => {
    if (navigator.share && post) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
        url: window.location.href,
      });
    } else if (post) {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 text-blue-600 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading article...</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-8">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              {error === 'Blog post not found' ? 'Post Not Found' : 'Error Loading Post'}
            </h2>
            <p className="text-gray-600 mb-6">
              {error === 'Blog post not found'
                ? "The blog post you're looking for doesn't exist or may have been moved."
                : "Sorry, we couldn't load this blog post. Please try again later."}
            </p>
            <Link href="/blog">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link href="/blog">
            <Button variant="ghost" className="text-gray-700 hover:text-gray-900">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative">
        {/* Cover Image Background */}
        {post.cover_image && (
          <div className="relative h-96 lg:h-[500px] overflow-hidden">
            <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>
        )}

        {/* Hero Content */}
        <div
          className={`${post.cover_image ? 'absolute inset-0 flex items-end' : 'py-16 bg-gradient-to-br from-blue-50 to-indigo-100'}`}
        >
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className={`${post.cover_image ? 'text-white pb-16' : 'text-gray-900'}`}>
                {/* Category Badge */}
                {post.subject && (
                  <Badge
                    className={`mb-4 ${post.cover_image ? 'bg-white/20 text-white border-white/30' : 'bg-blue-100 text-blue-800 border-blue-200'}`}
                  >
                    <BookOpen className="mr-1 h-3 w-3" />
                    {post.subject.name}
                  </Badge>
                )}

                {/* Title */}
                <h1
                  className={`text-4xl lg:text-6xl font-bold leading-tight mb-6 ${post.cover_image ? 'text-white drop-shadow-lg' : 'text-gray-900'}`}
                >
                  {post.title}
                </h1>

                {/* Excerpt */}
                {post.excerpt && (
                  <p
                    className={`text-xl lg:text-2xl leading-relaxed mb-8 ${post.cover_image ? 'text-gray-100 drop-shadow' : 'text-gray-600'} max-w-3xl`}
                  >
                    {post.excerpt}
                  </p>
                )}

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <div
                    className={`flex items-center gap-2 ${post.cover_image ? 'text-gray-200' : 'text-gray-600'}`}
                  >
                    <User className="h-4 w-4" />
                    <span className="font-medium">{post.author.name}</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 ${post.cover_image ? 'text-gray-200' : 'text-gray-600'}`}
                  >
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(post.published_at || post.created_at)}</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 ${post.cover_image ? 'text-gray-200' : 'text-gray-600'}`}
                  >
                    <Eye className="h-4 w-4" />
                    <span>{post.view_count.toLocaleString()} views</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 ${post.cover_image ? 'text-gray-200' : 'text-gray-600'}`}
                  >
                    <Clock className="h-4 w-4" />
                    <span>5 min read</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-12 gap-12">
              {/* Main Content */}
              <div className="lg:col-span-8">
                <article className="prose prose-lg max-w-none prose-gray">
                  <div
                    dangerouslySetInnerHTML={{ __html: post.content }}
                    className="text-gray-800 leading-relaxed [&>h1]:text-3xl [&>h1]:font-bold [&>h1]:text-gray-900 [&>h1]:mt-12 [&>h1]:mb-6 [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:text-gray-900 [&>h2]:mt-10 [&>h2]:mb-4 [&>h3]:text-xl [&>h3]:font-semibold [&>h3]:text-gray-900 [&>h3]:mt-8 [&>h3]:mb-3 [&>p]:text-gray-700 [&>p]:text-lg [&>p]:leading-relaxed [&>p]:mb-6 [&>ul]:text-gray-700 [&>ol]:text-gray-700 [&>li]:mb-2 [&>blockquote]:border-l-4 [&>blockquote]:border-blue-500 [&>blockquote]:pl-6 [&>blockquote]:italic [&>blockquote]:text-gray-600 [&>code]:bg-gray-100 [&>code]:px-2 [&>code]:py-1 [&>code]:rounded [&>code]:text-sm [&>code]:text-gray-800"
                  />
                </article>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="px-3 py-1 text-sm bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100"
                        >
                          <Tag className="mr-1 h-3 w-3" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-4">
                <div className="sticky top-24 space-y-8">
                  {/* Author Card */}
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                          <User className="h-8 w-8 text-white" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{post.author.name}</h3>
                          <p className="text-blue-600 font-medium">Academic Writing Expert</p>
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">
                        Passionate about helping students excel in their academic journey through
                        quality writing assistance and expert guidance.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleShare}
                        className="w-full border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <Share2 className="mr-2 h-4 w-4" />
                        Share Article
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Article Info */}
                  <Card className="border-gray-200 shadow-sm">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg text-gray-900">Article Info</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0 space-y-3">
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-600">Published</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatDate(post.published_at || post.created_at)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-600">Last Updated</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatDate(post.updated_at)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-600">Views</span>
                        <span className="text-sm font-medium text-gray-900">
                          {post.view_count.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-sm text-gray-600">Reading Time</span>
                        <span className="text-sm font-medium text-gray-900">5 min</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Call to Action */}
                  <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-sm">
                    <CardContent className="p-6 text-center">
                      <BookOpen className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <h3 className="font-bold text-gray-900 mb-2">Need Writing Help?</h3>
                      <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                        Get expert assistance with your academic writing projects.
                      </p>
                      <Link href="/order">
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md">
                          Place an Order
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
