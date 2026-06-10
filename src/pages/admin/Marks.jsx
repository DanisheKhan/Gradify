import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PageWrapper from '../../components/layout/PageWrapper';
import Card, { CardFooter } from '../../components/ui/Card';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import { useExams } from '../../hooks/useExams';
import { useStudents } from '../../hooks/useStudents';
import { useSubjects } from '../../hooks/useSubjects';
import { useMarks } from '../../hooks/useMarks';
import { calculateGrade } from '../../utils/gradeCalc';
import { Save, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const Marks = () => {
  const { t } = useTranslation();
  
  const { getExams } = useExams();
  const { getStudents } = useStudents();
  const { getSubjects } = useSubjects();
  const { getMarksByExamAndClass, upsertMarks, loading: marksLoading } = useMarks();

  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedClass, setSelectedClass] = useState('10');
  
  const [students, setStudents] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [marksGrid, setMarksGrid] = useState({}); // studentId -> subjectId -> obtainedMarks
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load Exam selections
  useEffect(() => {
    const loadExams = async () => {
      const { data } = await getExams();
      if (data) {
        setExams(data);
        if (data.length > 0) setSelectedExamId(data[0].id);
      }
    };
    loadExams();
  }, [getExams]);

  // Load grid details when exam/class changes
  useEffect(() => {
    if (!selectedExamId || !selectedClass) return;

    const loadGridData = async () => {
      setLoading(true);
      try {
        const { data: classStudents } = await getStudents({ class: selectedClass });
        const { data: classSubjects } = await getSubjects({ class: selectedClass });
        const { data: enteredMarks } = await getMarksByExamAndClass(selectedExamId, selectedClass);

        if (classStudents) setStudents(classStudents);
        if (classSubjects) setSubjects(classSubjects);

        // Map entered marks to grid structure
        const grid = {};
        classStudents?.forEach((s) => {
          grid[s.id] = {};
          classSubjects?.forEach((sub) => {
            // Find existing mark
            const markObj = enteredMarks?.find(
              (m) => (m.student_id === s.id && m.subject_id === sub.id)
            );
            grid[s.id][sub.id] = markObj ? markObj.marks_obtained : '';
          });
        });

        setMarksGrid(grid);
      } catch (err) {
        toast.error('Failed to load marks grid data');
      } finally {
        setLoading(false);
      }
    };

    loadGridData();
  }, [selectedExamId, selectedClass, getStudents, getSubjects, getMarksByExamAndClass]);

  const handleCellChange = (studentId, subjectId, val) => {
    const numericVal = val === '' ? '' : Number(val);
    
    // Bounds check
    const subjectObj = subjects.find((sub) => sub.id === subjectId);
    if (subjectObj && numericVal !== '' && (numericVal < 0 || numericVal > subjectObj.max_marks)) {
      return; // prevent entry outside limits
    }

    setMarksGrid((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: val
      }
    }));
  };

  const calculateStudentSummary = (studentId) => {
    const studentMarks = marksGrid[studentId] || {};
    let totalObtained = 0;
    let totalMax = 0;
    let failed = false;
    let hasEntries = false;

    subjects.forEach((sub) => {
      const val = studentMarks[sub.id];
      if (val !== '' && val !== undefined) {
        hasEntries = true;
        totalObtained += Number(val);
        totalMax += sub.max_marks;
        if (Number(val) < sub.pass_marks) {
          failed = true;
        }
      }
    });

    if (!hasEntries) return { total: '-', percentage: '-', grade: '-', status: '-' };

    const percentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
    const grade = calculateGrade(totalObtained, totalMax);

    return {
      total: `${totalObtained}/${totalMax}`,
      percentage: `${percentage}%`,
      grade,
      status: failed ? 'FAIL' : 'PASS'
    };
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const recordsToUpsert = [];

      Object.keys(marksGrid).forEach((studentId) => {
        const studentMarks = marksGrid[studentId];
        Object.keys(studentMarks).forEach((subjectId) => {
          const val = studentMarks[subjectId];
          if (val !== '' && val !== undefined) {
            recordsToUpsert.push({
              student_id: studentId,
              exam_id: selectedExamId,
              subject_id: subjectId,
              marks_obtained: Number(val),
              grade: calculateGrade(Number(val), 100) // standard lookup
            });
          }
        });
      });

      if (recordsToUpsert.length === 0) {
        toast.error('No marks entered to save.');
        setSaving(false);
        return;
      }

      const { error } = await upsertMarks(recordsToUpsert);
      if (error) throw error;

      toast.success(t('admin.marks.marks_saved'));
    } catch (err) {
      toast.error('Failed to save marks records');
    } finally {
      setSaving(false);
    }
  };

  const activeExam = exams.find((e) => e.id === selectedExamId);

  return (
    <PageWrapper
      title={t('nav.marks')}
      subtitle="Input and modify exam results inside a spreadsheet grid layout"
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            onClick={handleSave}
            loading={saving || marksLoading}
            icon={<Save className="w-4 h-4" />}
            disabled={students.length === 0}
          >
            {t('common.save')}
          </Button>
        </div>
      }
    >
      {/* Filtering Selector */}
      <Card className="mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Select Examination"
            id="exam-select"
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            placeholder="Select Exam"
            options={exams.map((e) => ({ value: e.id, label: `${e.name} (${e.academic_year})` }))}
          />
          <Select
            label="Select Class"
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

      {/* Grid Table Container */}
      {loading ? (
        <Spinner fullPage={false} />
      ) : students.length === 0 ? (
        <Card className="text-center py-10">
          <p className="text-sm text-neutral-400">
            No students enrolled in Class {selectedClass}. Please enroll students before entering marks.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Note Banner */}
          <div className="p-3 bg-indigo-50 border border-indigo-200/50 rounded-xl flex items-start gap-2.5 text-xs text-indigo-700 select-none">
            <AlertCircle className="w-4 h-4 shrink-0 text-indigo-500 mt-0.5" />
            <span>{t('admin.marks.auto_calc_note')}</span>
          </div>

          <div className="w-full overflow-x-auto border border-neutral-200 rounded-xl bg-white shadow-xs">
            <table className="w-full text-start border-collapse">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="px-5 py-3.5 text-start text-xs font-bold text-neutral-600 uppercase tracking-wider select-none min-w-[80px]">
                    Roll No
                  </th>
                  <th className="px-5 py-3.5 text-start text-xs font-bold text-neutral-600 uppercase tracking-wider select-none min-w-[150px]">
                    Student Name
                  </th>
                  {subjects.map((sub) => (
                    <th
                      key={sub.id}
                      className="px-5 py-3.5 text-center text-xs font-bold text-neutral-600 uppercase tracking-wider select-none min-w-[110px]"
                    >
                      <div>{sub.name}</div>
                      <div className="text-[10px] text-neutral-400 lowercase font-medium mt-0.5">
                        max {sub.max_marks} / pass {sub.pass_marks}
                      </div>
                    </th>
                  ))}
                  <th className="px-5 py-3.5 text-center text-xs font-bold text-neutral-600 uppercase tracking-wider select-none min-w-[90px]">
                    Total
                  </th>
                  <th className="px-5 py-3.5 text-center text-xs font-bold text-neutral-600 uppercase tracking-wider select-none min-w-[80px]">
                    %
                  </th>
                  <th className="px-5 py-3.5 text-center text-xs font-bold text-neutral-600 uppercase tracking-wider select-none min-w-[80px]">
                    Grade
                  </th>
                  <th className="px-5 py-3.5 text-center text-xs font-bold text-neutral-600 uppercase tracking-wider select-none min-w-[80px]">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-150">
                {students.map((student) => {
                  const summary = calculateStudentSummary(student.id);
                  return (
                    <tr key={student.id} className="hover:bg-neutral-50/50 transition-colors">
                      <td className="px-5 py-3.5 text-sm font-bold text-neutral-800 whitespace-nowrap">
                        {student.roll_number}
                      </td>
                      <td className="px-5 py-3.5 text-sm font-semibold text-neutral-700 whitespace-nowrap">
                        {student.name}
                      </td>
                      
                      {/* Interactive Marks Cells */}
                      {subjects.map((sub) => {
                        const val = marksGrid[student.id]?.[sub.id] ?? '';
                        const isFailed = val !== '' && Number(val) < sub.pass_marks;
                        return (
                          <td key={sub.id} className="px-3 py-2 text-center whitespace-nowrap">
                            <input
                              type="number"
                              className={`
                                w-16 px-2 py-1.5 text-center text-xs font-bold bg-white border rounded-lg outline-hidden transition-all
                                focus:ring-1 focus:ring-primary-600 focus:border-primary-600
                                ${isFailed 
                                  ? 'border-red-300 bg-red-50/10 focus:ring-red-500 focus:border-red-500 text-red-600' 
                                  : 'border-neutral-250 hover:border-neutral-350 text-neutral-800'
                                }
                              `}
                              placeholder="-"
                              value={val}
                              min="0"
                              max={sub.max_marks}
                              onChange={(e) => handleCellChange(student.id, sub.id, e.target.value)}
                            />
                          </td>
                        );
                      })}

                      {/* Computed Summary Columns */}
                      <td className="px-5 py-3.5 text-center text-xs font-bold text-neutral-600 whitespace-nowrap select-none">
                        {summary.total}
                      </td>
                      <td className="px-5 py-3.5 text-center text-xs font-bold text-neutral-600 whitespace-nowrap select-none">
                        {summary.percentage}
                      </td>
                      <td className="px-5 py-3.5 text-center whitespace-nowrap select-none">
                        {summary.grade !== '-' ? (
                          <span className="text-xs font-black text-neutral-700">{summary.grade}</span>
                        ) : '-'}
                      </td>
                      <td className="px-5 py-3.5 text-center whitespace-nowrap select-none">
                        {summary.status !== '-' ? (
                          <Badge variant={summary.status === 'PASS' ? 'success' : 'danger'}>
                            {summary.status}
                          </Badge>
                        ) : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default Marks;
