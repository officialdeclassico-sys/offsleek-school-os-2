import React, { useState } from 'react';
import {
  Briefcase,
  Check,
  CheckCircle,
  Clock,
  Download,
  Filter,
  Mail,
  Phone,
  Plus,
  Search,
  UserCheck,
  Users2,
  X,
  XCircle,
} from 'lucide-react';
import { useSchoolData, StaffMember } from '../../data/schoolContext';
import { OffsleekSelect } from '../OffsleekSelect';
import { getTodayDateIST } from '../../utils/dateTime';

export const StaffModule: React.FC = () => {
  const { staffList, addStaff, leaveRequests, updateLeaveStatus, showToast } = useSchoolData();

  const [activeTab, setActiveTab] = useState<'directory' | 'leaves'>('directory');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female'>('Female');
  const [designation, setDesignation] = useState('Mathematics Teacher');
  const [department, setDepartment] = useState('Academics');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [qualification, setQualification] = useState('M.Sc., B.Ed.');

  const filteredStaff = staffList.filter((st) => {
    const matchesSearch =
      st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.designation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = departmentFilter === 'All' || st.department === departmentFilter;
    return matchesSearch && matchesDept;
  });

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) return;

    addStaff({
      name: name.trim(),
      gender,
      designation,
      department,
      email: email.trim(),
      phone: phone.trim(),
      joiningDate: getTodayDateIST(),
      status: 'Active',
      qualification: qualification.trim(),
    });

    setIsAddModalOpen(false);
    setName('');
    setEmail('');
    setPhone('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Staff & Faculty Management</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Teaching faculty, administrative personnel, departmental assignments, and leave requests
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-black text-white hover:bg-neutral-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Tabs & Filters */}
      <div className="p-4 bg-white border border-neutral-200/90 rounded-2xl shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="inline-flex p-1 bg-neutral-100 rounded-xl border border-neutral-200 text-xs font-semibold w-full md:w-auto">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'directory' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
            }`}
          >
            Staff Directory ({staffList.length})
          </button>
          <button
            onClick={() => setActiveTab('leaves')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'leaves' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
            }`}
          >
            Leave Requests ({leaveRequests.length})
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search faculty, ID, designation..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900"
            />
          </div>

          <OffsleekSelect
            value={departmentFilter}
            onChange={(val) => setDepartmentFilter(val)}
            options={[
              { value: 'All', label: 'All Departments' },
              { value: 'Academics', label: 'Academics' },
              { value: 'Administration', label: 'Administration' },
              { value: 'Accounts', label: 'Accounts' },
              { value: 'Library', label: 'Library' },
            ]}
            size="sm"
            variant="subtle"
            className="w-40"
          />
        </div>
      </div>

      {/* TAB 1: STAFF DIRECTORY */}
      {activeTab === 'directory' && (
        <div className="bg-white border border-neutral-200/90 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Employee ID</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Contact</th>
                  <th className="py-3 px-4">Joining Date</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-sans">
                {filteredStaff.map((st) => (
                  <tr key={st.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-neutral-900 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                          {st.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-neutral-900 block">{st.name}</span>
                          <span className="text-[10px] text-neutral-400">{st.qualification}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-neutral-700">{st.employeeId}</td>
                    <td className="py-3 px-4 font-semibold text-neutral-800">{st.designation}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-neutral-100 text-neutral-700">
                        {st.department}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="block text-neutral-900">{st.email}</span>
                      <span className="text-[10px] text-neutral-400">{st.phone}</span>
                    </td>
                    <td className="py-3 px-4 text-neutral-500">{st.joiningDate}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
                          st.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {st.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: LEAVE REQUESTS */}
      {activeTab === 'leaves' && (
        <div className="bg-white border border-neutral-200/90 rounded-2xl shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Staff Name</th>
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Days</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-sans">
                {leaveRequests.map((lv) => (
                  <tr key={lv.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-neutral-900">{lv.staffName}</td>
                    <td className="py-3 px-4 font-semibold text-neutral-800">{lv.leaveType}</td>
                    <td className="py-3 px-4 text-neutral-500">{lv.startDate} to {lv.endDate}</td>
                    <td className="py-3 px-4 font-bold tabular-nums">{lv.days} day(s)</td>
                    <td className="py-3 px-4 text-neutral-600 max-w-xs">{lv.reason}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          lv.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700'
                            : lv.status === 'Rejected'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {lv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {lv.status === 'Pending' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => updateLeaveStatus(lv.id, 'Approved')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateLeaveStatus(lv.id, 'Rejected')}
                            className="px-2.5 py-1 bg-neutral-200 hover:bg-rose-100 hover:text-rose-700 text-neutral-700 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-lg w-full p-6 md:p-8 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <h3 className="text-base font-bold text-neutral-900">Add Faculty / Staff Member</h3>
              <button onClick={() => setIsAddModalOpen(false)}>
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <form onSubmit={handleCreateStaff} className="space-y-3 text-xs">
              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Robert Vance"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-neutral-900"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Department</label>
                  <OffsleekSelect
                    value={department}
                    onChange={(val) => setDepartment(val)}
                    options={[
                      { value: 'Academics', label: 'Academics' },
                      { value: 'Administration', label: 'Administration' },
                      { value: 'Accounts', label: 'Accounts' },
                      { value: 'Library', label: 'Library' },
                    ]}
                    size="sm"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Designation</label>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Senior Physics Teacher"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-neutral-900"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="faculty@riverdale.edu"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-neutral-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-neutral-700 font-semibold mb-1">Phone *</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98450 00000"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-neutral-900"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 font-semibold mb-1">Qualifications</label>
                <input
                  type="text"
                  value={qualification}
                  onChange={(e) => setQualification(e.target.value)}
                  placeholder="e.g. M.Sc. Physics, B.Ed."
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
                  Add Staff Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
