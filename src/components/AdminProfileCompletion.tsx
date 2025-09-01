import React, { useState } from 'react';
import { MapPin, Shield, CheckCircle } from 'lucide-react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { UserProfileCompletionRequestDto } from '../types';

const AdminProfileCompletion: React.FC = () => {
  const { currentLeader, completeProfile } = useAdminAuth();
  const [formData, setFormData] = useState({
    level: 'CELL' as 'CELL' | 'SECTOR' | 'DISTRICT',
    district: currentLeader?.location?.district || '',
    sector: currentLeader?.location?.sector || '',
    cell: currentLeader?.location?.cell || ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
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

    if (!formData.level) {
      newErrors.level = 'Leadership level is required';
    }

    if (!formData.district) {
      newErrors.district = 'District is required';
    }

    // All leaders must provide complete location hierarchy
    if (!formData.sector.trim()) {
      newErrors.sector = 'Sector is required';
    }

    if (!formData.cell.trim()) {
      newErrors.cell = 'Cell is required';
    }

    setErrors(newErrors);
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
      const profileData: UserProfileCompletionRequestDto = {
        level: formData.level,
        location: {
          district: formData.district.trim(),
          sector: formData.sector.trim(),
          cell: formData.cell.trim()
        }
      };
      
      // Validate data before sending
      if (!profileData.level || !profileData.location.district || !profileData.location.sector || !profileData.location.cell) {
        setSubmitError('Leadership level and complete location information are required');
        return;
      }
      
      console.log('Profile data being sent:', profileData);
      console.log('JSON stringified data:', JSON.stringify(profileData));

      // Call the API to complete profile
      const success = await completeProfile(profileData);
      
      if (success) {
        // Redirect to admin dashboard
        window.location.reload();
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="flex justify-center">
            <div className="bg-blue-600 text-white p-3 rounded-full">
              <Shield size={32} />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Complete Your Profile
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Leadership level and complete location hierarchy (district, sector, cell) are required to access the admin portal
          </p>
        </div>

        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <MapPin className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Required:</strong> Please provide your leadership level and complete administrative location hierarchy (district, sector, cell) to continue.
              </p>
            </div>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                Leadership Level *
              </label>
              <select
                id="level"
                value={formData.level}
                onChange={(e) => handleInputChange('level', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.level ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="CELL">Cell Leader</option>
                <option value="SECTOR">Sector Leader</option>
                <option value="DISTRICT">District Leader</option>
              </select>
              {errors.level && <p className="text-red-500 text-xs mt-1">{errors.level}</p>}
            </div>

            <div>
              <label htmlFor="district" className="block text-sm font-medium text-gray-700 mb-1">
                District *
              </label>
              <select
                id="district"
                value={formData.district}
                onChange={(e) => handleInputChange('district', e.target.value)}
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
                value={formData.sector}
                onChange={(e) => handleInputChange('sector', e.target.value)}
                required
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
                value={formData.cell}
                onChange={(e) => handleInputChange('cell', e.target.value)}
                required
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  errors.cell ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your cell"
              />
              {errors.cell && <p className="text-red-500 text-xs mt-1">{errors.cell}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <CheckCircle className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle className="-ml-1 mr-2 h-4 w-4" />
                  Complete Profile
                </>
              )}
            </button>
            {submitError && <p className="text-red-500 text-xs mt-2">{submitError}</p>}
          </div>
        </form>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            This information helps us provide you with relevant administrative tools and regional data.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminProfileCompletion;
