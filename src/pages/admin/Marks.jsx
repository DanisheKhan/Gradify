import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PageWrapper from '../../components/layout/PageWrapper';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import { useExams, getCachedExams } from '../../hooks/useExams';
import { useStudents, getCachedStudents } from '../../hooks/useStudents';
import { useSubjects, getCachedSubjects } from '../../hooks/useSubjects';
import { useMarks, getCachedMarksByExamClass } from '../../hooks/useMarks';
import { calculateGrade } from '../../utils/gradeCalc';
import { Save, AlertCircle, BookOpen, Users, Trophy, TrendingUp, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Soft pastel accent palette per subject column (cycles)
const SUBJECT_ACCENTS = [
  { header: 'bg-violet-50 text-violet-700', ring: 'focus:ring-violet-400/40 focus:border-violet-400', badge: 'text-violet-600', dot: 'bg-violet-400' },
  { header: 'bg-sky-50 text-sky-700',    ring: 'focus:ring-sky-400/40 focus:border-sky-400',    badge: 'text-sky-600',    dot: 'bg-sky-400' },
  { header: 'bg-emerald-50 text-emerald-700', ring: 'focus:ring-emerald-400/40 focus:border-emerald-400', badge: 'text-emerald-600', dot: 'bg-emerald-400' },
  { header: 'bg-amber-50 text-amber-700', ring: 'focus:ring-amber-400/40 focus:border-amber-400', badge: 'text-amber-600', dot: 'bg-amber-400' },
  { header: 'bg-rose-50 text-rose-700',  ring: 'focus:ring-rose-400/40 focus:border-rose-400',  badge: 'text-rose-600',  dot: 'bg-rose-400' },
  { header: 'bg-indigo-50 text-indigo-700', ring: 'focus:ring-indigo-400/40 focus:border-indigo-400', badge: 'text-indigo-600', dot: 'bg-indigo-400' },
];

export const Marks = () => {
  const { t } = useTranslation();

  const { getExams } = useExams();
  const { getStudents } = useStudents();
  const { getSubjects } = useSubjects();
  const { getMarksByExamAndClass, upsertMarks, loading: marksLoading } = useMarks();

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
  const [marksGrid, setMarksGrid] = useState(() => {
    const cachedM = getCachedMarksByExamClass(selectedExamId, '10');
    const cachedS = getCachedStudents();
    const cachedSub = getCachedSubjects();
    if (cachedM && cachedS && cachedSub) {
      const grid = {};
      const classStudents = cachedS.filter(s => s.class === '10');
      const classSubjects = cachedSub.filter(s => s.class === '10');
      classStudents.forEach((s) => {
        grid[s.id] = {};
        classSubjects.forEach((sub) => {
          const markObj = cachedM.find(m => m.student_id === s.id && m.subject_id === sub.id);
          grid[s.id][sub.id] = markObj ? markObj.marks_obtained : '';
        });
      });
      return grid;
    }
    return {};
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [focusedCell, setFocusedCell] = useState(null);

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

  useEffect(() => {
    if (!selectedExamId || !selectedClass) return;
    const loadGridData = async () => {
      const cachedM = getCachedMarksByExamClass(selectedExamId, selectedClass);
      const cachedS = getCachedStudents();
      const cachedSub = getCachedSubjects();
      if (!cachedM || !cachedS || !cachedSub) {
        setLoading(true);
      }
      try {
        const { data: classStudents } = await getStudents({ class: selectedClass });
        const { data: classSubjects } = await getSubjects({ class: selectedClass });
        const { data: enteredMarks } = await getMarksByExamAndClass(selectedExamId, selectedClass);

        if (classStudents) setStudents(classStudents);
        if (classSubjects) setSubjects(classSubjects);

        const grid = {};
        classStudents?.forEach((s) => {
          grid[s.id] = {};
          classSubjects?.forEach((sub) => {
            const markObj = enteredMarks?.find(
              (m) => m.student_id === s.id && m.subject_id === sub.id
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
    const subjectObj = subjects.find((sub) => sub.id === subjectId);
    if (subjectObj && numericVal !== '' && (numericVal < 0 || numericVal > subjectObj.max_marks)) return;
    setMarksGrid((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [subjectId]: val },
    }));
  };

  const calculateStudentSummary = (studentId) => {
    const studentMarks = marksGrid[studentId] || {};
    let totalObtained = 0, totalMax = 0, failed = false, hasEntries = false;
    subjects.forEach((sub) => {
      const val = studentMarks[sub.id];
      if (val !== '' && val !== undefined) {
        hasEntries = true;
        totalObtained += Number(val);
        totalMax += sub.max_marks;
        if (Number(val) < sub.pass_marks) failed = true;
      }
    });
    if (!hasEntries) return { total: '—', percentage: '—', grade: '—', status: '—' };
    const percentage = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
    return {
      total: `${totalObtained}/${totalMax}`,
      percentage: `${percentage}%`,
      grade: calculateGrade(totalObtained, totalMax),
      status: failed ? 'FAIL' : 'PASS',
      pct: percentage,
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
              grade: calculateGrade(Number(val), 100),
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
  const totalStudentsWithMarks = students.filter(s => {
    const sm = marksGrid[s.id] || {};
    return Object.values(sm).some(v => v !== '' && v !== undefined);
  }).length;

  return (
    <PageWrapper
      title={t('nav.marks')}
      subtitle="Input and modify exam results inside a spreadsheet grid layout"
      actions={
        <button
          onClick={handleSave}
          disabled={saving || marksLoading || students.length === 0}
          id="save-marks-btn"
          className={`
            relative inline-flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white
            bg-gradient-to-r from-primary-600 to-violet-600 shadow-lg shadow-primary-500/25
            hover:from-primary-500 hover:to-violet-500 hover:shadow-primary-500/40 hover:-translate-y-px
            active:translate-y-0 active:shadow-md
            transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-lg
          `}
        >
          {saving || marksLoading ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {t('common.save')}
        </button>
      }
    >
      {/* ── Filter Card ── */}
      <div className="bg-white border border-neutral-200/80 rounded-2xl shadow-sm overflow-hidden">
        {/* Card header strip */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-800 leading-none">Examination Filter</p>
            <p className="text-xs text-neutral-400 mt-0.5">Select exam and class to load the marks grid</p>
          </div>
          {activeExam && (
            <span className="ms-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 text-primary-700 text-xs font-semibold ring-1 ring-primary-100">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
              {activeExam.name}
            </span>
          )}
        </div>
        <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
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
              { value: '9',  label: 'Class 9' },
              { value: '10', label: 'Class 10' },
              { value: '11', label: 'Class 11' },
              { value: '12', label: 'Class 12' },
            ]}
          />
        </div>
      </div>

      {/* ── Stats Pills ── */}
      {students.length > 0 && !loading && (
        <div className="flex flex-wrap gap-3">
          <StatPill icon={<Users className="w-3.5 h-3.5" />} label="Students" value={students.length} color="text-sky-600 bg-sky-50 ring-sky-100" />
          <StatPill icon={<BookOpen className="w-3.5 h-3.5" />} label="Subjects" value={subjects.length} color="text-violet-600 bg-violet-50 ring-violet-100" />
          <StatPill icon={<TrendingUp className="w-3.5 h-3.5" />} label="Entries Done" value={totalStudentsWithMarks} color="text-emerald-600 bg-emerald-50 ring-emerald-100" />
        </div>
      )}

      {/* ── Grid Table ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="w-10 h-10 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <p className="text-sm text-neutral-400 font-medium">Loading marks grid…</p>
        </div>
      ) : students.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white border border-neutral-200 rounded-2xl">
          <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center">
            <Users className="w-7 h-7 text-neutral-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-neutral-700">No students found</p>
            <p className="text-xs text-neutral-400 mt-1 max-w-xs">
              No students are enrolled in Class {selectedClass}. Please add students before entering marks.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Info banner */}
          <div className="flex items-start gap-2.5 px-4 py-3 bg-indigo-50/60 border border-indigo-200/50 rounded-xl text-xs text-indigo-700 select-none">
            <AlertCircle className="w-4 h-4 shrink-0 text-indigo-500 mt-px" />
            <span className="leading-relaxed">{t('admin.marks.auto_calc_note')}</span>
          </div>

          {/* Table */}
          <div className="w-full overflow-x-auto rounded-2xl border border-neutral-200/80 bg-white shadow-sm">
            <table className="w-full text-start border-collapse">
              <thead>
                <tr className="border-b border-neutral-100">
                  {/* Roll No */}
                  <th className="px-5 py-4 text-start sticky left-0 z-10 bg-white border-r border-neutral-100">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Roll No</span>
                  </th>
                  {/* Name */}
                  <th className="px-5 py-4 text-start">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Student Name</span>
                  </th>
                  {/* Subject headers */}
                  {subjects.map((sub, idx) => {
                    const accent = SUBJECT_ACCENTS[idx % SUBJECT_ACCENTS.length];
                    return (
                      <th key={sub.id} className="px-4 py-3 text-center min-w-[110px]">
                        <div className={`inline-flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg ${accent.header}`}>
                          <span className="text-[10px] font-bold uppercase tracking-wider leading-none">{sub.name}</span>
                          <span className="text-[9px] font-medium opacity-70">max {sub.max_marks} · pass {sub.pass_marks}</span>
                        </div>
                      </th>
                    );
                  })}
                  {/* Summary headers */}
                  {[
                    { label: 'Total', icon: '∑' },
                    { label: '%', icon: null },
                    { label: 'Grade', icon: <Trophy className="w-3 h-3" /> },
                    { label: 'Status', icon: null },
                  ].map(({ label, icon }) => (
                    <th key={label} className="px-5 py-4 text-center">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                        {icon}{label}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {students.map((student, rowIdx) => {
                  const summary = calculateStudentSummary(student.id);
                  const isEven = rowIdx % 2 === 0;
                  return (
                    <tr
                      key={student.id}
                      className={`group transition-colors duration-100 ${isEven ? 'bg-white' : 'bg-neutral-50/40'} hover:bg-primary-50/30 border-b border-neutral-100/80 last:border-0`}
                    >
                      {/* Roll No */}
                      <td className={`px-5 py-3.5 sticky left-0 z-10 border-r border-neutral-100 ${isEven ? 'bg-white' : 'bg-neutral-50/40'} group-hover:bg-primary-50/30 transition-colors`}>
                        <span className="inline-flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-400 opacity-60" />
                          <span className="text-xs font-bold text-neutral-500 font-mono">{student.roll_number}</span>
                        </span>
                      </td>
                      {/* Name */}
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-white leading-none">
                              {student.name?.charAt(0)?.toUpperCase()}
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-neutral-800">{student.name}</span>
                        </div>
                      </td>

                      {/* Mark input cells */}
                      {subjects.map((sub, subIdx) => {
                        const accent = SUBJECT_ACCENTS[subIdx % SUBJECT_ACCENTS.length];
                        const val = marksGrid[student.id]?.[sub.id] ?? '';
                        const isFailed = val !== '' && Number(val) < sub.pass_marks;
                        const cellKey = `${student.id}-${sub.id}`;
                        const isFocused = focusedCell === cellKey;

                        return (
                          <td key={sub.id} className="px-3 py-2.5 text-center">
                            <div className="relative inline-block">
                              <input
                                type="number"
                                id={`marks-${student.id}-${sub.id}`}
                                className={`
                                  w-[4.5rem] h-9 px-2 text-center text-xs font-bold rounded-xl outline-none border-2 transition-all duration-150
                                  ${isFailed
                                    ? 'border-red-300 bg-red-50 text-red-600 focus:border-red-400 focus:ring-2 focus:ring-red-300/30'
                                    : val !== ''
                                      ? `border-transparent bg-neutral-100/80 text-neutral-800 ${accent.ring} focus:border-current focus:ring-2 focus:bg-white`
                                      : `border-neutral-200 bg-transparent text-neutral-600 hover:border-neutral-300 ${accent.ring} focus:border-current focus:ring-2 focus:bg-white`
                                  }
                                `}
                                placeholder="—"
                                value={val}
                                min="0"
                                max={sub.max_marks}
                                onFocus={() => setFocusedCell(cellKey)}
                                onBlur={() => setFocusedCell(null)}
                                onChange={(e) => handleCellChange(student.id, sub.id, e.target.value)}
                              />
                              {isFailed && (
                                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500 ring-1 ring-white" />
                              )}
                            </div>
                          </td>
                        );
                      })}

                      {/* Total */}
                      <td className="px-5 py-3.5 text-center whitespace-nowrap select-none">
                        <span className="text-xs font-bold text-neutral-700 tabular-nums">{summary.total}</span>
                      </td>

                      {/* Percentage */}
                      <td className="px-5 py-3.5 text-center whitespace-nowrap select-none">
                        {summary.pct !== undefined ? (
                          <div className="inline-flex flex-col items-center gap-1">
                            <span className={`text-xs font-bold tabular-nums ${
                              summary.pct >= 75 ? 'text-emerald-600' : summary.pct >= 50 ? 'text-amber-600' : 'text-red-500'
                            }`}>{summary.percentage}</span>
                            <div className="w-12 h-1 rounded-full bg-neutral-200 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  summary.pct >= 75 ? 'bg-emerald-500' : summary.pct >= 50 ? 'bg-amber-400' : 'bg-red-400'
                                }`}
                                style={{ width: `${summary.pct}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-neutral-400">—</span>
                        )}
                      </td>

                      {/* Grade */}
                      <td className="px-5 py-3.5 text-center whitespace-nowrap select-none">
                        {summary.grade !== '—' ? (
                          <span className={`
                            inline-flex items-center justify-center w-8 h-8 rounded-xl text-xs font-black
                            ${summary.pct >= 90 ? 'bg-emerald-100 text-emerald-700' :
                              summary.pct >= 75 ? 'bg-sky-100 text-sky-700' :
                              summary.pct >= 50 ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-600'}
                          `}>
                            {summary.grade}
                          </span>
                        ) : <span className="text-xs text-neutral-400">—</span>}
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5 text-center whitespace-nowrap select-none">
                        {summary.status !== '—' ? (
                          <span className={`
                            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide ring-1
                            ${summary.status === 'PASS'
                              ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                              : 'bg-red-50 text-red-600 ring-red-200'
                            }
                          `}>
                            <span className={`w-1.5 h-1.5 rounded-full ${summary.status === 'PASS' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            {summary.status}
                          </span>
                        ) : <span className="text-xs text-neutral-400">—</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer hint */}
          <p className="text-[11px] text-neutral-400 text-center select-none">
            Click any cell to enter marks · Red dot = below passing marks · Changes are saved only when you click Save
          </p>
        </div>
      )}
    </PageWrapper>
  );
};

// Tiny helper component
const StatPill = ({ icon, label, value, color }) => (
  <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full ring-1 text-xs font-semibold select-none ${color}`}>
    {icon}
    <span>{value} {label}</span>
  </div>
);

export default Marks;
