import { useCallback } from 'react';
import { API_ENDPOINTS } from '../config/api';
import { TopicResponseDto } from '../types';

interface UseTopicInteractionsProps {
  isAdmin?: boolean;
  onUnauthorized?: () => void;
}

export const useTopicInteractions = ({ isAdmin = false, onUnauthorized }: UseTopicInteractionsProps = {}) => {
  const createAuthenticatedFetch = useCallback((token: string) => {
    return async (url: string, options: RequestInit = {}) => {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (response.status === 401) {
        // Clear session
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        if (isAdmin) {
          // For admin, clear admin tokens and reload the page to show admin login
          localStorage.removeItem('adminAuthTokens');
          localStorage.removeItem('currentAdminLeader');
          window.location.reload();
        } else {
          // For citizens, trigger the login prompt callback
          if (onUnauthorized) {
            onUnauthorized();
          }
        }
        throw new Error('Unauthorized');
      }

      return response;
    };
  }, [isAdmin, onUnauthorized]);

  const upvoteTopic = useCallback(async (topicId: number): Promise<TopicResponseDto> => {
    let token: string | null = null;
    
    if (isAdmin) {
      // Admin context - get from adminAuthTokens
      const adminTokens = localStorage.getItem('adminAuthTokens');
      if (adminTokens) {
        const parsed = JSON.parse(adminTokens);
        token = parsed.accessToken;
      }
    } else {
      // Citizen context - get from authTokens
      const citizenTokens = localStorage.getItem('authTokens');
      if (citizenTokens) {
        const parsed = JSON.parse(citizenTokens);
        token = parsed.accessToken;
      }
    }
    
    if (!token) {
      throw new Error('No access token');
    }

    const fetchWithAuth = createAuthenticatedFetch(token);
    const response = await fetchWithAuth(API_ENDPOINTS.TOPICS.UPVOTE(topicId.toString()), {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to upvote topic: ${response.statusText}`);
    }

    return response.json();
  }, [createAuthenticatedFetch, isAdmin]);

  const downvoteTopic = useCallback(async (topicId: number): Promise<TopicResponseDto> => {
    let token: string | null = null;
    
    if (isAdmin) {
      // Admin context - get from adminAuthTokens
      const adminTokens = localStorage.getItem('adminAuthTokens');
      if (adminTokens) {
        const parsed = JSON.parse(adminTokens);
        token = parsed.accessToken;
      }
    } else {
      // Citizen context - get from authTokens
      const citizenTokens = localStorage.getItem('authTokens');
      if (citizenTokens) {
        const parsed = JSON.parse(citizenTokens);
        token = parsed.accessToken;
      }
    }
    
    if (!token) {
      throw new Error('No access token');
    }

    const fetchWithAuth = createAuthenticatedFetch(token);
    const response = await fetchWithAuth(API_ENDPOINTS.TOPICS.DOWNVOTE(topicId.toString()), {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to downvote topic: ${response.statusText}`);
    }

    return response.json();
  }, [createAuthenticatedFetch, isAdmin]);

  const followTopic = useCallback(async (topicId: number): Promise<TopicResponseDto> => {
    let token: string | null = null;
    
    if (isAdmin) {
      // Admin context - get from adminAuthTokens
      const adminTokens = localStorage.getItem('adminAuthTokens');
      if (adminTokens) {
        const parsed = JSON.parse(adminTokens);
        token = parsed.accessToken;
      }
    } else {
      // Citizen context - get from authTokens
      const citizenTokens = localStorage.getItem('authTokens');
      if (citizenTokens) {
        const parsed = JSON.parse(citizenTokens);
        token = parsed.accessToken;
      }
    }
    
    if (!token) {
      throw new Error('No access token');
    }

    const fetchWithAuth = createAuthenticatedFetch(token);
    const response = await fetchWithAuth(API_ENDPOINTS.TOPICS.FOLLOW(topicId.toString()), {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to follow topic: ${response.statusText}`);
    }

    return response.json();
  }, [createAuthenticatedFetch, isAdmin]);

  return {
    upvoteTopic,
    downvoteTopic,
    followTopic,
  };
};
