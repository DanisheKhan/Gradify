import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Globe, LogOut, ChevronDown, User, Menu, School } from 'lucide-react';
import Badge from '../ui/Badge';

export const Navbar = ({ onMenuClick, showMenuButton = true }) => {
  const { t } = useTranslation();
  const { userProfile, signOut } = useAuth();
  const { currentLang, changeLanguage, languages } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const langRef = useRef(null);
  const profileRef = useRef(null);

  const activeLang = languages.find((l) => l.code === currentLang) || languages[0];

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setLangOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLangChange = (code) => {
    changeLanguage(code);
    setLangOpen(false);
  };

  const schoolName = userProfile?.schools?.name || 'Gradify School';
  const schoolLogo = userProfile?.schools?.logo_url;

  return (
    <nav className="h-14 bg-white border-b border-neutral-200 px-5 flex items-center justify-between sticky top-0 z-40 select-none no-print">
      {/* Left */}
      <div className="flex items-center gap-3">
        {showMenuButton && (
          <button
            onClick={onMenuClick}
            className="p-1.5 rounded-md hover:bg-neutral-100 lg:hidden text-neutral-500 transition-colors focus:outline-hidden"
          >
            <Menu className="w-4.5 h-4.5" />
          </button>
        )}
        <div className="flex items-center gap-2">
          {schoolLogo ? (
            <img src={schoolLogo} alt="School Logo" className="w-7 h-7 object-contain rounded-md" />
          ) : (
            <div className="w-7 h-7 rounded-md bg-neutral-100 flex items-center justify-center text-neutral-500">
              <School className="w-4 h-4" />
            </div>
          )}
          <span className="font-semibold text-neutral-800 text-sm hidden sm:block">
            {schoolName}
          </span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Language Selector */}
        <div className="relative" ref={langRef}>
          <button
            onClick={() => { setLangOpen(!langOpen); setProfileOpen(false); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md hover:bg-neutral-100 text-neutral-600 text-xs font-medium transition-colors focus:outline-hidden"
          >
            <Globe className="w-3.5 h-3.5 text-neutral-400" />
            <span>{activeLang.nativeName}</span>
            <ChevronDown className={`w-3 h-3 text-neutral-400 transition-transform duration-200 ${langOpen ? 'rotate-180' : ''}`} />
          </button>

          {langOpen && (
            <div className="absolute end-0 mt-1 w-36 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 z-50">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLangChange(lang.code)}
                  className={`
                    w-full px-3.5 py-2 text-start text-xs font-medium transition-colors
                    ${currentLang === lang.code
                      ? 'text-primary-600 bg-primary-50'
                      : 'text-neutral-700 hover:bg-neutral-50'
                    }
                  `}
                >
                  {lang.nativeName}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-neutral-200" />

        {/* User Profile */}
        {userProfile && (
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => { setProfileOpen(!profileOpen); setLangOpen(false); }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-neutral-100 transition-colors focus:outline-hidden"
            >
              <div className="w-7 h-7 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 border border-primary-100 shrink-0">
                <User className="w-3.5 h-3.5" />
              </div>
              <div className="text-start hidden md:block">
                <div className="text-xs font-semibold text-neutral-800 leading-tight">
                  {userProfile.role === 'student' ? userProfile.name || 'Student' : t('grades.signature_principal')}
                </div>
                <div className="text-[10px] text-neutral-400 mt-0.5">
                  {userProfile.email || userProfile.id.substring(0, 8)}
                </div>
              </div>
              <ChevronDown className={`w-3 h-3 text-neutral-400 hidden md:block transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
            </button>

            {profileOpen && (
              <div className="absolute end-0 mt-1 w-52 bg-white border border-neutral-200 rounded-xl shadow-lg overflow-hidden z-50">
                {/* Info header */}
                <div className="px-4 py-3 border-b border-neutral-100">
                  <div className="text-xs font-semibold text-neutral-800">
                    {userProfile.role === 'student' ? userProfile.name || 'Student' : t('grades.signature_principal')}
                  </div>
                  <div className="text-[11px] text-neutral-400 mt-0.5">
                    {userProfile.email}
                  </div>
                </div>
                {/* Role */}
                <div className="px-4 py-2.5 flex items-center justify-between border-b border-neutral-100">
                  <span className="text-[11px] text-neutral-400 font-medium">Role</span>
                  <Badge variant={userProfile.role === 'admin' ? 'success' : 'info'}>
                    {userProfile.role}
                  </Badge>
                </div>
                {/* Logout */}
                <button
                  onClick={() => signOut()}
                  className="w-full px-4 py-2.5 text-start text-xs font-medium text-danger-600 hover:bg-danger-50 flex items-center gap-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t('nav.logout')}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
