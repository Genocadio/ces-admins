import React, { useState } from 'react';
import { MessageCircle, Users, Clock, Tag, ExternalLink, Paperclip } from 'lucide-react';
import { Issue } from '../types';
import { VoteButton } from './VoteButton';
import { API_ENDPOINTS } from '../config/api';
import { getAuthHeaders } from '../utils/apiInterceptor';
import { useAuth } from '../contexts/AuthContext';
import { getTranslation } from '../i18n/translations';
import { formatRelativeTimeWithLanguage } from '../utils/dateUtils';

interface IssueCardProps {
  issue: Issue;
  language: string;
  onClick: () => void;
  currentUser?: any;
  onIssueUpdate?: (updatedIssue: Issue) => void;
}

const statusColors: { [key: string]: string } = {
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
};

const priorityColors: { [key: string]: string } = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

export const IssueCard: React.FC<IssueCardProps> = ({ issue, language, onClick, currentUser, onIssueUpdate }) => {
  const { refreshSession } = useAuth();
  const [localIssue, setLocalIssue] = useState(issue);
  const [isVoting, setIsVoting] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Debug: Log the issue data to see what's actually being returned
  console.log('IssueCard received issue:', issue);

  // Update local issue when prop changes
  React.useEffect(() => {
    setLocalIssue(issue);
  }, [issue]);

  // Helper function to check if current user is the issue owner
  const isIssueOwner = () => {
    if (!currentUser || !localIssue.createdBy) return false;
    return parseInt(currentUser.id) === localIssue.createdBy.id;
  };

  const handleVote = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when voting
    if (!currentUser || isVoting) return;

    console.log('Voting on issue card:', {
      issueId: localIssue.id,
      currentLikes: localIssue.likes,
      currentIsLiked: localIssue.likedByUser,
      method: localIssue.likedByUser ? 'DELETE' : 'POST'
    });

    setIsVoting(true);
    try {
      // Determine HTTP method based on current like state
      const method = localIssue.likedByUser ? 'DELETE' : 'POST';
      const endpoint = API_ENDPOINTS.ISSUES.LIKE(localIssue.id.toString());
      
      const headers = await getAuthHeaders(refreshSession);
      const response = await fetch(endpoint, {
        method,
        headers
      });

      if (response.ok) {
        const updatedIssueData = await response.json();
        console.log('Vote successful, updated issue data:', updatedIssueData);
        
        setLocalIssue(updatedIssueData);
        
        // Notify parent component if callback provided
        if (onIssueUpdate) {
          console.log('Notifying parent component of issue update');
          onIssueUpdate(updatedIssueData);
        }
      } else {
        console.error('Failed to update issue vote');
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
      }
    } catch (error) {
      console.error('Error voting on issue:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when following
    if (!currentUser || isFollowing) return;

    console.log('Following issue card:', {
      issueId: localIssue.id,
      currentFollowers: localIssue.followers,
      currentIsFollowed: localIssue.followedByUser,
      method: localIssue.followedByUser ? 'DELETE' : 'POST'
    });

    setIsFollowing(true);
    try {
      // Determine HTTP method based on current follow state
      const method = localIssue.followedByUser ? 'DELETE' : 'POST';
      const endpoint = API_ENDPOINTS.ISSUES.FOLLOW(localIssue.id.toString());
      
      const headers = await getAuthHeaders(refreshSession);
      const response = await fetch(endpoint, {
        method,
        headers
      });

      if (response.ok) {
        const updatedIssueData = await response.json();
        console.log('Follow successful, updated issue data:', updatedIssueData);
        
        setLocalIssue(updatedIssueData);
        
        // Notify parent component if callback provided
        if (onIssueUpdate) {
          console.log('Notifying parent component of follow update');
          onIssueUpdate(updatedIssueData);
        }
      } else {
        console.error('Failed to update issue follow');
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
      }
    } catch (error) {
      console.error('Error following issue:', error);
    } finally {
      setIsFollowing(false);
    }
  };

  // Use the shared date utility function
  const formatDate = (dateString: string) => {
    return formatRelativeTimeWithLanguage(dateString, language, getTranslation as (key: string, language: string) => string);
  };

  // Safely get user display name
  const getUserDisplayName = () => {
    try {
      if (issue.createdBy) {
        const firstName = issue.createdBy.firstName || '';
        const lastName = issue.createdBy.lastName || '';
        
        if (firstName && lastName) {
          return `${firstName} ${lastName}`;
        } else if (firstName) {
          return firstName;
        } else if (lastName) {
          return lastName;
        }
      }
      return 'Unknown User';
    } catch (error) {
      console.error('Error getting user display name:', error);
      return 'Unknown User';
    }
  };

  // Safely get user initials
  const getUserInitials = () => {
    try {
      if (issue.createdBy) {
        const firstName = issue.createdBy.firstName || '';
        const lastName = issue.createdBy.lastName || '';
        
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
    <div className="bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-all duration-200 cursor-pointer group">
      <div onClick={onClick} className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
              {localIssue.title || 'Untitled Issue'}
            </h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {localIssue.description || 'No description available'}
            </p>
          </div>
          <div className="ml-4">
            <VoteButton 
              votes={localIssue.likes || 0} 
              onVote={() => handleVote({} as React.MouseEvent)}
              currentUserId={currentUser?.id || ''}
              isLiked={localIssue.likedByUser || false}
              disabled={isVoting}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[localIssue.status] || 'bg-gray-100 text-gray-800'}`}>
            {localIssue.status ? localIssue.status.replace('_', ' ') : 'Unknown'}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {localIssue.level || 'Unknown'}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[localIssue.urgency] || 'bg-gray-100 text-gray-800'}`}>
            {localIssue.urgency || 'Unknown'}
          </span>
          {localIssue.category && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              <Tag size={12} className="mr-1" />
              {localIssue.category}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {issue.createdBy?.profileUrl ? (
                <img
                  src={issue.createdBy.profileUrl}
                  alt={getUserDisplayName()}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                  {getUserInitials()}
                </div>
              )}
              <span className="font-medium">
                {getUserDisplayName()}
              </span>
              {localIssue.createdBy?.role?.name === 'government_official' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  Government
                </span>
              )}
              
              {/* Follow button - only show if not the issue owner */}
              {!isIssueOwner() && currentUser && (
                <button
                  onClick={handleFollow}
                  disabled={isFollowing}
                  className={`ml-2 px-2 py-1 rounded text-xs font-medium transition-colors ${
                    localIssue.followedByUser
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${isFollowing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isFollowing ? '...' : localIssue.followedByUser ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <MessageCircle size={14} />
                <span>{localIssue.comments?.length || 0} comments</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users size={14} />
                <span>{localIssue.followers || 0} followers</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock size={14} />
            <span>{localIssue.createdAt ? formatDate(localIssue.createdAt) : 'Unknown date'}</span>
          </div>
        </div>

        {/* Location info */}
        {localIssue.location && (
          <div className="mt-3 flex items-center space-x-2 text-sm text-gray-500">
            <Tag size={14} />
            <span>
              {localIssue.location.district || 'Unknown District'}
              {localIssue.location.sector ? `, ${localIssue.location.sector}` : ''}
              {localIssue.location.cell ? `, ${localIssue.location.cell}` : ''}
            </span>
          </div>
        )}

        {/* Attachments indicator */}
        {localIssue.attachments && localIssue.attachments.length > 0 && (
          <div className="mt-3 flex items-center space-x-2 text-sm text-gray-500">
            <Paperclip size={14} />
            <span>{localIssue.attachments.length} attachment{localIssue.attachments.length !== 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Ticket ID */}
        {localIssue.ticketId && (
          <div className="mt-3 text-xs text-gray-400">
            Ticket: {localIssue.ticketId}
          </div>
        )}
      </div>
    </div>
  );
};