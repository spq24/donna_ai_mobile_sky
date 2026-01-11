---
name: Convert to Independent Expo App
overview: Convert donna_ai_mobile_sky from a nested sub-project into a fully independent Expo React Native app with Expo Router structure, local component implementations, and all necessary configuration files.
todos: []
---

# Convert donna_ai_mobile_sky to Independent Expo React Native App

## Overview

Transform `donna_ai_mobile_sky` from a nested sub-project that depends on `donna_ai_mobile` into a standalone Expo React Native app with its own dependencies, configuration, and component implementations.

## Architecture Changes

### Current State

- Depends on parent `donna_ai_mobile` for:
  - React/React Native dependencies (via parent node_modules)
  - Shared components (ThemedText, Icon, AnimatedView, etc.)
  - Contexts (AuthContext, ThemeContext)
  - Utilities (shadowPresets, etc.)
  - TypeScript configuration extends parent

### Target State

- Fully independent Expo app with:
  - Own `node_modules` and dependencies
  - Local component implementations
  - Expo Router structure (`app/` directory)
  - Complete Expo configuration
  - Independent TypeScript configuration

## Implementation Steps

### 1. Project Structure Setup

- Create `app/` directory for Expo Router
- Create `app/_layout.tsx` as root layout
- Create `app/index.tsx` as entry point (routes to chat-screen)
- Set up proper directory structure:
  ```
  donna_ai_mobile_sky/
  ├── app/
  │   ├── _layout.tsx
  │   └── index.tsx
  ├── components/ (existing)
  ├── settings/ (existing)
  ├── assets/ (new - for icons, splash, etc.)
  └── [existing files]
  ```


### 2. Configuration Files

#### package.json

- Add all required Expo dependencies from parent project
- Include: expo, expo-router, react-native-reanimated, nativewind, etc.
- Add scripts: start, android, ios, prebuild
- Set main entry to "expo-router/entry"

#### app.json

- Create Expo configuration file
- Set app name, slug, bundle identifiers
- Configure plugins (expo-router, expo-font, etc.)
- Set up iOS and Android configurations
- Configure splash screen and icons

#### tsconfig.json

- Remove dependency on parent tsconfig
- Extend "expo/tsconfig.base" directly
- Configure paths for local imports
- Remove typeRoots pointing to parent

#### babel.config.js

- Create Babel config with expo preset
- Include nativewind/babel plugin
- Include react-native-worklets/plugin

#### tailwind.config.js

- Copy from parent with updated content paths
- Include app/ directory in content paths
- Keep theme colors (light/dark)

#### metro.config.js

- Create Metro bundler configuration
- Configure for Expo

#### postcss.config.js

- Create PostCSS config for NativeWind

### 3. Local Component Implementations

Create local versions of shared components in `components/shared/`:

#### components/shared/AnimatedView.tsx

- Copy from parent `donna_ai_mobile/components/AnimatedView.tsx`
- Adapt imports to use local components

#### components/shared/ThemedText.tsx

- Copy from parent `donna_ai_mobile/components/ThemedText.tsx`
- Ensure NativeWind styling support

#### components/shared/Icon.tsx

- Copy from parent `donna_ai_mobile/components/Icon.tsx`
- Use @expo/vector-icons

#### components/shared/ThemeScroller.tsx

- Copy from parent `donna_ai_mobile/components/ThemeScroller.tsx`
- Adapt for local use

#### components/shared/Chip.tsx

- Copy from parent `donna_ai_mobile/components/Chip.tsx`
- Adapt styling

#### components/shared/Avatar.tsx

- Copy from parent `donna_ai_mobile/components/Avatar.tsx`

### 4. Context Implementations

#### app/contexts/AuthContext.tsx

- Create simplified AuthContext
- Remove dependency on parent's storage/api-client
- Use AsyncStorage for local storage
- Provide mock authentication for now (can be connected to API later)

#### app/contexts/ThemeContext.tsx

- Copy from parent `donna_ai_mobile/app/contexts/ThemeContext.tsx`
- Ensure it works independently

#### app/contexts/ThemeColors.tsx

- Copy from parent `donna_ai_mobile/app/contexts/ThemeColors.tsx`

### 5. Utility Files

#### utils/useShadow.ts

- Copy from parent `donna_ai_mobile/utils/useShadow.ts`
- Export shadowPresets

### 6. Update All Imports

Update all files in `donna_ai_mobile_sky` to use local imports:

#### Files to Update (36 files found):

- `chat-screen.tsx`: Update imports for AnimatedView, ThemedScroller, ThemedText, Icon, useAuth
- All component files in `components/`
- All settings files in `settings/`
- `chat-history-screen.tsx`
- `media-screen.tsx`
- `settings-screen.tsx`
- `home-screen.tsx`

Change pattern:

```typescript
// Before
import ThemedText from '../donna_ai_mobile/components/ThemedText';
import { useAuth } from '../donna_ai_mobile/app/contexts/AuthContext';

// After
import ThemedText from './components/shared/ThemedText';
import { useAuth } from './app/contexts/AuthContext';
```

### 7. Expo Router Setup

#### app/_layout.tsx

- Create root layout with ThemeProvider and AuthProvider
- Set up SafeAreaProvider
- Configure navigation structure
- Handle initial route

#### app/index.tsx

- Create entry screen that renders ChatScreen component
- Or redirect to chat-screen route

### 8. Assets Setup

- Create `assets/` directory
- Add placeholder icon.png and splash.png
- Configure in app.json

### 9. Dependencies Installation

After all files are created:

- Run `npm install` to install all dependencies
- This will create `node_modules/` locally

### 10. TypeScript & Linting

- Ensure all TypeScript errors are resolved
- Update import paths throughout
- Verify no references to parent project remain

## Files to Create

1. `app/_layout.tsx` - Root layout
2. `app/index.tsx` - Entry point
3. `app/contexts/AuthContext.tsx` - Auth context
4. `app/contexts/ThemeContext.tsx` - Theme context
5. `app/contexts/ThemeColors.tsx` - Theme colors
6. `components/shared/AnimatedView.tsx` - Animated view component
7. `components/shared/ThemedText.tsx` - Themed text component
8. `components/shared/Icon.tsx` - Icon component
9. `components/shared/ThemeScroller.tsx` - Themed scroller
10. `components/shared/Chip.tsx` - Chip component
11. `components/shared/Avatar.tsx` - Avatar component
12. `utils/useShadow.ts` - Shadow utilities
13. `app.json` - Expo configuration
14. `babel.config.js` - Babel configuration
15. `metro.config.js` - Metro configuration
16. `postcss.config.js` - PostCSS configuration
17. `package.json` - Updated with all dependencies
18. `tsconfig.json` - Independent TypeScript config
19. `tailwind.config.js` - Updated Tailwind config
20. `assets/icon.png` - App icon (placeholder)
21. `assets/splash.png` - Splash screen (placeholder)

## Files to Update

- All 36 files with imports from parent project
- Update import paths to use local components and contexts

## Testing Checklist

- [ ] App starts with `expo start`
- [ ] No TypeScript errors
- [ ] All screens render correctly
- [ ] Theme switching works
- [ ] Navigation works
- [ ] No runtime errors
- [ ] All imports resolve correctly