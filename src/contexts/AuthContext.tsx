
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, AuthState } from '@/types/user';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  signup: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUserWeight: (weight: number) => Promise<void>;
  updateUserGoal: (goal: User['goalType']) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });
  
  const [session, setSession] = useState<Session | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize auth state and set up listener
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        
        if (currentSession?.user) {
          // We have a session, fetch the user profile data
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id);
          }, 0);
        } else {
          // No session, reset auth state
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false
          });
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
        return;
      }

      if (data) {
        const user: User = {
          id: data.id,
          name: data.name,
          email: data.email,
          weightInKg: data.weight_kg,
          goalType: data.goal_type,
          workoutStreak: data.workout_streak,
          completedWorkouts: data.completed_workouts,
          createdAt: new Date(data.created_at)
        };

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false
        });
      } else {
        // Profile not found for this user
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Error in profile fetch:', error);
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Login successful",
        description: `Welcome back!`,
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
      return false;
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });

      if (error) {
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Welcome to FitTrack!",
        description: "Your account has been created successfully.",
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "An error occurred during signup",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
      
      navigate('/login');
      
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message || "An error occurred during logout",
        variant: "destructive",
      });
    }
  };

  const updateUserWeight = async (weight: number) => {
    if (!authState.user) return;
    
    try {
      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({ weight_kg: weight })
        .eq('id', authState.user.id);
      
      if (error) throw error;
      
      // Record weight in history
      await supabase
        .from('weight_history')
        .insert({ user_id: authState.user.id, weight_kg: weight });
      
      // Update local state
      const updatedUser = {
        ...authState.user,
        weightInKg: weight
      };
      
      setAuthState({
        ...authState,
        user: updatedUser
      });
      
      toast({
        title: "Weight updated",
        description: `Your weight has been updated to ${weight} kg.`,
      });
    } catch (error: any) {
      console.error('Error updating weight:', error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update weight",
        variant: "destructive",
      });
    }
  };

  const updateUserGoal = async (goal: User['goalType']) => {
    if (!authState.user) return;
    
    try {
      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({ goal_type: goal })
        .eq('id', authState.user.id);
      
      if (error) throw error;
      
      // Update local state
      const updatedUser = {
        ...authState.user,
        goalType: goal
      };
      
      setAuthState({
        ...authState,
        user: updatedUser
      });
      
      toast({
        title: "Goal updated",
        description: `Your fitness goal has been updated.`,
      });
    } catch (error: any) {
      console.error('Error updating goal:', error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update goal",
        variant: "destructive",
      });
    }
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
