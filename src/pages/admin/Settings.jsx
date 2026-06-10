import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import { useSchool } from '../../hooks/useSchool';
import { useLanguage } from '../../context/LanguageContext';
import { DEFAULT_GRADING_SCALE } from '../../utils/gradeCalc';
import { Save, School, Upload, Sparkles, Languages, Settings as SettingsIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const Settings = () => {
  const { t } = useTranslation();
  const { currentLang, changeLanguage, languages } = useLanguage();
  
  const { getSchool, updateSchool, uploadLogo, loading } = useSchool();
  
  const [schoolData, setSchoolData] = useState({
    name: '',
    address: '',
    logo_url: ''
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const loadSchool = async () => {
      const { data } = await getSchool();
      if (data) {
        setSchoolData({
          name: data.name || '',
          address: data.address || '',
          logo_url: data.logo_url || ''
        });
      }
    };
    loadSchool();
  }, [getSchool]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setSchoolData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await updateSchool(schoolData);
    setSaving(false);
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('admin.settings.settings_updated'));
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { publicUrl, error } = await uploadLogo(file);
      if (error) throw error;

      setSchoolData((prev) => ({ ...prev, logo_url: publicUrl }));
      toast.success('Logo uploaded successfully');
    } catch (err) {
      toast.error('Failed to upload logo');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <Spinner fullPage />;

  return (
    <PageWrapper
      title={t('admin.settings.title')}
      subtitle="Customize your school identity, grading scale values, and language settings"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* School Metadata Identity Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card
            title={t('admin.settings.school_info')}
            subtitle="This branding is applied to all print slips and booklet templates"
            footer={
              <Button
                variant="primary"
                onClick={handleSubmit}
                loading={saving}
                icon={<Save className="w-4 h-4" />}
              >
                {t('common.save')}
              </Button>
            }
          >
            <form className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-2">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl bg-neutral-100 border border-neutral-250 flex items-center justify-center text-neutral-400 overflow-hidden">
                    {schoolData.logo_url ? (
                      <img src={schoolData.logo_url} alt="School Logo" className="w-full h-full object-contain p-2" />
                    ) : (
                      <School className="w-12 h-12 text-neutral-300" />
                    )}
                  </div>
                  <label className="absolute bottom-[-8px] right-[-8px] bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-full cursor-pointer shadow-md transition-all">
                    <Upload className="w-4.5 h-4.5" />
                    <input type="file" onChange={handleLogoUpload} accept="image/*" className="hidden" />
                  </label>
                </div>
                
                <div className="flex-1 space-y-1 text-center sm:text-start">
                  <h4 className="text-sm font-bold text-neutral-800">School Seal / Emblem</h4>
                  <p className="text-xs text-neutral-500">
                    JPG or PNG formats are supported. Max file size: 2MB. Recommended dimensions: square.
                  </p>
                  {uploading && <p className="text-xs text-primary-600 font-semibold">Uploading...</p>}
                </div>
              </div>

              <Input
                label={t('admin.settings.school_name')}
                id="name"
                required
                value={schoolData.name}
                onChange={handleInputChange}
                icon={<School className="w-4 h-4" />}
              />

              <Input
                label={t('admin.settings.school_address')}
                id="address"
                required
                value={schoolData.address}
                onChange={handleInputChange}
              />
            </form>
          </Card>

          {/* Regional Localization Settings */}
          <Card title="Localization & Languages" subtitle="Set system-wide portal display language configuration">
            <div className="space-y-4 select-none">
              <div className="flex items-center gap-2.5">
                <Languages className="w-5 h-5 text-neutral-400" />
                <span className="text-xs font-bold text-neutral-700 uppercase tracking-wide">Language Settings</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`
                      px-4 py-3 rounded-xl border text-center font-bold text-xs transition-all flex flex-col items-center gap-1
                      ${currentLang === lang.code 
                        ? 'border-primary-600 bg-primary-50/20 text-primary-700 shadow-sm shadow-primary-50/50' 
                        : 'border-neutral-250 bg-white hover:bg-neutral-50 text-neutral-700'
                      }
                    `}
                  >
                    <span>{lang.nativeName}</span>
                    <span className="text-[10px] text-neutral-400 font-medium">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right column: Grading configured values */}
        <div className="lg:col-span-1">
          <Card title={t('admin.settings.grading_scale')} subtitle="Calculated based on percentage scored">
            <div className="space-y-3">
              {DEFAULT_GRADING_SCALE.map((range) => (
                <div
                  key={range.grade}
                  className="flex items-center justify-between p-3 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant={range.grade === 'F' ? 'danger' : range.grade === 'D' ? 'warning' : 'success'}>
                      {range.grade}
                    </Badge>
                    <span className="text-xs font-bold text-neutral-700">
                      {t(range.label)}
                    </span>
                  </div>
                  <span className="text-xs text-neutral-500 font-bold select-none">
                    {range.min}% - {range.max}%
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

      </div>
    </PageWrapper>
  );
};

export default Settings;
