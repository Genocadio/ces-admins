import { useState, useEffect, useCallback } from 'react';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  ArrowUp, 
  MessageSquare, 
  Calendar,
  MapPin,
  MoreHorizontal,
  ThumbsUp,
  ThumbsDown,
  Filter,
  Search
} from 'lucide-react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { Issue, Comment, CommentRequestDto, PostType, IssueStatus } from '../types';
import { API_ENDPOINTS } from '../config/api';
import { adminAuthenticatedFetch } from '../utils/adminApiInterceptor';
import AdminIssueCard from './AdminIssueCard';
import AdminIssueDetail from './AdminIssueDetail';

type FilterType = 'all' | 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
type PriorityFilter = 'all' | 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

const AdminIssuesList = () => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrevious, setHasPrevious] = useState(false);
  const pageSize = 20;
  const { currentLeader, forceLogout } = useAdminAuth();

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Initial fetch when component mounts
  useEffect(() => {
    if (currentLeader) {
      fetchIssues(true); // Pass true for initial load
    }
  }, [currentLeader]);

  // Fetch issues when search term, filters, or page changes (but not on initial load)
  useEffect(() => {
    if (currentLeader && !loading) { // Only if we're not in initial loading state
      fetchIssues(false); // Pass false for search/filter operations
    }
  }, [debouncedSearchTerm, filter, priorityFilter, currentPage]);

  const fetchIssues = useCallback(async (isInitialLoad = false) => {
    try {
      // Only show full loading on initial load, use isSearching for search/filter operations
      if (isInitialLoad) {
        setLoading(true);
      } else {
        setIsSearching(true);
      }
      setError('');
      
      // Build search URL with parameters
      const params = new URLSearchParams({
        query: debouncedSearchTerm, // Always send the search term, even if empty
        page: currentPage.toString(),
        size: pageSize.toString(),
        sortBy: 'id',
        sortDir: 'desc'
      });

      // Add status filter if not 'all'
      if (filter !== 'all') {
        params.append('status', filter);
      }

      // Add urgency filter if not 'all' (assuming backend supports urgency parameter)
      if (priorityFilter !== 'all') {
        params.append('urgency', priorityFilter);
      }

      const searchUrl = `${API_ENDPOINTS.ISSUES.GET_ALL}/search?${params.toString()}`;
      
      const response = await adminAuthenticatedFetch(
        searchUrl,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        },
        forceLogout
      );

      if (!response) {
        // 401 error occurred, user will be redirected to login
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log('API Response data:', data);
        setIssues(data.content || []);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
        setHasNext(!data.last);
        setHasPrevious(!data.first);
        setCurrentPage(data.number || 0);
      } else {
        setError('Failed to fetch issues');
      }
    } catch (error) {
      console.error('Error fetching issues:', error);
      setError('Failed to fetch issues');
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, [currentLeader, debouncedSearchTerm, filter, priorityFilter, currentPage, forceLogout]);

  // Reset to first page when filters change
  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    setCurrentPage(0);
  };

  const handlePriorityFilterChange = (newPriorityFilter: PriorityFilter) => {
    setPriorityFilter(newPriorityFilter);
    setCurrentPage(0);
  };

  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
    setCurrentPage(0);
  };

  const handleNextPage = () => {
    if (hasNext) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (hasPrevious) {
      setCurrentPage(prev => prev - 1);
    }
  };

  if (!currentLeader) {
    return null;
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OPEN': return Clock;
      case 'IN_PROGRESS': return AlertCircle;
      case 'RESOLVED': return CheckCircle;
      case 'CLOSED': return CheckCircle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-gray-100 text-gray-800';
      case 'MEDIUM': return 'bg-blue-100 text-blue-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'URGENT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (selectedIssue) {
    // Get access token for the detail view
    const tokens = localStorage.getItem('adminAuthTokens');
    const accessToken = tokens ? JSON.parse(tokens).accessToken : '';
    
    return (
      <AdminIssueDetail 
        issue={selectedIssue}
        currentLeader={currentLeader}
        onBack={() => setSelectedIssue(null)}
        accessToken={accessToken}
        onIssueUpdate={(updatedIssue) => {
          // Update the issue in the local state
          setIssues(prev => prev.map(issue => 
            issue.id === updatedIssue.id ? updatedIssue : issue
          ));
          // Update the selected issue
          setSelectedIssue(updatedIssue);
        }}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading issues...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Issues</h3>
          <p className="text-red-600 mb-4">{error}</p>
                      <button
              onClick={() => fetchIssues(true)}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
            >
              Try Again
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Issues Management</h1>
          <p className="text-gray-600">
            Manage issues in your {currentLeader.leadershipLevelName || `${currentLeader.level} level`} jurisdiction
          </p>
        </div>
        <div className="text-sm text-gray-500">
          {issues.length} of {totalElements} issues (Page {currentPage + 1} of {totalPages})
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-2 border-blue-200 rounded-lg shadow-lg p-6">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <label className="block text-sm font-medium text-gray-700 mb-2">Search Issues</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search by title or description..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filter}
              onChange={(e) => handleFilterChange(e.target.value as FilterType)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => handlePriorityFilterChange(e.target.value as PriorityFilter)}
              className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>
        </div>
      </div>

      {/* Issues List */}
      <div className="space-y-4 relative">
        {/* Search Loading Indicator */}
        {isSearching && (
          <div className="absolute top-0 left-0 right-0 bg-blue-50 border border-blue-200 rounded-lg p-3 z-10">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm text-blue-600">Searching...</span>
            </div>
          </div>
        )}
        
        {/* Issues Content */}
        <div className={`${isSearching ? 'opacity-50 pointer-events-none' : ''} transition-opacity duration-200`}>
          {issues.length === 0 && !loading && !isSearching ? (
            <div className="bg-white border-2 border-blue-200 rounded-lg shadow-lg p-8 text-center">
              <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Issues Found</h3>
              <p className="text-gray-600">
                {searchTerm || filter !== 'all' || priorityFilter !== 'all' 
                  ? 'Try adjusting your filters or search terms.'
                  : 'No issues are currently assigned to your jurisdiction.'}
              </p>
            </div>
          ) : (
            issues.map((issue) => (
              <AdminIssueCard
                key={issue.id}
                issue={issue}
                currentLeader={currentLeader}
                onClick={() => setSelectedIssue(issue)}
              />
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className={`flex items-center justify-center space-x-4 mt-6 ${isSearching ? 'opacity-50 pointer-events-none' : ''} transition-opacity duration-200`}>
          <button
            onClick={handlePreviousPage}
            disabled={!hasPrevious || isSearching}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-600">
            Page {currentPage + 1} of {totalPages}
          </span>
          
          <button
            onClick={handleNextPage}
            disabled={!hasNext || isSearching}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminIssuesList;
