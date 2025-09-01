import { useState, useEffect, useCallback } from 'react';
import { AnnouncementResponseDto, AnnouncementRequestDto, PaginatedAnnouncementsResponse } from '../types';
import { API_ENDPOINTS } from '../config/api';

interface UseAnnouncementsOptions {
  page?: number;
  size?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  enabled?: boolean;
  isAdmin?: boolean;
}

interface UseAnnouncementsReturn {
  announcements: AnnouncementResponseDto[];
  isLoading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  totalElements: number;
  fetchAnnouncements: (page?: number) => Promise<void>;
  markAsRead: (announcementId: number) => Promise<void>;
  nextPage: () => void;
  previousPage: () => void;
  hasNext: boolean;
  hasPrevious: boolean;
  // Admin functions
  createAnnouncement: (data: AnnouncementRequestDto) => Promise<AnnouncementResponseDto | null>;
  updateAnnouncement: (id: number, data: Partial<AnnouncementRequestDto>) => Promise<AnnouncementResponseDto | null>;
  deleteAnnouncement: (id: number) => Promise<boolean>;
  refetch: () => Promise<void>;
  fetchNextPage: () => Promise<void>;
  fetchPreviousPage: () => Promise<void>;
  goToPage: (page: number) => Promise<void>;
}

export const useAnnouncements = (options: UseAnnouncementsOptions = {}): UseAnnouncementsReturn => {
  const {
    page = 0,
    size = 20,
    sortBy = 'createdAt',
    sortDir = 'desc',
    enabled = true,
    isAdmin = false
  } = options;

  const [announcements, setAnnouncements] = useState<AnnouncementResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(page);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchAnnouncements = useCallback(async (pageNum: number = currentPage) => {
    if (!enabled) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if user is authenticated
      const authTokens = localStorage.getItem(isAdmin ? 'adminAuthTokens' : 'authTokens');
      if (!authTokens) {
        setError('User not authenticated. Please log in to view announcements.');
        setIsLoading(false);
        return;
      }

      const url = API_ENDPOINTS.ANNOUNCEMENTS.GET_ALL(pageNum, size, sortBy, sortDir);
      console.log('Fetching announcements from:', url);
      console.log('Auth tokens available:', !!authTokens);
      console.log('Is admin mode:', isAdmin);
      
      // Parse auth tokens
      let accessToken: string;
      try {
        const parsedTokens = JSON.parse(authTokens);
        accessToken = parsedTokens.accessToken;
        console.log('Access token available:', !!accessToken);
      } catch (parseError) {
        console.error('Error parsing auth tokens:', parseError);
        setError('Authentication error. Please log in again.');
        setIsLoading(false);
        return;
      }

      if (!accessToken) {
        setError('No access token available. Please log in again.');
        setIsLoading(false);
        return;
      }

      // Make a simple fetch call to test the endpoint
      console.log('Making fetch request with token:', accessToken.substring(0, 20) + '...');
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Response received:', response);
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.ok) {
        const data: PaginatedAnnouncementsResponse = await response.json();
        console.log('Announcements data:', data);
        setAnnouncements(data.content);
        setTotalPages(data.totalPages);
        setTotalElements(data.totalElements);
        setCurrentPage(data.number);
      } else {
        console.error('Response not ok:', response.status, response.statusText);
        
        // Try to get error details
        let errorMessage = `Failed to fetch announcements: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.text();
          console.log('Error response body:', errorData);
          if (errorData) {
            errorMessage += ` - ${errorData}`;
          }
        } catch (e) {
          console.log('Could not read error response body');
        }
        
        if (response.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          setError('Access denied. You do not have permission to view announcements.');
        } else if (response.status === 404) {
          setError('Announcements service not found. Please try again later.');
        } else {
          setError(errorMessage);
        }
      }
    } catch (err) {
      console.error('Error fetching announcements:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch announcements');
    } finally {
      setIsLoading(false);
    }
  }, [enabled, currentPage, size, sortBy, sortDir, isAdmin]);

  const markAsRead = useCallback(async (announcementId: number) => {
    try {
      console.log('Marking announcement as read:', announcementId);
      
      // Check if user is authenticated
      const authTokens = localStorage.getItem(isAdmin ? 'adminAuthTokens' : 'authTokens');
      if (!authTokens) {
        console.error('User not authenticated for mark as read');
        return;
      }
      
      // Parse auth tokens
      let accessToken: string;
      try {
        const parsedTokens = JSON.parse(authTokens);
        accessToken = parsedTokens.accessToken;
      } catch (parseError) {
        console.error('Error parsing auth tokens:', parseError);
        return;
      }

      if (!accessToken) {
        console.error('No access token available');
        return;
      }

      const response = await fetch(
        API_ENDPOINTS.ANNOUNCEMENTS.VIEW(announcementId.toString()),
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        console.log('Successfully marked announcement as read');
        // Update local state to mark as read
        setAnnouncements(prev => 
          prev.map(announcement => 
            announcement.id === announcementId 
              ? { ...announcement, hasViewed: true, viewCount: announcement.viewCount + 1 }
              : announcement
          )
        );
      } else {
        console.error('Failed to mark announcement as read:', response.status, response.statusText);
      }
    } catch (err) {
      console.error('Error marking announcement as read:', err);
    }
  }, [isAdmin]);

  // Admin functions
  const createAnnouncement = useCallback(async (data: AnnouncementRequestDto): Promise<AnnouncementResponseDto | null> => {
    if (!isAdmin) {
      console.error('createAnnouncement called in non-admin mode');
      return null;
    }

    try {
      const authTokens = localStorage.getItem('adminAuthTokens');
      if (!authTokens) {
        console.error('Admin not authenticated');
        return null;
      }

      const parsedTokens = JSON.parse(authTokens);
      const accessToken = parsedTokens.accessToken;

      const response = await fetch(API_ENDPOINTS.ANNOUNCEMENTS.CREATE, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const createdAnnouncement = await response.json();
        console.log('Announcement created successfully:', createdAnnouncement);
        
        // Refresh the announcements list
        await fetchAnnouncements(currentPage);
        
        return createdAnnouncement;
      } else {
        console.error('Failed to create announcement:', response.status, response.statusText);
        return null;
      }
    } catch (err) {
      console.error('Error creating announcement:', err);
      return null;
    }
  }, [isAdmin, currentPage, fetchAnnouncements]);

  const updateAnnouncement = useCallback(async (id: number, data: Partial<AnnouncementRequestDto>): Promise<AnnouncementResponseDto | null> => {
    if (!isAdmin) {
      console.error('updateAnnouncement called in non-admin mode');
      return null;
    }

    try {
      const authTokens = localStorage.getItem('adminAuthTokens');
      if (!authTokens) {
        console.error('Admin not authenticated');
        return null;
      }

      const parsedTokens = JSON.parse(authTokens);
      const accessToken = parsedTokens.accessToken;

      const response = await fetch(API_ENDPOINTS.ANNOUNCEMENTS.UPDATE(id.toString()), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const updatedAnnouncement = await response.json();
        console.log('Announcement updated successfully:', updatedAnnouncement);
        
        // Refresh the announcements list
        await fetchAnnouncements(currentPage);
        
        return updatedAnnouncement;
      } else {
        console.error('Failed to update announcement:', response.status, response.statusText);
        return null;
      }
    } catch (err) {
      console.error('Error updating announcement:', err);
      return null;
    }
  }, [isAdmin, currentPage, fetchAnnouncements]);

  const deleteAnnouncement = useCallback(async (id: number): Promise<boolean> => {
    if (!isAdmin) {
      console.error('deleteAnnouncement called in non-admin mode');
      return false;
    }

    try {
      const authTokens = localStorage.getItem('adminAuthTokens');
      if (!authTokens) {
        console.error('Admin not authenticated');
        return false;
      }

      const parsedTokens = JSON.parse(authTokens);
      const accessToken = parsedTokens.accessToken;

      const response = await fetch(API_ENDPOINTS.ANNOUNCEMENTS.DELETE(id.toString()), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        console.log('Announcement deleted successfully');
        
        // Refresh the announcements list
        await fetchAnnouncements(currentPage);
        
        return true;
      } else {
        console.error('Failed to delete announcement:', response.status, response.statusText);
        return false;
      }
    } catch (err) {
      console.error('Error deleting announcement:', err);
      return false;
    }
  }, [isAdmin, currentPage, fetchAnnouncements]);

  // Pagination functions
  const nextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      fetchAnnouncements(currentPage + 1);
    }
  }, [currentPage, totalPages, fetchAnnouncements]);

  const previousPage = useCallback(() => {
    if (currentPage > 0) {
      fetchAnnouncements(currentPage - 1);
    }
  }, [currentPage, fetchAnnouncements]);

  const hasNext = currentPage < totalPages - 1;
  const hasPrevious = currentPage > 0;

  // Admin pagination functions
  const refetch = useCallback(() => fetchAnnouncements(currentPage), [fetchAnnouncements, currentPage]);
  
  const fetchNextPage = useCallback(async () => {
    if (hasNext) {
      await fetchAnnouncements(currentPage + 1);
    }
  }, [hasNext, currentPage, fetchAnnouncements]);
  
  const fetchPreviousPage = useCallback(async () => {
    if (hasPrevious) {
      await fetchAnnouncements(currentPage - 1);
    }
  }, [hasPrevious, currentPage, fetchAnnouncements]);
  
  const goToPage = useCallback(async (pageNum: number) => {
    if (pageNum >= 0 && pageNum < totalPages) {
      await fetchAnnouncements(pageNum);
    }
  }, [totalPages, fetchAnnouncements]);

  // Fetch announcements on mount
  useEffect(() => {
    if (enabled) {
      console.log('useAnnouncements hook mounted, fetching announcements...');
      fetchAnnouncements(page);
    }
  }, [enabled, page, fetchAnnouncements]);

  return {
    announcements,
    isLoading,
    error,
    totalPages,
    currentPage,
    totalElements,
    fetchAnnouncements,
    markAsRead,
    nextPage,
    previousPage,
    hasNext,
    hasPrevious,
    // Admin functions
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    refetch,
    fetchNextPage,
    fetchPreviousPage,
    goToPage,
  };
};
