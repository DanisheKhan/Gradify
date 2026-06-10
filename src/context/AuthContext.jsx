import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper to fetch user profile from custom 'users' table
  const fetchProfile = async (userId) => {
    try {
      if (supabase.isMock) {
        // Mock profile
        const isStudent = localStorage.getItem('mock_role') === 'student';
        return {
          id: userId,
          role: isStudent ? 'student' : 'admin',
          school_id: 'mock-school-id-123',
          created_at: new Date().toISOString()
        };
      }
      const { data, error } = await supabase
        .from('users')
        .select('*, schools(name, logo_url, address)')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching user profile:', err);
      return null;
    }
  };

  useEffect(() => {
    let unsubscribe = () => {};

    const initializeAuth = async () => {
      try {
        if (supabase.isMock) {
          const storedSession = localStorage.getItem('mock_session');
          if (storedSession) {
            const parsed = JSON.parse(storedSession);
            setUser(parsed.user);
            const profile = await fetchProfile(parsed.user.id);
            setUserProfile(profile);
          }
          setLoading(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          const profile = await fetchProfile(session.user.id);
          setUserProfile(profile);
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          if (currentSession?.user) {
            setUser(currentSession.user);
            const profile = await fetchProfile(currentSession.user.id);
            setUserProfile(profile);
          } else {
            setUser(null);
            setUserProfile(null);
          }
          setLoading(false);
        });

        unsubscribe = subscription.unsubscribe;
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      if (supabase.isMock) {
        // Mock authentication
        let role = 'admin';
        let name = 'Principal Administrator';
        if (email.toLowerCase().includes('student')) {
          role = 'student';
          name = 'Danish Khan (Student)';
        }

        const mockUser = {
          id: `mock-user-uuid-${role}`,
          email: email,
          user_metadata: { name }
        };
        const mockSession = { user: mockUser };
        
        localStorage.setItem('mock_session', JSON.stringify(mockSession));
        localStorage.setItem('mock_role', role);

        setUser(mockUser);
        const profile = await fetchProfile(mockUser.id);
        setUserProfile(profile);
        setLoading(false);
        return { data: { user: mockUser }, error: null };
      }

      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { data, error: null };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { data: null, error: err };
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      if (supabase.isMock) {
        localStorage.removeItem('mock_session');
        localStorage.removeItem('mock_role');
        setUser(null);
        setUserProfile(null);
        setLoading(false);
        return { error: null };
      }

      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      setUserProfile(null);
      setLoading(false);
      return { error: null };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { error: err };
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, error, signIn, signOut, isMock: supabase.isMock }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
