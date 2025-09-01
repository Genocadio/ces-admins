import React, { createContext, useContext, useState, useEffect } from 'react';
import { Leader, AuthResponseDto, LoginRequestDto, RegisterRequestDto, UserProfileCompletionRequestDto, UserRole } from '../types';
import { API_ENDPOINTS } from '../config/api';
import { adminAuthenticatedFetch, handleAdminApiResponse, isAdminTokenExpired } from '../utils/adminApiInterceptor';

interface AdminAuthContextType {
  currentLeader: Leader | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  forceLogout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  isProfileComplete: boolean;
  updateLeader: (leaderData: Partial<Leader>) => void;
  completeProfile: (profileData: UserProfileCompletionRequestDto) => Promise<boolean>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

interface AdminAuthProviderProps {
  children: React.ReactNode;
}

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const [currentLeader, setCurrentLeader] = useState<Leader | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to check if leader profile is complete
  const isProfileComplete = (leaderData: any): boolean => {
    // Check if level and location are set
    return !!(
      leaderData.level &&
      leaderData.location &&
      leaderData.location.district &&
      leaderData.location.district.trim() !== ''
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

  // Force logout function that clears all data and redirects to login
  const forceLogout = () => {
    console.log('Admin force logout - clearing session data');
    setCurrentLeader(null);
    localStorage.removeItem('adminCurrentLeader');
    localStorage.removeItem('adminAuthTokens');
    // The AdminApp component will automatically redirect to login
  };

  // Helper function to get stored tokens
  const getStoredTokens = () => {
    try {
      const tokens = localStorage.getItem('adminAuthTokens');
      return tokens ? JSON.parse(tokens) : null;
    } catch (error) {
      return null;
    }
  };

  // Helper function to get stored leader
  const getStoredLeader = () => {
    try {
      const leader = localStorage.getItem('adminCurrentLeader');
      return leader ? JSON.parse(leader) : null;
    } catch (error) {
      return null;
    }
  };

  // Function to validate and restore session
  const validateAndRestoreSession = async () => {
    try {
      console.log('Validating and restoring admin session...');
      const tokens = getStoredTokens();
      const leader = getStoredLeader();
      
      if (!tokens || !leader) {
        console.log('No stored admin tokens or leader found');
        setIsLoading(false);
        return;
      }

      console.log('Found stored admin tokens and leader, checking token expiration...');

      // Check if access token is expired
      if (isAdminTokenExpired()) {
        console.log('Admin access token expired, clearing invalid data');
        // Token expired, clear invalid data
        localStorage.removeItem('adminCurrentLeader');
        localStorage.removeItem('adminAuthTokens');
        setIsLoading(false);
        return;
      }

      // Session is valid, restore leader
      console.log('Restoring admin leader session:', leader.name);
      setCurrentLeader(leader);
      setIsLoading(false);
    } catch (error) {
      console.error('Admin session validation failed:', error);
      localStorage.removeItem('adminCurrentLeader');
      localStorage.removeItem('adminAuthTokens');
      setIsLoading(false);
    }
  };

  // Load and validate session on app start
  useEffect(() => {
    validateAndRestoreSession();
    
    // Add a timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      if (isLoading) {
        console.warn('Admin session validation timeout, forcing loading state to false');
        setIsLoading(false);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailOrPhone: email,
          password
        } as LoginRequestDto),
      });

      if (response.ok) {
        const authData: AuthResponseDto = await response.json();
        
        // Transform UserResponseDto to Leader interface using new role system
        const leader: Leader = {
          id: authData.user.id.toString(),
          firstName: authData.user.firstName,
          lastName: authData.user.lastName,
          name: `${authData.user.firstName} ${authData.user.lastName}`,
          email: authData.user.email,
          phoneNumber: authData.user.phoneNumber,
          avatar: authData.user.profileUrl || '',
          level: authData.user.role === 'DISTRICT_LEADER' ? 'district' : 
                 authData.user.role === 'SECTOR_LEADER' ? 'sector' : 'cell',
          location: authData.user.location ? {
            district: authData.user.location.district,
            sector: authData.user.location.sector,
            cell: authData.user.location.cell
          } : {
            district: '',
            sector: '',
            cell: ''
          },
          department: 'Administration',
          verified: true,
          joinedAt: new Date()
        };

        // Store leader and tokens
        setCurrentLeader(leader);
        localStorage.setItem('adminCurrentLeader', JSON.stringify(leader));
        localStorage.setItem('adminAuthTokens', JSON.stringify({
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken
        }));

        return true;
      } else {
        const errorData = await response.json();
        console.error('Admin login failed:', errorData);
        return false;
      }
    } catch (error) {
      console.error('Admin login error:', error);
      return false;
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      const registerData: RegisterRequestDto = {
        email: userData.email,
        password: userData.password,
        phoneNumber: userData.phoneNumber,
        firstName: userData.firstName,
        lastName: userData.lastName,
        middleName: userData.middleName || '' // Use provided middle name
      };

      const response = await fetch(API_ENDPOINTS.AUTH.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      if (response.ok) {
        const authData: AuthResponseDto = await response.json();
        
        // Transform UserResponseDto to Leader interface with default values
        const leader: Leader = {
          id: authData.user.id.toString(),
          firstName: authData.user.firstName,
          lastName: authData.user.lastName,
          name: `${authData.user.firstName} ${authData.user.lastName}`,
          email: authData.user.email,
          phoneNumber: authData.user.phoneNumber,
          avatar: authData.user.profileUrl || '',
          level: 'cell', // Default level, will be updated in profile completion
          location: {
            district: '',
            sector: '',
            cell: ''
          },
          department: 'Administration', // Default department, will be updated in profile completion
          verified: false, // New registrations need verification
          joinedAt: new Date()
        };

        // Store leader and tokens
        setCurrentLeader(leader);
        localStorage.setItem('adminCurrentLeader', JSON.stringify(leader));
        localStorage.setItem('adminAuthTokens', JSON.stringify({
          accessToken: authData.accessToken,
          refreshToken: authData.refreshToken
        }));

        return true;
      } else {
        const errorData = await response.json();
        console.error('Admin registration failed:', errorData);
        return false;
      }
    } catch (error) {
      console.error('Admin registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setCurrentLeader(null);
    localStorage.removeItem('adminCurrentLeader');
    localStorage.removeItem('adminAuthTokens');
  };

  const updateLeader = (leaderData: Partial<Leader>) => {
    if (currentLeader) {
      const updatedLeader = { ...currentLeader, ...leaderData };
      setCurrentLeader(updatedLeader);
      localStorage.setItem('adminCurrentLeader', JSON.stringify(updatedLeader));
    }
  };

  const completeProfile = async (profileData: UserProfileCompletionRequestDto): Promise<boolean> => {
    if (!currentLeader) {
      return false;
    }

    try {
      console.log('Sending profile completion data:', profileData);
      console.log('Request URL:', API_ENDPOINTS.USERS.COMPLETE_PROFILE(currentLeader.id));
      
      const requestOptions = {
        method: 'PUT',
        body: JSON.stringify(profileData)
      };
      
      console.log('Request options:', requestOptions);
      console.log('Request body as string:', JSON.stringify(profileData));
      console.log('Request body type:', typeof JSON.stringify(profileData));
      
      const response = await adminAuthenticatedFetch(
        API_ENDPOINTS.USERS.COMPLETE_PROFILE(currentLeader.id),
        requestOptions,
        forceLogout
      );

      if (!response) {
        // 401 error occurred, user will be redirected to login
        return false;
      }

      if (response.ok) {
        const updatedLeaderData = await response.json();
        
        // Update the leader's data with level and location
        const updatedLeader = {
          ...currentLeader,
          level: profileData.level.toLowerCase() as 'cell' | 'sector' | 'district',
          location: {
            district: profileData.location.district || '',
            sector: profileData.location.sector || '',
            cell: profileData.location.cell || ''
          },
          department: 'Administration' // Default department, can be updated later if needed
        };
        
        setCurrentLeader(updatedLeader);
        localStorage.setItem('adminCurrentLeader', JSON.stringify(updatedLeader));
        return true;
      } else {
        console.error('Profile completion failed with status:', response.status);
        console.error('Response headers:', Object.fromEntries(response.headers.entries()));
        
        try {
          const errorData = await response.json();
          console.error('Profile completion error data:', errorData);
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
          const errorText = await response.text();
          console.error('Raw error response:', errorText);
        }
        
        return false;
      }
    } catch (error) {
      console.error('Profile completion error:', error);
      return false;
    }
  };

  const value = {
    currentLeader,
    login,
    register,
    logout,
    forceLogout,
    isAuthenticated: !!currentLeader,
    isLoading,
    isProfileComplete: currentLeader ? isProfileComplete(currentLeader) : false,
    updateLeader,
    completeProfile
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};
