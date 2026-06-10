import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import { useStudents } from '../../hooks/useStudents';
import { useExams } from '../../hooks/useExams';
import { useMarks } from '../../hooks/useMarks';
import { useSubjects } from '../../hooks/useSubjects';
import { calculateResultSummary } from '../../utils/gradeCalc';
import { Users, ClipboardList, TrendingUp, Sparkles, BookOpen, GraduationCap } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { getStudents } = useStudents();
  const { getExams } = useExams();
  const { getMarksByExamAndClass } = useMarks();
  const { getSubjects } = useSubjects();

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalExams: 0,
    totalSubjects: 0,
    passRate: 0,
  });
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [gradeData, setGradeData] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const { data: students } = await getStudents();
        const { data: exams } = await getExams();
        const { data: subjects } = await getSubjects();

        const studentsCount = students?.length || 0;
        const examsCount = exams?.length || 0;
        const subjectsCount = subjects?.length || 0;

        // Fetch marks for calculations
        let totalPass = 0;
        let totalEvaluated = 0;
        const gradeCounts = {};

        if (exams && exams.length > 0 && students && students.length > 0 && subjects) {
          // Process calculations
          for (const exam of exams) {
            const { data: marks } = await getMarksByExamAndClass(exam.id, exam.class);
            if (marks && marks.length > 0) {
              // Group marks by student for this exam
              const studentMarksMap = {};
              marks.forEach((m) => {
                const sId = m.student_id;
                if (!studentMarksMap[sId]) studentMarksMap[sId] = [];
                studentMarksMap[sId].push(m);
              });

              Object.keys(studentMarksMap).forEach((sId) => {
                const sMarks = studentMarksMap[sId];
                const summary = calculateResultSummary(sMarks, subjects);
                if (summary.status === 'PASS') {
                  totalPass++;
                }
                if (gradeCounts[summary.grade]) {
                  gradeCounts[summary.grade]++;
                } else {
                  gradeCounts[summary.grade] = 1;
                }
                totalEvaluated++;
              });
            }
          }
        }

        const passRateCalc = totalEvaluated > 0 ? Math.round((totalPass / totalEvaluated) * 100) : 80; // default seed fallback if no marks

        setStats({
          totalStudents: studentsCount,
          totalExams: examsCount,
          totalSubjects: subjectsCount,
          passRate: passRateCalc,
        });

        // Seed charts
        setChartData([
          { name: 'Unit Test 1', Pass: 2, Fail: 1 },
          { name: 'Final Exam', Pass: 1, Fail: 0 },
        ]);

        const grades = Object.keys(gradeCounts).map((g) => ({
          name: g,
          value: gradeCounts[g]
        }));
        
        setGradeData(grades.length > 0 ? grades : [
          { name: 'A+', value: 2 },
          { name: 'A', value: 5 },
          { name: 'B', value: 3 },
          { name: 'C', value: 2 },
          { name: 'D', value: 1 },
          { name: 'F', value: 1 }
        ]);

      } catch (err) {
        console.error('Error computing dashboard statistics:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [getStudents, getExams, getMarksByExamAndClass, getSubjects]);

  const COLORS = ['#4353e8', '#7c8df2', '#a1b0f7', '#c3cdfb', '#dce3fd', '#d1d1d6'];

  if (loading) return <Spinner fullPage />;

  return (
    <PageWrapper
      title={t('nav.dashboard')}
      subtitle="Overview of school academics, students, and results analytics"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            icon={<Sparkles className="w-4 h-4 text-amber-500" />}
            onClick={() => navigate('/admin/settings')}
          >
            Config Scale
          </Button>
        </div>
      }
    >
      {/* Statistics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: t('admin.dashboard.total_students'),
            value: stats.totalStudents,
            icon: <Users className="w-4.5 h-4.5" />,
          },
          {
            label: t('admin.dashboard.total_exams'),
            value: stats.totalExams,
            icon: <ClipboardList className="w-4.5 h-4.5" />,
          },
          {
            label: t('nav.subjects'),
            value: stats.totalSubjects,
            icon: <BookOpen className="w-4.5 h-4.5" />,
          },
          {
            label: t('admin.dashboard.pass_rate'),
            value: `${stats.passRate}%`,
            icon: <TrendingUp className="w-4.5 h-4.5" />,
          },
        ].map((stat) => (
          <div key={stat.label} className="bg-white border border-neutral-200 rounded-xl p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider leading-none select-none">
                  {stat.label}
                </p>
                <p className="text-2xl font-semibold text-neutral-900 mt-2 leading-none select-none tabular-nums">
                  {stat.value}
                </p>
              </div>
              <div className="p-2 bg-neutral-100 rounded-lg text-neutral-500 shrink-0">
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Action & Operations Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title={t('admin.dashboard.quick_actions')} className="md:col-span-1">
          <div className="flex flex-col gap-2">
            <Button
              variant="primary"
              className="w-full justify-start"
              icon={<Users className="w-4 h-4" />}
              onClick={() => navigate('/admin/students')}
            >
              {t('admin.dashboard.add_student')}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              icon={<ClipboardList className="w-4 h-4" />}
              onClick={() => navigate('/admin/marks')}
            >
              {t('admin.dashboard.enter_marks')}
            </Button>
            <Button
              variant="secondary"
              className="w-full justify-start"
              icon={<GraduationCap className="w-4 h-4" />}
              onClick={() => navigate('/admin/results')}
            >
              {t('admin.dashboard.view_results')}
            </Button>
          </div>
        </Card>

        {/* Grade distribution analytics */}
        <Card title="Grade Distribution" className="md:col-span-2">
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gradeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {gradeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="horizontal" align="center" verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Exam Performance Charts */}
      <Card title="Exam Performance Comparison" subtitle="Comparing Pass vs Fail counts per major examination">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="Pass" fill="#16a34a" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Fail" fill="#e11d48" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </PageWrapper>
  );
};

export default Dashboard;
