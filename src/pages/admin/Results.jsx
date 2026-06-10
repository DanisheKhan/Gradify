import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Table, { TableRow, TableCell } from '../../components/ui/Table';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import { useExams, getCachedExams } from '../../hooks/useExams';
import { useStudents, getCachedStudents } from '../../hooks/useStudents';
import { useSubjects, getCachedSubjects } from '../../hooks/useSubjects';
import { useMarks, getCachedMarksByExamClass } from '../../hooks/useMarks';
import { calculateResultSummary } from '../../utils/gradeCalc';
import { Eye, GraduationCap, Printer, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const Results = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { getExams } = useExams();
  const { getStudents } = useStudents();
  const { getSubjects } = useSubjects();
  const { getMarksByExamAndClass, loading: marksLoading } = useMarks();

  const [exams, setExams] = useState(() => getCachedExams() || []);
  const [selectedExamId, setSelectedExamId] = useState(() => {
    const cached = getCachedExams();
    return cached && cached.length > 0 ? cached[0].id : '';
  });
  const [selectedClass, setSelectedClass] = useState('10');

  const [students, setStudents] = useState(() => {
    const cached = getCachedStudents();
    return cached ? cached.filter(s => s.class === '10') : [];
  });
  const [subjects, setSubjects] = useState(() => {
    const cached = getCachedSubjects();
    return cached ? cached.filter(s => s.class === '10') : [];
  });
  const [marksList, setMarksList] = useState(() => {
    const cached = getCachedMarksByExamClass(selectedExamId, '10');
    return cached || [];
  });
  const [loading, setLoading] = useState(false);

  // Load Exam selections
  useEffect(() => {
    const loadExams = async () => {
      const { data } = await getExams();
      if (data) {
        setExams(data);
        if (data.length > 0 && !selectedExamId) setSelectedExamId(data[0].id);
      }
    };
    loadExams();
  }, [getExams]);

  // Load data when selections change
  useEffect(() => {
    if (!selectedExamId || !selectedClass) return;

    const loadData = async () => {
      const cachedM = getCachedMarksByExamClass(selectedExamId, selectedClass);
      const cachedS = getCachedStudents();
      const cachedSub = getCachedSubjects();
      if (!cachedM || !cachedS || !cachedSub) {
        setLoading(true);
      }
      try {
        const { data: classStudents } = await getStudents({ class: selectedClass });
        const { data: classSubjects } = await getSubjects({ class: selectedClass });
        const { data: examMarks } = await getMarksByExamAndClass(selectedExamId, selectedClass);

        if (classStudents) setStudents(classStudents);
        if (classSubjects) setSubjects(classSubjects);
        if (examMarks) setMarksList(examMarks);
      } catch (err) {
        toast.error('Failed to load results data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedExamId, selectedClass, getStudents, getSubjects, getMarksByExamAndClass]);

  // Process data to build list of scorecards
  const results = students.map((student) => {
    const studentMarks = marksList.filter((m) => m.student_id === student.id);
    const summary = calculateResultSummary(studentMarks, subjects);
    return {
      student,
      ...summary
    };
  }).filter((res) => res.failedSubjectsCount < subjects.length || res.totalObtained > 0); // only show if student has marks

  const activeExam = exams.find((e) => e.id === selectedExamId);

  return (
    <PageWrapper
      title={t('nav.results')}
      subtitle="Overview of overall class performance report cards and status summaries"
    >
      {/* Search Filter Box */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Filter by Exam"
            id="exam-select"
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            placeholder="Select Exam"
            options={exams.map((e) => ({ value: e.id, label: `${e.name} (${e.academic_year})` }))}
          />
          <Select
            label="Filter by Class"
            id="class-select"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            options={[
              { value: '9', label: 'Class 9' },
              { value: '10', label: 'Class 10' },
              { value: '11', label: 'Class 11' },
              { value: '12', label: 'Class 12' },
            ]}
          />
        </div>
      </Card>

      {/* Results Table list */}
      {loading ? (
        <Spinner fullPage={false} />
      ) : results.length === 0 ? (
        <Card className="text-center py-10">
          <p className="text-sm text-neutral-400">
            No marks records found for Class {selectedClass} in the selected examination.
          </p>
        </Card>
      ) : (
        <Table
          headers={['Roll No', 'Student Name', 'Total Marks', 'Percentage', 'Overall Grade', 'Status', 'Actions']}
        >
          {results.map((res) => (
            <TableRow key={res.student.id}>
              <TableCell className="font-bold text-neutral-800">{res.student.roll_number}</TableCell>
              <TableCell className="font-semibold text-neutral-700">{res.student.name}</TableCell>
              <TableCell>{res.totalObtained} / {res.totalMax}</TableCell>
              <TableCell>{res.percentage}%</TableCell>
              <TableCell className="font-black text-neutral-700">{res.grade}</TableCell>
              <TableCell>
                <Badge variant={res.status === 'PASS' ? 'success' : res.status === 'COMPARTMENT' ? 'warning' : 'danger'}>
                  {res.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Eye className="w-4 h-4 text-neutral-500" />}
                    onClick={() => navigate(`/admin/results/${res.student.id}?examId=${selectedExamId}`)}
                  >
                    View Slip
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Printer className="w-4 h-4 text-primary-600" />}
                    onClick={() => navigate(`/admin/results/${res.student.id}?examId=${selectedExamId}&print=true`)}
                  >
                    Print
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Download className="w-4 h-4 text-emerald-600" />}
                    onClick={() => navigate(`/admin/results/${res.student.id}?examId=${selectedExamId}&download=true`)}
                  >
                    PDF
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

export default Results;
