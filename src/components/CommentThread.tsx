import React, { useState } from 'react';
import { Reply, MoreHorizontal, Flag, Edit, Trash2 } from 'lucide-react';
import { Comment, User } from '../types';
import { VoteButton } from './VoteButton';
import { useLoginPrompt } from '../contexts/LoginPromptContext';

interface CommentThreadProps {
  comments: Comment[];
  currentUser: User | null;
  onReply: (parentId: string, content: string) => void;
  onVote: (commentId: string, type: 'up' | 'down') => void;
  onEdit?: (commentId: string, content: string) => void;
  onDelete?: (commentId: string) => void;
  onReport?: (commentId: string, reason: string) => void;
  maxDepth?: number;
  currentDepth?: number;
}

export const CommentThread: React.FC<CommentThreadProps> = ({
  comments,
  currentUser,
  onReply,
  onVote,
  onEdit,
  onDelete,
  onReport,
  maxDepth = 3,
  currentDepth = 0,
}) => {
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState('');
  const { showLoginPrompt } = useLoginPrompt();

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return minutes < 1 ? 'Just now' : `${minutes}m ago`;
      }
      return `${hours}h ago`;
    }
    return `${days}d ago`;
  };

  const handleReply = (parentId: string) => {
    if (replyContent.trim()) {
      onReply(parentId, replyContent);
      setReplyContent('');
      setReplyingTo(null);
    }
  };

  const handleEdit = (commentId: string) => {
    if (editContent.trim() && onEdit) {
      onEdit(commentId, editContent);
      setEditContent('');
      setEditingComment(null);
    }
  };

  const startEdit = (comment: Comment) => {
    setEditingComment(comment.id);
    setEditContent(comment.content);
  };

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <div key={comment.id} className="group">
          <div className="flex space-x-3">
            <img
              src={comment.author.avatar}
              alt={comment.author.name}
              className="w-8 h-8 rounded-full flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900 text-sm">
                      {currentUser?.id === comment.author.id ? 'You' : comment.author.name}
                    </span>
                    {comment.author.isGovernment && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {comment.author.department || 'Gov'}
                      </span>
                    )}
                    <span className="text-gray-500 text-xs">
                      {formatDate(comment.createdAt)}
                    </span>
                    {comment.updatedAt > comment.createdAt && (
                      <span className="text-gray-400 text-xs">(edited)</span>
                    )}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="relative">
                      <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                        <MoreHorizontal size={14} />
                      </button>
                      {/* Dropdown menu would be implemented here */}
                    </div>
                  </div>
                </div>

                {editingComment === comment.id ? (
                  <div className="space-y-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={3}
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(comment.id)}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingComment(null)}
                        className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-800 text-sm leading-relaxed">
                    {comment.content}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-4 mt-2">
                <VoteButton
                  votes={comment.votes}
                  onVote={(type) => onVote(comment.id, type)}
                  currentUserId={currentUser?.id || ''}
                  size="sm"
                />
                
                {currentDepth < maxDepth && (
                  currentUser ? (
                    <button
                      onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                      className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors text-sm"
                    >
                      <Reply size={14} />
                      <span>Reply</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => showLoginPrompt('Please log in to reply to comments', () => setReplyingTo(comment.id))}
                      className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors text-sm"
                    >
                      <Reply size={14} />
                      <span>Reply</span>
                    </button>
                  )
                )}

                {currentUser?.id === comment.author.id && onEdit && (
                  <button
                    onClick={() => startEdit(comment)}
                    className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors text-sm"
                  >
                    <Edit size={14} />
                    <span>Edit</span>
                  </button>
                )}

                {(currentUser?.id === comment.author.id || currentUser?.role === 'moderator') && onDelete && (
                  <button
                    onClick={() => onDelete(comment.id)}
                    className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors text-sm"
                  >
                    <Trash2 size={14} />
                    <span>Delete</span>
                  </button>
                )}

                {currentUser?.id !== comment.author.id && onReport && (
                  <button
                    onClick={() => onReport(comment.id, 'inappropriate')}
                    className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors text-sm"
                  >
                    <Flag size={14} />
                    <span>Report</span>
                  </button>
                )}
              </div>

              {replyingTo === comment.id && currentUser && (
                <div className="mt-3 ml-4 space-y-3">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleReply(comment.id)}
                      disabled={!replyContent.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      Reply
                    </button>
                    <button
                      onClick={() => setReplyingTo(null)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {comment.replies && comment.replies.length > 0 && currentDepth < maxDepth && (
                <div className="mt-4 ml-4 border-l-2 border-gray-200 pl-4">
                  <CommentThread
                    comments={comment.replies}
                    currentUser={currentUser}
                    onReply={onReply}
                    onVote={onVote}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onReport={onReport}
                    maxDepth={maxDepth}
                    currentDepth={currentDepth + 1}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};