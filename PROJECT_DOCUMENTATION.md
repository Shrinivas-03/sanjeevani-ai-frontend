# Sanjeevani AI Project Documentation

## Table of Contents

- [Project Overview](#project-overview)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Running the App](#running-the-app)
- [Key Components and Files](#key-components-and-files)
  - [app/](#app)
  - [components/](#components)
  - [context/](#context)
  - [constants/](#constants)
  - [hooks/](#hooks)
- [Styling](#styling)
- [Navigation](#navigation)
- [Authentication Flow](#authentication-flow)

## Project Overview

Sanjeevani AI is a cross-platform application built with Expo that targets Android, iOS, and the web. The application seems to be a health-related AI assistant, with features like "Prediction" and a "Chat" interface. The project is set up with a clear separation of concerns, with dedicated directories for components, context, constants, and hooks.

## Technologies Used

- **Framework:** [Expo (React Native)](https://expo.dev/)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with [NativeWind](https://www.nativewind.dev/)
- **Navigation:** [React Navigation](https://reactnavigation.org/) with [Expo Router](https://docs.expo.dev/router/introduction/)
- **Linting:** [ESLint](https://eslint.org/)

## Project Structure

The project follows a standard Expo project structure, with some additional directories for better organization:

```
D:\sanjeevani-ai-frontend\
├───app\             # Main application code (screens and navigation)
├───assets\          # Static assets like images
├───components\      # Reusable React components
├───constants\       # Constant values (API endpoints, theme colors)
├───context\         # React context providers (authentication, theme)
├───hooks\           # Custom React hooks
├───node_modules\    # Node.js dependencies
├───scripts\         # Utility scripts
└───...
```

## Getting Started

### Installation

To get started with the project, you need to install the dependencies using npm:

```bash
npm install
```

### Running the App

You can run the application on different platforms using the following commands:

-   **Start the development server:**
    ```bash
    npx expo start
    ```
-   **Run on Android:**
    ```bash
    npm run android
    ```
-   **Run on iOS:**
    ```bash
    npm run ios
    ```
-   **Run on the web:**
    ```bash
    npm run web
    ```

## Key Components and Files

### app/

This directory contains the main application code, including screens and navigation setup.

-   `_layout.tsx`: The root layout for the mobile app. It sets up the `AppThemeProvider`, `AuthProvider`, and the main `Stack` navigator.
-   `web/_layout.tsx`: The root layout for the web application. It sets up the `ThemeProvider` and the `Stack` navigator for web-specific routes.
-   `(tabs)/`: This directory defines the tab navigation for the mobile app, including screens for Prediction, Chat, Profile, and History.
-   `index.tsx`: The entry point for the mobile app, which redirects to the Chat screen.
-   `web/index.tsx`: The entry point for the web application, which renders the `WebLandingPage`.

### components/

This directory contains reusable React components used throughout the application.

-   `splash-screen.tsx`: A splash screen that is displayed when the app starts.
-   `haptic-tab.tsx`: A custom tab bar button that provides haptic feedback.
-   `web-landing-page.tsx`: The main landing page for the web application.
-   `ui/`: Contains UI-specific components.
-   `web/`: Contains web-specific components.

### context/

This directory contains React context providers for managing global state.

-   `auth.tsx`: Manages the authentication state of the user.
-   `theme.tsx`: Manages the application's theme (light/dark mode).

### constants/

This directory contains constant values used throughout the application.

-   `api.ts`: Likely contains API endpoint URLs and other API-related constants.
-   `theme.ts`: Contains the color palettes for the light and dark themes.

### hooks/

This directory contains custom React hooks.

-   `use-color-scheme.ts`: A hook for getting the current color scheme (light/dark).
-   `use-theme-color.ts`: A hook for getting theme-specific colors.

## Styling

The project uses [Tailwind CSS](https://tailwindcss.com/) for styling, integrated with React Native using [NativeWind](https://www.nativewind.dev/). The Tailwind CSS configuration is in `tailwind.config.js`. The project also has a custom theme system, with light and dark mode support, managed by the `AppThemeProvider` and the `useAppTheme` hook.

## Navigation

The application uses [Expo Router](https://docs.expo.dev/router/introduction/) for file-based routing.

-   **Mobile App:** The mobile app has a `Stack` navigator as the root, which contains a `Tabs` navigator for the main screens (Prediction, Chat, Profile, History) and separate screens for authentication (Sign In, Sign Up, Forgot Password, etc.).
-   **Web App:** The web app has a separate `Stack` navigator with routes for the landing page, authentication, and other web-specific pages.

## Authentication Flow

The application has a complete authentication flow with screens for:

-   Sign In (`signin.tsx`)
-   Sign Up (`signup.tsx`)
-   Forgot Password (`forgot-password.tsx`)
-   OTP Verification (`otp-verification.tsx`)
-   Reset Password (`reset-password.tsx`)

The authentication state is managed by the `AuthProvider` context.
