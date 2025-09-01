import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../types';
import CloudinaryUpload from './CloudinaryUpload';
import { cloudinaryPresets } from '../config/cloudinary';

interface UserFormProps {
  user?: User;
  onSave: (userData: Partial<User>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const UserForm: React.FC<UserFormProps> = ({ user, onSave, onCancel, isEditing = false }) => {
  const { completeProfile } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    profileImage: user?.profileUrl || '',
    location: {
      district: user?.location?.district || '',
      sector: user?.location?.sector || '',
      cell: user?.location?.cell || '',
      village: user?.location?.village || ''
    }
  });

  const [errors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');


  const rwandanDistricts = [
    'Gasabo', 'Kicukiro', 'Nyarugenge', 'Bugesera', 'Gatsibo',
    'Kayonza', 'Kirehe', 'Ngoma', 'Rwamagana', 'Burera',
    'Gakenke', 'Gicumbi', 'Musanze', 'Rulindo', 'Gisagara',
    'Huye', 'Kamonyi', 'Muhanga', 'Nyamagabe', 'Nyanza',
    'Nyaruguru', 'Ruhango', 'Karongi', 'Ngororero', 'Nyabihu',
    'Nyamasheke', 'Rubavu', 'Rusizi', 'Rutsiro'
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }

    if (!formData.location.district) {
      newErrors.district = 'District is required';
    }

    if (!formData.location.sector.trim()) {
      newErrors.sector = 'Sector is required';
    }

    if (!formData.location.cell.trim()) {
      newErrors.cell = 'Cell is required';
    }

    if (!formData.location.village.trim()) {
      newErrors.village = 'Village is required';
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError('');

    try {
      // Prepare profile completion data
      const profileData = {
        profileUrl: hasValidProfileImage() ? formData.profileImage : undefined,
        level: null, // Citizens don't have administrative levels
        location: {
          district: formData.location.district,
          sector: formData.location.sector,
          cell: formData.location.cell,
          village: formData.location.village
        }
      };

      // Call the API to complete profile
      const success = await completeProfile(profileData);
      
      if (success) {
        // Automatically continue editing - don't show success message
        // Reset form to show updated data and allow further editing
        // Optionally refresh the form data if needed
      } else {
        setSubmitError('Failed to complete profile. Please try again.');
      }
    } catch (error) {
      setSubmitError('An error occurred while completing your profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('location.')) {
      const locationField = field.replace('location.', '');
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Clear error when user starts typing
    if (errors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Get initials for display
  const getInitials = () => {
    const first = formData.firstName.charAt(0).toUpperCase();
    const last = formData.lastName.charAt(0).toUpperCase();
    return first + last;
  };

  // Check if profile image is valid
  const hasValidProfileImage = () => {
    return formData.profileImage && formData.profileImage.trim() !== '';
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Edit Profile' : 'Create Profile'}
        </h2>
        <p className="text-gray-600 mt-1">
          {isEditing ? 'Update your profile information' : 'Please fill in your information to create your profile'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your first name"
              />
              {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your last name"
              />
              {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email address"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phoneNumber"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your phone number"
              />
              {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Profile Picture
              </label>
              
              {/* Current Profile Display */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
                <div className="flex items-center space-x-4">
                  {hasValidProfileImage() ? (
                    <div className="relative">
                      <img
                        src={formData.profileImage}
                        alt="Profile"
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, profileImage: '' }))}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-sm"
                        title="Remove profile picture"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold border-2 border-gray-200 shadow-sm">
                      {getInitials()}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700 mb-1">
                      {hasValidProfileImage() ? 'Current Profile Picture' : 'Profile Picture'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {hasValidProfileImage() ? 'Your profile picture is set and will be displayed to other users' : 'No profile picture set yet'}
                    </p>
                    {!hasValidProfileImage() && (
                      <p className="text-xs text-gray-500 mt-1">
                        Your initials ({getInitials()}) will be displayed until you upload a picture
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Picture Upload */}
              <div className="bg-white border border-gray-300 rounded-lg p-4">
                <CloudinaryUpload
                  config={cloudinaryPresets.profilePictures()}
                  onUploadSuccess={(uploadedFiles) => {
                    if (uploadedFiles && Array.isArray(uploadedFiles) && uploadedFiles.length > 0) {
                      setFormData(prev => ({
                        ...prev,
                        profileImage: uploadedFiles[0].url
                      }));
                    }
                  }}
                  onUploadError={(error) => console.error('Profile picture upload error:', error)}
                  multiple={false}
                  placeholder="Click to upload profile picture"
                  accept=".jpg,.jpeg,.png,.gif"
                  showPreview={false}
                />
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Supported formats: JPG, PNG, GIF • Max size: 2MB
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Location Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Location Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                District *
              </label>
              <select
                id="district"
                value={formData.location.district}
                onChange={(e) => handleInputChange('location.district', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.district ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a district</option>
                {rwandanDistricts.map(district => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
              {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
            </div>

            <div>
              <label htmlFor="sector" className="block text-sm font-medium text-gray-700 mb-1">
                Sector *
              </label>
              <input
                type="text"
                id="sector"
                value={formData.location.sector}
                onChange={(e) => handleInputChange('location.sector', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.sector ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your sector"
              />
              {errors.sector && <p className="text-red-500 text-xs mt-1">{errors.sector}</p>}
            </div>

            <div>
              <label htmlFor="cell" className="block text-sm font-medium text-gray-700 mb-1">
                Cell *
              </label>
              <input
                type="text"
                id="cell"
                value={formData.location.cell}
                onChange={(e) => handleInputChange('location.cell', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.cell ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your cell"
              />
              {errors.cell && <p className="text-red-500 text-xs mt-1">{errors.cell}</p>}
            </div>

            <div>
              <label htmlFor="village" className="block text-sm font-medium text-gray-700 mb-1">
                Village *
              </label>
              <input
                type="text"
                id="village"
                value={formData.location.village}
                onChange={(e) => handleInputChange('location.village', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.village ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your village"
              />
              {errors.village && <p className="text-red-500 text-xs mt-1">{errors.village}</p>}
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            {isEditing ? 'Update Profile' : 'Create Profile'}
            {isSubmitting && <span className="ml-2">...</span>}
          </button>
        </div>
        {submitError && <p className="text-red-500 text-xs mt-2 text-center">{submitError}</p>}
      </form>
    </div>
  );
};

export default UserForm;
