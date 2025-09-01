// Admin API interceptor to handle authentication errors and token refresh
export const createAdminAuthenticatedFetch = (forceLogout: () => void) => {
  return async (url: string, options: RequestInit = {}) => {
    try {
      console.log('Admin API call to:', url);
      
      // Add admin auth headers if available
      const adminTokens = localStorage.getItem('adminAuthTokens');
      console.log('Admin tokens found:', !!adminTokens);
      
      if (adminTokens) {
        try {
          const { accessToken } = JSON.parse(adminTokens);
          console.log('Access token found:', !!accessToken);
          
          if (accessToken) {
            // Ensure we don't overwrite existing headers
            const existingHeaders = options.headers || {};
            
            // Convert Headers object to plain object if needed
            let headersObj: Record<string, string> = {};
            if (existingHeaders instanceof Headers) {
              existingHeaders.forEach((value, key) => {
                headersObj[key] = value;
              });
            } else if (typeof existingHeaders === 'object') {
              headersObj = existingHeaders as Record<string, string>;
            }
            
            options.headers = {
              ...headersObj,
              'Authorization': `Bearer ${accessToken}`,
            };
            console.log('Authorization header added');
          }
        } catch (error) {
          console.error('Error parsing admin auth tokens:', error);
        }
      }

      console.log('Making request with options:', {
        method: options.method || 'GET',
        headers: options.headers,
        body: options.body ? 'Body present' : 'No body',
        bodyType: options.body ? typeof options.body : 'No body'
      });
      
      // Ensure Content-Type is set for requests with body
      if (options.body && (options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH')) {
        options.headers = {
          ...options.headers,
          'Content-Type': 'application/json',
        };
        console.log('Content-Type header added for request with body');
      }
      
      let response = await fetch(url, options);
      
      console.log('Response status:', response.status);
      
      // Handle 401 Unauthorized globally for admin
      if (response.status === 401) {
        console.log('Admin API returned 401, redirecting to login');
        forceLogout(); // This will clear tokens and redirect to login
        return null;
      }
      
      return response;
    } catch (error) {
      console.error('Admin API request failed:', error);
      throw error;
    }
  };
};

// Helper function to handle admin API responses with authentication
export const handleAdminApiResponse = async (
  response: Response, 
  errorMessage: string,
  forceLogout: () => void
) => {
  if (!response.ok) {
    // Handle 401 Unauthorized (token expired) - redirect to login
    if (response.status === 401) {
      console.log('Admin API 401 error, redirecting to login');
      forceLogout();
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

// Utility to get admin auth headers
export const getAdminAuthHeaders = () => {
  const adminTokens = localStorage.getItem('adminAuthTokens');
  if (!adminTokens) {
    throw new Error('No admin authentication tokens found');
  }
  
  let { accessToken } = JSON.parse(adminTokens);
  if (!accessToken) {
    throw new Error('Invalid admin authentication token');
  }

  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
  };
};

// Enhanced fetch wrapper for admin API calls
export const adminAuthenticatedFetch = async (
  url: string, 
  options: RequestInit = {}, 
  forceLogout: () => void
) => {
  const fetchWithAuth = createAdminAuthenticatedFetch(forceLogout);
  return fetchWithAuth(url, options);
};

// Check if admin token is expired
export const isAdminTokenExpired = (): boolean => {
  try {
    const adminTokens = localStorage.getItem('adminAuthTokens');
    if (!adminTokens) return true;
    
    const { accessToken } = JSON.parse(adminTokens);
    if (!accessToken) return true;
    
    const payload = JSON.parse(atob(accessToken.split('.')[1]));
    const currentTime = Date.now() / 1000;
    
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error checking admin token expiration:', error);
    return true;
  }
};
