import { useState, useEffect, useCallback } from 'react';
import { LeaderDashboardData } from '../types';
import { API_ENDPOINTS } from '../config/api';

interface UseLeaderDashboardReturn {
  dashboardData: LeaderDashboardData | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useLeaderDashboard = (): UseLeaderDashboardReturn => {
  const [dashboardData, setDashboardData] = useState<LeaderDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if admin is authenticated
      const adminAuthTokens = localStorage.getItem('adminAuthTokens');
      if (!adminAuthTokens) {
        setError('Admin not authenticated. Please log in again.');
        setIsLoading(false);
        return;
      }

      // Parse auth tokens
      let accessToken: string;
      try {
        const parsedTokens = JSON.parse(adminAuthTokens);
        accessToken = parsedTokens.accessToken;
        console.log('Admin access token available:', !!accessToken);
      } catch (parseError) {
        console.error('Error parsing admin auth tokens:', parseError);
        setError('Authentication error. Please log in again.');
        setIsLoading(false);
        return;
      }

      if (!accessToken) {
        setError('No admin access token available. Please log in again.');
        setIsLoading(false);
        return;
      }

      console.log('Fetching leader dashboard from:', API_ENDPOINTS.DASHBOARD.GET_LEADER_DASHBOARD);
      
      const response = await fetch(API_ENDPOINTS.DASHBOARD.GET_LEADER_DASHBOARD, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Dashboard response received:', response);
      console.log('Dashboard response status:', response.status);

      if (response.ok) {
        const data: LeaderDashboardData = await response.json();
        console.log('Dashboard data received:', data);
        setDashboardData(data);
      } else {
        console.error('Dashboard response not ok:', response.status, response.statusText);
        
        // Try to get error details
        let errorMessage = `Failed to fetch dashboard: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.text();
          console.log('Dashboard error response body:', errorData);
          if (errorData) {
            errorMessage += ` - ${errorData}`;
          }
        } catch (e) {
          console.log('Could not read dashboard error response body');
        }
        
        if (response.status === 401) {
          setError('Authentication failed. Please log in again.');
        } else if (response.status === 403) {
          setError('Access denied. You do not have permission to view dashboard.');
        } else if (response.status === 404) {
          setError('Dashboard service not found. Please try again later.');
        } else {
          setError(errorMessage);
        }
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchDashboardData();
  }, [fetchDashboardData]);

  // Fetch dashboard data on mount
  useEffect(() => {
    console.log('useLeaderDashboard hook mounted, fetching dashboard data...');
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    dashboardData,
    isLoading,
    error,
    refetch,
  };
};
