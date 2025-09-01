import React, { useState } from 'react';
import { Send, Paperclip, AlertCircle, X } from 'lucide-react';
import { ResponseRequestDto, PostType, ResponseStatus, Language, ResponseResponseDto, AttachmentRequestDto } from '../types';
import { API_ENDPOINTS } from '../config/api';
import CloudinaryUpload from './CloudinaryUpload';
import { cloudinaryPresets } from '../config/cloudinary';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { adminAuthenticatedFetch } from '../utils/adminApiInterceptor';

interface ResponseFormProps {
  issueId: number;
  onResponseCreated: (response: ResponseResponseDto) => void;
  currentLanguage: Language;
}

export const ResponseForm: React.FC<ResponseFormProps> = ({
  issueId,
  onResponseCreated,
  currentLanguage
}) => {
  const { forceLogout } = useAdminAuth();
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<ResponseStatus>(ResponseStatus.IN_PROGRESS);
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
        postType: PostType.ISSUE,
        postId: issueId,
        message: message.trim(),
        language: currentLanguage,
        isPublic,
        status,
        attachments: attachments
      };

      const response = await adminAuthenticatedFetch(
        API_ENDPOINTS.RESPONSES.CREATE,
        {
          method: 'POST',
          body: JSON.stringify(responseData)
        },
        forceLogout
      );

      if (!response) {
        // 401 error occurred, user will be redirected to login
        return;
      }

      if (response.ok) {
        const createdResponse: ResponseResponseDto = await response.json();
        setMessage('');
        setStatus(ResponseStatus.IN_PROGRESS);
        setIsPublic(true);
        onResponseCreated(createdResponse);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create response');
      }
    } catch (error) {
      console.error('Error creating response:', error);
      setError('An error occurred while creating the response');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusDescription = (status: ResponseStatus) => {
    switch (status) {
      case ResponseStatus.FOLLOW_UP:
        return 'Request more information from user';
      case ResponseStatus.IN_PROGRESS:
        return 'Work is ongoing, more responses expected';
      case ResponseStatus.RESOLVED:
        return 'Issue has been resolved';
      case ResponseStatus.REJECTED:
        return 'Issue has been rejected';
      case ResponseStatus.ESCALATED:
        return 'Issue has been escalated to higher authority';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Response</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Status Selection */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
            Response Status *
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as ResponseStatus)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value={ResponseStatus.FOLLOW_UP}>Follow Up</option>
            <option value={ResponseStatus.IN_PROGRESS}>In Progress</option>
            <option value={ResponseStatus.RESOLVED}>Resolved</option>
            <option value={ResponseStatus.REJECTED}>Rejected</option>
            <option value={ResponseStatus.ESCALATED}>Escalated</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            {getStatusDescription(status)}
          </p>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            Response Message *
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your response message..."
            required
          />
        </div>

        {/* Public/Private Toggle */}
        <div className="flex items-center">
          <input
            id="isPublic"
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
            Make this response public
          </label>
        </div>

        {/* File Attachments */}
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Paperclip className="w-4 h-4 mr-2" />
              Attachments
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Upload supporting documents, images, or other files for this response
            </p>
          </div>

          <CloudinaryUpload
            config={cloudinaryPresets.responseAttachments()}
            onUploadSuccess={(attachment) => setAttachments(prev => [...prev, attachment])}
            onUploadError={(error) => console.error('Upload error:', error)}
            multiple={true}
            placeholder="Upload response files (max 5)"
            accept=".jpg,.jpeg,.png,.gif,.pdf,.mp4,.avi,.mov,.mp3,.wav"
            showPreview={false}
          />

          {/* Display uploaded attachments */}
          {attachments.length > 0 && (
            <div className="mt-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files:</h5>
              <div className="space-y-2">
                {attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Paperclip className="w-4 h-4 text-gray-400" />
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">{attachment.description}</p>
                        <p className="text-gray-500">{attachment.type}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-center space-x-2 text-red-600 text-sm">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting || !message.trim()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Send size={16} className="mr-2" />
                Create Response
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResponseForm;
