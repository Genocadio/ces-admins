import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, Megaphone, Calendar, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnnouncementResponseDto, AnnouncementRequestDto } from '../types';
import { useAnnouncements } from '../hooks/useAnnouncements';
import AdminAnnouncementForm from './AdminAnnouncementForm';

interface AdminAnnouncementsListProps {
  currentLeader?: any;
}

type FilterType = 'all' | 'active' | 'expired';
type SortType = 'newest' | 'oldest' | 'popular';

const AdminAnnouncementsList: React.FC<AdminAnnouncementsListProps> = ({ currentLeader }) => {
  const [filter, setFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementResponseDto | null>(null);

  // Fetch announcements from API
  const {
    announcements,
    isLoading,
    error,
    totalPages,
    totalElements,
    currentPage,
    hasNext,
    hasPrevious,
    refetch,
    fetchNextPage,
    fetchPreviousPage,
    goToPage,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement
  } = useAnnouncements({
    page: 0,
    size: 20,
    sortBy: sortBy === 'newest' ? 'createdAt' : sortBy === 'oldest' ? 'createdAt' : 'viewCount',
    sortDir: sortBy === 'oldest' ? 'asc' : 'desc',
    enabled: true,
    isAdmin: true
  });

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         announcement.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filter === 'active') return announcement.active && matchesSearch;
    if (filter === 'expired') return !announcement.active && matchesSearch;
    return matchesSearch;
  });

  const handleEdit = (announcement: AnnouncementResponseDto) => {
    setEditingAnnouncement(announcement);
    setShowCreateForm(true);
  };

  const handleDelete = async (announcementId: number) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      const success = await deleteAnnouncement(announcementId);
      if (success) {
        console.log('Announcement deleted successfully');
      } else {
        console.error('Failed to delete announcement');
      }
    }
  };

  const handleFormClose = () => {
    setShowCreateForm(false);
    setEditingAnnouncement(null);
  };

  const handleFormSubmit = async (announcementData: AnnouncementRequestDto) => {
    if (editingAnnouncement) {
      // Update existing announcement
      const updated = await updateAnnouncement(editingAnnouncement.id, announcementData);
      if (updated) {
        console.log('Announcement updated successfully');
      } else {
        console.error('Failed to update announcement');
      }
    } else {
      // Create new announcement
      const created = await createAnnouncement(announcementData);
      if (created) {
        console.log('Announcement created successfully');
      } else {
        console.error('Failed to create announcement');
      }
    }
    handleFormClose();
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(dateString));
  };

  const getLanguageColor = (language: string) => {
    switch (language) {
      case 'ENGLISH': return 'bg-blue-100 text-blue-800';
      case 'KINYARWANDA': return 'bg-green-100 text-green-800';
      case 'FRENCH': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading announcements...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Announcements Management</h1>
          <p className="text-gray-600">
            Create, edit, and manage government announcements and public notices.
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Announcement
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-blue-200 rounded-lg shadow-lg p-4">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Megaphone className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{totalElements}</p>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-blue-200 rounded-lg shadow-lg p-4">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-gray-900">
                {announcements.filter(a => a.active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-blue-200 rounded-lg shadow-lg p-4">
          <div className="flex items-center">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Expired</p>
              <p className="text-2xl font-bold text-gray-900">
                {announcements.filter(a => !a.active).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border-2 border-blue-200 rounded-lg shadow-lg p-4">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Megaphone className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {announcements.filter(a => {
                  const createdAt = new Date(a.createdAt);
                  const now = new Date();
                  return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border-2 border-blue-200 rounded-lg shadow-lg p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Filter:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterType)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Announcements</option>
                <option value="active">Active Only</option>
                <option value="expired">Expired Only</option>
              </select>
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortType)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="popular">Most Viewed</option>
              </select>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search announcements..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredAnnouncements.length} of {totalElements} announcements
        </p>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchPreviousPage}
            disabled={!hasPrevious}
            className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={fetchNextPage}
            disabled={!hasNext}
            className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Announcements List */}
      <div className="bg-white border-2 border-blue-200 rounded-lg shadow-lg overflow-hidden">
        {filteredAnnouncements.length === 0 ? (
          <div className="text-center py-12">
            <Megaphone className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No announcements</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery ? 'No announcements match your search.' : 'Get started by creating a new announcement.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredAnnouncements.map((announcement) => (
              <div key={announcement.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{announcement.title}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getLanguageColor(announcement.language)}`}>
                        {announcement.language}
                      </span>
                      {announcement.active ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Expired
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-3 line-clamp-2">{announcement.description}</p>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Eye size={14} />
                        <span>{announcement.viewCount} views</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>Created: {formatDate(announcement.createdAt)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>Expires: {formatDate(announcement.endTime)}</span>
                      </div>
                      {announcement.attachments.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <span>📎 {announcement.attachments.length} attachment(s)</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit announcement"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete announcement"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {showCreateForm && (
        <AdminAnnouncementForm
          announcement={editingAnnouncement}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
          currentLeader={currentLeader}
        />
      )}
    </div>
  );
};

export default AdminAnnouncementsList;
