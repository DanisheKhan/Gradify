import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const MOCK_SUBJECTS_KEY = 'gradify_mock_subjects';

const SEED_SUBJECTS = [
  { id: 'sub-1', name: 'Mathematics', class: '10', max_marks: 100, pass_marks: 35, school_id: 'mock-school-id-123' },
  { id: 'sub-2', name: 'Science', class: '10', max_marks: 100, pass_marks: 35, school_id: 'mock-school-id-123' },
  { id: 'sub-3', name: 'English', class: '10', max_marks: 100, pass_marks: 35, school_id: 'mock-school-id-123' },
  { id: 'sub-4', name: 'Hindi', class: '10', max_marks: 100, pass_marks: 35, school_id: 'mock-school-id-123' },
  { id: 'sub-5', name: 'Social Studies', class: '10', max_marks: 100, pass_marks: 35, school_id: 'mock-school-id-123' }
];

export const useSubjects = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getMockSubjects = useCallback(() => {
    const data = localStorage.getItem(MOCK_SUBJECTS_KEY);
    if (!data) {
      localStorage.setItem(MOCK_SUBJECTS_KEY, JSON.stringify(SEED_SUBJECTS));
      return SEED_SUBJECTS;
    }
    return JSON.parse(data);
  }, []);

  const getSubjects = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      if (supabase.isMock) {
        let subjects = getMockSubjects();
        if (filters.class) {
          subjects = subjects.filter((s) => s.class === filters.class);
        }
        setLoading(false);
        return { data: subjects, error: null };
      }

      let query = supabase
        .from('subjects')
        .select('*')
        .eq('school_id', userProfile?.school_id);

      if (filters.class) {
        query = query.eq('class', filters.class);
      }

      const { data, error } = await query.order('name', { ascending: true });
      if (error) throw error;
      setLoading(false);
      return { data, error: null };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { data: null, error: err };
    }
  }, [userProfile, getMockSubjects]);

  const createSubject = useCallback(async (subjectData) => {
    setLoading(true);
    setError(null);
    try {
      if (supabase.isMock) {
        const subjects = getMockSubjects();
        const newSubject = {
          ...subjectData,
          id: `sub-${Date.now()}`,
          school_id: userProfile?.school_id || 'mock-school-id-123',
          created_at: new Date().toISOString()
        };
        subjects.push(newSubject);
        localStorage.setItem(MOCK_SUBJECTS_KEY, JSON.stringify(subjects));
        setLoading(false);
        return { data: newSubject, error: null };
      }

      const { data, error } = await supabase
        .from('subjects')
        .insert([{ ...subjectData, school_id: userProfile?.school_id }])
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
  }, [userProfile, getMockSubjects]);

  const updateSubject = useCallback(async (id, subjectData) => {
    setLoading(true);
    setError(null);
    try {
      if (supabase.isMock) {
        const subjects = getMockSubjects();
        const idx = subjects.findIndex((s) => s.id === id);
        if (idx === -1) throw new Error('Subject not found');

        const updated = { ...subjects[idx], ...subjectData };
        subjects[idx] = updated;
        localStorage.setItem(MOCK_SUBJECTS_KEY, JSON.stringify(subjects));
        setLoading(false);
        return { data: updated, error: null };
      }

      const { data, error } = await supabase
        .from('subjects')
        .update(subjectData)
        .eq('id', id)
        .eq('school_id', userProfile?.school_id)
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
  }, [userProfile, getMockSubjects]);

  const deleteSubject = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      if (supabase.isMock) {
        const subjects = getMockSubjects();
        const filtered = subjects.filter((s) => s.id !== id);
        localStorage.setItem(MOCK_SUBJECTS_KEY, JSON.stringify(filtered));
        setLoading(false);
        return { error: null };
      }

      const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id)
        .eq('school_id', userProfile?.school_id);

      if (error) throw error;
      setLoading(false);
      return { error: null };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { error: err };
    }
  }, [userProfile, getMockSubjects]);

  return { loading, error, getSubjects, createSubject, updateSubject, deleteSubject };
};

export default useSubjects;
