# 🎯 Quick Start: Environment Configuration

## ✅ What I Did

Created a centralized environment configuration system so you only need to update the API URL in **one place** (`.env` file).

## 📁 Files Created/Updated

### Created:
1. **`.env`** - Your environment variables (currently set to `http://10.186.249.186:5000`)
2. **`.env.example`** - Template for team members
3. **`ENV_SETUP.md`** - Complete documentation

### Updated:
1. **`constants/api.ts`** - Now reads from environment variable
2. **`app/signin.tsx`** - Imports API_BASE_URL from constants
3. **`app/signup.tsx`** - Imports API_BASE_URL from constants
4. **`.gitignore`** - Added `.env` to prevent committing secrets

## 🚀 How to Change API URL

### Method 1: Edit .env file
```bash
# Open .env and change this line:
EXPO_PUBLIC_API_BASE_URL=http://YOUR_NEW_IP:5000
```

### Method 2: Command line
```bash
# Windows PowerShell
(Get-Content .env) -replace 'http://.*:5000', 'http://YOUR_NEW_IP:5000' | Set-Content .env

# Restart Expo
npx expo start --clear
```

## 📝 Current Configuration

```env
EXPO_PUBLIC_API_BASE_URL=http://10.186.249.186:5000
```

This URL is now used in:
- Sign In page
- Sign Up page
- All future API calls via `constants/api.ts`

## 🔄 After Changing .env

**Important:** You MUST restart Expo for changes to take effect:

```bash
# Stop current server (Ctrl+C in terminal)
npx expo start --clear
```

## 💡 Common Scenarios

### Testing Locally
```env
EXPO_PUBLIC_API_BASE_URL=http://localhost:5000
```

### Testing on Physical Device
```env
EXPO_PUBLIC_API_BASE_URL=http://YOUR_COMPUTER_IP:5000
```

### Testing on Network
```env
EXPO_PUBLIC_API_BASE_URL=http://10.186.249.186:5000
```

### Production
```env
EXPO_PUBLIC_API_BASE_URL=https://api.yourdomain.com
```

## ✨ Benefits

✅ **Single Source of Truth**
- Change API URL once in `.env`
- Automatically updates everywhere

✅ **Environment-Specific**
- Different settings for dev/staging/prod
- Each team member can use their own

✅ **Secure**
- `.env` is gitignored
- Sensitive data stays local

✅ **Easy to Manage**
- No code changes needed
- Just edit one file

## 🐛 Troubleshooting

**API calls not using new URL?**
```bash
# Clear cache and restart
npx expo start --clear
```

**Environment variable undefined?**
- Check `.env` exists in project root
- Variable must start with `EXPO_PUBLIC_`
- Restart Expo after creating/editing `.env`

**Can't connect from phone?**
- Use your computer's IP, not `localhost`
- Check both devices on same WiFi
- Backend must listen on `0.0.0.0`

## 📱 Find Your IP Address

**Windows:**
```powershell
ipconfig
# Look for IPv4 Address under your network adapter
```

**Mac/Linux:**
```bash
ifconfig
# or
ip addr show
```

## 🎓 Next Steps

1. ✅ `.env` is set to your current backend
2. ✅ All files import from centralized config
3. ✅ `.gitignore` protects your secrets
4. 🔄 Restart Expo to apply changes
5. 🧪 Test sign in/sign up

---

**Ready to test?**
1. Make sure backend is running at `http://10.186.249.186:5000`
2. Restart Expo: `npx expo start --clear`
3. Try signing up or logging in
4. Check Network tab in browser to verify API calls
