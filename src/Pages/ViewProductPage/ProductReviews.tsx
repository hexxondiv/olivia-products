import React, { useEffect, useState } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import './product-reviews.scss';

interface Review {
  id: number;
  productId: number;
  orderId: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  reviewText: string | null;
  isApproved: boolean;
  createdAt: string;
}

interface ProductReviewsProps {
  productId: number;
  refreshTrigger?: number;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({ productId, refreshTrigger }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
  }, [productId, refreshTrigger]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/reviews.php?productId=${productId}&approvedOnly=true`);
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.data || []);
        setAverageRating(data.averageRating || 0);
      } else {
        setError(data.message || 'Failed to load reviews');
      }
    } catch (err) {
      setError('Failed to load reviews');
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="star-rating">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= rating ? 'filled' : 'empty'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="product-reviews">
        <div className="text-center py-4">
          <Spinner animation="border" variant="primary" size="sm" />
          <p className="mt-2">Loading reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-reviews">
        <Alert variant="warning">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="product-reviews">
      <div className="reviews-header">
        <h3>Customer Reviews</h3>
        {averageRating > 0 && (
          <div className="average-rating">
            <div className="rating-value">{averageRating.toFixed(1)}</div>
            {renderStars(Math.round(averageRating))}
            <span className="review-count">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="no-reviews">
          <p>No reviews yet. Be the first to review this product!</p>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review.id} className="review-item">
              <div className="review-header">
                <div className="reviewer-info">
                  <strong className="reviewer-name">{review.customerName}</strong>
                  <span className="review-date">{formatDate(review.createdAt)}</span>
                </div>
                <div className="review-rating">{renderStars(review.rating)}</div>
              </div>
              {review.reviewText && (
                <div className="review-text">
                  <p>{review.reviewText}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

