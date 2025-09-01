import React, { useState } from 'react';
import { Shield, Calendar, MessageCircle, Flag, Pin, Reply, AlertCircle } from 'lucide-react';
import { GovernmentReply as GovernmentReplyType, User } from '../types';
import { VoteButton } from './VoteButton';
import { CommentThread } from './CommentThread';
import { FileUpload } from './FileUpload';

interface GovernmentReplyProps {
  reply: GovernmentReplyType;
  currentUser: User;
  isIssueCreator: boolean; // Whether current user is the issue creator
  onVote: (replyId: string, type: 'up' | 'down') => void;
  onComment: (replyId: string, content: string, attachments?: File[]) => void;
  onReplyToComment: (parentId: string, content: string, attachments?: File[]) => void;
  onVoteComment: (commentId: string, type: 'up' | 'down') => void;
  onFollowUpResponse?: (replyId: string, content: string, attachments?: File[]) => void;
}

export const GovernmentReply: React.FC<GovernmentReplyProps> = ({
  reply,
  currentUser,
  isIssueCreator,
  onVote,
  onComment,
  onReplyToComment,
  onVoteComment,
  onFollowUpResponse,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [followUpContent, setFollowUpContent] = useState('');
  const [followUpFiles, setFollowUpFiles] = useState<File[]>([]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleComment = () => {
    if (newComment.trim()) {
      onComment(reply.id, newComment);
      setNewComment('');
    }
  };

  const handleFollowUpResponse = () => {
    if (followUpContent.trim() && onFollowUpResponse) {
      onFollowUpResponse(reply.id, followUpContent, followUpFiles.length > 0 ? followUpFiles : undefined);
      setFollowUpContent('');
      setFollowUpFiles([]);
      setShowFollowUpForm(false);
    }
  };

  const fileUploadConfig = {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    maxFiles: 5,
  };

  const priorityColors = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-6 mb-6">
      <div className="flex items-start space-x-4">
        <div className="relative">
          <img
            src={reply.author.avatar}
            alt={reply.author.name}
            className="w-12 h-12 rounded-full border-2 border-blue-200"
          />
          <div className="absolute -bottom-1 -right-1 bg-blue-600 rounded-full p-1">
            <Shield size={12} className="text-white" />
          </div>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <h4 className="font-semibold text-gray-900">{reply.author.name}</h4>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <Shield size={12} className="mr-1" />
                Official Response
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityColors[reply.priority]}`}>
                {reply.priority.charAt(0).toUpperCase() + reply.priority.slice(1)} Priority
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar size={14} />
              <span>{formatDate(reply.createdAt)}</span>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {reply.content}
            </p>

            {reply.attachments && reply.attachments.length > 0 && (
              <div className="mt-4 space-y-2">
                <h5 className="text-sm font-medium text-gray-700">Attachments:</h5>
                {reply.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    {attachment.type === 'image' ? (
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                    ) : (
                      <div className="w-20 h-20 bg-red-100 rounded flex items-center justify-center">
                        <span className="text-red-600 text-sm font-medium">PDF</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{attachment.name}</p>
                      <p className="text-sm text-gray-500">
                        {(attachment.size / 1024 / 1024).toFixed(1)} MB
                      </p>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      Download
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {reply.responseStatus === 'final' ? (
                <>
                  <VoteButton
                    votes={reply.votes}
                    onVote={(type) => onVote(reply.id, type)}
                    currentUserId={currentUser.id}
                  />
                  
                  <button
                    onClick={() => setShowComments(!showComments)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    <MessageCircle size={16} />
                    <span className="text-sm">
                      {reply.comments.length} {reply.comments.length === 1 ? 'Comment' : 'Comments'}
                    </span>
                  </button>
                </>
              ) : (
                <div className="flex items-center space-x-2 text-orange-600">
                  <AlertCircle size={16} />
                  <span className="text-sm font-medium">
                    {reply.followUpResponse ? 'Follow-up provided' : 'Awaiting additional information'}
                  </span>
                </div>
              )}

              <button className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors text-sm">
                <Flag size={14} />
                <span>Report</span>
              </button>
            </div>

            <div className="flex items-center space-x-2 text-xs text-gray-500">
              <Pin size={12} />
              <span>Official Response</span>
            </div>
          </div>

                    {/* Follow-up Response Display (visible only to issue creator and government) */}
          {reply.responseStatus === 'followup' && isIssueCreator && reply.followUpResponse && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Reply size={16} className="text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">Your Response</span>
                <span className="text-xs text-gray-500">
                  {formatDate(reply.followUpResponse.createdAt)}
                </span>
              </div>
              
              <p className="text-gray-800 mb-3 whitespace-pre-wrap">
                {reply.followUpResponse.content}
              </p>

              {reply.followUpResponse.attachments && reply.followUpResponse.attachments.length > 0 && (
                <div className="space-y-2">
                  <h6 className="text-sm font-medium text-gray-700">Your Attachments:</h6>
                  {reply.followUpResponse.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center space-x-3 p-3 bg-white rounded-lg border"
                    >
                      {attachment.type === 'image' ? (
                        <img
                          src={attachment.url}
                          alt={attachment.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-red-100 rounded flex items-center justify-center">
                          <span className="text-red-600 text-xs font-medium">PDF</span>
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">{attachment.name}</p>
                        <p className="text-xs text-gray-500">
                          {(attachment.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Simple Reply Button for followup responses */}
          {reply.responseStatus === 'followup' && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <AlertCircle size={16} className="text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  {reply.followUpResponse ? 'Response provided' : 'Additional information requested'}
                </span>
              </div>
              
              <button
                onClick={() => setShowFollowUpForm(!showFollowUpForm)}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
              >
                <Reply size={16} />
                <span>Reply</span>
              </button>
              
              {showFollowUpForm && (
                <div className="mt-4 space-y-4">
                  <textarea
                    value={followUpContent}
                    onChange={(e) => setFollowUpContent(e.target.value)}
                    placeholder="Add your reply..."
                    className="w-full p-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                  <FileUpload
                    onFilesSelected={setFollowUpFiles}
                    config={fileUploadConfig}
                    existingFiles={[]}
                  />
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleFollowUpResponse}
                      disabled={!followUpContent.trim()}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      Send Reply
                    </button>
                    <button
                      onClick={() => {
                        setShowFollowUpForm(false);
                        setFollowUpContent('');
                        setFollowUpFiles([]);
                      }}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Follow-up Response Form (visible only to issue creator for followup responses) */}
          {reply.responseStatus === 'followup' && isIssueCreator && !reply.followUpResponse && (
            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-3">
                <AlertCircle size={16} className="text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Additional information requested
                </span>
              </div>
              
              {!showFollowUpForm ? (
                <button
                  onClick={() => setShowFollowUpForm(true)}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                >
                  <Reply size={16} />
                  <span>Provide Information</span>
                </button>
              ) : (
                <div className="space-y-4">
                  <textarea
                    value={followUpContent}
                    onChange={(e) => setFollowUpContent(e.target.value)}
                    placeholder="Please provide the additional information requested..."
                    className="w-full p-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                  <FileUpload
                    onFilesSelected={setFollowUpFiles}
                    config={fileUploadConfig}
                    existingFiles={[]}
                  />
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={handleFollowUpResponse}
                      disabled={!followUpContent.trim()}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                    >
                      Send Response
                    </button>
                    <button
                      onClick={() => {
                        setShowFollowUpForm(false);
                        setFollowUpContent('');
                        setFollowUpFiles([]);
                      }}
                      className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {showComments && reply.responseStatus === 'final' && (
            <div className="mt-6 space-y-4">
              <div className="border-t border-gray-200 pt-4">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Comment on this official response..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleComment}
                    disabled={!newComment.trim()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
                  >
                    Comment
                  </button>
                </div>
              </div>

              {reply.comments.length > 0 && (
                <CommentThread
                  comments={reply.comments}
                  currentUser={currentUser}
                  onReply={onReplyToComment}
                  onVote={onVoteComment}
                  maxDepth={2}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};