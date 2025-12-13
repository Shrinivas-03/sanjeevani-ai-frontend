# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Troubleshooting

- If you see `Network request failed` in Android emulator logs, ensure your backend is reachable from the emulator. Use `EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:5000` (Android emulator) or your machine IP (e.g., `http://192.168.x.x:5000`) instead of `localhost`.
- If Metro logs `ENOENT: InternalBytecode.js`, create a temporary `InternalBytecode.js` at the project root (this repo includes one) or upgrade to a newer Metro/React Native if available.

- If your environment variables aren't being used as expected, confirm the file is named `.env` (leading dot). If you accidentally created a file named `env` without the dot, rename it to `.env` so Expo and Metro pick it up. Example:

```bash
mv env .env
```

Android / Emulator network troubleshooting
- If you see `Network request failed` on Android emulator, try the following:
   - Make sure your backend server is running locally (e.g., `npm run dev` for your backend) and listening on port 5000.
   - For Android emulator (AVD), use `EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:5000`. You can set this in `.env` and restart the Expo dev server.
   - If using a physical device, set `EXPO_PUBLIC_API_BASE_URL` to your machine IP (e.g., `http://192.168.x.x:5000`) and ensure your firewall allows incoming connections on that port.
   - Re-run the packager with cache clearing: `npx expo start -c` and restart the app on the emulator.
   - Optionally, forward the port using ADB: `adb reverse tcp:5000 tcp:5000` (emulator only).
  - Use these commands to validate and forward ports:
    ```bash
    adb devices
    adb reverse tcp:5000 tcp:5000
    adb reverse --list
    ```
  - If issues persist, test reachability from the host using `npm run check-backend` (this repo has a helper script that checks `/api/auth/me`).

If you prefer to expose your backend publicly for mobile device testing, use `ngrok` or `localtunnel` and set `EXPO_PUBLIC_API_BASE_URL` to the public URL.

Note: Genymotion devices map the host to `10.0.3.2` rather than `10.0.2.2` (AVD).
