import React from 'react';
import { MessageCircle, Users, Clock, Tag, MapPin, Paperclip } from 'lucide-react';
import { Issue, Leader } from '../types';
import { formatRelativeTime } from '../utils/dateUtils';
import { AttachmentViewer } from './AttachmentViewer';

interface AdminIssueCardProps {
  issue: Issue;
  currentLeader: Leader;
  onClick: () => void;
}

const statusColors: { [key: string]: string } = {
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
};

const priorityColors: { [key: string]: string } = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
};

export const AdminIssueCard: React.FC<AdminIssueCardProps> = ({ issue, currentLeader, onClick }) => {
  // Debug: Log the issue data to see what's actually being returned
  console.log('AdminIssueCard received issue:', issue);

  // Use the shared date utility function
  const formatDate = (dateString: string) => {
    return formatRelativeTime(dateString);
  };

  // Safely get user display name
  const getUserDisplayName = () => {
    try {
      if (issue.createdBy) {
        const firstName = issue.createdBy.firstName || '';
        const lastName = issue.createdBy.lastName || '';
        
        if (firstName && lastName) {
          return `${firstName} ${lastName}`;
        } else if (firstName) {
          return firstName;
        } else if (lastName) {
          return lastName;
        }
      }
      return 'Unknown User';
    } catch (error) {
      console.error('Error getting user display name:', error);
      return 'Unknown User';
    }
  };

  // Safely get user initials
  const getUserInitials = () => {
    try {
      if (issue.createdBy) {
        const firstName = issue.createdBy.firstName || '';
        const lastName = issue.createdBy.lastName || '';
        
        if (firstName && lastName) {
          return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;
        } else if (firstName) {
          return firstName.charAt(0).toUpperCase();
        } else if (lastName) {
          return lastName.charAt(0).toUpperCase();
        }
      }
      return '?';
    } catch (error) {
      console.error('Error getting user initials:', error);
      return '?';
    }
  };

  return (
    <div className="bg-white border-2 border-blue-200 rounded-lg hover:border-blue-400 transition-all duration-200 cursor-pointer group shadow-lg">
      <div onClick={onClick} className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
              {issue.title || 'Untitled Issue'}
            </h3>
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {issue.description || 'No description available'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[issue.status] || 'bg-gray-100 text-gray-800'}`}>
            {issue.status ? issue.status.replace('_', ' ') : 'Unknown'}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {issue.level || 'Unknown'}
          </span>
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[issue.urgency] || 'bg-gray-100 text-gray-800'}`}>
            {issue.urgency || 'Unknown'}
          </span>
          {issue.category && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              <Tag size={12} className="mr-1" />
              {issue.category}
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {issue.createdBy?.profileUrl ? (
                <img
                  src={issue.createdBy.profileUrl}
                  alt={getUserDisplayName()}
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                  {getUserInitials()}
                </div>
              )}
              <span className="font-medium">
                {getUserDisplayName()}
              </span>
              {issue.createdBy?.role?.name === 'government_official' && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  Government
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <MessageCircle size={14} />
                <span>{issue.comments?.length || 0} comment{(issue.comments?.length || 0) !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users size={14} />
                <span>{issue.followers || 0} follower{(issue.followers || 0) !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Clock size={14} />
            <span>{issue.createdAt ? formatDate(issue.createdAt) : 'Unknown date'}</span>
          </div>
        </div>

        {/* Location info */}
        {issue.location && (
          <div className="mt-3 flex items-center space-x-2 text-sm text-gray-500">
            <MapPin size={14} />
            <span>
              {issue.location.district || 'Unknown District'}
              {issue.location.sector ? `, ${issue.location.sector}` : ''}
              {issue.location.cell ? `, ${issue.location.cell}` : ''}
            </span>
          </div>
        )}

        {/* Attachments */}
        {issue.attachments && issue.attachments.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
              <Paperclip size={14} />
              <span>{issue.attachments.length} attachment{issue.attachments.length !== 1 ? 's' : ''}</span>
            </div>
            <AttachmentViewer 
              attachments={issue.attachments} 
              maxPreviewSize="sm"
              showDownloadButton={false}
            />
          </div>
        )}

        {/* Ticket ID */}
        {issue.ticketId && (
          <div className="mt-3 text-xs text-gray-400">
            Ticket: {issue.ticketId}
          </div>
        )}

        {/* Admin-specific info */}
        <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-blue-700 font-medium">
              {currentLeader.leadershipLevelName || `${currentLeader.level?.charAt(0).toUpperCase() + currentLeader.level?.slice(1)} Level`}
            </span>
            <span className="text-blue-600">
              {currentLeader.location.district}
              {currentLeader.location.sector && `, ${currentLeader.location.sector}`}
              {currentLeader.location.cell && `, ${currentLeader.location.cell}`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminIssueCard;
