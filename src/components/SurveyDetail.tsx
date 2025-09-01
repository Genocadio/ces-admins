import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, AlertCircle, Star, Paperclip } from 'lucide-react';
import { Survey, SurveyQuestion, User } from '../types';

interface SurveyDetailProps {
  survey: Survey;
  currentUser: User | null;
  onBack: () => void;
  onSubmit: (answers: { [questionId: string]: string | string[] | number }) => void;
  hasParticipated?: boolean;
}

interface QuestionRendererProps {
  question: SurveyQuestion;
  value: string | string[] | number;
  onChange: (value: string | string[] | number) => void;
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({ question, value, onChange }) => {
  const handleCheckboxChange = (option: string, checked: boolean) => {
    const currentValues = Array.isArray(value) ? value : [];
    if (checked) {
      onChange([...currentValues, option]);
    } else {
      onChange(currentValues.filter(v => v !== option));
    }
  };

  const renderRatingStars = () => {
    const maxRating = question.maxRating || 5;
    const currentRating = typeof value === 'number' ? value : 0;
    
    return (
      <div className="flex space-x-1">
        {[...Array(maxRating)].map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => onChange(index + 1)}
            className={`p-1 ${
              index < currentRating ? 'text-yellow-400' : 'text-gray-300'
            } hover:text-yellow-400 transition-colors`}
          >
            <Star size={24} fill={index < currentRating ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>
    );
  };

  switch (question.type) {
    case 'short_text':
      return (
        <input
          type="text"
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your answer..."
        />
      );

    case 'long_text':
      return (
        <textarea
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={4}
          placeholder="Enter your detailed answer..."
        />
      );

    case 'multiple_choice':
    case 'radio':
      return (
        <div className="space-y-2">
          {question.options?.map((option, index) => (
            <label key={index} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name={question.id}
                value={option}
                checked={value === option}
                onChange={(e) => onChange(e.target.value)}
                className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="text-gray-900">{option}</span>
            </label>
          ))}
        </div>
      );

    case 'checkbox':
      return (
        <div className="space-y-2">
          {question.options?.map((option, index) => (
            <label key={index} className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={Array.isArray(value) ? value.includes(option) : false}
                onChange={(e) => handleCheckboxChange(option, e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-gray-900">{option}</span>
            </label>
          ))}
        </div>
      );

    case 'yes_no':
      return (
        <div className="flex space-x-4">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name={question.id}
              value="yes"
              checked={value === 'yes'}
              onChange={(e) => onChange(e.target.value)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-gray-900">Yes</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name={question.id}
              value="no"
              checked={value === 'no'}
              onChange={(e) => onChange(e.target.value)}
              className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <span className="text-gray-900">No</span>
          </label>
        </div>
      );

    case 'rating':
      return (
        <div className="space-y-2">
          <div className="text-sm text-gray-600">
            Rate from 1 to {question.maxRating || 5}
          </div>
          {renderRatingStars()}
          {typeof value === 'number' && value > 0 && (
            <div className="text-sm text-gray-600">
              You rated: {value}/{question.maxRating || 5}
            </div>
          )}
        </div>
      );

    default:
      return (
        <div className="text-gray-500 italic">
          Question type not supported
        </div>
      );
  }
};

export const SurveyDetail: React.FC<SurveyDetailProps> = ({
  survey,
  currentUser,
  onBack,
  onSubmit,
  hasParticipated = false
}) => {
  const [answers, setAnswers] = useState<{ [questionId: string]: string | string[] | number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleAnswerChange = (questionId: string, value: string | string[] | number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const validateAnswers = () => {
    const requiredQuestions = survey.questions.filter(q => q.required);
    return requiredQuestions.every(q => {
      const answer = answers[q.id];
      if (q.type === 'checkbox') {
        return Array.isArray(answer) && answer.length > 0;
      }
      return answer !== undefined && answer !== '' && answer !== 0;
    });
  };

  const handleSubmit = async () => {
    if (!validateAnswers()) {
      alert('Please answer all required questions.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(answers);
    } catch (error) {
      console.error('Error submitting survey:', error);
      alert('There was an error submitting your response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isExpired = survey.settings.expiresAt && new Date() > survey.settings.expiresAt;
  const canParticipate = survey.status === 'active' && !isExpired && (!hasParticipated || survey.settings.allowMultipleResponses);

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <button
          onClick={onBack}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <nav className="text-sm text-gray-500">
            <span>Surveys</span> / <span className="text-gray-900">{survey.title}</span>
          </nav>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {/* Survey Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">{survey.title}</h1>
              <p className="text-gray-700 leading-relaxed mb-4">{survey.description}</p>
              
              {/* Survey Info */}
              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-2">
                  <img
                    src={survey.author.avatar}
                    alt={survey.author.name}
                    className="w-6 h-6 rounded-full"
                  />
                  <span>By {currentUser?.id === survey.author.id ? 'You' : survey.author.name}</span>
                </div>
                <span>•</span>
                <span>Created {formatDate(survey.createdAt)}</span>
                <span>•</span>
                <span>{survey.responses.length} responses</span>
                {survey.settings.expiresAt && (
                  <>
                    <span>•</span>
                    <span>Expires {formatDate(survey.settings.expiresAt)}</span>
                  </>
                )}
              </div>

              {/* Attachments */}
              {survey.attachments && survey.attachments.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Attachments:</h3>
                  <div className="space-y-2">
                    {survey.attachments.map((attachment) => (
                      <div key={attachment.id}>
                        {attachment.type === 'image' ? (
                          <img
                            src={attachment.url}
                            alt={attachment.name}
                            className="max-w-md rounded-lg shadow-sm"
                          />
                        ) : attachment.type === 'video' ? (
                          <video
                            src={attachment.url}
                            controls
                            className="max-w-md rounded-lg shadow-sm"
                            preload="metadata"
                          >
                            Your browser does not support the video tag.
                          </video>
                        ) : (
                          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg max-w-md">
                            <Paperclip size={16} className="text-gray-500" />
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{attachment.name}</p>
                              <p className="text-sm text-gray-500">
                                {(attachment.size / 1024 / 1024).toFixed(1)} MB
                              </p>
                            </div>
                            <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                              Download
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Status Messages */}
              {hasParticipated && (
                <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                  <CheckCircle size={16} className="text-green-600" />
                  <span className="text-green-800 font-medium">
                    You have already participated in this survey
                  </span>
                  {survey.settings.allowMultipleResponses && (
                    <span className="text-green-700">, but you can submit another response</span>
                  )}
                </div>
              )}

              {isExpired && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                  <AlertCircle size={16} className="text-red-600" />
                  <span className="text-red-800 font-medium">This survey has expired</span>
                </div>
              )}

              {survey.status !== 'active' && (
                <div className="flex items-center space-x-2 p-3 bg-gray-50 border border-gray-200 rounded-lg mb-4">
                  <AlertCircle size={16} className="text-gray-600" />
                  <span className="text-gray-800 font-medium">
                    This survey is currently {survey.status}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Questions */}
        {canParticipate && (
          <div className="p-6">
            <div className="space-y-6">
              {survey.questions.map((question, index) => (
                <div key={question.id} className="border-b border-gray-100 pb-6 last:border-b-0 last:pb-0">
                  <div className="mb-3">
                    <div className="flex items-start space-x-2 mb-2">
                      <span className="text-sm font-medium text-gray-600 mt-1">
                        {index + 1}.
                      </span>
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          {question.title}
                          {question.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </h3>
                        {question.description && (
                          <p className="text-sm text-gray-600 mb-3">{question.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="ml-6">
                    <QuestionRenderer
                      question={question}
                      value={answers[question.id] || (question.type === 'checkbox' ? [] : '')}
                      onChange={(value) => handleAnswerChange(question.id, value)}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  * Required questions
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !validateAnswers()}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Survey'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Only Mode */}
        {!canParticipate && (
          <div className="p-6">
            <div className="text-center py-12 text-gray-500">
              <AlertCircle size={48} className="mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">Survey Not Available</p>
              <p>
                {hasParticipated && !survey.settings.allowMultipleResponses
                  ? "You have already participated in this survey."
                  : isExpired
                  ? "This survey has expired."
                  : "This survey is not currently accepting responses."}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
