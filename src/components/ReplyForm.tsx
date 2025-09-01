import React, { useState } from 'react';
import { Send, X, Tag, Paperclip, FileText, Image, Video, Music, File } from 'lucide-react';
import { TopicReplyRequestDto, Language, User, Leader, AttachmentRequestDto, AttachmentType } from '../types';
import { CloudinaryUpload } from './CloudinaryUpload';
import { TagSuggestions } from './TagSuggestions';

interface ReplyFormProps {
  topicId: number;
  parentReplyId?: number;
  currentUser: User | Leader;
  onReply: (replyData: TopicReplyRequestDto) => Promise<void>;
  onCancel: () => void;
  placeholder?: string;
  isAdmin?: boolean;
  className?: string;
}

export const ReplyForm: React.FC<ReplyFormProps> = ({
  topicId,
  parentReplyId,
  currentUser,
  onReply,
  onCancel,
  placeholder = "Add your reply...",
  isAdmin = false,
  className = "",
}) => {
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<AttachmentRequestDto[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAttachmentUpload = (attachment: AttachmentRequestDto) => {
    console.log('Reply attachment uploaded successfully:', attachment);
    setAttachments(prev => [...prev, attachment]);
  };

  const handleAttachmentRemove = (attachmentToRemove: AttachmentRequestDto) => {
    console.log('Removing attachment:', attachmentToRemove);
    setAttachments(prev => {
      const newAttachments = prev.filter(att => att.url !== attachmentToRemove.url);
      console.log('Attachments after removal:', newAttachments);
      return newAttachments;
    });
  };

  const handleUploadError = (error: string) => {
    console.error('Reply attachment upload error:', error);
    // You might want to show an error message to the user here
  };

  const handleUploadComplete = (uploadedAttachments: AttachmentRequestDto[]) => {
    console.log('Batch upload completed:', uploadedAttachments);
    // This callback is called when all files in a batch are processed
    // The individual successes are already handled by handleAttachmentUpload
  };

  const getFileIcon = (type: AttachmentType) => {
    switch (type) {
      case AttachmentType.PHOTO:
        return <Image size={16} className="text-blue-500" />;
      case AttachmentType.VIDEO:
        return <Video size={16} className="text-green-500" />;
      case AttachmentType.AUDIO:
        return <Music size={16} className="text-purple-500" />;
      case AttachmentType.PDF:
        return <FileText size={16} className="text-red-500" />;
      default:
        return <File size={16} className="text-gray-500" />;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim()) return;

    setIsSubmitting(true);
    
    try {
      console.log('Submitting reply with attachments:', attachments);
      
      const replyData: TopicReplyRequestDto = {
        description: description.trim(),
        tags: tags.length > 0 ? tags : undefined,
        language: (currentUser as any).language || 'ENGLISH',
        topicId,
        parentReplyId,
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      console.log('Final reply data being sent:', replyData);
      await onReply(replyData);
      
      // Reset form
      setDescription('');
      setTags([]);
      setAttachments([]);
    } catch (error) {
      console.error('Failed to create reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <img
            src={(currentUser as any).profileUrl || (currentUser as any).avatar || '/default-avatar.png'}
            alt={(currentUser as any).firstName || (currentUser as any).name}
            className="w-8 h-8 rounded-full flex-shrink-0"
          />
          <div>
            <span className="text-sm font-medium text-gray-900">
              {isAdmin ? `${(currentUser as Leader).level} Leader` : 'You'}
            </span>
            <p className="text-xs text-gray-500">
              {parentReplyId ? 'Replying to a reply' : 'Replying to topic'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Reply Content */}
      <div className="mb-3">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder={placeholder}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={4}
          maxLength={5000}
          disabled={isSubmitting}
        />
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500">
            {description.length}/5000 characters
          </span>
          <span className="text-xs text-gray-400">
            Ctrl+Enter to submit
          </span>
        </div>
      </div>

      {/* Tags */}
      <div className="mb-3">
        <TagSuggestions
          selectedTags={tags}
          onTagSelect={(tag) => {
            if (!tags.includes(tag)) {
              setTags(prev => [...prev, tag]);
            }
          }}
          onTagRemove={(tag) => {
            setTags(prev => prev.filter(t => t !== tag));
          }}
          maxTags={5}
        />
      </div>

      {/* Attachments */}
      <div className="mb-4">
        <div className="flex items-center space-x-2 mb-2">
          <Paperclip size={16} className="text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Attachments (optional)</span>
        </div>
        <CloudinaryUpload
          config={{
            cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
            uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
            folder: 'topic-replies'
          }}
          onUploadSuccess={handleAttachmentUpload}
          onUploadError={handleUploadError}
          onUploadComplete={handleUploadComplete}
          multiple={true}
          maxFiles={5}
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          placeholder="Upload files (images, videos, documents)"
          showPreview={false}
        />
        
        {attachments.length > 0 && (
          <div className="mt-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files:</h4>
            <div className="space-y-2">
              {attachments.map((attachment, index) => (
                <div key={`${attachment.url}-${index}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(attachment.type)}
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {attachment.description || `Attachment ${index + 1}`}
                      </p>
                      <p className="text-xs text-gray-500">{attachment.type}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAttachmentRemove(attachment)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-600 text-sm hover:bg-gray-100 rounded-lg transition-colors"
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!description.trim() || isSubmitting}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={16} className="mr-2" />
          {isSubmitting ? 'Posting...' : 'Post Reply'}
        </button>
      </div>
    </form>
  );
};
