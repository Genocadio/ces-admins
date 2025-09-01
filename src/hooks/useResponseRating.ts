import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { API_ENDPOINTS } from '../config/api';

export const useResponseRating = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  const rateResponse = async (responseId: number, rating: number, feedbackComment?: string): Promise<boolean> => {
    if (!currentUser) {
      setError('You must be logged in to rate responses');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authTokens');
      if (!token) {
        setError('Authentication token not found');
        return false;
      }

      const tokens = JSON.parse(token);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('rating', rating.toString());
      if (feedbackComment && feedbackComment.trim()) {
        params.append('feedbackComment', feedbackComment.trim());
      }
      
      const response = await fetch(`${API_ENDPOINTS.RESPONSES.RATE}/${responseId}/rate?${params.toString()}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${tokens.accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to submit rating: ${response.status}`);
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit rating';
      setError(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    rateResponse,
    isLoading,
    error,
    clearError,
  };
};
