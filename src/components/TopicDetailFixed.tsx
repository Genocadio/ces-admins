import React, { useState } from 'react';
import { ArrowLeft, MessageCircle, MoreHorizontal } from 'lucide-react';
import { Topic, TopicReply, User } from '../types';
import { VoteButton } from './VoteButton';
import RegionalBadge from './RegionalBadge';
import { FileUpload } from './FileUpload';
import { useLoginPrompt } from '../contexts/LoginPromptContext';

interface TopicDetailProps {
  topic: Topic;
  currentUser: User | null;
  onBack: () => void;
  onVote: (type: 'up' | 'down') => void;
  onReply: (content: string, parentId?: string) => void;
  onVoteReply: (replyId: string, type: 'up' | 'down') => void;
  onFollow: () => void;
  isFollowing: boolean;
}

interface TopicReplyItemProps {
  reply: TopicReply;
  currentUser: User | null;
  onReply: (content: string, parentId: string) => void;
  onVote: (replyId: string, type: 'up' | 'down') => void;
  depth: number;
  maxDepth: number;
}

const TopicReplyItem: React.FC<TopicReplyItemProps> = ({
  reply,
  currentUser,
  onReply,
  onVote,
  depth = 0,
  maxDepth = 3,
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showReplies, setShowReplies] = useState(true);
  const { showLoginPrompt } = useLoginPrompt();

  const formatDate = (date: Date) => {
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

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply(replyContent, reply.id);
      setReplyContent('');
      setShowReplyForm(false);
    }
  };

  const fileUploadConfig = {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4'],
    maxFiles: 5,
  };

  const marginLeft = Math.min(depth * 40, maxDepth * 40);

  return (
    <div className={`border-l border-gray-200`} style={{ marginLeft: `${marginLeft}px` }}>
      <div className="p-4 hover:bg-gray-50 transition-colors">
        <div className="flex space-x-3">
          <img
            src={reply.author.avatar}
            alt={reply.author.name}
            className="w-8 h-8 rounded-full flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-semibold text-gray-900 text-sm">{currentUser?.id === reply.author.id ? 'You' : reply.author.name}</span>
              {reply.author.isGovernment && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  Gov
                </span>
              )}
              <span className="text-gray-500 text-sm">·</span>
              <span className="text-gray-500 text-sm">{formatDate(reply.createdAt)}</span>
              <button className="ml-auto p-1 rounded-full hover:bg-gray-100 transition-colors">
                <MoreHorizontal size={14} className="text-gray-500" />
              </button>
            </div>
            <p className="text-gray-900 mb-2 leading-relaxed text-sm">
              {reply.content}
            </p>

            {/* Reply Attachments */}
            {reply.attachments && reply.attachments.length > 0 && (
              <div className="mb-3 space-y-2">
                {reply.attachments.map((attachment) => (
                  <div key={attachment.id}>
                    {attachment.type === 'image' ? (
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="max-w-sm rounded-lg"
                      />
                    ) : attachment.type === 'video' ? (
                      <video
                        src={attachment.url}
                        controls
                        className="max-w-sm rounded-lg"
                        preload="metadata"
                      >
                        Your browser does not support the video tag.
                      </video>
                    ) : (
                      <div className="flex items-center space-x-2 p-2 bg-gray-100 rounded-lg max-w-sm">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                          <span className="text-blue-600 text-xs font-medium">
                            {attachment.type === 'pdf' ? 'PDF' : 'FILE'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{attachment.name}</p>
                          <p className="text-xs text-gray-500">
                            {(attachment.size / 1024 / 1024).toFixed(1)} MB
                          </p>
                        </div>
                        <button className="text-blue-600 hover:text-blue-800 text-xs">
                          Download
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center space-x-4">
              <VoteButton
                votes={reply.votes}
                onVote={(type) => onVote(reply.id, type)}
                currentUserId={currentUser?.id || ''}
                size="sm"
              />
              {currentUser ? (
                <button 
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <MessageCircle size={14} />
                  <span className="text-xs">Reply</span>
                </button>
              ) : (
                <button 
                  onClick={() => showLoginPrompt('Please log in to reply to this topic', () => setShowReplyForm(true))}
                  className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors"
                >
                  <MessageCircle size={14} />
                  <span className="text-xs">Reply</span>
                </button>
              )}
              {reply.replies.length > 0 && (
                <button 
                  onClick={() => setShowReplies(!showReplies)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  {showReplies ? 'Hide' : 'Show'} {reply.replies.length} {reply.replies.length === 1 ? 'reply' : 'replies'}
                </button>
              )}
            </div>
          </div>
        </div>

        {showReplyForm && currentUser && (
          <div className="mt-3 ml-11">
            <div className="flex space-x-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full flex-shrink-0"
              />
              <div className="flex-1">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Add your reply"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                  rows={3}
                />
                <div className="mt-2">
                  <FileUpload
                    onFilesSelected={() => {}}
                    config={fileUploadConfig}
                    existingFiles={[]}
                  />
                </div>
                <div className="flex justify-end space-x-2 mt-2">
                  <button
                    onClick={() => {
                      setShowReplyForm(false);
                      setReplyContent('');
                    }}
                    className="px-3 py-1.5 text-gray-600 text-sm hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReply}
                    disabled={!replyContent.trim()}
                    className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showReplies && reply.replies.length > 0 && depth < maxDepth && (
          <div className="mt-2">
            {reply.replies.map((nestedReply) => (
              <TopicReplyItem
                key={nestedReply.id}
                reply={nestedReply}
                currentUser={currentUser}
                onReply={onReply}
                onVote={onVote}
                depth={depth + 1}
                maxDepth={maxDepth}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const TopicDetail: React.FC<TopicDetailProps> = ({
  topic,
  currentUser,
  onBack,
  onVote,
  onReply,
  onVoteReply,
  onFollow,
  isFollowing,
}) => {
  const [newReply, setNewReply] = useState('');
  const { showLoginPrompt } = useLoginPrompt();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleReply = () => {
    if (newReply.trim()) {
      onReply(newReply);
      setNewReply('');
    }
  };

  const fileUploadConfig = {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf', 'video/mp4'],
    maxFiles: 5,
  };

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
          <h1 className="text-xl font-bold text-gray-900">Topic</h1>
        </div>
      </div>

      {/* Main Topic */}
      <div className="bg-white border-b border-gray-200">
        <div className="p-6">
          <div className="flex space-x-3">
            <img
              src={topic.author.avatar}
              alt={topic.author.name}
              className="w-12 h-12 rounded-full flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-semibold text-gray-900">{currentUser?.id === topic.author.id ? 'You' : topic.author.name}</span>
                {topic.author.isGovernment && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    Gov
                  </span>
                )}
                <button className="ml-auto p-1 rounded-full hover:bg-gray-100 transition-colors">
                  <MoreHorizontal size={16} className="text-gray-500" />
                </button>
              </div>
              <p className="text-gray-900 mb-3 leading-relaxed text-lg">
                {topic.content}
              </p>
              {topic.hashtags.length > 0 && (
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
              <p className="text-gray-500 text-sm mb-4">{formatDate(topic.createdAt)}</p>
              
              <div className="flex items-center space-x-6 py-3 border-t border-b border-gray-100">
                <VoteButton
                  votes={topic.votes}
                  onVote={onVote}
                  currentUserId={currentUser?.id || ''}
                />
                <div className="flex items-center space-x-1 text-gray-600">
                  <MessageCircle size={16} />
                  <span className="text-sm">{topic.replies.length} replies</span>
                </div>
                {currentUser ? (
                  currentUser?.id !== topic.author.id && (
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
                  )
                ) : (
                  <button
                    onClick={() => showLoginPrompt('Please log in to follow topics')}
                    className="px-4 py-2 rounded-full text-sm font-medium transition-colors bg-gray-100 text-gray-700 hover:bg-gray-200"
                  >
                    Follow
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Reply Form - Only show for logged in users */}
        {currentUser && (
          <div className="border-b border-gray-200 p-6">
            <div className="flex space-x-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-12 h-12 rounded-full flex-shrink-0"
              />
              <div className="flex-1">
                <textarea
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  placeholder="Add your reply"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                />
                <div className="mt-3">
                  <FileUpload
                    onFilesSelected={() => {}}
                    config={fileUploadConfig}
                    existingFiles={[]}
                  />
                </div>
                <div className="flex justify-end mt-3">
                  <button
                    onClick={handleReply}
                    disabled={!newReply.trim()}
                    className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Reply
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Replies */}
      <div className="bg-white">
        {topic.replies.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {topic.replies.map((reply) => (
              <TopicReplyItem
                key={reply.id}
                reply={reply}
                currentUser={currentUser}
                onReply={(content, parentId) => onReply(content, parentId)}
                onVote={onVoteReply}
                depth={0}
                maxDepth={3}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
            <p>No replies yet. Be the first to reply!</p>
          </div>
        )}
      </div>
    </div>
  );
};
