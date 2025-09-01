import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Megaphone, Users, Menu, X, Home, Shield } from 'lucide-react';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { IssuesSection } from './components/IssuesSection';
import { TopicsSection } from './components/TopicsSection';
import { AnnouncementsSection } from './components/AnnouncementsSection';

import UserDashboard from './components/UserDashboard';
import UserProfile from './components/UserProfile';
import UserForm from './components/UserForm';
import Login from './components/Login';
import Register from './components/Register';
import UserMenu from './components/UserMenu';
import ProfileCompletionBanner from './components/ProfileCompletionBanner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginPromptProvider, useLoginPrompt } from './contexts/LoginPromptContext';
import { topics } from './data/dummyData';
import { getTranslation } from './i18n/translations';

type Section = 'issues' | 'topics' | 'announcements' | 'dashboard' | 'profile' | 'edit-profile';

function AppContent() {
  const [currentSection, setCurrentSection] = useState<Section>('issues');
  const [language, setLanguage] = useState('ENGLISH');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showProfileBanner, setShowProfileBanner] = useState(false);
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const { showLoginPrompt } = useLoginPrompt();

  // Show profile completion banner if user is authenticated but location is incomplete
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      // Check if user has set location information up to cell level
      const hasCompleteLocation = currentUser.location && 
        currentUser.location.district && 
        currentUser.location.district.trim() !== '' &&
        currentUser.location.sector && 
        currentUser.location.sector.trim() !== '' &&
        currentUser.location.cell && 
        currentUser.location.cell.trim() !== '';
      
      setShowProfileBanner(!hasCompleteLocation);
    } else {
      setShowProfileBanner(false);
    }
  }, [isAuthenticated, currentUser]);

  // Track previous authentication state to detect 401 logouts
  const prevAuthRef = useRef(isAuthenticated);
  const [hasShownExpiredPrompt, setHasShownExpiredPrompt] = useState(false);
  
  // Show login modal when user becomes unauthenticated due to 401
  useEffect(() => {
    // If user was authenticated before but is now not authenticated (due to 401)
    if (prevAuthRef.current && !isAuthenticated && !isLoading && !hasShownExpiredPrompt) {
      showLoginPrompt('Your session has expired. Please log in again to continue.');
      setHasShownExpiredPrompt(true);
    }
    
    // Update the previous auth state
    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated, isLoading, showLoginPrompt, hasShownExpiredPrompt]);
  
  // Reset expired prompt flag when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setHasShownExpiredPrompt(false);
    }
  }, [isAuthenticated]);



  // Show loading state while authentication is being validated
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login modal when requested
  if (showLogin) {
    return <Login 
      language={language}
      onSuccess={() => setShowLogin(false)} 
      onCancel={() => setShowLogin(false)}
      onShowRegister={() => {
        setShowLogin(false);
        setShowRegister(true);
      }}
    />;
  }

  // Show register modal when requested
  if (showRegister) {
    return <Register 
      language={language}
      onSuccess={() => setShowRegister(false)} 
      onCancel={() => setShowRegister(false)}
      onShowLogin={() => {
        setShowRegister(false);
        setShowLogin(true);
      }}
    />;
  }

  // Show login modal for unauthenticated users instead of main content
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50 flex-shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Logo and Title - Hidden on mobile */}
              <div className="hidden sm:flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="bg-blue-600 text-white p-2 rounded-lg">
                    <Home size={24} />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Citizen Engagement Platform</h1>
                  <p className="text-xs text-gray-600">Republic of Rwanda</p>
                </div>
              </div>

              {/* Language Switcher */}
              <div className="flex items-center space-x-4">
                <LanguageSwitcher currentLanguage={language} onLanguageChange={setLanguage} />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content - Login Required */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center">
                <Shield size={32} className="text-white" />
              </div>
              <h2 className="mt-6 text-3xl font-bold text-gray-900">
                Welcome to Citizen Engagement Platform
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                                  Please log in or register to access the citizen engagement platform
              </p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setShowLogin(true)}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => setShowRegister(true)}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
              >
                Create Account
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs text-gray-500">
                Access to community issues, topics, announcements, and surveys requires authentication
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-auto flex-shrink-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
                                <p className="text-gray-600">© 2024 Republic of Rwanda - Citizen Engagement Platform</p>
              <p className="text-sm text-gray-500">Empowering citizens through digital engagement</p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  const navigation = [
    { id: 'issues', name: getTranslation('issues', language), icon: MessageSquare },
    { id: 'topics', name: getTranslation('topics', language), icon: Users },
    { id: 'announcements', name: getTranslation('announcements', language), icon: Megaphone },
  ];

  const renderContent = () => {
    switch (currentSection) {
      case 'dashboard':
        // Dashboard only available for authenticated users
        if (!isAuthenticated || !currentUser) {
          setCurrentSection('issues');
          return null;
        }
        return <UserDashboard language={language} />;
      case 'profile':
        if (!isAuthenticated || !currentUser) {
          setCurrentSection('issues');
          return null;
        }
        return (
          <UserProfile 
            userId={currentUser.id} 
            currentUser={currentUser}
            language={language} 
          />
        );
      case 'edit-profile':
        if (!isAuthenticated || !currentUser) {
          setCurrentSection('issues');
          return null;
        }
        return (
          <UserForm 
            user={currentUser}
            isEditing={true}
            onSave={(userData) => {
              // Handle user update
              console.log('Updating user:', userData);
              // Update the user in AuthContext
              if (currentUser) {
                const updatedUser = {
                  ...currentUser,
                  ...userData,
                  profileComplete: true // Mark profile as complete when location is added
                };
                // Don't redirect - let the UserForm handle the success state
                // The form will show success message and allow continued editing
              }
            }}
            onCancel={() => setCurrentSection('profile')}
          />
        );
      case 'issues':
        return (
          <IssuesSection 
            language={language} 
            currentUser={currentUser}
          />
        );
      case 'topics':
        return (
          <TopicsSection 
            topics={topics} 
            language={language} 
            currentUser={currentUser}
          />
        );
      case 'announcements':
        return (
          <AnnouncementsSection 
            language={language}
            currentUser={currentUser}
          />
        );

      default:
        return <UserDashboard language={language} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 flex-shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left Side - Mobile Menu Button (mobile) + Logo & Title (desktop) */}
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button - Left side on mobile */}
              {isAuthenticated && (
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="sm:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors relative"
                  aria-label="Toggle mobile menu"
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                  {/* Active section indicator */}
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full opacity-75" />
                </button>
              )}
              
              {/* Logo and Title - Hidden on mobile, visible on desktop */}
              <div className="hidden sm:flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="bg-blue-600 text-white p-2 rounded-lg">
                    <Home size={24} />
                  </div>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Citizen Engagement Platform</h1>
                  <p className="text-xs text-gray-600">Republic of Rwanda</p>
                </div>
              </div>
            </div>

            {/* Center - Desktop Navigation (hidden on mobile) */}
            {isAuthenticated && (
              <>
                {/* Medium screens: Icons only */}
                <nav className="hidden md:flex lg:hidden space-x-4">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setCurrentSection(item.id as Section)}
                        className={`p-2 rounded-md text-sm font-medium transition-colors ${
                          currentSection === item.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                        }`}
                        title={item.name}
                      >
                        <Icon size={20} />
                      </button>
                    );
                  })}
                </nav>
                
                {/* Large screens: Icons with text */}
                <nav className="hidden lg:flex space-x-6 xl:space-x-8">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setCurrentSection(item.id as Section)}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          currentSection === item.id
                            ? 'bg-blue-100 text-blue-700'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon size={18} />
                        <span>{item.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </>
            )}

            {/* Right Side - Language Switcher & User Menu */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              <LanguageSwitcher currentLanguage={language} onLanguageChange={setLanguage} />
              
              {/* User Menu - Only show when authenticated */}
              {isAuthenticated && (
                <UserMenu 
                  onEditProfileClick={() => setCurrentSection('edit-profile')}
                />
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Side Panel - Only show when authenticated */}
        {isAuthenticated && isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Side Panel */}
            <div className={`md:hidden fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
              isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}>
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-600 text-white p-2 rounded-lg">
                    <Home size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
                    <p className="text-xs text-gray-600">Citizen Engagement Platform</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Navigation Items */}
              <div className="p-4 space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentSection(item.id as Section);
                      setIsMobileMenuOpen(false);
                    }}
                      className={`w-full flex items-center space-x-3 py-3 px-4 rounded-lg text-base font-medium transition-all duration-200 ${
                      currentSection === item.id
                          ? 'bg-blue-100 text-blue-700 shadow-sm'
                          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                    }`}
                  >
                      <Icon size={20} />
                    <span>{item.name}</span>
                      {currentSection === item.id && (
                        <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full" />
                      )}
                  </button>
                );
              })}
            </div>
              

          </div>
          </>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-6 sm:py-8 w-full">
        {/* Profile Completion Banner - Only show when authenticated */}
        {isAuthenticated && (
        <ProfileCompletionBanner
          language={language}
          isVisible={showProfileBanner}
          onDismiss={() => setShowProfileBanner(false)}
          onCompleteProfile={() => setCurrentSection('edit-profile')}
        />
        )}
        {renderContent()}
      </main>


    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <LoginPromptProvider>
        <AppContent />
      </LoginPromptProvider>
    </AuthProvider>
  );
}

export default App;