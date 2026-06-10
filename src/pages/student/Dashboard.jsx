import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useStudents } from '../../hooks/useStudents';
import { useMarks } from '../../hooks/useMarks';
import { useExams } from '../../hooks/useExams';
import { useSubjects } from '../../hooks/useSubjects';
import { calculateResultSummary } from '../../utils/gradeCalc';
import { GraduationCap, FileText, Printer, User, Award, Calendar, Contact } from 'lucide-react';

export const StudentDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  
  const { getStudents } = useStudents();
  const { getMarksByStudent } = useMarks();
  const { getExams } = useExams();
  const { getSubjects } = useSubjects();

  const [student, setStudent] = useState(null);
  const [latestResult, setLatestResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudentData = async () => {
      if (!userProfile) return;
      setLoading(true);
      try {
        // Query to match student record matching auth user ID
        const { data: studentsList } = await getStudents();
        const activeStudent = studentsList?.find((s) => s.user_id === user.id) || studentsList?.[0]; // mock fallback

        if (activeStudent) {
          setStudent(activeStudent);

          // Get marks and compute latest result
          const { data: marks } = await getMarksByStudent(activeStudent.id);
          const { data: exams } = await getExams({ class: activeStudent.class });
          const { data: subjects } = await getSubjects({ class: activeStudent.class });

          if (marks && exams && exams.length > 0 && subjects) {
            // Find latest exam based on date
            const sortedExams = [...exams].sort((a, b) => new Date(b.exam_date) - new Date(a.exam_date));
            const latestExam = sortedExams[0];

            if (latestExam) {
              const examMarks = marks.filter((m) => m.exam_id === latestExam.id);
              const summary = calculateResultSummary(examMarks, subjects);
              setLatestResult({
                examName: latestExam.name,
                examId: latestExam.id,
                ...summary
              });
            }
          }
        }
      } catch (err) {
        console.error('Failed to load student dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadStudentData();
  }, [user, userProfile, getStudents, getMarksByStudent, getExams, getSubjects]);

  if (loading) return <Spinner fullPage />;
  if (!student) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-neutral-500">Student profile record not found. Please contact administration.</p>
      </div>
    );
  }

  return (
    <PageWrapper
      title={`${t('student.dashboard.welcome')} ${student.name}`}
      subtitle="Access your academic progress reports and printable score sheets"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Student Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <Card title={t('student.dashboard.profile')}>
            <div className="flex flex-col items-center text-center">
              <div className="w-28 h-28 rounded-full overflow-hidden bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-400">
                {student.photo_url ? (
                  <img src={student.photo_url} alt={student.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-12 h-12 text-neutral-300" />
                )}
              </div>
              <h3 className="mt-4 font-bold text-neutral-800 text-base leading-none select-none">{student.name}</h3>
              <p className="text-xs text-neutral-500 mt-1 select-none">Roll Number: {student.roll_number}</p>
            </div>

            <div className="mt-6 border-t border-neutral-150 pt-5 space-y-3.5 text-xs text-neutral-600 select-none">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-500">Class & Section:</span>
                <span className="font-bold text-neutral-800">{student.class} - {student.section || 'A'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-500">Parent/Guardian:</span>
                <span className="font-bold text-neutral-800">{student.parent_name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-500">Date of Birth:</span>
                <span className="font-bold text-neutral-800">{student.date_of_birth || '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-neutral-500">Contact Number:</span>
                <span className="font-bold text-neutral-800">{student.contact_number || '-'}</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Latest Result and Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          {latestResult ? (
            <Card
              title={`${t('student.dashboard.latest_result')}`}
              subtitle={`Computed summary from: ${latestResult.examName}`}
            >
              <div className="grid grid-cols-3 gap-4 text-center pb-4 border-b border-neutral-150">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 select-none">Marks Score</span>
                  <div className="text-base font-black text-neutral-850 mt-1">
                    {latestResult.totalObtained}/{latestResult.totalMax}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 select-none">{t('student.dashboard.percentage')}</span>
                  <div className="text-base font-black text-primary-600 mt-1">
                    {latestResult.percentage}%
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 select-none">{t('student.dashboard.grade')}</span>
                  <div className="text-base font-black text-neutral-800 mt-1">
                    {latestResult.grade}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-1.5">
                  <Award className="w-5 h-5 text-neutral-400" />
                  <span className="text-xs font-bold text-neutral-600">{t('student.dashboard.status')}:</span>
                  <Badge variant={latestResult.status === 'PASS' ? 'success' : 'danger'}>
                    {latestResult.status}
                  </Badge>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Printer className="w-4 h-4 text-primary-600" />}
                  onClick={() => navigate(`/student/results/${student.id}?examId=${latestResult.examId}&print=true`)}
                >
                  {t('student.results.print_slip')}
                </Button>
              </div>
            </Card>
          ) : (
            <Card title={t('student.dashboard.latest_result')}>
              <p className="text-sm text-neutral-400 text-center py-6">
                No exam results posted yet. Please wait for the teacher to enter marks.
              </p>
            </Card>
          )}

          {/* Quick links & booklet options */}
          <Card title={t('student.dashboard.quick_links')}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="w-full text-start py-3 justify-start gap-3 border-neutral-250 bg-white hover:bg-neutral-50"
                icon={<FileText className="w-5 h-5 text-neutral-500" />}
                onClick={() => navigate('/student/results')}
              >
                <div>
                  <div className="text-xs font-bold text-neutral-800">{t('student.results.title')}</div>
                  <div className="text-[10px] text-neutral-400 font-medium">Browse scores across all exams</div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full text-start py-3 justify-start gap-3 border-neutral-250 bg-white hover:bg-neutral-50"
                icon={<Printer className="w-5 h-5 text-primary-600" />}
                onClick={() => navigate(`/student/results?booklet=true`)}
              >
                <div>
                  <div className="text-xs font-bold text-neutral-800">{t('student.results.print_booklet')}</div>
                  <div className="text-[10px] text-neutral-400 font-medium">Generate overall academic booklet</div>
                </div>
              </Button>
            </div>
          </Card>
        </div>

      </div>
    </PageWrapper>
  );
};

export default StudentDashboard;
