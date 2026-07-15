import { useState } from 'react';
import { FiStar } from 'react-icons/fi';
import Button from '../common/Button';
import axios from 'axios';
import { toast } from 'react-toastify';

const ProductReviews = ({ reviews, setReviews, productId, userInfo }) => {
  const [newReviewText, setNewReviewText] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;
    
    if (!userInfo) {
      toast.warning('Please log in to leave a review.');
      return;
    }

    setIsSubmitting(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${userInfo.token}` },
      };
      await axios.post(`http://localhost:5000/api/products/${productId}/reviews`, {
        rating: newReviewRating,
        comment: newReviewText
      }, config);
      
      const newRev = {
        id: `rev-${Date.now()}`,
        name: userInfo.name,
        rating: newReviewRating,
        comment: newReviewText,
        createdAt: new Date().toISOString()
      };
      
      setReviews([newRev, ...reviews]);
      setNewReviewText('');
      toast.success('Thank you for your premium rating review!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-16 border-t border-[var(--border-color)] pt-10">
      <h2 className="text-2xl font-bold uppercase tracking-widest mb-8">Client Reviews</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <p className="text-gray-500 italic">No reviews yet. Be the first to review this piece.</p>
          ) : (
            reviews.map((rev, idx) => (
              <div key={idx} className="border-b border-[var(--border-color)] pb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-sm uppercase tracking-wider">{rev.name}</span>
                  <span className="text-xs text-gray-400">{new Date(rev.createdAt || rev.date).toLocaleDateString()}</span>
                </div>
                <div className="flex text-gold mb-3">
                  {[...Array(5)].map((_, i) => <FiStar key={i} fill={i < rev.rating ? 'currentColor' : 'none'} size={12} />)}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{rev.comment || rev.text}</p>
              </div>
            ))
          )}
        </div>
        
        <div className="bg-gray-50 dark:bg-[#111] p-6 sm:p-8 border border-[var(--border-color)]">
          <h3 className="text-lg font-bold uppercase tracking-wider mb-6">Write a Review</h3>
          <form onSubmit={handleReviewSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setNewReviewRating(star)}
                    className="text-gold focus:outline-none"
                  >
                    <FiStar fill={star <= newReviewRating ? 'currentColor' : 'none'} size={24} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">Your Review</label>
              <textarea 
                rows="4" 
                value={newReviewText}
                onChange={(e) => setNewReviewText(e.target.value)}
                className="w-full px-4 py-3 bg-transparent border border-[var(--border-color)] rounded text-sm outline-none focus:border-gold resize-none"
                placeholder="Share your experience..."
                required
              />
            </div>
            <Button type="submit" isLoading={isSubmitting} className="w-full">
              Submit Review
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductReviews;
