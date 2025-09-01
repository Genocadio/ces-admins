import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Paperclip, 
  AlertCircle, 
  ThumbsUp, 
  ThumbsDown,
  Clock,
  MapPin
} from 'lucide-react';
import { ResponseResponseDto, ResponseStatus, PostType } from '../types';
import { API_ENDPOINTS } from '../config/api';
import { formatRelativeTime } from '../utils/dateUtils';
import { AttachmentViewer } from './AttachmentViewer';

interface ResponseCardProps {
  response: ResponseResponseDto;
  onResponseUpdated: (responseId: number, updatedResponse: ResponseResponseDto) => void;
}

export const ResponseCard: React.FC<ResponseCardProps> = ({
  response,
  onResponseUpdated
}) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [comments, setComments] = useState<any[]>(response.comments || []);
  const [commentsPage, setCommentsPage] = useState(0);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;
  
  // Reply state
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');

  // Reset comments state when response changes
  useEffect(() => {
    console.log('ResponseCard: Response changed, comments:', response.comments);
    setComments(response.comments || []);
    setTotalElements(response.comments?.length || 0);
    setCommentsPage(0);
    setHasMoreComments(true);
    // Clear reply state
    setReplyingTo(null);
    setReplyText('');
  }, [response.comments]);

  // Monitor comments state changes
  useEffect(() => {
    console.log('ResponseCard: Comments state changed:', {
      comments,
      totalElements,
      showComments
    });
  }, [comments, totalElements, showComments]);

  // Clear reply state if user becomes unauthenticated
  useEffect(() => {
    const tokens = localStorage.getItem('adminAuthTokens');
    if (!tokens) {
      setReplyingTo(null);
      setReplyText('');
      setShowComments(false);
    }
  }, []);

  // Fetch comments when needed
  const fetchComments = async (page: number = 0, append: boolean = false) => {
    if (isLoadingComments) return;
    
    console.log('ResponseCard: Fetching comments for response:', response.id, 'page:', page);
    setIsLoadingComments(true);
    try {
      // Use admin authentication headers
      const headers = getAdminAuthHeaders();
      
      const fetchResponse = await fetch(
        API_ENDPOINTS.COMMENTS.GET_BY_POST(
          response.id,
          PostType.RESPONSE,
          page, 
          pageSize, 
          'createdAt', 
          'desc'
        ),
        {
          headers,
        }
      );

      console.log('ResponseCard: Comment fetch response status:', fetchResponse.status);

      if (fetchResponse.ok) {
        const data = await fetchResponse.json();
        console.log('ResponseCard: Comment data received:', data);
        
        // Ensure we have the correct data structure
        const fetchedComments = data.content || [];
        const totalCount = data.totalElements || 0;
        const isLastPage = data.last || false;
        
        console.log('ResponseCard: Processed comment data:', {
          fetchedComments,
          totalCount,
          append,
          currentComments: comments,
          isLastPage,
          page
        });
        
        if (append) {
          setComments(prev => [...prev, ...fetchedComments]);
        } else {
          setComments(fetchedComments);
        }
        
        setTotalPages(data.totalPages || 0);
        setTotalElements(totalCount);
        setCommentsPage(page);
        setHasMoreComments(!isLastPage);
        
        console.log('ResponseCard: Comments state updated:', {
          comments: fetchedComments,
          totalElements: totalCount,
          hasMore: !isLastPage,
          finalCommentsState: append ? [...comments, ...fetchedComments] : fetchedComments,
          currentPage: page,
          isLastPage
        });
      } else {
        console.error('ResponseCard: Failed to fetch comments, status:', fetchResponse.status);
        if (!append) {
          setComments([]);
          setTotalElements(0);
          setHasMoreComments(false);
        }
      }
    } catch (error) {
      console.error('ResponseCard: Error fetching comments:', error);
      if (!append) {
        setComments([]);
        setTotalElements(0);
        setHasMoreComments(false);
      }
    } finally {
      setIsLoadingComments(false);
    }
  };

  // Load more comments
  const loadMoreComments = () => {
    if (hasMoreComments && !isLoadingComments) {
      fetchComments(commentsPage + 1, true);
    }
  };

  const getStatusColor = (status: ResponseStatus) => {
    switch (status) {
      case ResponseStatus.FOLLOW_UP:
        return 'bg-blue-100 text-blue-800';
      case ResponseStatus.IN_PROGRESS:
        return 'bg-yellow-100 text-yellow-800';
      case ResponseStatus.RESOLVED:
        return 'bg-green-100 text-green-800';
      case ResponseStatus.REJECTED:
        return 'bg-red-100 text-red-800';
      case ResponseStatus.ESCALATED:
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: ResponseStatus) => {
    switch (status) {
      case ResponseStatus.FOLLOW_UP:
        return '📋';
      case ResponseStatus.IN_PROGRESS:
        return '🔄';
      case ResponseStatus.RESOLVED:
        return '✅';
      case ResponseStatus.REJECTED:
        return '❌';
      case ResponseStatus.ESCALATED:
        return '📤';
      default:
        return '❓';
    }
  };

  // Use the shared date utility function
  const formatDate = (dateString: string) => {
    return formatRelativeTime(dateString);
  };



  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmittingComment) return;

    console.log('ResponseCard: Submitting comment for response:', response.id);
    setIsSubmittingComment(true);
    try {
      const commentData = {
        text: newComment.trim(),
        isPrivate: false,
        userId: response.responder.id,
        postId: response.id,
        postType: PostType.RESPONSE
      };

      console.log('ResponseCard: Comment data:', commentData);

      // Use admin authentication headers
      const headers = getAdminAuthHeaders();

      const fetchResponse = await fetch(API_ENDPOINTS.COMMENTS.CREATE, {
        method: 'POST',
        headers,
        body: JSON.stringify(commentData)
      });

      console.log('ResponseCard: Comment creation response status:', fetchResponse.status);

      if (fetchResponse.ok) {
        const newCommentData = await fetchResponse.json();
        console.log('ResponseCard: New comment created:', newCommentData);
        
        // Add new comment to the beginning of the list immediately
        setComments(prev => {
          const updatedComments = [newCommentData, ...prev];
          console.log('ResponseCard: Updated comments after new comment:', updatedComments);
          return updatedComments;
        });
        setNewComment('');
        
        // Update the total count
        setTotalElements(prev => {
          const newCount = prev + 1;
          console.log('ResponseCard: Updated total count:', newCount);
          return newCount;
        });
        
        // Check if we need to update pagination state
        // If we're on the first page and adding a comment, we might need to adjust pagination
        if (commentsPage === 0) {
          // We're on the first page, so new comments are added to the top
          // Check if we now have more than pageSize comments
          const newTotalComments = comments.length + 1;
          if (newTotalComments > pageSize) {
            // We now have more comments than fit on one page
            setHasMoreComments(true);
            console.log('ResponseCard: Now showing load more button due to new comment');
          }
        }
        
        // Don't refresh comments immediately - let the user see the new comment
        // Only refresh if we need to get updated pagination info
        if (comments.length + 1 > pageSize) {
          // Refresh to get updated pagination info
          fetchComments(0);
        }
      } else {
        console.error('ResponseCard: Failed to create comment, status:', fetchResponse.status);
      }
    } catch (error) {
      console.error('ResponseCard: Error creating comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleVoteComment = async (commentId: number, voteType: 'up' | 'down') => {
    // Comment voting is still allowed, but response voting is removed
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

      // Use admin authentication headers
      const headers = getAdminAuthHeaders();

      const fetchResponse = await fetch(endpoint, {
        method,
        headers
      });

      if (fetchResponse.ok) {
        const updatedCommentData = await fetchResponse.json();
        
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
      console.error('ResponseCard: Error voting on comment:', error);
    }
  };

  // Handle comment reply
  const handleReply = async (parentCommentId: number) => {
    if (!replyText.trim()) return;

    try {
      const replyData = {
        text: replyText.trim(),
        isPrivate: false,
        userId: response.responder.id,
        postId: parentCommentId,
        postType: PostType.COMMENT
      };

      console.log('ResponseCard: Submitting reply:', replyData);

      const headers = getAdminAuthHeaders();

      const fetchResponse = await fetch(API_ENDPOINTS.COMMENTS.CREATE, {
        method: 'POST',
        headers,
        body: JSON.stringify(replyData)
      });

      if (fetchResponse.ok) {
        const newReplyData = await fetchResponse.json();
        console.log('ResponseCard: New reply created:', newReplyData);
        
        // Add reply to the parent comment
        setComments(prev => prev.map(comment => 
          comment.id === parentCommentId 
            ? { ...comment, children: [...(comment.children || []), newReplyData] }
            : comment
        ));
        
        setReplyText('');
        setReplyingTo(null);
        
        // Update total count for replies
        setTotalElements(prev => {
          const newCount = prev + 1;
          console.log('ResponseCard: Updated total count after reply:', newCount);
          return newCount;
        });
        
        // Check if we need to update pagination state for replies
        // Replies don't affect the main pagination since they're nested
        // But we should refresh to get updated comment counts
        fetchComments(commentsPage);
      } else {
        console.error('ResponseCard: Failed to create reply, status:', fetchResponse.status);
      }
    } catch (error) {
      console.error('ResponseCard: Error creating reply:', error);
    }
  };

  // Helper function to get admin auth headers
  const getAdminAuthHeaders = () => {
    try {
      const tokens = localStorage.getItem('adminAuthTokens');
      if (!tokens) {
        throw new Error('No admin authentication tokens found');
      }
      
      const { accessToken } = JSON.parse(tokens);
      if (!accessToken) {
        throw new Error('Invalid admin authentication token');
      }

      return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      };
    } catch (error) {
      console.error('Error getting admin auth headers:', error);
      throw error;
    }
  };

  // Render comment function (similar to citizen part)
  const renderComment = (comment: any, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8 border-l-2 border-gray-200 pl-4' : ''} mb-4`}>
      <div className="flex items-start space-x-3">
        {comment.user?.profileUrl ? (
          <img
            src={comment.user.profileUrl}
            alt={`${comment.user.firstName} ${comment.user.lastName}`}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
            {(() => {
              const firstName = comment.user?.firstName || '';
              const lastName = comment.user?.lastName || '';
              
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
                {comment.user?.firstName} {comment.user?.lastName}
              </span>
              <span className="text-xs text-gray-500">{formatRelativeTime(comment.createdAt)}</span>
            </div>
            <p className="text-gray-800 text-sm">{comment.content}</p>
            
            {/* Voting information */}
            <div className="flex items-center space-x-4 mt-3 text-xs text-gray-500">
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
            </div>
          </div>
          
          {/* Reply button */}
          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
            <button
              onClick={() => {
                setReplyingTo(replyingTo === comment.id ? null : comment.id);
                setReplyText('');
              }}
              className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              <span>Reply</span>
            </button>
          </div>

          {/* Reply form */}
          {replyingTo === comment.id && (
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

          {/* Render children (replies) */}
          {comment.children && comment.children.length > 0 && (
            <div className="mt-3">
              {comment.children.map((child: any) => renderComment(child, true))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
      {/* Response Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
            {response.responder.firstName?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="font-medium text-gray-900">
              {response.responder.firstName} {response.responder.lastName}
            </div>
            <div className="text-sm text-gray-500">
              {response.responder.role?.name || 'User'}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(response.status)}`}>
            <span className="mr-1">{getStatusIcon(response.status)}</span>
            {response.status.replace('_', ' ')}
          </span>
          {!response.isPublic && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              <AlertCircle size={12} className="mr-1" />
              Private
            </span>
          )}
          {/* Show "New" badge for responses created in the last 24 hours */}
          {(() => {
            const responseDate = new Date(response.createdAt);
            const now = new Date();
            const diffHours = (now.getTime() - responseDate.getTime()) / (1000 * 60 * 60);
            return diffHours < 24 ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                🆕 New
              </span>
            ) : null;
          })()}
        </div>
      </div>

      {/* Response Message */}
      {response.message && (
        <div className="mb-4">
          <p className="text-gray-700 whitespace-pre-wrap">{response.message}</p>
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

      {/* Show child responses (citizen follow-ups) */}
      {response.children && response.children.length > 0 && (
        <div className="mb-4">
          <div className="border-l-4 border-yellow-400 pl-4">
            <h5 className="text-sm font-medium text-yellow-800 mb-3">
              Citizen Follow-up Response{response.children.length > 1 ? 's' : ''} ({response.children.length})
            </h5>
            {response.children.map((childResponse: ResponseResponseDto) => (
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
                      <span className="text-yellow-600 ml-2">• Citizen Response</span>
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

      {/* Response Footer */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Clock size={14} />
            <span>{formatDate(response.createdAt)}</span>
          </div>
          
          <button
            onClick={() => {
              console.log('ResponseCard: Comment button clicked, showComments:', showComments);
              if (!showComments) {
                console.log('ResponseCard: Fetching comments for response:', response.id);
                // Always fetch fresh comments when opening
                setComments([]); // Clear existing comments
                setTotalElements(0); // Reset count
                fetchComments(0);
              }
              setShowComments(!showComments);
            }}
            className="flex items-center space-x-2 hover:text-blue-600 transition-colors cursor-pointer"
          >
            <MessageCircle size={14} />
            <span className="font-medium">Comments</span>
          </button>
        </div>

      </div>

      {/* Comments Section */}
      <div className="mt-4">
        {showComments && (
          <div className="mt-3 space-y-3">
            {/* Comment Header */}
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-700">
                Comments
              </h4>
              {hasMoreComments && comments.length > 0 && totalPages > 1 && (
                <span className="text-xs text-gray-500">
                  Showing {comments.length} of {totalElements}
                </span>
              )}
            </div>
            
            {/* Add Comment Form */}
            <form onSubmit={handleCommentSubmit} className="flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => {
                  console.log('ResponseCard: Comment input changed:', e.target.value);
                  setNewComment(e.target.value);
                }}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmittingComment}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmittingComment}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingComment ? 'Posting...' : 'Post'}
              </button>
            </form>

            {/* Comments List */}
            {isLoadingComments && comments.length === 0 ? (
              <div className="text-center py-4">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-500 mt-2">Loading comments...</p>
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {(() => {
                  console.log('ResponseCard: Rendering comments:', comments);
                  return comments.map(comment => renderComment(comment));
                })()}
                
                {/* Load More Button */}
                {hasMoreComments && comments.length > 0 && (
                  <button
                    onClick={loadMoreComments}
                    disabled={isLoadingComments}
                    className="w-full py-2 text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoadingComments ? 'Loading...' : 'Load More Comments'}
                  </button>
                )}
              </div>
            ) : totalElements > 0 ? (
              <div className="text-center py-4 text-gray-500">
                <p>Loading comments...</p>
              </div>
            ) : (
              <p className="text-center py-4 text-gray-500">No comments yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponseCard;
