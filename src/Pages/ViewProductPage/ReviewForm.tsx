import React, { useState } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import './product-reviews.scss';

interface ReviewFormProps {
  productId: number;
  productName: string;
  onReviewSubmitted?: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ 
  productId, 
  productName,
  onReviewSubmitted 
}) => {
  const [orderId, setOrderId] = useState('');
  const [rating, setRating] = useState<number>(5);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);

    try {
      const response = await fetch('/api/reviews.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId,
          orderId: orderId.trim(),
          rating,
          reviewText: reviewText.trim() || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        // Reset form
        setOrderId('');
        setRating(5);
        setReviewText('');
        
        // Callback to refresh reviews
        if (onReviewSubmitted) {
          setTimeout(() => {
            onReviewSubmitted();
          }, 1000);
        }
      } else {
        setError(data.message || 'Failed to submit review');
      }
    } catch (err) {
      setError('Failed to submit review. Please try again.');
      console.error('Error submitting review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStarInput = () => {
    return (
      <div className="star-input">
        <label>Rating *</label>
        <div className="star-selector">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`star-button ${star <= rating ? 'selected' : ''}`}
              onClick={() => setRating(star)}
              aria-label={`Rate ${star} star${star !== 1 ? 's' : ''}`}
            >
              ★
            </button>
          ))}
          <span className="rating-label">{rating} {rating === 1 ? 'star' : 'stars'}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="review-form-container">
      <h4>Write a Review</h4>
      <p className="form-description">
        To submit a review, please provide your order ID. Your name and email will be automatically retrieved from your order. Only customers who have purchased this product can review it.
      </p>

      {error && (
        <Alert variant="danger" dismissible onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" dismissible onClose={() => setSuccess(false)}>
          Thank you! Your review has been submitted successfully.
        </Alert>
      )}

      <Form onSubmit={handleSubmit}>
        <Form.Group>
          <Form.Label>Order ID *</Form.Label>
          <Form.Control
            type="text"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            placeholder="e.g., ORD-123456"
            required
            disabled={submitting}
          />
          <Form.Text className="text-muted" style={{ fontSize: '0.75rem' }}>
            You can find your order ID in your order confirmation email. Your name and email will be automatically retrieved from your order.
          </Form.Text>
        </Form.Group>

        {renderStarInput()}

        <Form.Group>
          <Form.Label>Your Review</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="Share your experience with this product..."
            disabled={submitting}
          />
        </Form.Group>

        <Button
          type="submit"
          variant="primary"
          disabled={submitting}
          className="submit-review-btn"
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </Form>
    </div>
  );
};

