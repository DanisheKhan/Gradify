import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { calculateGrade } from '../utils/gradeCalc';

const MOCK_MARKS_KEY = 'gradify_mock_marks';

const SEED_MARKS = [
  // Student 1 (Danish Khan) - Exam 1 (Unit Test 1)
  { id: 'm-1-1', student_id: 'student-1', exam_id: 'exam-1', subject_id: 'sub-1', marks_obtained: 85, grade: 'A', remarks: 'Good job' },
  { id: 'm-1-2', student_id: 'student-1', exam_id: 'exam-1', subject_id: 'sub-2', marks_obtained: 90, grade: 'A+', remarks: 'Excellent' },
  { id: 'm-1-3', student_id: 'student-1', exam_id: 'exam-1', subject_id: 'sub-3', marks_obtained: 78, grade: 'A', remarks: 'Good' },
  { id: 'm-1-4', student_id: 'student-1', exam_id: 'exam-1', subject_id: 'sub-4', marks_obtained: 82, grade: 'A', remarks: 'Good' },
  { id: 'm-1-5', student_id: 'student-1', exam_id: 'exam-1', subject_id: 'sub-5', marks_obtained: 88, grade: 'A', remarks: 'Well done' },

  // Student 1 (Danish Khan) - Exam 2 (Final Exam)
  { id: 'm-2-1', student_id: 'student-1', exam_id: 'exam-2', subject_id: 'sub-1', marks_obtained: 92, grade: 'A+', remarks: 'Brilliant' },
  { id: 'm-2-2', student_id: 'student-1', exam_id: 'exam-2', subject_id: 'sub-2', marks_obtained: 89, grade: 'A', remarks: 'Very Good' },
  { id: 'm-2-3', student_id: 'student-1', exam_id: 'exam-2', subject_id: 'sub-3', marks_obtained: 85, grade: 'A', remarks: 'Great' },
  { id: 'm-2-4', student_id: 'student-1', exam_id: 'exam-2', subject_id: 'sub-4', marks_obtained: 88, grade: 'A', remarks: 'Very Good' },
  { id: 'm-2-5', student_id: 'student-1', exam_id: 'exam-2', subject_id: 'sub-5', marks_obtained: 91, grade: 'A+', remarks: 'Outstanding' },

  // Student 2 (Aanya Sharma) - Exam 1 (Unit Test 1) - One subject fail to test FAIL/COMPARTMENT result
  { id: 'm-3-1', student_id: 'student-2', exam_id: 'exam-1', subject_id: 'sub-1', marks_obtained: 32, grade: 'F', remarks: 'Needs Improvement' },
  { id: 'm-3-2', student_id: 'student-2', exam_id: 'exam-1', subject_id: 'sub-2', marks_obtained: 55, grade: 'C', remarks: 'Average' },
  { id: 'm-3-3', student_id: 'student-2', exam_id: 'exam-1', subject_id: 'sub-3', marks_obtained: 62, grade: 'B', remarks: 'Good' },
  { id: 'm-3-4', student_id: 'student-2', exam_id: 'exam-1', subject_id: 'sub-4', marks_obtained: 48, grade: 'C', remarks: 'Average' },
  { id: 'm-3-5', student_id: 'student-2', exam_id: 'exam-1', subject_id: 'sub-5', marks_obtained: 50, grade: 'C', remarks: 'Average' }
];

// Module-level caches to prevent reloading flashes when switching tabs
let cachedMarksByExamClass = {};
let cachedMarksByStudent = {};

export const useMarks = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getMockMarks = useCallback(() => {
    const data = localStorage.getItem(MOCK_MARKS_KEY);
    if (!data) {
      localStorage.setItem(MOCK_MARKS_KEY, JSON.stringify(SEED_MARKS));
      return SEED_MARKS;
    }
    return JSON.parse(data);
  }, []);

  const getMarksByExamAndClass = useCallback(async (examId, className) => {
    const cacheKey = `${examId}-${className}`;
    if (cachedMarksByExamClass[cacheKey]) {
      return { data: cachedMarksByExamClass[cacheKey], error: null };
    }

    setLoading(true);
    setError(null);
    try {
      let data;
      if (supabase.isMock) {
        const marks = getMockMarks();
        // Return only marks matching the examId
        const filtered = marks.filter((m) => m.exam_id === examId);
        data = filtered;
      } else {
        // Query database
        const { data: dbData, error } = await supabase
          .from('marks')
          .select(`
            *,
            students!inner(id, name, roll_number, class, school_id)
          `)
          .eq('exam_id', examId)
          .eq('students.class', className)
          .eq('students.school_id', userProfile?.school_id);
        
        if (error) throw error;
        data = dbData;
      }

      cachedMarksByExamClass[cacheKey] = data;
      setLoading(false);
      return { data, error: null };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { data: null, error: err };
    }
  }, [userProfile, getMockMarks]);

  const upsertMarks = useCallback(async (marksArray) => {
    setLoading(true);
    setError(null);
    try {
      // Invalidate caches
      cachedMarksByExamClass = {};
      cachedMarksByStudent = {};

      if (supabase.isMock) {
        const currentMarks = getMockMarks();
        const updatedMarks = [...currentMarks];

        marksArray.forEach((newMark) => {
          const idx = updatedMarks.findIndex(
            (m) =>
              m.student_id === newMark.student_id &&
              m.exam_id === newMark.exam_id &&
              m.subject_id === newMark.subject_id
          );

          const computedGrade = calculateGrade(newMark.marks_obtained, 100); // Default to max 100 in mock

          if (idx !== -1) {
            updatedMarks[idx] = {
              ...updatedMarks[idx],
              marks_obtained: Number(newMark.marks_obtained),
              grade: computedGrade,
              remarks: newMark.remarks || ''
            };
          } else {
            updatedMarks.push({
              id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              student_id: newMark.student_id,
              exam_id: newMark.exam_id,
              subject_id: newMark.subject_id,
              marks_obtained: Number(newMark.marks_obtained),
              grade: computedGrade,
              remarks: newMark.remarks || '',
              created_at: new Date().toISOString()
            });
          }
        });

        localStorage.setItem(MOCK_MARKS_KEY, JSON.stringify(updatedMarks));
        setLoading(false);
        return { data: marksArray, error: null };
      }

      const { data, error } = await supabase
        .from('marks')
        .upsert(marksArray, { onConflict: 'student_id,exam_id,subject_id' });

      if (error) throw error;
      setLoading(false);
      return { data, error: null };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { data: null, error: err };
    }
  }, [getMockMarks]);

  const getMarksByStudent = useCallback(async (studentId) => {
    if (cachedMarksByStudent[studentId]) {
      return { data: cachedMarksByStudent[studentId], error: null };
    }

    setLoading(true);
    setError(null);
    try {
      let data;
      if (supabase.isMock) {
        const marks = getMockMarks();
        const filtered = marks.filter((m) => m.student_id === studentId);
        data = filtered;
      } else {
        const { data: dbData, error } = await supabase
          .from('marks')
          .select('*')
          .eq('student_id', studentId);
        
        if (error) throw error;
        data = dbData;
      }

      cachedMarksByStudent[studentId] = data;
      setLoading(false);
      return { data, error: null };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { data: null, error: err };
    }
  }, [getMockMarks]);

  return { loading, error, getMarksByExamAndClass, upsertMarks, getMarksByStudent };
};

export const getCachedMarksByExamClass = (examId, className) => cachedMarksByExamClass[`${examId}-${className}`];
export const getCachedMarksByStudent = (studentId) => cachedMarksByStudent[studentId];
export default useMarks;
