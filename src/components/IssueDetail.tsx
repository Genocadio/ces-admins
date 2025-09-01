import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Tag, MapPin, MessageCircle, Send, Reply, Trash2, Paperclip, Clock, ThumbsUp, ThumbsDown, Star } from 'lucide-react';
import { Issue, User, Comment, CommentRequestDto, PostType, ResponseResponseDto, ResponseStatus } from '../types';
import { VoteButton } from './VoteButton';
import { AttachmentViewer } from './AttachmentViewer';
import { UserFollowUpResponseForm } from './UserFollowUpResponseForm';
import ResponseRatingPopup from './ResponseRatingPopup';
import { API_ENDPOINTS } from '../config/api';
import { getAuthHeaders } from '../utils/apiInterceptor';
import { useAuth } from '../contexts/AuthContext';
import { useResponseRating } from '../hooks/useResponseRating';

interface IssueDetailProps {
  issue: Issue;
  currentUser: User | null;
  onBack: () => void;
  onVote?: (issueId: number, type: 'like' | 'unlike') => void;
  onFollow?: (issueId: number, type: 'follow' | 'unfollow') => void;
  isFollowing?: boolean;
  onIssueUpdate?: (updatedIssue: Issue) => void;
}

export const IssueDetail: React.FC<IssueDetailProps> = ({
  issue: initialIssue,
  currentUser,
  onBack,
  onVote,
  onFollow,
  isFollowing,
  onIssueUpdate,
}) => {
  const { refreshSession } = useAuth();
  const { rateResponse, isLoading: isRatingLoading, error: ratingError } = useResponseRating();
  const [issue, setIssue] = useState(initialIssue);
  const [newComment, setNewComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  
  // Response comments state
  const [showResponseComments, setShowResponseComments] = useState(false);
  const [currentResponseId, setCurrentResponseId] = useState<number | null>(null);
  const [responseComments, setResponseComments] = useState<Comment[]>([]);
  const [newResponseComment, setNewResponseComment] = useState('');
  const [isVotingResponse, setIsVotingResponse] = useState(false);
  const [showAllResponses, setShowAllResponses] = useState(false);
  const [isVotingIssue, setIsVotingIssue] = useState(false);
  
  // Follow-up response form state
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [followUpResponseId, setFollowUpResponseId] = useState<number | null>(null);
  
  // Rating popup state
  const [showRatingPopup, setShowRatingPopup] = useState(false);
  const [responseToRate, setResponseToRate] = useState<ResponseResponseDto | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 20;

  // Fetch comments when component mounts or when showComments changes
  useEffect(() => {
    if (showComments && currentUser) {
      fetchComments(0); // Reset to first page when opening comments
    }
  }, [showComments, issue.id, currentUser]);

  // Clear reply state if user becomes unauthenticated
  useEffect(() => {
    if (!currentUser) {
      setReplyingTo(null);
      setReplyText('');
      setShowComments(false); // Close comments if user is not authenticated
      setShowResponseComments(false);
      setCurrentResponseId(null);
      setNewResponseComment('');
    }
  }, [currentUser]);

  // Clear response comment state when issue changes
  useEffect(() => {
    setShowResponseComments(false);
    setCurrentResponseId(null);
    setNewResponseComment('');
    setResponseComments([]);
    setShowFollowUpForm(false);
    setFollowUpResponseId(null);
    setShowRatingPopup(false);
    setResponseToRate(null);
  }, [issue.id]);

  // Update local issue state when prop changes
  useEffect(() => {
    setIssue(initialIssue);
  }, [initialIssue]);

  // Check for responses that need rating (resolved/rejected without rating)
  useEffect(() => {
    if (currentUser && issue.responses.length > 0) {
      const latestResponse = issue.responses[issue.responses.length - 1]; // Get the latest response
      
      // Check if the latest response is resolved/rejected and user hasn't rated it yet
      if ((latestResponse.status === 'RESOLVED' || latestResponse.status === 'REJECTED') && 
          latestResponse.averageRating === undefined && 
          !showRatingPopup) {
        // Show rating popup automatically after a short delay
        const timer = setTimeout(() => {
          setResponseToRate(latestResponse);
          setShowRatingPopup(true);
        }, 1000); // 1 second delay
        
        return () => clearTimeout(timer);
      }
    }
  }, [issue.responses, currentUser, showRatingPopup]);

  // Debug follow button logic
  useEffect(() => {
    if (currentUser && issue.createdBy) {
      console.log('Follow button debug:', {
        currentUserId: currentUser.id,
        issueCreatorId: issue.createdBy.id,
        currentUserIdType: typeof currentUser.id,
        issueCreatorIdType: typeof issue.createdBy.id,
        isOwner: parseInt(currentUser.id) === issue.createdBy.id,
        shouldShowFollow: parseInt(currentUser.id) !== issue.createdBy.id
      });
    }
  }, [currentUser, issue.createdBy]);

  // Debug issue state changes
  useEffect(() => {
            console.log('Issue state updated:', {
          id: issue.id,
          likes: issue.likes,
          likedByUser: issue.likedByUser,
          followers: issue.followers,
          followedByUser: issue.followedByUser
        });
      }, [issue.likes, issue.likedByUser, issue.followers, issue.followedByUser]);

  // Debug when issue prop changes
  useEffect(() => {
    console.log('Issue prop changed:', {
      id: initialIssue.id,
      likes: initialIssue.likes,
      likedByUser: initialIssue.likedByUser,
      followers: initialIssue.followers,
      followedByUser: initialIssue.followedByUser
    });
  }, [initialIssue]);

  // Helper function to check if current user is the issue owner
  const isIssueOwner = () => {
    if (!currentUser || !issue.createdBy) return false;
    const isOwner = parseInt(currentUser.id) === issue.createdBy.id;
    console.log('isIssueOwner check:', {
      currentUserId: currentUser.id,
      issueCreatorId: issue.createdBy.id,
      parsedCurrentUserId: parseInt(currentUser.id),
      isOwner
    });
    return isOwner;
  };

  // Handle issue voting using the correct API endpoint
  const handleIssueVote = async (issueId: number) => {
    if (!currentUser) {
      console.error('User must be authenticated to vote');
      return;
    }

    if (isVotingIssue) {
      console.log('Vote already in progress, ignoring click');
      return;
    }

    console.log('Voting on issue:', { issueId, currentLikes: issue.likes, currentIsLiked: issue.likedByUser });

    setIsVotingIssue(true);
    
    // Optimistic update for immediate UI feedback
    const optimisticUpdate = {
      ...issue,
      likes: issue.likedByUser ? issue.likes - 1 : issue.likes + 1,
      likedByUser: !issue.likedByUser
    };
    setIssue(optimisticUpdate);
    
    try {
      // Determine HTTP method based on current like state
      // If user has already liked, send DELETE to unlike
      // If user hasn't liked, send POST to like
      const method = issue.likedByUser ? 'DELETE' : 'POST';
      const endpoint = API_ENDPOINTS.ISSUES.LIKE(issueId.toString());
      
      console.log('Sending request:', { method, endpoint, currentLikeState: issue.likedByUser });
      
      const headers = await getAuthHeaders(refreshSession);
      const response = await fetch(endpoint, {
        method,
        headers
      });

      if (response.ok) {
        // Get the updated issue data from the backend response
        const updatedIssueData = await response.json();
        
        // Update the local issue state with the new data
        console.log('Setting issue state to:', updatedIssueData);
        console.log('Before update - issue state:', {
          likes: issue.likes,
          likedByUser: issue.likedByUser,
          followers: issue.followers,
          followedByUser: issue.followedByUser
        });
        console.log('After update - new state:', {
          likes: updatedIssueData.likes,
          likedByUser: updatedIssueData.likedByUser,
          followers: updatedIssueData.followers,
          followedByUser: updatedIssueData.followedByUser
        });
        
        setIssue(updatedIssueData);
        
        // Notify parent component if callback provided
        if (onIssueUpdate) {
          console.log('Notifying parent component of issue update');
          onIssueUpdate(updatedIssueData);
        }
        
        console.log('Issue vote updated successfully:', updatedIssueData);

      } else {
        console.error('Failed to update issue vote');
        // Revert optimistic update on failure
        setIssue(issue);

        // Optionally show user feedback for failed requests
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
      }
    } catch (error) {
      console.error('Error voting on issue:', error);
      // Revert optimistic update on error
      setIssue(issue);

    } finally {
      setIsVotingIssue(false);
    }
  };

  // Handle issue follow/unfollow using the correct API endpoint
  const handleIssueFollow = async (issueId: number, type: 'follow' | 'unfollow') => {
    if (!currentUser) {
      console.error('User must be authenticated to follow');
      return;
    }

    try {
      const method = type === 'follow' ? 'POST' : 'DELETE';
      const endpoint = API_ENDPOINTS.ISSUES.FOLLOW(issueId.toString());
      
      const headers = await getAuthHeaders(refreshSession);
      const response = await fetch(endpoint, {
        method,
        headers
      });

              if (response.ok) {
          // Get the updated issue data
          const updatedIssueData = await response.json();
          
          // Update the local issue state
          console.log('Setting issue state to:', updatedIssueData);
          setIssue(updatedIssueData);
          
          // Notify parent component if callback provided
          if (onIssueUpdate) {
            console.log('Notifying parent component of issue update');
            onIssueUpdate(updatedIssueData);
          }
          
          console.log('Issue follow updated successfully:', updatedIssueData);
        console.log('Updated issue fields:', {
          likes: updatedIssueData.likes,
          likedByUser: updatedIssueData.likedByUser,
          followers: updatedIssueData.followers,
          followedByUser: updatedIssueData.followedByUser
        });
      } else {
        console.error('Failed to update issue follow');
      }
    } catch (error) {
      console.error('Error following issue:', error);
    }
  };

  const fetchComments = async (page: number = 0, append: boolean = false) => {
    try {
      setLoading(true);
      
      // Get auth headers with automatic token refresh
      const headers = await getAuthHeaders(refreshSession);
      
      const response = await fetch(
        API_ENDPOINTS.COMMENTS.GET_BY_POST(
          issue.id,
          'ISSUE',
          page, 
          pageSize, 
          'createdAt', 
          'desc'
        ),
        {
          headers,
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        
        if (append) {
          setComments(prev => [...prev, ...(data.content || [])]);
        } else {
          setComments(data.content || []);
        }
        
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
        setCurrentPage(page);
        setHasMore(!data.last);
      } else {
        console.error('Failed to fetch comments');
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
      setLoading(false);
    }
  };

  // Auto-load more comments when user scrolls near the bottom
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    // Load more when user scrolls to 80% of the content
    if (scrollPercentage > 0.8 && hasMore && !loading) {
      fetchComments(currentPage + 1, true);
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    if (!currentUser) {
      console.error('User must be authenticated to comment');
      return;
    }

    try {
      const commentData: CommentRequestDto = {
        text: newComment.trim(),
        isPrivate: false,
        userId: parseInt(currentUser.id),
        postId: issue.id,
        postType: PostType.ISSUE,
      };

      // Get auth headers with automatic token refresh
      const headers = await getAuthHeaders(refreshSession);

      const response = await fetch(API_ENDPOINTS.COMMENTS.CREATE, {
        method: 'POST',
        headers,
        body: JSON.stringify(commentData),
      });

      if (response.ok) {
        const newCommentData = await response.json();
        setComments(prev => [newCommentData, ...prev]);
        setNewComment('');
        // Refresh comments to get updated counts
        fetchComments(0);
      } else {
        console.error('Failed to create comment');
      }
    } catch (error) {
      console.error('Error creating comment:', error);
    }
  };

  const handleReply = async (parentCommentId: number) => {
    if (!replyText.trim()) return;
    if (!currentUser) {
      console.error('User must be authenticated to reply');
      return;
    }

    try {
      const replyData: CommentRequestDto = {
        text: replyText.trim(),
        isPrivate: false,
        userId: parseInt(currentUser.id),
        postId: parentCommentId,
        postType: PostType.COMMENT,
      };

      // Get auth headers with automatic token refresh
      const headers = await getAuthHeaders(refreshSession);

      const response = await fetch(API_ENDPOINTS.COMMENTS.CREATE, {
        method: 'POST',
        headers,
        body: JSON.stringify(replyData),
      });

      if (response.ok) {
        const newReplyData = await response.json();
        // Add reply to the parent comment
        setComments(prev => prev.map(comment => 
          comment.id === parentCommentId 
            ? { ...comment, children: [...(comment.children || []), newReplyData] }
            : comment
        ));
        setReplyText('');
        setReplyingTo(null);
        // Refresh comments to get updated counts
        fetchComments(currentPage);
      } else {
        console.error('Failed to create reply');
      }
    } catch (error) {
      console.error('Error creating reply:', error);
    }
  };

  // Handle comment voting with proper upvote/downvote logic
  const handleVoteComment = async (commentId: number, voteType: 'up' | 'down') => {
    if (!currentUser) {
      console.error('User must be authenticated to vote');
      return;
    }

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

      // Get auth headers with automatic token refresh
      const headers = await getAuthHeaders(refreshSession);

      const response = await fetch(endpoint, {
        method,
        headers
      });

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

  // Handle response voting - POST always changes vote status
  const handleVoteResponse = async (responseId: number, voteType: 'up' | 'down') => {
    if (!currentUser || isVotingResponse) return;

    setIsVotingResponse(true);
    try {
      const endpoint = voteType === 'up' 
        ? `${API_ENDPOINTS.RESPONSES.GET_BY_ID(responseId.toString())}/upvote`
        : `${API_ENDPOINTS.RESPONSES.GET_BY_ID(responseId.toString())}/downvote`;

      const headers = await getAuthHeaders(refreshSession);
      const response = await fetch(endpoint, {
        method: 'POST',
        headers
      });

      if (response.ok) {
        // Get the updated response data
        const updatedResponseData = await response.json();
        console.log('Response voting updated:', updatedResponseData);
        
        // Update the response in the issue state
        if (onIssueUpdate) {
          const updatedIssue = {
            ...issue,
            responses: issue.responses.map((resp: ResponseResponseDto) => 
              resp.id === responseId ? updatedResponseData : resp
            )
          };
          onIssueUpdate(updatedIssue);
        }
        
        // Also update the local issue state immediately for instant UI feedback
        const updatedResponses = issue.responses.map((resp: ResponseResponseDto) => 
          resp.id === responseId ? updatedResponseData : resp
        );
        
        console.log('Updated responses:', updatedResponses);
        
        // Update the local issue state
        setIssue((prev: Issue) => ({
          ...prev,
          responses: updatedResponses
        }));
      }
    } catch (error) {
      console.error('Error voting on response:', error);
    } finally {
      setIsVotingResponse(false);
    }
  };

  // Fetch response comments
  const fetchResponseComments = async (responseId: number, page: number = 0) => {
    try {
      const headers = await getAuthHeaders(refreshSession);
      
      const response = await fetch(
        API_ENDPOINTS.COMMENTS.GET_BY_POST(
          responseId,
          'RESPONSE',
          page, 
          20, 
          'createdAt', 
          'desc'
        ),
        {
          headers,
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setResponseComments(data.content || []);
      } else {
        console.error('Failed to fetch response comments');
        setResponseComments([]);
      }
    } catch (error) {
      console.error('Error fetching response comments:', error);
      setResponseComments([]);
    }
  };

  // Handle response rating
  const handleShowRatingPopup = (response: ResponseResponseDto) => {
    setResponseToRate(response);
    setShowRatingPopup(true);
  };

  const handleRatingSubmit = async (rating: number, feedbackComment?: string) => {
    if (!responseToRate) return;
    
    const success = await rateResponse(responseToRate.id, rating, feedbackComment);
    if (success) {
      // Update the response in the issue state to show the rating
      const updatedResponses = issue.responses.map((resp: ResponseResponseDto) => 
        resp.id === responseToRate.id 
          ? { ...resp, averageRating: rating }
          : resp
      );
      
      setIssue((prev: Issue) => ({
        ...prev,
        responses: updatedResponses
      }));
      
      // Also update parent component if callback exists
      if (onIssueUpdate) {
        const updatedIssue = {
          ...issue,
          responses: updatedResponses
        };
        onIssueUpdate(updatedIssue);
      }
    }
  };

  const handleCloseRatingPopup = () => {
    setShowRatingPopup(false);
    setResponseToRate(null);
  };

  // Handle response comment submission
  const handleResponseComment = async (responseId: number) => {
    if (!newResponseComment.trim() || !currentUser) return;

    try {
      const commentData: CommentRequestDto = {
        text: newResponseComment.trim(),
        isPrivate: false,
        userId: parseInt(currentUser.id),
        postId: responseId,
        postType: PostType.RESPONSE
      };

      const headers = await getAuthHeaders(refreshSession);
      const response = await fetch(API_ENDPOINTS.COMMENTS.CREATE, {
        method: 'POST',
        headers,
        body: JSON.stringify(commentData)
      });

      if (response.ok) {
        const newCommentData = await response.json();
        setResponseComments(prev => [newCommentData, ...prev]);
        setNewResponseComment('');
        
        // Refresh the comments list to ensure we have the latest data
        fetchResponseComments(responseId, 0);
      } else {
        console.error('Failed to create response comment');
      }
    } catch (error) {
      console.error('Error creating response comment:', error);
    }
  };

  // Handle follow-up response creation
  const handleFollowUpResponseCreated = async (newResponse: ResponseResponseDto) => {
    console.log('Follow-up response created:', newResponse);
    
    // Close the form
    setShowFollowUpForm(false);
    setFollowUpResponseId(null);
    
    // Refresh the issue to get the updated responses
    if (onIssueUpdate) {
      // This will trigger a refresh of the issue data
      // The new follow-up response should appear in the responses list
    }
    
    // You might want to show a success message here
  };

  // Show follow-up response form for a specific response
  const showFollowUpFormForResponse = (responseId: number) => {
    setFollowUpResponseId(responseId);
    setShowFollowUpForm(true);
  };

  // Cancel follow-up response form
  const cancelFollowUpForm = () => {
    setShowFollowUpForm(false);
    setFollowUpResponseId(null);
  };

  // Get response status color
  const getResponseStatusColor = (status: string) => {
    switch (status) {
      case 'FOLLOW_UP':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'RESOLVED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'ESCALATED':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get display responses (latest first, with expand/collapse)
  const getDisplayResponses = () => {
    if (!issue.responses || issue.responses.length === 0) return [];
    
    // Sort by latest first
    const sortedResponses = [...issue.responses].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    if (showAllResponses || sortedResponses.length <= 1) {
      return sortedResponses;
    }
    
    // Show only the latest response when collapsed
    return [sortedResponses[0]];
  };

  // Check if more responses can be added (for future use)
  const canAddMoreResponses = () => {
    // For now, always return false since citizens can't add responses
    // This can be updated if citizens are allowed to add responses in the future
    return false;
  };

  // Refresh responses (for future use)
  const refreshResponses = () => {
    // This can be implemented if responses need to be refreshed
    // For now, just close the expanded view
    setShowAllResponses(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''} mb-4`}>
      <div className="flex items-start space-x-3">
        {comment.user.profileUrl ? (
          <img
            src={comment.user.profileUrl}
            alt={`${comment.user.firstName} ${comment.user.lastName}`}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
            {(() => {
              const firstName = comment.user.firstName || '';
              const lastName = comment.user.lastName || '';
              
              if (firstName && lastName) {
                return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
              } else if (firstName) {
                return firstName.charAt(0).toUpperCase();
              } else if (lastName) {
                return lastName.charAt(0).toUpperCase();
              }
              return '?';
            })()}
          </div>
        )}
        
        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">
                {currentUser?.id && parseInt(currentUser.id) === comment.user.id ? 'You' : `${comment.user.firstName} ${comment.user.lastName}`}
              </span>
              <span className="text-xs text-gray-500">{formatDate(comment.createdAt)}</span>
            </div>
            <p className="text-gray-800 text-sm">{comment.content}</p>
            
            {/* Voting information */}
            <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
              {currentUser ? (
                <>
                  <button
                    onClick={() => handleVoteComment(comment.id, 'up')}
                    className={`flex items-center space-x-1 transition-colors ${
                      comment.hasvoted && comment.upvotes > 0 
                        ? 'text-green-600 bg-green-50 px-2 py-1 rounded' 
                        : 'hover:text-green-600'
                    }`}
                  >
                    <span>👍 {comment.upvotes || 0}</span>
                  </button>
                  <button
                    onClick={() => handleVoteComment(comment.id, 'down')}
                    className={`flex items-center space-x-1 transition-colors ${
                      comment.hasvoted && comment.downvotes > 0 
                        ? 'text-red-600 bg-red-50 px-2 py-1 rounded' 
                        : 'hover:text-red-600'
                    }`}
                  >
                    <span>👎 {comment.downvotes || 0}</span>
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-2">
                  <span className="text-green-600">👍 {comment.upvotes || 0}</span>
                  <span className="text-red-600">👎 {comment.downvotes || 0}</span>
                </div>
              )}
              {comment.hasvoted && (
                <span className="text-blue-600 text-xs">You voted</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
            {currentUser ? (
              <button
                onClick={() => {
                  if (currentUser) {
                    setReplyingTo(replyingTo === comment.id ? null : comment.id);
                  }
                }}
                className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
              >
                <Reply size={12} />
                <span>Reply</span>
              </button>
            ) : (
              <span className="text-gray-400">Log in to reply</span>
            )}
          </div>

          {/* Reply form - Only show for authenticated users */}
          {replyingTo === comment.id && currentUser && (
            <div className="mt-3 flex space-x-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <button
                onClick={() => handleReply(comment.id)}
                disabled={!replyText.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
              >
                Reply
              </button>
            </div>
          )}

          {/* Render children (replies) - fully loaded from API */}
          {comment.children && comment.children.length > 0 && (
            <div className="mt-3">
              {comment.children.map(child => renderComment(child, true))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render government response
  const renderGovernmentResponse = (response: ResponseResponseDto) => {
    console.log('Rendering response:', response.id, 'hasUpvoted:', response.hasUpvoted, 'hasDownvoted:', response.hasDownvoted, 'upvotes:', response.upvoteCount, 'downvotes:', response.downvoteCount);
    
    return (
    <div key={response.id} className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
            {response.responder.firstName?.charAt(0) || 'G'}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {response.responder.firstName} {response.responder.lastName}
            </div>
            <div className="text-sm text-blue-600 font-medium">
              Government Response
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getResponseStatusColor(response.status)}`}>
            {response.status.replace('_', ' ')}
          </span>
          {!response.isPublic && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              Private
            </span>
          )}
          
          {/* Rating button for resolved/rejected responses */}
          {(response.status === 'RESOLVED' || response.status === 'REJECTED') && currentUser && (
            <button
              onClick={() => handleShowRatingPopup(response)}
              className="inline-flex items-center space-x-1 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full hover:bg-yellow-200 transition-colors"
              title={response.averageRating ? `Rated: ${response.averageRating}/5` : 'Rate this response'}
            >
              <Star size={12} className={response.averageRating ? 'text-yellow-500' : 'text-yellow-600'} />
              <span>{response.averageRating ? `${response.averageRating}/5` : 'Rate'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Response Message */}
      {response.message && (
        <div className="mb-4">
          <p className="text-gray-700 whitespace-pre-wrap">{response.message}</p>
        </div>
      )}

      {/* Follow-up Response Button - Only show for FOLLOW_UP status, authenticated users, and no existing children from current user */}
      {response.status === 'FOLLOW_UP' && currentUser && (!response.children || response.children.length === 0) && (
        <div className="mb-4">
          <button
            onClick={() => showFollowUpFormForResponse(response.id)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            <Send size={16} />
            <span>Submit Follow-up Response</span>
          </button>
          <p className="text-sm text-yellow-700 mt-2">
            The government has requested more information. Click here to provide additional details.
          </p>
        </div>
      )}

            {/* Show message if user has already responded */}
      {response.status === 'FOLLOW_UP' && currentUser && response.children && response.children.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">
              ✓
            </div>
            <p className="text-sm text-blue-700">
              You have already provided a follow-up response. Waiting for government review.
            </p>
          </div>
        </div>
      )}

      {/* Show existing follow-up responses */}
      {response.children && response.children.length > 0 && (
        <div className="mb-4">
          <div className="border-l-4 border-yellow-400 pl-4">
            <h5 className="text-sm font-medium text-yellow-800 mb-3">
              Follow-up Response{response.children.length > 1 ? 's' : ''} ({response.children.length})
            </h5>
            {response.children.map((childResponse) => (
              <div key={childResponse.id} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                      {childResponse.responder.firstName?.charAt(0) || 'U'}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-yellow-900">
                        {childResponse.responder.firstName} {childResponse.responder.lastName}
                      </span>
                      <span className="text-yellow-600 ml-2">
                        • {currentUser && parseInt(currentUser.id) === childResponse.responder.id ? 'Your Response' : 'Citizen Response'}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full">
                    {childResponse.status.replace('_', ' ')}
                  </span>
                </div>
                
                {childResponse.message && (
                  <p className="text-yellow-800 text-sm mb-2">{childResponse.message}</p>
                )}
                
                {childResponse.attachments && childResponse.attachments.length > 0 && (
                  <div className="mb-2">
                    <div className="flex items-center space-x-2 text-xs text-yellow-600 mb-1">
                      <Paperclip size={12} />
                      <span>Attachments ({childResponse.attachments.length})</span>
                    </div>
                    <AttachmentViewer 
                      attachments={childResponse.attachments} 
                      maxPreviewSize="sm"
                      showDownloadButton={true}
                    />
                  </div>
                )}
                
                <div className="text-xs text-yellow-600">
                  {formatDate(childResponse.createdAt)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attachments */}
      {response.attachments && response.attachments.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
            <Paperclip size={14} />
            <span>Attachments ({response.attachments.length})</span>
          </div>
          <AttachmentViewer 
            attachments={response.attachments} 
            maxPreviewSize="md"
            showDownloadButton={true}
          />
        </div>
      )}

      {/* Response Footer */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Clock size={14} />
            <span>{formatDate(response.createdAt)}</span>
          </div>
          
          {/* Show current rating if exists */}
          {response.averageRating && (
            <div className="flex items-center space-x-1 text-yellow-600">
              <Star size={14} className="fill-current" />
              <span className="font-medium">{response.averageRating}/5</span>
            </div>
          )}
          
          <button
            onClick={() => {
              if (currentResponseId === response.id) {
                // Toggle current response comments
                setShowResponseComments(!showResponseComments);
              } else {
                // Switch to different response
                setCurrentResponseId(response.id);
                setShowResponseComments(true);
                setNewResponseComment(''); // Clear comment form
                fetchResponseComments(response.id, 0);
              }
            }}
            className="flex items-center space-x-2 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <MessageCircle size={14} />
            <span className="font-medium">
              {currentResponseId === response.id && showResponseComments ? 'Hide' : 'Show'} Comments
            </span>
            {currentUser && (
              <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                Comment Available
              </span>
            )}
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleVoteResponse(response.id, 'up')}
            disabled={isVotingResponse}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-sm ${
              response.hasUpvoted 
                ? 'text-green-600 bg-green-50' 
                : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
            }`}
          >
            <ThumbsUp size={14} />
            <span>{response.upvoteCount || 0}</span>
          </button>
          <button
            onClick={() => handleVoteResponse(response.id, 'down')}
            disabled={isVotingResponse}
            className={`flex items-center space-x-1 px-2 py-1 rounded text-sm ${
              response.hasDownvoted 
                ? 'text-red-600 bg-red-50' 
                : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
            }`}
          >
            <ThumbsDown size={14} />
            <span>{response.downvoteCount || 0}</span>
          </button>
        </div>
      </div>

                {/* Response Comments Section */}
          {showResponseComments && currentResponseId === response.id && (
            <div className="border-t border-blue-200 mt-6 pt-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Response Comments
              </h4>

              {/* Add New Comment to Response - Only show for authenticated users */}
              {currentUser && (
                <div className="mb-6 space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium text-gray-700">Add New Comment</h5>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getResponseStatusColor(response.status)}`}>
                        {response.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">
                      Share your thoughts about this government response. Your feedback helps improve our services.
                    </p>
                    <textarea
                      value={newResponseComment}
                      onChange={(e) => setNewResponseComment(e.target.value)}
                      placeholder="Share your thoughts about this government response..."
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={4}
                    />
                    <div className="flex justify-end mt-3">
                      <button
                        onClick={() => handleResponseComment(response.id)}
                        disabled={!newResponseComment.trim()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        Post Comment
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Response Comments List */}
              {responseComments.length > 0 ? (
                <div className="space-y-4">
                  {responseComments.map((comment) => renderComment(comment, false))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No comments yet on this response</p>
                  {currentUser && (
                    <p className="text-sm mt-2 text-gray-400">Be the first to comment on this response!</p>
                  )}
                </div>
              )}
            </div>
          )}
    </div>
    );
  };

  const statusColors: { [key: string]: string } = {
    OPEN: 'bg-blue-100 text-blue-800 border-blue-200',
    IN_PROGRESS: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    RESOLVED: 'bg-green-100 text-green-800 border-green-200',
    CLOSED: 'bg-gray-100 text-gray-800 border-gray-200',
  };

  const priorityColors: { [key: string]: string } = {
    LOW: 'bg-gray-100 text-gray-800',
    MEDIUM: 'bg-blue-100 text-blue-800',
    HIGH: 'bg-orange-100 text-orange-800',
    URGENT: 'bg-red-100 text-red-800',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <nav className="text-sm text-gray-500">
            <span>Issues</span> / <span className="text-gray-900">{issue.title}</span>
          </nav>
        </div>
      </div>

      {/* Issue Content */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">{issue.title}</h1>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusColors[issue.status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                  {issue.status.replace('_', ' ')}
                </span>
                {issue.level && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {issue.level} LEVEL
                  </span>
                )}
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[issue.urgency] || 'bg-gray-100 text-gray-800'}`}>
                  {issue.urgency} PRIORITY
                </span>
                {issue.category && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    <Tag size={12} className="mr-1" />
                    {issue.category}
                  </span>
                )}
              </div>
            </div>
            <VoteButton
              votes={issue.likes}
              onVote={() => handleIssueVote(issue.id)}
              currentUserId={currentUser?.id || ''}
              isLiked={issue.likedByUser}
              disabled={isVotingIssue}
            />
          </div>

          <div className="prose max-w-none mb-6">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {issue.description}
            </p>
          </div>

          {issue.attachments && issue.attachments.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Attachments</h3>
              <AttachmentViewer 
                attachments={issue.attachments} 
                maxPreviewSize="lg"
                showDownloadButton={true}
              />
            </div>
          )}



          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  {issue.createdBy.profileUrl ? (
                    <img
                      src={issue.createdBy.profileUrl}
                      alt={`${issue.createdBy.firstName} ${issue.createdBy.lastName}`}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                      {(() => {
                        const firstName = issue.createdBy.firstName || '';
                        const lastName = issue.createdBy.lastName || '';
                        
                        if (firstName && lastName) {
                          return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
                        } else if (firstName) {
                          return firstName.charAt(0).toUpperCase();
                        } else if (lastName) {
                          return lastName.charAt(0).toUpperCase();
                        }
                        return '?';
                      })()}
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{currentUser?.id && parseInt(currentUser.id) === issue.createdBy.id ? 'You' : `${issue.createdBy.firstName} ${issue.createdBy.lastName}`}</p>
                    <p className="text-xs text-gray-500">Created {formatDate(issue.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">

                  <div className="flex items-center space-x-1">
                    <Users size={16} />
                    <span>{issue.followers} followers</span>
                  </div>
                  {issue.location && (
                    <div className="flex items-center space-x-1">
                      <MapPin size={16} />
                      <span>{issue.location.district}, {issue.location.sector}</span>
                    </div>
                  )}
                </div>

                {/* Assignment Info */}
                {issue.assignedTo && (
                  <div className="mt-4 p-3 bg-green-50 rounded border border-green-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                        {issue.assignedTo.firstName?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-green-800">
                          Assigned to: {issue.assignedTo.firstName} {issue.assignedTo.lastName}
                        </div>
                        <div className="text-xs text-green-600">
                          Role: {issue.assignedTo.role ? 
                            issue.assignedTo.role.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()) : 
                            'Leader'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-3">
                {!isIssueOwner() && !issue.followedByUser && (
                  <button
                    onClick={() => handleIssueFollow(issue.id, 'follow')}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Follow
                  </button>
                )}
                {!isIssueOwner() && issue.followedByUser && (
                  <span className="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 rounded-lg">
                    Following
                  </span>
                )}
                {isIssueOwner() && (
                  <span className="text-sm text-gray-500 px-3 py-2">
                    You created this issue
                  </span>
                )}
                <button 
                  onClick={() => {
                    if (currentUser) {
                      setShowComments(!showComments);
                    } else {
                      // Show authentication prompt
                      alert('Please log in to view comments');
                    }
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm"
                >
                  <MessageCircle size={16} />
                  <span>Comments</span>
                </button>
              </div>
            </div>
          </div>

          {/* Government Responses Section */}
          {issue.responses && issue.responses.length > 0 && (
            <div className="border-t border-gray-200 mt-6 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-gray-900">Government Responses</h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {issue.responses.length} response{issue.responses.length !== 1 ? 's' : ''}
                  </span>
                  <span className="text-sm text-gray-500">
                    {issue.responses.length > 1 && !showAllResponses 
                      ? `(showing latest of ${issue.responses.length})`
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
                  {issue.responses.length > 1 && (
                    <button
                      onClick={() => setShowAllResponses(!showAllResponses)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
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
                          Show {issue.responses.length - 1} More Response{issue.responses.length - 1 !== 1 ? 's' : ''}
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
              
              <div className="space-y-6">
                {getDisplayResponses().map((response) => renderGovernmentResponse(response))}
              </div>
              
              {/* Follow-up Response Form */}
              {showFollowUpForm && followUpResponseId && (
                <UserFollowUpResponseForm
                  responseId={followUpResponseId}
                  onResponseCreated={handleFollowUpResponseCreated}
                  currentLanguage={issue.language || 'ENGLISH'}
                  onCancel={cancelFollowUpForm}
                />
              )}
              
              {/* Show More/Less Button for Mobile */}
              {issue.responses.length > 1 && (
                <div className="flex justify-center pt-4 lg:hidden">
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
                        Show {issue.responses.length - 1} More Response{issue.responses.length - 1 !== 1 ? 's' : ''}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Comments Section - Only show for authenticated users with valid token */}
          {showComments && currentUser && (
            <div className="border-t border-gray-200 mt-6 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Comments
              </h3>

              {/* Authentication Check for Comments */}
              {!currentUser ? (
                <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
                  <div className="mb-4">
                    <MessageCircle size={48} className="mx-auto text-blue-400" />
                  </div>
                  <h4 className="text-lg font-medium text-blue-900 mb-2">
                    Authentication Required
                  </h4>
                  <p className="text-blue-800 text-sm mb-4">
                    You need to be logged in to view and participate in the discussion.
                  </p>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Log In to Continue
                  </button>
                </div>
              ) : (
                <>
                  {/* Add Comment - Only show for authenticated users */}
                  <div className="mb-6 space-y-4">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment about this issue..."
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={4}
                    />
                    <div className="flex justify-end">
                      <button
                        onClick={handleComment}
                        disabled={!newComment.trim()}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        Post Comment
                      </button>
                    </div>
                  </div>

                                    {/* Comments Thread */}
                  {loading && currentPage === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>Loading comments...</p>
                    </div>
                  ) : comments.length > 0 ? (
                    <div 
                      className="space-y-4 max-h-96 overflow-y-auto pr-2" 
                      onScroll={handleScroll}
                    >
                      {comments.map(comment => renderComment(comment))}
                      
                      {/* Auto-loading indicator */}
                      {loading && hasMore && (
                        <div className="text-center pt-4">
                          <div className="inline-flex items-center space-x-2 text-gray-500">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                            <span>Loading more comments...</span>
                          </div>
                        </div>
                      )}
                      

                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No comments yet. Be the first to comment on this issue!</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Response Rating Popup */}
      {showRatingPopup && responseToRate && (
        <ResponseRatingPopup
          response={responseToRate}
          isOpen={showRatingPopup}
          onClose={handleCloseRatingPopup}
          onRatingSubmit={handleRatingSubmit}
        />
      )}
    </div>
  );
};