import React, { useState } from 'react';
import { MessageCircle, Loader2, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { TopicRequestDto, TopicResponseDto } from '../types';
import { TopicCard } from './TopicCard';
import { TopicDetail } from './TopicDetail';
import { getTranslation } from '../i18n/translations';
import FloatingActionButton from './FloatingActionButton';
import { CreateTopicForm } from './CreateTopicForm';
import { useAuth } from '../contexts/AuthContext';
import { useLoginPrompt } from '../contexts/LoginPromptContext';
import { API_ENDPOINTS } from '../config/api';
import { useTopics } from '../hooks/useTopics';
import { useTopicInteractions } from '../hooks/useTopicInteractions';
import { useTopicReplies } from '../hooks/useTopicReplies';
import { createAuthenticatedFetch } from '../utils/apiInterceptor';

interface TopicsSectionProps {
  language: string;
  currentUser?: any;
}

export const TopicsSection: React.FC<TopicsSectionProps> = ({ language, currentUser }) => {
  const [sortBy, setSortBy] = useState('newest');
  const [showMyTopicsOnly, setShowMyTopicsOnly] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<TopicResponseDto | null>(null);
  const [followingTopics, setFollowingTopics] = useState<Set<string>>(new Set());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { currentUser: authUser, logout, refreshSession } = useAuth();
  const { showLoginPrompt } = useLoginPrompt();
  
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

  // Filter topics based on user preferences
  const filteredTopics = topics.filter(topic => {
      // Filter by user ownership if enabled
    if (showMyTopicsOnly && topic.createdBy.id !== currentUser?.id) {
        return false;
      }
      
    // Filter by regional restrictions (if implemented in backend)
    // For now, show all topics
    return true;
  });



  const handleUnauthorized = () => {
    showLoginPrompt('Your session has expired. Please log in again to continue.');
  };

  const handleCreateTopic = () => {
    setShowCreateForm(true);
  };

  const handleCloseCreateForm = () => {
    setShowCreateForm(false);
  };

  const handleForceLogout = (reason?: string) => {
    console.log('Force logout triggered:', reason);
    logout();
    showLoginPrompt(reason || 'Your session has expired. Please log in again.');
  };

  const handleTopicSubmit = async (topicData: TopicRequestDto) => {
    try {
      const authenticatedFetch = createAuthenticatedFetch(handleForceLogout, refreshSession);
      
      const response = await authenticatedFetch(API_ENDPOINTS.TOPICS.CREATE, {
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
  };

  // Get topic interaction functions
  const { upvoteTopic, downvoteTopic } = useTopicInteractions({ 
    isAdmin: false, 
    onUnauthorized: handleUnauthorized 
  });

  const handleVote = async (type: 'up' | 'down') => {
    if (!currentUser || !selectedTopic) return;
    
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

  const handleFollow = () => {
    if (selectedTopic) {
      const newFollowing = new Set(followingTopics);
      const topicId = selectedTopic.id.toString();
      if (newFollowing.has(topicId)) {
        newFollowing.delete(topicId);
      } else {
        newFollowing.add(topicId);
      }
      setFollowingTopics(newFollowing);
    }
  };

  const handleReply = (content: string, parentId?: string) => {
    // Implement reply logic
    console.log('Reply:', content, parentId);
  };

  const handleVoteReply = async (replyId: string, type: 'up' | 'down') => {
    if (!currentUser || !selectedTopic) return;
    
    try {
      // For now, just log the vote - the actual voting will be handled by the TopicDetail component
      // which has access to the useTopicReplies hook
    console.log('Vote reply:', replyId, type);
    } catch (error) {
      console.error(`Failed to ${type}vote reply:`, error);
    }
  };

  // If a topic is selected, show the detail view
  if (selectedTopic) {
    return (
      <TopicDetail
        topic={selectedTopic}
        currentUser={currentUser}
        onBack={handleBackToList}
        onVote={handleVote}
        onReply={handleReply}
        onVoteReply={handleVoteReply}
        onFollow={handleFollow}
        isFollowing={followingTopics.has(selectedTopic.id.toString())}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {getTranslation('topics', language)}
            </h1>
            <p className="text-gray-600">
              Join community discussions and share your thoughts on various topics.
            </p>
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Discussions</h2>
          <div className="flex items-center space-x-4">
            {/* My Topics Toggle */}
            <label className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg bg-white cursor-pointer hover:bg-gray-50">
              <input
                type="checkbox"
                checked={showMyTopicsOnly}
                onChange={(e) => setShowMyTopicsOnly(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">My Topics Only</span>
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="newest">Newest</option>
              <option value="popular">Most Popular</option>
              <option value="mostReplies">Most Replies</option>
            </select>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">
              {totalElements} topic{totalElements !== 1 ? 's' : ''} found
              {showMyTopicsOnly && currentUser ? ` by ${currentUser.name}` : ''}
            </p>
          </div>
          {showMyTopicsOnly && (
            <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
              Showing only your topics
            </div>
          )}
        </div>

        {/* Topics List */}
        <div className="space-y-4">
          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-4" />
              <p className="text-gray-500">Loading topics...</p>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
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
                language={language}
                currentUser={currentUser}
                onClick={() => handleTopicClick(topic)}
                  isAdmin={false}
                  onUnauthorized={handleUnauthorized}
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
            <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
              <p className="text-gray-500 text-lg">
                {showMyTopicsOnly 
                  ? "You haven't created any topics yet." 
                  : "No topics found matching your criteria."
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Active Discussions */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <MessageCircle size={20} className="text-green-600" />
            <h3 className="font-semibold text-gray-900">Active Discussions</h3>
          </div>
          <div className="space-y-3">
            {topics.slice(0, 3).map(topic => (
              <div key={topic.id} className="cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
                <div className="text-sm font-medium text-gray-900 line-clamp-2">
                  {topic.title}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {topic.replycount} replies
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Action Button - only show for authenticated users */}
      {currentUser && (
        <FloatingActionButton
          type="topic"
          onClick={handleCreateTopic}
          isVisible={true}
        />
      )}

      {/* Create Topic Form */}
      {showCreateForm && (
        <CreateTopicForm
          onClose={handleCloseCreateForm}
          onSubmit={handleTopicSubmit}
          isAdmin={false}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};