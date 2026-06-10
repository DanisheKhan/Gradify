import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Table, { TableRow, TableCell } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import { useAuth } from '../../context/AuthContext';
import { useStudents } from '../../hooks/useStudents';
import { useMarks } from '../../hooks/useMarks';
import { useExams } from '../../hooks/useExams';
import { useSubjects } from '../../hooks/useSubjects';
import { calculateResultSummary } from '../../utils/gradeCalc';
import { Eye, Printer, FileText, ArrowLeft } from 'lucide-react';

export const StudentResults = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  
  const { getStudents } = useStudents();
  const { getMarksByStudent } = useMarks();
  const { getExams } = useExams();
  const { getSubjects } = useSubjects();

  const [student, setStudent] = useState(null);
  const [resultsList, setResultsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if we need to trigger booklet view immediately
  const showBooklet = searchParams.get('booklet') === 'true';

  useEffect(() => {
    const loadResults = async () => {
      setLoading(true);
      try {
        const { data: students } = await getStudents();
        const activeStudent = students?.find((s) => s.user_id === user.id) || students?.[0];

        if (activeStudent) {
          setStudent(activeStudent);

          // Redirect if booklet trigger is requested
          if (showBooklet) {
            navigate(`/student/results/${activeStudent.id}?booklet=true`, { replace: true });
            return;
          }

          const { data: marks } = await getMarksByStudent(activeStudent.id);
          const { data: exams } = await getExams({ class: activeStudent.class });
          const { data: subjects } = await getSubjects({ class: activeStudent.class });

          if (marks && exams && subjects) {
            // Group and compute details per exam
            const summaries = exams.map((exam) => {
              const examMarks = marks.filter((m) => m.exam_id === exam.id);
              const summary = calculateResultSummary(examMarks, subjects);
              return {
                exam,
                ...summary
              };
            }).filter((res) => res.failedSubjectsCount < subjects.length || res.totalObtained > 0); // only show graded exams

            setResultsList(summaries);
          }
        }
      } catch (err) {
        console.error('Failed to load student results list:', err);
      } finally {
        setLoading(false);
      }
    };

    loadResults();
  }, [user, getStudents, getMarksByStudent, getExams, getSubjects, showBooklet, navigate]);

  if (loading) return <Spinner fullPage />;
  if (!student) return <div className="text-center py-10">Student profile not found</div>;

  return (
    <PageWrapper
      title={t('student.results.title')}
      subtitle={`Academic report cards for Class: ${student.class} | Roll No: ${student.roll_number}`}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/student/dashboard')}
          >
            {t('common.back')}
          </Button>
          <Button
            variant="primary"
            icon={<Printer className="w-4 h-4" />}
            onClick={() => navigate(`/student/results/${student.id}?booklet=true`)}
          >
            {t('student.results.print_booklet')}
          </Button>
        </div>
      }
    >
      {resultsList.length === 0 ? (
        <Card className="text-center py-10">
          <p className="text-sm text-neutral-400">
            No exams or results have been entered for your profile yet.
          </p>
        </Card>
      ) : (
        <Table headers={['Exam Name', 'Date', 'Total Score', 'Percentage', 'Overall Grade', 'Status', 'Actions']}>
          {resultsList.map((res) => (
            <TableRow key={res.exam.id}>
              <TableCell className="font-bold text-neutral-800">{res.exam.name}</TableCell>
              <TableCell>{res.exam.exam_date || '-'}</TableCell>
              <TableCell>{res.totalObtained} / {res.totalMax}</TableCell>
              <TableCell>{res.percentage}%</TableCell>
              <TableCell className="font-black text-neutral-700">{res.grade}</TableCell>
              <TableCell>
                <Badge variant={res.status === 'PASS' ? 'success' : 'danger'}>
                  {res.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Eye className="w-4 h-4 text-neutral-500" />}
                    onClick={() => navigate(`/student/results/${student.id}?examId=${res.exam.id}`)}
                  >
                    View Details
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Printer className="w-4 h-4 text-primary-600" />}
                    onClick={() => navigate(`/student/results/${student.id}?examId=${res.exam.id}&print=true`)}
                  >
                    Print Slip
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </Table>
      )}
    </PageWrapper>
  );
};

export default StudentResults;
