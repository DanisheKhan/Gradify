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
import { useSubjects } from '../../hooks/useSubjects';
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const Subjects = () => {
  const { t } = useTranslation();
  const { loading, getSubjects, createSubject, updateSubject, deleteSubject } = useSubjects();

  const [subjects, setSubjects] = useState([]);
  const [classFilter, setClassFilter] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    class: '10',
    max_marks: 100,
    pass_marks: 35,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadSubjects = async () => {
      const { data } = await getSubjects({ class: classFilter });
      if (data) setSubjects(data);
    };
    loadSubjects();
  }, [getSubjects, classFilter, refreshKey]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: id === 'max_marks' || id === 'pass_marks' ? Number(value) : value
    }));
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Subject name is required';
    if (!formData.class.trim()) newErrors.class = 'Class is required';
    if (formData.max_marks <= 0) newErrors.max_marks = 'Max marks must be greater than 0';
    if (formData.pass_marks <= 0 || formData.pass_marks > formData.max_marks) {
      newErrors.pass_marks = 'Pass marks must be greater than 0 and less than or equal to max marks';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const { error } = await createSubject(formData);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('admin.subjects.subject_added'));
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        class: '10',
        max_marks: 100,
        pass_marks: 35,
      });
      setRefreshKey((k) => k + 1);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const { error } = await updateSubject(selectedSubject.id, formData);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('admin.subjects.subject_updated'));
      setIsEditModalOpen(false);
      setSelectedSubject(null);
      setRefreshKey((k) => k + 1);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedSubject) return;
    const { error } = await deleteSubject(selectedSubject.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('admin.subjects.subject_deleted'));
      setIsDeleteModalOpen(false);
      setSelectedSubject(null);
      setRefreshKey((k) => k + 1);
    }
  };

  return (
    <PageWrapper
      title={t('admin.subjects.title')}
      subtitle="Configure subject curriculum, max thresholds and passing scores per class tier"
      actions={
        <Button
          variant="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          {t('admin.subjects.add_subject')}
        </Button>
      }
    >
      {/* Filters options */}
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

      {/* Subjects List Table */}
      <Table
        headers={['Subject Name', 'Class', 'Max Marks', 'Pass Marks', 'Actions']}
        loading={loading}
      >
        {subjects.map((sub) => (
          <TableRow key={sub.id}>
            <TableCell className="font-bold text-neutral-800">{sub.name}</TableCell>
            <TableCell>{sub.class}</TableCell>
            <TableCell>{sub.max_marks}</TableCell>
            <TableCell>{sub.pass_marks}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Edit2 className="w-4 h-4 text-neutral-500" />}
                  onClick={() => {
                    setSelectedSubject(sub);
                    setFormData(sub);
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
                    setSelectedSubject(sub);
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

      {/* Add Subject Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={t('admin.subjects.add_subject')}
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
            label={t('admin.subjects.subject_name')}
            id="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            error={errors.name}
            icon={<BookOpen className="w-4 h-4" />}
            placeholder="e.g. Mathematics"
          />

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('admin.subjects.max_marks')}
              id="max_marks"
              type="number"
              required
              value={formData.max_marks}
              onChange={handleInputChange}
              error={errors.max_marks}
            />
            <Input
              label={t('admin.subjects.pass_marks')}
              id="pass_marks"
              type="number"
              required
              value={formData.pass_marks}
              onChange={handleInputChange}
              error={errors.pass_marks}
            />
          </div>
        </form>
      </Modal>

      {/* Edit Subject Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={t('admin.subjects.edit_subject')}
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
            label={t('admin.subjects.subject_name')}
            id="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            error={errors.name}
            icon={<BookOpen className="w-4 h-4" />}
          />

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('admin.subjects.max_marks')}
              id="max_marks"
              type="number"
              required
              value={formData.max_marks}
              onChange={handleInputChange}
              error={errors.max_marks}
            />
            <Input
              label={t('admin.subjects.pass_marks')}
              id="pass_marks"
              type="number"
              required
              value={formData.pass_marks}
              onChange={handleInputChange}
              error={errors.pass_marks}
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Subject Curriculum"
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
        {selectedSubject && (
          <p className="mt-2 text-sm font-bold text-neutral-800">
            Subject: {selectedSubject.name} (Class: {selectedSubject.class})
          </p>
        )}
      </Modal>
    </PageWrapper>
  );
};

export default Subjects;
