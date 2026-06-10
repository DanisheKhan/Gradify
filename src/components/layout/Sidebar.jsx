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
    <div className="h-full flex flex-col w-60 border-r border-neutral-100 select-none bg-white">
      {/* Logo */}
      <div className="h-14 flex items-center justify-between px-5 border-b border-neutral-100 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shadow-md shadow-primary-500/30">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-neutral-900 text-[15px] tracking-tight">
            Gradify
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-neutral-100 lg:hidden text-neutral-400 transition-colors focus:outline-hidden ml-auto"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav label */}
      <div className="px-5 pt-4 pb-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Navigation</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pb-3 space-y-0.5 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => { if (window.innerWidth < 1024) onClose(); }}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150
                ${isActive
                  ? 'bg-gradient-to-r from-primary-50 to-violet-50 text-primary-700 shadow-sm'
                  : 'text-neutral-500 hover:bg-neutral-100/80 hover:text-neutral-800'
                }
              `}
            >
              {({ isActive }) => (
                <>
                  <span className={`
                    w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all duration-150
                    ${isActive
                      ? 'bg-primary-600 shadow-sm shadow-primary-500/40'
                      : 'bg-transparent group-hover:bg-neutral-200'
                    }
                  `}>
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                  </span>
                  <span>{link.label}</span>
                  {isActive && (
                    <span className="ms-auto w-1.5 h-1.5 rounded-full bg-primary-500" />
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Bottom branding */}
      <div className="px-5 py-4 border-t border-neutral-100">
        <p className="text-[10px] text-neutral-300 font-medium">Gradify © 2025</p>
      </div>
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
