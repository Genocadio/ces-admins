import React, { useState } from 'react';
import { Send, Paperclip, AlertCircle, X } from 'lucide-react';
import { ResponseRequestDto, PostType, ResponseStatus, Language, ResponseResponseDto, AttachmentRequestDto } from '../types';
import { API_ENDPOINTS } from '../config/api';
import CloudinaryUpload from './CloudinaryUpload';
import { cloudinaryPresets } from '../config/cloudinary';
import { useAuth } from '../contexts/AuthContext';
import { getAuthHeaders } from '../utils/apiInterceptor';

interface UserFollowUpResponseFormProps {
  responseId: number;
  onResponseCreated: (response: ResponseResponseDto) => void;
  currentLanguage: Language;
  onCancel: () => void;
}

export const UserFollowUpResponseForm: React.FC<UserFollowUpResponseFormProps> = ({
  responseId,
  onResponseCreated,
  currentLanguage,
  onCancel
}) => {
  const { refreshSession } = useAuth();
  const [message, setMessage] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [attachments, setAttachments] = useState<AttachmentRequestDto[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      setError('Message is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const responseData: ResponseRequestDto = {
        postType: PostType.RESPONSE, // This is a response to a response
        postId: responseId, // The ID of the government response
        message: message.trim(),
        language: currentLanguage,
        isPublic,
        status: ResponseStatus.FOLLOW_UP, // User follow-up responses are always FOLLOW_UP
        attachments: attachments
      };

      const headers = await getAuthHeaders(refreshSession);
      const response = await fetch(API_ENDPOINTS.RESPONSES.CREATE, {
        method: 'POST',
        headers: {
          ...headers,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(responseData)
      });

      if (response.ok) {
        const createdResponse: ResponseResponseDto = await response.json();
        setMessage('');
        setIsPublic(true);
        setAttachments([]);
        onResponseCreated(createdResponse);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create follow-up response');
      }
    } catch (error) {
      console.error('Error creating follow-up response:', error);
      setError('An error occurred while creating the follow-up response');
    } finally {
      setIsSubmitting(false);
    }
  };





  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-medium">
            <Send size={20} />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-yellow-900">
              Submit Follow-up Response
            </h4>
            <p className="text-sm text-yellow-700">
              The government has requested more information. Please provide the additional details they need.
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-100 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Message Input */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-yellow-800 mb-2">
            Your Response *
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Provide the additional information requested by the government..."
            className="w-full p-4 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
            rows={4}
            required
          />
        </div>



        {/* Privacy Setting */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="isPublic"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-yellow-300 rounded"
          />
          <label htmlFor="isPublic" className="text-sm text-yellow-800">
            Make this response public (visible to other users)
          </label>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-yellow-800 mb-2">
            Attachments (Optional)
          </label>
          <CloudinaryUpload
            config={cloudinaryPresets.responseAttachments()}
            onUploadSuccess={(attachment) => setAttachments(prev => [...prev, attachment])}
            onUploadError={(error) => console.error('Upload error:', error)}
            multiple={true}
            placeholder="Upload response files (max 5)"
            accept=".jpg,.jpeg,.png,.gif,.pdf,.mp4,.avi,.mov,.mp3,.wav"
            showPreview={false}
            className="border-2 border-dashed border-yellow-300 rounded-lg p-6 text-center hover:border-yellow-400 transition-colors"
          />
          
          {/* Display uploaded attachments */}
          {attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {attachments.map((attachment, index) => (
                <div key={index} className="flex items-center justify-between bg-yellow-100 p-2 rounded">
                  <div className="flex items-center space-x-2">
                    <Paperclip className="w-4 h-4 text-yellow-600" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-800">{attachment.description || 'File'}</p>
                      <p className="text-yellow-600">{attachment.type}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(index)}
                    className="text-yellow-600 hover:text-yellow-800"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle size={16} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-yellow-700 bg-yellow-100 border border-yellow-300 rounded-lg hover:bg-yellow-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !message.trim()}
            className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-yellow-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Submit Response</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserFollowUpResponseForm;
