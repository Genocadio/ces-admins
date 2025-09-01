import React, { useState } from 'react';
import { MessageCircle, TrendingUp, Plus, Filter, Search, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { TopicResponseDto, Leader, TopicRequestDto } from '../types';
import AdminTopicDetail from './AdminTopicDetail';
import { CreateTopicForm } from './CreateTopicForm';
import { TopicCard } from './TopicCard';
import FloatingActionButton from './FloatingActionButton';
import { API_ENDPOINTS } from '../config/api';
import { useTopics } from '../hooks/useTopics';
import { useTopicInteractions } from '../hooks/useTopicInteractions';
import { createAdminAuthenticatedFetch } from '../utils/adminApiInterceptor';

interface AdminTopicsListProps {
  currentLeader: Leader;
}

type FilterType = 'all' | 'my_region' | 'my_topics' | 'trending';
type SortType = 'newest' | 'popular' | 'most_replies' | 'most_followers';

const AdminTopicsList: React.FC<AdminTopicsListProps> = ({ currentLeader }) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<TopicResponseDto | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Get topic interaction functions for admin
  const { upvoteTopic, downvoteTopic, followTopic } = useTopicInteractions({ 
    isAdmin: true, 
    onUnauthorized: undefined // Admin 401 handling is managed by page reload
  });

  // Fetch topics from API
  const {
    topics,
    isLoading,
    error,
    totalPages,
    totalElements,
    currentPage,
    hasNext,
    hasPrevious,
    refetch,
    fetchNextPage,
    fetchPreviousPage,
    goToPage
  } = useTopics({
    page: 0,
    size: 20,
    sortBy: sortBy === 'newest' ? 'createdAt' : sortBy === 'popular' ? 'upvoteCount' : 'replycount',
    sortDir: 'desc',
    enabled: true
  });

  // Filter topics based on leader's level and location
  const getFilteredTopics = () => {
    let filtered = [...topics];

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(topic =>
        topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        topic.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Apply regional filter
    switch (filter) {
      case 'my_region':
        filtered = filtered.filter(topic => {
          if (!topic.focusLocation) return true;
          
          const { district, sector, cell } = topic.focusLocation;
          const leaderLocation = currentLeader.location;
          
          // Check if topic is in leader's region
          if (leaderLocation.district && district && leaderLocation.district !== district) {
            return false;
          }
          if (leaderLocation.sector && sector && leaderLocation.sector !== sector) {
            return false;
          }
          if (leaderLocation.cell && cell && leaderLocation.cell !== cell) {
            return false;
          }
          return true;
        });
        break;
      case 'my_topics':
        filtered = filtered.filter(topic => topic.createdBy.id === parseInt(currentLeader.id));
        break;
      case 'trending':
        filtered = filtered.filter(topic => 
          topic.upvoteCount > 10 || topic.replycount > 5
        );
        break;
      default:
        break;
    }

    return filtered;
  };

  const filteredTopics = getFilteredTopics();

  const handleCreateTopic = () => {
    setShowCreateForm(true);
  };

  const handleForceLogout = () => {
    console.log('Admin force logout triggered');
    // Clear admin tokens and redirect to admin login
    localStorage.removeItem('adminAuthTokens');
    localStorage.removeItem('currentAdminLeader');
    window.location.href = '/';
  };

  const handleTopicSubmit = async (topicData: TopicRequestDto) => {
    try {
      const adminFetch = createAdminAuthenticatedFetch(handleForceLogout);
      
      const response = await adminFetch(API_ENDPOINTS.TOPICS.CREATE, {
        method: 'POST',
        body: JSON.stringify(topicData)
      });

      if (!response) {
        // Response is null when 401 is handled by interceptor
        return;
      }

      if (response.ok) {
        const createdTopic = await response.json();
        console.log('Topic created successfully:', createdTopic);
        setShowCreateForm(false);
        // Refresh the topics list to show the new topic
        refetch();
      } else {
        console.error('Failed to create topic:', response.statusText);
      }
    } catch (error) {
      console.error('Error creating topic:', error);
    }
  };

  const handleTopicClick = (topic: TopicResponseDto) => {
    setSelectedTopic(topic);
  };

  const handleBackToList = () => {
    setSelectedTopic(null);
    setShowCreateForm(false);
  };

  const handleVote = async (type: 'up' | 'down') => {
    if (!currentLeader || !selectedTopic) return;
    
    try {
      if (type === 'up') {
        const updatedTopic = await upvoteTopic(selectedTopic.id);
        if (updatedTopic) {
          // Update the selected topic with new voting data
          setSelectedTopic(updatedTopic);
          // Refresh the topics list to get updated voting counts
          await refetch();
        }
      } else {
        const updatedTopic = await downvoteTopic(selectedTopic.id);
        if (updatedTopic) {
          // Update the selected topic with new voting data
          setSelectedTopic(updatedTopic);
          // Refresh the topics list to get updated voting counts
          await refetch();
        }
      }
    } catch (error) {
      console.error(`Failed to ${type}vote topic:`, error);
    }
  };

  const handleReply = (content: string, parentId?: string) => {
    // Implement reply logic for leaders
    console.log('Leader reply:', content, parentId);
  };

  const handleVoteReply = (replyId: string, type: 'up' | 'down') => {
    // Implement reply voting logic for leaders
    console.log('Leader vote reply:', replyId, type);
  };

  const handleFollow = async () => {
    if (!currentLeader || !selectedTopic) return;
    
    try {
      const updatedTopic = await followTopic(selectedTopic.id);
      if (updatedTopic) {
        // Update the selected topic with new following data
        setSelectedTopic(updatedTopic);
        // Refresh the topics list to get updated data
        await refetch();
        console.log('Topic follow status updated:', updatedTopic);
      }
    } catch (error) {
      console.error('Failed to follow/unfollow topic:', error);
    }
  };

  // If a topic is selected, show the detail view
  if (selectedTopic) {
    return (
      <AdminTopicDetail
        topic={selectedTopic}
        currentLeader={currentLeader}
        onBack={handleBackToList}
        onVote={handleVote}
        onReply={handleReply}
        onVoteReply={handleVoteReply}
        onFollow={handleFollow}
        isFollowing={false} // TODO: Implement follow status check when API supports it
      />
    );
  }

  // If create form is shown, show the create topic form
  if (showCreateForm) {
    return (
      <CreateTopicForm
        onClose={handleBackToList}
        onSubmit={handleTopicSubmit}
        isAdmin={true}
        currentUser={currentLeader}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Topics</h1>
          <p className="text-gray-600">
            Engage with your community through discussions and topics
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-2 border-blue-200 rounded-lg shadow-lg p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search topics and hashtags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as FilterType)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Topics</option>
              <option value="my_region">My Region</option>
              <option value="my_topics">My Topics</option>
              <option value="trending">Trending</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest</option>
              <option value="popular">Most Popular</option>
              <option value="most_replies">Most Replies</option>
              <option value="most_followers">Most Followers</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-3">
        <div>
          <p className="text-sm text-gray-600">
            {totalElements} topic{totalElements !== 1 ? 's' : ''} found
            {filter !== 'all' && ` (${filter.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())})`}
          </p>
        </div>
        {filter !== 'all' && (
          <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Filtered by {filter.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </div>
        )}
      </div>

      {/* Topics List */}
      <div className="space-y-4">
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12 bg-white border-2 border-blue-200 rounded-lg shadow-lg">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-500">Loading topics...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-12 bg-white border-2 border-blue-200 rounded-lg shadow-lg">
            <AlertCircle className="mx-auto h-8 w-8 text-red-600 mb-4" />
            <p className="text-red-600 mb-2">Failed to load topics</p>
            <p className="text-gray-500 text-sm mb-4">{error}</p>
            <button
              onClick={refetch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Topics List */}
        {!isLoading && !error && filteredTopics.length > 0 && (
          <>
                      {filteredTopics.map(topic => (
            <TopicCard
              key={topic.id}
              topic={topic}
              language="en" // TODO: Get language from admin context
              onClick={() => handleTopicClick(topic)}
              currentUser={currentLeader}
              isAdmin={true}
              onUnauthorized={undefined}
            />
          ))}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-6">
              <button
                onClick={fetchPreviousPage}
                disabled={!hasPrevious}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft size={16} />
              </button>
              
              <span className="px-3 py-2 text-sm text-gray-600">
                Page {currentPage + 1} of {totalPages}
              </span>
              
              <button
                onClick={fetchNextPage}
                disabled={!hasNext}
                className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredTopics.length === 0 && (
          <div className="text-center py-12 bg-white border-2 border-blue-200 rounded-lg shadow-lg">
            <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500 text-lg">
              {searchQuery.trim() 
                ? "No topics found matching your search." 
                : filter !== 'all'
                ? `No topics found for ${filter.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}.`
                : "No topics available."
              }
            </p>
          </div>
        )}
      </div>

      {/* Sidebar Stats */}
      <div className="lg:hidden mt-6">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp size={20} className="text-blue-600" />
            <h3 className="font-semibold text-gray-900">Quick Stats</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{totalElements}</div>
              <div className="text-sm text-gray-500">Total Topics</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {topics.filter(t => t.replycount > 5).length}
              </div>
              <div className="text-sm text-gray-500">Active Discussions</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating Action Button for creating topics */}
      <FloatingActionButton
        type="topic"
        onClick={handleCreateTopic}
        isVisible={true}
      />
    </div>
  );
};

export default AdminTopicsList;








