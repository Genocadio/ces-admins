

// Global API interceptor to handle authentication errors and token refresh
export const createAuthenticatedFetch = (forceLogout: (reason?: string) => void, refreshSession?: () => Promise<boolean>) => {
  return async (url: string, options: RequestInit = {}) => {
    try {
      // Add auth headers if available
      const authTokens = localStorage.getItem('authTokens');
      if (authTokens) {
        try {
          const { accessToken } = JSON.parse(authTokens);
          if (accessToken) {
            options.headers = {
              ...options.headers,
              'Authorization': `Bearer ${accessToken}`,
            };
          }
        } catch (error) {
          console.error('Error parsing auth tokens:', error);
        }
      }

      // Ensure Content-Type is set for requests with body
      if (options.body && (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH')) {
        options.headers = {
          ...options.headers,
          'Content-Type': 'application/json',
        };
      }

      let response = await fetch(url, options);
      
      // Handle 401 Unauthorized globally
      if (response.status === 401) {
        // Try to refresh the token if we have a refresh function
        if (refreshSession) {
          const refreshSuccess = await refreshSession();
          if (refreshSuccess) {
            // Retry the original request with new token
            const newAuthTokens = localStorage.getItem('authTokens');
            if (newAuthTokens) {
              try {
                const { accessToken } = JSON.parse(newAuthTokens);
                if (accessToken) {
                  options.headers = {
                    ...options.headers,
                    'Authorization': `Bearer ${accessToken}`,
                  };
                  
                  // Ensure Content-Type is set for retry requests with body
                  if (options.body && (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH')) {
                    options.headers = {
                      ...options.headers,
                      'Content-Type': 'application/json',
                    };
                  }
                  
                  response = await fetch(url, options);
                  
                  // If still 401 after refresh, logout
                  if (response.status === 401) {
                    forceLogout('Your session has expired. Please log in again.');
                    return null;
                  }
                }
              } catch (error) {
                console.error('Error parsing new auth tokens:', error);
                forceLogout('Authentication error. Please log in again.');
                return null;
              }
            }
          } else {
            // Refresh failed, logout
            forceLogout('Your session has expired. Please log in again.');
            return null;
          }
        } else {
          // No refresh function available, logout immediately
          forceLogout('Your session has expired. Please log in again.');
          return null;
        }
      }
      
      return response;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  };
};

// Helper function to handle API responses with authentication
export const handleApiResponse = async (
  response: Response, 
  errorMessage: string,
  forceLogout: (reason?: string) => void
) => {
  if (!response.ok) {
    // Handle 401 Unauthorized (token expired)
    if (response.status === 401) {
      forceLogout('JWT token has expired. Please log in again.');
      return null;
    }
    
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || errorMessage);
    } catch (parseError) {
      throw new Error(errorMessage);
    }
  }
  
  return await response.json();
};

// Utility to get auth headers with automatic token refresh
export const getAuthHeaders = async (refreshSession?: () => Promise<boolean>) => {
  const authTokens = localStorage.getItem('authTokens');
  if (!authTokens) {
    throw new Error('No authentication tokens found');
  }
  
  let { accessToken } = JSON.parse(authTokens);
  if (!accessToken) {
    throw new Error('Invalid authentication token');
  }

  // Check if token is expired and try to refresh
  try {
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    if (payload.exp < currentTime && refreshSession) {
      // Token expired, try to refresh
      const refreshSuccess = await refreshSession();
      if (refreshSuccess) {
        // Get new token
        const newAuthTokens = localStorage.getItem('authTokens');
        if (newAuthTokens) {
          const { accessToken: newToken } = JSON.parse(newAuthTokens);
          if (newToken) {
            accessToken = newToken;
          }
        }
      } else {
        // Refresh failed, clear tokens and throw error
        localStorage.removeItem('authTokens');
        localStorage.removeItem('currentUser');
        throw new Error('Failed to refresh authentication token');
      }
    }
  } catch (error) {
    console.error('Error checking token expiration:', error);
    // Clear invalid tokens
    localStorage.removeItem('authTokens');
    localStorage.removeItem('currentUser');
    throw new Error('Invalid authentication token');
  }
  
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  };
};

// Enhanced fetch wrapper that handles authentication automatically
export const authenticatedFetch = async (
  url: string, 
  options: RequestInit = {}, 
  refreshSession?: () => Promise<boolean>
) => {
  const fetchWithAuth = createAuthenticatedFetch(
    (reason) => {
      console.error('Authentication error:', reason);
      // You might want to redirect to login or show a modal
    },
    refreshSession
  );
  
  return fetchWithAuth(url, options);
};
