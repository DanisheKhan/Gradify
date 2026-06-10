import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const MOCK_STUDENTS_KEY = 'gradify_mock_students';

const SEED_STUDENTS = [
  {
    id: 'student-1',
    name: 'Danish Khan',
    roll_number: '101',
    class: '10',
    section: 'A',
    photo_url: '',
    date_of_birth: '2010-05-14',
    parent_name: 'Imran Khan',
    contact_number: '9876543210',
    address: 'Mumbai, India',
    created_at: new Date().toISOString(),
    school_id: 'mock-school-id-123',
    user_id: 'mock-user-uuid-student' // Map to mock student auth email
  },
  {
    id: 'student-2',
    name: 'Aanya Sharma',
    roll_number: '102',
    class: '10',
    section: 'A',
    photo_url: '',
    date_of_birth: '2010-08-22',
    parent_name: 'Rajesh Sharma',
    contact_number: '9876543211',
    address: 'Pune, India',
    created_at: new Date().toISOString(),
    school_id: 'mock-school-id-123'
  },
  {
    id: 'student-3',
    name: 'Zainab Fatima',
    roll_number: '103',
    class: '10',
    section: 'B',
    photo_url: '',
    date_of_birth: '2009-12-05',
    parent_name: 'Sajid Ali',
    contact_number: '9876543212',
    address: 'Hyderabad, India',
    created_at: new Date().toISOString(),
    school_id: 'mock-school-id-123'
  }
];

export const useStudents = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getMockStudents = useCallback(() => {
    const data = localStorage.getItem(MOCK_STUDENTS_KEY);
    if (!data) {
      localStorage.setItem(MOCK_STUDENTS_KEY, JSON.stringify(SEED_STUDENTS));
      return SEED_STUDENTS;
    }
    return JSON.parse(data);
  }, []);

  const getStudents = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      if (supabase.isMock) {
        let students = getMockStudents();
        if (filters.class) {
          students = students.filter((s) => s.class === filters.class);
        }
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          students = students.filter(
            (s) => s.name.toLowerCase().includes(searchLower) || s.roll_number.includes(searchLower)
          );
        }
        setLoading(false);
        return { data: students, error: null };
      }

      let query = supabase
        .from('students')
        .select('*')
        .eq('school_id', userProfile?.school_id);

      if (filters.class) {
        query = query.eq('class', filters.class);
      }
      if (filters.search) {
        query = query.or(`name.ilike.%${filters.search}%,roll_number.ilike.%${filters.search}%`);
      }

      const { data, error } = await query.order('roll_number', { ascending: true });
      if (error) throw error;
      setLoading(false);
      return { data, error: null };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { data: null, error: err };
    }
  }, [userProfile, getMockStudents]);

  const getStudent = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      if (supabase.isMock) {
        const students = getMockStudents();
        const student = students.find((s) => s.id === id);
        setLoading(false);
        return { data: student || null, error: student ? null : new Error('Student not found') };
      }

      const { data, error } = await supabase
        .from('students')
        .select('*')
        .eq('id', id)
        .eq('school_id', userProfile?.school_id)
        .single();
      
      if (error) throw error;
      setLoading(false);
      return { data, error: null };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { data: null, error: err };
    }
  }, [userProfile, getMockStudents]);

  const createStudent = useCallback(async (studentData) => {
    setLoading(true);
    setError(null);
    try {
      if (supabase.isMock) {
        const students = getMockStudents();
        const newStudent = {
          ...studentData,
          id: `student-${Date.now()}`,
          school_id: userProfile?.school_id || 'mock-school-id-123',
          created_at: new Date().toISOString()
        };
        
        // Ensure roll number unique in mock
        if (students.some((s) => s.roll_number === studentData.roll_number && s.school_id === newStudent.school_id)) {
          throw new Error('Roll number must be unique.');
        }

        students.push(newStudent);
        localStorage.setItem(MOCK_STUDENTS_KEY, JSON.stringify(students));
        setLoading(false);
        return { data: newStudent, error: null };
      }

      const { data, error } = await supabase
        .from('students')
        .insert([{
          ...studentData,
          school_id: userProfile?.school_id
        }])
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
  }, [userProfile, getMockStudents]);

  const updateStudent = useCallback(async (id, studentData) => {
    setLoading(true);
    setError(null);
    try {
      if (supabase.isMock) {
        const students = getMockStudents();
        const idx = students.findIndex((s) => s.id === id);
        if (idx === -1) throw new Error('Student not found');

        const updatedStudent = { ...students[idx], ...studentData };
        students[idx] = updatedStudent;
        localStorage.setItem(MOCK_STUDENTS_KEY, JSON.stringify(students));
        setLoading(false);
        return { data: updatedStudent, error: null };
      }

      const { data, error } = await supabase
        .from('students')
        .update(studentData)
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
  }, [userProfile, getMockStudents]);

  const deleteStudent = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      if (supabase.isMock) {
        const students = getMockStudents();
        const filtered = students.filter((s) => s.id !== id);
        localStorage.setItem(MOCK_STUDENTS_KEY, JSON.stringify(filtered));
        setLoading(false);
        return { error: null };
      }

      const { error } = await supabase
        .from('students')
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
  }, [userProfile, getMockStudents]);

  return { loading, error, getStudents, getStudent, createStudent, updateStudent, deleteStudent };
};

export default useStudents;
