# Citizen Registration Setup

## Overview
This project now includes a complete registration system for citizens with the following features:

- User registration form with all required fields
- Integration with backend API at `localhost:8080`
- Auto-login after successful registration
- Seamless navigation between Login and Register forms

## Required Environment Variables

Create a `.env` file in the root directory with:

```bash
VITE_API_BASE_URL=http://localhost:8080
```

**Note**: The `.env` file is ignored by git for security reasons. Create it locally for development.

## Backend API Requirements

The authentication system expects backend API endpoints at:

### Registration
```
POST http://localhost:8080/api/auth/register
```

#### Request Body (RegisterRequestDto)
```json
{
  "email": "string",
  "password": "string", 
  "phoneNumber": "string",
  "firstName": "string",
  "lastName": "string",
  "middleName": "string"
}
```

### Login
```
POST http://localhost:8080/api/auth/login
```

#### Request Body (LoginRequestDto)
```json
{
  "emailOrPhone": "string",
  "password": "string"
}
```

### Response (AuthResponseDto)
Both endpoints return the same response structure:
```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "user": {
    "id": "number",
    "firstName": "string",
    "lastName": "string",
    "middleName": "string",
    "phoneNumber": "string",
    "email": "string",
    "profileUrl": "string",
    "role": {
      "id": "number",
      "name": "string",
      "permissions": ["string"]
    },
    "location": {
      "id": "number",
      "district": "string",
      "sector": "string",
      "cell": "string",
      "village": "string",
      "latitude": "number",
      "longitude": "number"
    }
  }
}
```

## Features

### Registration Form
- **Required Fields**: First Name, Last Name, Email, Phone Number, Password
- **Optional Fields**: Middle Name
- **Validation**: Client-side validation for required fields
- **Error Handling**: Displays backend error messages

### User Experience
- **Real Authentication**: Full integration with backend authentication system
- **Token Management**: Automatic storage and management of access/refresh tokens
- **User Persistence**: User sessions persist across browser refreshes
- **Profile Completion**: Automatic detection and prompting for incomplete profiles
- **Location Management**: Comprehensive location fields for Rwandan administrative structure
- **Navigation**: Easy switching between Login and Register forms
- **Responsive Design**: Works on both desktop and mobile devices
- **Multi-language Support**: Full support for English, Kinyarwanda, and French

### Security
- **Environment Variables**: API base URL configurable via environment variables
- **Fallback**: Defaults to `localhost:8080` if environment variable is not set

## File Structure

```
src/
├── components/
│   ├── Register.tsx          # Registration form component with language support
│   └── Login.tsx             # Updated login component with register link and language support
├── config/
│   └── api.ts                # API configuration and endpoints
├── i18n/
│   └── translations.ts       # Multi-language translations for auth forms
└── App.tsx                   # Main app with register button
```

## Usage

1. **Register Button**: Located in the header next to the Login button
2. **Form Navigation**: Users can switch between Login and Register forms
3. **Auto-redirect**: After successful registration, users are automatically logged in

## Development Notes

- The registration form matches the `RegisterRequestDto` structure exactly
- The login form accepts both email and phone number as `emailOrPhone`
- Both endpoints return the same `AuthResponseDto` structure with user data and tokens
- Location fields are optional during registration but required for full profile completion
- Profile completion banner automatically appears for users with incomplete location data
- API calls use the configured base URL from environment variables
- Error handling includes both network errors and backend validation errors
- The system gracefully falls back to localhost:8080 if no environment variable is set
- Full multi-language support for English, Kinyarwanda, and French
- Language context is automatically passed from the main App component
- User data and tokens are automatically stored in localStorage for session persistence
- Null-safe location handling prevents runtime errors

## Testing

To test the registration system:

1. Ensure your backend is running on `localhost:8080`
2. Create a `.env` file with the correct API base URL
3. Start the frontend application
4. Click the "Register" button in the header
5. Fill out the registration form and submit

The system will attempt to register the user and automatically log them in upon success.
