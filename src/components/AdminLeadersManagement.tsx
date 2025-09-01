import React, { useState, useEffect } from 'react';
import { adminAuthenticatedFetch } from '../utils/adminApiInterceptor';
import { API_ENDPOINTS } from '../config/api';
import { Leader, DepartmentResponseDto, AddLeaderRequestDto, AddLeaderResponseDto, UserRole, AccountStatus, Level } from '../types';
import { Users, Building, Plus, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { useAdminAuth } from '../contexts/AdminAuthContext';

// Define the NewLeaderForm interface
interface NewLeaderForm {
  firstName: string;
  lastName: string;
  middleName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  departmentId: number;
  leadershipLevel: Level;
  leadershipPlaceName: string;
  district: string;
  sector: string;
  cell: string;
  village: string;
}

const AdminLeadersManagement: React.FC = () => {
  const { forceLogout, currentLeader } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<'view' | 'add'>('view');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<AccountStatus | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [isLoadingLeaders, setIsLoadingLeaders] = useState(true);
  const [departments, setDepartments] = useState<DepartmentResponseDto[]>([]);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [passwordExpiry, setPasswordExpiry] = useState<Date | null>(null);
  const [generatingPassword, setGeneratingPassword] = useState<string | null>(null);

  const [newLeader, setNewLeader] = useState<NewLeaderForm>({
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    phoneNumber: '',
    role: 'CELL_LEADER',
    departmentId: 0,
    leadershipLevel: 'CELL',
    leadershipPlaceName: '',
    district: '',
    sector: '',
    cell: '',
    village: ''
  });

  const handleInputChange = (field: keyof NewLeaderForm, value: string) => {
    setNewLeader(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fetch departments and leaders on component mount
  useEffect(() => {
    fetchDepartments();
    fetchLeaders();
  }, []);

  const fetchLeaders = async () => {
    try {
      setIsLoadingLeaders(true);
      setError(null);
      
      const response = await adminAuthenticatedFetch(API_ENDPOINTS.LEADERS.GET_ALL, {}, forceLogout);
      
      if (!response || !response.ok) {
        throw new Error(`Failed to fetch leaders: ${response?.statusText || 'No response'}`);
      }
      
      const data = await response.json();
      console.log('Fetched leaders data:', data);
      console.log('First leader sample:', data[0]);
      setLeaders(data);
    } catch (err) {
      console.error('Error fetching leaders:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch leaders');
    } finally {
      setIsLoadingLeaders(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      setIsLoadingDepartments(true);
      setError(null);
      
      const response = await adminAuthenticatedFetch(API_ENDPOINTS.DEPARTMENTS.GET_ALL, {}, forceLogout);
      
      if (!response || !response.ok) {
        throw new Error(`Failed to fetch departments: ${response?.statusText || 'No response'}`);
      }
      
      const data = await response.json();
      setDepartments(data.content || data); // Handle both paginated and non-paginated responses
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch departments');
    } finally {
      setIsLoadingDepartments(false);
    }
  };

  const generatePassword = async (leaderId: string) => {
    try {
      console.log('Generating password for leader ID:', leaderId, 'Type:', typeof leaderId);
      
      if (!leaderId) {
        throw new Error('Leader ID is required');
      }
      
      setGeneratingPassword(leaderId);
      setError(null);
      
      const response = await adminAuthenticatedFetch(
        API_ENDPOINTS.LEADERS.GENERATE_PASSWORD(leaderId.toString()),
        { method: 'POST' },
        forceLogout
      );
      
      if (!response || !response.ok) {
        throw new Error(`Failed to generate password: ${response?.statusText || 'No response'}`);
      }
      
      const data: AddLeaderResponseDto = await response.json();
      
      // Set the generated password and expiry for this specific leader
      setGeneratedPassword(data.generatedPassword || '');
      setPasswordExpiry(new Date(Date.now() + 10 * 60 * 1000)); // 10 minutes
      setShowPassword(true);
      
      // Refresh the leaders list to get updated data
      fetchLeaders();
      
      setSuccessMessage('Password generated successfully');
    } catch (err) {
      console.error('Error generating password:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate password');
    } finally {
      setGeneratingPassword(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const requestData: AddLeaderRequestDto = {
        firstName: newLeader.firstName.trim(),
        lastName: newLeader.lastName.trim() || undefined,
        middleName: newLeader.middleName.trim() || undefined,
        phoneNumber: newLeader.phoneNumber.trim(),
        email: newLeader.email.trim() || undefined,
        role: newLeader.role,
        departmentId: newLeader.departmentId,
        leadershipLevel: newLeader.leadershipLevel,
        leadershipPlaceName: newLeader.leadershipPlaceName.trim(),
        location: {
          district: newLeader.district.trim(),
          sector: newLeader.sector.trim(),
          cell: newLeader.cell.trim(),
          village: newLeader.village.trim()
        }
      };

      const response = await adminAuthenticatedFetch(API_ENDPOINTS.LEADERS.CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      }, forceLogout);

      if (!response || !response.ok) {
        const errorData = await response?.json();
        throw new Error(errorData?.message || `Failed to create leader: ${response?.statusText || 'No response'}`);
      }

      const data: AddLeaderResponseDto = await response.json();
      
      // Show success message and generated password
      setSuccessMessage(data.message || 'Leader created successfully');
      setGeneratedPassword(data.generatedPassword || '');
      setPasswordExpiry(new Date(Date.now() + 10 * 60 * 1000)); // 10 minutes
      setShowPassword(true);
      
      // Reset form
      setNewLeader({
        firstName: '',
        lastName: '',
        middleName: '',
        email: '',
        phoneNumber: '',
        role: 'CELL_LEADER',
        departmentId: 0,
        leadershipLevel: 'CELL',
        leadershipPlaceName: '',
        district: '',
        sector: '',
        cell: '',
        village: ''
      });
      
      // Refresh leaders list
      fetchLeaders();
      
    } catch (err) {
      console.error('Error creating leader:', err);
      setError(err instanceof Error ? err.message : 'Failed to create leader');
    } finally {
      setIsLoading(false);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
    setShowPassword(false);
    setGeneratedPassword(null);
    setPasswordExpiry(null);
  };

  const handleTabChange = (tab: 'view' | 'add') => {
    setActiveTab(tab);
    clearMessages();
  };

  const filteredLeaders = leaders.filter(leader => {
    const matchesRole = roleFilter === 'ALL' || leader.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || leader.accountStatus === statusFilter;
    return matchesRole && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRoleDisplayName = (role: string) => {
    return role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-100';
      case 'INACTIVE': return 'text-red-600 bg-red-100';
      case 'SUSPENDED': return 'text-orange-600 bg-orange-100';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRemainingTime = () => {
    if (!passwordExpiry) return 0;
    const now = new Date();
    const remaining = passwordExpiry.getTime() - now.getTime();
    return Math.max(0, Math.ceil(remaining / 1000));
  };

  // Auto-hide password after expiry
  useEffect(() => {
    if (passwordExpiry) {
      const timer = setInterval(() => {
        const remaining = getRemainingTime();
        if (remaining <= 0) {
          setShowPassword(false);
          setGeneratedPassword(null);
          setPasswordExpiry(null);
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [passwordExpiry]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-bold text-gray-900">Leaders Management</h2>
        <p className="text-gray-600 mt-1">Manage community leaders and their access</p>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <div className="mt-2 text-sm text-green-700">{successMessage}</div>
            </div>
          </div>
        </div>
      )}

      {/* Password Display */}
      {showPassword && generatedPassword && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-blue-800">Generated Password</h3>
              <div className="mt-2 text-sm text-blue-700">
                <span className="font-mono bg-blue-100 px-2 py-1 rounded">
                  {generatedPassword}
                </span>
                <span className="ml-2 text-blue-600">
                  (Expires in {getRemainingTime()} seconds)
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="text-blue-600 hover:text-blue-800"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => handleTabChange('view')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'view'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="inline-block w-4 h-4 mr-2" />
            View Leaders
          </button>
          <button
            onClick={() => handleTabChange('add')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'add'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Plus className="inline-block w-4 h-4 mr-2" />
            Add New Leader
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'view' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white border-2 border-blue-200 rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value as UserRole | 'ALL')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ALL">All Roles</option>
                  <option value="CELL_LEADER">Cell Leader</option>
                  <option value="SECTOR_LEADER">Sector Leader</option>
                  <option value="DISTRICT_LEADER">District Leader</option>
                  <option value="CELL_ADMIN">Cell Admin</option>
                  <option value="SECTOR_ADMIN">Sector Admin</option>
                  <option value="DISTRICT_ADMIN">District Admin</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as AccountStatus | 'ALL')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="PENDING">Pending</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={fetchLeaders}
                  disabled={isLoadingLeaders}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingLeaders ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>
          </div>

          {/* Leaders List */}
          <div className="bg-white border-2 border-blue-200 rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">
                Leaders ({filteredLeaders.length})
              </h3>
            </div>
            
            {isLoadingLeaders ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading leaders...</p>
              </div>
            ) : filteredLeaders.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No leaders found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {leaders.length === 0 ? 'No leaders have been added yet.' : 'No leaders match the current filters.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Leader
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role & Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLeaders.map((leader) => {
                      console.log('Rendering leader:', leader);
                      return (
                        <tr key={leader.userId} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-sm font-medium text-blue-600">
                                  {leader.firstName.charAt(0)}{leader.lastName?.charAt(0) || ''}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {leader.firstName} {leader.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {leader.leadershipLevelName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{leader.email}</div>
                          <div className="text-sm text-gray-500">{leader.phoneNumber}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {getRoleDisplayName(leader.role)}
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(leader.accountStatus || 'UNKNOWN')}`}>
                            {leader.accountStatus || 'UNKNOWN'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {leader.location?.district && (
                            <div>
                              {leader.location.district}
                              {leader.location.sector && ` - ${leader.location.sector}`}
                              {leader.location.cell && ` - ${leader.location.cell}`}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                      {currentLeader?.id === leader.userId?.toString() ? (
                            <span className="text-gray-500 text-sm">Current User</span>
                          ) : (
                            <button
                                                              onClick={() => {
                                  if (leader.userId) {
                                    generatePassword(leader.userId.toString());
                                  } else {
                                    console.error('Leader ID is undefined:', leader);
                                    setError('Leader ID is missing');
                                  }
                                }}
                                disabled={generatingPassword === leader.userId?.toString()}
                              className="text-blue-600 hover:text-blue-900 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                              <RefreshCw className={`w-4 h-4 mr-1 ${generatingPassword === leader.userId?.toString() ? 'animate-spin' : ''}`} />
                              Generate Password
                            </button>
                          )}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'add' && (
        <div className="bg-white border-2 border-blue-200 rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-6">Add New Leader</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={newLeader.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter first name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={newLeader.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter last name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Middle Name
                </label>
                <input
                  type="text"
                  value={newLeader.middleName}
                  onChange={(e) => handleInputChange('middleName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter middle name"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={newLeader.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="+250788123456"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={newLeader.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter email address"
                />
              </div>
            </div>

            {/* Role and Department */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role *
                </label>
                <select
                  required
                  value={newLeader.role}
                  onChange={(e) => handleInputChange('role', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="CELL_LEADER">Cell Leader</option>
                  <option value="SECTOR_LEADER">Sector Leader</option>
                  <option value="DISTRICT_LEADER">District Leader</option>
                  <option value="CELL_ADMIN">Cell Admin</option>
                  <option value="SECTOR_ADMIN">Sector Admin</option>
                  <option value="DISTRICT_ADMIN">District Admin</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department *
                </label>
                <select
                  required
                  value={newLeader.departmentId}
                  onChange={(e) => handleInputChange('departmentId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={isLoadingDepartments}
                >
                  <option value={0}>Select Department</option>
                  {departments.map((dept) => (
                    <option key={dept.id} value={dept.id}>
                      {dept.nameEn}
                    </option>
                  ))}
                </select>
                {isLoadingDepartments && (
                  <div className="mt-1 text-sm text-gray-500">Loading departments...</div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Leadership Level *
                </label>
                <select
                  required
                  value={newLeader.leadershipLevel}
                  onChange={(e) => handleInputChange('leadershipLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="CELL">Cell</option>
                  <option value="SECTOR">Sector</option>
                  <option value="DISTRICT">District</option>
                </select>
              </div>
            </div>

            {/* Leadership Place */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Leadership Place Name *
              </label>
              <input
                type="text"
                required
                value={newLeader.leadershipPlaceName}
                onChange={(e) => handleInputChange('leadershipPlaceName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Kigali District Office"
              />
            </div>

            {/* Location Information */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  District *
                </label>
                <input
                  type="text"
                  required
                  value={newLeader.district}
                  onChange={(e) => handleInputChange('district', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Kigali"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sector *
                </label>
                <input
                  type="text"
                  required
                  value={newLeader.sector}
                  onChange={(e) => handleInputChange('sector', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Nyarugenge"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cell *
                </label>
                <input
                  type="text"
                  required
                  value={newLeader.cell}
                  onChange={(e) => handleInputChange('cell', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Kiyovu"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Village *
                </label>
                <input
                  type="text"
                  required
                  value={newLeader.village}
                  onChange={(e) => handleInputChange('village', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Village A"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Leader
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminLeadersManagement;
