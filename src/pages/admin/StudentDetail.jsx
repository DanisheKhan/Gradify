import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PageWrapper from '../../components/layout/PageWrapper';
import Card, { CardFooter } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import Table, { TableRow, TableCell } from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import { useStudents } from '../../hooks/useStudents';
import { useMarks } from '../../hooks/useMarks';
import { useExams } from '../../hooks/useExams';
import { useSubjects } from '../../hooks/useSubjects';
import { useSchool } from '../../hooks/useSchool';
import { calculateResultSummary } from '../../utils/gradeCalc';
import { ArrowLeft, User, Calendar, Phone, MapPin, Edit3, Save, Upload, School } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const StudentDetail = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const { getStudent, updateStudent, loading: studentLoading } = useStudents();
  const { getMarksByStudent } = useMarks();
  const { getExams } = useExams();
  const { getSubjects } = useSubjects();
  const { uploadLogo: uploadPhoto } = useSchool();

  const [student, setStudent] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [studentMarks, setStudentMarks] = useState([]);
  const [exams, setExams] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Editable Form State
  const [formData, setFormData] = useState({
    name: '',
    roll_number: '',
    class: '10',
    section: 'A',
    date_of_birth: '',
    parent_name: '',
    contact_number: '',
    address: '',
    photo_url: ''
  });

  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const loadStudentData = async () => {
      setLoading(true);
      try {
        const { data: studentData } = await getStudent(id);
        if (studentData) {
          setStudent(studentData);
          setFormData(studentData);
          
          // Load other requirements for result summaries
          const { data: marks } = await getMarksByStudent(id);
          const { data: allExams } = await getExams({ class: studentData.class });
          const { data: allSubjects } = await getSubjects({ class: studentData.class });
          
          if (marks) setStudentMarks(marks);
          if (allExams) setExams(allExams);
          if (allSubjects) setSubjects(allSubjects);
        }
      } catch (err) {
        toast.error('Failed to load student details');
      } finally {
        setLoading(false);
      }
    };

    loadStudentData();
  }, [id, getStudent, getMarksByStudent, getExams, getSubjects]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const { error } = await updateStudent(id, formData);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('admin.students.student_updated'));
      setStudent(formData);
      setIsEditing(false);
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { publicUrl, error } = await uploadPhoto(file);
      if (error) throw error;
      
      setFormData((prev) => ({ ...prev, photo_url: publicUrl }));
      // Immediately update student details as well
      await updateStudent(id, { ...formData, photo_url: publicUrl });
      setStudent((prev) => ({ ...prev, photo_url: publicUrl }));
      toast.success('Photo uploaded successfully');
    } catch (err) {
      toast.error('Failed to upload photo');
    } finally {
      setUploading(false);
    }
  };

  // Compute results summaries for rendering
  const computedResults = exams.map((exam) => {
    const examMarks = studentMarks.filter((m) => m.exam_id === exam.id);
    const summary = calculateResultSummary(examMarks, subjects);
    return {
      exam,
      ...summary
    };
  }).filter((res) => res.failedSubjectsCount < subjects.length || res.totalObtained > 0); // show only if marks entered

  if (loading || studentLoading) return <Spinner fullPage />;
  if (!student) return <div className="text-center py-10">Student not found</div>;

  return (
    <PageWrapper
      title={isEditing ? t('admin.students.edit_student') : student.name}
      subtitle={`Roll Number: ${student.roll_number} | Class: ${student.class} Section: ${student.section || '-'}`}
      actions={
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/admin/students')}
          >
            {t('common.back')}
          </Button>
          {!isEditing && (
            <Button
              variant="primary"
              icon={<Edit3 className="w-4 h-4" />}
              onClick={() => setIsEditing(true)}
            >
              {t('common.edit')}
            </Button>
          )}
        </div>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Photo & Details */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="text-center">
            {/* Student Photo */}
            <div className="flex flex-col items-center">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-neutral-100 border-2 border-neutral-200 flex items-center justify-center text-neutral-400">
                  {formData.photo_url ? (
                    <img src={formData.photo_url} alt={student.name} className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-16 h-16 text-neutral-300" />
                  )}
                </div>
                {isEditing && (
                  <label className="absolute bottom-0 end-0 bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-full cursor-pointer shadow-md transition-all">
                    <Upload className="w-4 h-4" />
                    <input type="file" onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                  </label>
                )}
              </div>
              {uploading && <p className="text-xs text-neutral-500 mt-2">Uploading photo...</p>}
              <h3 className="mt-4 font-bold text-neutral-800 text-base leading-none select-none">{student.name}</h3>
              <p className="text-xs text-neutral-500 mt-1 select-none">Roll Number: {student.roll_number}</p>
            </div>

            {/* Quick stats details info */}
            {!isEditing && (
              <div className="mt-6 border-t border-neutral-150 pt-5 space-y-3.5 text-start text-xs select-none">
                <div className="flex items-center gap-2.5 text-neutral-600">
                  <Calendar className="w-4 h-4 text-neutral-400" />
                  <span>DOB: {student.date_of_birth || '-'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-neutral-600">
                  <User className="w-4 h-4 text-neutral-400" />
                  <span>Parent: {student.parent_name}</span>
                </div>
                <div className="flex items-center gap-2.5 text-neutral-600">
                  <Phone className="w-4 h-4 text-neutral-400" />
                  <span>Contact: {student.contact_number || '-'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-neutral-600">
                  <MapPin className="w-4 h-4 text-neutral-400" />
                  <span className="truncate">Address: {student.address || '-'}</span>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Editable details form or exam summaries */}
        <div className="lg:col-span-2">
          {isEditing ? (
            <Card title="Update Profile Details" footer={
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  {t('common.cancel')}
                </Button>
                <Button variant="primary" icon={<Save className="w-4 h-4" />} onClick={handleSave}>
                  {t('common.save')}
                </Button>
              </div>
            }>
              <form className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={t('admin.students.name')}
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                  <Input
                    label={t('admin.students.roll_no')}
                    id="roll_number"
                    required
                    value={formData.roll_number}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label={t('common.class')}
                    id="class"
                    required
                    value={formData.class}
                    onChange={handleInputChange}
                    options={[
                      { value: '9', label: 'Class 9' },
                      { value: '10', label: 'Class 10' },
                      { value: '11', label: 'Class 11' },
                      { value: '12', label: 'Class 12' },
                    ]}
                  />
                  <Input
                    label={t('common.section')}
                    id="section"
                    value={formData.section}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={t('admin.students.dob')}
                    id="date_of_birth"
                    type="date"
                    value={formData.date_of_birth}
                    onChange={handleInputChange}
                  />
                  <Input
                    label={t('admin.students.parent')}
                    id="parent_name"
                    required
                    value={formData.parent_name}
                    onChange={handleInputChange}
                  />
                </div>

                <Input
                  label={t('admin.students.contact')}
                  id="contact_number"
                  value={formData.contact_number}
                  onChange={handleInputChange}
                />

                <Input
                  label={t('admin.students.address')}
                  id="address"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </form>
            </Card>
          ) : (
            <Card title="Academic Performance History" subtitle="Overview of student scorecards and grade sheets">
              <Table headers={['Exam Name', 'Date', 'Percentage', 'Grade', 'Status', 'Actions']}>
                {computedResults.map((res) => (
                  <TableRow key={res.exam.id}>
                    <TableCell className="font-bold text-neutral-800">{res.exam.name}</TableCell>
                    <TableCell>{res.exam.exam_date || '-'}</TableCell>
                    <TableCell>{res.percentage}%</TableCell>
                    <TableCell className="font-semibold text-neutral-700">{res.grade}</TableCell>
                    <TableCell>
                      <Badge variant={res.status === 'PASS' ? 'success' : res.status === 'COMPARTMENT' ? 'warning' : 'danger'}>
                        {res.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/admin/results`)} // redirect to result details
                      >
                        View Slip
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            </Card>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default StudentDetail;
