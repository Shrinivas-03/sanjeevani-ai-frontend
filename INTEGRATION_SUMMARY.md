# ✅ Flask API Integration - Summary

## 🎉 What's Been Implemented

### 1. **Updated Sign In Page** (`app/signin.tsx`)
- ✅ Connected to Flask API endpoint: `/api/auth/login`
- ✅ Collects email and password from form
- ✅ Sends POST request to backend
- ✅ Stores `access_token` and `refresh_token` in localStorage
- ✅ Updates authentication context on success
- ✅ Shows loading state during API call
- ✅ Displays error messages from backend
- ✅ "Skip for now" option for demo purposes

### 2. **Updated Sign Up Page** (`app/signup.tsx`)
- ✅ Connected to Flask API endpoint: `/api/auth/signup`
- ✅ Collects full name, email, password, blood group, and diseases
- ✅ Sends POST request to backend
- ✅ Stores tokens on successful signup
- ✅ Updates authentication context
- ✅ Shows loading state during API call
- ✅ Displays error messages from backend
- ✅ Form validation for required fields

### 3. **API Configuration** (`constants/api.ts`)
- ✅ Centralized API base URL configuration
- ✅ API endpoint constants
- ✅ Helper functions for token management:
  - `getAccessToken()` - Retrieve access token
  - `getRefreshToken()` - Retrieve refresh token
  - `clearTokens()` - Remove all tokens
  - `authenticatedFetch()` - Make authenticated API calls

### 4. **Updated Logout** (`components/brand-header.tsx`)
- ✅ Clears tokens from localStorage on logout
- ✅ Updates authentication context
- ✅ Redirects to home page

## 🔌 API Endpoints Used

| Endpoint | Method | Used In | Purpose |
|----------|--------|---------|---------|
| `/api/auth/signup` | POST | `signup.tsx` | Create new account |
| `/api/auth/login` | POST | `signin.tsx` | User login |
| `/api/auth/me` | GET | (Ready to use) | Get current user |
| `/api/auth/refresh` | POST | (Ready to use) | Refresh access token |

## 📦 Request/Response Format

### Sign Up Request
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "blood_group": "A+",
  "existing_diseases": "None"
}
```

### Sign In Request
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Success Response
```json
{
  "message": "Success message",
  "access_token": "eyJ0eXAiOiJKV1Qi...",
  "refresh_token": "eyJ0eXAiOiJKV1Qi...",
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

## 🚀 How to Test

### 1. **Start Your Backend Server**
```bash
# Your Flask backend should be running on port 5000
# http://localhost:5000
```

### 2. **Start the Frontend**
```bash
npx expo start
```

### 3. **Test Sign Up**
1. Navigate to Sign Up page
2. Fill in the form:
   - Full Name: Test User
   - Email: test@example.com
   - Password: password123
   - Blood Group: A+ (optional)
   - Diseases: None (optional)
3. Click "Sign Up"
4. Check browser console for API call
5. On success, you'll be logged in and redirected

### 4. **Test Sign In**
1. Navigate to Sign In page
2. Enter credentials:
   - Email: test@example.com
   - Password: password123
3. Click "Login"
4. Check browser console for API call
5. On success, you'll be logged in and redirected

### 5. **Verify Tokens**
Open browser console and check:
```javascript
localStorage.getItem('access_token')
localStorage.getItem('refresh_token')
```

### 6. **Test Logout**
1. Click "Logout" button in header
2. Tokens should be cleared
3. You'll be logged out and redirected to home

## 🔍 Debugging

### Check Network Requests
1. Open Browser DevTools (F12)
2. Go to Network tab
3. Try signing up or logging in
4. Look for requests to `/api/auth/signup` or `/api/auth/login`
5. Check request payload and response

### Common Issues

**❌ "Failed to connect to server"**
- Solution: Make sure backend is running on `http://localhost:5000`
- Check: `curl http://localhost:5000/api/health`

**❌ CORS Error**
- Solution: Backend needs CORS enabled for `http://localhost:8081` (or your Expo URL)
- Check backend CORS configuration

**❌ "Login failed" or "Signup failed"**
- Check backend logs for error details
- Verify request payload format
- Check if email already exists (for signup)

## 📝 Token Flow

```
┌─────────────┐
│   Sign Up   │
│  / Sign In  │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  POST /api/auth │
│ /signup or      │
│ /login          │
└──────┬──────────┘
       │
       ▼
┌─────────────────────┐
│  Backend Validates  │
│  & Returns Tokens   │
└──────┬──────────────┘
       │
       ▼
┌──────────────────────┐
│ localStorage.setItem │
│ ('access_token', ...) │
│ ('refresh_token', ...)│
└──────┬───────────────┘
       │
       ▼
┌─────────────────┐
│  login() called │
│ (Auth Context)  │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Redirect to    │
│  /web (Home)    │
└─────────────────┘
```

## 🔐 Making Authenticated Requests

To call protected endpoints (like `/api/auth/me`):

```typescript
import { authenticatedFetch, API_ENDPOINTS } from '@/constants/api';

// Example: Get current user
const response = await authenticatedFetch(API_ENDPOINTS.AUTH.ME);
const data = await response.json();

if (response.ok) {
  console.log('User:', data.user);
} else {
  console.error('Error:', data.message);
}
```

## 📚 Documentation

- Full API integration guide: See `API_INTEGRATION.md`
- Backend endpoints: Ask backend developer for API documentation
- Token management: See `constants/api.ts`

## ✨ Features Ready to Implement

Now that authentication is working, you can:

1. **Fetch User Profile** - Call `/api/auth/me` on app load
2. **Update Profile** - Create endpoint to update user info
3. **Password Reset** - Implement forgot password flow
4. **Token Refresh** - Auto-refresh tokens when expired
5. **Protected Routes** - Add more endpoints for chat, predictions, etc.

## 🎯 Next Steps

1. Test the signup and login flows
2. Verify tokens are stored correctly
3. Implement user profile fetching on app load
4. Add automatic token refresh logic
5. Create more API endpoints for app features

---

**Backend Running?** Make sure your Flask server is active on `http://localhost:5000`

**Need Help?** Check the browser console and network tab for detailed error messages.
