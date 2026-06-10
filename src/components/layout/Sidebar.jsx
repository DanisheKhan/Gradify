import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Settings,
  X,
  School
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  const links = [
    { to: '/admin/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/admin/students', label: t('nav.students'), icon: Users },
    { to: '/admin/exams', label: t('nav.exams'), icon: ClipboardList },
    { to: '/admin/subjects', label: t('nav.subjects'), icon: BookOpen },
    { to: '/admin/marks', label: t('nav.marks'), icon: FileSpreadsheet },
    { to: '/admin/results', label: t('nav.results'), icon: GraduationCap },
    { to: '/admin/settings', label: t('nav.settings'), icon: Settings },
  ];

  const activeClass = 'bg-primary-50 text-primary-600 font-semibold border-e-3 border-primary-600';
  const inactiveClass = 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 border-e-3 border-transparent';

  const sidebarContent = (
    <div className="h-full flex flex-col bg-white w-64 border-r border-neutral-200 select-none">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-neutral-200 lg:justify-center">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-6 h-6 text-primary-600" />
          <span className="font-extrabold text-neutral-800 text-lg tracking-tight">
            Gradify
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-neutral-100 lg:hidden text-neutral-500 focus:outline-hidden"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => {
                if (window.innerWidth < 1024) onClose();
              }}
              className={({ isActive }) => `
                flex items-center gap-3 px-6 py-3 text-sm transition-all duration-150
                ${isActive ? activeClass : inactiveClass}
              `}
            >
              <Icon className="w-4.5 h-4.5" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-neutral-900/30 backdrop-blur-xs z-40 lg:hidden no-print"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 bottom-0 start-0 z-40 transition-transform duration-350 transform lg:translate-x-0 lg:static lg:z-auto no-print
          ${isOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
