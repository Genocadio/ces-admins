import React, { useState } from 'react';
import { Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useResponseRating } from '../hooks/useResponseRating';
import { ResponseResponseDto } from '../types';

interface ResponseRatingPopupProps {
  response: ResponseResponseDto;
  isOpen: boolean;
  onClose: () => void;
  onRatingSubmit: (rating: number, feedbackComment?: string) => void;
}

const ResponseRatingPopup: React.FC<ResponseRatingPopupProps> = ({
  response,
  isOpen,
  onClose,
  onRatingSubmit
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser, isAuthenticated } = useAuth();
  const { error: ratingError, clearError } = useResponseRating();

  if (!isOpen || !isAuthenticated) return null;

  // Clear any previous errors and reset form when popup opens
  React.useEffect(() => {
    if (isOpen) {
      clearError();
      setRating(0);
      setFeedbackComment('');
    }
  }, [isOpen, clearError]);

  const handleRatingSubmit = async () => {
    if (rating === 0) return;
    
    // Validate feedback comment length
    if (feedbackComment.length > 500) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onRatingSubmit(rating, feedbackComment.trim() || undefined);
      onClose();
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStarClick = (starRating: number) => {
    setRating(starRating);
  };

  const handleStarHover = (starRating: number) => {
    setHoveredRating(starRating);
  };

  const handleStarLeave = () => {
    setHoveredRating(0);
  };

  const renderStar = (starNumber: number) => {
    const isFilled = starNumber <= (hoveredRating || rating || response.averageRating || 0);
    const isHovered = starNumber <= hoveredRating;
    const isDisabled = isSubmitting || !!response.averageRating;
    
    return (
      <button
        key={starNumber}
        type="button"
        className={`text-2xl transition-all duration-200 ${
          isFilled 
            ? 'text-yellow-400' 
            : 'text-gray-300 hover:text-yellow-200'
        } ${isHovered ? 'scale-110' : ''} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={() => !isDisabled && handleStarClick(starNumber)}
        onMouseEnter={() => !isDisabled && handleStarHover(starNumber)}
        onMouseLeave={handleStarLeave}
        disabled={isDisabled}
      >
        ★
      </button>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Rate Your Satisfaction
          </h3>
          
          <p className="text-sm text-gray-600 mb-6">
            How satisfied are you with this response?
          </p>

          {/* Star Rating */}
          <div className="flex justify-center space-x-2 mb-6">
            {[1, 2, 3, 4, 5].map(renderStar)}
          </div>
          
          {/* Rating Instructions */}
          {!response.averageRating && (
            <p className="text-xs text-gray-500 mb-4">
              Click on a star to rate your satisfaction (1 = Very Dissatisfied, 5 = Very Satisfied)
            </p>
          )}

          {/* Rating Label */}
          {rating > 0 && (
            <p className="text-sm text-gray-700 mb-4">
              {rating === 1 && 'Very Dissatisfied'}
              {rating === 2 && 'Dissatisfied'}
              {rating === 3 && 'Neutral'}
              {rating === 4 && 'Satisfied'}
              {rating === 5 && 'Very Satisfied'}
            </p>
          )}

          {/* Feedback Comment Input */}
          {!response.averageRating && (
            <div className="mb-6">
              <label htmlFor="feedbackComment" className="block text-sm font-medium text-gray-700 mb-2 text-left">
                Additional Feedback (Optional)
              </label>
              <textarea
                id="feedbackComment"
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="Share your thoughts about this response... (e.g., What went well? What could be improved?)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors"
                rows={3}
                maxLength={500}
                disabled={isSubmitting}
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500 flex items-center">
                  <span className="mr-1">💡</span>
                  Your feedback helps improve government responses
                </p>
                <span className={`text-xs ${feedbackComment.length > 450 ? 'text-orange-500' : feedbackComment.length > 400 ? 'text-yellow-500' : 'text-gray-400'}`}>
                  {feedbackComment.length}/500
                  {feedbackComment.length > 450 && <span className="ml-1">⚠️</span>}
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
            >
              Cancel
            </button>
            
            <button
              type="button"
              onClick={handleRatingSubmit}
              disabled={rating === 0 || isSubmitting || !!response.averageRating}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {response.averageRating ? 'Already Rated' : (isSubmitting ? 'Submitting...' : `Submit Rating${feedbackComment.trim() ? ' & Feedback' : ''}`)}
            </button>
          </div>
          
          {/* Error Display */}
          {ratingError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-700">{ratingError}</p>
            </div>
          )}
          
          {/* Already Rated Message */}
          {response.averageRating && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-center justify-center space-x-2">
                <Star size={16} className="text-blue-600 fill-current" />
                <p className="text-sm text-blue-700">
                  You have already rated this response: <span className="font-medium">{response.averageRating}/5</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResponseRatingPopup;
