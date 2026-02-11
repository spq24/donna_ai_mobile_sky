/** @type {import('tailwindcss').Config} */
module.exports = {
  presets: [require("nativewind/preset")],
  content: [
    "./app/**/*.{js,ts,tsx}",
    "./components/**/*.{js,ts,tsx}",
    "./**/*.{js,ts,tsx}",
    "./global.css",
  ],
  theme: {
    extend: {
      fontFamily: {
        'outfit': ['Outfit_400Regular'],
        'outfit-bold': ['Outfit_700Bold'],
      },
      spacing: {
        global: '16px'
      },
      colors: {
        // ShadCN token names – light theme (default)
        background: '#ffffff',
        foreground: '#151515',
        muted: '#f7f7f7',
        'muted-foreground': '#62646a',
        accent: '#ecedee',
        primary: '#151515',
        'primary-foreground': '#ffffff',
        border: '#ecedee',
        destructive: '#dc2626',
        'destructive-foreground': '#ffffff',
        highlight: '#0EA5E9',
        // Dark theme (use with dark: prefix)
        darkBackground: '#151515',
        darkForeground: '#ffffff',
        darkMuted: '#1d1d1d',
        darkMutedForeground: '#d7d8da',
        darkAccent: '#3b3c40',
        darkPrimary: '#1d1d1d',
        darkPrimaryForeground: '#ffffff',
        darkBorder: '#27282a',
        darkDestructive: '#dc2626',
        darkDestructiveForeground: '#ffffff',
      },
    },
  },
  plugins: [],
};
