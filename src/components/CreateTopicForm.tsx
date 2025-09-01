import React, { useState, useEffect } from 'react';
import { X, Save, MapPin, Users, Hash, FileText } from 'lucide-react';
import { TopicRequestDto, LocationRequestDto, AttachmentRequestDto, Language, User, Leader } from '../types';
import { CloudinaryUpload } from './CloudinaryUpload';
import { TagSuggestions } from './TagSuggestions';
import { API_ENDPOINTS } from '../config/api';
import { cleanLocationData } from '../utils/dateUtils';

interface CreateTopicFormProps {
  onClose: () => void;
  onSubmit: (topic: TopicRequestDto) => void;
  isAdmin?: boolean;
  currentUser?: User | Leader;
}

export const CreateTopicForm: React.FC<CreateTopicFormProps> = ({
  onClose,
  onSubmit,
  isAdmin = false,
  currentUser
}) => {
  // Use the passed currentUser prop directly
  const user = currentUser;
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    tags: [] as string[],
    language: (user?.language as Language) || 'ENGLISH',
    focusLocation: {
      district: '',
      sector: '',
      cell: '',
      village: ''
    } as LocationRequestDto,
    taggedUserIds: [] as number[],
    attachments: [] as AttachmentRequestDto[]
  });

  const [showRegionalFocus, setShowRegionalFocus] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Set default location based on user's location
  useEffect(() => {
    if (user?.location) {
      setFormData(prev => ({
        ...prev,
        focusLocation: {
          district: user.location.district || '',
          sector: user.location.sector || '',
          cell: user.location.cell || '',
          village: user.location.village || ''
        }
      }));
    }
  }, [user]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleLocationChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      focusLocation: {
        ...prev.focusLocation,
        [field]: value
      }
    }));
  };



  const handleAttachmentUpload = (attachment: AttachmentRequestDto) => {
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, attachment]
    }));
  };

  const handleAttachmentRemove = (attachmentToRemove: AttachmentRequestDto) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(att => att !== attachmentToRemove)
    }));
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length > 255) {
      newErrors.title = 'Title must not exceed 255 characters';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 5000) {
      newErrors.description = 'Description must not exceed 5000 characters';
    }

    if (!formData.language) {
      newErrors.language = 'Language is required';
    }

    // Validate regional focus if enabled
    if (showRegionalFocus && isAdmin) {
      if (!formData.focusLocation.district) {
        newErrors.focusLocation = 'District is required for regional focus';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare topic data
      const topicData: TopicRequestDto = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        tags: formData.tags,
        language: formData.language,
        attachments: formData.attachments.length > 0 ? formData.attachments : undefined,
        taggedUserIds: formData.taggedUserIds.length > 0 ? formData.taggedUserIds : undefined
      };

      // Add regional focus for admin users if enabled
      if (showRegionalFocus && isAdmin && formData.focusLocation.district?.trim()) {
        topicData.focusLocation = cleanLocationData(formData.focusLocation);
      }

      onSubmit(topicData);
    } catch (error) {
      console.error('Error creating topic:', error);
      setErrors({ submit: 'Failed to create topic. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvailableRegions = () => {
    if (!user?.location) return [];

    const regions = [];
    if (user.location.district) {
      regions.push({ level: 'district', label: user.location.district });
    }
    if (user.location.sector) {
      regions.push({ level: 'sector', label: `${user.location.district} - ${user.location.sector}` });
    }
    if (user.location.cell) {
      regions.push({ level: 'cell', label: `${user.location.district} - ${user.location.sector} - ${user.location.cell}` });
    }
    return regions;
  };

  // Early return if no user is provided
  if (!user) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">User information not available. Please refresh the page.</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const availableRegions = getAvailableRegions();

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create New Topic</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
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
              placeholder="Enter topic title..."
              maxLength={255}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600">{errors.title}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {formData.title.length}/255 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              rows={6}
              placeholder="Describe your topic in detail..."
              maxLength={5000}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              {formData.description.length}/5000 characters
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (optional)
            </label>
            <TagSuggestions
              selectedTags={formData.tags}
              onTagSelect={(tag) => {
                if (!formData.tags.includes(tag)) {
                  setFormData(prev => ({
                    ...prev,
                    tags: [...prev.tags, tag]
                  }));
                }
              }}
              onTagRemove={(tag) => {
                setFormData(prev => ({
                  ...prev,
                  tags: prev.tags.filter(t => t !== tag)
                }));
              }}
              maxTags={10}
            />
          </div>

          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language *
            </label>
            <select
              value={formData.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.language ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="ENGLISH">English</option>
              <option value="KINYARWANDA">Kinyarwanda</option>
              <option value="FRENCH">French</option>
            </select>
            {errors.language && (
              <p className="mt-1 text-sm text-red-600">{errors.language}</p>
            )}
          </div>

          {/* Regional Focus - Only for admin users */}
          {isAdmin && (
            <div>
              <label className="flex items-center space-x-2 mb-2">
                <input
                  type="checkbox"
                  checked={showRegionalFocus}
                  onChange={(e) => setShowRegionalFocus(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">Enable Regional Focus</span>
                <MapPin size={16} className="text-gray-500" />
              </label>
              
              {showRegionalFocus && (
                <div className="ml-6 space-y-3 p-4 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        District *
                      </label>
                      <select
                        value={formData.focusLocation.district}
                        onChange={(e) => handleLocationChange('district', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.focusLocation ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Select District</option>
                        {availableRegions.map((region, index) => (
                          <option key={index} value={region.label.split(' - ')[0]}>
                            {region.label.split(' - ')[0]}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sector
                      </label>
                      <input
                        type="text"
                        value={formData.focusLocation.sector}
                        onChange={(e) => handleLocationChange('sector', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter sector..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cell
                      </label>
                      <input
                        type="text"
                        value={formData.focusLocation.cell}
                        onChange={(e) => handleLocationChange('cell', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter cell..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Village
                      </label>
                      <input
                        type="text"
                        value={formData.focusLocation.village}
                        onChange={(e) => handleLocationChange('village', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter village..."
                      />
                    </div>
                  </div>
                  {errors.focusLocation && (
                    <p className="text-sm text-red-600">{errors.focusLocation}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments (optional)
            </label>
            <CloudinaryUpload
              config={{
                cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
                uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
                folder: 'topics'
              }}
              onUploadSuccess={handleAttachmentUpload}
              multiple={true}
              maxFiles={5}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
              placeholder="Upload files (images, videos, documents)"
            />
            
            {formData.attachments.length > 0 && (
              <div className="mt-3 space-y-2">
                {formData.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <FileText size={16} className="text-gray-500" />
                      <span className="text-sm text-gray-700">
                        {attachment.description || `Attachment ${index + 1}`}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleAttachmentRemove(attachment)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save size={20} className="mr-2" />
              {isSubmitting ? 'Creating...' : 'Create Topic'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
