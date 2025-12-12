# Sanjeevani AI Frontend Documentation

This document provides an overview of the frontend codebase for the Sanjeevani AI project.

## Project Overview

This project is a React Native application built with Expo. It includes a web version of the application as well. The application uses TypeScript and Tailwind CSS for styling.

## Folder Structure

Here is a breakdown of the most important directories:

- **`/app`**: Contains all the screens and navigation logic for the application, following the Expo Router convention.
    - **`/app/(tabs)`**: Defines the tab-based navigation for the mobile app.
    - **`/app/web`**: Contains the web-specific layout and pages.
- **`/assets`**: Static assets like images and fonts are stored here.
- **`/components`**: Reusable React components used throughout the application.
    - **`/components/ui`**: UI-specific components.
    - **`/components/web`**: Components used only for the web version.
- **`/constants`**: Holds constant values used in the application, such as API endpoints and theme colors.
- **`/context`**: Contains React Context providers for global state management (e.g., authentication, theme).
- **`/hooks`**: Custom React hooks for reusable logic.
- **`/utils`**: Utility functions.

## Available Scripts

In the `package.json`, you will find several useful scripts:

- `npm start`: Starts the development server for Expo Go.
- `npm run android`: Runs the app on an Android emulator or connected device.
- `npm run ios`: Runs the app on an iOS simulator or connected device.
- `npm run web`: Runs the web version of the app.

## Component Library

The project has a collection of reusable components in the `/components` directory. When creating new UI elements, check if a suitable component already exists.

## Styling

The project uses [Tailwind CSS](https://tailwindcss.com/) for styling. The configuration can be found in `tailwind.config.js`. A `tailwind.css` file is also present for base styles and custom CSS.

## State Management

Global state is managed using React's Context API. The context providers are located in the `/context` directory. For example, `context/auth.tsx` manages the user's authentication state.
