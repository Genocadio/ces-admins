import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MessageCircle, 
  AlertCircle, 
  Paperclip, 
  ThumbsUp, 
  ThumbsDown,
  Clock,
  MapPin,
  Tag,
  Reply
} from 'lucide-react';
import { Issue, Leader, ResponseResponseDto, ResponseStatus, PostType, CommentRequestDto, IssueStatus, Urgency, Level, LeaderSearchResponseDto } from '../types';
import { ResponseForm } from './ResponseForm';
import { ResponseCard } from './ResponseCard';
import { API_ENDPOINTS } from '../config/api';
import { formatRelativeTime } from '../utils/dateUtils';
import { adminAuthenticatedFetch } from '../utils/adminApiInterceptor';
import { useAdminAuth } from '../contexts/AdminAuthContext';

interface AdminIssueDetailProps {
  issue: Issue;
  currentLeader: Leader;
  onBack: () => void;
  onIssueUpdate?: (updatedIssue: Issue) => void;
}

export const AdminIssueDetail: React.FC<AdminIssueDetailProps> = ({
  issue,
  currentLeader,
  onBack,
  onIssueUpdate
}) => {
  const { forceLogout } = useAdminAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentsPage, setCommentsPage] = useState(0);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const pageSize = 20;
  const [responses, setResponses] = useState<ResponseResponseDto[]>(() => {
    // Sort initial responses by creation date (newest first)
    if (issue.responses && issue.responses.length > 0) {
      return [...issue.responses].sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA; // Newest first
      });
    }
    return [];
  });
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [showAllResponses, setShowAllResponses] = useState(false);

  // Admin action states
  const [selectedStatus, setSelectedStatus] = useState<IssueStatus | ''>('');
  const [selectedUrgency, setSelectedUrgency] = useState<Urgency | ''>('');
  const [escalationLevel, setEscalationLevel] = useState<Level>('DISTRICT');
  const [selectedLeader, setSelectedLeader] = useState<string>('');
  const [leaders, setLeaders] = useState<LeaderSearchResponseDto[]>([]);
  const [isLoadingLeaders, setIsLoadingLeaders] = useState(false);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Check if more responses can be added
  const canAddMoreResponses = () => {
    if (responses.length === 0) return true;
    
    const lastResponse = responses[responses.length - 1];
    return lastResponse.status === ResponseStatus.FOLLOW_UP || 
           lastResponse.status === ResponseStatus.IN_PROGRESS;
  };

  // Get responses to display (collapsed or all)
  const getDisplayResponses = () => {
    if (responses.length === 0) return [];
    if (showAllResponses) return responses;
    return [responses[0]]; // Show only the latest (first in array since newest first)
  };

  // Search leaders for escalation with debouncing
  const searchLeaders = async (name?: string) => {
    if (!name || name.trim().length < 2) {
      setLeaders([]);
      return;
    }

    try {
      setIsLoadingLeaders(true);
      const response = await adminAuthenticatedFetch(
        API_ENDPOINTS.LEADERS.SEARCH(name.trim(), escalationLevel),
        {},
        forceLogout
      );

      if (!response) {
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setLeaders(data || []);
      }
    } catch (error) {
      console.error('Error searching leaders:', error);
    } finally {
      setIsLoadingLeaders(false);
    }
  };

  // Debounced search function
  const debouncedSearch = (() => {
    let timeoutId: NodeJS.Timeout;
    return (name: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => searchLeaders(name), 300);
    };
  })();

  // Update issue status
  const updateIssueStatus = async () => {
    if (!selectedStatus) return;
    
    try {
      setIsUpdating(true);
      const response = await adminAuthenticatedFetch(
        `${API_ENDPOINTS.ISSUES.UPDATE_STATUS(issue.id.toString())}?status=${selectedStatus}`,
        { method: 'PATCH' },
        forceLogout
      );

      if (!response) {
        return;
      }

      if (response.ok) {
        const updatedIssue = await response.json();
        if (onIssueUpdate) {
          onIssueUpdate(updatedIssue);
        }
        // Update local state without page reload
        setSelectedStatus('');
        // Update the issue object with new data
        Object.assign(issue, updatedIssue);
      }
    } catch (error) {
      console.error('Error updating issue status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Update issue urgency
  const updateIssueUrgency = async () => {
    if (!selectedUrgency) return;
    
    try {
      setIsUpdating(true);
      const response = await adminAuthenticatedFetch(
        `${API_ENDPOINTS.ISSUES.UPDATE_URGENCY(issue.id.toString())}?urgency=${selectedUrgency}`,
        { method: 'PATCH' },
        forceLogout
      );

      if (!response) {
        return;
      }

      if (response.ok) {
        const updatedIssue = await response.json();
        if (onIssueUpdate) {
          onIssueUpdate(updatedIssue);
        }
        // Update local state without page reload
        setSelectedUrgency('');
        // Update the issue object with new data
        Object.assign(issue, updatedIssue);
      }
    } catch (error) {
      console.error('Error updating issue urgency:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Escalate issue
  const escalateIssue = async () => {
    try {
      setIsUpdating(true);
      const params = new URLSearchParams({
        level: escalationLevel
      });
      if (selectedLeader) {
        params.append('userId', selectedLeader);
      }

      const response = await adminAuthenticatedFetch(
        `${API_ENDPOINTS.ISSUES.ESCALATE(issue.id.toString())}?${params.toString()}`,
        { method: 'PATCH' },
        forceLogout
      );

      if (!response) {
        return;
      }

      if (response.ok) {
        const updatedIssue = await response.json();
        if (onIssueUpdate) {
          onIssueUpdate(updatedIssue);
        }
        // Update local state without page reload
        setShowEscalationModal(false);
        setSelectedLeader('');
        // Update the issue object with new data
        Object.assign(issue, updatedIssue);
      }
    } catch (error) {
      console.error('Error escalating issue:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Set initial escalation level based on current leader's level
  useEffect(() => {
    if (currentLeader) {
      // Set escalation level to next level up
      switch (currentLeader.level) {
        case 'cell':
          setEscalationLevel('SECTOR');
          break;
        case 'sector':
          setEscalationLevel('DISTRICT');
          break;
        case 'district':
          setEscalationLevel('DISTRICT'); // Can't escalate higher
          break;
        default:
          setEscalationLevel('DISTRICT');
      }
    }
  }, [currentLeader]);

  // Refresh responses from API (useful for getting latest data)
  const refreshResponses = async () => {
    try {
      const response = await adminAuthenticatedFetch(
        `${API_ENDPOINTS.ISSUES.GET_BY_ID(issue.id.toString())}`,
        {},
        forceLogout
      );

      if (!response) {
        // 401 error occurred, user will be redirected to login
        return;
      }

      if (response.ok) {
        const updatedIssue = await response.json();
        // Sort responses by creation date (newest first)
        const sortedResponses = (updatedIssue.responses || []).sort((a: ResponseResponseDto, b: ResponseResponseDto) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA; // Newest first
        });
        setResponses(sortedResponses);
      }
    } catch (error) {
      console.error('Error refreshing responses:', error);
    }
  };

  // Get the current language from the issue
  const getCurrentLanguage = () => {
    return issue.language || 'ENGLISH';
  };

  // Use the shared date utility function
  const formatDate = (dateString: string) => {
    return formatRelativeTime(dateString);
  };

  // Fetch comments when needed
  const fetchComments = async (page: number = 0, append: boolean = false) => {
    if (isLoadingComments) return;
    
    setIsLoadingComments(true);
    try {
      const url = API_ENDPOINTS.COMMENTS.GET_BY_POST(issue.id, PostType.ISSUE, page, pageSize);
      console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL);
      console.log('Fetching comments from:', url);
      
      const response = await adminAuthenticatedFetch(
        url,
        {},
        forceLogout
      );

      if (!response) {
        // 401 error occurred, user will be redirected to login
        return;
      }

              if (response.ok) {
          const data = await response.json();
          console.log('Comments response data:', data);
          
          if (append) {
            setComments(prev => [...prev, ...(data.content || [])]);
          } else {
            setComments(data.content || []);
          }
          
          setCommentsPage(page);
          setHasMoreComments(!data.last);
        } else {
        console.error('Failed to fetch comments, status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        if (!append) {
          setComments([]);
        }
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      if (!append) {
        setComments([]);
      }
    } finally {
      setIsLoadingComments(false);
    }
  };

  // Handle comment submission
  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const commentData: CommentRequestDto = {
        text: newComment.trim(),
        isPrivate: false,
        userId: parseInt(currentLeader.id),
        postId: issue.id,
        postType: PostType.ISSUE
      };

      console.log('Creating comment with data:', commentData);
      console.log('Using endpoint:', API_ENDPOINTS.COMMENTS.CREATE);

      const response = await adminAuthenticatedFetch(
        API_ENDPOINTS.COMMENTS.CREATE,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(commentData)
        },
        forceLogout
      );

      if (!response) {
        // 401 error occurred, user will be redirected to login
        return;
      }

      if (response.ok) {
        const newCommentData = await response.json();
        console.log('Comment created successfully:', newCommentData);
        // Add new comment to the beginning of the list immediately
        setComments(prev => [newCommentData, ...prev]);
        setNewComment('');
        setReplyingTo(null);
        setReplyText('');
        // Refresh comments to get updated counts and ensure consistency
        fetchComments(0);
      } else {
        console.error('Failed to create comment, status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Handle comment voting with proper upvote/downvote logic
  const handleVoteComment = async (commentId: number, voteType: 'up' | 'down') => {
    try {
      // Find the comment to check current voting state
      const findComment = (comments: any[], targetId: number): any => {
        for (const comment of comments) {
          if (comment.id === targetId) return comment;
          if (comment.children) {
            const found = findComment(comment.children, targetId);
            if (found) return found;
          }
        }
        return null;
      };

      const comment = findComment(comments, commentId);
      if (!comment) return;

      // Determine the action based on current voting state
      let method = 'POST';
      let endpoint = '';

      if (voteType === 'up') {
        if (comment.hasvoted && comment.upvotes > 0) {
          // Already upvoted, remove upvote
          method = 'DELETE';
        }
        endpoint = API_ENDPOINTS.COMMENTS.UPVOTE(commentId.toString());
      } else {
        if (comment.hasvoted && comment.downvotes > 0) {
          // Already downvoted, remove downvote
          method = 'DELETE';
        }
        endpoint = API_ENDPOINTS.COMMENTS.DOWNVOTE(commentId.toString());
      }

      const response = await adminAuthenticatedFetch(
        endpoint,
        {
          method,
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
        // Update the comment locally with new voting data
        const updatedCommentData = await response.json();
        
        // Recursively update the comment in the state
        const updateCommentInState = (commentList: any[], targetId: number, updatedData: any): any[] => {
          return commentList.map(comment => {
            if (comment.id === targetId) {
              return updatedData;
            }
            if (comment.children) {
              return { ...comment, children: updateCommentInState(comment.children, targetId, updatedData) };
            }
            return comment;
          });
        };

        setComments(prev => updateCommentInState(prev, commentId, updatedCommentData));
      }
    } catch (error) {
      console.error('Error voting on comment:', error);
    }
  };

  // Handle comment reply (to main comments or replies)
  const handleReply = async (parentCommentId: number) => {
    if (!replyText.trim()) return;
    if (!currentLeader) {
      console.error('Leader must be authenticated to reply');
      return;
    }

    try {
      const replyData: CommentRequestDto = {
        text: replyText.trim(),
        isPrivate: false,
        userId: parseInt(currentLeader.id),
        postId: parentCommentId,
        postType: PostType.COMMENT,
      };

      console.log('Creating reply with data:', replyData);

      const response = await adminAuthenticatedFetch(
        API_ENDPOINTS.COMMENTS.CREATE,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(replyData)
        },
        forceLogout
      );

      if (!response) {
        // 401 error occurred, user will be redirected to login
        return;
      }

      if (response.ok) {
        const newReplyData = await response.json();
        console.log('Reply created successfully:', newReplyData);
        
        // Recursively find and update the correct parent comment at any nesting level
        setComments(prev => prev.map(comment => {
          // Check if it's a reply to a main comment
          if (comment.id === parentCommentId) {
            return { ...comment, children: [...(comment.children || []), newReplyData] };
          }
          // Recursively search through all nesting levels
          if (comment.children) {
            const updatedChildren = updateCommentChildren(comment.children, parentCommentId, newReplyData);
            if (updatedChildren !== comment.children) {
              return { ...comment, children: updatedChildren };
            }
          }
          return comment;
        }));
        
        setReplyText('');
        setReplyingTo(null);
        // Refresh comments to get updated counts
        fetchComments(0);
      } else {
        console.error('Failed to create reply, status:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
      }
    } catch (error) {
      console.error('Error creating reply:', error);
    }
  };

  // Load more comments
  const loadMoreComments = () => {
    if (hasMoreComments && !isLoadingComments) {
      fetchComments(commentsPage + 1, true);
    }
  };

  // Helper function to recursively update comment children at any nesting level
  const updateCommentChildren = (children: any[], targetId: number, newReply: any): any[] => {
    return children.map(child => {
      if (child.id === targetId) {
        return { ...child, children: [...(child.children || []), newReply] };
      }
      if (child.children) {
        const updatedChildren = updateCommentChildren(child.children, targetId, newReply);
        if (updatedChildren !== child.children) {
          return { ...child, children: updatedChildren };
        }
      }
      return child;
    });
  };

  // Recursive comment rendering function for unlimited nesting
  const renderComment = (comment: any, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''} mb-4`}>
      <div className="flex items-start space-x-3">
        <div className={`${isReply ? 'w-6 h-6' : 'w-8 h-8'} bg-blue-500 rounded-full flex items-center justify-center text-white ${isReply ? 'text-xs' : 'text-sm'} font-medium`}>
          {comment.user?.firstName?.charAt(0) || 'U'}
        </div>
        <div className="flex-1">
          <div className={`${isReply ? 'bg-white border border-gray-200' : 'bg-gray-50'} rounded-lg p-3`}>
            <div className="flex items-center justify-between mb-2">
              <span className={`font-medium ${isReply ? 'text-xs' : 'text-sm'} text-gray-900`}>
                {comment.user?.firstName} {comment.user?.lastName}
              </span>
              <span className={`text-xs text-gray-500`}>
                {formatDate(comment.createdAt)}
              </span>
            </div>
            <p className={`${isReply ? 'text-xs' : 'text-sm'} text-gray-700 mb-3`}>{comment.content}</p>
            
            {/* Comment Actions - Voting and Reply */}
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <button
                onClick={() => handleVoteComment(comment.id, 'up')}
                className={`flex items-center space-x-1 transition-colors ${
                  comment.hasvoted && comment.upvotes > 0 
                    ? 'text-green-600 bg-green-50 px-2 py-1 rounded' 
                    : 'hover:text-green-600'
                }`}
              >
                <ThumbsUp size={isReply ? 10 : 12} />
                <span>{comment.upvotes || 0}</span>
              </button>
              <button
                onClick={() => handleVoteComment(comment.id, 'down')}
                className={`flex items-center space-x-1 transition-colors ${
                  comment.hasvoted && comment.downvotes > 0 
                    ? 'text-red-600 bg-red-50 px-2 py-1 rounded' 
                    : 'hover:text-red-600'
                }`}
              >
                <ThumbsDown size={isReply ? 10 : 12} />
                <span>{comment.downvotes || 0}</span>
              </button>
              
              {/* Reply Button */}
              <button
                onClick={() => {
                  if (replyingTo === comment.id) {
                    setReplyingTo(null);
                    setReplyText('');
                  } else {
                    setReplyingTo(comment.id);
                    setReplyText('');
                  }
                }}
                className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
              >
                <Reply size={isReply ? 10 : 12} />
                <span>Reply</span>
              </button>
            </div>
          </div>
          
          {/* Reply Form */}
          {replyingTo === comment.id && (
            <div className="mt-3 flex space-x-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${isReply ? 'text-xs' : 'text-sm'}`}
              />
              <button
                onClick={() => handleReply(comment.id)}
                disabled={!replyText.trim()}
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors ${isReply ? 'text-xs' : 'text-sm'}`}
              >
                Reply
              </button>
            </div>
          )}
          
          {/* Render children (replies) - Recursive for unlimited nesting */}
          {comment.children && comment.children.length > 0 && (
            <div className="mt-3">
              {comment.children.map((child: any) => renderComment(child, true))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'RECEIVED':
        return '📥';
      case 'ESCALATED':
        return '📤';
      case 'WAITING_FOR_USER_RESPONSE':
        return '⏳';
      case 'CLOSED':
        return '🔒';
      case 'OVERDUE':
        return '⚠️';
      case 'RESOLVED':
        return '✅';
      default:
        return '❓';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'RECEIVED':
        return 'bg-blue-100 text-blue-800';
      case 'ESCALATED':
        return 'bg-purple-100 text-purple-800';
      case 'WAITING_FOR_USER_RESPONSE':
        return 'bg-yellow-100 text-yellow-800';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-800';
      case 'OVERDUE':
        return 'bg-red-100 text-red-800';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency?.toUpperCase()) {
      case 'LOW':
        return 'bg-gray-100 text-gray-800';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800';
      case 'URGENT':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleResponseCreated = async (newResponse: ResponseResponseDto) => {
    // Add the new response to the local state immediately at the top (latest first)
    setResponses(prev => [newResponse, ...prev]);
    setShowResponseForm(false);
    
    // Also update the issue object to include the new response
    // This ensures the response count and other related data stays in sync
    const updatedIssue = {
      ...issue,
      responses: [newResponse, ...responses]
    };
    
    // Notify parent component about the update
    if (onIssueUpdate) {
      onIssueUpdate(updatedIssue);
    }
  };

  const handleResponseUpdated = async (responseId: number, updatedResponse: ResponseResponseDto) => {
    // Update the specific response in the local state
    setResponses(prev => prev.map(response => 
      response.id === responseId ? updatedResponse : response
    ));
  };

  // Fetch comments when component mounts
  useEffect(() => {
    refreshResponses();
    // Clear reply state when issue changes
    setReplyingTo(null);
    setReplyText('');
  }, [issue.id]);

  // Fetch comments when showComments changes
  useEffect(() => {
    if (showComments && comments.length === 0) {
      fetchComments(0);
    }
  }, [showComments]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 mb-6"
      >
        <ArrowLeft size={20} />
        <span>Back to Issues</span>
      </button>

      {/* Issue Details */}
      <div className="bg-white border-2 border-blue-200 rounded-lg shadow-lg p-6 mb-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{issue.title}</h1>
            <p className="text-gray-600 mb-4">{issue.description}</p>
          </div>
        </div>

        {/* Issue Metadata */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-500">Status</div>
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
              <span className="mr-1">{getStatusIcon(issue.status)}</span>
              {issue.status?.replace('_', ' ') || 'Unknown'}
            </div>
          </div>
          
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-500">Urgency</div>
            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(issue.urgency)}`}>
              {issue.urgency || 'Unknown'}
            </div>
          </div>
          
          {issue.category && (
            <div className="text-center p-3 bg-gray-50 rounded">
              <div className="text-sm text-gray-500">Category</div>
              <div className="font-medium">{issue.category}</div>
            </div>
          )}
          
          <div className="text-center p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-500">Level</div>
            <div className="font-medium">{issue.level || 'Unknown'}</div>
          </div>
        </div>

        {/* Issue Info */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock size={16} />
            <span>Created: {issue.createdAt ? formatDate(issue.createdAt) : 'Unknown date'}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <MapPin size={16} />
            <span>
              {issue.location?.district || 'Unknown District'}
              {issue.location?.sector ? `, ${issue.location.sector}` : ''}
              {issue.location?.cell ? `, ${issue.location.cell}` : ''}
            </span>
          </div>
          
          {issue.ticketId && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Tag size={16} />
              <span>Ticket ID: {issue.ticketId}</span>
            </div>
          )}
          
          {issue.attachments && issue.attachments.length > 0 && (
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Paperclip size={16} />
              <span>{issue.attachments.length} attachment{issue.attachments.length !== 1 ? 's' : ''}</span>
            </div>
          )}
        </div>

        {/* Creator Info */}
        {issue.createdBy && (
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
              {issue.createdBy.firstName?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="font-medium">
                {issue.createdBy.firstName} {issue.createdBy.lastName}
              </div>
              <div className="text-sm text-gray-500">
                {issue.createdBy.role?.name || 'User'}
              </div>
            </div>
          </div>
        )}

        {/* Assignment Info */}
        {issue.assignedTo && (
          <div className="flex items-center space-x-3 p-3 bg-green-50 rounded border border-green-200 mt-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-medium">
              {issue.assignedTo.firstName?.charAt(0) || 'A'}
            </div>
            <div>
              <div className="font-medium text-green-800">
                Assigned to: {issue.assignedTo.firstName} {issue.assignedTo.lastName}
              </div>
              <div className="text-sm text-green-600">
                Role: {issue.assignedTo.role ? 
                  issue.assignedTo.role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) : 
                  'Leader'
                }
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comments Section - Moved Above Responses */}
      <div className="bg-white border-2 border-blue-200 rounded-lg shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-semibold text-gray-900">Comments</h2>
          </div>
          <button
            onClick={() => {
              if (!showComments && comments.length === 0) {
                fetchComments(0);
              }
              setShowComments(!showComments);
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {showComments ? 'Hide' : 'Show'} Comments
          </button>
        </div>

        {showComments && (
          <div className="space-y-4">
            {/* Add Comment Form */}
            <form onSubmit={handleComment} className="space-y-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment about this issue..."
                className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                disabled={isSubmittingComment}
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmittingComment}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmittingComment ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Posting...</span>
                    </div>
                  ) : (
                    'Post Comment'
                  )}
                </button>
              </div>
            </form>

            {/* Comments List */}
            {isLoadingComments && comments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p>Loading comments...</p>
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => renderComment(comment, false))}
                
                {/* Load More Button */}
                {hasMoreComments && (
                  <button
                    onClick={loadMoreComments}
                    disabled={isLoadingComments}
                    className="w-full py-3 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    {isLoadingComments ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span>Loading more comments...</span>
                      </div>
                    ) : (
                      'Load More'
                    )}
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No comments yet. Be the first to comment on this issue!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Responses Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-semibold text-gray-900">Responses</h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {responses.length} response{responses.length !== 1 ? 's' : ''}
            </span>
            <span className="text-sm text-gray-500">
              {responses.length > 1 && !showAllResponses 
                ? `(showing latest of ${responses.length})`
                : '(newest first)'
              }
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={refreshResponses}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
            {canAddMoreResponses() && (
              <button
                onClick={() => setShowResponseForm(!showResponseForm)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {showResponseForm ? 'Cancel' : 'Add Response'}
              </button>
            )}
          </div>
        </div>

        {/* Response Form */}
        {showResponseForm && canAddMoreResponses() && (
          <ResponseForm
            issueId={issue.id}
            onResponseCreated={handleResponseCreated}
            currentLanguage={getCurrentLanguage()}
          />
        )}

        {/* Responses List */}
        {responses.length > 0 ? (
          <div className="space-y-4">
            {getDisplayResponses().map((response) => (
              <ResponseCard
                key={response.id}
                response={response}
                onResponseUpdated={handleResponseUpdated}
              />
            ))}
            
            {/* Show More/Less Button */}
            {responses.length > 1 && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setShowAllResponses(!showAllResponses)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {showAllResponses ? (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                      Show Less
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                      Show {responses.length - 1} More Response{responses.length - 1 !== 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No responses yet</p>
            {canAddMoreResponses() && (
              <p className="text-sm mt-2">Be the first to respond to this issue</p>
            )}
          </div>
        )}

        {/* Response Status Info */}
        {responses.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center space-x-2">
              <AlertCircle size={16} className="text-blue-600" />
              <span className="text-sm text-blue-800 font-medium">Response Status</span>
            </div>
            <p className="text-sm text-blue-700 mt-1">
              {canAddMoreResponses() 
                ? 'You can add more responses to this issue.'
                : 'This issue has been fully responded to. No more responses are needed.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Admin Actions Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Admin Actions</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Update Status */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Update Status
            </label>
            <select
              id="status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as IssueStatus | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Status</option>
              <option value="RECEIVED">Received</option>
              <option value="ESCALATED">Escalated</option>
              <option value="WAITING_FOR_USER_RESPONSE">Waiting for User Response</option>
              <option value="CLOSED">Closed</option>
              <option value="OVERDUE">Overdue</option>
              <option value="RESOLVED">Resolved</option>
            </select>
            {selectedStatus && (
              <button
                onClick={updateIssueStatus}
                disabled={isUpdating}
                className="mt-2 w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Updating...' : 'Update Status'}
              </button>
            )}
          </div>

          {/* Update Urgency */}
          <div>
            <label htmlFor="urgency" className="block text-sm font-medium text-gray-700 mb-2">
              Update Urgency
            </label>
            <select
              id="urgency"
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value as Urgency | '')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Urgency</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="URGENT">Urgent</option>
            </select>
            {selectedUrgency && (
              <button
                onClick={updateIssueUrgency}
                disabled={isUpdating}
                className="mt-2 w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Updating...' : 'Update Urgency'}
              </button>
            )}
          </div>

          {/* Escalate Issue */}
          <div className="flex items-end">
            <button 
              onClick={() => setShowEscalationModal(true)}
              className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Escalate Issue
            </button>
          </div>
        </div>
      </div>

      {/* Escalation Modal */}
      {showEscalationModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Escalate Issue</h3>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="escalationLevel" className="block text-sm font-medium text-gray-700 mb-2">
                    Escalate to Level
                  </label>
                  <select
                    id="escalationLevel"
                    value={escalationLevel}
                    onChange={(e) => setEscalationLevel(e.target.value as Level)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="CELL">Cell Level</option>
                    <option value="SECTOR">Sector Level</option>
                    <option value="DISTRICT">District Level</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="leaderSearch" className="block text-sm font-medium text-gray-700 mb-2">
                    Assign to Leader (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="leaderSearch"
                      placeholder="Search leader by name..."
                      onChange={(e) => debouncedSearch(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                    />
                    {isLoadingLeaders && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>
                  
                  {leaders.length > 0 && (
                    <div className="mt-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md">
                      {leaders.map((leader) => (
                        <div
                          key={leader.userId}
                          onClick={() => setSelectedLeader(leader.userId.toString())}
                          className={`p-3 cursor-pointer hover:bg-gray-100 border-b border-gray-100 last:border-b-0 ${
                            selectedLeader === leader.userId.toString() ? 'bg-blue-100' : ''
                          }`}
                        >
                          <div className="text-sm font-medium text-gray-900">
                            {leader.fullName || `${leader.firstName} ${leader.lastName}`}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{leader.leadershipLevel}</span>
                              <span>•</span>
                              <span>{leader.leadershipPlaceName}</span>
                            </div>
                            <div className="text-gray-500 mt-1">
                              {leader.departmentName}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowEscalationModal(false)}
                    className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={escalateIssue}
                    disabled={isUpdating}
                    className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? 'Escalating...' : 'Escalate Issue'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminIssueDetail;
