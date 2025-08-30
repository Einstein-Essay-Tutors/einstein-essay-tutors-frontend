'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { getApiUrl } from '@/lib/config';
import { Star, StarIcon, Quote } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  customer_name: string;
  created_at: string;
  order_type: string;
}

export default function TestimonialsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedReviews();
  }, []);

  const fetchFeaturedReviews = async () => {
    try {
      const response = await fetch(getApiUrl('featured_reviews/?limit=6'));

      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error('Error fetching featured reviews:', error);
    } finally {
      setLoading(false);
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

  if (loading || reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            What Our Students Say
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Real feedback from students who achieved academic success with our help.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {reviews.map(review => (
            <Card
              key={review.id}
              className="relative bg-white shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <CardContent className="p-6">
                {/* Quote Icon */}
                <div className="absolute top-4 right-4">
                  <Quote className="w-8 h-8 text-primary/20" />
                </div>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                  <span className="ml-2 text-sm text-gray-600">({review.rating}/5)</span>
                </div>

                {/* Review Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {review.title.length > 60 ? review.title.substring(0, 60) + '...' : review.title}
                </h3>

                {/* Review Comment */}
                <div className="mb-4">
                  <p className="text-gray-700 leading-relaxed">
                    "
                    {review.comment.length > 150
                      ? review.comment.substring(0, 150) + '...'
                      : review.comment}
                    "
                  </p>
                </div>

                {/* Customer Info */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{review.customer_name}</p>
                      <p className="text-sm text-gray-500 capitalize">
                        {review.order_type.replace(/_/g, ' ')} •{' '}
                        {new Date(review.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 text-primary fill-primary" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center px-6 py-3 bg-white rounded-full shadow-md">
            <div className="flex items-center gap-1 mr-3">{renderStars(5)}</div>
            <span className="text-gray-700 font-medium">Rated 4.9/5 by over 10,000+ students</span>
          </div>
        </div>
      </div>
    </section>
  );
}
