# API Integration Guide

This document explains how the Sanjeevani AI frontend integrates with the Flask backend API.

## 🔧 Configuration

### API Base URL
The API URL is configured in `constants/api.ts`:
```typescript
export const API_BASE_URL = 'http://localhost:5000';
```

**Change this** if your backend runs on a different URL/port.

## 🔐 Authentication Flow

### 1. Sign Up
**File:** `app/signup.tsx`

```typescript
// User fills the form and clicks "Sign Up"
const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    full_name: fullName,
    email,
    password,
    blood_group: bloodGroup || null,
    existing_diseases: diseases || null,
  }),
});

const data = await response.json();

// On success, tokens are stored
localStorage.setItem('access_token', data.access_token);
localStorage.setItem('refresh_token', data.refresh_token);

// User is logged in
login(); // Updates auth context
router.replace('/web'); // Redirects to home
```

### 2. Sign In
**File:** `app/signin.tsx`

```typescript
// User enters credentials and clicks "Login"
const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
});

const data = await response.json();

// On success, tokens are stored
localStorage.setItem('access_token', data.access_token);
localStorage.setItem('refresh_token', data.refresh_token);

// User is logged in
login(); // Updates auth context
router.replace('/web'); // Redirects to home
```

### 3. Making Authenticated Requests

Use the `authenticatedFetch` helper from `constants/api.ts`:

```typescript
import { authenticatedFetch, API_ENDPOINTS } from '@/constants/api';

// Example: Get current user info
const response = await authenticatedFetch(API_ENDPOINTS.AUTH.ME);
const data = await response.json();

console.log(data.user); // User information
```

## 📡 Available API Endpoints

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/auth/signup` | POST | Create account | No |
| `/api/auth/login` | POST | Login | No |
| `/api/auth/refresh` | POST | Refresh access token | No |
| `/api/auth/me` | GET | Get current user | Yes (Bearer token) |

## 🔑 Token Management

### Storing Tokens (Web)
```typescript
localStorage.setItem('access_token', data.access_token);
localStorage.setItem('refresh_token', data.refresh_token);
```

### Retrieving Tokens
```typescript
import { getAccessToken, getRefreshToken } from '@/constants/api';

const accessToken = getAccessToken();
const refreshToken = getRefreshToken();
```

### Clearing Tokens (Logout)
```typescript
import { clearTokens } from '@/constants/api';

clearTokens(); // Removes both tokens
logout(); // Updates auth context
router.replace('/web'); // Redirects to home
```

## 🛠️ Request/Response Examples

### Sign Up Request
```json
POST /api/auth/signup
Content-Type: application/json

{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "blood_group": "A+",
  "existing_diseases": "None"
}
```

### Sign Up Response (Success)
```json
{
  "message": "User created successfully",
  "access_token": "eyJ0eXAiOiJKV1QiLCJh...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJh...",
  "user": {
    "id": 1,
    "full_name": "John Doe",
    "email": "john@example.com",
    "blood_group": "A+",
    "existing_diseases": "None",
    "created_at": "2025-10-17T10:30:00"
  }
}
```

### Login Request
```json
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

### Get Current User Request
```http
GET /api/auth/me
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJh...
```

### Get Current User Response
```json
{
  "user": {
    "id": 1,
    "full_name": "John Doe",
    "email": "john@example.com",
    "blood_group": "A+",
    "existing_diseases": "None",
    "created_at": "2025-10-17T10:30:00"
  }
}
```

## 🚀 Running the Application

### 1. Start the Backend
```bash
# Make sure your Flask backend is running
# It should be available at http://localhost:5000
```

### 2. Start the Frontend
```bash
npx expo start
```

### 3. Test the Integration
1. Navigate to Sign Up page
2. Create an account
3. Check browser console/network tab for API calls
4. After successful signup, you'll be logged in and redirected

## ⚠️ Error Handling

Both signin and signup handle errors gracefully:

```typescript
try {
  const response = await fetch(/* ... */);
  const data = await response.json();
  
  if (response.ok) {
    // Success handling
  } else {
    Alert.alert('Error', data.message || 'Request failed');
  }
} catch (error) {
  console.error('Error:', error);
  Alert.alert('Error', 'Failed to connect to server. Make sure the backend is running on port 5000.');
}
```

## 🔄 Refreshing Access Tokens

To refresh an expired access token:

```typescript
import { authenticatedFetch, API_ENDPOINTS, getRefreshToken } from '@/constants/api';

const refreshToken = getRefreshToken();
const response = await fetch(API_ENDPOINTS.AUTH.REFRESH, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${refreshToken}`,
    'Content-Type': 'application/json',
  },
});

const data = await response.json();
localStorage.setItem('access_token', data.access_token);
```

## 📱 Mobile Support

For React Native (mobile), you'll need to:

1. Install `@react-native-async-storage/async-storage`
2. Replace `localStorage` with `AsyncStorage` in token management functions
3. Update the API base URL to use your computer's local IP instead of `localhost`

```typescript
// For mobile development
export const API_BASE_URL = 'http://192.168.1.100:5000'; // Your computer's IP
```

## 🐛 Debugging

### Check if Backend is Running
```bash
curl http://localhost:5000/api/health
```

### View Network Requests in Browser
1. Open Developer Tools (F12)
2. Go to Network tab
3. Try signing up or logging in
4. Check the request/response details

### Common Issues

**CORS Errors:**
- Make sure your Flask backend has CORS enabled
- Check that your frontend URL is in the allowed origins

**Connection Refused:**
- Backend is not running
- Wrong port number
- Check firewall settings

**401 Unauthorized:**
- Token expired or invalid
- Token not included in request
- Check Authorization header format

## 🔒 Security Notes

1. **HTTPS:** Use HTTPS in production
2. **Token Storage:** Consider more secure storage options for production
3. **Password Validation:** Add client-side validation for password strength
4. **Rate Limiting:** Implement rate limiting on backend
5. **Input Sanitization:** Always sanitize user inputs

## 📝 Next Steps

- [ ] Implement automatic token refresh
- [ ] Add password reset functionality
- [ ] Implement email verification
- [ ] Add user profile update endpoint
- [ ] Implement AsyncStorage for mobile support
- [ ] Add biometric authentication option
- [ ] Implement session management
