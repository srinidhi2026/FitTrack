
// Gradient styles for light and dark themes
export const gradients = {
  primary: {
    light: 'bg-gradient-to-r from-blue-100 via-blue-50 to-white',
    dark: 'bg-gradient-to-r from-blue-900/50 via-blue-900/25 to-transparent'
  },
  secondary: {
    light: 'bg-gradient-to-r from-purple-100 via-purple-50 to-white',
    dark: 'bg-gradient-to-r from-purple-900/50 via-purple-900/25 to-transparent'
  },
  success: {
    light: 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700',
    dark: 'bg-gradient-to-r from-green-500 to-green-700 text-white hover:from-green-600 hover:to-green-800'
  },
  danger: {
    light: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700',
    dark: 'bg-gradient-to-r from-red-500 to-red-700 text-white hover:from-red-600 hover:to-red-800'
  },
  warning: {
    light: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700',
    dark: 'bg-gradient-to-r from-amber-500 to-amber-700 text-white hover:from-amber-600 hover:to-amber-800'
  },
  card: {
    light: 'bg-white dark:bg-transparent border border-gray-200 dark:border-gray-800',
    dark: 'bg-gray-900/50 backdrop-blur-sm border border-gray-800'
  },
  header: {
    light: 'bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100',
    dark: 'bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-900/50'
  }
};
