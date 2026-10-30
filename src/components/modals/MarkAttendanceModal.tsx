import React, { useState } from 'react';
import { X, CalendarCheck, Check, AlertCircle } from 'lucide-react';
import { useSchoolData, AttendanceRecord, AttendanceStatus } from '../../data/schoolContext';
import { OffsleekSelect } from '../OffsleekSelect';
import { getTodayDateIST } from '../../utils/dateTime';

interface MarkAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MarkAttendanceModal: React.FC<MarkAttendanceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { students, saveAttendanceBatch, getAttendanceForDateAndClass } = useSchoolData();

  const [date, setDate] = useState(() => getTodayDateIST());
  const [classGrade, setClassGrade] = useState('Class 10');
  const [section, setSection] = useState('A');

  // Load students for selected class & section
  const classStudents = students.filter(
    (s) => s.classGrade === classGrade && s.section === section
  );

  const [records, setRecords] = useState<Record<string, AttendanceStatus>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize records on change
  React.useEffect(() => {
    const existing = getAttendanceForDateAndClass(date, classGrade, section);
    const initialMap: Record<string, AttendanceStatus> = {};
    if (existing && existing.length > 0) {
      existing.forEach((r) => {
        initialMap[r.studentId] = r.status;
      });
    } else {
      classStudents.forEach((s) => {
        initialMap[s.id] = 'Present';
      });
    }
    setRecords(initialMap);
  }, [date, classGrade, section, students]);

  if (!isOpen) return null;

  const handleStatusToggle = (studentId: string, status: AttendanceStatus) => {
    setRecords((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status: AttendanceStatus) => {
    const updated: Record<string, AttendanceStatus> = {};
    classStudents.forEach((s) => {
      updated[s.id] = status;
    });
    setRecords(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formattedRecords: AttendanceRecord[] = classStudents.map((s) => ({
      studentId: s.id,
      studentName: s.name,
      admissionNo: s.admissionNo,
      status: records[s.id] || 'Present',
    }));

    setTimeout(() => {
      saveAttendanceBatch(date, classGrade, section, formattedRecords);
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl border border-neutral-200 max-w-2xl w-full p-6 md:p-8 shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-neutral-900">Mark Daily Attendance</h3>
              <p className="text-xs text-neutral-500">Record and submit class roll call status</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Selection Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
          <div>
            <label className="block text-[11px] font-semibold text-neutral-600 mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-2.5 py-1.5 text-xs bg-white border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900"
            />
          </div>
          <div>
            <label htmlFor="attendance-class" className="block text-[11px] font-semibold text-neutral-600 mb-1">Class / Grade</label>
            <OffsleekSelect
              id="attendance-class"
              value={classGrade}
              onChange={setClassGrade}
              options={['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']}
              className="w-full"
              size="sm"
            />
          </div>
          <div>
            <label htmlFor="attendance-section" className="block text-[11px] font-semibold text-neutral-600 mb-1">Section</label>
            <OffsleekSelect
              id="attendance-section"
              value={section}
              onChange={setSection}
              options={[
                { value: 'A', label: 'Section A' },
                { value: 'B', label: 'Section B' },
                { value: 'Science', label: 'Section Science' },
              ]}
              className="w-full"
              size="sm"
            />
          </div>
        </div>

        {/* Quick Mark All Buttons */}
        <div className="flex items-center justify-between mb-3 text-xs">
          <span className="font-semibold text-neutral-700">
            Student Roster ({classStudents.length} enrolled)
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => markAll('Present')}
              className="px-2.5 py-1 text-[11px] font-medium bg-emerald-50 text-emerald-700 rounded border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              All Present
            </button>
            <button
              type="button"
              onClick={() => markAll('Absent')}
              className="px-2.5 py-1 text-[11px] font-medium bg-rose-50 text-rose-700 rounded border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              All Absent
            </button>
          </div>
        </div>

        {/* Student Roll Call List */}
        <div className="max-h-64 overflow-y-auto border border-neutral-200 rounded-xl divide-y divide-neutral-100 mb-6">
          {classStudents.length > 0 ? (
            classStudents.map((st) => {
              const currentStatus = records[st.id] || 'Present';
              return (
                <div key={st.id} className="p-3 flex items-center justify-between hover:bg-neutral-50/70 transition-colors">
                  <div>
                    <span className="text-xs font-bold text-neutral-900 block">{st.name}</span>
                    <span className="text-[10px] text-neutral-400 font-mono">{st.admissionNo}</span>
                  </div>

                  {/* Status Toggle Buttons */}
                  <div className="flex items-center gap-1.5">
                    {(['Present', 'Absent', 'Late', 'Excused'] as AttendanceStatus[]).map((stType) => {
                      const isSelected = currentStatus === stType;
                      const colors = {
                        Present: isSelected ? 'bg-emerald-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-emerald-50',
                        Absent: isSelected ? 'bg-rose-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-rose-50',
                        Late: isSelected ? 'bg-amber-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-amber-50',
                        Excused: isSelected ? 'bg-blue-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-blue-50',
                      };
                      return (
                        <button
                          key={stType}
                          type="button"
                          onClick={() => handleStatusToggle(st.id, stType)}
                          className={`px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors cursor-pointer ${colors[stType]}`}
                        >
                          {stType}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-6 text-center text-xs text-neutral-400">
              No students found in {classGrade} {section}.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting || classStudents.length === 0}
            className="bg-black text-white hover:bg-neutral-800 px-5 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60 cursor-pointer shadow-xs"
          >
            {isSubmitting ? 'Saving Register...' : 'Save & Submit Attendance'}
          </button>
        </div>
      </div>
    </div>
  );
};
