import React, { useState } from 'react';
import { MessageCircle, MoreHorizontal, ThumbsUp, ThumbsDown, Reply, ChevronDown, ChevronRight, Music, FileText, File } from 'lucide-react';
import { TopicReplyResponseDto, User, Leader } from '../types';
import { AttachmentViewer } from './AttachmentViewer';
import { ReplyForm } from './ReplyForm';
import { useTopicReplyInteractions } from '../hooks/useTopicReplyInteractions';

interface TopicReplyItemProps {
  reply: TopicReplyResponseDto;
  currentUser: User | Leader | null;
  topicId: number;
  onReply: (replyData: any) => Promise<void>;
  onVote: (replyId: number, type: 'up' | 'down') => Promise<boolean>;
  depth?: number;
  maxDepth?: number;
  isAdmin?: boolean;
  onUnauthorized?: () => void;
}

export const TopicReplyItem: React.FC<TopicReplyItemProps> = ({
  reply,
  currentUser,
  topicId,
  onReply,
  onVote,
  depth = 0,
  maxDepth = 3,
  isAdmin = false,
  onUnauthorized,
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReplies, setShowReplies] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  
  const { upvoteReply, downvoteReply } = useTopicReplyInteractions({ 
    isAdmin, 
    onUnauthorized 
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes < 1 ? 'now' : `${minutes}m`;
      }
      return `${hours}h`;
    }
    return `${days}d`;
  };

  // Safely get user initials
  const getUserInitials = () => {
    try {
      if (reply.createdBy) {
        const firstName = reply.createdBy.firstName || '';
        const lastName = reply.createdBy.lastName || '';
        
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

  const handleVote = async (type: 'up' | 'down') => {
    if (!currentUser || isVoting) return;
    
    setIsVoting(true);
    try {
      let updatedReply;
      if (type === 'up') {
        updatedReply = await upvoteReply(reply.id);
      } else {
        updatedReply = await downvoteReply(reply.id);
      }
      
      // Update local state with the response from API
      if (updatedReply) {
        // Update the reply object with new voting data
        Object.assign(reply, {
          upvoteCount: updatedReply.upvoteCount,
          downvoteCount: updatedReply.downvoteCount,
          hasUpvoted: updatedReply.hasUpvoted,
          hasDownvoted: updatedReply.hasDownvoted
        });
        
        // Force a re-render by updating state
        setShowReplies(showReplies);
        
        console.log('Reply vote updated:', updatedReply);
      }
    } catch (error) {
      console.error('Failed to vote on reply:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleReply = async (replyData: any) => {
    try {
      await onReply(replyData);
      setShowReplyForm(false);
    } catch (error) {
      console.error('Failed to create reply:', error);
    }
  };

  const marginLeft = Math.min(depth * 40, maxDepth * 40);
  const canReply = depth < maxDepth && currentUser;

  return (
    <div className={`border-l border-gray-200`} style={{ marginLeft: `${marginLeft}px` }}>
      <div className="p-4 hover:bg-gray-50 transition-colors">
        <div className="flex space-x-3">
          {reply.createdBy.profileUrl ? (
            <img
              src={reply.createdBy.profileUrl}
              alt={`${reply.createdBy.firstName} ${reply.createdBy.lastName}`}
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
              {getUserInitials()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-semibold text-gray-900 text-sm">
                {currentUser && currentUser.id === reply.createdBy.id ? 'You' : `${reply.createdBy.firstName} ${reply.createdBy.lastName}`}
              </span>
              <span className="text-gray-500 text-sm">·</span>
              <span className="text-gray-500 text-sm">{formatDate(reply.createdAt)}</span>
              <button className="ml-auto p-1 rounded-full hover:bg-gray-100 transition-colors">
                <MoreHorizontal size={14} className="text-gray-500" />
              </button>
            </div>
            
            <p className="text-gray-900 mb-2 leading-relaxed text-sm">
              {reply.description}
            </p>

            {/* Reply Tags */}
            {reply.tags && reply.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {reply.tags.map((tag, index) => (
                  <span key={index} className="text-blue-600 hover:underline cursor-pointer text-xs">
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Reply Attachments - Twitter-style inline display */}
            {reply.attachments && reply.attachments.length > 0 && (
              <div className="mb-3">
                <div className="grid grid-cols-1 gap-2">
                  {reply.attachments.map((attachment, index) => (
                    <div key={`${attachment.id}-${index}`} className="relative">
                      {attachment.type === 'PHOTO' && (
                        <div className="group relative overflow-hidden rounded-lg border border-gray-200">
                          <img
                            src={attachment.url}
                            alt={attachment.description || `Photo ${index + 1}`}
                            className="w-full h-auto max-h-64 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => {
                              // TODO: Implement lightbox/fullscreen view
                              console.log('Open photo in lightbox:', attachment);
                            }}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200" />
                        </div>
                      )}
                      
                      {attachment.type === 'VIDEO' && (
                        <div className="relative overflow-hidden rounded-lg border border-gray-200">
                          <video
                            src={attachment.url}
                            className="w-full h-auto max-h-64 object-cover"
                            controls
                            preload="metadata"
                            poster={attachment.url + '?w=400&h=300&c=crop'}
                          />
                        </div>
                      )}
                      
                      {attachment.type === 'AUDIO' && (
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Music size={20} className="text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {attachment.description || `Audio ${index + 1}`}
                              </p>
                              <audio
                                src={attachment.url}
                                controls
                                className="w-full mt-2"
                                preload="none"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {attachment.type === 'PDF' && (
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <FileText size={20} className="text-red-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {attachment.description || `Document ${index + 1}`}
                                </p>
                                <p className="text-xs text-gray-500">PDF Document</p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = attachment.url;
                                link.download = attachment.description || `document-${index + 1}.pdf`;
                                link.target = '_blank';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors"
                            >
                              Download
                            </button>
                          </div>
                        </div>
                      )}
                      
                      {/* Fallback for other file types */}
                      {!['PHOTO', 'VIDEO', 'AUDIO', 'PDF'].includes(attachment.type) && (
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                <File size={20} className="text-gray-600" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {attachment.description || `File ${index + 1}`}
                                </p>
                                <p className="text-xs text-gray-500">{attachment.type}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = attachment.url;
                                link.download = attachment.description || `file-${index + 1}`;
                                link.target = '_blank';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                              }}
                              className="px-3 py-1 bg-gray-600 text-white text-xs rounded-md hover:bg-gray-700 transition-colors"
                            >
                              Download
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center space-x-4">
              {/* Vote Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleVote('up')}
                  disabled={isVoting}
                  className={`flex items-center space-x-1 transition-colors disabled:opacity-50 ${
                    reply.hasUpvoted 
                      ? 'text-green-600' 
                      : 'text-gray-500 hover:text-green-600'
                  }`}
                >
                  <ThumbsUp size={14} />
                  <span className="text-xs font-medium">{reply.upvoteCount}</span>
                </button>
                
                <button
                  onClick={() => handleVote('down')}
                  disabled={isVoting}
                  className={`flex items-center space-x-1 transition-colors disabled:opacity-50 ${
                    reply.hasDownvoted 
                      ? 'text-red-600' 
                      : 'text-gray-500 hover:text-red-600'
                  }`}
                >
                  <ThumbsDown size={14} />
                  <span className="text-xs font-medium">{reply.downvoteCount}</span>
                </button>
              </div>
              
              {/* Reply Button */}
              {canReply && (
                <button 
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <Reply size={14} />
                  <span className="text-xs">Reply</span>
                </button>
              )}
              
              {/* Show/Hide Replies */}
              {reply.childReplies && reply.childReplies.length > 0 && (
                <button 
                  onClick={() => setShowReplies(!showReplies)}
                  className="text-xs text-blue-600 hover:underline flex items-center space-x-1"
                >
                  {showReplies ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  <span>
                    {showReplies ? 'Hide' : 'Show'} {reply.childReplies.length} {reply.childReplies.length === 1 ? 'reply' : 'replies'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reply Form */}
        {showReplyForm && canReply && (
          <div className="mt-3 ml-11">
            <ReplyForm
              topicId={topicId}
              parentReplyId={reply.id}
              currentUser={currentUser}
              onReply={handleReply}
              onCancel={() => setShowReplyForm(false)}
              placeholder={`Reply to ${reply.createdBy.firstName}...`}
              isAdmin={isAdmin}
            />
          </div>
        )}

        {/* Nested Replies */}
        {showReplies && reply.childReplies && reply.childReplies.length > 0 && depth < maxDepth && (
          <div className="mt-2">
            {reply.childReplies.map((nestedReply) => (
              <TopicReplyItem
                key={nestedReply.id}
                reply={nestedReply}
                currentUser={currentUser}
                topicId={topicId}
                onReply={onReply}
                onVote={onVote}
                depth={depth + 1}
                maxDepth={maxDepth}
                isAdmin={isAdmin}
                onUnauthorized={onUnauthorized}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
