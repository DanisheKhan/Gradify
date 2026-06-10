import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const MOCK_EXAMS_KEY = 'gradify_mock_exams';

const SEED_EXAMS = [
  {
    id: 'exam-1',
    name: 'Unit Test 1',
    class: '10',
    academic_year: '2024-25',
    exam_date: '2024-09-10',
    created_at: new Date().toISOString(),
    school_id: 'mock-school-id-123'
  },
  {
    id: 'exam-2',
    name: 'Final Exam',
    class: '10',
    academic_year: '2024-25',
    exam_date: '2025-03-15',
    created_at: new Date().toISOString(),
    school_id: 'mock-school-id-123'
  }
];

export const useExams = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getMockExams = useCallback(() => {
    const data = localStorage.getItem(MOCK_EXAMS_KEY);
    if (!data) {
      localStorage.setItem(MOCK_EXAMS_KEY, JSON.stringify(SEED_EXAMS));
      return SEED_EXAMS;
    }
    return JSON.parse(data);
  }, []);

  const getExams = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      if (supabase.isMock) {
        let exams = getMockExams();
        if (filters.class) {
          exams = exams.filter((e) => e.class === filters.class);
        }
        setLoading(false);
        return { data: exams, error: null };
      }

      let query = supabase
        .from('exams')
        .select('*')
        .eq('school_id', userProfile?.school_id);

      if (filters.class) {
        query = query.eq('class', filters.class);
      }

      const { data, error } = await query.order('exam_date', { ascending: false });
      if (error) throw error;
      setLoading(false);
      return { data, error: null };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { data: null, error: err };
    }
  }, [userProfile, getMockExams]);

  const createExam = useCallback(async (examData) => {
    setLoading(true);
    setError(null);
    try {
      if (supabase.isMock) {
        const exams = getMockExams();
        const newExam = {
          ...examData,
          id: `exam-${Date.now()}`,
          school_id: userProfile?.school_id || 'mock-school-id-123',
          created_at: new Date().toISOString()
        };
        exams.push(newExam);
        localStorage.setItem(MOCK_EXAMS_KEY, JSON.stringify(exams));
        setLoading(false);
        return { data: newExam, error: null };
      }

      const { data, error } = await supabase
        .from('exams')
        .insert([{ ...examData, school_id: userProfile?.school_id }])
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
  }, [userProfile, getMockExams]);

  const updateExam = useCallback(async (id, examData) => {
    setLoading(true);
    setError(null);
    try {
      if (supabase.isMock) {
        const exams = getMockExams();
        const idx = exams.findIndex((e) => e.id === id);
        if (idx === -1) throw new Error('Exam not found');

        const updated = { ...exams[idx], ...examData };
        exams[idx] = updated;
        localStorage.setItem(MOCK_EXAMS_KEY, JSON.stringify(exams));
        setLoading(false);
        return { data: updated, error: null };
      }

      const { data, error } = await supabase
        .from('exams')
        .update(examData)
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
  }, [userProfile, getMockExams]);

  const deleteExam = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      if (supabase.isMock) {
        const exams = getMockExams();
        const filtered = exams.filter((e) => e.id !== id);
        localStorage.setItem(MOCK_EXAMS_KEY, JSON.stringify(filtered));
        setLoading(false);
        return { error: null };
      }

      const { error } = await supabase
        .from('exams')
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
  }, [userProfile, getMockExams]);

  return { loading, error, getExams, createExam, updateExam, deleteExam };
};

export default useExams;
