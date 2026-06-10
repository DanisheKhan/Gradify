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
} from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  const links = [
    { to: '/admin/dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { to: '/admin/students',  label: t('nav.students'),  icon: Users },
    { to: '/admin/exams',     label: t('nav.exams'),     icon: ClipboardList },
    { to: '/admin/subjects',  label: t('nav.subjects'),  icon: BookOpen },
    { to: '/admin/marks',     label: t('nav.marks'),     icon: FileSpreadsheet },
    { to: '/admin/results',   label: t('nav.results'),   icon: GraduationCap },
    { to: '/admin/settings',  label: t('nav.settings'),  icon: Settings },
  ];

  const sidebarContent = (
    <div className="h-full flex flex-col bg-white w-60 border-r border-neutral-200 select-none">
      {/* Logo */}
      <div className="h-14 flex items-center justify-between px-5 border-b border-neutral-200 lg:justify-start shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary-600 flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-neutral-900 text-[15px] tracking-tight">
            Gradify
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-neutral-100 lg:hidden text-neutral-400 transition-colors focus:outline-hidden ml-auto"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => { if (window.innerWidth < 1024) onClose(); }}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150
                ${isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-primary-600' : ''}`} />
                  <span>{link.label}</span>
                </>
              )}
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
          className="fixed inset-0 bg-neutral-900/20 backdrop-blur-sm z-40 lg:hidden no-print"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 bottom-0 start-0 z-40 transition-transform duration-300 transform lg:translate-x-0 lg:static lg:z-auto no-print
          ${isOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
