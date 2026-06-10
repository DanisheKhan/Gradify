import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const MOCK_SCHOOL_KEY = 'gradify_mock_school';

const DEFAULT_SCHOOL = {
  id: 'mock-school-id-123',
  name: 'Gradify Academy of Education',
  logo_url: '',
  address: '123 Knowledge Park, Vashi, Navi Mumbai, India',
  created_at: new Date().toISOString()
};

export const useSchool = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getMockSchool = useCallback(() => {
    const data = localStorage.getItem(MOCK_SCHOOL_KEY);
    if (!data) {
      localStorage.setItem(MOCK_SCHOOL_KEY, JSON.stringify(DEFAULT_SCHOOL));
      return DEFAULT_SCHOOL;
    }
    return JSON.parse(data);
  }, []);

  const getSchool = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (supabase.isMock) {
        const school = getMockSchool();
        setLoading(false);
        return { data: school, error: null };
      }

      if (!userProfile?.school_id) {
        throw new Error('School ID not found in user session.');
      }

      const { data, error } = await supabase
        .from('schools')
        .select('*')
        .eq('id', userProfile.school_id)
        .single();
      
      if (error) throw error;
      setLoading(false);
      return { data, error: null };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { data: null, error: err };
    }
  }, [userProfile, getMockSchool]);

  const updateSchool = useCallback(async (schoolData) => {
    setLoading(true);
    setError(null);
    try {
      if (supabase.isMock) {
        const school = getMockSchool();
        const updated = { ...school, ...schoolData };
        localStorage.setItem(MOCK_SCHOOL_KEY, JSON.stringify(updated));
        
        // Update local session state if active
        const session = localStorage.getItem('mock_session');
        if (session) {
          // If we have profile inside, we might need updates, but it's fine since we fetch dynamically
        }

        setLoading(false);
        return { data: updated, error: null };
      }

      const { data, error } = await supabase
        .from('schools')
        .update(schoolData)
        .eq('id', userProfile?.school_id)
        .select()
        .single();

      if (error) throw error;
      setLoading(false);
      return { data, error: null };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { data: null, error: err };
    }
  }, [userProfile, getMockSchool]);

  const uploadLogo = useCallback(async (file) => {
    setLoading(true);
    setError(null);
    try {
      if (supabase.isMock) {
        // Mock upload: Convert file to Base64 and store/return
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({ publicUrl: reader.result, error: null });
            setLoading(false);
          };
          reader.readAsDataURL(file);
        });
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${userProfile?.school_id || 'logo'}-${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath);

      setLoading(false);
      return { publicUrl, error: null };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { publicUrl: null, error: err };
    }
  }, [userProfile]);

  return { loading, error, getSchool, updateSchool, uploadLogo };
};

export default useSchool;
