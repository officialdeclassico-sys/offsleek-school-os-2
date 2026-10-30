import React, { useState } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import { useSchoolData } from '../../data/schoolContext';
import { OffsleekSelect } from '../OffsleekSelect';
import { getTodayDateIST } from '../../utils/dateTime';

interface AddStudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultClass?: string;
}

export const AddStudentModal: React.FC<AddStudentModalProps> = ({
  isOpen,
  onClose,
  defaultClass = 'Class 6',
}) => {
  const { addStudent } = useSchoolData();

  const [name, setName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [dob, setDob] = useState('2013-05-10');
  const [classGrade, setClassGrade] = useState(defaultClass);
  const [section, setSection] = useState('A');
  const [academicYear, setAcademicYear] = useState('2025 – 2026');
  const [guardianName, setGuardianName] = useState('');
  const [guardianRelation, setGuardianRelation] = useState('Father');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [address, setAddress] = useState('');
  const [admissionDate, setAdmissionDate] = useState(() => getTodayDateIST());
  const [feesTotal, setFeesTotal] = useState(85000);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Student full name is required';
    if (!guardianName.trim()) newErrors.guardianName = 'Guardian name is required';
    if (!guardianPhone.trim()) {
      newErrors.guardianPhone = 'Guardian contact number is required';
    } else if (guardianPhone.trim().length < 7) {
      newErrors.guardianPhone = 'Please enter a valid phone number';
    }
    if (guardianEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(guardianEmail.trim())) {
        newErrors.guardianEmail = 'Invalid email address';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      addStudent({
        name: name.trim(),
        gender,
        dob,
        classGrade,
        section,
        academicYear,
        guardianName: guardianName.trim(),
        guardianRelation,
        guardianPhone: guardianPhone.trim(),
        guardianEmail: guardianEmail.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@guardian.example.com`,
        address: address.trim() || 'Residential Campus, Riverdale',
        admissionDate,
        status: 'Active',
        feesTotal: Number(feesTotal) || 85000,
      });

      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-neutral-200 max-w-2xl w-full p-6 md:p-8 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Add New Student</h3>
              <p className="text-xs text-neutral-500">Register and enroll a student into official school records</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Student Name */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
                }}
                placeholder="e.g. Alexander Wright"
                className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none transition-colors ${
                  errors.name ? 'border-rose-500 ring-1 ring-rose-500' : 'border-neutral-200 focus:border-neutral-900'
                }`}
                autoFocus
              />
              {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="add-student-gender" className="block text-xs font-semibold text-neutral-700 mb-1">Gender</label>
              <OffsleekSelect
                id="add-student-gender"
                value={gender}
                onChange={(value) => setGender(value as typeof gender)}
                options={['Male', 'Female', 'Other']}
                className="w-full"
              />
            </div>

            {/* Class Grade */}
            <div>
              <label htmlFor="add-student-class" className="block text-xs font-semibold text-neutral-700 mb-1">Class / Grade</label>
              <OffsleekSelect
                id="add-student-class"
                value={classGrade}
                onChange={setClassGrade}
                options={['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']}
                className="w-full"
              />
            </div>

            {/* Section */}
            <div>
              <label htmlFor="add-student-section" className="block text-xs font-semibold text-neutral-700 mb-1">Section</label>
              <OffsleekSelect
                id="add-student-section"
                value={section}
                onChange={setSection}
                options={[
                  { value: 'A', label: 'Section A' },
                  { value: 'B', label: 'Section B' },
                  { value: 'C', label: 'Section C' },
                  { value: 'Science', label: 'Section Science' },
                  { value: 'Commerce', label: 'Section Commerce' },
                ]}
                className="w-full"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900"
              />
            </div>

            {/* Admission Date */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Admission Date</label>
              <input
                type="date"
                value={admissionDate}
                onChange={(e) => setAdmissionDate(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900"
              />
            </div>

            {/* Guardian Name */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Parent / Guardian Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={guardianName}
                onChange={(e) => {
                  setGuardianName(e.target.value);
                  if (errors.guardianName) setErrors((prev) => ({ ...prev, guardianName: '' }));
                }}
                placeholder="e.g. Rajesh Sharma"
                className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none transition-colors ${
                  errors.guardianName ? 'border-rose-500 ring-1 ring-rose-500' : 'border-neutral-200 focus:border-neutral-900'
                }`}
              />
              {errors.guardianName && <p className="text-[11px] text-rose-500 mt-1">{errors.guardianName}</p>}
            </div>

            {/* Guardian Phone */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Contact Phone <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={guardianPhone}
                onChange={(e) => {
                  setGuardianPhone(e.target.value);
                  if (errors.guardianPhone) setErrors((prev) => ({ ...prev, guardianPhone: '' }));
                }}
                placeholder="+91 98765 43210"
                className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none transition-colors ${
                  errors.guardianPhone ? 'border-rose-500 ring-1 ring-rose-500' : 'border-neutral-200 focus:border-neutral-900'
                }`}
              />
              {errors.guardianPhone && <p className="text-[11px] text-rose-500 mt-1">{errors.guardianPhone}</p>}
            </div>

            {/* Guardian Email */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Guardian Email</label>
              <input
                type="email"
                value={guardianEmail}
                onChange={(e) => {
                  setGuardianEmail(e.target.value);
                  if (errors.guardianEmail) setErrors((prev) => ({ ...prev, guardianEmail: '' }));
                }}
                placeholder="guardian@example.com"
                className={`w-full px-3 py-2 text-xs border rounded-lg focus:outline-none transition-colors ${
                  errors.guardianEmail ? 'border-rose-500 ring-1 ring-rose-500' : 'border-neutral-200 focus:border-neutral-900'
                }`}
              />
              {errors.guardianEmail && <p className="text-[11px] text-rose-500 mt-1">{errors.guardianEmail}</p>}
            </div>

            {/* Total Annual Fee */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">Total Fee Structure (₹)</label>
              <input
                type="number"
                value={feesTotal}
                onChange={(e) => setFeesTotal(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 mb-1">Residential Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House/Street, Locality, City"
              className="w-full px-3 py-2 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-black text-white hover:bg-neutral-800 px-5 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60 cursor-pointer shadow-xs"
            >
              {isSubmitting ? 'Enrolling...' : 'Admit Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
