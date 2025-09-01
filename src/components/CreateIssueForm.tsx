import React, { useState, useEffect } from 'react';
import { X, MapPin, Upload, Plus, Trash2, Users } from 'lucide-react';
import { IssueRequestDto, AttachmentRequestDto, LocationRequestDto, IssueType, AttachmentType, Language, UserResponseDto } from '../types';
import { getTranslation } from '../i18n/translations';
import { useAuth } from '../contexts/AuthContext';
import CloudinaryUpload from './CloudinaryUpload';
import { cloudinaryPresets } from '../config/cloudinary';
import { API_ENDPOINTS } from '../config/api';
import { cleanLocationData } from '../utils/dateUtils';

interface CreateIssueFormProps {
  onClose: () => void;
  onSubmit: (issueData: IssueRequestDto) => void;
  currentUser: any;
  language: Language;
}

const CreateIssueForm: React.FC<CreateIssueFormProps> = ({
  onClose,
  onSubmit,
  currentUser,
  language
}) => {
  const { currentUser: authUser, isAuthenticated } = useAuth();
  
  // Use authenticated user from context if available, fallback to prop
  const user = authUser || currentUser;
  
  const [formData, setFormData] = useState<Partial<IssueRequestDto>>({
    title: '',
    description: '',
    language: 'ENGLISH', // Default to English
    issueType: undefined, // No default - user must select
    category: '',
    isPrivate: false,
    createdById: user?.id || 0,
    assignedToId: undefined, // Add leader assignment field
  });

  const [location, setLocation] = useState<LocationRequestDto>({});
  const [attachments, setAttachments] = useState<AttachmentRequestDto[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [step, setStep] = useState<'select-type' | 'fill-form'>('select-type');
  const [locationStep, setLocationStep] = useState<'district' | 'sector' | 'cell' | 'village'>('district');
  
  // Leader assignment state
  const [showLeaderAssignment, setShowLeaderAssignment] = useState(false);
  const [leaderSearchTerm, setLeaderSearchTerm] = useState('');
  const [leaders, setLeaders] = useState<UserResponseDto[]>([]);
  const [isLoadingLeaders, setIsLoadingLeaders] = useState(false);
  const [selectedLeader, setSelectedLeader] = useState<UserResponseDto | null>(null);

  const issueTypes: IssueType[] = ['POSITIVE_REVIEW', 'NEGATIVE_ISSUE', 'SUGGESTION'];
  const categories = ['infrastructure', 'healthcare', 'education', 'transport', 'environment', 'security', 'other'];

  useEffect(() => {
    if (useCurrentLocation) {
      getCurrentLocation();
    }
  }, [useCurrentLocation]);

  // Search leaders function
  const searchLeaders = async (name?: string) => {
    if (!name || name.trim().length < 2) {
      setLeaders([]);
      return;
    }

    try {
      setIsLoadingLeaders(true);
      const response = await fetch(
        API_ENDPOINTS.USERS.SEARCH_LEADERS(0, 20, name),
        {
          headers: {
            'Authorization': `Bearer ${JSON.parse(localStorage.getItem('authTokens') || '{}').accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setLeaders(data.content || []);
      }
    } catch (error) {
      console.error('Error searching leaders:', error);
      setLeaders([]);
    } finally {
      setIsLoadingLeaders(false);
    }
  };

  // Handle leader search input change
  const handleLeaderSearchChange = (value: string) => {
    setLeaderSearchTerm(value);
    if (value.trim().length >= 2) {
      searchLeaders(value);
    } else {
      setLeaders([]);
    }
  };

  // Select a leader
  const handleLeaderSelect = (leader: UserResponseDto) => {
    setSelectedLeader(leader);
    setFormData(prev => ({
      ...prev,
      assignedToId: leader.id
    }));
    setLeaderSearchTerm(`${leader.firstName} ${leader.lastName}`);
    setLeaders([]);
  };

  // Clear leader assignment
  const clearLeaderAssignment = () => {
    setSelectedLeader(null);
    setFormData(prev => ({
      ...prev,
      assignedToId: undefined
    }));
    setLeaderSearchTerm('');
    setLeaders([]);
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(prev => ({
            ...prev,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }));
          // Don't change locationStep - keep it at district
        },
        (error) => {
          console.error('Error getting location:', error);
          setUseCurrentLocation(false);
        }
      );
    } else {
      console.log('Geolocation is not supported by this browser.');
      setUseCurrentLocation(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleIssueTypeSelect = (issueType: IssueType) => {
    setFormData(prev => ({
      ...prev,
      issueType
    }));
    setStep('fill-form');
  };

  const handleBackToTypeSelection = () => {
    setStep('select-type');
    setFormData(prev => ({
      ...prev,
      issueType: undefined
    }));
  };

  const handleLocationChange = (field: keyof LocationRequestDto, value: string) => {
    setLocation(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors.location) {
      setErrors(prev => ({ ...prev, location: '' }));
    }
  };

  const handleLocationNext = () => {
    if (locationStep === 'district' && location.district) {
      setLocationStep('sector');
    } else if (locationStep === 'sector' && location.sector) {
      setLocationStep('cell');
    } else if (locationStep === 'cell' && location.cell) {
      setLocationStep('village');
    }
  };

  const handleLocationBack = () => {
    if (locationStep === 'village') {
      setLocationStep('cell');
    } else if (locationStep === 'cell') {
      setLocationStep('sector');
    } else if (locationStep === 'sector') {
      setLocationStep('district');
    }
  };

  const canProceedToNextLocation = () => {
    switch (locationStep) {
      case 'district':
        return !!location.district?.trim();
      case 'sector':
        return !!location.sector?.trim();
      case 'cell':
        return !!location.cell?.trim();
      default:
        return false;
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.issueType) {
      newErrors.issueType = 'Please select an issue type';
    }

    // Location is always optional
    // No validation required for location

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const issueData: IssueRequestDto = {
        ...formData,
        language: 'ENGLISH', // Always default to English
        // Only include location if it has valid data
        location: cleanLocationData(location),
        attachments: attachments.length > 0 ? attachments : undefined,
        assignedToId: formData.assignedToId, // Include leader assignment
      } as IssueRequestDto;

      await onSubmit(issueData);
    } catch (error) {
      console.error('Error creating issue:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAttachmentUpload = (attachment: AttachmentRequestDto) => {
    setAttachments(prev => [...prev, attachment]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {getTranslation('createIssue', language)}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {step === 'select-type' ? (
          // Step 1: Issue Type Selection
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                What type of issue would you like to report?
              </h3>
              <p className="text-gray-600">
                Please select the category that best describes your concern
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {issueTypes.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleIssueTypeSelect(type)}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {type === 'POSITIVE_REVIEW' ? 'Positive Review' : 
                         type === 'NEGATIVE_ISSUE' ? 'Negative Feedback' : 
                         type === 'SUGGESTION' ? 'Suggestion' : type}
                      </h4>
                      <p className="text-gray-600">
                        {type === 'POSITIVE_REVIEW' ? 'Share positive feedback about services or improvements' : 
                         type === 'NEGATIVE_ISSUE' ? 'Share concerns or areas that need improvement' : 
                         type === 'SUGGESTION' ? 'Propose ideas for improvement' : ''}
                      </p>
                    </div>
                    <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Step 2: Issue Form
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Back Button */}
            <div className="mb-4">
              <button
                type="button"
                onClick={handleBackToTypeSelection}
                className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Issue Type Selection
              </button>
            </div>

            {/* Selected Issue Type Display */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-800 font-medium">Selected Issue Type:</p>
                  <p className="text-lg text-blue-900 font-semibold">
                    {formData.issueType === 'POSITIVE_REVIEW' ? 'Positive Review' : 
                     formData.issueType === 'NEGATIVE_ISSUE' ? 'Negative Issue' : 
                     formData.issueType === 'SUGGESTION' ? 'Suggestion' : formData.issueType}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleBackToTypeSelection}
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {getTranslation('issueTitle', language)} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter issue title..."
                maxLength={255}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {formData.title?.length || 0}/255 characters
              </p>
            </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {getTranslation('description', language)}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.description ? 'border-red-300' : 'border-gray-300'
              }`}
              rows={4}
              placeholder="Describe your issue in detail..."
              maxLength={2000}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.description?.length || 0}/2000 characters
            </p>
          </div>

          

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {getTranslation('category', language)}
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select category</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Privacy Setting */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isPrivate"
              checked={formData.isPrivate}
              onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isPrivate" className="text-sm font-medium text-gray-700">
              {getTranslation('makePrivate', language)}
            </label>
          </div>

          {/* Leader Assignment Section */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                {getTranslation('assignLeader', language)}
              </h3>
              <button
                type="button"
                onClick={() => setShowLeaderAssignment(!showLeaderAssignment)}
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                {showLeaderAssignment ? 'Hide Leader Search' : 'Assign Leader'}
              </button>
            </div>

            {showLeaderAssignment && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {getTranslation('searchLeader', language)}
                  </label>
                  <input
                    type="text"
                    value={leaderSearchTerm}
                    onChange={(e) => handleLeaderSearchChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={getTranslation('enterLeaderName', language)}
                    disabled={isLoadingLeaders}
                  />
                  {isLoadingLeaders && (
                    <p className="mt-2 text-sm text-gray-500">
                      {getTranslation('searchingLeaders', language)}...
                    </p>
                  )}
                  {leaders.length > 0 && (
                    <div className="mt-4 bg-gray-100 border border-gray-200 rounded-lg p-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        {getTranslation('searchResults', language)}:
                      </h4>
                      <ul className="space-y-2">
                        {leaders.map(leader => (
                          <li
                            key={leader.id}
                            onClick={() => handleLeaderSelect(leader)}
                            className="flex items-center justify-between p-2 rounded-lg cursor-pointer hover:bg-blue-100"
                          >
                            <span className="text-sm font-medium text-gray-900">
                              {leader.firstName} {leader.lastName}
                            </span>
                            <span className="text-xs text-gray-500">
                              {leader.role}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {leaders.length === 0 && leaderSearchTerm.length > 1 && (
                    <p className="mt-2 text-sm text-gray-500">
                      {getTranslation('noLeadersFound', language)}
                    </p>
                  )}
                </div>

                {selectedLeader && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800 font-medium">
                      {getTranslation('assignedLeader', language)}:
                    </p>
                    <p className="text-sm text-green-900">
                      {selectedLeader.firstName} {selectedLeader.lastName}
                    </p>
                    <button
                      type="button"
                      onClick={clearLeaderAssignment}
                      className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      {getTranslation('clearAssignment', language)}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Location Section */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-medium text-gray-900 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  {getTranslation('location', language)} Information
                </h3>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  Optional
                </span>
              </div>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={useCurrentLocation}
                  onChange={(e) => setUseCurrentLocation(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{getTranslation('useCurrentLocation', language)}</span>
              </label>
            </div>
            
            {/* Info message about location being optional */}
            <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm text-gray-700">
                ℹ️ Location information is optional. You can provide location details to help with issue categorization, 
                or leave it blank if you prefer not to specify.
              </p>
            </div>

            {/* Current Location Status */}
            {useCurrentLocation && (location.latitude && location.longitude) && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  ✅ Current location captured: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                </p>
              </div>
            )}

            {/* Progressive Location Input */}
            <div className="space-y-4">
              {/* District Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {getTranslation('district', language)} 
                  <span className="text-gray-500 text-xs ml-2">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={location.district || ''}
                  onChange={(e) => handleLocationChange('district', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter district name"
                />
                {locationStep === 'district' && location.district && (
                  <button
                    type="button"
                    onClick={handleLocationNext}
                    disabled={!canProceedToNextLocation()}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next: Add Sector
                  </button>
                )}
              </div>

              {/* Sector Input - Only show if district is filled */}
              {location.district && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {getTranslation('sector', language)} 
                    <span className="text-gray-500 text-xs ml-2">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={location.sector || ''}
                    onChange={(e) => handleLocationChange('sector', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter sector name"
                  />
                  {locationStep === 'sector' && location.sector && (
                    <button
                      type="button"
                      onClick={handleLocationNext}
                      disabled={!canProceedToNextLocation()}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next: Add Cell
                    </button>
                  )}
                  {location.sector && (
                    <button
                      type="button"
                      onClick={handleLocationBack}
                      className="mt-2 ml-2 px-4 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Back to District
                    </button>
                  )}
                </div>
              )}

              {/* Cell Input - Only show if sector is filled */}
              {location.sector && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {getTranslation('cell', language)} 
                    <span className="text-gray-500 text-xs ml-2">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={location.cell || ''}
                    onChange={(e) => handleLocationChange('cell', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter cell name"
                  />
                  {locationStep === 'cell' && location.cell && (
                    <button
                      type="button"
                      onClick={handleLocationNext}
                      disabled={!canProceedToNextLocation()}
                      className="mt-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next: Add Village
                    </button>
                  )}
                  {location.cell && (
                    <button
                      type="button"
                      onClick={handleLocationBack}
                      className="mt-2 ml-2 px-4 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Back to Sector
                    </button>
                  )}
                </div>
              )}

              {/* Village Input - Only show if cell is filled */}
              {location.cell && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {getTranslation('village', language)} 
                    <span className="text-gray-500 text-xs ml-2">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={location.village || ''}
                    onChange={(e) => handleLocationChange('village', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter village name"
                  />
                  {location.village && (
                    <button
                      type="button"
                      onClick={handleLocationBack}
                      className="mt-2 px-4 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Back to Cell
                    </button>
                  )}
                </div>
              )}
            </div>

            {errors.location && (
              <p className="mt-2 text-sm text-red-600">{errors.location}</p>
            )}
          </div>

          {/* Attachments Section */}
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="mb-4">
              <h3 className="text-lg font-medium text-gray-900 flex items-center mb-2">
                <Upload className="w-5 h-5 mr-2" />
                {getTranslation('attachments', language)}
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Upload images, documents, or other files related to your issue
              </p>
            </div>

            <CloudinaryUpload
              config={cloudinaryPresets.issueAttachments()}
              onUploadSuccess={handleAttachmentUpload}
              onUploadError={(error) => console.error('Upload error:', error)}
              multiple={true}
              placeholder="Upload issue-related files (max 3)"
              accept=".jpg,.jpeg,.png,.gif,.pdf"
              showPreview={false}
            />

            {/* Display uploaded attachments */}
            {attachments.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files:</h4>
                <div className="space-y-2">
                  {attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">{attachment.description}</p>
                          <p className="text-gray-500">{attachment.type}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? getTranslation('creatingIssue', language) : getTranslation('createIssue', language)}
            </button>
          </div>
                </form>
      )}
        </div>
    </div>
  );
};

export default CreateIssueForm;
