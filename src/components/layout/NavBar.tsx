
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, User, Dumbbell, Apple, ChartLine } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const NavBar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Dashboard', icon: <User size={20} /> },
    { path: '/workouts', label: 'Workouts', icon: <Dumbbell size={20} /> },
    { path: '/nutrition', label: 'Nutrition', icon: <Apple size={20} /> },
    { path: '/progress', label: 'Progress', icon: <ChartLine size={20} /> },
  ];

  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link 
              to="/" 
              className="flex-shrink-0 flex items-center"
            >
              <Dumbbell className="h-8 w-8 text-primary mr-2" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">FitTrack</span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1',
                  isActive(item.path) 
                    ? 'bg-primary text-white' 
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}

            <div className="flex items-center space-x-2 ml-4 border-l pl-4 border-gray-200 dark:border-gray-700">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {theme === 'dark' ? 'Dark' : 'Light'}
              </span>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              />
            </div>

            <Button
              onClick={logout}
              variant="outline"
              className="ml-4"
            >
              Logout
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 dark:text-gray-300"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'block px-3 py-2 rounded-md text-base font-medium flex items-center',
                  isActive(item.path) 
                    ? 'bg-primary text-white' 
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                )}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.icon}
                <span className="ml-2">{item.label}</span>
              </Link>
            ))}
            
            <div className="flex items-center justify-between px-3 py-2">
              <span className="text-gray-600 dark:text-gray-300">
                {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
              </span>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              />
            </div>
            
            <Button
              onClick={logout}
              variant="outline"
              className="w-full mt-2"
            >
              Logout
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
