import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const MOCK_STUDENTS_KEY = 'gradify_mock_students';

const SEED_STUDENTS = [
  {
    id: 'student-1',
    name: 'Danish Khan',
    roll_number: 'ROLL-6715',
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
  // Class 9
  { id: 'student-9001', name: 'Rohan Gupta', roll_number: 'ROLL-9001', class: '9', section: 'A', photo_url: '', date_of_birth: '2011-03-12', parent_name: 'Suresh Gupta', contact_number: '9876543101', address: 'Mumbai, Maharashtra', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-9002', name: 'Priya Patel', roll_number: 'ROLL-9002', class: '9', section: 'A', photo_url: '', date_of_birth: '2011-05-18', parent_name: 'Vijay Patel', contact_number: '9876543102', address: 'Ahmedabad, Gujarat', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-9003', name: 'Amit Singh', roll_number: 'ROLL-9003', class: '9', section: 'A', photo_url: '', date_of_birth: '2011-07-22', parent_name: 'Rajendra Singh', contact_number: '9876543103', address: 'Lucknow, Uttar Pradesh', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-9004', name: 'Sneha Reddy', roll_number: 'ROLL-9004', class: '9', section: 'B', photo_url: '', date_of_birth: '2011-09-05', parent_name: 'Prasad Reddy', contact_number: '9876543104', address: 'Hyderabad, Telangana', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-9005', name: 'Vikram Malhotra', roll_number: 'ROLL-9005', class: '9', section: 'B', photo_url: '', date_of_birth: '2011-11-30', parent_name: 'Anil Malhotra', contact_number: '9876543105', address: 'Delhi, NCR', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-9006', name: 'Anjali Bose', roll_number: 'ROLL-9006', class: '9', section: 'B', photo_url: '', date_of_birth: '2011-01-15', parent_name: 'Subrata Bose', contact_number: '9876543106', address: 'Kolkata, West Bengal', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-9007', name: 'Sameer Deshmukh', roll_number: 'ROLL-9007', class: '9', section: 'C', photo_url: '', date_of_birth: '2011-02-28', parent_name: 'Milind Deshmukh', contact_number: '9876543107', address: 'Nagpur, Maharashtra', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-9008', name: 'Neha Joshi', roll_number: 'ROLL-9008', class: '9', section: 'C', photo_url: '', date_of_birth: '2011-04-14', parent_name: 'Gopal Joshi', contact_number: '9876543108', address: 'Dehradun, Uttarakhand', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-9009', name: 'Yash Wardhan', roll_number: 'ROLL-9009', class: '9', section: 'C', photo_url: '', date_of_birth: '2011-06-25', parent_name: 'Satish Wardhan', contact_number: '9876543109', address: 'Patna, Bihar', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-9010', name: 'Kavita Nair', roll_number: 'ROLL-9010', class: '9', section: 'A', photo_url: '', date_of_birth: '2011-08-09', parent_name: 'Narayanan Nair', contact_number: '9876543110', address: 'Kochi, Kerala', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-9011', name: 'Rahul Saxena', roll_number: 'ROLL-9011', class: '9', section: 'B', photo_url: '', date_of_birth: '2011-10-19', parent_name: 'Alok Saxena', contact_number: '9876543111', address: 'Bhopal, Madhya Pradesh', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-9012', name: 'Divya Kapoor', roll_number: 'ROLL-9012', class: '9', section: 'C', photo_url: '', date_of_birth: '2011-12-01', parent_name: 'Rajesh Kapoor', contact_number: '9876543112', address: 'Chandigarh, Punjab', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },

  // Class 10
  { id: 'student-1002', name: 'Aarav Sharma', roll_number: 'ROLL-1002', class: '10', section: 'A', photo_url: '', date_of_birth: '2010-04-12', parent_name: 'Sanjay Sharma', contact_number: '9876543202', address: 'Mumbai, Maharashtra', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-1003', name: 'Aditya Verma', roll_number: 'ROLL-1003', class: '10', section: 'A', photo_url: '', date_of_birth: '2010-06-15', parent_name: 'Ramesh Verma', contact_number: '9876543203', address: 'Delhi, NCR', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-1004', name: 'Zainab Fatima', roll_number: 'ROLL-1004', class: '10', section: 'A', photo_url: '', date_of_birth: '2010-08-22', parent_name: 'Sajid Ali', contact_number: '9876543204', address: 'Hyderabad, India', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-1005', name: 'Vihaan Iyer', roll_number: 'ROLL-1005', class: '10', section: 'B', photo_url: '', date_of_birth: '2010-10-05', parent_name: 'Balaji Iyer', contact_number: '9876543205', address: 'Chennai, Tamil Nadu', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-1006', name: 'Diya Sen', roll_number: 'ROLL-1006', class: '10', section: 'B', photo_url: '', date_of_birth: '2010-12-14', parent_name: 'Sourav Sen', contact_number: '9876543206', address: 'Kolkata, West Bengal', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-1007', name: 'Arjun Mehta', roll_number: 'ROLL-1007', class: '10', section: 'B', photo_url: '', date_of_birth: '2010-02-20', parent_name: 'Karan Mehta', contact_number: '9876543207', address: 'Mumbai, Maharashtra', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-1008', name: 'Ishaan Choudhury', roll_number: 'ROLL-1008', class: '10', section: 'C', photo_url: '', date_of_birth: '2010-01-30', parent_name: 'Bipul Choudhury', contact_number: '9876543208', address: 'Guwahati, Assam', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-1009', name: 'Riya Mukherjee', roll_number: 'ROLL-1009', class: '10', section: 'C', photo_url: '', date_of_birth: '2010-03-24', parent_name: 'Arup Mukherjee', contact_number: '9876543209', address: 'Kolkata, West Bengal', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-1010', name: 'Sai Prasad', roll_number: 'ROLL-1010', class: '10', section: 'C', photo_url: '', date_of_birth: '2010-05-08', parent_name: 'Krishna Prasad', contact_number: '9876543210', address: 'Bengaluru, Karnataka', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-1011', name: 'Tanvi Rao', roll_number: 'ROLL-1011', class: '10', section: 'A', photo_url: '', date_of_birth: '2010-07-11', parent_name: 'Raghav Rao', contact_number: '9876543211', address: 'Hyderabad, Telangana', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-1012', name: 'Pranav Kulkarni', roll_number: 'ROLL-1012', class: '10', section: 'B', photo_url: '', date_of_birth: '2010-09-19', parent_name: 'Shrinivas Kulkarni', contact_number: '9876543212', address: 'Pune, Maharashtra', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-1013', name: 'Shreya Mishra', roll_number: 'ROLL-1013', class: '10', section: 'C', photo_url: '', date_of_birth: '2010-11-27', parent_name: 'Manish Mishra', contact_number: '9876543213', address: 'Kanpur, Uttar Pradesh', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-1014', name: 'Kabir Shah', roll_number: 'ROLL-1014', class: '10', section: 'A', photo_url: '', date_of_birth: '2010-08-05', parent_name: 'Zuber Shah', contact_number: '9876543214', address: 'Ahmedabad, Gujarat', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-1015', name: 'Ananya Pandey', roll_number: 'ROLL-1015', class: '10', section: 'B', photo_url: '', date_of_birth: '2010-09-02', parent_name: 'Sudhir Pandey', contact_number: '9876543215', address: 'Patna, Bihar', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },

  // Class 11
  { id: 'student-1101', name: 'Devendra Kumar', roll_number: 'ROLL-1101', class: '11', section: 'A', photo_url: '', date_of_birth: '2009-01-14', parent_name: 'Satish Kumar', contact_number: '9876543301', address: 'Ranchi, Jharkhand', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-1102', name: 'Meera Krishnan', roll_number: 'ROLL-1102', class: '11', section: 'A', photo_url: '', date_of_birth: '2009-03-25', parent_name: 'Gopal Krishnan', contact_number: '9876543302', address: 'Chennai, Tamil Nadu', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-1103', name: 'Akash Banerjee', roll_number: 'ROLL-1103', class: '11', section: 'A', photo_url: '', date_of_birth: '2009-05-09', parent_name: 'Sajal Banerjee', contact_number: '9876543303', address: 'Kolkata, West Bengal', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-1104', name: 'Shruti Hegde', roll_number: 'ROLL-1104', class: '11', section: 'B', photo_url: '', date_of_birth: '2009-07-20', parent_name: 'Ramesh Hegde', contact_number: '9876543304', address: 'Bengaluru, Karnataka', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-1105', name: 'Kunal Roy', roll_number: 'ROLL-1105', class: '11', section: 'B', photo_url: '', date_of_birth: '2009-09-05', parent_name: 'Piyush Roy', contact_number: '9876543305', address: 'Siliguri, West Bengal', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-1106', name: 'Pooja Gowda', roll_number: 'ROLL-1106', class: '11', section: 'B', photo_url: '', date_of_birth: '2009-11-18', parent_name: 'Kempa Gowda', contact_number: '9876543306', address: 'Mysuru, Karnataka', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-1107', name: 'Rishabh Pant', roll_number: 'ROLL-1107', class: '11', section: 'C', photo_url: '', date_of_birth: '2009-08-11', parent_name: 'Rajendra Pant', contact_number: '9876543307', address: 'Roorkee, Uttarakhand', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-1108', name: 'Kriti Sanon', roll_number: 'ROLL-1108', class: '11', section: 'C', photo_url: '', date_of_birth: '2009-10-22', parent_name: 'Rahul Sanon', contact_number: '9876543308', address: 'Mumbai, Maharashtra', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-1109', name: 'Sidharth Malhotra', roll_number: 'ROLL-1109', class: '11', section: 'C', photo_url: '', date_of_birth: '2009-12-05', parent_name: 'Sunil Malhotra', contact_number: '9876543309', address: 'Delhi, NCR', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-1110', name: 'Kiara Advani', roll_number: 'ROLL-1110', class: '11', section: 'A', photo_url: '', date_of_birth: '2009-02-17', parent_name: 'Jagdeep Advani', contact_number: '9876543310', address: 'Mumbai, Maharashtra', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-1111', name: 'Varun Dhawan', roll_number: 'ROLL-1111', class: '11', section: 'B', photo_url: '', date_of_birth: '2009-04-24', parent_name: 'David Dhawan', contact_number: '9876543311', address: 'Mumbai, Maharashtra', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-1112', name: 'Alia Bhatt', roll_number: 'ROLL-1112', class: '11', section: 'C', photo_url: '', date_of_birth: '2009-06-15', parent_name: 'Mahesh Bhatt', contact_number: '9876543312', address: 'Mumbai, Maharashtra', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },

  // Class 12
  { id: 'student-1201', name: 'Ishwar Chandra', roll_number: 'ROLL-1201', class: '12', section: 'A', photo_url: '', date_of_birth: '2008-01-05', parent_name: 'Rohan Chandra', contact_number: '9876543401', address: 'Kolkata, West Bengal', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-1202', name: 'Jyoti Basu', roll_number: 'ROLL-1202', class: '12', section: 'A', photo_url: '', date_of_birth: '2008-03-08', parent_name: 'Kalyan Basu', contact_number: '9876543402', address: 'Kolkata, West Bengal', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-1203', name: 'Pranab Mukherjee', roll_number: 'ROLL-1203', class: '12', section: 'A', photo_url: '', date_of_birth: '2008-05-11', parent_name: 'Kamada Mukherjee', contact_number: '9876543403', address: 'Birbhum, West Bengal', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-1204', name: 'Pratibha Patil', roll_number: 'ROLL-1204', class: '12', section: 'B', photo_url: '', date_of_birth: '2008-07-19', parent_name: 'Narayan Patil', contact_number: '9876543404', address: 'Jalgaon, Maharashtra', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-1205', name: 'APJ Abdul Kalam', roll_number: 'ROLL-1205', class: '12', section: 'B', photo_url: '', date_of_birth: '2008-09-21', parent_name: 'Jainulabdeen', contact_number: '9876543405', address: 'Rameswaram, Tamil Nadu', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-1206', name: 'Sarvepalli Radhakrishnan', roll_number: 'ROLL-1206', class: '12', section: 'B', photo_url: '', date_of_birth: '2008-11-23', parent_name: 'Veeraswami', contact_number: '9876543406', address: 'Tiruttani, Tamil Nadu', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-1207', name: 'Zakir Husain', roll_number: 'ROLL-1207', class: '12', section: 'C', photo_url: '', date_of_birth: '2008-02-18', parent_name: 'Fida Husain', contact_number: '9876543407', address: 'Hyderabad, Telangana', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-1208', name: 'VV Giri', roll_number: 'ROLL-1208', class: '12', section: 'C', photo_url: '', date_of_birth: '2008-04-10', parent_name: 'Jogi Giri', contact_number: '9876543408', address: 'Berhampur, Odisha', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-1209', name: 'Fakhruddin Ali Ahmed', roll_number: 'ROLL-1209', class: '12', section: 'C', photo_url: '', date_of_birth: '2008-06-13', parent_name: 'Col. Zalnur Ali', contact_number: '9876543409', address: 'Delhi, NCR', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-1210', name: 'Neelam Sanjiva Reddy', roll_number: 'ROLL-1210', class: '12', section: 'A', photo_url: '', date_of_birth: '2008-08-15', parent_name: 'Chinna Reddy', contact_number: '9876543410', address: 'Anantapur, Andhra Pradesh', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-1211', name: 'Zail Singh', roll_number: 'ROLL-1211', class: '12', section: 'B', photo_url: '', date_of_birth: '2008-10-30', parent_name: 'Kishan Singh', contact_number: '9876543411', address: 'Sandhwan, Punjab', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' },
  { id: 'student-1212', name: 'R Venkataraman', roll_number: 'ROLL-1212', class: '12', section: 'C', photo_url: '', date_of_birth: '2008-12-04', parent_name: 'Ramaswami Iyer', contact_number: '9876543412', address: 'Tanjore, Tamil Nadu', created_at: new Date().toISOString(), school_id: 'mock-school-id-123' }
];

// Module-level cache to prevent reloading flashes when switching tabs
let cachedStudents = null;

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
    // If we have cached students and are not class/search filtering, return cache instantly
    if (cachedStudents && !filters.class && !filters.search) {
      return { data: cachedStudents, error: null };
    }

    setLoading(true);
    setError(null);
    try {
      let data;
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
        data = students;
      } else {
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

        const { data: dbData, error } = await query.order('roll_number', { ascending: true });
        if (error) throw error;
        data = dbData;
      }

      if (!filters.class && !filters.search) {
        cachedStudents = data;
      }
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
      cachedStudents = null; // Invalidate cache
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
      cachedStudents = null; // Invalidate cache
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
      cachedStudents = null; // Invalidate cache
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

export const getCachedStudents = () => cachedStudents;
export default useStudents;
