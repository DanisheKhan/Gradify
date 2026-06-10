import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { GraduationCap, Mail, Lock, AlertCircle, Globe, Sparkles } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export const Login = () => {
  const { t } = useTranslation();
  const { signIn, user, userProfile, isMock } = useAuth();
  const { currentLang, changeLanguage, languages } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const from = location.state?.from?.pathname || '/';

  useEffect(() => {
    if (user && userProfile) {
      if (userProfile.role === 'admin') {
        navigate('/admin/dashboard', { replace: true });
      } else if (userProfile.role === 'student') {
        navigate('/student/dashboard', { replace: true });
      }
    }
  }, [user, userProfile, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const { data, error } = await signIn(email, password);
    if (error) {
      setErrorMsg(t('auth.invalid_credentials'));
      setLoading(false);
    }
  };

  const handleFillDemo = (type) => {
    if (type === 'admin') {
      setEmail('admin@gradify.com');
      setPassword('admin123');
    } else {
      setEmail('student@gradify.com');
      setPassword('student123');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center items-center px-4 select-none">
      {/* Language switcher */}
      <div className="absolute top-4 end-4 flex items-center gap-2 z-10">
        <Globe className="w-3.5 h-3.5 text-neutral-400" />
        <div className="flex gap-1 bg-white border border-neutral-200 rounded-lg p-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`
                px-2.5 py-1 rounded-md text-xs font-medium transition-colors
                ${currentLang === lang.code
                  ? 'bg-primary-600 text-white'
                  : 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800'
                }
              `}
            >
              {lang.nativeName}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full max-w-sm space-y-6">
        {/* Branding */}
        <div className="text-center flex flex-col items-center gap-3">
          <div className="w-10 h-10 bg-primary-600 text-white rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-neutral-900 tracking-tight">
              {t('auth.title')}
            </h1>
            <p className="mt-1 text-sm text-neutral-400">
              {t('auth.subtitle')}
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-danger-50 border border-danger-100 rounded-lg flex items-start gap-2 text-danger-600 text-xs font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <Input
              label={t('auth.email')}
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@gradify.com"
              icon={<Mail className="w-4 h-4" />}
            />

            <Input
              label={t('auth.password')}
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={<Lock className="w-4 h-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-1"
              size="lg"
              loading={loading}
            >
              {t('auth.sign_in')}
            </Button>
          </form>

          {/* Demo accounts */}
          {isMock && (
            <div className="mt-5 pt-5 border-t border-neutral-100">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-3 select-none">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Demo Accounts</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Admin', sub: 'admin@gradify.com', type: 'admin' },
                  { label: 'Student', sub: 'student@gradify.com', type: 'student' },
                ].map((demo) => (
                  <button
                    key={demo.type}
                    onClick={() => handleFillDemo(demo.type)}
                    className="px-3 py-2.5 bg-neutral-50 hover:bg-neutral-100 rounded-lg text-start transition-colors border border-neutral-200"
                  >
                    <div className="text-xs font-semibold text-neutral-800">{demo.label}</div>
                    <div className="text-[10px] text-neutral-400 mt-0.5 leading-none">{demo.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
