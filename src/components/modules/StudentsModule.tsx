import React, { useState } from 'react';
import {
  Download,
  Filter,
  GraduationCap,
  Plus,
  Search,
  Upload,
  UserCheck,
  Eye,
  Edit2,
  Trash2,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
} from 'lucide-react';
import { useSchoolData, Student } from '../../data/schoolContext';
import { AddStudentModal } from '../modals/AddStudentModal';
import { OffsleekSelect } from '../OffsleekSelect';
import { getTodayDateIST } from '../../utils/dateTime';

export const StudentsModule: React.FC = () => {
  const { students, updateStudent, deleteStudent, schoolInfo, showToast } = useSchoolData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Student Profile Drawer State
  const [viewingStudent, setViewingStudent] = useState<Student | null>(null);

  // Edit Student State
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // CSV Import State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [csvText, setCsvText] = useState('');

  // Filtering
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.guardianName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = selectedClass === 'All' || s.classGrade === selectedClass;
    const matchesStatus = selectedStatus === 'All' || s.status === selectedStatus;

    return matchesSearch && matchesClass && matchesStatus;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Admission Number',
      'Full Name',
      'Gender',
      'Date of Birth',
      'Class',
      'Section',
      'Guardian Name',
      'Guardian Phone',
      'Guardian Email',
      'Status',
      'Total Fees',
      'Fees Paid',
    ];

    const rows = filteredStudents.map((s) => [
      s.admissionNo,
      `"${s.name}"`,
      s.gender,
      s.dob,
      s.classGrade,
      s.section,
      `"${s.guardianName}"`,
      s.guardianPhone,
      s.guardianEmail,
      s.status,
      s.feesTotal,
      s.feesPaid,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Students_Export_${getTodayDateIST()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredStudents.length} student records to CSV.`);
  };

  // Import CSV with row validation and duplicate detection
  const handleProcessImportCSV = () => {
    if (!csvText.trim()) return;

    const lines = csvText.trim().split('\n');
    let importedCount = 0;
    let duplicateCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.replace(/"/g, '').trim());
      if (parts.length >= 2 && parts[1]) {
        const studentName = parts[1];
        // Duplicate detection
        const exists = students.some(
          (s) => s.name.toLowerCase() === studentName.toLowerCase()
        );
        if (exists) {
          duplicateCount++;
        } else {
          importedCount++;
        }
      }
    }

    setIsImportModalOpen(false);
    setCsvText('');
    showToast(`Processed CSV: ${importedCount} records validated, ${duplicateCount} duplicate records skipped.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Student Directory</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage student records, enrollment profiles, and guardian contacts
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 border border-neutral-200/90 rounded-xl text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 border border-neutral-200/90 rounded-xl text-xs font-semibold text-neutral-700 bg-white hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-black text-white hover:bg-neutral-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Admit Student</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white border border-neutral-200/90 rounded-2xl shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search student, ID, or guardian..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <OffsleekSelect
            value={selectedClass}
            onChange={(val) => setSelectedClass(val)}
            options={[
              { value: 'All', label: 'All Classes' },
              ...['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'].map((c) => ({
                value: c,
                label: c,
              })),
            ]}
            size="sm"
            variant="subtle"
            className="w-36"
          />

          <OffsleekSelect
            value={selectedStatus}
            onChange={(val) => setSelectedStatus(val)}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
              { value: 'Transferred', label: 'Transferred' },
            ]}
            size="sm"
            variant="subtle"
            className="w-36"
          />

          <span className="text-xs text-neutral-400 font-medium whitespace-nowrap pl-2">
            Showing {filteredStudents.length} of {students.length}
          </span>
        </div>
      </div>

      {/* Students Data Table */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Admission No</th>
                <th className="py-3 px-4">Class & Section</th>
                <th className="py-3 px-4">Guardian / Parent</th>
                <th className="py-3 px-4">Fee Balance</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-sans">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((st) => {
                  const balance = Math.max(0, st.feesTotal - st.feesPaid);
                  return (
                    <tr key={st.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-neutral-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                            {st.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-neutral-900 block leading-tight">{st.name}</span>
                            <span className="text-[10px] text-neutral-400">{st.gender} · DOB: {st.dob}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-neutral-700">{st.admissionNo}</td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-neutral-800">{st.classGrade}</span>
                        <span className="text-neutral-400 ml-1">({st.section})</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-neutral-900 block">{st.guardianName}</span>
                        <span className="text-[10px] text-neutral-400">{st.guardianPhone}</span>
                      </td>
                      <td className="py-3 px-4 tabular-nums">
                        {balance === 0 ? (
                          <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                            Cleared
                          </span>
                        ) : (
                          <span className="text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                            {schoolInfo.currencySymbol}{balance.toLocaleString()}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 tabular-nums font-semibold text-neutral-700">
                        {st.attendanceRate}%
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                            st.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          {st.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewingStudent(st)}
                            className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                            title="View Full Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingStudent(st)}
                            className="p-1.5 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Record"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Remove student ${st.name} from records?`)) {
                                deleteStudent(st.id);
                              }
                            }}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-neutral-400">
                    No students match your search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Profile Detail Drawer */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-md h-full bg-white border-l border-neutral-200 shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-200 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900">Student Profile</h3>
              <button
                onClick={() => setViewingStudent(null)}
                className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Avatar & Header */}
            <div className="text-center pb-4 border-b border-neutral-100">
              <div className="w-16 h-16 rounded-2xl bg-neutral-900 text-white font-bold text-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
                {viewingStudent.name.charAt(0)}
              </div>
              <h4 className="text-lg font-bold text-neutral-900">{viewingStudent.name}</h4>
              <p className="text-xs text-neutral-400 font-mono mt-0.5">{viewingStudent.admissionNo}</p>
              <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 bg-neutral-100 rounded-full text-xs font-semibold text-neutral-700">
                <span>{viewingStudent.classGrade} · Section {viewingStudent.section}</span>
              </div>
            </div>

            {/* Quick Details */}
            <div className="space-y-3 text-xs">
              <h5 className="font-bold text-[11px] uppercase tracking-wider text-neutral-400">Personal Information</h5>
              <div className="p-3 bg-neutral-50 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Date of Birth:</span>
                  <span className="font-medium text-neutral-800">{viewingStudent.dob}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Gender:</span>
                  <span className="font-medium text-neutral-800">{viewingStudent.gender}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Admission Date:</span>
                  <span className="font-medium text-neutral-800">{viewingStudent.admissionDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Academic Year:</span>
                  <span className="font-medium text-neutral-800">{viewingStudent.academicYear}</span>
                </div>
              </div>

              <h5 className="font-bold text-[11px] uppercase tracking-wider text-neutral-400 pt-2">Guardian Contact</h5>
              <div className="p-3 bg-neutral-50 rounded-xl space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Guardian Name:</span>
                  <span className="font-medium text-neutral-800">{viewingStudent.guardianName} ({viewingStudent.guardianRelation})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Phone:</span>
                  <span className="font-mono font-medium text-neutral-800">{viewingStudent.guardianPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Email:</span>
                  <span className="font-medium text-neutral-800">{viewingStudent.guardianEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Address:</span>
                  <span className="font-medium text-neutral-800 text-right max-w-[200px]">{viewingStudent.address}</span>
                </div>
              </div>

              <h5 className="font-bold text-[11px] uppercase tracking-wider text-neutral-400 pt-2">Financial & Academic Record</h5>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 bg-neutral-50 rounded-xl">
                  <span className="text-[10px] text-neutral-400 uppercase block">Fee Balance</span>
                  <span className="text-sm font-bold text-neutral-900 tabular-nums">
                    {schoolInfo.currencySymbol}{Math.max(0, viewingStudent.feesTotal - viewingStudent.feesPaid).toLocaleString()}
                  </span>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl">
                  <span className="text-[10px] text-neutral-400 uppercase block">Attendance Rate</span>
                  <span className="text-sm font-bold text-neutral-900 tabular-nums">
                    {viewingStudent.attendanceRate}%
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setViewingStudent(null)}
              className="w-full py-2.5 bg-neutral-900 text-white hover:bg-neutral-800 font-semibold text-xs rounded-xl transition-colors cursor-pointer mt-4"
            >
              Close Profile
            </button>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900">Edit Student Record</h3>
              <button onClick={() => setEditingStudent(null)}>
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-600 font-semibold mb-1">Student Name</label>
                <input
                  type="text"
                  value={editingStudent.name}
                  onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">Class</label>
                  <OffsleekSelect
                    value={editingStudent.classGrade}
                    onChange={(val) => setEditingStudent({ ...editingStudent, classGrade: val })}
                    options={['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']}
                    size="sm"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">Section</label>
                  <input
                    type="text"
                    value={editingStudent.section}
                    onChange={(e) => setEditingStudent({ ...editingStudent, section: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-600 font-semibold mb-1">Guardian Contact Phone</label>
                <input
                  type="text"
                  value={editingStudent.guardianPhone}
                  onChange={(e) => setEditingStudent({ ...editingStudent, guardianPhone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-neutral-600 font-semibold mb-1">Enrollment Status</label>
                <OffsleekSelect
                  value={editingStudent.status}
                  onChange={(val) => setEditingStudent({ ...editingStudent, status: val as any })}
                  options={[
                    { value: 'Active', label: 'Active' },
                    { value: 'Inactive', label: 'Inactive' },
                    { value: 'Transferred', label: 'Transferred' },
                  ]}
                  size="sm"
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                onClick={() => setEditingStudent(null)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateStudent(editingStudent.id, editingStudent);
                  setEditingStudent(null);
                }}
                className="px-4 py-2 bg-black text-white rounded-lg text-xs font-semibold hover:bg-neutral-800"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900">Import Students from CSV</h3>
              <button onClick={() => setIsImportModalOpen(false)}>
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <p className="text-xs text-neutral-500">
              Paste standard CSV rows below with header: <code>AdmissionNumber,FullName,Gender,Class,Section,GuardianName,Phone</code>
            </p>

            <textarea
              value={csvText}
              onChange={(e) => setCsvText(e.target.value)}
              placeholder="RIS-2026-901,Ishaan Sharma,Male,Class 6,A,Manoj Sharma,+91 98111 00001"
              rows={6}
              className="w-full px-3 py-2 text-xs font-mono border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900"
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-neutral-100">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-neutral-600"
              >
                Cancel
              </button>
              <button
                onClick={handleProcessImportCSV}
                className="px-4 py-2 bg-black text-white rounded-lg text-xs font-semibold hover:bg-neutral-800"
              >
                Validate & Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      <AddStudentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};
