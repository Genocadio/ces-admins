import React, { useState, useEffect } from 'react';
import { MessageCircle, MoreHorizontal, ThumbsUp, ThumbsDown, UserPlus } from 'lucide-react';
import { TopicResponseDto } from '../types';
import { getTranslation } from '../i18n/translations';
import RegionalBadge from './RegionalBadge';
import { useTopicInteractions } from '../hooks/useTopicInteractions';

interface TopicCardProps {
  topic: TopicResponseDto;
  language: string;
  onClick: () => void;
  currentUser?: any;
  isAdmin?: boolean;
  onUnauthorized?: () => void;
}

export const TopicCard: React.FC<TopicCardProps> = ({ topic, language, onClick, currentUser, isAdmin = false, onUnauthorized }) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [upvoted, setUpvoted] = useState(false);
  const [downvoted, setDownvoted] = useState(false);
  const [localUpvotes, setLocalUpvotes] = useState(topic.upvoteCount);
  const [localDownvotes, setLocalDownvotes] = useState(topic.downvoteCount);
  
  const { upvoteTopic, downvoteTopic, followTopic } = useTopicInteractions({ 
    isAdmin, 
    onUnauthorized 
  });

  // Initialize voting state based on topic data
  useEffect(() => {
    // Use the new DTO properties to determine voting state
    setUpvoted(topic.hasUpvoted || false);
    setDownvoted(topic.hasDownvoted || false);
    setLocalUpvotes(topic.upvoteCount);
    setLocalDownvotes(topic.downvoteCount);
  }, [topic.hasUpvoted, topic.hasDownvoted, topic.upvoteCount, topic.downvoteCount]);

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    
    try {
      const updatedTopic = await followTopic(topic.id);
      setIsFollowing(!isFollowing);
      // Update local state with the response from API
      if (updatedTopic) {
        // You might want to update the parent component's topic list here
        console.log('Topic follow status updated:', updatedTopic);
      }
    } catch (error) {
      console.error('Failed to follow topic:', error);
      // Revert the UI state on error
      setIsFollowing(isFollowing);
    }
  };

  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    
    try {
      const updatedTopic = await upvoteTopic(topic.id);
      if (downvoted) {
        setDownvoted(false);
        setLocalDownvotes(prev => prev - 1);
      }
      if (upvoted) {
        setUpvoted(false);
        setLocalUpvotes(prev => prev - 1);
      } else {
        setUpvoted(true);
        setLocalUpvotes(prev => prev + 1);
      }
      
      // Update local state with the response from API
      if (updatedTopic) {
        setLocalUpvotes(updatedTopic.upvoteCount);
        setLocalDownvotes(updatedTopic.downvoteCount);
        console.log('Topic upvote updated:', updatedTopic);
      }
    } catch (error) {
      console.error('Failed to upvote topic:', error);
      // Revert the UI state on error
      if (upvoted) {
        setUpvoted(false);
        setLocalUpvotes(prev => prev - 1);
      } else {
        setUpvoted(true);
        setLocalUpvotes(prev => prev + 1);
      }
    }
  };

  const handleDownvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    
    try {
      const updatedTopic = await downvoteTopic(topic.id);
      if (upvoted) {
        setUpvoted(false);
        setLocalUpvotes(prev => prev - 1);
      }
      if (downvoted) {
        setDownvoted(false);
        setLocalDownvotes(prev => prev - 1);
      } else {
        setDownvoted(true);
        setLocalDownvotes(prev => prev + 1);
      }
      
      // Update local state with the response from API
      if (updatedTopic) {
        setLocalUpvotes(updatedTopic.upvoteCount);
        setLocalDownvotes(updatedTopic.downvoteCount);
        console.log('Topic downvote updated:', updatedTopic);
      }
    } catch (error) {
      console.error('Failed to downvote topic:', error);
      // Revert the UI state on error
      if (downvoted) {
        setDownvoted(false);
        setLocalDownvotes(prev => prev - 1);
      } else {
        setDownvoted(true);
        setLocalDownvotes(prev => prev + 1);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes < 1 ? getTranslation('justNow', language) : `${minutes}m`;
      }
      return `${hours}h`;
    }
    return `${days}d`;
  };

  // Safely get user initials
  const getUserInitials = () => {
    try {
      if (topic.createdBy) {
        const firstName = topic.createdBy.firstName || '';
        const lastName = topic.createdBy.lastName || '';
        
        if (firstName && lastName) {
          return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
        } else if (firstName) {
          return firstName.charAt(0).toUpperCase();
        } else if (lastName) {
          return lastName.charAt(0).toUpperCase();
        }
      }
      return '?';
    } catch (error) {
      console.error('Error getting user initials:', error);
      return '?';
    }
  };

  return (
    <div className="bg-white border-2 border-blue-200 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer shadow-lg">
      <div onClick={onClick} className="p-6">
        <div className="flex space-x-3">
          {topic.createdBy.profileUrl ? (
            <img
              src={topic.createdBy.profileUrl}
              alt={topic.createdBy.firstName + ' ' + topic.createdBy.lastName}
              className="w-10 h-10 rounded-full flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
              {getUserInitials()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <span className="font-semibold text-gray-900">
                {currentUser && currentUser.id === topic.createdBy.id ? 'You' : `${topic.createdBy.firstName} ${topic.createdBy.lastName}`}
              </span>
              <span className="text-gray-500 text-sm">·</span>
              <span className="text-gray-500 text-sm">{formatDate(topic.createdAt)}</span>
              <button className="ml-auto p-1 rounded-full hover:bg-gray-100 transition-colors">
                <MoreHorizontal size={16} className="text-gray-500" />
              </button>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {topic.title}
            </h3>
            <p className="text-gray-600 mb-2">
              {topic.description}
            </p>
            {topic.tags && topic.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {topic.tags.map(tag => (
                  <span key={tag} className="text-blue-600 hover:underline cursor-pointer">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            {topic.hashtags && topic.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-3">
                {topic.hashtags.map(hashtag => (
                  <span key={hashtag} className="text-blue-600 hover:underline cursor-pointer">
                    #{hashtag}
                  </span>
                ))}
              </div>
            )}
            {topic.regionalRestriction && (
              <div className="mb-3">
                <RegionalBadge regionalRestriction={topic.regionalRestriction} />
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Vote Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleUpvote}
                className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-colors ${
                  upvoted 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
                }`}
                title="Upvote"
              >
                <ThumbsUp size={16} />
                <span className="text-sm font-medium">{localUpvotes}</span>
              </button>
              
              <button
                onClick={handleDownvote}
                className={`flex items-center space-x-1 px-2 py-1 rounded-md transition-colors ${
                  downvoted 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                    : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
                }`}
                title="Downvote"
              >
                <ThumbsDown size={16} />
                <span className="text-sm font-medium">{localDownvotes}</span>
              </button>
            </div>

            {/* Reply Count */}
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onClick(); // Navigate to topic detail to see/add replies
              }}
              className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors"
            >
              <MessageCircle size={16} />
              <span className="text-sm">{topic.replycount}</span>
            </button>
          </div>

          {/* Follow Button - Only show for topics not created by current user */}
          {currentUser && currentUser.id !== topic.createdBy.id && (
            <button
              onClick={handleFollow}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isFollowing
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <UserPlus size={14} />
              <span>{isFollowing ? getTranslation('following', language) : getTranslation('follow', language)}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};