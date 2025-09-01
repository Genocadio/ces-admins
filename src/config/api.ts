// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: `${API_BASE_URL}/api/auth/register`,
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REFRESH: `${API_BASE_URL}/api/auth/refresh`,
  },
  USERS: {
    COMPLETE_PROFILE: (id: string) => `${API_BASE_URL}/api/users/${id}/complete-profile`,
    SEARCH_LEADERS: (page: number = 0, size: number = 20, name?: string) => {
      const params = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
      });
      if (name) params.append('name', name);
      return `${API_BASE_URL}/api/users/leaders?${params.toString()}`;
    },
  },
  ISSUES: {
    CREATE: `${API_BASE_URL}/api/issues`,
    GET_ALL: `${API_BASE_URL}/api/issues`,
    GET_BY_ID: (id: string) => `${API_BASE_URL}/api/issues/${id}`,
    UPDATE: (id: string) => `${API_BASE_URL}/api/issues/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/api/issues/${id}`,
    LIKE: (id: string) => `${API_BASE_URL}/api/issues/${id}/like`,
    FOLLOW: (id: string) => `${API_BASE_URL}/api/issues/${id}/follow`,
    UPDATE_STATUS: (id: string) => `${API_BASE_URL}/api/issues/${id}/status`,
    UPDATE_URGENCY: (id: string) => `${API_BASE_URL}/api/issues/${id}/urgency`,
    ESCALATE: (id: string) => `${API_BASE_URL}/api/issues/${id}/escalate`,
    SEARCH: (query: string, page: number = 0, size: number = 20, sortBy: string = 'id', sortDir: string = 'desc') => {
      const params = new URLSearchParams({
        query,
        page: page.toString(),
        size: size.toString(),
        sortBy,
        sortDir,
      });
      return `${API_BASE_URL}/api/issues/search?${params.toString()}`;
    },
  },
  COMMENTS: {
    GET: (page: number = 0, size: number = 20, sortBy: string = 'createdAt', sortDir: string = 'desc') => 
      `${API_BASE_URL}/api/comments?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`,
    GET_BY_POST: (postId: number, postType: string, page: number = 0, size: number = 20, sortBy: string = 'createdAt', sortDir: string = 'desc') => 
      `${API_BASE_URL}/api/comments?postId=${postId}&postType=${postType}&page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`,
    CREATE: `${API_BASE_URL}/api/comments`,
    UPVOTE: (id: string) => `${API_BASE_URL}/api/comments/${id}/upvote`,
    DOWNVOTE: (id: string) => `${API_BASE_URL}/api/comments/${id}/downvote`,
  },
  RESPONSES: {
    CREATE: `${API_BASE_URL}/api/responses`,
    GET_BY_ID: (id: string) => `${API_BASE_URL}/api/responses/${id}`,
    UPDATE: (id: string) => `${API_BASE_URL}/api/responses/${id}`,
    DELETE: (id: string) => `${API_BASE_URL}/api/responses/${id}`,
    RATE: `${API_BASE_URL}/api/responses`,
  },
          TOPICS: {
          CREATE: `${API_BASE_URL}/api/topics`,
          GET_ALL: (page: number = 0, size: number = 20, sortBy: string = 'createdAt', sortDir: string = 'desc') =>
            buildPaginatedUrl(`${API_BASE_URL}/api/topics`, page, size, sortBy, sortDir),
          GET_BY_ID: (id: string) => `${API_BASE_URL}/api/topics/${id}`,
          UPDATE: (id: string) => `${API_BASE_URL}/api/topics/${id}`,
          DELETE: (id: string) => `${API_BASE_URL}/api/topics/${id}`,
          UPVOTE: (id: string) => `${API_BASE_URL}/api/topics/${id}/upvote`,
          DOWNVOTE: (id: string) => `${API_BASE_URL}/api/topics/${id}/downvote`,
          FOLLOW: (id: string) => `${API_BASE_URL}/api/topics/${id}/follow`,
        },
        TOPIC_REPLIES: {
          CREATE: `${API_BASE_URL}/api/topic-replies`,
          GET_BY_TOPIC: (topicId: string, page: number = 0, size: number = 20) =>
            buildPaginatedUrl(`${API_BASE_URL}/api/topic-replies/topic/${topicId}`, page, size, 'createdAt', 'asc'),
          GET_BY_ID: (id: string) => `${API_BASE_URL}/api/topic-replies/${id}`,
          UPDATE: (id: string) => `${API_BASE_URL}/api/topic-replies/${id}`,
          DELETE: (id: string) => `${API_BASE_URL}/api/topic-replies/${id}`,
          UPVOTE: (id: string) => `${API_BASE_URL}/api/topic-replies/${id}/upvote`,
          DOWNVOTE: (id: string) => `${API_BASE_URL}/api/topic-replies/${id}/downvote`,
        },
        ANNOUNCEMENTS: {
          CREATE: `${API_BASE_URL}/api/announcements`,
          GET_ALL: (page: number = 0, size: number = 20, sortBy: string = 'createdAt', sortDir: string = 'desc') =>
            buildPaginatedUrl(`${API_BASE_URL}/api/announcements`, page, size, sortBy, sortDir),
          GET_BY_ID: (id: string) => `${API_BASE_URL}/api/announcements/${id}`,
          UPDATE: (id: string) => `${API_BASE_URL}/api/announcements/${id}`,
          DELETE: (id: string) => `${API_BASE_URL}/api/announcements/${id}`,
          VIEW: (id: string) => `${API_BASE_URL}/api/announcements/${id}/view`,
        },
        DASHBOARD: {
          GET_LEADER_DASHBOARD: `${API_BASE_URL}/api/dashboard/leader`,
        },
        DEPARTMENTS: {
          CREATE: `${API_BASE_URL}/api/departments`,
          GET_ALL: `${API_BASE_URL}/api/departments`,
          GET_BY_ID: (id: string) => `${API_BASE_URL}/api/departments/${id}`,
          UPDATE: (id: string) => `${API_BASE_URL}/api/departments/${id}`,
          DELETE: (id: string) => `${API_BASE_URL}/api/departments/${id}`,
        },
        LEADERS: {
          CREATE: `${API_BASE_URL}/api/leaders`,
          GET_ALL: `${API_BASE_URL}/api/leaders`,
          GET_BY_ID: (id: string) => `${API_BASE_URL}/api/leaders/${id}`,
          UPDATE: (id: string) => `${API_BASE_URL}/api/leaders/${id}`,
          DELETE: (id: string) => `${API_BASE_URL}/api/leaders/${id}`,
          GENERATE_PASSWORD: (id: string) => `${API_BASE_URL}/api/leaders/${id}/generate-password`,
          SEARCH: (name?: string, level?: string, leadershipName?: string, departmentId?: number) => {
            const params = new URLSearchParams();
            if (name) params.append('name', name);
            if (level) params.append('level', level);
            if (leadershipName) params.append('leadershipName', leadershipName);
            if (departmentId) params.append('departmentId', departmentId.toString());
            return `${API_BASE_URL}/api/leaders/search?${params.toString()}`;
          },
        },
} as const;

// Helper function to build paginated URL
export const buildPaginatedUrl = (
  baseUrl: string,
  page: number = 0,
  size: number = 20,
  sortBy: string = 'id',
  sortDir: string = 'desc'
) => {
  const params = new URLSearchParams({
    page: page.toString(),
    size: size.toString(),
    sortBy,
    sortDir,
  });
  return `${baseUrl}?${params.toString()}`;
};


