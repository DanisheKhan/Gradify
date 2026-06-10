import React, { useState } from 'react';
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

  const activeLang = languages.find((l) => l.code === currentLang) || languages[0];

  const handleLangChange = (code) => {
    changeLanguage(code);
    setLangOpen(false);
  };

  // Extract School Information from Profile
  const schoolName = userProfile?.schools?.name || 'Gradify School';
  const schoolLogo = userProfile?.schools?.logo_url;

  return (
    <nav className="h-16 bg-white border-b border-neutral-200 px-5 flex items-center justify-between sticky top-0 z-40 select-none no-print">
      <div className="flex items-center gap-3">
        {showMenuButton && (
          <button
            onClick={onMenuClick}
            className="p-1.5 rounded-lg hover:bg-neutral-100 lg:hidden text-neutral-500 focus:outline-hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-2">
          {schoolLogo ? (
            <img src={schoolLogo} alt="School Logo" className="w-8 h-8 object-contain rounded-md" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center text-primary-600">
              <School className="w-5 h-5" />
            </div>
          )}
          <span className="font-bold text-neutral-800 text-sm tracking-tight hidden sm:block">
            {schoolName}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => {
              setLangOpen(!langOpen);
              setProfileOpen(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold focus:outline-hidden"
          >
            <Globe className="w-4 h-4 text-neutral-500" />
            <span>{activeLang.nativeName}</span>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
          </button>
          
          {langOpen && (
            <div className="absolute end-0 mt-1.5 w-36 bg-white border border-neutral-200 rounded-lg shadow-lg py-1 z-50">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLangChange(lang.code)}
                  className={`
                    w-full px-4 py-2 text-start text-xs font-medium hover:bg-neutral-50 flex items-center justify-between
                    ${currentLang === lang.code ? 'text-primary-600 bg-primary-50/20' : 'text-neutral-700'}
                  `}
                >
                  {lang.nativeName}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* User Profile */}
        {userProfile && (
          <div className="relative">
            <button
              onClick={() => {
                setProfileOpen(!profileOpen);
                setLangOpen(false);
              }}
              className="flex items-center gap-2 hover:bg-neutral-50 p-1.5 rounded-lg transition-colors focus:outline-hidden"
            >
              <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 border border-neutral-200">
                <User className="w-4 h-4" />
              </div>
              <div className="text-start hidden md:block">
                <div className="text-xs font-bold text-neutral-800 leading-tight">
                  {userProfile.role === 'student' ? userProfile.name || 'Student' : t('grades.signature_principal')}
                </div>
                <div className="text-[10px] text-neutral-500 font-medium">
                  {userProfile.email || userProfile.id.substring(0, 8)}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-neutral-400 hidden md:block" />
            </button>

            {profileOpen && (
              <div className="absolute end-0 mt-1.5 w-48 bg-white border border-neutral-200 rounded-xl shadow-lg py-1.5 z-50 overflow-hidden">
                <div className="px-4 py-2 border-b border-neutral-150 md:hidden">
                  <div className="text-xs font-bold text-neutral-800">
                    {userProfile.role === 'student' ? userProfile.name || 'Student' : 'Admin'}
                  </div>
                  <div className="text-[10px] text-neutral-500">
                    {userProfile.email}
                  </div>
                </div>
                <div className="px-4 py-2 flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 select-none">Role</span>
                  <Badge variant={userProfile.role === 'admin' ? 'success' : 'info'}>
                    {userProfile.role}
                  </Badge>
                </div>
                <button
                  onClick={() => signOut()}
                  className="w-full px-4 py-2 text-start text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-neutral-150"
                >
                  <LogOut className="w-4 h-4" />
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
