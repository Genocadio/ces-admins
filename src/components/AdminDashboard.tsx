import { useState, useEffect } from 'react';
import { 
  FileText, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  MessageSquare,
  Megaphone,
  User,
  LogOut,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Users,
  Building
} from 'lucide-react';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { useLeaderDashboard } from '../hooks/useLeaderDashboard';
import AdminIssuesList from './AdminIssuesList';
import AdminAnnouncementsList from './AdminAnnouncementsList';
import AdminTopicsList from './AdminTopicsList';
import AdminLeadersManagement from './AdminLeadersManagement';
import AdminDepartmentsManagement from './AdminDepartmentsManagement';

type AdminSection = 'dashboard' | 'issues' | 'announcements' | 'topics' | 'profile' | 'leaders' | 'departments';

const AdminDashboard = () => {
  const [currentSection, setCurrentSection] = useState<AdminSection>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { currentLeader, logout } = useAdminAuth();
  const { dashboardData, isLoading, error, refetch } = useLeaderDashboard();

  // Keyboard shortcut for toggling sidebar (Ctrl/Cmd + B)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        setSidebarCollapsed(!sidebarCollapsed);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebarCollapsed]);

  if (!currentLeader) {
    return null;
  }

  // Use real dashboard data instead of dummy data
  const stats = [
    {
      title: 'Assigned Issues',
      value: dashboardData?.issueMetrics.totalAssigned || 0,
      icon: FileText,
      color: 'blue',
      change: `${dashboardData?.issueMetrics.resolutionRate || 0}% resolution rate`
    },
    {
      title: 'Pending Action',
      value: dashboardData?.issueMetrics.pending || 0,
      icon: Clock,
      color: 'yellow',
      change: `${dashboardData?.issueMetrics.inProgress || 0} in progress`
    },
    {
      title: 'Community Topics',
      value: dashboardData?.topicMetrics.created || 0,
      icon: MessageCircle,
      color: 'green',
      change: `${dashboardData?.topicMetrics.participating || 0} participating`
    },
    {
      title: 'Announcements',
      value: dashboardData?.announcementMetrics.created || 0,
      icon: Megaphone,
      color: 'red',
      change: `${dashboardData?.announcementMetrics.averageViews || 0} avg views`
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-500 text-blue-600 bg-blue-50',
      yellow: 'bg-yellow-500 text-yellow-600 bg-yellow-50',
      orange: 'bg-orange-500 text-orange-600 bg-orange-50',
      green: 'bg-green-500 text-green-600 bg-green-50'
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  const renderContent = () => {
    switch (currentSection) {
      case 'issues':
        return <AdminIssuesList />;
      case 'announcements':
        return <AdminAnnouncementsList currentLeader={currentLeader} />;
      case 'topics':
        return <AdminTopicsList currentLeader={currentLeader} />;
      case 'leaders':
        return <AdminLeadersManagement />;
      case 'departments':
        return <AdminDepartmentsManagement />;
      case 'profile':
        return (
          <div className="space-y-6">
            {/* Profile Header */}
          <div className="bg-white border-2 border-blue-200 rounded-lg shadow-lg p-6">
              <div className="flex items-center space-x-6">
                {currentLeader.avatar ? (
                  <img
                    src={currentLeader.avatar}
                    alt={currentLeader.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">
                    {currentLeader.firstName.charAt(0).toUpperCase()}{currentLeader.lastName.charAt(0).toUpperCase()}
                  </div>
                )}
              <div>
                  <h2 className="text-3xl font-bold text-gray-900">{currentLeader.name}</h2>
                  <p className="text-lg text-gray-600">
                    {currentLeader.leadershipLevelName || `${currentLeader.level?.charAt(0).toUpperCase() + currentLeader.level?.slice(1)} Leader`}
                  </p>
                  <p className="text-gray-500">
                    {currentLeader.department?.nameEn || currentLeader.departmentName || 'Government Department'}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="bg-white border-2 border-blue-200 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <p className="mt-1 text-sm text-gray-900">{currentLeader.firstName}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <p className="mt-1 text-sm text-gray-900">{currentLeader.lastName}</p>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <p className="mt-1 text-sm text-gray-900">{currentLeader.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <p className="mt-1 text-sm text-gray-900">{currentLeader.phoneNumber}</p>
                </div>
              </div>
            </div>

            {/* Administrative Information */}
            <div className="bg-white border-2 border-blue-200 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Administrative Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Leadership Level</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {currentLeader.leadershipLevelName || `${currentLeader.level?.charAt(0).toUpperCase() + currentLeader.level?.slice(1)} Leader`}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Department</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {currentLeader.department?.nameEn || currentLeader.departmentName || 'Government Department'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {currentLeader.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Leader'}
                  </p>
                </div>

              <div>
                  <label className="block text-sm font-medium text-gray-700">Member Since</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(currentLeader.joinedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Location Information */}
            <div className="bg-white border-2 border-blue-200 rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Location & Jurisdiction</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">District</label>
                  <p className="mt-1 text-sm text-gray-900">{currentLeader.location.district}</p>
                </div>
                {currentLeader.location.sector && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sector</label>
                    <p className="mt-1 text-sm text-gray-900">{currentLeader.location.sector}</p>
                  </div>
                )}
                {currentLeader.location.cell && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cell</label>
                    <p className="mt-1 text-sm text-gray-900">{currentLeader.location.cell}</p>
                  </div>
                )}
              <div>
                  <label className="block text-sm font-medium text-gray-700">Full Jurisdiction</label>
                <p className="mt-1 text-sm text-gray-900">
                  {currentLeader.location.district}
                  {currentLeader.location.sector && ` - ${currentLeader.location.sector}`}
                  {currentLeader.location.cell && ` - ${currentLeader.location.cell}`}
                </p>
              </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-white border-2 border-blue-200 rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back, {currentLeader.firstName}
                  </h1>
                  <p className="text-gray-600">
                    {currentLeader.leadershipLevelName || `${currentLeader.level?.charAt(0).toUpperCase() + currentLeader.level?.slice(1)} Leader`} - {currentLeader.location.district}
                    {currentLeader.location.sector && ` - ${currentLeader.location.sector}`}
                    {currentLeader.location.cell && ` - ${currentLeader.location.cell}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Today</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {new Date().toLocaleDateString()}
                  </p>
                  <a
                    href="https://cep-dashboard-3.onrender.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center mt-3 px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Plotly Dashboard
                  </a>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading dashboard data...</p>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="text-center py-12">
                <div className="text-red-600 mb-4">
                  <AlertCircle size={48} className="mx-auto" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={refetch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Stats Cards */}
            {!isLoading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => {
                const Icon = stat.icon;
                const colorClasses = getColorClasses(stat.color).split(' ');
                const iconBg = colorClasses[0];
                
                return (
                  <div key={stat.title} className="bg-white border-2 border-blue-200 rounded-lg shadow-lg p-6">
                    <div className="flex items-center">
                      <div className={`${iconBg} p-3 rounded-lg`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                        <div className="flex items-baseline">
                          <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            )}

            {/* Performance Overview */}
            {dashboardData && (
              <div className="bg-white border-2 border-blue-200 rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {dashboardData.issueMetrics.resolutionRate}%
                          </div>
                    <div className="text-sm text-gray-600">Issue Resolution Rate</div>
                        </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {dashboardData.responseMetrics.averageResponseTimeHours}h
                    </div>
                    <div className="text-sm text-gray-600">Avg Response Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {dashboardData.topicMetrics.totalUpvotesReceived}
                    </div>
                    <div className="text-sm text-gray-600">Total Upvotes Received</div>
                  </div>
                </div>
              </div>
            )}




          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-100 flex">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white border-r border-gray-300 shadow-lg transition-all duration-300 ease-in-out fixed h-full z-10`}>
        <div className={`${sidebarCollapsed ? 'p-3' : 'p-6'} relative border-b border-gray-200`}>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="bg-blue-600 text-white p-2 rounded-lg flex-shrink-0 hover:bg-blue-700 transition-colors cursor-pointer border border-blue-700"
              title={sidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
            <div className={`${sidebarCollapsed ? 'w-0 overflow-hidden' : 'w-auto'} transition-all duration-300 ease-in-out`}>
              <h1 className="text-lg font-bold text-gray-900 whitespace-nowrap">Admin Portal</h1>
              <p className="text-xs text-gray-600 whitespace-nowrap">Leader Dashboard</p>
            </div>
          </div>
        </div>

        <nav className={`mt-6 ${sidebarCollapsed ? 'px-2' : 'px-3'} border-b border-gray-200 pb-4`}>
          <div className="space-y-1">
            <button
              onClick={() => setCurrentSection('dashboard')}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'px-3 py-2'} text-sm font-medium rounded-md ${
                currentSection === 'dashboard'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title={sidebarCollapsed ? 'Dashboard' : ''}
            >
              <TrendingUp className={`${sidebarCollapsed ? 'h-5 w-5' : 'mr-3 h-4 w-4'}`} />
              {!sidebarCollapsed && 'Dashboard'}
            </button>
            <button
              onClick={() => setCurrentSection('issues')}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'px-3 py-2'} text-sm font-medium rounded-md ${
                currentSection === 'issues'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title={sidebarCollapsed ? 'Issues' : ''}
            >
              <MessageSquare className={`${sidebarCollapsed ? 'h-5 w-5' : 'mr-3 h-4 w-4'}`} />
              {!sidebarCollapsed && 'Issues'}
              {!sidebarCollapsed && dashboardData && dashboardData.issueMetrics.totalAssigned > 0 && (
                <span className="ml-auto bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full">
                  {dashboardData.issueMetrics.totalAssigned}
                </span>
              )}
            </button>
            <button
              onClick={() => setCurrentSection('announcements')}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'px-3 py-2'} text-sm font-medium rounded-md ${
                currentSection === 'announcements'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title={sidebarCollapsed ? 'Announcements' : ''}
            >
              <Megaphone className={`${sidebarCollapsed ? 'h-5 w-5' : 'mr-3 h-4 w-4'}`} />
              {!sidebarCollapsed && 'Announcements'}
            </button>

            <button
              onClick={() => setCurrentSection('topics')}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'px-3 py-2'} text-sm font-medium rounded-md ${
                currentSection === 'topics'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title={sidebarCollapsed ? 'Topics' : ''}
            >
              <MessageCircle className={`${sidebarCollapsed ? 'h-5 w-5' : 'mr-3 h-4 w-4'}`} />
              {!sidebarCollapsed && 'Topics'}
            </button>

            <button
              onClick={() => setCurrentSection('leaders')}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'px-3 py-2'} text-sm font-medium rounded-md ${
                currentSection === 'leaders'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title={sidebarCollapsed ? 'Leaders' : ''}
            >
              <Users className={`${sidebarCollapsed ? 'h-5 w-5' : 'mr-3 h-4 w-4'}`} />
              {!sidebarCollapsed && 'Leaders'}
            </button>

            <button
              onClick={() => setCurrentSection('departments')}
              className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2 py-3' : 'px-3 py-2'} text-sm font-medium rounded-md ${
                currentSection === 'departments'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              title={sidebarCollapsed ? 'Departments' : ''}
            >
              <Building className={`${sidebarCollapsed ? 'h-5 w-5' : 'mr-3 h-4 w-4'}`} />
              {!sidebarCollapsed && 'Departments'}
            </button>
          </div>
        </nav>

        {/* User Info */}
        <div className={`absolute bottom-0 ${sidebarCollapsed ? 'w-16' : 'w-64'} ${sidebarCollapsed ? 'p-2' : 'p-4'} border-t-2 border-gray-300 bg-gray-50 transition-all duration-300 ease-in-out`}>
          {/* Profile Button */}
          <button
            onClick={() => setCurrentSection('profile')}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} mb-2 hover:bg-white rounded-lg transition-colors ${sidebarCollapsed ? 'p-1' : 'p-2'} h-auto border border-gray-200`}
          >
            {currentLeader.avatar ? (
            <img
              src={currentLeader.avatar}
              alt={currentLeader.name}
                className="w-8 h-8 rounded-full flex-shrink-0 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                {currentLeader.firstName.charAt(0).toUpperCase()}{currentLeader.lastName.charAt(0).toUpperCase()}
              </div>
            )}
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-gray-900 truncate">
                {currentLeader.firstName}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {currentLeader.leadershipLevelName || `${currentLeader.level} Leader`}
              </p>
            </div>
            )}
          </button>
          
          {/* Sign Out Button */}
          <button
            onClick={() => logout()}
            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'px-3 py-2'} text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors ${sidebarCollapsed ? 'p-1' : 'p-2'} h-auto border border-red-200`}
          >
            <LogOut className={`${sidebarCollapsed ? 'h-5 w-5' : 'mr-3 h-4 w-4'}`} />
            {!sidebarCollapsed && 'Sign Out'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <div className="p-8">
        {renderContent()}
        </div>
      </div>



    </div>
  );
};

export default AdminDashboard;
