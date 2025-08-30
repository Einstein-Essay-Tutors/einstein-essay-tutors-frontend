'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/lib/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import RichTextEditor from '@/components/ui/rich-text-editor';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Archive,
  FileUp,
  Globe,
  Calendar,
  User,
  BookOpen,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  author: {
    id: number;
    username: string;
    name: string;
  };
  subject: {
    id: string;
    name: string;
  } | null;
  tags: string[];
  view_count: number;
  created_at: string;
  updated_at: string;
  cover_image: string | null;
}

interface Subject {
  id: string;
  name: string;
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [blogsLoading, setBlogsLoading] = useState(false);

  // Filters and pagination
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loadingBlogDetails, setLoadingBlogDetails] = useState(false);

  // Form state
  const [blogForm, setBlogForm] = useState({
    title: '',
    excerpt: '',
    content: '',
    status: 'draft' as 'draft' | 'published' | 'archived',
    subject_id: 'none',
    tags: '',
    meta_title: '',
    meta_description: '',
  });

  const { user, getAuthHeaders } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const fetchSubjects = useCallback(async () => {
    try {
      const response = await fetch(getApiUrl('admin/blog_subjects/'), {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setSubjects(data.subjects);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  }, [getAuthHeaders]);

  const fetchBlogs = useCallback(async () => {
    setBlogsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: '20',
      });

      if (statusFilter && statusFilter !== 'all') params.append('status', statusFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(getApiUrl(`admin/blogs/?${params}`), {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setBlogs(data.blogs);
        setTotalPages(data.total_pages);
        setTotalCount(data.total_count);
      } else {
        throw new Error('Failed to fetch blogs');
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast({
        title: 'Error',
        description: 'Failed to load blog posts',
        variant: 'destructive',
      });
    } finally {
      setBlogsLoading(false);
      setLoading(false);
    }
  }, [currentPage, statusFilter, searchQuery, getAuthHeaders, toast]);

  // Check admin access
  useEffect(() => {
    if (user && !user.is_staff && !user.is_superuser) {
      toast({
        title: 'Access Denied',
        description: 'You need admin privileges to access this page',
        variant: 'destructive',
      });
      router.push('/dashboard');
    }
  }, [user, router, toast]);

  // Fetch data
  useEffect(() => {
    if (user && (user.is_staff || user.is_superuser)) {
      fetchSubjects();
    }
  }, [user, fetchSubjects]);

  useEffect(() => {
    if (user && (user.is_staff || user.is_superuser)) {
      fetchBlogs();
    }
  }, [statusFilter, searchQuery, currentPage, user, fetchBlogs]);

  const resetForm = () => {
    setBlogForm({
      title: '',
      excerpt: '',
      content: '',
      status: 'draft',
      subject_id: 'none',
      tags: '',
      meta_title: '',
      meta_description: '',
    });
  };

  const handleCreateBlog = async () => {
    if (!blogForm.title.trim() || !blogForm.content.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Title and content are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(getApiUrl('admin/blogs/create/'), {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...blogForm,
          subject_id: blogForm.subject_id === 'none' ? null : blogForm.subject_id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Blog Created',
          description: data.message,
          variant: 'default',
        });
        setShowCreateModal(false);
        resetForm();
        fetchBlogs();
      } else {
        throw new Error(data.error || 'Failed to create blog post');
      }
    } catch (error) {
      console.error('Error creating blog:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create blog post',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateBlog = async () => {
    if (!selectedBlog || !blogForm.title.trim() || !blogForm.content.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Title and content are required',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await fetch(getApiUrl(`admin/blogs/${selectedBlog.id}/update/`), {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...blogForm,
          subject_id: blogForm.subject_id === 'none' ? null : blogForm.subject_id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Blog Updated',
          description: data.message,
          variant: 'default',
        });
        setShowEditModal(false);
        setSelectedBlog(null);
        resetForm();
        fetchBlogs();
      } else {
        throw new Error(data.error || 'Failed to update blog post');
      }
    } catch (error) {
      console.error('Error updating blog:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update blog post',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteBlog = async () => {
    if (!selectedBlog) return;

    try {
      const response = await fetch(getApiUrl(`admin/blogs/${selectedBlog.id}/delete/`), {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Blog Deleted',
          description: data.message,
          variant: 'default',
        });
        setShowDeleteConfirm(false);
        setSelectedBlog(null);
        fetchBlogs();
      } else {
        throw new Error(data.error || 'Failed to delete blog post');
      }
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete blog post',
        variant: 'destructive',
      });
    }
  };

  const handleStatusChange = async (blog: Blog, newStatus: 'draft' | 'published' | 'archived') => {
    try {
      const response = await fetch(getApiUrl(`admin/blogs/${blog.id}/status/`), {
        method: 'PUT',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: 'Status Updated',
          description: data.message,
          variant: 'default',
        });
        fetchBlogs();
      } else {
        throw new Error(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      archived: 'bg-orange-100 text-orange-800',
    };

    return (
      <Badge
        className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openEditModal = (blog: Blog) => {
    setSelectedBlog(blog);
    setBlogForm({
      title: blog.title,
      excerpt: blog.excerpt,
      content: '', // We&apos;ll need to fetch full content
      status: blog.status,
      subject_id: blog.subject?.id || 'none',
      tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : blog.tags || '',
      meta_title: '',
      meta_description: '',
    });
    setShowEditModal(true);

    // Fetch full blog details
    fetchBlogDetails(blog.id);
  };

  const fetchBlogDetails = async (blogId: string) => {
    setLoadingBlogDetails(true);
    try {
      const response = await fetch(getApiUrl(`admin/blogs/${blogId}/`), {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const blog = await response.json();
        console.log('Fetched blog details:', blog); // Debug log
        console.log('Blog content length:', blog.content?.length || 0); // Debug content length
        setBlogForm(prev => {
          const updatedForm = {
            ...prev,
            content: blog.content || '',
            meta_title: blog.meta_title || '',
            meta_description: blog.meta_description || '',
          };
          console.log('Updated form content length:', updatedForm.content?.length || 0); // Debug
          return updatedForm;
        });
      } else {
        console.error('Failed to fetch blog details:', response.status, response.statusText);
        toast({
          title: 'Error',
          description: 'Failed to load blog details',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching blog details:', error);
      toast({
        title: 'Error',
        description: 'Failed to load blog details',
        variant: 'destructive',
      });
    } finally {
      setLoadingBlogDetails(false);
    }
  };

  if (!user || (!user.is_staff && !user.is_superuser)) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-400">Loading blog management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Back to Admin
                </Button>
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3">
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
              Blog Management
            </h1>
            <p className="text-gray-400 mt-2">Create, edit, and manage blog posts</p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Blog Post
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileUp className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Total Posts</p>
                  <p className="text-3xl font-bold text-gray-500">{totalCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Globe className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Published</p>
                  <p className="text-3xl font-bold text-gray-500">
                    {blogs.filter(b => b.status === 'published').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Edit className="h-6 w-6 text-gray-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Drafts</p>
                  <p className="text-3xl font-bold text-gray-500">
                    {blogs.filter(b => b.status === 'draft').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Archive className="h-6 w-6 text-orange-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Archived</p>
                  <p className="text-3xl font-bold text-gray-500">
                    {blogs.filter(b => b.status === 'archived').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Blogs Management */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Blog Posts
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search by title or content..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Blogs Table */}
            {blogsLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-400">Loading blog posts...</p>
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-400">No blog posts found</p>
                <Button onClick={() => setShowCreateModal(true)} className="mt-4">
                  Create Your First Post
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2">Title</th>
                      <th className="text-left py-3 px-2">Status</th>
                      <th className="text-left py-3 px-2">Author</th>
                      <th className="text-left py-3 px-2">Subject</th>
                      <th className="text-left py-3 px-2">Views</th>
                      <th className="text-left py-3 px-2">Date</th>
                      <th className="text-left py-3 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blogs.map(blog => (
                      <tr key={blog.id} className="border-b hover:bg-blue-50 transition-colors">
                        <td className="py-3 px-2">
                          <div>
                            <p className="font-medium text-gray-500">{blog.title}</p>
                            <p className="text-sm text-gray-400 truncate max-w-xs">
                              {blog.excerpt || 'No excerpt'}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">/{blog.slug}</p>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="space-y-2">
                            {getStatusBadge(blog.status)}
                            <div className="flex gap-1">
                              {blog.status !== 'draft' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusChange(blog, 'draft')}
                                  className="text-xs px-2 py-1 h-6"
                                >
                                  Draft
                                </Button>
                              )}
                              {blog.status !== 'published' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusChange(blog, 'published')}
                                  className="text-xs px-2 py-1 h-6"
                                >
                                  Publish
                                </Button>
                              )}
                              {blog.status !== 'archived' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleStatusChange(blog, 'archived')}
                                  className="text-xs px-2 py-1 h-6"
                                >
                                  Archive
                                </Button>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-500">{blog.author.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          {blog.subject ? (
                            <Badge variant="outline">{blog.subject.name}</Badge>
                          ) : (
                            <span className="text-gray-400 text-sm">No subject</span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-500">{blog.view_count}</span>
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="text-sm">
                            <div className="flex items-center gap-1 text-gray-500">
                              <Calendar className="h-3 w-3" />
                              {formatDate(blog.created_at)}
                            </div>
                            {blog.published_at && (
                              <div className="flex items-center gap-1 text-green-600 mt-1">
                                <Globe className="h-3 w-3" />
                                {formatDate(blog.published_at)}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2">
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => openEditModal(blog)}>
                              <Edit className="h-3 w-3" />
                            </Button>
                            {blog.status === 'published' && (
                              <Link href={`/blog/${blog.slug}`} target="_blank">
                                <Button size="sm" variant="outline">
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </Link>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedBlog(blog);
                                setShowDeleteConfirm(true);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-6 gap-2">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>
                    <span className="px-3 py-2 text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Blog Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
              <CardHeader>
                <CardTitle>Create New Blog Post</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title *</label>
                    <Input
                      placeholder="Blog post title"
                      value={blogForm.title}
                      onChange={e => setBlogForm(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <Select
                      value={blogForm.status}
                      onValueChange={(value: 'draft' | 'published' | 'archived') =>
                        setBlogForm(prev => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Excerpt</label>
                  <Textarea
                    placeholder="Brief description for blog listings (optional)"
                    value={blogForm.excerpt}
                    onChange={e => setBlogForm(prev => ({ ...prev, excerpt: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Content *</label>
                  <RichTextEditor
                    content={blogForm.content}
                    onChange={content => setBlogForm(prev => ({ ...prev, content }))}
                    placeholder="Write your blog post content here..."
                    className="min-h-[300px]"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <Select
                      value={blogForm.subject_id}
                      onValueChange={value => setBlogForm(prev => ({ ...prev, subject_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No subject</SelectItem>
                        {subjects.map(subject => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Tags</label>
                    <Input
                      placeholder="Comma-separated tags (e.g. essay, writing, tips)"
                      value={blogForm.tags}
                      onChange={e => setBlogForm(prev => ({ ...prev, tags: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Meta Title (SEO)</label>
                    <Input
                      placeholder="SEO title (optional)"
                      value={blogForm.meta_title}
                      onChange={e => setBlogForm(prev => ({ ...prev, meta_title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Meta Description (SEO)</label>
                    <Input
                      placeholder="SEO description (optional)"
                      value={blogForm.meta_description}
                      onChange={e =>
                        setBlogForm(prev => ({ ...prev, meta_description: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateBlog}>Create Blog Post</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Blog Modal */}
        {showEditModal && selectedBlog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
              <CardHeader>
                <CardTitle>Edit Blog Post: {selectedBlog.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Title *</label>
                    <Input
                      placeholder="Blog post title"
                      value={blogForm.title}
                      onChange={e => setBlogForm(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <Select
                      value={blogForm.status}
                      onValueChange={(value: 'draft' | 'published' | 'archived') =>
                        setBlogForm(prev => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Excerpt</label>
                  <Textarea
                    placeholder="Brief description for blog listings (optional)"
                    value={blogForm.excerpt}
                    onChange={e => setBlogForm(prev => ({ ...prev, excerpt: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Content *</label>
                  <RichTextEditor
                    content={blogForm.content}
                    onChange={content => setBlogForm(prev => ({ ...prev, content }))}
                    placeholder="Write your blog post content here..."
                    className="min-h-[300px]"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <Select
                      value={blogForm.subject_id}
                      onValueChange={value => setBlogForm(prev => ({ ...prev, subject_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No subject</SelectItem>
                        {subjects.map(subject => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Tags</label>
                    <Input
                      placeholder="Comma-separated tags (e.g. essay, writing, tips)"
                      value={blogForm.tags}
                      onChange={e => setBlogForm(prev => ({ ...prev, tags: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Meta Title (SEO)</label>
                    <Input
                      placeholder="SEO title (optional)"
                      value={blogForm.meta_title}
                      onChange={e => setBlogForm(prev => ({ ...prev, meta_title: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Meta Description (SEO)</label>
                    <Input
                      placeholder="SEO description (optional)"
                      value={blogForm.meta_description}
                      onChange={e =>
                        setBlogForm(prev => ({ ...prev, meta_description: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedBlog(null);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateBlog}>Update Blog Post</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && selectedBlog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="text-red-600">Delete Blog Post</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-500">
                  Are you sure you want to delete &quot;{selectedBlog.title}&quot;? This action
                  cannot be undone.
                </p>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setSelectedBlog(null);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleDeleteBlog} className="bg-red-600 hover:bg-red-700">
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
