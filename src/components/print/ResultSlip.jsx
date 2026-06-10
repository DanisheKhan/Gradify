import React, { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { School } from 'lucide-react';
import { formatDate } from '../../utils/dateFormatter';

export const ResultSlip = forwardRef(({
  student,
  exam,
  subjects = [],
  marks = [],
  school = {},
  summary = {},
}, ref) => {
  const { t, i18n } = useTranslation();

  return (
    <div
      ref={ref}
      className="w-full bg-white p-8 sm:p-12 text-neutral-800 flex flex-col justify-between min-h-[297mm] max-w-[210mm] border border-neutral-200 shadow-xs mx-auto print:border-none print:shadow-none print:p-0"
      dir={i18n.language === 'ur' ? 'rtl' : 'ltr'}
    >
      {/* Header school branding */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b pb-5 border-neutral-300">
          <div className="flex items-center gap-3">
            {school.logo_url ? (
              <img src={school.logo_url} alt="School Logo" className="w-14 h-14 object-contain rounded-md" />
            ) : (
              <div className="w-14 h-14 bg-neutral-100 border border-neutral-250 flex items-center justify-center text-neutral-400 rounded-lg">
                <School className="w-8 h-8" />
              </div>
            )}
            <div>
              <h2 className="text-lg font-black text-neutral-900 tracking-tight leading-none">
                {school.name || 'Gradify International School'}
              </h2>
              <p className="text-xs text-neutral-500 font-medium mt-1">
                {school.address || '123 Education Lane, Vashi, Navi Mumbai, India'}
              </p>
            </div>
          </div>
          <div className="text-end select-none">
            <span className="px-3 py-1 bg-neutral-100 border border-neutral-250 text-neutral-600 rounded-lg text-xs font-extrabold uppercase tracking-wide">
              {t('print.result_slip')}
            </span>
          </div>
        </div>

        {/* Student metadata profiles */}
        <div className="grid grid-cols-2 gap-y-3.5 gap-x-6 text-xs bg-neutral-50 border border-neutral-200 rounded-xl p-4 mt-6 select-none">
          <div className="flex justify-between border-b border-neutral-200/50 pb-1.5">
            <span className="font-semibold text-neutral-500">Student Name:</span>
            <span className="font-bold text-neutral-800">{student.name}</span>
          </div>
          <div className="flex justify-between border-b border-neutral-200/50 pb-1.5">
            <span className="font-semibold text-neutral-500">Roll Number:</span>
            <span className="font-bold text-neutral-800">{student.roll_number}</span>
          </div>
          <div className="flex justify-between border-b border-neutral-200/50 pb-1.5">
            <span className="font-semibold text-neutral-500">Class & Section:</span>
            <span className="font-bold text-neutral-800">{student.class} - {student.section || 'A'}</span>
          </div>
          <div className="flex justify-between border-b border-neutral-200/50 pb-1.5">
            <span className="font-semibold text-neutral-500">Examination:</span>
            <span className="font-bold text-neutral-800">{exam.name} ({exam.academic_year})</span>
          </div>
          <div className="flex justify-between pb-0.5 col-span-2">
            <span className="font-semibold text-neutral-500">Date of Birth:</span>
            <span className="font-bold text-neutral-800">{formatDate(student.date_of_birth, i18n.language)}</span>
          </div>
        </div>

        {/* Subjects list grades scorecard table */}
        <div className="mt-8 overflow-hidden rounded-xl border border-neutral-250">
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
                <th className="px-4 py-3 text-start font-bold text-neutral-600 uppercase tracking-wide">
                  {t('student.results.remarks')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {subjects.map((sub) => {
                const markObj = marks.find((m) => m.subject_id === sub.id);
                const score = markObj ? markObj.marks_obtained : '-';
                const grade = markObj ? markObj.grade : '-';
                const remarks = markObj?.remarks || (Number(score) >= sub.pass_marks ? 'Satisfactory' : 'Needs improvement');

                return (
                  <tr key={sub.id} className="hover:bg-neutral-50/10">
                    <td className="px-4 py-3 font-semibold text-neutral-850">{sub.name}</td>
                    <td className="px-4 py-3 text-center font-medium text-neutral-500">{sub.max_marks}</td>
                    <td className="px-4 py-3 text-center font-bold text-neutral-800">{score}</td>
                    <td className="px-4 py-3 text-center font-black text-neutral-700">{grade}</td>
                    <td className="px-4 py-3 text-start text-neutral-500 italic font-medium">{remarks}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Results summary panel */}
        <div className="mt-8 grid grid-cols-3 gap-6 p-5 border border-neutral-250 bg-neutral-50 rounded-xl select-none">
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-neutral-400">Total Score</span>
            <div className="text-sm font-black text-neutral-800 mt-1">
              {summary.totalObtained} / {summary.totalMax}
            </div>
          </div>
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-neutral-400">{t('student.results.percentage')}</span>
            <div className="text-sm font-black text-primary-600 mt-1">
              {summary.percentage}%
            </div>
          </div>
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-neutral-400">{t('student.results.result')}</span>
            <div className={`text-sm font-black mt-1 ${summary.status === 'PASS' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {summary.status === 'PASS' ? t('grades.pass') : t('grades.fail')}
            </div>
          </div>
        </div>
      </div>

      {/* Signature block area */}
      <div className="mt-12 pt-10 border-t border-neutral-200/50 flex justify-between select-none">
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
});

ResultSlip.displayName = 'ResultSlip';
export default ResultSlip;
