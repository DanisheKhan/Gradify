import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { School, Award, FileText, User } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';
import { calculateResultSummary } from '../../utils/gradeCalc';

export const MarksheetBooklet = forwardRef(({
  student,
  exams = [],
  subjects = [],
  marks = [],
  school = {},
}, ref) => {
  const { t, i18n } = useTranslation();

  // Compute summaries across all exams
  const examSummaries = exams.map((exam) => {
    const examMarks = marks.filter((m) => m.exam_id === exam.id);
    const summary = calculateResultSummary(examMarks, subjects);
    return {
      exam,
      ...summary
    };
  }).filter((res) => res.failedSubjectsCount < subjects.length || res.totalObtained > 0);

  // Compute final summary stats
  const totalObtainedSum = examSummaries.reduce((sum, curr) => sum + curr.totalObtained, 0);
  const totalMaxSum = examSummaries.reduce((sum, curr) => sum + curr.totalMax, 0);
  const finalPercentage = totalMaxSum > 0 ? Math.round((totalObtainedSum / totalMaxSum) * 100) : 0;
  
  const hasFailedAny = examSummaries.some((res) => res.status === 'FAIL');
  const finalResult = hasFailedAny ? 'FAIL' : 'PASS';

  return (
    <div
      ref={ref}
      className="w-full bg-white text-neutral-800 max-w-[210mm] mx-auto print:p-0"
      dir={i18n.language === 'ur' ? 'rtl' : 'ltr'}
    >
      {/* ──────────────── PAGE 1: COVER PAGE ──────────────── */}
      <div className="min-h-[297mm] p-12 flex flex-col justify-between border border-neutral-200 shadow-xs mb-8 page-break-after print:border-none print:shadow-none print:m-0 print:p-0 select-none">
        {/* Cover top header */}
        <div className="text-center space-y-3 mt-10">
          <div className="flex justify-center">
            {school.logo_url ? (
              <img src={school.logo_url} alt="School Logo" className="w-20 h-20 object-contain rounded-md" />
            ) : (
              <div className="w-20 h-20 bg-neutral-100 border border-neutral-250 flex items-center justify-center text-neutral-400 rounded-2xl">
                <School className="w-10 h-10" />
              </div>
            )}
          </div>
          <h1 className="text-xl font-black text-neutral-900 tracking-tight">
            {school.name || 'Gradify Academy of Education'}
          </h1>
          <p className="text-xs text-neutral-500 font-medium">
            {school.address}
          </p>
        </div>

        {/* Cover mid section */}
        <div className="flex flex-col items-center space-y-6 my-10">
          <div className="w-28 h-28 rounded-full overflow-hidden bg-neutral-100 border-2 border-neutral-200 flex items-center justify-center text-neutral-400">
            {student.photo_url ? (
              <img src={student.photo_url} alt={student.name} className="w-full h-full object-cover" />
            ) : (
              <User className="w-14 h-14 text-neutral-300" />
            )}
          </div>

          <div className="text-center space-y-1">
            <span className="text-[10px] bg-primary-50 text-primary-600 px-3 py-1 rounded-full font-extrabold uppercase tracking-widest border border-primary-200">
              Official Marksheet Portfolio
            </span>
            <h2 className="text-2xl font-black text-neutral-850 mt-3">{student.name}</h2>
            <p className="text-xs text-neutral-500 font-medium">Roll Number: {student.roll_number}</p>
          </div>
        </div>

        {/* Cover bottom metadata details */}
        <div className="space-y-4 max-w-sm mx-auto w-full border border-neutral-250 bg-neutral-50 rounded-2xl p-5">
          <div className="flex justify-between border-b pb-2 text-xs border-neutral-200">
            <span className="font-semibold text-neutral-500">Class & Section:</span>
            <span className="font-bold text-neutral-800">{student.class} - {student.section || 'A'}</span>
          </div>
          <div className="flex justify-between border-b pb-2 text-xs border-neutral-200">
            <span className="font-semibold text-neutral-500">Academic Term:</span>
            <span className="font-bold text-neutral-800">2024-25</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-neutral-500">Date of Birth:</span>
            <span className="font-bold text-neutral-800">{formatDate(student.date_of_birth, i18n.language)}</span>
          </div>
        </div>

        {/* Cover foot seal */}
        <div className="text-center text-[10px] text-neutral-400 font-semibold select-none pb-6">
          System generated report card portfolio. Gradify Inc.
        </div>
      </div>

      {/* ──────────────── PAGES 2+: INDIVIDUAL EXAMS ──────────────── */}
      {examSummaries.map((res) => {
        const examMarks = marks.filter((m) => m.exam_id === res.exam.id);
        return (
          <div
            key={res.exam.id}
            className="min-h-[297mm] p-12 flex flex-col justify-between border border-neutral-200 shadow-xs mb-8 page-break-after print:border-none print:shadow-none print:m-0 print:p-0"
          >
            <div className="space-y-6">
              {/* Exam title head */}
              <div className="flex items-center justify-between border-b pb-4 border-neutral-300">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary-600" />
                  <h3 className="font-extrabold text-sm text-neutral-800 uppercase tracking-wider">
                    {res.exam.name}
                  </h3>
                </div>
                <span className="text-xs text-neutral-500 font-bold">
                  Date: {formatDate(res.exam.exam_date, i18n.language)}
                </span>
              </div>

              {/* Subject scores table */}
              <div className="overflow-hidden rounded-xl border border-neutral-250">
                <table className="w-full text-xs text-start border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 border-b border-neutral-250 select-none">
                      <th className="px-4 py-3 text-start font-bold text-neutral-600 uppercase tracking-wide">
                        {t('student.results.subject')}
                      </th>
                      <th className="px-4 py-3 text-center font-bold text-neutral-600 uppercase tracking-wide">
                        {t('student.results.max')}
                      </th>
                      <th className="px-4 py-3 text-center font-bold text-neutral-600 uppercase tracking-wide">
                        {t('student.results.obtained')}
                      </th>
                      <th className="px-4 py-3 text-center font-bold text-neutral-600 uppercase tracking-wide">
                        {t('student.results.grade')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {subjects.map((sub) => {
                      const markObj = examMarks.find((m) => m.subject_id === sub.id);
                      const score = markObj ? markObj.marks_obtained : '-';
                      const grade = markObj ? markObj.grade : '-';

                      return (
                        <tr key={sub.id}>
                          <td className="px-4 py-3 font-semibold text-neutral-850">{sub.name}</td>
                          <td className="px-4 py-3 text-center font-medium text-neutral-500">{sub.max_marks}</td>
                          <td className="px-4 py-3 text-center font-bold text-neutral-800">{score}</td>
                          <td className="px-4 py-3 text-center font-black text-neutral-700">{grade}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Exam summary panel */}
              <div className="grid grid-cols-3 gap-6 p-4 border border-neutral-250 bg-neutral-50 rounded-xl select-none">
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Term Score</span>
                  <div className="text-xs font-black text-neutral-800 mt-1">
                    {res.totalObtained} / {res.totalMax}
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Term %</span>
                  <div className="text-xs font-black text-primary-600 mt-1">
                    {res.percentage}%
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Term Grade</span>
                  <div className="text-xs font-black text-neutral-800 mt-1">
                    {res.grade}
                  </div>
                </div>
              </div>
            </div>

            {/* Signature row */}
            <div className="pt-10 border-t border-neutral-200/50 flex justify-between select-none">
              <div className="text-center w-36">
                <div className="border-t border-neutral-400 pt-1.5 text-xs font-bold text-neutral-500 uppercase tracking-wide">
                  {t('print.signature_teacher')}
                </div>
              </div>
              <div className="text-center w-36">
                <div className="border-t border-neutral-400 pt-1.5 text-xs font-bold text-neutral-500 uppercase tracking-wide">
                  {t('print.signature_principal')}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* ──────────────── PAGE LAST: ACADEMIC SUMMARY ──────────────── */}
      {examSummaries.length > 0 && (
        <div className="min-h-[297mm] p-12 flex flex-col justify-between border border-neutral-200 shadow-xs print:border-none print:shadow-none print:m-0 print:p-0">
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b pb-4 border-neutral-300">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-primary-600" />
                <h3 className="font-extrabold text-sm text-neutral-800 uppercase tracking-wider">
                  {t('print.overall_performance')}
                </h3>
              </div>
            </div>

            {/* Overall summary table progress */}
            <div className="overflow-hidden rounded-xl border border-neutral-250">
              <table className="w-full text-xs text-start border-collapse">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-250 select-none">
                    <th className="px-4 py-3 text-start font-bold text-neutral-600 uppercase tracking-wide">
                      Exam Name
                    </th>
                    <th className="px-4 py-3 text-center font-bold text-neutral-600 uppercase tracking-wide">
                      Total Score
                    </th>
                    <th className="px-4 py-3 text-center font-bold text-neutral-600 uppercase tracking-wide">
                      Percentage
                    </th>
                    <th className="px-4 py-3 text-center font-bold text-neutral-600 uppercase tracking-wide">
                      Grade
                    </th>
                    <th className="px-4 py-3 text-center font-bold text-neutral-600 uppercase tracking-wide">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {examSummaries.map((res) => (
                    <tr key={res.exam.id}>
                      <td className="px-4 py-3 font-semibold text-neutral-850">{res.exam.name}</td>
                      <td className="px-4 py-3 text-center font-bold text-neutral-700">{res.totalObtained}/{res.totalMax}</td>
                      <td className="px-4 py-3 text-center font-black text-primary-600">{res.percentage}%</td>
                      <td className="px-4 py-3 text-center font-black text-neutral-800">{res.grade}</td>
                      <td className="px-4 py-3 text-center font-bold">
                        <span className={res.status === 'PASS' ? 'text-emerald-600' : 'text-rose-600'}>
                          {res.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Overall summary card */}
            <div className="grid grid-cols-2 gap-6 p-5 border border-neutral-250 bg-neutral-50 rounded-2xl select-none">
              <div className="flex flex-col justify-center border-e border-neutral-200">
                <span className="text-[10px] uppercase font-bold text-neutral-400">Cumulative Progress</span>
                <div className="text-xl font-black text-primary-600 mt-1">
                  {finalPercentage}%
                </div>
              </div>
              <div className="flex flex-col justify-center ps-2">
                <span className="text-[10px] uppercase font-bold text-neutral-400">Final Outcome</span>
                <div className={`text-xl font-black mt-1 ${finalResult === 'PASS' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {finalResult === 'PASS' ? 'PROMOTED' : 'DETAINED'}
                </div>
              </div>
            </div>

            {/* Remarks Container Box */}
            <div className="space-y-2 select-none">
              <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                Principal Remarks & Recommendations
              </label>
              <div className="h-28 border border-neutral-250 bg-neutral-50/50 rounded-xl p-4 text-xs font-semibold text-neutral-600 italic">
                {finalResult === 'PASS' 
                  ? 'Excellent cumulative academic behavior and outstanding discipline. Promoted to the next class tier.'
                  : 'Requires special academic assistance and supplementary classes. Detained for class repetition.'
                }
              </div>
            </div>
          </div>

          {/* Signature and Seal stamp area */}
          <div className="pt-10 border-t border-neutral-200/50 flex justify-between select-none">
            <div className="text-center w-36">
              <div className="border-t border-neutral-400 pt-1.5 text-xs font-bold text-neutral-500 uppercase tracking-wide">
                Class Coordinator
              </div>
            </div>
            <div className="text-center w-36">
              <div className="border-t border-neutral-400 pt-1.5 text-xs font-bold text-neutral-500 uppercase tracking-wide">
                School Principal Seal
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

MarksheetBooklet.displayName = 'MarksheetBooklet';
export default MarksheetBooklet;
