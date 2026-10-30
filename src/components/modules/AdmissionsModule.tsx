import React, { useState } from 'react';
import {
  CheckCircle,
  Clock,
  Filter,
  Plus,
  Search,
  UserCheck,
  UserPlus,
  X,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { useSchoolData, AdmissionApplication } from '../../data/schoolContext';
import { OffsleekSelect } from '../OffsleekSelect';

export const AdmissionsModule: React.FC = () => {
  const { admissions, addAdmission, updateAdmissionStatus, convertAdmissionToStudent } = useSchoolData();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Application Form State
  const [applicantName, setApplicantName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [dob, setDob] = useState('2014-06-15');
  const [appliedClass, setAppliedClass] = useState('Class 6');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [guardianEmail, setGuardianEmail] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  const filteredAdmissions = admissions.filter((app) => {
    const matchesSearch =
      app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.guardianName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleCreateApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim() || !guardianName.trim() || !guardianPhone.trim()) {
      setFormError('Applicant name, guardian name, and contact phone are required.');
      return;
    }

    addAdmission({
      applicantName: applicantName.trim(),
      gender,
      dob,
      appliedClass,
      guardianName: guardianName.trim(),
      guardianPhone: guardianPhone.trim(),
      guardianEmail: guardianEmail.trim() || `${applicantName.toLowerCase().replace(/\s+/g, '.')}@family.example.com`,
      notes: notes.trim() || 'Direct inquiry submission',
    });

    setIsAddModalOpen(false);
    setApplicantName('');
    setGuardianName('');
    setGuardianPhone('');
    setGuardianEmail('');
    setNotes('');
    setFormError('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Admissions Management</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Track student applicants, entrance evaluations, and enrollment conversions
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-black text-white hover:bg-neutral-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Application</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white border border-neutral-200/90 rounded-2xl shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search applicant name, App ID, guardian..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-900"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <OffsleekSelect
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            options={[
              { value: 'All', label: 'All Statuses' },
              { value: 'New', label: 'New' },
              { value: 'Under Review', label: 'Under Review' },
              { value: 'Approved', label: 'Approved' },
              { value: 'Rejected', label: 'Rejected' },
              { value: 'Enrolled', label: 'Enrolled' },
            ]}
            size="sm"
            variant="subtle"
            className="w-36"
          />

          <span className="text-xs text-neutral-400 font-medium whitespace-nowrap pl-2">
            {filteredAdmissions.length} applications
          </span>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Application ID</th>
                <th className="py-3 px-4">Applicant Name</th>
                <th className="py-3 px-4">Applied Class</th>
                <th className="py-3 px-4">Guardian / Contact</th>
                <th className="py-3 px-4">Applied Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Notes / Remarks</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-sans">
              {filteredAdmissions.length > 0 ? (
                filteredAdmissions.map((app) => {
                  const statusColors = {
                    New: 'bg-blue-50 text-blue-700 border-blue-200',
                    'Under Review': 'bg-amber-50 text-amber-700 border-amber-200',
                    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                    Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
                    Enrolled: 'bg-neutral-900 text-white border-neutral-900',
                  }[app.status];

                  return (
                    <tr key={app.id} className="hover:bg-neutral-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-neutral-800">{app.id}</td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-neutral-900 block">{app.applicantName}</span>
                        <span className="text-[10px] text-neutral-400">{app.gender} · DOB: {app.dob}</span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-neutral-800">{app.appliedClass}</td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-neutral-900 block">{app.guardianName}</span>
                        <span className="text-[10px] text-neutral-400">{app.guardianPhone}</span>
                      </td>
                      <td className="py-3 px-4 text-neutral-500">{app.applicationDate}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${statusColors}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-neutral-600 max-w-xs truncate" title={app.notes}>
                        {app.notes}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {app.status === 'Approved' && (
                            <button
                              onClick={() => convertAdmissionToStudent(app.id)}
                              className="px-2.5 py-1 bg-neutral-900 text-white hover:bg-neutral-800 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                              title="Enroll as Official Student"
                            >
                              <UserCheck className="w-3.5 h-3.5" />
                              <span>Enroll Student</span>
                            </button>
                          )}

                          {app.status !== 'Enrolled' && (
                            <OffsleekSelect
                              value={app.status}
                              onChange={(val) => updateAdmissionStatus(app.id, val as any)}
                              options={[
                                { value: 'New', label: 'Set New' },
                                { value: 'Under Review', label: 'Set Review' },
                                { value: 'Approved', label: 'Set Approved' },
                                { value: 'Rejected', label: 'Set Rejected' },
                              ]}
                              size="sm"
                              variant="subtle"
                              className="w-28"
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-neutral-400">
                    No admission applications found matching filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Application Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-lg w-full p-6 md:p-8 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900">New Admission Application</h3>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateApplication} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Applicant Full Name *</label>
                <input
                  type="text"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="e.g. Maya Shankar"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-neutral-900"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Gender</label>
                  <OffsleekSelect
                    value={gender}
                    onChange={(val) => setGender(val as any)}
                    options={[
                      { value: 'Male', label: 'Male' },
                      { value: 'Female', label: 'Female' },
                      { value: 'Other', label: 'Other' },
                    ]}
                    size="sm"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Applied Class</label>
                  <OffsleekSelect
                    value={appliedClass}
                    onChange={(val) => setAppliedClass(val)}
                    options={['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']}
                    size="sm"
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Guardian Name *</label>
                <input
                  type="text"
                  value={guardianName}
                  onChange={(e) => setGuardianName(e.target.value)}
                  placeholder="e.g. Ramesh Shankar"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Contact Phone *</label>
                  <input
                    type="text"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                    placeholder="+91 98450 11223"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-neutral-900"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={guardianEmail}
                    onChange={(e) => setGuardianEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Evaluation Notes / Prior School</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="Entrance test scores, transfer certificates, or extracurricular achievements..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-neutral-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-black text-white rounded-lg font-semibold hover:bg-neutral-800"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
