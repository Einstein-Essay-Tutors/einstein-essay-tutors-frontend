'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { getApiUrl } from '@/lib/config';
import {
  Star,
  StarIcon,
  Check,
  X,
  Eye,
  MessageSquare,
  Calendar,
  User,
  DollarSign,
  Filter,
  Loader2,
  ArrowLeft,
  ArrowRight,
  FileText,
} from 'lucide-react';
import Link from 'next/link';

interface Review {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  rating: number;
  title: string;
  comment: string;
  is_approved: boolean;
  is_featured: boolean;
  admin_notes: string;
  created_at: string;
  moderated_at: string | null;
  moderated_by: string | null;
  order_final_price: number;
}

interface ReviewListResponse {
  reviews: Review[];
  total_count: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [moderatingReview, setModeratingReview] = useState<string | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [moderationNotes, setModerationNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>(
    'pending'
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, [statusFilter, currentPage]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        page_size: '10',
      });

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(getApiUrl(`api/admin/reviews_list/?${params.toString()}`), {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data: ReviewListResponse = await response.json();
        setReviews(data.reviews);
        setTotalPages(data.total_pages);
        setTotalCount(data.total_count);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch reviews',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while fetching reviews',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const moderateReview = async (
    reviewId: string,
    action: 'approve' | 'reject',
    isFeatured: boolean = false
  ) => {
    setModeratingReview(reviewId);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(getApiUrl('api/admin/moderate_review/'), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          review_id: reviewId,
          action: action,
          admin_notes: moderationNotes,
          is_featured: isFeatured,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Success',
          description: data.message || `Review ${action}ed successfully`,
        });

        setSelectedReview(null);
        setModerationNotes('');
        fetchReviews(); // Refresh the list
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || `Failed to ${action} review`,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error(`Error ${action}ing review:`, error);
      toast({
        title: 'Error',
        description: `An error occurred while ${action}ing review`,
        variant: 'destructive',
      });
    } finally {
      setModeratingReview(null);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => {
      const filled = index < rating;
      return filled ? (
        <StarIcon key={index} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      ) : (
        <StarIcon key={index} className="w-4 h-4 text-gray-300" />
      );
    });
  };

  const getStatusBadge = (review: Review) => {
    if (review.moderated_at) {
      if (review.is_approved) {
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            {review.is_featured ? 'Featured' : 'Approved'}
          </Badge>
        );
      } else {
        return (
          <Badge variant="default" className="bg-red-100 text-red-800">
            Rejected
          </Badge>
        );
      }
    } else {
      return (
        <Badge variant="default" className="bg-yellow-100 text-yellow-800">
          Pending
        </Badge>
      );
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Link href="/admin">
                <Button variant="outline" size="sm" className="w-fit">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Admin
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Review Management</h1>
                <p className="text-gray-600">{totalCount} total reviews</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Filter:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(['all', 'pending', 'approved', 'rejected'] as const).map(filter => (
                    <Button
                      key={filter}
                      variant={statusFilter === filter ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setStatusFilter(filter);
                        setCurrentPage(1);
                      }}
                    >
                      {filter === 'all'
                        ? 'All Reviews'
                        : filter === 'pending'
                          ? 'Pending'
                          : filter === 'approved'
                            ? 'Approved'
                            : 'Rejected'}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reviews List */}
          {loading ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin mr-2" />
                  <span>Loading reviews...</span>
                </div>
              </CardContent>
            </Card>
          ) : reviews.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-lg font-medium">No reviews found</p>
                  <p>No reviews match the current filter criteria.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {reviews.map(review => (
                <Card key={review.id} className="relative">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            {renderStars(review.rating)}
                            <span className="ml-2 text-sm text-gray-600">({review.rating}/5)</span>
                          </div>
                          {getStatusBadge(review)}
                        </div>
                        <CardTitle className="text-lg">{review.title}</CardTitle>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setSelectedReview(selectedReview?.id === review.id ? null : review)
                        }
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {selectedReview?.id === review.id ? 'Hide' : 'Details'}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-500" />
                        <span className="font-medium">{review.customer_name}</span>
                        <span className="text-gray-500">({review.customer_email})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span>Order #{review.order_number}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span>${review.order_final_price}</span>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-gray-800 whitespace-pre-wrap">{review.comment}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span>Submitted {formatDate(review.created_at)}</span>
                      </div>
                      {review.moderated_at && (
                        <div className="flex items-center gap-2">
                          <span>
                            Moderated by {review.moderated_by} on {formatDate(review.moderated_at)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Expanded Details */}
                    {selectedReview?.id === review.id && (
                      <div className="border-t pt-4 mt-4 space-y-4">
                        {review.admin_notes && (
                          <div>
                            <h4 className="font-medium text-sm mb-2">Admin Notes:</h4>
                            <div className="bg-blue-50 p-3 rounded border border-blue-200">
                              <p className="text-sm text-blue-800">{review.admin_notes}</p>
                            </div>
                          </div>
                        )}

                        {!review.moderated_at && (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium mb-2">
                                Admin Notes (optional):
                              </label>
                              <Textarea
                                value={moderationNotes}
                                onChange={e => setModerationNotes(e.target.value)}
                                placeholder="Add notes about this moderation decision..."
                                rows={3}
                              />
                            </div>

                            <div className="flex gap-3">
                              <Button
                                onClick={() => moderateReview(review.id, 'approve', false)}
                                disabled={moderatingReview === review.id}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                {moderatingReview === review.id ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4 mr-2" />
                                )}
                                Approve
                              </Button>

                              <Button
                                onClick={() => moderateReview(review.id, 'approve', true)}
                                disabled={moderatingReview === review.id}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                {moderatingReview === review.id ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <Star className="h-4 w-4 mr-2" />
                                )}
                                Approve & Feature
                              </Button>

                              <Button
                                onClick={() => moderateReview(review.id, 'reject')}
                                disabled={moderatingReview === review.id}
                                variant="destructive"
                              >
                                {moderatingReview === review.id ? (
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                  <X className="h-4 w-4 mr-2" />
                                )}
                                Reject
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages} ({totalCount} total reviews)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
