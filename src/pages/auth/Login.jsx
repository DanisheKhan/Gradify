import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { GraduationCap, Mail, Lock, AlertCircle, Globe, Sparkles } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';

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

  // Get redirect path
  const from = location.state?.from?.pathname || '/';

  // Redirect if already logged in
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
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 select-none relative overflow-hidden">
      {/* Dynamic Background Accents */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-100/30 rounded-full filter blur-3xl" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-indigo-100/20 rounded-full filter blur-3xl" />

      {/* Language Bar at the top */}
      <div className="absolute top-4 end-4 flex items-center gap-2 z-10">
        <Globe className="w-4 h-4 text-neutral-400" />
        <div className="flex gap-1.5 bg-white border border-neutral-200 rounded-lg p-1">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`
                px-2.5 py-1 rounded-md text-xs font-bold transition-all
                ${currentLang === lang.code ? 'bg-primary-600 text-white shadow-xs' : 'text-neutral-600 hover:bg-neutral-50'}
              `}
            >
              {lang.nativeName}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full max-w-md space-y-6 z-10">
        {/* Portal Branding */}
        <div className="text-center flex flex-col items-center">
          <div className="w-12 h-12 bg-primary-600 text-white rounded-2xl flex items-center justify-center shadow-md shadow-primary-200">
            <GraduationCap className="w-7 h-7 animate-pulse" />
          </div>
          <h2 className="mt-4 text-2xl font-black text-neutral-900 tracking-tight">
            {t('auth.title')}
          </h2>
          <p className="mt-1 text-sm text-neutral-500 font-medium">
            {t('auth.subtitle')}
          </p>
        </div>

        {/* Login Form Card */}
        <Card className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700 text-xs font-semibold">
                <AlertCircle className="w-4.5 h-4.5 shrink-0" />
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
              placeholder="e.g. admin@gradify.com"
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
              className="w-full py-2.5"
              loading={loading}
            >
              {t('auth.sign_in')}
            </Button>
          </form>

          {/* Demo Credentials Section */}
          {isMock && (
            <div className="mt-6 pt-5 border-t border-neutral-200">
              <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-500 mb-3 select-none">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Quick Demo Accounts (Local Dev Mock):</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleFillDemo('admin')}
                  className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-start transition-colors border border-neutral-250"
                >
                  <div className="text-xs font-bold text-neutral-800">Admin Portal</div>
                  <div className="text-[10px] text-neutral-500 font-medium leading-none mt-0.5">admin@gradify.com</div>
                </button>
                <button
                  onClick={() => handleFillDemo('student')}
                  className="px-3 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-lg text-start transition-colors border border-neutral-250"
                >
                  <div className="text-xs font-bold text-neutral-800">Student Portal</div>
                  <div className="text-[10px] text-neutral-500 font-medium leading-none mt-0.5">student@gradify.com</div>
                </button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Login;
