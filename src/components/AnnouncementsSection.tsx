import React, { useState } from 'react';
import { AlertCircle, Calendar, Eye, Clock } from 'lucide-react';
import { AnnouncementResponseDto } from '../types';
import { AnnouncementCard } from './AnnouncementCard';
import { getTranslation } from '../i18n/translations';
import { useAnnouncements } from '../hooks/useAnnouncements';

interface AnnouncementsSectionProps {
  language: string;
  currentUser?: any;
}

export const AnnouncementsSection: React.FC<AnnouncementsSectionProps> = ({ 
  language, 
  currentUser 
}) => {
  const {
    announcements,
    isLoading,
    error,
    totalPages,
    currentPage,
    totalElements,
    markAsRead,
    nextPage,
    previousPage,
    hasNext,
    hasPrevious,
  } = useAnnouncements({ enabled: true, isAdmin: false });

  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Filter announcements based on selected criteria
  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesLanguage = selectedLanguage === 'all' || announcement.language === selectedLanguage;
    const matchesStatus = selectedStatus === 'all' || 
      (selectedStatus === 'active' && announcement.active) ||
      (selectedStatus === 'expired' && !announcement.active);
    
    return matchesLanguage && matchesStatus;
  });

  const handleMarkAsRead = async (announcementId: number) => {
    await markAsRead(announcementId);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(language === 'ENGLISH' ? 'en-US' : language === 'FRENCH' ? 'fr-FR' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  const getLanguageLabel = (lang: string) => {
    switch (lang) {
      case 'ENGLISH': return 'English';
      case 'KINYARWANDA': return 'Kinyarwanda';
      case 'FRENCH': return 'French';
      default: return lang;
    }
  };

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <AlertCircle size={48} className="mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Announcements</h3>
        <p className="text-gray-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getTranslation('announcements', language)}
          </h1>
          <p className="text-gray-600">
            Stay updated with the latest government announcements and public notices.
          </p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <AlertCircle size={16} />
          <span>{totalElements} total announcements</span>
          {currentUser && (
            <>
              <span>•</span>
              <span className="text-blue-600 font-medium">
                {announcements.filter(a => !a.hasViewed).length} unread
              </span>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Language Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Languages</option>
              <option value="ENGLISH">English</option>
              <option value="KINYARWANDA">Kinyarwanda</option>
              <option value="FRENCH">French</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Announcements</option>
              <option value="active">Active Only</option>
              <option value="expired">Expired Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Total</p>
              <p className="text-2xl font-bold text-blue-800">{totalElements}</p>
            </div>
            <AlertCircle className="text-blue-600" size={24} />
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Active</p>
              <p className="text-2xl font-bold text-green-800">
                {announcements.filter(a => a.active).length}
              </p>
            </div>
            <Clock className="text-green-600" size={24} />
          </div>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Unread</p>
              <p className="text-2xl font-bold text-orange-800">
                {announcements.filter(a => !a.hasViewed).length}
              </p>
            </div>
            <Eye className="text-orange-600" size={24} />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading announcements...</p>
        </div>
      )}

      {/* Announcements List */}
      {!isLoading && (
        <div className="space-y-4">
          {filteredAnnouncements.length > 0 ? (
            filteredAnnouncements.map(announcement => (
              <AnnouncementCard
                key={announcement.id}
                announcement={announcement}
                language={language}
                currentUser={currentUser}
                onMarkAsRead={handleMarkAsRead}
                formatDate={formatDate}
                getLanguageLabel={getLanguageLabel}
              />
            ))
          ) : (
            <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
              <p className="text-gray-500 text-lg">No announcements found matching your criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <button
            onClick={previousPage}
            disabled={!hasPrevious}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          
          <span className="px-3 py-2 text-sm text-gray-600">
            Page {currentPage + 1} of {totalPages}
          </span>
          
          <button
            onClick={nextPage}
            disabled={!hasNext}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};