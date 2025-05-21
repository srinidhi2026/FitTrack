
// Interactive gradient styles for the application
export const gradients = {
  primary: {
    light: 'bg-gradient-to-r from-blue-400 to-indigo-500 hover:from-blue-500 hover:to-indigo-600',
    dark: 'bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800',
  },
  secondary: {
    light: 'bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-500 hover:to-emerald-600',
    dark: 'bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-700 hover:to-emerald-800',
  },
  accent: {
    light: 'bg-gradient-to-r from-violet-400 to-purple-500 hover:from-violet-500 hover:to-purple-600',
    dark: 'bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800',
  },
  success: {
    light: 'bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600',
    dark: 'bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800',
  },
  error: {
    light: 'bg-gradient-to-r from-red-400 to-rose-500 hover:from-red-500 hover:to-rose-600', 
    dark: 'bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800',
  },
  warning: {
    light: 'bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600',
    dark: 'bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800',
  },
  card: {
    light: 'bg-gradient-to-br from-white to-gray-50',
    dark: 'bg-gradient-to-br from-gray-800 to-gray-900',
  },
  header: {
    light: 'bg-gradient-to-r from-blue-50 to-indigo-50',
    dark: 'bg-gradient-to-r from-gray-900 to-indigo-950',
  }
};

// Interactive hover effects for elements
export const hoverEffects = {
  lift: 'transition-transform duration-200 hover:-translate-y-1',
  glow: {
    light: 'transition-all duration-200 hover:shadow-lg hover:shadow-blue-200/50',
    dark: 'transition-all duration-200 hover:shadow-lg hover:shadow-indigo-500/20'
  },
  scale: 'transition-transform duration-200 hover:scale-105',
};
