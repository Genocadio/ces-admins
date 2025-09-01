import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  BarChart3, 
  Eye, 
  Edit, 
  Trash2, 
  Copy,
  Download,
  MoreHorizontal
} from 'lucide-react';
import { Survey, SurveyQuestion, SurveyResponse, User } from '../types';
import { surveys } from '../data/dummyData';
import { getSurveysForLeader } from '../data/adminData';
import AdminSurveyForm from './AdminSurveyForm';
import AdminSurveyDetail from './AdminSurveyDetail';

type SurveyStatus = 'draft' | 'active' | 'closed' | 'archived';
type SurveyCategory = 'public_opinion' | 'community_feedback' | 'government_survey' | 'research' | 'poll';

interface AdminSurveysListProps {
  currentLeader?: any;
}

const AdminSurveysList: React.FC<AdminSurveysListProps> = ({ currentLeader }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<SurveyStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<SurveyCategory | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  // Get surveys for current leader's region
  const leaderSurveys = currentLeader ? getSurveysForLeader(currentLeader, surveys) : surveys;
  
  // Filter surveys based on search and filters
  const filteredSurveys = leaderSurveys.filter(survey => {
    const matchesSearch = survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         survey.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         survey.author.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || survey.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || survey.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Sort surveys by creation date (newest first)
  const sortedSurveys = filteredSurveys.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const getSurveyStats = () => {
    const total = leaderSurveys.length;
    const active = leaderSurveys.filter(s => s.status === 'active').length;
    const draft = leaderSurveys.filter(s => s.status === 'draft').length;
    const closed = leaderSurveys.filter(s => s.status === 'closed').length;
    const totalResponses = leaderSurveys.reduce((sum, s) => sum + s.responses.length, 0);
    
    return { total, active, draft, closed, totalResponses };
  };

  const handleCreateSurvey = () => {
    setShowCreateForm(true);
    setShowEditForm(false);
    setSelectedSurvey(null);
  };

  const handleEditSurvey = (survey: Survey) => {
    setSelectedSurvey(survey);
    setShowEditForm(true);
    setShowCreateForm(false);
  };

  const handleViewSurvey = (survey: Survey) => {
    setSelectedSurvey(survey);
    setShowEditForm(false);
    setShowCreateForm(false);
  };

  const handleDuplicateSurvey = (survey: Survey) => {
    // Create a copy of the survey with new ID and draft status
    const duplicatedSurvey: Survey = {
      ...survey,
      id: `copy_${Date.now()}`,
      title: `${survey.title} (Copy)`,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      responses: [],
      viewCount: 0
    };
    
    // In a real app, this would save to the database
    console.log('Duplicating survey:', duplicatedSurvey);
    alert('Survey duplicated! (Check console for details)');
  };

  const handleDeleteSurvey = (survey: Survey) => {
    if (confirm(`Are you sure you want to delete "${survey.title}"? This action cannot be undone.`)) {
      // In a real app, this would delete from the database
      console.log('Deleting survey:', survey.id);
      alert('Survey deleted! (Check console for details)');
    }
  };

  const handleExportResponses = (survey: Survey) => {
    // In a real app, this would export to CSV/Excel
    console.log('Exporting responses for survey:', survey.id);
    alert('Exporting responses... (Check console for details)');
  };

  const stats = getSurveyStats();

  // If showing create form
  if (showCreateForm) {
    return (
      <AdminSurveyForm
        onSave={(surveyData) => {
          // In a real app, this would save to the database
          console.log('Creating survey:', surveyData);
          alert('Survey created! (Check console for details)');
          setShowCreateForm(false);
        }}
        onCancel={() => setShowCreateForm(false)}
        currentUser={currentLeader || { id: 'admin', name: 'Admin', email: 'admin@example.com', firstName: 'Admin', lastName: 'User', phoneNumber: '', avatar: '', location: { district: '', sector: '', cell: '', village: '' }, isGovernment: true, role: 'admin', verified: true, joinedAt: new Date() }}
      />
    );
  }

  // If showing edit form
  if (showEditForm && selectedSurvey) {
    return (
      <AdminSurveyForm
        survey={selectedSurvey}
        onSave={(surveyData) => {
          // In a real app, this would update the database
          console.log('Updating survey:', surveyData);
          alert('Survey updated! (Check console for details)');
          setShowEditForm(false);
          setSelectedSurvey(null);
        }}
        onCancel={() => setShowEditForm(false)}
        currentUser={currentLeader || { id: 'admin', name: 'Admin', email: 'admin@example.com', firstName: 'Admin', lastName: 'User', phoneNumber: '', avatar: '', location: { district: '', sector: '', cell: '', village: '' }, isGovernment: true, role: 'admin', verified: true, joinedAt: new Date() }}
      />
    );
  }

  // If showing survey detail view
  if (selectedSurvey) {
    return (
      <AdminSurveyDetail
        survey={selectedSurvey}
        onBack={() => setSelectedSurvey(null)}
        onEdit={(survey) => {
          setSelectedSurvey(survey);
          setShowEditForm(true);
        }}
        onDelete={(survey) => {
          if (confirm(`Are you sure you want to delete "${survey.title}"? This action cannot be undone.`)) {
            // In a real app, this would delete from the database
            console.log('Deleting survey:', survey.id);
            alert('Survey deleted! (Check console for details)');
            setSelectedSurvey(null);
          }
        }}
        onDuplicate={(survey) => {
          // Create a copy of the survey with new ID and draft status
          const duplicatedSurvey: Survey = {
            ...survey,
            id: `copy_${Date.now()}`,
            title: `${survey.title} (Copy)`,
            status: 'draft',
            createdAt: new Date(),
            updatedAt: new Date(),
            responses: [],
            viewCount: 0
          };
          
          // In a real app, this would save to the database
          console.log('Duplicating survey:', duplicatedSurvey);
          alert('Survey duplicated! (Check console for details)');
        }}
        currentUser={currentLeader || { id: 'admin', name: 'Admin', email: 'admin@example.com', firstName: 'Admin', lastName: 'User', phoneNumber: '', avatar: '', location: { district: '', sector: '', cell: '', village: '' }, isGovernment: true, role: 'admin', verified: true, joinedAt: new Date() }}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Survey Management</h1>
          <p className="text-gray-600 mt-1">
            Create, manage, and analyze community surveys
          </p>
        </div>
        <button
          onClick={handleCreateSurvey}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Create Survey
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Surveys</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Draft</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.draft}</p>
            </div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Closed</p>
              <p className="text-2xl font-bold text-red-600">{stats.closed}</p>
            </div>
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Responses</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalResponses}</p>
            </div>
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search surveys..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
              showFilters 
                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter size={18} />
            <span>Filters</span>
          </button>
        </div>

        {/* Expanded Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as SurveyStatus | 'all')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="closed">Closed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as SurveyCategory | 'all')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="public_opinion">Public Opinion</option>
                  <option value="community_feedback">Community Feedback</option>
                  <option value="government_survey">Government Survey</option>
                  <option value="research">Research</option>
                  <option value="poll">Poll</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      {searchTerm && (
        <div className="text-sm text-gray-600">
          Found {sortedSurveys.length} survey{sortedSurveys.length !== 1 ? 's' : ''} for "{searchTerm}"
        </div>
      )}

      {/* Surveys Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Survey
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Responses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedSurveys.map((survey) => {
                const statusColors = {
                  draft: 'bg-gray-100 text-gray-800',
                  active: 'bg-green-100 text-green-800',
                  closed: 'bg-red-100 text-red-800',
                  archived: 'bg-gray-100 text-gray-600',
                };

                const categoryColors = {
                  public_opinion: 'bg-blue-100 text-blue-800',
                  community_feedback: 'bg-purple-100 text-purple-800',
                  government_survey: 'bg-indigo-100 text-indigo-800',
                  research: 'bg-orange-100 text-orange-800',
                  poll: 'bg-pink-100 text-pink-800',
                };

                return (
                  <tr key={survey.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <BarChart3 className="h-5 w-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {survey.title}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-2">
                            {survey.description}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">
                            by {survey.author.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[survey.status]}`}>
                        {survey.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[survey.category]}`}>
                        {survey.category.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {survey.responses.length}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(survey.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewSurvey(survey)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="View Survey"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEditSurvey(survey)}
                          className="text-green-600 hover:text-green-900 p-1 rounded"
                          title="Edit Survey"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDuplicateSurvey(survey)}
                          className="text-purple-600 hover:text-purple-900 p-1 rounded"
                          title="Duplicate Survey"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={() => handleExportResponses(survey)}
                          className="text-orange-600 hover:text-orange-900 p-1 rounded"
                          title="Export Responses"
                        >
                          <Download size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteSurvey(survey)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Delete Survey"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {sortedSurveys.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-xl font-medium text-gray-900 mb-2">No surveys found</p>
            <p className="text-gray-600">
              {searchTerm 
                ? "Try adjusting your search terms or filters"
                : "Create your first survey to get started"
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSurveysList;
