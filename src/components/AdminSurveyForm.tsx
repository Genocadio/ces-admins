import { useState, useEffect } from 'react';
import { Save, Eye, EyeOff, Plus, Trash2, Copy, Edit, BarChart3 } from 'lucide-react';
import { Survey, SurveyQuestion, User } from '../types';

interface AdminSurveyFormProps {
  survey?: Survey | null;
  onSave: (survey: Partial<Survey>) => void;
  onCancel: () => void;
  currentUser: User;
}

type QuestionType = 'multiple_choice' | 'short_text' | 'long_text' | 'checkbox' | 'radio' | 'rating' | 'yes_no';

const AdminSurveyForm: React.FC<AdminSurveyFormProps> = ({ 
  survey, 
  onSave, 
  onCancel, 
  currentUser 
}) => {
  const isEditing = !!survey;
  
  const [formData, setFormData] = useState<Partial<Survey>>({
    title: '',
    description: '',
    category: 'public_opinion',
    status: 'draft',
    questions: [],
    settings: {
      allowAnonymous: false,
      requireLogin: true,
      showResults: false,
      allowMultipleResponses: false,
    },
    targetAudience: [],
    isPublic: true,
  });

  const [newQuestion, setNewQuestion] = useState<Partial<SurveyQuestion>>({
    type: 'multiple_choice',
    title: '',
    description: '',
    required: false,
    options: [''],
    maxRating: 5,
  });

  const [showQuestionForm, setShowQuestionForm] = useState(false);

  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (survey) {
      setFormData({
        ...survey,
        questions: [...survey.questions],
      });
    }
  }, [survey]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // If changing category from poll to survey or vice versa, reset questions
    if (field === 'category') {
      setFormData(prev => ({
        ...prev,
        questions: []
      }));
    }
  };

  const handleSettingsChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings!,
        [field]: value
      }
    }));
  };

  const addQuestion = () => {
    if (!newQuestion.title?.trim()) {
      setErrors(prev => ({ ...prev, newQuestion: 'Question title is required' }));
      return;
    }

    // For polls, only allow simple question types
    if (formData.category === 'poll') {
      if (!['multiple_choice', 'radio', 'yes_no'].includes(newQuestion.type || '')) {
        setErrors(prev => ({ ...prev, newQuestion: 'Polls only support multiple choice, single choice, or yes/no questions' }));
        return;
      }
      
      // Ensure options are provided for choice questions
      if (['multiple_choice', 'radio'].includes(newQuestion.type || '') && 
          (!newQuestion.options || newQuestion.options.length < 2 || newQuestion.options.some(opt => !opt.trim()))) {
        setErrors(prev => ({ ...prev, newQuestion: 'Choice questions must have at least 2 non-empty options' }));
        return;
      }
    }

    const question: SurveyQuestion = {
      id: `q_${Date.now()}`,
      type: newQuestion.type as QuestionType,
      title: newQuestion.title,
      description: newQuestion.description || '',
      required: newQuestion.required || false,
      options: newQuestion.type === 'rating' ? undefined : (newQuestion.options || ['']),
      maxRating: newQuestion.type === 'rating' ? newQuestion.maxRating : undefined,
    };

    setFormData(prev => ({
      ...prev,
      questions: [...(prev.questions || []), question]
    }));

    setNewQuestion({
      type: 'multiple_choice',
      title: '',
      description: '',
      required: false,
      options: [''],
      maxRating: 5,
    });
    setErrors(prev => ({ ...prev, newQuestion: '' }));
    setShowQuestionForm(false);
  };

  const removeQuestion = (index: number) => {
    const updatedQuestions = [...(formData.questions || [])];
    updatedQuestions.splice(index, 1);
    setFormData(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updatedQuestions = [...(formData.questions || [])];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setFormData(prev => ({ ...prev, questions: updatedQuestions }));
  };

  const addOption = (questionIndex: number) => {
    const updatedQuestions = [...(formData.questions || [])];
    const question = updatedQuestions[questionIndex];
    if (question.options) {
      question.options.push('');
      setFormData(prev => ({ ...prev, questions: updatedQuestions }));
    }
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updatedQuestions = [...(formData.questions || [])];
    const question = updatedQuestions[questionIndex];
    if (question.options) {
      question.options[optionIndex] = value;
      setFormData(prev => ({ ...prev, questions: updatedQuestions }));
    }
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updatedQuestions = [...(formData.questions || [])];
    const question = updatedQuestions[questionIndex];
    if (question.options && question.options.length > 1) {
      question.options.splice(optionIndex, 1);
      setFormData(prev => ({ ...prev, questions: updatedQuestions }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title?.trim()) {
      newErrors.title = 'Survey title is required';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Survey description is required';
    }

    if (!formData.questions || formData.questions.length === 0) {
      newErrors.questions = 'At least one question is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) {
      return;
    }

    const surveyData: Partial<Survey> = {
      ...formData,
      author: currentUser,
      updatedAt: new Date(),
      ...(isEditing ? {} : { createdAt: new Date() }),
    };

    onSave(surveyData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">
          {isEditing ? 'Edit Survey' : 'Create New Survey'}
        </h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center px-4 py-2 rounded-lg border transition-colors ${
              showPreview 
                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
            <span className="ml-2">{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save size={20} className="mr-2" />
            {isEditing ? 'Update Survey' : 'Create Survey'}
          </button>
        </div>
      </div>

      {showPreview ? (
        /* Preview Mode */
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Survey Preview</h3>
            <p className="text-sm text-blue-700">
              This is how your {formData.category === 'poll' ? 'poll' : 'survey'} will appear to respondents
            </p>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{formData.title || 'Survey Title'}</h2>
          <p className="text-gray-700 mb-6">{formData.description || 'Survey description will appear here'}</p>
          
          {formData.questions?.map((question, index) => (
            <div key={question.id} className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {index + 1}. {question.title}
                {question.required && <span className="text-red-500 ml-1">*</span>}
              </h3>
              {question.description && (
                <p className="text-sm text-gray-600 mb-3">{question.description}</p>
              )}
              
              {/* Preview question types */}
              {question.type === 'multiple_choice' && (
                <div className="space-y-2">
                  {question.options?.map((option, optionIndex) => (
                    <label key={optionIndex} className="flex items-center space-x-3">
                      <input type="radio" disabled className="w-4 h-4 text-blue-600 border-gray-300" />
                      <span className="text-gray-900">{option}</span>
                    </label>
                  ))}
                </div>
              )}
              
              {question.type === 'radio' && (
                <div className="space-y-2">
                  {question.options?.map((option, optionIndex) => (
                    <label key={optionIndex} className="flex items-center space-x-3">
                      <input type="radio" disabled className="w-4 h-4 text-blue-600 border-gray-300" />
                      <span className="text-gray-900">{option}</span>
                    </label>
                  ))}
                </div>
              )}
              
              {question.type === 'checkbox' && (
                <div className="space-y-2">
                  {question.options?.map((option, optionIndex) => (
                    <label key={optionIndex} className="flex items-center space-x-3">
                      <input type="checkbox" disabled className="w-4 h-4 text-blue-600 border-gray-300 rounded" />
                      <span className="text-gray-900">{option}</span>
                    </label>
                  ))}
                </div>
              )}
              
              {question.type === 'short_text' && (
                <input
                  type="text"
                  disabled
                  placeholder="Text input will appear here"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              )}
              
              {question.type === 'long_text' && (
                <textarea
                  disabled
                  placeholder="Text area will appear here"
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 resize-none"
                  rows={4}
                />
              )}
              
              {question.type === 'rating' && (
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    Rate from 1 to {question.maxRating || 5}
                  </div>
                  <div className="flex space-x-1">
                    {[...Array(question.maxRating || 5)].map((_, i) => (
                      <div key={i} className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {question.type === 'yes_no' && (
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input type="radio" disabled className="w-4 h-4 text-blue-600 border-gray-300" />
                    <span className="text-gray-900">Yes</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" disabled className="w-4 h-4 text-blue-600 border-gray-300" />
                    <span className="text-gray-900">No</span>
                  </label>
                </div>
              )}
            </div>
          ))}
          
          {(!formData.questions || formData.questions.length === 0) && (
            <div className="text-center py-12 text-gray-500">
              <BarChart3 size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-lg font-medium mb-2">No questions added yet</p>
              <p>Add questions to see how your {formData.category === 'poll' ? 'poll' : 'survey'} will look</p>
            </div>
          )}
        </div>
      ) : (
        /* Edit Mode */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Survey Title *</label>
                  <input
                    type="text"
                    value={formData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.title ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Enter survey title..."
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                      errors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    rows={4}
                    placeholder="Describe what this survey is about..."
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="public_opinion">Public Opinion</option>
                      <option value="community_feedback">Community Feedback</option>
                      <option value="government_survey">Government Survey</option>
                      <option value="research">Research</option>
                      <option value="poll">Poll</option>
                    </select>
                    {formData.category === 'poll' && (
                      <p className="mt-1 text-xs text-yellow-600">
                        Polls are simplified surveys with limited question types
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="closed">Closed</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

                          {/* Questions */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Questions</h3>
                  <span className="text-sm text-gray-500">
                    {formData.questions?.length || 0} question{(formData.questions?.length || 0) !== 1 ? 's' : ''}
                  </span>
                </div>

                {errors.questions && (
                  <p className="mb-4 text-sm text-red-600">{errors.questions}</p>
                )}

                {formData.questions?.map((question, index) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-medium text-gray-900">Question {index + 1}</h4>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setNewQuestion({
                              type: question.type,
                              title: question.title,
                              description: question.description,
                              required: question.required,
                              options: question.options ? [...question.options] : [''],
                              maxRating: question.maxRating,
                            });
                            setShowQuestionForm(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded"
                          title="Edit Question"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => removeQuestion(index)}
                          className="text-red-600 hover:text-red-900 p-1 rounded"
                          title="Remove Question"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">{question.title}</h5>
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
                    
                    {/* Show options for choice questions */}
                    {['multiple_choice', 'radio', 'checkbox'].includes(question.type) && question.options && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-gray-700 mb-2">Options:</p>
                        <div className="space-y-1">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-center space-x-2">
                              <div className="w-4 h-4 rounded border border-gray-300 flex items-center justify-center">
                                {question.type === 'radio' ? (
                                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                                ) : question.type === 'checkbox' ? (
                                  <div className="w-2 h-2 rounded bg-blue-600"></div>
                                ) : (
                                  <div className="w-2 h-2 rounded bg-blue-600"></div>
                                )}
                              </div>
                              <span className="text-sm text-gray-700">{option}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add New Question Button */}
                <div className="text-center">
                  {formData.category === 'poll' && (
                    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Poll Mode:</strong> Only multiple choice, single choice, and yes/no questions are allowed for polls.
                      </p>
                    </div>
                  )}
                  <button
                    onClick={() => setShowQuestionForm(true)}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus size={20} className="mr-2" />
                    Add New Question
                  </button>
                </div>

                {/* Question Form Modal */}
                {showQuestionForm && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-medium text-gray-900">
                          {formData.questions?.some(q => q.id === newQuestion.id) ? 'Edit Question' : 'Add New Question'}
                        </h4>
                        <button
                          onClick={() => setShowQuestionForm(false)}
                          className="text-gray-500 hover:text-gray-700"
                        >
                          ✕
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Question Type</label>
                            <select
                              value={newQuestion.type}
                              onChange={(e) => setNewQuestion(prev => ({ ...prev, type: e.target.value as QuestionType }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              {formData.category === 'poll' ? (
                                <>
                                  <option value="multiple_choice">Multiple Choice</option>
                                  <option value="radio">Single Choice (Radio)</option>
                                  <option value="yes_no">Yes/No</option>
                                </>
                              ) : (
                                <>
                                  <option value="multiple_choice">Multiple Choice</option>
                                  <option value="radio">Single Choice (Radio)</option>
                                  <option value="checkbox">Checkbox</option>
                                  <option value="short_text">Short Text</option>
                                  <option value="long_text">Long Text</option>
                                  <option value="rating">Rating</option>
                                  <option value="yes_no">Yes/No</option>
                                </>
                              )}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Required</label>
                            <div className="flex items-center">
                              <input
                                type="checkbox"
                                checked={newQuestion.required}
                                onChange={(e) => setNewQuestion(prev => ({ ...prev, required: e.target.checked }))}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">Required</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Question Title *</label>
                          <input
                            type="text"
                            value={newQuestion.title}
                            onChange={(e) => setNewQuestion(prev => ({ ...prev, title: e.target.value }))}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                              errors.newQuestion ? 'border-red-300' : 'border-gray-300'
                            }`}
                            placeholder="Enter your question..."
                          />
                          {errors.newQuestion && (
                            <p className="mt-1 text-sm text-red-600">{errors.newQuestion}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                          <textarea
                            value={newQuestion.description || ''}
                            onChange={(e) => setNewQuestion(prev => ({ ...prev, description: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={2}
                            placeholder="Additional context for the question..."
                          />
                        </div>

                        {/* Options for multiple choice, radio, checkbox */}
                        {['multiple_choice', 'radio', 'checkbox'].includes(newQuestion.type || '') && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Options *</label>
                            <div className="space-y-2">
                              {newQuestion.options?.map((option, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={option}
                                    onChange={(e) => {
                                      const newOptions = [...(newQuestion.options || [])];
                                      newOptions[index] = e.target.value;
                                      setNewQuestion(prev => ({ ...prev, options: newOptions }));
                                    }}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder={`Option ${index + 1}`}
                                  />
                                  {newQuestion.options && newQuestion.options.length > 1 && (
                                    <button
                                      onClick={() => {
                                        const newOptions = [...(newQuestion.options || [])];
                                        newOptions.splice(index, 1);
                                        setNewQuestion(prev => ({ ...prev, options: newOptions }));
                                      }}
                                      className="text-red-600 hover:text-red-900 p-1 rounded"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  )}
                                </div>
                              ))}
                              <button
                                onClick={() => setNewQuestion(prev => ({ 
                                  ...prev, 
                                  options: [...(prev.options || []), ''] 
                                }))}
                                className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                              >
                                + Add Option
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Max rating for rating questions */}
                        {newQuestion.type === 'rating' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Rating</label>
                            <select
                              value={newQuestion.maxRating}
                              onChange={(e) => setNewQuestion(prev => ({ ...prev, maxRating: parseInt(e.target.value) }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value={3}>3</option>
                              <option value={5}>5</option>
                              <option value={7}>7</option>
                              <option value={10}>10</option>
                            </select>
                          </div>
                        )}

                        <div className="flex justify-end space-x-3 pt-4">
                          <button
                            onClick={() => setShowQuestionForm(false)}
                            className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={addQuestion}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                          >
                            <Plus size={20} className="mr-2" />
                            {formData.questions?.some(q => q.id === newQuestion.id) ? 'Update Question' : 'Add Question'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Survey Settings */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Survey Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Response Settings</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.settings?.allowAnonymous}
                        onChange={(e) => handleSettingsChange('allowAnonymous', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Allow Anonymous Responses</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.settings?.allowMultipleResponses}
                        onChange={(e) => handleSettingsChange('allowMultipleResponses', e.target.checked)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Allow Multiple Responses</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSurveyForm;
