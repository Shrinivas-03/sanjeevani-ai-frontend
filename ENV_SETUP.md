# Environment Configuration Guide

## 📋 Overview

This project uses environment variables to manage configuration settings like API URLs. This allows you to easily switch between different environments (development, staging, production) without changing code.

## 🚀 Quick Setup

### 1. Copy the Example File
```bash
cp .env.example .env
```

### 2. Update the API URL
Open `.env` and update the API base URL:
```env
EXPO_PUBLIC_API_BASE_URL=http://YOUR_IP_ADDRESS:5000
```

### 3. Restart Expo
After changing `.env`, restart your Expo development server:
```bash
# Stop the current server (Ctrl+C)
# Then restart
npx expo start
```

## 📝 Environment Variables

### EXPO_PUBLIC_API_BASE_URL
The base URL for your Flask backend API.

**Examples:**
- **Local development:** `http://localhost:5000`
- **Network testing:** `http://192.168.1.100:5000` (your computer's IP)
- **Production:** `https://api.sanjeevani.com`

**Note:** In Expo, environment variables must be prefixed with `EXPO_PUBLIC_` to be accessible in your app.

## 🔧 Usage in Code

The API URL is automatically imported from the centralized configuration:

```typescript
// constants/api.ts
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// In any file that needs the API
import { API_BASE_URL } from '@/constants/api';

fetch(`${API_BASE_URL}/api/auth/login`, { ... });
```

## 📁 Files Using Environment Variables

- `constants/api.ts` - Centralized API configuration
- `app/signin.tsx` - Sign in page
- `app/signup.tsx` - Sign up page
- Any other files making API calls

## 🌍 Different Environments

### Local Development (Same Machine)
```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:5000
```

### Network Development (Different Devices on Same Network)
```env
EXPO_PUBLIC_API_BASE_URL=http://10.186.249.186:5000
```

To find your IP address:
- **Windows:** `ipconfig` (look for IPv4 Address)
- **Mac/Linux:** `ifconfig` or `ip addr`

### Production
```env
EXPO_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

## 🔐 Security Notes

1. **Never commit `.env`** - It's already in `.gitignore`
2. **Use `.env.example`** - Share this with your team as a template
3. **Sensitive data** - Never put API keys or secrets in code
4. **Environment-specific** - Use different `.env` files for different environments

## 🐛 Troubleshooting

### Environment variable not updating?
1. Stop Expo server (Ctrl+C)
2. Clear cache: `npx expo start --clear`
3. Restart

### API calls failing?
1. Check `.env` file exists in project root
2. Verify `EXPO_PUBLIC_API_BASE_URL` is set correctly
3. Make sure backend is running at that URL
4. Check for typos in the URL

### Cannot connect from mobile device?
1. Use your computer's IP address, not `localhost`
2. Make sure both devices are on the same network
3. Check firewall settings
4. Backend should listen on `0.0.0.0`, not `127.0.0.1`

## 📱 Mobile Testing

When testing on a physical device or emulator:

```env
# Don't use localhost! Use your computer's IP
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:5000
```

Your backend must be configured to accept connections from the network:
```python
# Flask
app.run(host='0.0.0.0', port=5000)
```

## 🔄 Updating the API URL

**Old way (hardcoded in each file):**
```typescript
// Had to change in multiple files ❌
const API_BASE_URL = 'http://localhost:5000';
```

**New way (centralized in .env):**
```env
# Change once in .env ✅
EXPO_PUBLIC_API_BASE_URL=http://10.186.249.186:5000
```

Now when you update `.env`, restart Expo, and the change applies everywhere!

## ✅ Benefits

- ✅ **Single source of truth** - Update API URL in one place
- ✅ **Environment-specific** - Different URLs for dev/staging/prod
- ✅ **Secure** - Keep sensitive data out of code
- ✅ **Team-friendly** - Each developer can use their own `.env`
- ✅ **Version control safe** - `.env` is gitignored

## 📚 Additional Resources

- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [Best Practices for Environment Variables](https://12factor.net/config)

## 🎯 Example Workflow

1. Clone repository
2. Copy `.env.example` to `.env`
3. Update `EXPO_PUBLIC_API_BASE_URL` with your backend URL
4. Run `npx expo start`
5. App connects to your backend automatically ✨

---

**Need help?** Check that:
- `.env` file exists in project root
- Variables start with `EXPO_PUBLIC_`
- Expo server was restarted after changes
- Backend is running and accessible
