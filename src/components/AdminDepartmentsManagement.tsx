import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Building, Edit, Trash2, Eye, Globe, ChevronLeft, ChevronRight } from 'lucide-react';
import { DepartmentResponseDto, Page } from '../types';
import { API_ENDPOINTS, buildPaginatedUrl } from '../config/api';
import { adminAuthenticatedFetch } from '../utils/adminApiInterceptor';

interface NewDepartmentForm {
  nameEn: string;
  nameRw: string;
  nameFr: string;
  description: string;
  isActive: boolean;
}

type TabType = 'view' | 'add' | 'edit';

const AdminDepartmentsManagement = () => {
  const [activeTab, setActiveTab] = useState<TabType>('view');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [isLoading, setIsLoading] = useState(false);
  
  const [departments, setDepartments] = useState<DepartmentResponseDto[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(20);
  const [isLoadingDepartments, setIsLoadingDepartments] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newDepartment, setNewDepartment] = useState<NewDepartmentForm>({
    nameEn: '',
    nameRw: '',
    nameFr: '',
    description: '',
    isActive: true
  });

  const [editingDepartment, setEditingDepartment] = useState<DepartmentResponseDto | null>(null);
  const [editForm, setEditForm] = useState<NewDepartmentForm>({
    nameEn: '',
    nameRw: '',
    nameFr: '',
    description: '',
    isActive: true
  });

  const [formErrors, setFormErrors] = useState<Partial<NewDepartmentForm>>({});

  const handleInputChange = (field: keyof NewDepartmentForm, value: string | boolean) => {
    setNewDepartment(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEditInputChange = (field: keyof NewDepartmentForm, value: string | boolean) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Fetch departments on component mount and when page changes
  useEffect(() => {
    fetchDepartments();
  }, [currentPage]);

  const fetchDepartments = async () => {
    try {
      setIsLoadingDepartments(true);
      setError(null);
      
      const url = buildPaginatedUrl(API_ENDPOINTS.DEPARTMENTS.GET_ALL, currentPage, pageSize, 'nameEn', 'asc');
      const response = await adminAuthenticatedFetch(url);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch departments: ${response.statusText}`);
      }
      
      const data: Page<DepartmentResponseDto> = await response.json();
      setDepartments(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      console.error('Error fetching departments:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch departments');
    } finally {
      setIsLoadingDepartments(false);
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<NewDepartmentForm> = {};
    
    // Validate English name
    if (!newDepartment.nameEn.trim()) {
      errors.nameEn = 'English name is required';
    } else if (newDepartment.nameEn.trim().length < 2) {
      errors.nameEn = 'English name must be at least 2 characters';
    } else if (newDepartment.nameEn.trim().length > 100) {
      errors.nameEn = 'English name must not exceed 100 characters';
    }
    
    // Validate Kinyarwanda name
    if (!newDepartment.nameRw.trim()) {
      errors.nameRw = 'Kinyarwanda name is required';
    } else if (newDepartment.nameRw.trim().length < 2) {
      errors.nameRw = 'Kinyarwanda name must be at least 2 characters';
    } else if (newDepartment.nameRw.trim().length > 100) {
      errors.nameRw = 'Kinyarwanda name must not exceed 100 characters';
    }
    
    // Validate French name
    if (!newDepartment.nameFr.trim()) {
      errors.nameFr = 'French name is required';
    } else if (newDepartment.nameFr.trim().length < 2) {
      errors.nameFr = 'French name must be at least 2 characters';
    } else if (newDepartment.nameFr.trim().length > 100) {
      errors.nameFr = 'French name must not exceed 100 characters';
    }
    
    // Validate description (optional but if provided, check length)
    if (newDepartment.description.trim() && newDepartment.description.trim().length > 500) {
      errors.description = 'Description must not exceed 500 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateEditForm = (): boolean => {
    const errors: Partial<NewDepartmentForm> = {};
    
    // Validate English name
    if (!editForm.nameEn.trim()) {
      errors.nameEn = 'English name is required';
    } else if (editForm.nameEn.trim().length < 2) {
      errors.nameEn = 'English name must be at least 2 characters';
    } else if (editForm.nameEn.trim().length > 100) {
      errors.nameEn = 'English name must not exceed 100 characters';
    }
    
    // Validate Kinyarwanda name
    if (!editForm.nameRw.trim()) {
      errors.nameRw = 'Kinyarwanda name is required';
    } else if (editForm.nameRw.trim().length < 2) {
      errors.nameRw = 'Kinyarwanda name must be at least 2 characters';
    } else if (editForm.nameRw.trim().length > 100) {
      errors.nameRw = 'Kinyarwanda name must not exceed 100 characters';
    }
    
    // Validate French name
    if (!editForm.nameFr.trim()) {
      errors.nameFr = 'French name is required';
    } else if (editForm.nameFr.trim().length < 2) {
      errors.nameFr = 'French name must be at least 2 characters';
    } else if (editForm.nameFr.trim().length > 100) {
      errors.nameFr = 'French name must not exceed 100 characters';
    }
    
    // Validate description (optional but if provided, check length)
    if (editForm.description.trim() && editForm.description.trim().length > 500) {
      errors.description = 'Description must not exceed 500 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await adminAuthenticatedFetch(API_ENDPOINTS.DEPARTMENTS.CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nameEn: newDepartment.nameEn.trim(),
          nameRw: newDepartment.nameRw.trim(),
          nameFr: newDepartment.nameFr.trim(),
          description: newDepartment.description.trim() || undefined,
          isActive: newDepartment.isActive
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to create department: ${response.statusText}`);
      }
      
      const createdDepartment = await response.json();
      
      // Refresh the departments list to get the updated data
      fetchDepartments();
      
      // Reset form and errors
      setNewDepartment({
        nameEn: '',
        nameRw: '',
        nameFr: '',
        description: '',
        isActive: true
      });
      setFormErrors({});
      
      // Switch to view tab
      setActiveTab('view');
      
      // Show success message (you can implement a toast notification here)
      console.log('Department created successfully:', createdDepartment);
      
    } catch (err) {
      console.error('Error creating department:', err);
      setError(err instanceof Error ? err.message : 'Failed to create department');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (department: DepartmentResponseDto) => {
    setEditingDepartment(department);
    setEditForm({
      nameEn: department.nameEn,
      nameRw: department.nameRw,
      nameFr: department.nameFr,
      description: department.description || '',
      isActive: department.isActive
    });
    setFormErrors({});
    setActiveTab('edit');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingDepartment || !validateEditForm()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await adminAuthenticatedFetch(API_ENDPOINTS.DEPARTMENTS.UPDATE(editingDepartment.id.toString()), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nameEn: editForm.nameEn.trim(),
          nameRw: editForm.nameRw.trim(),
          nameFr: editForm.nameFr.trim(),
          description: editForm.description.trim() || undefined,
          isActive: editForm.isActive
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update department: ${response.statusText}`);
      }
      
      // Refresh the departments list
      fetchDepartments();
      
      // Reset edit state
      setEditingDepartment(null);
      setEditForm({
        nameEn: '',
        nameRw: '',
        nameFr: '',
        description: '',
        isActive: true
      });
      setFormErrors({});
      
      // Switch to view tab
      setActiveTab('view');
      
      console.log('Department updated successfully');
      
    } catch (err) {
      console.error('Error updating department:', err);
      setError(err instanceof Error ? err.message : 'Failed to update department');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivate = async (departmentId: number) => {
    setError(null);
    
    try {
      const response = await adminAuthenticatedFetch(`${API_ENDPOINTS.DEPARTMENTS.GET_BY_ID(departmentId.toString())}/activate`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to activate department: ${response.statusText}`);
      }
      
      // Update the specific department in local state
      setDepartments(prev => prev.map(dept => 
        dept.id === departmentId 
          ? { ...dept, isActive: true }
          : dept
      ));
      
      console.log('Department activated successfully');
      
    } catch (err) {
      console.error('Error activating department:', err);
      setError(err instanceof Error ? err.message : 'Failed to activate department');
    }
  };

  const handleDeactivate = async (departmentId: number) => {
    setError(null);
    
    try {
      const response = await adminAuthenticatedFetch(`${API_ENDPOINTS.DEPARTMENTS.GET_BY_ID(departmentId.toString())}/deactivate`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to deactivate department: ${response.statusText}`);
      }
      
      // Update the specific department in local state
      setDepartments(prev => prev.map(dept => 
        dept.id === departmentId 
          ? { ...dept, isActive: false }
          : dept
      ));
      
      console.log('Department deactivated successfully');
      
    } catch (err) {
      console.error('Error deactivating department:', err);
      setError(err instanceof Error ? err.message : 'Failed to deactivate department');
    }
  };

  // Client-side filtering for the current page (since server returns all active departments)
  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = 
      dept.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.nameRw.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.nameFr.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (dept.description && dept.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'ALL' || 
      (statusFilter === 'ACTIVE' && dept.isActive) ||
      (statusFilter === 'INACTIVE' && !dept.isActive);
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-green-100 text-green-800' 
          : 'bg-red-100 text-red-800'
      }`}>
        {isActive ? 'Active' : 'Inactive'}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments Management</h1>
          <p className="text-gray-600">Manage government departments and organizational units</p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchDepartments}
            disabled={isLoadingDepartments}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <svg className={`-ml-0.5 mr-2 h-4 w-4 ${isLoadingDepartments ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Refresh
          </button>
          <div className="flex items-center space-x-2">
            <Building className="h-5 w-5 text-gray-400" />
            <span className="text-sm text-gray-500">{totalElements} total departments</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('view')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'view'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            View Departments
          </button>
          <button
            onClick={() => setActiveTab('add')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'add'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Add New Department
          </button>
          {activeTab === 'edit' && editingDepartment && (
            <button
              className="py-2 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm"
            >
              Edit: {editingDepartment.nameEn}
            </button>
          )}
        </nav>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'view' ? (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="bg-white border-2 border-blue-200 rounded-lg shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search departments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'ACTIVE' | 'INACTIVE')}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ALL">All Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Departments List */}
          <div className="bg-white border-2 border-blue-200 rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">
                Departments ({departments.length} of {totalElements})
              </h3>
              <div className="text-sm text-gray-500">
                Page {currentPage + 1} of {totalPages}
              </div>
            </div>
            
            {isLoadingDepartments ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-gray-600">Loading departments...</span>
              </div>
            ) : (
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Multilingual Names
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDepartments.map((department) => (
                    <tr key={department.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                              <Building className="h-5 w-5" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {department.nameEn}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {department.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              EN
                            </span>
                            <span>{department.nameEn}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              RW
                            </span>
                            <span>{department.nameRw}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              FR
                            </span>
                            <span>{department.nameFr}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {department.description || 'No description'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(department.isActive)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(department.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          by {department.createdBy}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => handleEdit(department)}
                            className="text-blue-600 hover:text-blue-900" 
                            title="Edit Department"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          {department.isActive ? (
                            <button 
                              onClick={() => handleDeactivate(department.id)}
                              className="text-red-600 hover:text-red-900" 
                              title="Deactivate Department"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                              </svg>
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleActivate(department.id)}
                              className="text-green-600 hover:text-green-900" 
                              title="Activate Department"
                            >
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {departments.length === 0 && !isLoadingDepartments && (
                <div className="text-center py-12">
                  <Building className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No departments found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No departments available at the moment.
                  </p>
                </div>
              )}
            </div>
            )}
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  Showing {departments.length} of {totalElements} departments
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'add' ? (
        /* Add New Department Form */
        <div className="bg-white border-2 border-blue-200 rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Plus className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Add New Department</h3>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Multilingual Names */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <Globe className="h-5 w-5 text-blue-600" />
                <span>Department Names (Multilingual)</span>
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    English Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDepartment.nameEn}
                    onChange={(e) => handleInputChange('nameEn', e.target.value)}
                    placeholder="e.g., Health Department"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.nameEn ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.nameEn && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.nameEn}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kinyarwanda Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDepartment.nameRw}
                    onChange={(e) => handleInputChange('nameRw', e.target.value)}
                    placeholder="e.g., Ishami ry'Ubuzima"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.nameRw ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.nameRw && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.nameRw}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    French Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newDepartment.nameFr}
                    onChange={(e) => handleInputChange('nameFr', e.target.value)}
                    placeholder="e.g., Département de la Santé"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.nameFr ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.nameFr && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.nameFr}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Department Information</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={newDepartment.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe the department's responsibilities and functions..."
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {newDepartment.description.length}/500 characters
                </p>
              </div>
            </div>

            {/* Status */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Status</h4>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={newDepartment.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Department is active
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Inactive departments will not be available for assignment to leaders
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab('view')}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? 'Creating...' : 'Create Department'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Edit Department Form */
        <div className="bg-white border-2 border-blue-200 rounded-lg shadow-lg p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Edit className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">Edit Department</h3>
          </div>
          
          <form onSubmit={handleUpdate} className="space-y-6">
            {/* Multilingual Names */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <Globe className="h-5 w-5 text-blue-600" />
                <span>Department Names (Multilingual)</span>
              </h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    English Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.nameEn}
                    onChange={(e) => handleEditInputChange('nameEn', e.target.value)}
                    placeholder="e.g., Health Department"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.nameEn ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.nameEn && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.nameEn}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kinyarwanda Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.nameRw}
                    onChange={(e) => handleEditInputChange('nameRw', e.target.value)}
                    placeholder="e.g., Ishami ry'Ubuzima"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.nameRw ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.nameRw && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.nameRw}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    French Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.nameFr}
                    onChange={(e) => handleEditInputChange('nameFr', e.target.value)}
                    placeholder="e.g., Département de la Santé"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.nameFr ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.nameFr && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.nameFr}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Department Information</h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={4}
                  value={editForm.description}
                  onChange={(e) => handleEditInputChange('description', e.target.value)}
                  placeholder="Describe the department's responsibilities and functions..."
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors.description ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {editForm.description.length}/500 characters
                </p>
              </div>
            </div>

            {/* Status */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Status</h4>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editForm.isActive}
                  onChange={(e) => handleEditInputChange('isActive', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="editIsActive" className="text-sm font-medium text-gray-700">
                  Department is active
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Inactive departments will not be available for assignment to leaders
              </p>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('view');
                  setEditingDepartment(null);
                  setFormErrors({});
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
              >
                {isLoading ? 'Updating...' : 'Update Department'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminDepartmentsManagement;
