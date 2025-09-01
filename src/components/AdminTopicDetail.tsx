import React, { useState } from 'react';
import { ArrowLeft, MessageCircle, MoreHorizontal, ThumbsUp, ThumbsDown, ChevronLeft, ChevronRight, Loader2, AlertCircle, Music, FileText, File } from 'lucide-react';
import { TopicResponseDto, TopicReplyRequestDto, Leader, AttachmentResponseDto, AttachmentType } from '../types';
import RegionalBadge from './RegionalBadge';
import { AttachmentViewer } from './AttachmentViewer';
import { ReplyForm } from './ReplyForm';
import { TopicReplyItem } from './TopicReplyItem';
import { useTopicReplies } from '../hooks/useTopicReplies';

interface AdminTopicDetailProps {
  topic: TopicResponseDto;
  currentLeader: Leader;
  onBack: () => void;
  onVote: (type: 'up' | 'down') => void;
  onReply: (content: string, parentId?: string) => void;
  onVoteReply: (replyId: string, type: 'up' | 'down') => void;
  onFollow: () => void;
  isFollowing: boolean;
}

// Helper function to convert Topic attachments to AttachmentResponseDto format
const convertAttachments = (attachments?: any[]): AttachmentResponseDto[] => {
  if (!attachments || attachments.length === 0) return [];
  
  return attachments.map(attachment => {
    // Handle both old Attachment interface and new AttachmentResponseDto
    if (attachment.type && typeof attachment.type === 'string') {
      // New format (AttachmentResponseDto)
      return attachment;
    } else {
      // Old format (Attachment) - convert to new format
      const typeMap: { [key: string]: AttachmentType } = {
        'image': AttachmentType.PHOTO,
        'video': AttachmentType.VIDEO,
        'audio': AttachmentType.AUDIO,
        'pdf': AttachmentType.PDF,
        'document': AttachmentType.PDF
      };
      
      return {
        id: parseInt(attachment.id) || 0,
        url: attachment.url,
        type: typeMap[attachment.type] || AttachmentType.PDF,
        description: attachment.name || attachment.description,
        uploadedAt: attachment.uploadedAt?.toISOString() || new Date().toISOString()
      };
    }
  });
};

const AdminTopicDetail: React.FC<AdminTopicDetailProps> = ({
  topic,
  currentLeader,
  onBack,
  onVote,
  onReply,
  onVoteReply,
  onFollow,
  isFollowing,
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);

  // Fetch topic replies
  const {
    replies,
    isLoading: repliesLoading,
    error: repliesError,
    totalPages,
    totalElements,
    currentPage,
    hasNext,
    hasPrevious,
    createReply,
    upvoteReply,
    downvoteReply,
    refetch: refetchReplies,
    fetchNextPage,
    fetchPreviousPage,
    goToPage,
  } = useTopicReplies({
    topicId: topic.id,
    enabled: true,
    page: 0,
    size: 20,
  });

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

  const handleReply = async (replyData: TopicReplyRequestDto) => {
    try {
      await createReply(replyData);
      setShowReplyForm(false);
    } catch (error) {
      console.error('Failed to create reply:', error);
    }
  };

  const handleVoteReply = async (replyId: number, type: 'up' | 'down') => {
    if (type === 'up') {
      return await upvoteReply(replyId);
    } else {
      return await downvoteReply(replyId);
    }
  };

  // Use vote counts from TopicResponseDto directly
  const upvotes = topic.upvoteCount;
  const downvotes = topic.downvoteCount;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6 p-4">
        <button
          onClick={onBack}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Topic Discussion</h1>
          <p className="text-gray-600">As a {currentLeader.level} leader</p>
        </div>
      </div>

      {/* Main Topic */}
      <div className="bg-white border-b border-gray-200">
        <div className="p-6">
          <div className="flex space-x-3">
            {topic.createdBy.profileUrl ? (
            <img
                src={topic.createdBy.profileUrl}
                alt={`${topic.createdBy.firstName} ${topic.createdBy.lastName}`}
              className="w-12 h-12 rounded-full flex-shrink-0"
            />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                {getUserInitials()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-semibold text-gray-900">
                  {parseInt(currentLeader.id) === topic.createdBy.id ? 'You' : `${topic.createdBy.firstName} ${topic.createdBy.lastName}`}
                </span>
                <button className="ml-auto p-1 rounded-full hover:bg-gray-100 transition-colors">
                  <MoreHorizontal size={16} className="text-gray-500" />
                </button>
              </div>
              <p className="text-gray-900 mb-3 leading-relaxed text-lg">
                {topic.description}
              </p>
              {topic.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {topic.tags.map(tag => (
                    <span key={tag} className="text-blue-600 hover:underline cursor-pointer">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              {topic.focusLocation && (
                <div className="mb-3">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                    {topic.focusLevel}: {topic.focusLocation.district}
                    {topic.focusLocation.sector && ` - ${topic.focusLocation.sector}`}
                    {topic.focusLocation.cell && ` - ${topic.focusLocation.cell}`}
                  </span>
                </div>
              )}
              <p className="text-gray-500 text-sm mb-4">{formatDate(topic.createdAt)}</p>
              
              {/* Topic Attachments - Twitter-style inline display */}
              {topic.attachments && topic.attachments.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Attachments</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {convertAttachments(topic.attachments).map((attachment, index) => (
                      <div key={`${attachment.id}-${index}`} className="relative">
                        {attachment.type === 'PHOTO' && (
                          <div className="group relative overflow-hidden rounded-lg border border-gray-200">
                            <img
                              src={attachment.url}
                              alt={attachment.description || `Photo ${index + 1}`}
                              className="w-full h-auto max-h-96 object-cover cursor-pointer hover:opacity-90 transition-opacity"
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
                              className="w-full h-auto max-h-96 object-cover"
                              controls
                              preload="metadata"
                              poster={attachment.url + '?w=600&h=400&c=crop'}
                            />
                          </div>
                        )}
                        
                        {attachment.type === 'AUDIO' && (
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Music size={24} className="text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-base font-medium text-gray-900">
                                  {attachment.description || `Audio ${index + 1}`}
                                </p>
                                <audio
                                  src={attachment.url}
                                  controls
                                  className="w-full mt-3"
                                  preload="none"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {attachment.type === 'PDF' && (
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                  <FileText size={24} className="text-red-600" />
                                </div>
                                <div>
                                  <p className="text-base font-medium text-gray-900">
                                    {attachment.description || `Document ${index + 1}`}
                                  </p>
                                  <p className="text-sm text-gray-500">PDF Document</p>
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
                                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                              >
                                Download
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {/* Fallback for other file types */}
                        {!['PHOTO', 'VIDEO', 'AUDIO', 'PDF'].includes(attachment.type) && (
                          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <File size={24} className="text-gray-600" />
                                </div>
                                <div>
                                  <p className="text-base font-medium text-gray-900">
                                    {attachment.description || `File ${index + 1}`}
                                  </p>
                                  <p className="text-sm text-gray-500">{attachment.type}</p>
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
                                className="px-4 py-2 bg-gray-600 text-white text-xs rounded-md hover:bg-gray-700 transition-colors"
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
              
              <div className="flex items-center space-x-6 py-3 border-t border-b border-gray-100">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onVote('up')}
                    className={`flex items-center space-x-1 transition-colors ${
                      topic.hasUpvoted 
                        ? 'text-green-600' 
                        : 'text-gray-500 hover:text-green-600'
                    }`}
                  >
                    <ThumbsUp size={16} />
                    <span className="text-sm">{upvotes}</span>
                  </button>
                  <button
                    onClick={() => onVote('down')}
                    className={`flex items-center space-x-1 transition-colors ${
                      topic.hasDownvoted 
                        ? 'text-red-600' 
                        : 'text-gray-500 hover:text-red-600'
                    }`}
                  >
                    <ThumbsDown size={16} />
                    <span className="text-sm">{downvotes}</span>
                  </button>
                </div>
                
                <div className="flex items-center space-x-1 text-gray-600">
                  <MessageCircle size={16} />
                  <span className="text-sm">{topic.replycount} replies</span>
                </div>
                
                {parseInt(currentLeader.id) !== topic.createdBy.id && (
                  <button
                    onClick={onFollow}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      isFollowing
                        ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reply Form - Only show for leaders */}
        {showReplyForm ? (
        <div className="border-b border-gray-200 p-6">
            <ReplyForm
              topicId={topic.id}
              currentUser={currentLeader}
              onReply={handleReply}
              onCancel={() => setShowReplyForm(false)}
              placeholder="Share your perspective as a community leader..."
              isAdmin={true}
            />
              </div>
        ) : (
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-center">
                <button
                onClick={() => setShowReplyForm(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                >
                <MessageCircle size={16} className="mr-2" />
                Reply as {currentLeader.level} Leader
                </button>
            </div>
          </div>
        )}
      </div>

      {/* Replies */}
      <div className="bg-white">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Replies ({totalElements})</h2>
          {repliesError && (
            <div className="text-red-600 text-sm mb-4">
              Error loading replies: {repliesError}
            </div>
          )}
        </div>

        {/* Replies List */}
        {repliesLoading ? (
          <div className="text-center py-12">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-500">Loading replies...</p>
          </div>
        ) : replies.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {replies.map((reply) => (
              <TopicReplyItem
                key={reply.id}
                reply={reply}
                currentUser={currentLeader}
                topicId={topic.id}
                onReply={handleReply}
                onVote={handleVoteReply}
                depth={0}
                maxDepth={3}
                isAdmin={true}
                onUnauthorized={undefined}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No replies yet. Be the first to reply as a community leader!</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 p-6 border-t border-gray-200">
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
      </div>
    </div>
  );
};

export default AdminTopicDetail;








