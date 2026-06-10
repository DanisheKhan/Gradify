import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useReactToPrint } from 'react-to-print';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';
import Table, { TableRow, TableCell } from '../../components/ui/Table';
import { useStudents } from '../../hooks/useStudents';
import { useMarks } from '../../hooks/useMarks';
import { useExams } from '../../hooks/useExams';
import { useSubjects } from '../../hooks/useSubjects';
import { useSchool } from '../../hooks/useSchool';
import { calculateResultSummary } from '../../utils/gradeCalc';
import { generateSinglePagePDF, generateMultiPagePDF } from '../../utils/pdfGenerator';
import ResultSlip from '../../components/print/ResultSlip';
import MarksheetBooklet from '../../components/print/MarksheetBooklet';
import { ArrowLeft, Printer, Download, Sparkles, BookOpen, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const StudentResultDetail = () => {
  const { id } = useParams();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const examIdParam = searchParams.get('examId');
  const autoPrint = searchParams.get('print') === 'true';
  const showBookletMode = searchParams.get('booklet') === 'true';

  const { getStudent } = useStudents();
  const { getMarksByStudent } = useMarks();
  const { getExams } = useExams();
  const { getSubjects } = useSubjects();
  const { getSchool } = useSchool();

  const [student, setStudent] = useState(null);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [marks, setMarks] = useState([]);
  const [school, setSchool] = useState({});
  
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);

  // Print References
  const printSlipRef = useRef(null);
  const printBookletRef = useRef(null);

  // Load configuration details
  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      try {
        const { data: studentData } = await getStudent(id);
        const { data: schoolData } = await getSchool();
        
        if (studentData) {
          setStudent(studentData);
          if (schoolData) setSchool(schoolData);

          const { data: marksData } = await getMarksByStudent(id);
          const { data: examsData } = await getExams({ class: studentData.class });
          const { data: subjectsData } = await getSubjects({ class: studentData.class });

          if (marksData) setMarks(marksData);
          if (examsData) {
            setExams(examsData);
            // Default selected exam
            if (examIdParam) {
              const matched = examsData.find((e) => e.id === examIdParam);
              setSelectedExam(matched || examsData[0]);
            } else if (examsData.length > 0) {
              setSelectedExam(examsData[0]);
            }
          }
          if (subjectsData) setSubjects(subjectsData);
        }
      } catch (err) {
        toast.error('Failed to load result details');
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [id, examIdParam, getStudent, getSchool, getMarksByStudent, getExams, getSubjects]);

  // Handle auto-print after rendering complete
  useEffect(() => {
    if (!loading && autoPrint && selectedExam) {
      setTimeout(() => {
        handlePrintSlip();
      }, 500);
    }
  }, [loading, autoPrint, selectedExam]);

  // react-to-print hooks
  const handlePrintSlip = useReactToPrint({
    content: () => printSlipRef.current,
    documentTitle: `${student?.name}_Result_Slip`,
  });

  const handlePrintBooklet = useReactToPrint({
    content: () => printBookletRef.current,
    documentTitle: `${student?.name}_Academic_Booklet`,
  });

  const handleDownloadSlipPDF = async () => {
    if (!student || !selectedExam) return;
    setPdfLoading(true);
    try {
      const filename = `${student.name.replace(/\s+/g, '_')}_Result_Slip.pdf`;
      await generateSinglePagePDF(printSlipRef.current, filename);
      toast.success('Result Slip PDF downloaded successfully');
    } catch (err) {
      toast.error('Failed to generate PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  const handleDownloadBookletPDF = async () => {
    if (!student) return;
    setPdfLoading(true);
    try {
      const filename = `${student.name.replace(/\s+/g, '_')}_Booklet.pdf`;
      await generateMultiPagePDF(printBookletRef.current, '.page-break-after', filename);
      toast.success('Marksheet Booklet PDF downloaded successfully');
    } catch (err) {
      toast.error('Failed to generate booklet PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  if (loading) return <Spinner fullPage />;
  if (!student || !selectedExam) return <div className="text-center py-10">Result details not found</div>;

  // Compute scores summary for selected exam
  const examMarks = marks.filter((m) => m.exam_id === selectedExam.id);
  const examSummary = calculateResultSummary(examMarks, subjects);

  return (
    <PageWrapper
      title={showBookletMode ? t('print.marksheet_booklet') : t('print.result_slip')}
      subtitle={showBookletMode ? 'Full Academic Year Multi-page Booklet' : `Single page card view for: ${selectedExam.name}`}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate(-1)}
          >
            {t('common.back')}
          </Button>

          {showBookletMode ? (
            <>
              <Button variant="outline" icon={<Printer className="w-4 h-4" />} onClick={handlePrintBooklet}>
                {t('common.print')}
              </Button>
              <Button variant="primary" loading={pdfLoading} icon={<Download className="w-4 h-4" />} onClick={handleDownloadBookletPDF}>
                {t('common.download_pdf')}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" icon={<Printer className="w-4 h-4" />} onClick={handlePrintSlip}>
                {t('common.print')}
              </Button>
              <Button variant="primary" loading={pdfLoading} icon={<Download className="w-4 h-4" />} onClick={handleDownloadSlipPDF}>
                {t('common.download_pdf')}
              </Button>
            </>
          )}
        </div>
      }
    >
      {showBookletMode ? (
        /* ──────────────── BOOKLET PREVIEW MODE ──────────────── */
        <div className="space-y-6">
          <div className="p-3 bg-amber-50 border border-amber-200/50 rounded-xl flex items-start gap-2.5 text-xs text-amber-800 select-none">
            <Sparkles className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
            <span>Below is the preview of your overall Marksheet Booklet. Click Print or Download PDF to obtain the multi-page booklet.</span>
          </div>

          <div className="bg-neutral-100 p-4 rounded-2xl overflow-y-auto max-h-[800px] border border-neutral-200">
            <MarksheetBooklet
              ref={printBookletRef}
              student={student}
              exams={exams}
              subjects={subjects}
              marks={marks}
              school={school}
            />
          </div>
        </div>
      ) : (
        /* ──────────────── SLIP VIEW PREVIEW MODE ──────────────── */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left panel selectors */}
          <div className="lg:col-span-1 space-y-6">
            <Card title="Result Parameters" subtitle="Select terms to inspect marks detail cards">
              <Select
                label="Active Exam"
                id="exam-select"
                value={selectedExam.id}
                onChange={(e) => {
                  const matched = exams.find((ex) => ex.id === e.target.value);
                  if (matched) setSelectedExam(matched);
                }}
                options={exams.map((e) => ({ value: e.id, label: e.name }))}
              />

              <div className="mt-6 border-t border-neutral-150 pt-5 space-y-4 text-xs select-none">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4.5 h-4.5 text-neutral-400" />
                  <span className="font-semibold text-neutral-500">Graded Subjects:</span>
                  <span className="font-bold text-neutral-800">{subjects.length} Subjects</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4.5 h-4.5 text-neutral-400" />
                  <span className="font-semibold text-neutral-500">Academic Status:</span>
                  <Badge variant={examSummary.status === 'PASS' ? 'success' : 'danger'}>
                    {examSummary.status}
                  </Badge>
                </div>
              </div>
            </Card>
          </div>

          {/* Right scorecard table preview */}
          <div className="lg:col-span-2">
            <Card title="Subject Wise Performance" subtitle={`Examination Date: ${selectedExam.exam_date || '-'}`}>
              <Table headers={['Subject Name', 'Max Marks', 'Obtained', 'Grade', 'Remarks']}>
                {subjects.map((sub) => {
                  const markObj = examMarks.find((m) => m.subject_id === sub.id);
                  const score = markObj ? markObj.marks_obtained : '-';
                  const grade = markObj ? markObj.grade : '-';
                  const remarks = markObj?.remarks || (Number(score) >= sub.pass_marks ? 'Satisfactory' : 'Needs improvement');

                  return (
                    <TableRow key={sub.id}>
                      <TableCell className="font-bold text-neutral-800">{sub.name}</TableCell>
                      <TableCell>{sub.max_marks}</TableCell>
                      <TableCell className="font-bold text-neutral-850">{score}</TableCell>
                      <TableCell className="font-black text-neutral-750">{grade}</TableCell>
                      <TableCell className="italic text-xs text-neutral-500">{remarks}</TableCell>
                    </TableRow>
                  );
                })}
              </Table>

              {/* Total summary panel card */}
              <div className="mt-6 grid grid-cols-3 gap-4 p-4 border border-neutral-200 bg-neutral-50 rounded-xl select-none">
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Total Score</span>
                  <div className="text-sm font-black text-neutral-850 mt-1">
                    {examSummary.totalObtained}/{examSummary.totalMax}
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Percentage</span>
                  <div className="text-sm font-black text-primary-600 mt-1">
                    {examSummary.percentage}%
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold text-neutral-400">Outcome Grade</span>
                  <div className="text-sm font-black text-neutral-800 mt-1">
                    {examSummary.grade}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Hidden print containers (positioned off-screen in absolute layout) */}
          <div className="absolute left-[-9999px] top-[-9999px]">
            <div ref={printSlipRef}>
              <ResultSlip
                student={student}
                exam={selectedExam}
                subjects={subjects}
                marks={examMarks}
                school={school}
                summary={examSummary}
              />
            </div>
            <div ref={printBookletRef}>
              <MarksheetBooklet
                student={student}
                exams={exams}
                subjects={subjects}
                marks={marks}
                school={school}
              />
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default StudentResultDetail;
