import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Issue, IssueRequestDto, Page } from '../types';
import { IssueCard } from './IssueCard';
import { IssueDetail } from './IssueDetail';
import CreateIssueForm from './CreateIssueForm';
import { getTranslation } from '../i18n/translations';
import FloatingActionButton from './FloatingActionButton';
import { API_ENDPOINTS, buildPaginatedUrl, API_BASE_URL } from '../config/api';
import { useAuth } from '../contexts/AuthContext';
import { handleApiResponse, getAuthHeaders } from '../utils/apiInterceptor';

interface IssuesSectionProps {
  language: string;
  currentUser: any;
}

export const IssuesSection: React.FC<IssuesSectionProps> = ({ language, currentUser }) => {
  const { currentUser: authUser, isAuthenticated, forceLogout, refreshSession } = useAuth();
  
  // Use authenticated user from context if available, fallback to prop
  const user = authUser || currentUser;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isCreatingIssue, setIsCreatingIssue] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  // Issues data
  const [issues, setIssues] = useState<Issue[]>([]);

  // Fetch issues from API
  const fetchIssues = async () => {
    setIsLoading(true);
    try {
      const headers = await getAuthHeaders(refreshSession);
      
      // Debug: Log the API configuration
      console.log('API_BASE_URL:', import.meta.env.VITE_API_BASE_URL);
      console.log('API_ENDPOINTS.ISSUES.GET_ALL:', API_ENDPOINTS.ISSUES.GET_ALL);
      console.log('Authentication headers:', headers);
      console.log('User authentication status:', { isAuthenticated, user: user?.id });
      
      // Test if backend is reachable
      try {
        const testResponse = await fetch(`${API_BASE_URL}/api/health`, { 
          method: 'HEAD',
          signal: AbortSignal.timeout(5000) // 5 second timeout for health check
        });
        console.log('Backend health check status:', testResponse.status);
      } catch (healthError) {
        console.warn('Backend health check failed:', healthError);
        console.warn('This might indicate the backend is not available');
      }
      
      // Use search endpoint if search term exists, otherwise use get all
      let url: string;
      if (debouncedSearchTerm.trim()) {
        url = API_ENDPOINTS.ISSUES.SEARCH(debouncedSearchTerm.trim(), currentPage, pageSize, 'id', 'desc');
      } else {
        url = `${API_ENDPOINTS.ISSUES.GET_ALL}?page=${currentPage}&size=${pageSize}&sortBy=id&sortDir=desc`;
      }
      console.log('Fetching issues from URL:', url);
      console.log('Headers:', headers);

      // Add timeout to the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await fetch(url, {
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        console.log('Response URL:', response.url);

        if (response.ok) {
          const responseText = await response.text();
          console.log('Response body (raw):', responseText);
          
          if (!responseText || responseText.trim() === '') {
            console.warn('API returned empty response');
            setIssues([]);
            setTotalPages(0);
            setTotalElements(0);
            setIsLoading(false);
            return;
          }
          
          let data: Page<Issue>;
          try {
            data = JSON.parse(responseText);
          } catch (parseError) {
            console.error('Failed to parse JSON response:', parseError);
            console.error('Response text:', responseText);
            setIssues([]);
            setTotalPages(0);
            setTotalElements(0);
            setIsLoading(false);
            return;
          }
          
          console.log('API Response data:', data);
          console.log('Issues content:', data.content);
          
          // Ensure we have valid data
          if (data && data.content && Array.isArray(data.content)) {
            setIssues(data.content);
            setTotalPages(data.totalPages || 0);
            setTotalElements(data.totalElements || 0);
          } else {
            console.warn('API returned invalid data structure:', data);
            setIssues([]);
            setTotalPages(0);
            setTotalElements(0);
          }
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch issues:', response.status, response.statusText);
          console.error('Error response body:', errorText);
          setIssues([]);
          setTotalPages(0);
          setTotalElements(0);
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error('Request timed out after 10 seconds');
        } else if (error.name === 'TypeError' && error.message.includes('fetch')) {
          console.error('Network error - backend might be unavailable');
        }
      }
      
      setIssues([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch issues when filters or pagination changes
  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch issues when dependencies change
  useEffect(() => {
    if (isAuthenticated) {
      fetchIssues();
    }
  }, [currentPage, debouncedSearchTerm]);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(0);
  }, [debouncedSearchTerm]);

  const handleIssueClick = (issue: Issue) => {
    setSelectedIssue(issue);
  };



  const handleBackToList = () => {
    setSelectedIssue(null);
  };

  const handleVote = async (issueId: number, type: 'like' | 'unlike') => {
    try {
      const headers = await getAuthHeaders(refreshSession);
      
      const response = await fetch(API_ENDPOINTS.ISSUES.LIKE(issueId.toString()), {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });

      if (response.ok) {
        // Refresh the issues list to get updated like status
        fetchIssues();
      }
    } catch (error) {
      console.error('Error voting on issue:', error);
    }
  };

  const handleFollow = async (issueId: number, type: 'follow' | 'unfollow') => {
    try {
      const headers = await getAuthHeaders(refreshSession);
      
      const response = await fetch(API_ENDPOINTS.ISSUES.FOLLOW(issueId.toString()), {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });

      if (response.ok) {
        // Refresh the issues list to get updated follow status
        fetchIssues();
      }
    } catch (error) {
      console.error('Error following issue:', error);
    }
  };

  // Handle issue updates from IssueDetail and IssueCard components
  const handleIssueUpdate = (updatedIssue: Issue) => {
    // Update the selected issue state
    setSelectedIssue(updatedIssue);
    
    // Also update the issue in the issues list
    setIssues(prevIssues => 
      prevIssues.map(issue => 
        issue.id === updatedIssue.id ? updatedIssue : issue
      )
    );
  };





  const handleCreateIssue = () => {
    if (!isAuthenticated) {
      alert('Please log in to create an issue');
      return;
    }
    setShowCreateForm(true);
  };

  const handleCloseCreateForm = () => {
    setShowCreateForm(false);
  };

  const handleSubmitIssue = async (issueData: IssueRequestDto) => {
    setIsCreatingIssue(true);
    
    try {
      // Check if user is authenticated
      if (!isAuthenticated) {
        throw new Error('You must be logged in to create an issue');
      }
      
      // Get auth headers with automatic token refresh
      const headers = await getAuthHeaders(refreshSession);
      
      const response = await fetch(API_ENDPOINTS.ISSUES.CREATE, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(issueData),
      });

      const createdIssue = await handleApiResponse(response, 'Failed to create issue', forceLogout);
      
      if (createdIssue) {
        console.log('Issue created successfully:', createdIssue);
        
        // Close the form and refresh the issues list
        setShowCreateForm(false);
        fetchIssues();
      }
      
    } catch (error) {
      console.error('Error creating issue:', error);
      
      // Check if it's an authentication error
      if (error instanceof Error && 
          (error.message.includes('authentication') || 
           error.message.includes('tokens') || 
           error.message.includes('token'))) {
        forceLogout(error.message);
        return;
      }
      
      // Show alert for other errors
      alert(`Failed to create issue: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreatingIssue(false);
    }
  };

  // Don't show create form if user is not authenticated
  if (showCreateForm && !isAuthenticated) {
    setShowCreateForm(false);
    return null;
  }

  if (showCreateForm) {
    return (
      <CreateIssueForm
        onClose={handleCloseCreateForm}
        onSubmit={handleSubmitIssue}
        currentUser={user}
        language={language as any}
      />
    );
  }

  if (selectedIssue) {
    return (
      <IssueDetail
        issue={selectedIssue}
        currentUser={user}
        onBack={handleBackToList}
        onIssueUpdate={handleIssueUpdate}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getTranslation('issues', language)}
          </h1>
          <p className="text-gray-600">
            Report issues and collaborate with the community and government to find solutions.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="max-w-md">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search issues by content or ticket ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Search through issue descriptions, titles, and ticket IDs
          </p>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            {debouncedSearchTerm ? 'Search Results' : 'All Issues'}
          </h2>
          <p className="text-sm text-gray-600">
            {totalElements} issue{totalElements !== 1 ? 's' : ''} found
            {debouncedSearchTerm && ` for "${debouncedSearchTerm}"`}
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading issues...</p>
        </div>
      )}

      {/* Issues List */}
      {!isLoading && (
        <div className="space-y-4">
          {issues.length > 0 ? (
            issues.map(issue => {
              // Only render if issue has required properties
              if (!issue || !issue.id || !issue.title) {
                console.warn('Skipping invalid issue:', issue);
                return null;
              }
              return (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  language={language}
                  currentUser={user}
                  onClick={() => handleIssueClick(issue)}
                  onIssueUpdate={handleIssueUpdate}
                />
              );
            }).filter(Boolean) // Remove null entries
          ) : (
            <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
              <p className="text-gray-500 text-lg">
                {debouncedSearchTerm ? `No issues found matching "${debouncedSearchTerm}"` : 'No issues found.'}
              </p>
              {debouncedSearchTerm && (
                <p className="text-gray-400 text-sm mt-2">
                  Try adjusting your search terms or browse all issues
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          
          <span className="px-3 py-2 text-sm text-gray-600">
            Page {currentPage + 1} of {totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
            disabled={currentPage === totalPages - 1}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Floating Action Button - only show for authenticated users */}
      {isAuthenticated && (
        <FloatingActionButton 
          type="issue"
          onClick={handleCreateIssue}
          isVisible={true}
        />
      )}
    </div>
  );
};