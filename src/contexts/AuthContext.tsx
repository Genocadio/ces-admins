import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { User, AuthResponseDto, LoginRequestDto, RegisterRequestDto, UserProfileCompletionRequestDto, UserResponseDto, TokenRefreshRequestDto, TokenRefreshResponseDto, UserRole } from '../types';
import { API_ENDPOINTS } from '../config/api';

interface AuthContextType {
  currentUser: User | null;
  login: (emailOrPhone: string, password: string) => Promise<boolean>;
  register: (userData: RegisterRequestDto) => Promise<boolean>;
  logout: () => void;
  forceLogout: (reason?: string) => void;
  updateUser: (userData: Partial<User>) => void;
  completeProfile: (profileData: UserProfileCompletionRequestDto) => Promise<boolean>;
  isAuthenticated: boolean;
  isLoading: boolean;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Automatic token refresh
  const refreshIntervalRef = useRef<number | null>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const REFRESH_INTERVAL = 10 * 60 * 1000; // 10 minutes in milliseconds

  // Helper function to check if user profile is complete
  const isProfileComplete = (userData: any): boolean => {
    return !!(
      userData.location &&
      userData.location.district &&
      userData.location.sector &&
      userData.location.cell &&
      userData.location.village
    );
  };

  // Helper function to validate token expiration
  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  };

  // Helper function to get stored tokens
  const getStoredTokens = () => {
    try {
      const tokens = localStorage.getItem('authTokens');
      return tokens ? JSON.parse(tokens) : null;
    } catch (error) {
      return null;
    }
  };

  // Helper function to get stored user
  const getStoredUser = () => {
    try {
      const user = localStorage.getItem('currentUser');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      return null;
    }
  };

  // Function to refresh the session using refresh token
  const refreshSession = async (): Promise<boolean> => {
    try {
      const tokens = getStoredTokens();
      if (!tokens?.refreshToken) {
        return false;
      }

      const refreshRequest: TokenRefreshRequestDto = {
        refreshToken: tokens.refreshToken
      };

      const response = await fetch(API_ENDPOINTS.AUTH.REFRESH, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(refreshRequest),
      });

      if (response.ok) {
        const refreshData: TokenRefreshResponseDto = await response.json();
        
        // Update stored tokens
        const newTokens = {
          accessToken: refreshData.accessToken,
          refreshToken: refreshData.refreshToken
        };
        
        localStorage.setItem('authTokens', JSON.stringify(newTokens));
        
        // Update last activity time
        lastActivityRef.current = Date.now();
        
        console.log('Token refreshed successfully');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Session refresh failed:', error);
      // Clear invalid tokens when refresh fails
      localStorage.removeItem('authTokens');
      localStorage.removeItem('currentUser');
      setCurrentUser(null);
      return false;
    }
  };

  // Start automatic token refresh
  const startAutoRefresh = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
    }
    
    refreshIntervalRef.current = window.setInterval(async () => {
      if (currentUser) {
        console.log('Auto-refreshing token...');
        const success = await refreshSession();
        if (!success) {
          console.log('Auto-refresh failed, logging out user');
          forceLogout('Session expired. Please log in again.');
        }
      }
    }, REFRESH_INTERVAL);
  };

  // Stop automatic token refresh
  const stopAutoRefresh = () => {
    if (refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  };

  // Track user activity
  const updateUserActivity = () => {
    lastActivityRef.current = Date.now();
  };

  // Function to validate and restore session
  const validateAndRestoreSession = async () => {
    try {
      console.log('Validating and restoring session...');
      const tokens = getStoredTokens();
      const user = getStoredUser();
      
      if (!tokens || !user) {
        console.log('No stored tokens or user found');
        setIsLoading(false);
        return;
      }

      console.log('Found stored tokens and user, checking token expiration...');

      // Check if access token is expired
      if (isTokenExpired(tokens.accessToken)) {
        console.log('Access token expired, attempting refresh...');
        // Try to refresh the session
        const refreshSuccess = await refreshSession();
        
        if (!refreshSuccess) {
          console.log('Session refresh failed, clearing invalid data');
          // Refresh failed, clear invalid data
          localStorage.removeItem('currentUser');
          localStorage.removeItem('authTokens');
          setIsLoading(false);
          return;
        }
        console.log('Session refresh successful');
      } else {
        console.log('Access token is still valid');
      }

      // Session is valid, restore user
      console.log('Restoring user session:', user.name);
      setCurrentUser(user);
      setIsLoading(false);
    } catch (error) {
      console.error('Session validation failed:', error);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authTokens');
      setIsLoading(false);
    }
  };

  // Load and validate session on app start
  useEffect(() => {
    validateAndRestoreSession();
    
    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn('Session validation timeout, forcing loading state to false');
        setIsLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, []);

  // Set up automatic token refresh and activity tracking
  useEffect(() => {
    if (currentUser) {
      // Start automatic token refresh
      startAutoRefresh();
      
      // Set up activity tracking
      const handleActivity = () => updateUserActivity();
      
      // Track various user activities
      window.addEventListener('mousemove', handleActivity);
      window.addEventListener('mousedown', handleActivity);
      window.addEventListener('keypress', handleActivity);
      window.addEventListener('scroll', handleActivity);
      window.addEventListener('touchstart', handleActivity);
      
      return () => {
        stopAutoRefresh();
        window.removeEventListener('mousemove', handleActivity);
        window.removeEventListener('mousedown', handleActivity);
        window.removeEventListener('keypress', handleActivity);
        window.removeEventListener('scroll', handleActivity);
        window.removeEventListener('touchstart', handleActivity);
      };
    } else {
      stopAutoRefresh();
    }
  }, [currentUser]);

  const login = async (emailOrPhone: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailOrPhone,
          password
        } as LoginRequestDto),
      });

      if (response.ok) {
        const authData: AuthResponseDto = await response.json();
        
        // Transform UserResponseDto to User interface
        const user: User = {
          id: authData.user.id.toString(),
          firstName: authData.user.firstName,
          lastName: authData.user.lastName,
          name: `${authData.user.firstName} ${authData.user.lastName}`,
          phoneNumber: authData.user.phoneNumber,
          email: authData.user.email,
          profileUrl: authData.user.profileUrl,
          role: authData.user.role,
          location: authData.user.location ? {
            district: authData.user.location.district,
            sector: authData.user.location.sector || '',
            cell: authData.user.location.cell || '',
            village: authData.user.location.village || '',
            latitude: authData.user.location.latitude,
            longitude: authData.user.location.longitude
          } : undefined
        };

        // Store user and tokens
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('authTokens', JSON.stringify({
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken
        }));

        return true;
      } else {
        const errorData = await response.json();
        console.error('Login failed:', errorData);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: RegisterRequestDto): Promise<boolean> => {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const authData: AuthResponseDto = await response.json();
        
        // Transform UserResponseDto to User interface
        const user: User = {
          id: authData.user.id.toString(),
          firstName: authData.user.firstName,
          lastName: authData.user.lastName,
          name: `${authData.user.firstName} ${authData.user.lastName}`,
          phoneNumber: authData.user.phoneNumber,
          email: authData.user.email,
          profileUrl: authData.user.profileUrl,
          role: authData.user.role,
          location: authData.user.location ? {
            district: authData.user.location.district,
            sector: authData.user.location.sector || '',
            cell: authData.user.location.cell || '',
            village: authData.user.location.village || '',
            latitude: authData.user.location.latitude,
            longitude: authData.user.location.longitude
          } : undefined
        };

        // Store user and tokens
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        localStorage.setItem('authTokens', JSON.stringify({
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken
        }));

        return true;
      } else {
        const errorData = await response.json();
        console.error('Registration failed:', errorData);
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    console.log('Logging out user');
    stopAutoRefresh();
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authTokens');
  };

  const forceLogout = (reason?: string) => {
    console.warn('Force logout:', reason || 'Token expired or invalid');
    
    // Stop auto-refresh
    stopAutoRefresh();
    
    // Clear all auth data
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authTokens');
    
    // Redirect to login page
    window.location.href = '/';
  };

  const updateUser = (userData: Partial<User>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      setCurrentUser(updatedUser);
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    }
  };

  const completeProfile = async (profileData: UserProfileCompletionRequestDto): Promise<boolean> => {
    if (!currentUser) {
      return false;
    }

    try {
      const tokens = getStoredTokens();
      if (!tokens?.accessToken) {
        return false;
      }

      const response = await fetch(API_ENDPOINTS.USERS.COMPLETE_PROFILE(currentUser.id.toString()), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokens.accessToken}`
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        const updatedUserData: UserResponseDto = await response.json();
        
        // Transform UserResponseDto to User interface
        const updatedUser: User = {
          id: updatedUserData.id.toString(),
          firstName: updatedUserData.firstName,
          lastName: updatedUserData.lastName,
          name: `${updatedUserData.firstName} ${updatedUserData.lastName}`,
          email: updatedUserData.email,
          phoneNumber: updatedUserData.phoneNumber,
          profileUrl: updatedUserData.profileUrl,
          role: updatedUserData.role as UserRole, // Keep as string (UserRole)
          location: updatedUserData.location ? {
            district: updatedUserData.location.district,
            sector: updatedUserData.location.sector || '',
            cell: updatedUserData.location.cell || '',
            village: updatedUserData.location.village || '',
            latitude: updatedUserData.location.latitude,
            longitude: updatedUserData.location.longitude
          } : undefined
        };

        // Update current user and localStorage
        setCurrentUser(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        return true;
      } else {
        const errorData = await response.json();
        console.error('Profile completion failed:', errorData);
        return false;
      }
    } catch (error) {
      console.error('Profile completion error:', error);
      return false;
    }
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    forceLogout,
    updateUser,
    completeProfile,
    isAuthenticated: !!currentUser,
    isLoading,
    refreshSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
