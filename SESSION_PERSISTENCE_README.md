# Session Persistence Implementation

This document describes the session persistence features implemented in the Citizen Engagement Platform frontend application to ensure users remain logged in across page refreshes and browser sessions.

## Features Implemented

### 1. Automatic Session Restoration
- **On App Start**: The application automatically checks for stored authentication tokens and user data
- **Token Validation**: Validates JWT token expiration before restoring the session
- **Automatic Refresh**: Attempts to refresh expired tokens using refresh tokens

### 2. Enhanced Authentication Context
- **Loading State**: Provides `isLoading` state to prevent premature rendering
- **Session Validation**: Validates stored sessions on app initialization
- **Token Management**: Handles access and refresh tokens securely

### 3. Automatic Token Refresh
- **Background Refresh**: Automatically refreshes tokens every 10 minutes
- **On-Demand Refresh**: Refreshes tokens when API calls fail due to expiration
- **Seamless Experience**: Users don't experience interruptions during token refresh

### 4. Enhanced API Interceptor
- **Automatic Retry**: Retries failed requests with new tokens after refresh
- **Error Handling**: Gracefully handles authentication errors
- **Token Injection**: Automatically adds authentication headers to requests

## How It Works

### Session Restoration Flow
1. **App Initialization**: `AuthProvider` starts with `isLoading: true`
2. **Local Storage Check**: Looks for stored `currentUser` and `authTokens`
3. **Token Validation**: Checks if access token is expired
4. **Auto-Refresh**: If expired, attempts to refresh using refresh token
5. **Session Restore**: Restores user session and sets `isLoading: false`
6. **App Rendering**: Application renders with authenticated user

### Token Refresh Process
1. **Detection**: API interceptor detects 401 Unauthorized responses
2. **Refresh Attempt**: Calls `refreshSession()` to get new access token
3. **Request Retry**: Retries the original request with new token
4. **Fallback**: If refresh fails, logs out user gracefully

### Periodic Maintenance
- **10-Minute Intervals**: Checks token expiration every 10 minutes
- **Proactive Refresh**: Refreshes tokens before they expire
- **Background Process**: Runs silently without user interaction

## Configuration

### Timeout Settings
- **Session Validation Timeout**: 10 seconds (prevents infinite loading)
- **Token Refresh Interval**: 10 minutes (proactive token refresh)
- **API Retry**: Automatic retry after token refresh

### Storage Keys
- `currentUser`: Stored user profile data
- `authTokens`: Stored access and refresh tokens

## Security Features

### Token Validation
- **JWT Decoding**: Validates token structure and expiration
- **Automatic Cleanup**: Removes invalid tokens from storage
- **Secure Storage**: Uses localStorage for token persistence

### Error Handling
- **Graceful Degradation**: Falls back to login on authentication failures
- **User Feedback**: Clear error messages for authentication issues
- **Automatic Logout**: Logs out users with invalid sessions

## Usage Examples

### In Components
```typescript
const { currentUser, isAuthenticated, isLoading, refreshSession } = useAuth();

// Check loading state
if (isLoading) {
  return <LoadingSpinner />;
}

// Use authentication state
if (isAuthenticated) {
  return <AuthenticatedContent />;
}
```

### API Calls
```typescript
// Automatic token refresh in API calls
const headers = await getAuthHeaders(refreshSession);
const response = await fetch(url, { headers });
```

## Benefits

1. **User Experience**: No more unexpected logouts on page refresh
2. **Seamless Navigation**: Users stay logged in across browser sessions
3. **Reduced Friction**: Fewer login prompts during normal usage
4. **Security**: Automatic token refresh maintains secure sessions
5. **Reliability**: Graceful handling of authentication edge cases

## Troubleshooting

### Common Issues
- **Infinite Loading**: Check browser console for session validation logs
- **Token Refresh Failures**: Verify backend refresh endpoint is working
- **Storage Issues**: Check localStorage permissions and quota

### Debug Logging
The implementation includes comprehensive console logging for debugging:
- Session validation steps
- Token refresh attempts
- Authentication state changes
- Error conditions

## Future Enhancements

1. **Session Analytics**: Track session duration and refresh patterns
2. **Multi-Tab Support**: Synchronize sessions across browser tabs
3. **Offline Support**: Cache authentication state for offline scenarios
4. **Biometric Authentication**: Integrate with device biometrics
