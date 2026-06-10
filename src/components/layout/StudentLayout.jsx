import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export const StudentLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 overflow-hidden">
      {/* Student Nav (no menu toggle button required) */}
      <Navbar showMenuButton={false} />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto focus:outline-hidden">
        <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;
