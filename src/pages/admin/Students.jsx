import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/layout/PageWrapper';
import Card from '../../components/ui/Card';
import Table, { TableRow, TableCell } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import { useStudents } from '../../hooks/useStudents';
import { Search, UserPlus, Edit2, Trash2, Eye, Calendar, User, Phone, MapPin } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const Students = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loading, getStudents, createStudent, deleteStudent } = useStudents();

  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  // Form Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    roll_number: '',
    class: '10',
    section: 'A',
    date_of_birth: '',
    parent_name: '',
    contact_number: '',
    address: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const loadStudents = async () => {
      const { data } = await getStudents({ class: classFilter, search: searchTerm });
      if (data) setStudents(data);
    };
    loadStudents();
  }, [getStudents, classFilter, searchTerm, refreshKey]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.roll_number.trim()) newErrors.roll_number = 'Roll number is required';
    if (!formData.class.trim()) newErrors.class = 'Class is required';
    if (!formData.parent_name.trim()) newErrors.parent_name = 'Parent name is required';
    if (formData.contact_number && !/^\d{10}$/.test(formData.contact_number)) {
      newErrors.contact_number = 'Contact number must be exactly 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const { error } = await createStudent(formData);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('admin.students.student_added'));
      setIsAddModalOpen(false);
      // Reset form
      setFormData({
        name: '',
        roll_number: '',
        class: '10',
        section: 'A',
        date_of_birth: '',
        parent_name: '',
        contact_number: '',
        address: '',
      });
      setRefreshKey((k) => k + 1);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStudent) return;
    const { error } = await deleteStudent(selectedStudent.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('admin.students.student_deleted'));
      setIsDeleteModalOpen(false);
      setSelectedStudent(null);
      setRefreshKey((k) => k + 1);
    }
  };

  return (
    <PageWrapper
      title={t('admin.students.title')}
      subtitle="Add, view, update and manage student enrollment profiles"
      actions={
        <Button
          variant="primary"
          icon={<UserPlus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          {t('admin.students.add_student')}
        </Button>
      }
    >
      {/* Filters Card */}
      <Card className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              id="search"
              placeholder={t('common.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<Search className="w-4 h-4 text-neutral-400" />}
            />
          </div>
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
        </div>
      </Card>

      {/* Students List Table */}
      <Table
        headers={[
          t('admin.students.roll_no'),
          t('admin.students.name'),
          t('common.class'),
          t('common.section'),
          t('admin.students.parent'),
          t('common.actions'),
        ]}
        loading={loading}
      >
        {students.map((student) => (
          <TableRow key={student.id}>
            <TableCell className="font-bold text-neutral-800">{student.roll_number}</TableCell>
            <TableCell className="font-semibold text-neutral-700">{student.name}</TableCell>
            <TableCell>{student.class}</TableCell>
            <TableCell>{student.section || '-'}</TableCell>
            <TableCell>{student.parent_name}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Eye className="w-4 h-4 text-neutral-500" />}
                  onClick={() => navigate(`/admin/students/${student.id}`)}
                >
                  View
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<Trash2 className="w-4 h-4 text-red-500" />}
                  onClick={() => {
                    setSelectedStudent(student);
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

      {/* Add Student Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={t('admin.students.add_student')}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('admin.students.name')}
              id="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              error={errors.name}
              icon={<User className="w-4 h-4" />}
            />
            <Input
              label={t('admin.students.roll_no')}
              id="roll_number"
              required
              value={formData.roll_number}
              onChange={handleInputChange}
              error={errors.roll_number}
            />
          </div>

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
              label={t('common.section')}
              id="section"
              value={formData.section}
              onChange={handleInputChange}
              placeholder="e.g. A, B, C"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={t('admin.students.dob')}
              id="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={handleInputChange}
              icon={<Calendar className="w-4 h-4" />}
            />
            <Input
              label={t('admin.students.parent')}
              id="parent_name"
              required
              value={formData.parent_name}
              onChange={handleInputChange}
              error={errors.parent_name}
              icon={<User className="w-4 h-4" />}
            />
          </div>

          <Input
            label={t('admin.students.contact')}
            id="contact_number"
            value={formData.contact_number}
            onChange={handleInputChange}
            error={errors.contact_number}
            icon={<Phone className="w-4 h-4" />}
            placeholder="e.g. 9876543210"
          />

          <Input
            label={t('admin.students.address')}
            id="address"
            value={formData.address}
            onChange={handleInputChange}
            icon={<MapPin className="w-4 h-4" />}
          />
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Student Profile"
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
        {selectedStudent && (
          <p className="mt-2 text-sm font-bold text-neutral-800">
            Student: {selectedStudent.name} (Roll No: {selectedStudent.roll_number})
          </p>
        )}
      </Modal>
    </PageWrapper>
  );
};

export default Students;
