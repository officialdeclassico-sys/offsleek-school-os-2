import React, { useState } from 'react';
import { Award, CheckCircle2, FileText, Printer, Save, X } from 'lucide-react';
import { useSchoolData, Student } from '../../data/schoolContext';
import { OffsleekLogo } from '../OffsleekLogo';
import { OffsleekSelect } from '../OffsleekSelect';

export const ExaminationsModule: React.FC = () => {
  const { exams, students, examMarks, saveStudentMarks, schoolInfo, showToast } = useSchoolData();

  const [selectedExamId, setSelectedExamId] = useState(exams[0]?.id || '');
  const [selectedSubject, setSelectedSubject] = useState('Mathematics');
  const [selectedClass, setSelectedClass] = useState('Class 10');

  // Printable report card student
  const [reportCardStudent, setReportCardStudent] = useState<Student | null>(null);

  const activeExam = exams.find((e) => e.id === selectedExamId) || exams[0];
  const classStudents = students.filter((s) => s.classGrade === selectedClass);

  // Local state for editing marks
  const [marksState, setMarksState] = useState<Record<string, number>>({
    'STU-1003': 46,
    'STU-1001': 42,
    'STU-1005': 38,
  });

  const handleMarkChange = (studentId: string, val: number) => {
    const clamped = Math.max(0, Math.min(50, val));
    setMarksState((prev) => ({ ...prev, [studentId]: clamped }));
  };

  const handleSaveAllMarks = () => {
    classStudents.forEach((st) => {
      const mark = marksState[st.id] !== undefined ? marksState[st.id] : 40;
      saveStudentMarks(activeExam.id, st.id, selectedSubject, mark, 50);
    });
    showToast(`Saved marks for ${classStudents.length} students in ${selectedSubject}.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Examinations & Grading</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Test series, marks validation, grading rules, and student report cards
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 bg-neutral-100 text-neutral-700 rounded-xl border border-neutral-200">
            Grading Rule: 90%+ A+, 80%+ A, 70%+ B+, 60%+ B, 50%+ C
          </span>
        </div>
      </div>

      {/* Selector Row */}
      <div className="p-4 bg-white border border-neutral-200/90 rounded-2xl shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1">Active Examination</label>
          <OffsleekSelect
            value={selectedExamId}
            onChange={(val) => setSelectedExamId(val)}
            options={exams.map((ex) => ({
              value: ex.id,
              label: `${ex.title} (${ex.classGrade})`,
            }))}
            size="sm"
            variant="subtle"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1">Target Class</label>
          <OffsleekSelect
            value={selectedClass}
            onChange={(val) => setSelectedClass(val)}
            options={['Class 10', 'Class 8', 'Class 6', 'Class 11']}
            size="sm"
            variant="subtle"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1">Subject</label>
          <OffsleekSelect
            value={selectedSubject}
            onChange={(val) => setSelectedSubject(val)}
            options={[
              { value: 'Mathematics', label: 'Mathematics (Max 50)' },
              { value: 'Science', label: 'Science (Max 50)' },
              { value: 'English', label: 'English (Max 50)' },
              { value: 'Social Studies', label: 'Social Studies (Max 50)' },
            ]}
            size="sm"
            variant="subtle"
            className="w-full"
          />
        </div>
      </div>

      {/* Marks Entry Sheet */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              Marks Entry Sheet: {selectedSubject} (Max Marks: 50 · Passing: 18)
            </h3>
            <p className="text-xs text-neutral-500">Enter raw score; grade is calculated automatically</p>
          </div>
          <button
            onClick={handleSaveAllMarks}
            className="px-4 py-2 bg-black text-white hover:bg-neutral-800 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save & Publish Marks</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-neutral-50 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Admission No</th>
                <th className="py-3 px-4">Marks Obtained (Out of 50)</th>
                <th className="py-3 px-4">Percentage</th>
                <th className="py-3 px-4">Calculated Grade</th>
                <th className="py-3 px-4 text-right">Report Card</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {classStudents.map((st) => {
                const mark = marksState[st.id] !== undefined ? marksState[st.id] : 42;
                const percent = Math.round((mark / 50) * 100);
                let grade = 'F';
                if (percent >= 90) grade = 'A+';
                else if (percent >= 80) grade = 'A';
                else if (percent >= 70) grade = 'B+';
                else if (percent >= 60) grade = 'B';
                else if (percent >= 50) grade = 'C';

                return (
                  <tr key={st.id} className="hover:bg-neutral-50/80">
                    <td className="py-3 px-4 font-bold text-neutral-900">{st.name}</td>
                    <td className="py-3 px-4 font-mono text-neutral-500">{st.admissionNo}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="50"
                          value={mark}
                          onChange={(e) => handleMarkChange(st.id, Number(e.target.value))}
                          className="w-20 px-2.5 py-1 text-xs border border-neutral-300 rounded-lg font-bold tabular-nums focus:outline-none focus:border-neutral-900"
                        />
                        <span className="text-neutral-400">/ 50</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold tabular-nums text-neutral-700">{percent}%</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-neutral-900 text-white">
                        {grade}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setReportCardStudent(st)}
                        className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3" />
                        <span>Print Report Card</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Report Card Modal */}
      {reportCardStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl border border-neutral-200 max-w-xl w-full p-6 md:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4 print:hidden">
              <h3 className="text-sm font-bold text-neutral-900">Student Academic Progress Report</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-semibold hover:bg-neutral-800 cursor-pointer flex items-center gap-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Report</span>
                </button>
                <button onClick={() => setReportCardStudent(null)}>
                  <X className="w-5 h-5 text-neutral-400" />
                </button>
              </div>
            </div>

            {/* Report Card Document */}
            <div className="p-6 border border-neutral-300 rounded-xl space-y-4 text-xs font-sans">
              <div className="text-center pb-3 border-b border-neutral-200">
                <div className="flex justify-center mb-1">
                  <OffsleekLogo size="sm" />
                </div>
                <h2 className="text-base font-black uppercase tracking-wider">{schoolInfo.name}</h2>
                <p className="text-[10px] text-neutral-500 uppercase tracking-widest">{schoolInfo.motto}</p>
                <span className="inline-block mt-2 px-3 py-0.5 bg-neutral-100 rounded-full text-[10px] font-bold uppercase tracking-wider">
                  Academic Progress Report · {schoolInfo.academicYear}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <div>
                  <span className="text-neutral-500 text-[10px] block">Student Name:</span>
                  <strong className="text-neutral-900">{reportCardStudent.name}</strong>
                </div>
                <div>
                  <span className="text-neutral-500 text-[10px] block">Admission Number:</span>
                  <span className="font-mono font-medium">{reportCardStudent.admissionNo}</span>
                </div>
                <div>
                  <span className="text-neutral-500 text-[10px] block">Class & Section:</span>
                  <span>{reportCardStudent.classGrade} ({reportCardStudent.section})</span>
                </div>
                <div>
                  <span className="text-neutral-500 text-[10px] block">Overall Attendance:</span>
                  <strong className="text-emerald-700">{reportCardStudent.attendanceRate}%</strong>
                </div>
              </div>

              {/* Subject Scores Table */}
              <table className="w-full text-left text-xs border border-neutral-200 rounded-lg overflow-hidden">
                <thead className="bg-neutral-100 text-[10px] font-bold uppercase">
                  <tr>
                    <th className="py-2 px-3">Subject</th>
                    <th className="py-2 px-3">Max Marks</th>
                    <th className="py-2 px-3">Marks Obtained</th>
                    <th className="py-2 px-3">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  <tr>
                    <td className="py-2 px-3 font-semibold">Mathematics</td>
                    <td className="py-2 px-3">50</td>
                    <td className="py-2 px-3 font-bold tabular-nums">46</td>
                    <td className="py-2 px-3 font-black text-emerald-700">A+</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Science & Tech</td>
                    <td className="py-2 px-3">50</td>
                    <td className="py-2 px-3 font-bold tabular-nums">44</td>
                    <td className="py-2 px-3 font-black text-emerald-700">A+</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">English Literature</td>
                    <td className="py-2 px-3">50</td>
                    <td className="py-2 px-3 font-bold tabular-nums">42</td>
                    <td className="py-2 px-3 font-black text-blue-700">A</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold">Social Studies</td>
                    <td className="py-2 px-3">50</td>
                    <td className="py-2 px-3 font-bold tabular-nums">40</td>
                    <td className="py-2 px-3 font-black text-blue-700">A</td>
                  </tr>
                </tbody>
              </table>

              <div className="pt-4 flex justify-between items-end border-t border-dashed border-neutral-300">
                <div className="text-center">
                  <div className="w-24 h-0.5 bg-neutral-400 mx-auto mb-1"></div>
                  <span className="text-[10px] text-neutral-400">Class Teacher</span>
                </div>
                <div className="text-center">
                  <div className="w-24 h-0.5 bg-neutral-400 mx-auto mb-1"></div>
                  <span className="text-[10px] text-neutral-400 font-semibold">Principal / Head of School</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
