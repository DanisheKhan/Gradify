import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Admin Pages
import AdminLayout from './components/layout/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminStudents from './pages/admin/Students';
import AdminStudentDetail from './pages/admin/StudentDetail';
import AdminExams from './pages/admin/Exams';
import AdminSubjects from './pages/admin/Subjects';
import AdminMarks from './pages/admin/Marks';
import AdminResults from './pages/admin/Results';
import AdminSettings from './pages/admin/Settings';

// Student Pages
import StudentLayout from './components/layout/StudentLayout';
import StudentDashboard from './pages/student/Dashboard';
import StudentResults from './pages/student/Results';
import StudentResultDetail from './pages/student/ResultDetail';

export const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public auth routes */}
        <Route path="/login" element={<Login />} />

        {/* Admin protected routing tree */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="students/:id" element={<AdminStudentDetail />} />
          <Route path="exams" element={<AdminExams />} />
          <Route path="subjects" element={<AdminSubjects />} />
          <Route path="marks" element={<AdminMarks />} />
          <Route path="results" element={<AdminResults />} />
          <Route path="results/:id" element={<StudentResultDetail />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Student protected routing tree */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="results" element={<StudentResults />} />
          {/* Note: StudentResultDetail also handles printing result slips & booklets */}
          <Route path="results/:id" element={<StudentResultDetail />} />
        </Route>

        {/* Fallbacks */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;