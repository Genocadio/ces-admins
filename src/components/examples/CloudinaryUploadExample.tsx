import React, { useState } from 'react';
import CloudinaryUpload from '../CloudinaryUpload';
import { cloudinaryPresets, createCustomCloudinaryConfig } from '../../config/cloudinary';
import { AttachmentRequestDto } from '../../types';

export const CloudinaryUploadExample: React.FC = () => {
  const [issueAttachments, setIssueAttachments] = useState<AttachmentRequestDto[]>([]);
  const [responseAttachments, setResponseAttachments] = useState<AttachmentRequestDto[]>([]);
  const [profilePicture, setProfilePicture] = useState<AttachmentRequestDto | null>(null);
  const [customAttachments, setCustomAttachments] = useState<AttachmentRequestDto[]>([]);

  const handleIssueUploadSuccess = (attachment: AttachmentRequestDto) => {
    console.log('Issue attachment uploaded:', attachment);
    setIssueAttachments(prev => [...prev, attachment]);
  };

  const handleResponseUploadSuccess = (attachment: AttachmentRequestDto) => {
    console.log('Response attachment uploaded:', attachment);
    setResponseAttachments(prev => [...prev, attachment]);
  };

  const handleProfileUploadSuccess = (attachment: AttachmentRequestDto) => {
    console.log('Profile picture uploaded:', attachment);
    setProfilePicture(attachment);
  };

  const handleCustomUploadSuccess = (attachment: AttachmentRequestDto) => {
    console.log('Custom attachment uploaded:', attachment);
    setCustomAttachments(prev => [...prev, attachment]);
  };

  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
    // You can show a toast notification here
  };

  const handleUploadComplete = (attachments: AttachmentRequestDto[]) => {
    console.log('Upload complete:', attachments);
    // You can send these attachments to your backend here
  };

  // Custom configuration for specific use case
  const customConfig = createCustomCloudinaryConfig({
    folder: 'ces-custom-files',
    maxFiles: 2,
    allowedFormats: ['pdf'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
  });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Cloudinary Upload Examples</h1>

      {/* Issue Attachments Example */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Issue Attachments</h2>
        <p className="text-gray-600 mb-4">
          Upload files related to issues (images, documents, max 3 files)
        </p>
        <CloudinaryUpload
          config={cloudinaryPresets.issueAttachments()}
          onUploadSuccess={handleIssueUploadSuccess}
          onUploadError={handleUploadError}
          onUploadComplete={handleUploadComplete}
          multiple={true}
          placeholder="Upload issue-related files (max 3)"
          accept=".jpg,.jpeg,.png,.gif,.pdf"
        />
        {issueAttachments.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Uploaded Issue Attachments:</h4>
            <div className="space-y-2">
              {issueAttachments.map((attachment, index) => (
                <div key={index} className="text-sm text-blue-800">
                  • {attachment.description} ({attachment.type})
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Response Attachments Example */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Response Attachments</h2>
        <p className="text-gray-600 mb-4">
          Upload files for responses (images, documents, videos, max 5 files)
        </p>
        <CloudinaryUpload
          config={cloudinaryPresets.responseAttachments()}
          onUploadSuccess={handleResponseUploadSuccess}
          onUploadError={handleUploadError}
          onUploadComplete={handleUploadComplete}
          multiple={true}
          placeholder="Upload response files (max 5)"
          accept=".jpg,.jpeg,.png,.gif,.pdf,.mp4,.avi,.mov"
        />
        {responseAttachments.length > 0 && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">Uploaded Response Attachments:</h4>
            <div className="space-y-2">
              {responseAttachments.map((attachment, index) => (
                <div key={index} className="text-sm text-green-800">
                  • {attachment.description} ({attachment.type})
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Profile Picture Example */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Picture</h2>
        <p className="text-gray-600 mb-4">
          Upload a single profile picture (images only, max 2MB)
        </p>
        <CloudinaryUpload
          config={cloudinaryPresets.profilePictures()}
          onUploadSuccess={handleProfileUploadSuccess}
          onUploadError={handleUploadError}
          multiple={false}
          placeholder="Upload profile picture"
          accept=".jpg,.jpeg,.png,.gif"
        />
        {profilePicture && (
          <div className="mt-4 p-3 bg-purple-50 rounded-lg">
            <h4 className="font-medium text-purple-900 mb-2">Profile Picture Uploaded:</h4>
            <div className="text-sm text-purple-800">
              • {profilePicture.description} ({profilePicture.type})
            </div>
          </div>
        )}
      </div>

      {/* Custom Configuration Example */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Custom Configuration</h2>
        <p className="text-gray-600 mb-4">
          Custom configuration for specific file types (documents only, max 2 files, 5MB each)
        </p>
        <CloudinaryUpload
          config={customConfig}
          onUploadSuccess={handleCustomUploadSuccess}
          onUploadError={handleUploadError}
          onUploadComplete={handleUploadComplete}
          multiple={true}
          placeholder="Upload PDF documents only (max 2, 5MB each)"
          accept=".pdf"
        />
        {customAttachments.length > 0 && (
          <div className="mt-4 p-3 bg-orange-50 rounded-lg">
            <h4 className="font-medium text-orange-900 mb-2">Uploaded Custom Attachments:</h4>
            <div className="space-y-2">
              {customAttachments.map((attachment, index) => (
                <div key={index} className="text-sm text-orange-800">
                  • {attachment.description} ({attachment.type})
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Backend Integration Example */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Backend Integration</h2>
        <p className="text-gray-600 mb-4">
          Example of how to send attachments to your backend API
        </p>
        <div className="bg-gray-50 p-4 rounded-lg">
          <pre className="text-sm text-gray-800 overflow-x-auto">
{`// Example of sending attachments to backend
const submitWithAttachments = async () => {
  const responseData = {
    postType: 'RESPONSE',
    postId: 123,
    message: 'Response with attachments',
    attachments: [...issueAttachments, ...responseAttachments]
  };

  try {
    const response = await fetch('/api/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ${token}'
      },
      body: JSON.stringify(responseData)
    });
    
    if (response.ok) {
      console.log('Response submitted successfully');
    }
  } catch (error) {
    console.error('Error submitting response:', error);
  }
};`}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default CloudinaryUploadExample;
