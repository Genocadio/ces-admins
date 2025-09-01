import { useState } from 'react';
import { 
  ArrowLeft, 
  BarChart3, 
  Users, 
  Calendar, 
  Download,
  Eye,
  Edit,
  Trash2,
  Copy
} from 'lucide-react';
import { Survey, SurveyResponse, User } from '../types';
import { surveys } from '../data/dummyData';

interface AdminSurveyDetailProps {
  survey: Survey;
  onBack: () => void;
  onEdit: (survey: Survey) => void;
  onDelete: (survey: Survey) => void;
  onDuplicate: (survey: Survey) => void;
  currentUser: User;
}

const AdminSurveyDetail: React.FC<AdminSurveyDetailProps> = ({
  survey,
  onBack,
  onEdit,
  onDelete,
  onDuplicate,
  currentUser
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'responses' | 'analytics'>('overview');

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getResponseStats = () => {
    const totalResponses = survey.responses.length;
    const uniqueUsers = new Set(survey.responses.map(r => r.userId)).size;
    const completionRate = totalResponses > 0 ? Math.round((uniqueUsers / totalResponses) * 100) : 0;
    
    return { totalResponses, uniqueUsers, completionRate };
  };

  const getQuestionStats = (questionId: string) => {
    const responses = survey.responses.filter(r => r.answers[questionId] !== undefined);
    const question = survey.questions.find(q => q.id === questionId);
    
    if (!question) return null;

    if (question.type === 'rating') {
      const ratings = responses.map(r => r.answers[questionId] as number).filter(r => typeof r === 'number');
      const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
      return { type: 'rating', avgRating, totalResponses: ratings.length };
    }

    if (['multiple_choice', 'radio', 'yes_no'].includes(question.type)) {
      const answers = responses.map(r => r.answers[questionId] as string);
      const counts: { [key: string]: number } = {};
      answers.forEach(answer => {
        counts[answer] = (counts[answer] || 0) + 1;
      });
      return { type: 'choice', counts, totalResponses: answers.length };
    }

    if (question.type === 'checkbox') {
      const answers = responses.map(r => r.answers[questionId] as string[]).filter(a => Array.isArray(a));
      const counts: { [key: string]: number } = {};
      answers.forEach(answerArray => {
        answerArray.forEach(answer => {
          counts[answer] = (counts[answer] || 0) + 1;
        });
      });
      return { type: 'checkbox', counts, totalResponses: answers.length };
    }

    return { type: 'text', totalResponses: responses.length };
  };

  const exportResponses = () => {
    // In a real app, this would export to CSV/Excel
    console.log('Exporting responses for survey:', survey.id);
    alert('Exporting responses... (Check console for details)');
  };

  const stats = getResponseStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{survey.title}</h1>
            <p className="text-gray-600 mt-1">Survey Management & Analytics</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onDuplicate(survey)}
            className="inline-flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Copy size={16} className="mr-2" />
            Duplicate
          </button>
          <button
            onClick={() => onEdit(survey)}
            className="inline-flex items-center px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit size={16} className="mr-2" />
            Edit
          </button>
          <button
            onClick={() => onDelete(survey)}
            className="inline-flex items-center px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 size={16} className="mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Survey Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Responses</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalResponses}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Unique Users</p>
              <p className="text-2xl font-bold text-green-600">{stats.uniqueUsers}</p>
            </div>
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Questions</p>
              <p className="text-2xl font-bold text-purple-600">{survey.questions.length}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Status</p>
              <p className={`text-2xl font-bold ${
                survey.status === 'active' ? 'text-green-600' :
                survey.status === 'draft' ? 'text-yellow-600' :
                survey.status === 'closed' ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {survey.status.toUpperCase()}
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${
              survey.status === 'active' ? 'bg-green-500' :
              survey.status === 'draft' ? 'bg-yellow-500' :
              survey.status === 'closed' ? 'bg-red-500' :
              'bg-gray-500'
            }`}></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('responses')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'responses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Responses ({stats.totalResponses})
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analytics'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Survey Details */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Survey Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Title</label>
                    <p className="mt-1 text-sm text-gray-900">{survey.title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <p className="mt-1 text-sm text-gray-900 capitalize">{survey.category.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Author</label>
                    <p className="mt-1 text-sm text-gray-900">{survey.author.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Created</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(survey.createdAt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Updated</label>
                    <p className="mt-1 text-sm text-gray-900">{formatDate(survey.updatedAt)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">View Count</label>
                    <p className="mt-1 text-sm text-gray-900">{survey.viewCount}</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <p className="text-sm text-gray-900">{survey.description}</p>
              </div>

              {/* Settings */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Survey Settings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Allow Anonymous</label>
                    <p className="mt-1 text-sm text-gray-900">{survey.settings.allowAnonymous ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Require Login</label>
                    <p className="mt-1 text-sm text-gray-900">{survey.settings.requireLogin ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Show Results</label>
                    <p className="mt-1 text-sm text-gray-900">{survey.settings.showResults ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Multiple Responses</label>
                    <p className="mt-1 text-sm text-gray-900">{survey.settings.allowMultipleResponses ? 'Yes' : 'No'}</p>
                  </div>
                  {survey.settings.expiresAt && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Expires At</label>
                      <p className="mt-1 text-sm text-gray-900">{formatDate(survey.settings.expiresAt)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Questions */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Questions ({survey.questions.length})</h3>
                <div className="space-y-3">
                  {survey.questions.map((question, index) => (
                    <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm font-medium text-gray-600">{index + 1}.</span>
                            <h4 className="text-sm font-medium text-gray-900">{question.title}</h4>
                            {question.required && (
                              <span className="text-xs text-red-500">*</span>
                            )}
                          </div>
                          {question.description && (
                            <p className="text-xs text-gray-500 mb-2">{question.description}</p>
                          )}
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Type: {question.type.replace('_', ' ')}</span>
                            <span>Required: {question.required ? 'Yes' : 'No'}</span>
                            {question.maxRating && (
                              <span>Max Rating: {question.maxRating}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'responses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Survey Responses</h3>
                <button
                  onClick={exportResponses}
                  className="inline-flex items-center px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download size={16} className="mr-2" />
                  Export Responses
                </button>
              </div>

              {survey.responses.length === 0 ? (
                <div className="text-center py-12">
                  <Users size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-xl font-medium text-gray-900 mb-2">No responses yet</p>
                  <p className="text-gray-600">When people start responding to your survey, their answers will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {survey.responses.map((response) => (
                    <div key={response.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users size={16} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">User {response.userId}</p>
                            <p className="text-xs text-gray-500">{formatDate(response.submittedAt)}</p>
                          </div>
                        </div>
                        <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                          <Eye size={16} className="mr-1" />
                          View Details
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {survey.questions.map((question) => {
                          const answer = response.answers[question.id];
                          if (answer === undefined) return null;
                          
                          return (
                            <div key={question.id} className="text-sm">
                              <p className="font-medium text-gray-700 mb-1">{question.title}</p>
                              <p className="text-gray-900">
                                {Array.isArray(answer) ? answer.join(', ') : String(answer)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Response Analytics</h3>
              
              {survey.responses.length === 0 ? (
                <div className="text-center py-12">
                  <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-xl font-medium text-gray-900 mb-2">No data to analyze</p>
                  <p className="text-gray-600">Analytics will appear here once people start responding to your survey.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Response Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">Total Responses</h4>
                      <p className="text-2xl font-bold text-blue-900">{stats.totalResponses}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-green-900 mb-2">Unique Users</h4>
                      <p className="text-2xl font-bold text-green-900">{stats.uniqueUsers}</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="text-sm font-medium text-purple-900 mb-2">Completion Rate</h4>
                      <p className="text-2xl font-bold text-purple-900">{stats.completionRate}%</p>
                    </div>
                  </div>

                  {/* Question Analytics */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Question Analysis</h4>
                    <div className="space-y-4">
                      {survey.questions.map((question) => {
                        const questionStats = getQuestionStats(question.id);
                        if (!questionStats) return null;

                        return (
                          <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                            <h5 className="text-sm font-medium text-gray-900 mb-3">{question.title}</h5>
                            
                            {questionStats.type === 'rating' && (
                              <div className="space-y-2">
                                <p className="text-sm text-gray-600">
                                  Average Rating: <span className="font-medium">{questionStats.avgRating.toFixed(1)}</span> / 5
                                </p>
                                <p className="text-sm text-gray-600">
                                  Total Responses: <span className="font-medium">{questionStats.totalResponses}</span>
                                </p>
                              </div>
                            )}

                            {(questionStats.type === 'choice' || questionStats.type === 'checkbox') && (
                              <div className="space-y-2">
                                <p className="text-sm text-gray-600">
                                  Total Responses: <span className="font-medium">{questionStats.totalResponses}</span>
                                </p>
                                <div className="space-y-1">
                                  {Object.entries(questionStats.counts).map(([option, count]) => (
                                    <div key={option} className="flex items-center justify-between">
                                      <span className="text-sm text-gray-700">{option}</span>
                                      <span className="text-sm font-medium text-gray-900">{count}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {questionStats.type === 'text' && (
                              <p className="text-sm text-gray-600">
                                Total Responses: <span className="font-medium">{questionStats.totalResponses}</span>
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSurveyDetail;









