
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, AuthState } from '@/types/user';
import { useToast } from '@/components/ui/use-toast';

// Mock user data for demonstration
const MOCK_USERS = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123', // In a real app, store hashed passwords only on backend
    weightInKg: 80,
    goalType: 'muscle' as const,
    workoutStreak: 7,
    completedWorkouts: 21,
    createdAt: new Date('2023-01-15')
  }
];

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUserWeight: (weight: number) => void;
  updateUserGoal: (goal: User['goalType']) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('fittrack_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setAuthState({
          user: {
            ...parsedUser,
            createdAt: new Date(parsedUser.createdAt)
          },
          isAuthenticated: true,
          isLoading: false
        });
      } catch (error) {
        console.error('Failed to parse stored user data', error);
        localStorage.removeItem('fittrack_user');
        setAuthState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      setAuthState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulate API call
    const user = MOCK_USERS.find(u => u.email === email && u.password === password);
    
    if (user) {
      // Clone the user object without the password
      const { password, ...safeUser } = user;
      
      setAuthState({
        user: safeUser,
        isAuthenticated: true,
        isLoading: false
      });
      
      // Store user in localStorage
      localStorage.setItem('fittrack_user', JSON.stringify(safeUser));
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${safeUser.name}!`,
      });
      
      return true;
    } else {
      toast({
        title: "Login failed",
        description: "Invalid email or password",
        variant: "destructive",
      });
      
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    // Check if email already exists
    const existingUser = MOCK_USERS.find(u => u.email === email);
    
    if (existingUser) {
      toast({
        title: "Signup failed",
        description: "Email already in use",
        variant: "destructive",
      });
      return false;
    }
    
    // Create new user
    const newUser = {
      id: `${MOCK_USERS.length + 1}`,
      name,
      email,
      password,
      weightInKg: 70, // Default weight
      goalType: 'muscle' as const, // Default goal
      workoutStreak: 0,
      completedWorkouts: 0,
      createdAt: new Date()
    };
    
    // In a real app, we'd send this to an API
    MOCK_USERS.push(newUser);
    
    // Login the new user
    const { password: _, ...safeUser } = newUser;
    
    setAuthState({
      user: safeUser,
      isAuthenticated: true,
      isLoading: false
    });
    
    // Store user in localStorage
    localStorage.setItem('fittrack_user', JSON.stringify(safeUser));
    
    toast({
      title: "Welcome to FitTrack Pro!",
      description: "Your account has been created successfully.",
    });
    
    return true;
  };

  const logout = () => {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false
    });
    
    localStorage.removeItem('fittrack_user');
    navigate('/login');
    
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
  };

  const updateUserWeight = (weight: number) => {
    if (!authState.user) return;
    
    const updatedUser = {
      ...authState.user,
      weightInKg: weight
    };
    
    setAuthState({
      ...authState,
      user: updatedUser
    });
    
    localStorage.setItem('fittrack_user', JSON.stringify(updatedUser));
    
    toast({
      title: "Weight updated",
      description: `Your weight has been updated to ${weight} kg.`,
    });
  };

  const updateUserGoal = (goal: User['goalType']) => {
    if (!authState.user) return;
    
    const updatedUser = {
      ...authState.user,
      goalType: goal
    };
    
    setAuthState({
      ...authState,
      user: updatedUser
    });
    
    localStorage.setItem('fittrack_user', JSON.stringify(updatedUser));
    
    toast({
      title: "Goal updated",
      description: `Your fitness goal has been updated.`,
    });
  };

  const value = {
    ...authState,
    login,
    signup,
    logout,
    updateUserWeight,
    updateUserGoal
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
