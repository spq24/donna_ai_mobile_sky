# SkyAI Mobile App

A modern React Native mobile application built with Expo, featuring an AI-powered chat interface with support for text, image, and video generation.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development](#development)
- [Available Scripts](#available-scripts)
- [Tech Stack](#tech-stack)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

### Required Software

1. **Node.js** (v18 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify installation: `node --version`

2. **npm** (comes with Node.js) or **yarn**
   - Verify installation: `npm --version` or `yarn --version`

3. **Git**
   - Download from [git-scm.com](https://git-scm.com/)
   - Verify installation: `git --version`

### Platform-Specific Requirements

#### For iOS Development (macOS only)

1. **Xcode** (latest version from Mac App Store)
   - Includes iOS Simulator
   - Command Line Tools: `xcode-select --install`

2. **CocoaPods** (for iOS dependencies)
   ```bash
   sudo gem install cocoapods
   ```

#### For Android Development

1. **Android Studio**
   - Download from [developer.android.com](https://developer.android.com/studio)
   - Install Android SDK (API 33 or higher)
   - Set up Android Virtual Device (AVD)

2. **Java Development Kit (JDK)**
   - JDK 17 or higher
   - Android Studio includes JDK, or download from [adoptium.net](https://adoptium.net/)

3. **Environment Variables**
   - Add to your `~/.zshrc` or `~/.bash_profile`:
     ```bash
     export ANDROID_HOME=$HOME/Library/Android/sdk
     export PATH=$PATH:$ANDROID_HOME/emulator
     export PATH=$PATH:$ANDROID_HOME/platform-tools
     export PATH=$PATH:$ANDROID_HOME/tools
     export PATH=$PATH:$ANDROID_HOME/tools/bin
     ```

### Expo CLI (Optional but Recommended)

```bash
npm install -g expo-cli
```

Or use npx (no global installation needed):
```bash
npx expo-cli --version
```

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd donna_ai_mobile_sky
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- React Native and Expo dependencies
- TypeScript and type definitions
- Development tools (ESLint, Prettier)

### 3. Verify Assets

The project includes placeholder images in the `assets/` directory:
- `icon.png` - App icon (1024x1024)
- `splash.png` - Splash screen (1024x1024)
- `adaptive-icon.png` - Android adaptive icon (1024x1024)

**Important:** Replace these placeholder images with your actual app icons and splash screens before production.

### 4. Install iOS Dependencies (macOS only)

If you plan to run on iOS:

```bash
cd ios
pod install
cd ..
```

Note: This step is only needed if you're building native iOS apps. For Expo Go, you can skip this.

## Getting Started

### Start the Development Server

```bash
npm start
```

This will:
- Start the Metro bundler
- Open Expo DevTools in your browser
- Display a QR code for testing on physical devices

### Running on Different Platforms

#### iOS Simulator (macOS only)

```bash
npm run ios
```

Or press `i` in the Expo CLI terminal after running `npm start`.

#### Android Emulator

1. Start your Android emulator from Android Studio
2. Run:
   ```bash
   npm run android
   ```

Or press `a` in the Expo CLI terminal after running `npm start`.

#### Physical Device

1. **iOS**: Install "Expo Go" from the App Store
2. **Android**: Install "Expo Go" from Google Play Store
3. Scan the QR code displayed in the terminal or browser

#### Web Browser

```bash
npm run web
```

Or press `w` in the Expo CLI terminal after running `npm start`.

## Project Structure

```
donna_ai_mobile_sky/
├── app/                          # Expo Router app directory
│   ├── _layout.tsx              # Root layout with providers
│   ├── index.tsx                # Entry point
│   ├── contexts/                # App-wide contexts
│   │   ├── AuthContext.tsx     # Authentication state
│   │   ├── ThemeContext.tsx    # Theme management
│   │   └── ThemeColors.tsx     # Theme color utilities
│   ├── screens/                 # Screen components
│   │   ├── chat-screen.tsx      # Main chat interface
│   │   ├── chat-history-screen.tsx
│   │   ├── home-screen.tsx
│   │   ├── media-screen.tsx
│   │   └── settings-screen.tsx
│   └── settings/                # Settings sub-screens
│       ├── account-settings.tsx
│       ├── appearance-settings.tsx
│       └── ... (12 settings files)
├── components/                   # Reusable UI components
│   ├── shared/                  # Shared/base components
│   │   ├── AnimatedView.tsx
│   │   ├── ThemedText.tsx
│   │   ├── Icon.tsx
│   │   ├── ThemeScroller.tsx
│   │   ├── Chip.tsx
│   │   └── Avatar.tsx
│   └── ... (feature components)
├── utils/                       # Utility functions
│   └── useShadow.ts            # Shadow presets
├── assets/                      # Static assets (icons, images)
├── app.json                     # Expo configuration
├── package.json                 # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── babel.config.js             # Babel configuration
├── metro.config.js             # Metro bundler config
├── tailwind.config.js          # Tailwind CSS configuration
└── global.css                  # Global styles
```

## Development

### Code Style

This project uses:
- **TypeScript** for type safety
- **ESLint** for code linting
- **Prettier** for code formatting
- **NativeWind** (Tailwind CSS) for styling

### Linting

```bash
npm run lint
```

### Formatting

```bash
npm run format
```

### Type Checking

TypeScript will automatically check types during development. For explicit checking:

```bash
npx tsc --noEmit
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start the Expo development server |
| `npm run ios` | Run on iOS simulator (macOS only) |
| `npm run android` | Run on Android emulator |
| `npm run web` | Run in web browser |
| `npm run prebuild` | Generate native iOS/Android projects |
| `npm run lint` | Run ESLint to check code quality |
| `npm run format` | Format code with Prettier |

## Tech Stack

- **Framework**: React Native 0.81.5
- **Runtime**: Expo SDK 54
- **Navigation**: Expo Router 6.0
- **Language**: TypeScript 5.9
- **Styling**: NativeWind (Tailwind CSS) 2.0
- **Animations**: React Native Reanimated 4.1
- **Icons**: Lucide React Native
- **State Management**: React Context API
- **Storage**: AsyncStorage

## Key Features

- 🤖 AI-powered chat interface
- 🎨 Light/Dark theme support
- 📱 Responsive design for iOS and Android
- 🖼️ Image and video generation
- 📁 Media library management
- ⚙️ Comprehensive settings
- 🔐 Authentication system
- 📝 Chat history

## Troubleshooting

### Common Issues

#### Metro Bundler Cache Issues

If you encounter module resolution errors:

```bash
npm start -- --clear
```

#### PostCSS Async Plugin Error

If you see "Use process(css).then(cb) to work with async plugins":

This error occurs because Tailwind CSS 3.3.3+ introduced async PostCSS plugins that are incompatible with NativeWind v2. The solution is to use Tailwind CSS 3.3.2:

1. **Downgrade Tailwind CSS:**
   ```bash
   npm uninstall tailwindcss
   npm install --save-dev tailwindcss@3.3.2
   ```

2. **Ensure `package.json` has the exact version (no caret):**
   ```json
   {
     "devDependencies": {
       "tailwindcss": "3.3.2"
     }
   }
   ```

3. **Clear caches and restart:**
   ```bash
   rm -rf node_modules/.cache .expo
   npm start -- --clear
   ```

4. **Ensure `postcss.config.js` only includes TailwindCSS:**
   ```js
   module.exports = {
     plugins: [
       require('tailwindcss'),
     ],
   };
   ```

#### iOS Build Issues

1. Clean build folder:
   ```bash
   cd ios
   rm -rf build
   pod deintegrate
   pod install
   cd ..
   ```

2. Reset iOS simulator:
   ```bash
   xcrun simctl erase all
   ```

#### Android Build Issues

1. Clean Gradle cache:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   ```

2. Clear Android build cache:
   ```bash
   rm -rf android/app/build
   ```

#### Node Modules Issues

If you encounter dependency issues:

```bash
rm -rf node_modules
rm package-lock.json
npm install
```

#### TypeScript Errors

If TypeScript shows errors after installation:

1. Ensure all dependencies are installed: `npm install`
2. Restart your IDE/editor
3. Check that `tsconfig.json` extends `expo/tsconfig.base`

#### Missing Asset Files Error

If you see "ENOENT: no such file or directory, open './assets/icon.png'":

1. **Ensure the assets directory exists:**
   ```bash
   mkdir -p assets
   ```

2. **Create placeholder images** (if missing):
   ```bash
   # Using Python PIL (if available)
   python3 -c "
   from PIL import Image
   import os
   os.makedirs('assets', exist_ok=True)
   Image.new('RGB', (1024, 1024), color='#f5f5f5').save('assets/icon.png')
   Image.new('RGB', (1024, 1024), color='#f5f5f5').save('assets/splash.png')
   Image.new('RGB', (1024, 1024), color='#f5f5f5').save('assets/adaptive-icon.png')
   print('Created placeholder images')
   "
   ```

3. **Or temporarily remove asset references from `app.json`** if you're just testing:
   ```json
   {
     "expo": {
       // Comment out or remove icon and splash temporarily
       // "icon": "./assets/icon.png",
       // "splash": { ... }
     }
   }
   ```

#### Port Already in Use

If port 8081 is already in use:

```bash
# Kill process on port 8081
lsof -ti:8081 | xargs kill -9
```

Or use a different port:
```bash
npm start -- --port 8082
```

#### React Native Reanimated Note

This app uses React Native's built-in `Animated` API for animations to ensure compatibility with Expo Go.

**Why?**
- React Native Reanimated requires native code that is not available in Expo Go
- The "runtime not ready" error occurs when using Reanimated in Expo Go
- To avoid this, `react-native-reanimated` has been removed from dependencies
- The `AnimatedSidebar` component uses React Native's `Animated` API instead

**If you need Reanimated features:**

1. Add `react-native-reanimated` back to `package.json`:
   ```bash
   npx expo install react-native-reanimated
   ```

2. Use a Development Build (required for Reanimated):
   ```bash
   # Install EAS CLI
   npm install -g eas-cli

   # Login to Expo
   eas login

   # Create development build
   eas build --profile development --platform ios
   # or
   eas build --profile development --platform android
   ```

3. Or use Local Development Build:
   ```bash
   npm run prebuild
   npm run ios  # or npm run android
   ```

**Note:** Expo Go does not support Reanimated's native runtime - use a development build for full Reanimated functionality.

### Getting Help

- Check [Expo Documentation](https://docs.expo.dev/)
- Review [React Native Documentation](https://reactnative.dev/docs/getting-started)
- Search [Expo Forums](https://forums.expo.dev/)
- Check [GitHub Issues](https://github.com/expo/expo/issues)

## Next Steps

1. **Set up your development environment** following the prerequisites
2. **Install dependencies** with `npm install`
3. **Start the development server** with `npm start`
4. **Run on your preferred platform** (iOS, Android, or Web)
5. **Explore the codebase** starting with `app/index.tsx`

## Contributing

When contributing to this project:

1. Create a feature branch from `main`
2. Make your changes
3. Run linting and formatting: `npm run lint && npm run format`
4. Test on both iOS and Android if possible
5. Submit a pull request

## License

[Add your license information here]

---

**Happy Coding! 🚀**

