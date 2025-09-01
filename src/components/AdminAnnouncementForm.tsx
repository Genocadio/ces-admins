import React, { useState, useEffect } from 'react';
import { X, Save, Calendar, Upload, FileText, Image, Video, Music, File } from 'lucide-react';
import { AnnouncementResponseDto, AnnouncementRequestDto, AttachmentRequestDto, Language, AttachmentType } from '../types';

interface AdminAnnouncementFormProps {
  announcement?: AnnouncementResponseDto | null;
  onClose: () => void;
  onSubmit: (data: AnnouncementRequestDto) => void;
  currentLeader?: any;
}

const AdminAnnouncementForm: React.FC<AdminAnnouncementFormProps> = ({
  announcement,
  onClose,
  onSubmit,
  currentLeader
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: 'ENGLISH' as Language,
    endTime: '',
    hasExpiration: false
  });

  const [attachments, setAttachments] = useState<AttachmentRequestDto[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const languages: Language[] = ['ENGLISH', 'KINYARWANDA', 'FRENCH'];

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title,
        description: announcement.description,
        language: announcement.language,
        endTime: announcement.endTime ? new Date(announcement.endTime).toISOString().split('T')[0] : '',
        hasExpiration: !!announcement.endTime
      });
      setAttachments(announcement.attachments || []);
    }
  }, [announcement]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleAttachmentUpload = (attachment: AttachmentRequestDto) => {
    setAttachments(prev => [...prev, attachment]);
  };

  const handleAttachmentRemove = (attachmentToRemove: AttachmentRequestDto) => {
    setAttachments(prev => prev.filter(att => att.url !== attachmentToRemove.url));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters long';
    }
    if (formData.hasExpiration && !formData.endTime) {
      newErrors.endTime = 'Please select an expiration date';
    }
    if (formData.hasExpiration && formData.endTime && new Date(formData.endTime) <= new Date()) {
      newErrors.endTime = 'Expiration date must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const announcementData: AnnouncementRequestDto = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      language: formData.language,
      endTime: formData.hasExpiration && formData.endTime ? new Date(formData.endTime).toISOString() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Default to 30 days from now
      attachments: attachments.length > 0 ? attachments : undefined
    };

    onSubmit(announcementData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {announcement ? 'Edit Announcement' : 'Create New Announcement'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.title ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter announcement title..."
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={6}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Enter announcement description..."
            />
            <div className="flex justify-between items-center mt-1">
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
              <p className="text-sm text-gray-500 ml-auto">
                {formData.description.length}/1000 characters
              </p>
            </div>
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language *
            </label>
            <select
              value={formData.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {languages.map(language => (
                <option key={language} value={language}>
                  {language.charAt(0) + language.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
          </div>

          {/* Expiration Date */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center mb-4">
              <input
                type="checkbox"
                id="hasExpiration"
                checked={formData.hasExpiration}
                onChange={(e) => handleInputChange('hasExpiration', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="hasExpiration" className="ml-2 flex items-center text-sm font-medium text-gray-700">
                <Calendar className="w-4 h-4 mr-1" />
                Set Expiration Date
              </label>
            </div>

            {formData.hasExpiration && (
              <div>
                <input
                  type="date"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.endTime ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.endTime && (
                  <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
                )}
                <p className="mt-1 text-sm text-gray-500">
                  Announcement will automatically expire on this date
                </p>
              </div>
            )}
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments
            </label>
            <div className="space-y-4">
              {/* File Upload Input */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    files.forEach(file => {
                      // Create a temporary attachment (in real app, this would upload to Cloudinary)
                      const attachment: AttachmentRequestDto = {
                        url: URL.createObjectURL(file),
                        type: file.type.startsWith('image/') ? AttachmentType.PHOTO :
                              file.type.startsWith('video/') ? AttachmentType.VIDEO :
                              file.type.startsWith('audio/') ? AttachmentType.AUDIO :
                              AttachmentType.PDF,
                        description: file.name
                      };
                      handleAttachmentUpload(attachment);
                    });
                  }}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    Images, videos, audio, PDFs, and documents up to 10MB
                  </p>
                </label>
              </div>

              {/* Attachments List */}
              {attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Uploaded Files:</h4>
                  {attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {attachment.type === AttachmentType.PHOTO && <Image size={16} className="text-blue-600" />}
                        {attachment.type === AttachmentType.VIDEO && <Video size={16} className="text-green-600" />}
                        {attachment.type === AttachmentType.AUDIO && <Music size={16} className="text-purple-600" />}
                        {attachment.type === AttachmentType.PDF && <FileText size={16} className="text-red-600" />}
                        <span className="text-sm text-gray-700">{attachment.description}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAttachmentRemove(attachment)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <Save className="mr-2 h-4 w-4" />
              {announcement ? 'Update Announcement' : 'Create Announcement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAnnouncementForm;
