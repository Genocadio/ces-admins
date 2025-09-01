import React, { useState } from 'react';
import { Filter, Search, BarChart3 } from 'lucide-react';
import { Survey, User } from '../types';
import { SurveyCard } from './SurveyCard';
import { SurveyDetail } from './SurveyDetail';

interface SurveysSectionProps {
  surveys: Survey[];
  language: string;
  currentUser: User | null;
  onSubmitSurvey?: (surveyId: string, answers: { [questionId: string]: string | string[] | number }) => void;
}

type FilterType = 'all' | 'my_surveys' | 'active' | 'draft' | 'closed';
type CategoryFilter = 'all' | 'public_opinion' | 'community_feedback' | 'government_survey' | 'research' | 'poll';

export const SurveysSection: React.FC<SurveysSectionProps> = ({
  surveys,
  language,
  currentUser,
  onSubmitSurvey
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Check if user has already participated in a survey
  const hasUserParticipated = (survey: Survey): boolean => {
    if (!currentUser) return false;
    return survey.responses.some(response => response.userId === currentUser.id);
  };

  // Filter surveys based on search term, filter type, and category
  const filteredSurveys = surveys.filter(survey => {
    // Search filter
    const matchesSearch = survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         survey.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         survey.author.name.toLowerCase().includes(searchTerm.toLowerCase());

    // Status filter
    let matchesStatusFilter = true;
    switch (filter) {
      case 'my_surveys':
        matchesStatusFilter = currentUser ? survey.author.id === currentUser.id : false;
        break;
      case 'active':
        matchesStatusFilter = survey.status === 'active';
        break;
      case 'draft':
        matchesStatusFilter = survey.status === 'draft';
        break;
      case 'closed':
        matchesStatusFilter = survey.status === 'closed';
        break;
    }

    // Category filter
    const matchesCategoryFilter = categoryFilter === 'all' || survey.category === categoryFilter;

    return matchesSearch && matchesStatusFilter && matchesCategoryFilter;
  });

  // Sort surveys by creation date (newest first)
  const sortedSurveys = filteredSurveys.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const handleSurveySubmit = async (answers: { [questionId: string]: string | string[] | number }) => {
    if (selectedSurvey && onSubmitSurvey) {
      try {
        await onSubmitSurvey(selectedSurvey.id, answers);
        setSelectedSurvey(null); // Go back to surveys list
      } catch (error) {
        console.error('Error submitting survey:', error);
      }
    }
  };

  const getSurveyStats = () => {
    const total = surveys.length;
    const active = surveys.filter(s => s.status === 'active').length;
    const myActive = currentUser ? surveys.filter(s => s.author.id === currentUser.id && s.status === 'active').length : 0;
    const participated = surveys.filter(s => hasUserParticipated(s)).length;
    
    return { total, active, myActive, participated };
  };

  const stats = getSurveyStats();

  // If a survey is selected, show the survey detail view
  if (selectedSurvey) {
    return (
      <SurveyDetail
        survey={selectedSurvey}
        currentUser={currentUser}
        onBack={() => setSelectedSurvey(null)}
        onSubmit={handleSurveySubmit}
        hasParticipated={hasUserParticipated(selectedSurvey)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community Surveys</h1>
          <p className="text-gray-600 mt-1">
            Share your opinions and help shape community decisions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
              <p className="text-sm font-medium text-gray-600">My Active</p>
              <p className="text-2xl font-bold text-purple-600">{stats.myActive}</p>
            </div>
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Participated</p>
              <p className="text-2xl font-bold text-orange-600">{stats.participated}</p>
            </div>
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
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
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as FilterType)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Surveys</option>
                  <option value="my_surveys">My Surveys</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
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

      {/* Surveys Grid */}
      <div className="space-y-4">
        {sortedSurveys.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-xl font-medium text-gray-900 mb-2">No surveys found</p>
            <p className="text-gray-600">
              {searchTerm 
                ? "Try adjusting your search terms or filters"
                : "Be the first to create a survey for the community"
              }
            </p>
          </div>
        ) : (
          sortedSurveys.map((survey) => (
            <SurveyCard
              key={survey.id}
              survey={survey}
              currentUser={currentUser}
              language={language}
              hasParticipated={hasUserParticipated(survey)}
              onClick={() => setSelectedSurvey(survey)}
            />
          ))
        )}
      </div>
    </div>
  );
};
