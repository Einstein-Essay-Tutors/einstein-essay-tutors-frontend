'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { getApiUrl } from '@/lib/config';
import { Star, StarIcon } from 'lucide-react';

interface OrderReview {
  id: number;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
  updated_at?: string;
  is_approved: boolean;
  is_featured: boolean;
}

interface OrderReviewFormProps {
  orderId: string;
  onReviewSubmitted?: () => void;
}

export default function OrderReviewForm({ orderId, onReviewSubmitted }: OrderReviewFormProps) {
  const [review, setReview] = useState<OrderReview | null>(null);
  const [canReview, setCanReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    comment: ''
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchReviewStatus();
  }, [orderId]);

  const fetchReviewStatus = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(getApiUrl(`get_order_review/${orderId}/`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReview(data.review);
        setCanReview(data.can_review);
        
        if (data.review) {
          setFormData({
            rating: data.review.rating,
            title: data.review.title,
            comment: data.review.comment
          });
        }
      } else {
        console.error('Failed to fetch review status:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Error response body:', errorText);
      }
    } catch (error) {
      console.error('Error fetching review status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (formData.rating === 0) {
      toast({
        title: 'Error',
        description: 'Please select a rating',
        variant: 'destructive'
      });
      return;
    }
    
    if (!formData.title.trim()) {
      toast({
        title: 'Error', 
        description: 'Please enter a review title',
        variant: 'destructive'
      });
      return;
    }
    
    if (!formData.comment.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a review comment', 
        variant: 'destructive'
      });
      return;
    }

    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('access_token');
      const url = review 
        ? getApiUrl(`update_order_review/${review.id}/`)
        : getApiUrl('submit_order_review/');
      
      const method = review ? 'PUT' : 'POST';
      const payload = review 
        ? formData
        : { ...formData, order_id: orderId };

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'Success',
          description: data.message || 'Review submitted successfully'
        });
        
        if (data.review) {
          setReview(data.review);
          setCanReview(false);
        }
        
        setEditing(false);
        onReviewSubmitted?.();
      } else {
        const errorData = await response.json();
        toast({
          title: 'Error',
          description: errorData.error || 'Failed to submit review',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while submitting review',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    return Array.from({ length: 5 }, (_, index) => {
      const filled = index < rating;
      return (
        <button
          key={index}
          type="button"
          disabled={!interactive}
          onClick={() => interactive && setFormData(prev => ({ ...prev, rating: index + 1 }))}
          className={`${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} transition-transform`}
        >
          {filled ? (
            <StarIcon className="w-5 h-5 fill-yellow-400 text-yellow-400" />
          ) : (
            <StarIcon className="w-5 h-5 text-gray-300" />
          )}
        </button>
      );
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">Loading review status...</div>
        </CardContent>
      </Card>
    );
  }

  if (!canReview && !review) {
    return null; // Don't show anything if user can't review and no existing review
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5" />
          {review ? 'Your Review' : 'Leave a Review'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {review && !editing ? (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Rating</Label>
              <div className="flex items-center gap-1 mt-1">
                {renderStars(review.rating)}
                <span className="ml-2 text-sm text-gray-600">({review.rating}/5)</span>
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Title</Label>
              <p className="mt-1 text-sm text-gray-700">{review.title}</p>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Comment</Label>
              <p className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{review.comment}</p>
            </div>
            
            <div className="text-xs text-gray-500">
              Submitted on {new Date(review.created_at).toLocaleDateString()}
              {review.updated_at && review.updated_at !== review.created_at && (
                <span> • Updated on {new Date(review.updated_at).toLocaleDateString()}</span>
              )}
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => setEditing(true)}
              className="w-full"
            >
              Edit Review
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Rating *</Label>
              <div className="flex items-center gap-1 mt-1">
                {renderStars(formData.rating, true)}
                <span className="ml-2 text-sm text-gray-600">
                  {formData.rating > 0 && `(${formData.rating}/5)`}
                </span>
              </div>
            </div>
            
            <div>
              <Label htmlFor="title" className="text-sm font-medium">
                Review Title *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter a title for your review"
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="comment" className="text-sm font-medium">
                Review Comment *
              </Label>
              <Textarea
                id="comment"
                value={formData.comment}
                onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                placeholder="Share your experience with this order..."
                rows={4}
                className="mt-1"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={handleSubmitReview}
                disabled={submitting}
                className="flex-1"
              >
                {submitting ? 'Submitting...' : (review ? 'Update Review' : 'Submit Review')}
              </Button>
              
              {editing && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      rating: review!.rating,
                      title: review!.title,
                      comment: review!.comment
                    });
                  }}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}