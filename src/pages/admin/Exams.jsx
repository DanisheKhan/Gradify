import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Table, { TableRow, TableCell } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import { useExams } from '../../hooks/useExams';
import { Plus, Edit2, Trash2, Calendar, ClipboardList } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const Exams = () => {
  const { t } = useTranslation();
  const { loading, getExams, createExam, updateExam, deleteExam } = useExams();

  const [exams, setExams] = useState([]);
  const [classFilter, setClassFilter] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    class: '10',
    academic_year: '2024-25',
    exam_date: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadExams = async () => {
      const { data } = await getExams({ class: classFilter });
      if (data) setExams(data);
    };
    loadExams();
  }, [getExams, classFilter, refreshKey]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Exam name is required';
    if (!formData.academic_year.trim()) newErrors.academic_year = 'Academic year is required';
    if (!formData.class.trim()) newErrors.class = 'Class is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const { error } = await createExam(formData);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('admin.exams.exam_added'));
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        class: '10',
        academic_year: '2024-25',
        exam_date: '',
      });
      setRefreshKey((k) => k + 1);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const { error } = await updateExam(selectedExam.id, formData);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('admin.exams.exam_updated'));
      setIsEditModalOpen(false);
      setSelectedExam(null);
      setRefreshKey((k) => k + 1);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedExam) return;
    const { error } = await deleteExam(selectedExam.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('admin.exams.exam_deleted'));
      setIsDeleteModalOpen(false);
      setSelectedExam(null);
      setRefreshKey((k) => k + 1);
    }
  };

  return (
    <PageWrapper
      title={t('admin.exams.title')}
      subtitle="Schedule school examinations, assign dates, and classes"
      actions={
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          {t('admin.exams.add_exam')}
        </Button>
      }
    >
      {/* Filter Options */}
      <Card className="mb-6">
        <div className="w-full sm:w-48">
          <Select
            id="class-filter"
            placeholder="All Classes"
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            options={[
              { value: '9', label: 'Class 9' },
              { value: '10', label: 'Class 10' },
              { value: '11', label: 'Class 11' },
              { value: '12', label: 'Class 12' },
            ]}
          />
        </div>
      </Card>

      {/* Exams List Table */}
      <Table
        headers={['Exam Name', 'Class', 'Academic Year', 'Exam Date', 'Actions']}
        loading={loading}
      >
        {exams.map((exam) => (
          <TableRow key={exam.id}>
            <TableCell className="font-bold text-neutral-800">{exam.name}</TableCell>
            <TableCell>{exam.class}</TableCell>
            <TableCell>{exam.academic_year}</TableCell>
            <TableCell>{exam.exam_date || '-'}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Edit2 className="w-4 h-4 text-neutral-500" />}
                  onClick={() => {
                    setSelectedExam(exam);
                    setFormData(exam);
                    setIsEditModalOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 className="w-4 h-4 text-red-500" />}
                  onClick={() => {
                    setSelectedExam(exam);
                    setIsDeleteModalOpen(true);
                  }}
                >
                  Delete
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </Table>

      {/* Add Exam Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={t('admin.exams.add_exam')}
        footer={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" onClick={handleAddSubmit}>
              {t('common.save')}
            </Button>
          </div>
        }
      >
        <form className="space-y-4">
          <Input
            label={t('admin.exams.exam_name')}
            id="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            error={errors.name}
            icon={<ClipboardList className="w-4 h-4" />}
            placeholder="e.g. Unit Test 1"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label={t('common.class')}
              id="class"
              required
              value={formData.class}
              onChange={handleInputChange}
              error={errors.class}
              options={[
                { value: '9', label: 'Class 9' },
                { value: '10', label: 'Class 10' },
                { value: '11', label: 'Class 11' },
                { value: '12', label: 'Class 12' },
              ]}
            />
            <Input
              label={t('admin.exams.academic_year')}
              id="academic_year"
              required
              value={formData.academic_year}
              onChange={handleInputChange}
              error={errors.academic_year}
              placeholder="e.g. 2024-25"
            />
          </div>

          <Input
            label={t('admin.exams.exam_date')}
            id="exam_date"
            type="date"
            value={formData.exam_date}
            onChange={handleInputChange}
            icon={<Calendar className="w-4 h-4" />}
          />
        </form>
      </Modal>

      {/* Edit Exam Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t('admin.exams.edit_exam')}
        footer={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="primary" onClick={handleEditSubmit}>
              {t('common.save')}
            </Button>
          </div>
        }
      >
        <form className="space-y-4">
          <Input
            label={t('admin.exams.exam_name')}
            id="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            error={errors.name}
            icon={<ClipboardList className="w-4 h-4" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label={t('common.class')}
              id="class"
              required
              value={formData.class}
              onChange={handleInputChange}
              error={errors.class}
              options={[
                { value: '9', label: 'Class 9' },
                { value: '10', label: 'Class 10' },
                { value: '11', label: 'Class 11' },
                { value: '12', label: 'Class 12' },
              ]}
            />
            <Input
              label={t('admin.exams.academic_year')}
              id="academic_year"
              required
              value={formData.academic_year}
              onChange={handleInputChange}
              error={errors.academic_year}
            />
          </div>

          <Input
            label={t('admin.exams.exam_date')}
            id="exam_date"
            type="date"
            value={formData.exam_date}
            onChange={handleInputChange}
            icon={<Calendar className="w-4 h-4" />}
          />
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Examination Schedule"
        footer={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              {t('common.no')}
            </Button>
            <Button variant="danger" onClick={handleDeleteConfirm}>
              {t('common.yes')}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-neutral-600">
          {t('common.confirm_delete')}
        </p>
        {selectedExam && (
          <p className="mt-2 text-sm font-bold text-neutral-800">
            Exam: {selectedExam.name} (Class: {selectedExam.class})
          </p>
        )}
      </Modal>
    </PageWrapper>
  );
};

export default Exams;
