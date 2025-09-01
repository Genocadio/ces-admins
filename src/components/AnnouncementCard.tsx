import React, { useState } from 'react';
import { Calendar, Eye, Clock, ChevronDown, ChevronUp, Globe, Download } from 'lucide-react';
import { AnnouncementResponseDto, AttachmentResponseDto, AttachmentType } from '../types';
import AttachmentViewer from './AttachmentViewer';

interface AnnouncementCardProps {
  announcement: AnnouncementResponseDto;
  language: string;
  currentUser?: any;
  onMarkAsRead: (announcementId: number) => void;
  formatDate: (dateString: string) => string;
  getLanguageLabel: (lang: string) => string;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ 
  announcement, 
  language, 
  currentUser, 
  onMarkAsRead,
  formatDate,
  getLanguageLabel
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Check if current user has read this announcement
  const isRead = announcement.hasViewed;
  
  const handleExpand = () => {
    setIsExpanded(!isExpanded);
    
    // Mark as read when expanded
    if (!isExpanded && !isRead && currentUser) {
      onMarkAsRead(announcement.id);
    }
  };

  const isExpired = () => {
    const endTime = new Date(announcement.endTime);
    const now = new Date();
    return endTime < now;
  };

  const getStatusColor = () => {
    if (isExpired()) return 'bg-red-100 text-red-800 border-red-200';
    if (announcement.active) return 'bg-green-100 text-green-800 border-green-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusText = () => {
    if (isExpired()) return 'Expired';
    if (announcement.active) return 'Active';
    return 'Inactive';
  };

  const getLanguageColor = () => {
    switch (announcement.language) {
      case 'ENGLISH': return 'bg-blue-100 text-blue-800';
      case 'KINYARWANDA': return 'bg-green-100 text-green-800';
      case 'FRENCH': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canPreview = (attachment: AttachmentResponseDto) => {
    return attachment.type === AttachmentType.VIDEO || attachment.type === AttachmentType.PHOTO;
  };

  const handleDownload = (attachment: AttachmentResponseDto) => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.description || `attachment-${attachment.id}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`border rounded-lg transition-all duration-200 hover:shadow-md ${
      isRead ? 'opacity-75 bg-gray-50' : 'bg-white border-l-4 border-l-blue-500'
    }`}>
      {/* Header - Always Visible */}
      <div 
        className="p-6 cursor-pointer"
        onClick={handleExpand}
      >
        <div className="flex items-start space-x-4">
          <div className="p-3 rounded-full bg-blue-50 flex-shrink-0">
            <Calendar size={24} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-gray-900">{announcement.title}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor()}`}>
                  {getStatusText()}
                </span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLanguageColor()}`}>
                  <Globe size={12} className="mr-1" />
                  {getLanguageLabel(announcement.language)}
                </span>
                {isRead && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <Eye size={12} className="mr-1" />
                    Read
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>
            
            {/* Preview text - always visible */}
            <p className="text-gray-700 line-clamp-2 leading-relaxed">
              {announcement.description}
            </p>
            
            <div className="flex items-center justify-between text-sm text-gray-500 mt-3">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Calendar size={16} />
                  <span>Created: {formatDate(announcement.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock size={16} />
                  <span>Expires: {formatDate(announcement.endTime)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye size={16} />
                  <span>{announcement.viewCount} views</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-gray-200">
          {/* Full Description */}
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Full Description</h4>
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {announcement.description}
            </p>
          </div>

          {/* Attachments */}
          {announcement.attachments && announcement.attachments.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Attachments</h4>
              <div className="space-y-3">
                {announcement.attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900">
                          {attachment.description || `Attachment ${index + 1}`}
                        </p>
                        <p className="text-gray-500 capitalize">{attachment.type.toLowerCase()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {canPreview(attachment) ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // This will be handled by AttachmentViewer for preview
                          }}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                          Preview
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(attachment);
                          }}
                          className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors flex items-center space-x-1"
                        >
                          <Download size={14} />
                          <span>Download</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {/* Attachment Preview */}
                <div className="mt-4">
                  <AttachmentViewer 
                    attachments={announcement.attachments.filter(canPreview)}
                    maxPreviewSize="lg"
                    showDownloadButton={true}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <span className="font-medium">Last Updated:</span> {formatDate(announcement.updatedAt)}
            </div>
            <div>
              <span className="font-medium">Status:</span> {announcement.active ? 'Active' : 'Inactive'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};