import { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS } from '../config/api';
import { TopicReplyResponseDto, TopicReplyRequestDto, PaginatedTopicRepliesResponse } from '../types';
import { createAuthenticatedFetch } from '../utils/apiInterceptor';
import { createAdminAuthenticatedFetch } from '../utils/adminApiInterceptor';

interface UseTopicRepliesProps {
  topicId: number;
  enabled?: boolean;
  page?: number;
  size?: number;
}

export const useTopicReplies = ({ topicId, enabled = true, page = 0, size = 20 }: UseTopicRepliesProps) => {
  const [replies, setReplies] = useState<TopicReplyResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);

  const isAdminContext = useCallback(() => {
    return !!localStorage.getItem('adminAuthTokens');
  }, []);

  const handleForceLogout = useCallback((reason?: string) => {
    console.log('Force logout triggered:', reason);
    
    if (isAdminContext()) {
      // Admin context - clear admin data and reload to show admin login
      localStorage.removeItem('adminAuthTokens');
      localStorage.removeItem('adminCurrentLeader');
      window.location.reload();
    } else {
      // Citizen context - clear session data and let React auth state handle login modal
      localStorage.removeItem('authTokens');
      localStorage.removeItem('currentUser');
      // Don't redirect - let the App component detect the cleared auth state
      // and show the login modal naturally
    }
  }, [isAdminContext]);

  const fetchReplies = useCallback(async () => {
    if (!enabled || !topicId) return;

    setIsLoading(true);
    setError(null);

    try {
      const url = API_ENDPOINTS.TOPIC_REPLIES.GET_BY_TOPIC(topicId.toString(), currentPage, size);
      let response: Response | null = null;

      if (isAdminContext()) {
        // Use admin interceptor
        const adminFetch = createAdminAuthenticatedFetch(handleForceLogout);
        response = await adminFetch(url, { method: 'GET' });
      } else {
        // Use citizen interceptor - create a simple refresh function
        const refreshSession = () => {
          console.log('Citizen session refresh not available in useTopicReplies hook');
        };
        const citizenFetch = createAuthenticatedFetch(handleForceLogout, refreshSession);
        response = await citizenFetch(url, { method: 'GET' });
      }

      if (!response) {
        // Response is null when 401 is handled by interceptor
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch replies: ${response.statusText}`);
      }

      const data: PaginatedTopicRepliesResponse = await response.json();
      
      setReplies(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setHasNext(!data.last);
      setHasPrevious(!data.first);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch replies');
    } finally {
      setIsLoading(false);
    }
  }, [topicId, currentPage, size, enabled, isAdminContext, handleForceLogout]);

  const createReply = useCallback(async (replyData: TopicReplyRequestDto): Promise<TopicReplyResponseDto | null> => {
    try {
      const url = API_ENDPOINTS.TOPIC_REPLIES.CREATE;
      let response: Response | null = null;

      if (isAdminContext()) {
        // Use admin interceptor
        const adminFetch = createAdminAuthenticatedFetch(handleForceLogout);
        response = await adminFetch(url, {
          method: 'POST',
          body: JSON.stringify(replyData),
        });
      } else {
        // Use citizen interceptor - create a simple refresh function
        const refreshSession = () => {
          console.log('Citizen session refresh not available in useTopicReplies hook');
        };
        const citizenFetch = createAuthenticatedFetch(handleForceLogout, refreshSession);
        response = await citizenFetch(url, {
          method: 'POST',
          body: JSON.stringify(replyData),
        });
      }

      if (!response) {
        // Response is null when 401 is handled by interceptor
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to create reply: ${response.statusText}`);
      }

      const newReply = await response.json();
      
      // Refresh replies to show the new one
      await fetchReplies();
      
      return newReply;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create reply');
      return null;
    }
  }, [fetchReplies, isAdminContext, handleForceLogout]);

  const upvoteReply = useCallback(async (replyId: number): Promise<boolean> => {
    try {
      const url = API_ENDPOINTS.TOPIC_REPLIES.UPVOTE(replyId.toString());
      let response: Response | null = null;

      if (isAdminContext()) {
        // Use admin interceptor
        const adminFetch = createAdminAuthenticatedFetch(handleForceLogout);
        response = await adminFetch(url, { method: 'POST' });
      } else {
        // Use citizen interceptor - create a simple refresh function
        const refreshSession = () => {
          console.log('Citizen session refresh not available in useTopicReplies hook');
        };
        const citizenFetch = createAuthenticatedFetch(handleForceLogout, refreshSession);
        response = await citizenFetch(url, { method: 'POST' });
      }

      if (!response) {
        // Response is null when 401 is handled by interceptor
        return false;
      }

      if (!response.ok) {
        throw new Error(`Failed to upvote reply: ${response.statusText}`);
      }

      // Refresh replies to update vote counts
      await fetchReplies();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upvote reply');
      return false;
    }
  }, [fetchReplies, isAdminContext, handleForceLogout]);

  const downvoteReply = useCallback(async (replyId: number): Promise<boolean> => {
    try {
      const url = API_ENDPOINTS.TOPIC_REPLIES.DOWNVOTE(replyId.toString());
      let response: Response | null = null;

      if (isAdminContext()) {
        // Use admin interceptor
        const adminFetch = createAdminAuthenticatedFetch(handleForceLogout);
        response = await adminFetch(url, { method: 'POST' });
      } else {
        // Use citizen interceptor - create a simple refresh function
        const refreshSession = () => {
          console.log('Citizen session refresh not available in useTopicReplies hook');
        };
        const citizenFetch = createAuthenticatedFetch(handleForceLogout, refreshSession);
        response = await citizenFetch(url, { method: 'POST' });
      }

      if (!response) {
        // Response is null when 401 is handled by interceptor
        return false;
      }

      if (!response.ok) {
        throw new Error(`Failed to downvote reply: ${response.statusText}`);
      }

      // Refresh replies to update vote counts
      await fetchReplies();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to downvote reply');
      return false;
    }
  }, [fetchReplies, isAdminContext, handleForceLogout]);

  const refetch = useCallback(() => {
    fetchReplies();
  }, [fetchReplies]);

  const fetchNextPage = useCallback(() => {
    if (hasNext) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasNext]);

  const fetchPreviousPage = useCallback(() => {
    if (hasPrevious) {
      setCurrentPage(prev => Math.max(0, prev - 1));
    }
  }, [hasPrevious]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(0, page));
  }, []);

  useEffect(() => {
    fetchReplies();
  }, [fetchReplies]);

  useEffect(() => {
    setCurrentPage(page);
  }, [page]);

  return {
    replies,
    isLoading,
    error,
    totalPages,
    totalElements,
    currentPage,
    hasNext,
    hasPrevious,
    createReply,
    upvoteReply,
    downvoteReply,
    refetch,
    fetchNextPage,
    fetchPreviousPage,
    goToPage,
  };
};
