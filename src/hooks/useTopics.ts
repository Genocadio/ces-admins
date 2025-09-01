import { useState, useEffect, useCallback } from 'react';
import { TopicResponseDto, PaginatedTopicsResponse } from '../types';
import { API_ENDPOINTS } from '../config/api';
import { createAuthenticatedFetch } from '../utils/apiInterceptor';
import { createAdminAuthenticatedFetch } from '../utils/adminApiInterceptor';

interface UseTopicsOptions {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  enabled?: boolean;
}

interface UseTopicsReturn {
  topics: TopicResponseDto[];
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  totalElements: number;
  currentPage: number;
  hasNext: boolean;
  hasPrevious: boolean;
  refetch: () => Promise<void>;
  fetchNextPage: () => Promise<void>;
  fetchPreviousPage: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
}

export const useTopics = (options: UseTopicsOptions = {}): UseTopicsReturn => {
  const {
    page = 0,
    size = 20,
    sortBy = 'createdAt',
    sortDir = 'desc',
    enabled = true
  } = options;

  const [topics, setTopics] = useState<TopicResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(page);

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

  const fetchTopics = useCallback(async (pageNum: number = currentPage) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = API_ENDPOINTS.TOPICS.GET_ALL(pageNum, size, sortBy, sortDir);
      let response: Response | null = null;

      if (isAdminContext()) {
        // Use admin interceptor
        const adminFetch = createAdminAuthenticatedFetch(handleForceLogout);
        response = await adminFetch(url, { method: 'GET' });
      } else {
        // Use citizen interceptor - create a simple refresh function
        const refreshSession = () => {
          // For citizen context, we'll just redirect to home on auth failure
          console.log('Citizen session refresh not available in useTopics hook');
        };
        const citizenFetch = createAuthenticatedFetch(handleForceLogout, refreshSession);
        response = await citizenFetch(url, { method: 'GET' });
      }

      if (!response) {
        // Response is null when 401 is handled by interceptor
        return;
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch topics: ${response.statusText}`);
      }

      const data: PaginatedTopicsResponse = await response.json();
      
      setTopics(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
      setCurrentPage(data.number);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch topics';
      setError(errorMessage);
      console.error('Error fetching topics:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, size, sortBy, sortDir, isAdminContext, handleForceLogout]);

  const refetch = useCallback(async () => {
    await fetchTopics(currentPage);
  }, [fetchTopics, currentPage]);

  const fetchNextPage = useCallback(async () => {
    if (currentPage < totalPages - 1) {
      await fetchTopics(currentPage + 1);
    }
  }, [fetchTopics, currentPage, totalPages]);

  const fetchPreviousPage = useCallback(async () => {
    if (currentPage > 0) {
      await fetchTopics(currentPage - 1);
    }
  }, [fetchTopics, currentPage]);

  const goToPage = useCallback(async (pageNum: number) => {
    if (pageNum >= 0 && pageNum < totalPages) {
      await fetchTopics(pageNum);
    }
  }, [fetchTopics, totalPages]);

  useEffect(() => {
    if (enabled) {
      fetchTopics(page);
    }
  }, [enabled, page, fetchTopics]);

  return {
    topics,
    isLoading,
    error,
    totalPages,
    totalElements,
    currentPage,
    hasNext: currentPage < totalPages - 1,
    hasPrevious: currentPage > 0,
    refetch,
    fetchNextPage,
    fetchPreviousPage,
    goToPage,
  };
};
