import React from 'react';
import { Clock, Users, BarChart3, CheckCircle, AlertCircle, Paperclip } from 'lucide-react';
import { Survey as SurveyType } from '../types';
import { getTranslation } from '../i18n/translations';

interface SurveyCardProps {
  survey: SurveyType;
  language: string;
  onClick: () => void;
  currentUser?: any;
  hasParticipated?: boolean;
  isReadOnly?: boolean;
  onLoginRequired?: () => void;
}

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

export const SurveyCard: React.FC<SurveyCardProps> = ({ 
  survey, 
  language, 
  onClick, 
  currentUser,
  hasParticipated = false,
  isReadOnly = false,
  onLoginRequired
}) => {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        return getTranslation('justNow', language);
      }
      return `${hours} ${getTranslation('hoursAgo', language)}`;
    }
    return `${days} ${getTranslation('daysAgo', language)}`;
  };

  const isExpired = survey.settings.expiresAt && new Date() > survey.settings.expiresAt;
  const canParticipate = survey.status === 'active' && !isExpired && (!hasParticipated || survey.settings.allowMultipleResponses);

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-all duration-200 cursor-pointer group">
      <div onClick={onClick} className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {survey.title}
              </h3>
              {hasParticipated && (
                <div title="You have participated">
                  <CheckCircle size={16} className="text-green-600" />
                </div>
              )}
              {isExpired && (
                <div title="Survey expired">
                  <AlertCircle size={16} className="text-red-600" />
                </div>
              )}
            </div>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {survey.description}
            </p>
          </div>
        </div>

        {/* Media/Attachments indicator */}
        {survey.attachments && survey.attachments.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Paperclip size={14} />
              <span>{survey.attachments.length} attachment{survey.attachments.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        )}

        {/* Status and Category badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[survey.status]}`}>
            {survey.status.replace('_', ' ').toUpperCase()}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[survey.category]}`}>
            {survey.category.replace('_', ' ').toUpperCase()}
          </span>
          {survey.author.isGovernment && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              OFFICIAL
            </span>
          )}
        </div>

        {/* Survey Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <img
                src={survey.author.avatar}
                alt={survey.author.name}
                className="w-6 h-6 rounded-full"
              />
              <span>{currentUser && currentUser.id === survey.author.id ? 'You' : survey.author.name}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock size={14} />
              <span>{formatDate(survey.createdAt)}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Users size={14} />
              <span>{survey.responses.length} responses</span>
            </div>
            <div className="flex items-center space-x-1">
              <BarChart3 size={14} />
              <span>{survey.questions.length} questions</span>
            </div>
          </div>
        </div>

        {/* Expiry warning */}
        {survey.settings.expiresAt && !isExpired && (
          <div className="mb-3">
            <div className="flex items-center space-x-2 text-xs text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
              <AlertCircle size={12} />
              <span>
                Expires on {survey.settings.expiresAt.toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Action bar */}
      <div className="border-t border-gray-100 px-6 py-3 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-600">
            {survey.questions.length} question{survey.questions.length !== 1 ? 's' : ''} • 
            {survey.responses.length} response{survey.responses.length !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center space-x-2">
            {canParticipate ? (
              <span className="text-xs font-medium text-blue-600">Click to participate</span>
            ) : hasParticipated ? (
              <span className="text-xs font-medium text-green-600">✓ Completed</span>
            ) : isExpired ? (
              <span className="text-xs font-medium text-red-600">Expired</span>
            ) : (
              <span className="text-xs font-medium text-gray-600">Closed</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
