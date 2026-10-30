import React, { useState } from 'react';
import { BookOpen, Calendar, Check, GraduationCap, Plus, Users } from 'lucide-react';
import { useSchoolData } from '../../data/schoolContext';

export const AcademicsModule: React.FC = () => {
  const { schoolInfo, students, staffList } = useSchoolData();

  const classes = [
    { name: 'Class 6', sections: ['A', 'B'], students: 118, classTeacher: 'Prof. Anand Joshi' },
    { name: 'Class 7', sections: ['A', 'B'], students: 122, classTeacher: 'Sunita Rao' },
    { name: 'Class 8', sections: ['A', 'B'], students: 130, classTeacher: 'Maria Fernandez' },
    { name: 'Class 9', sections: ['A', 'B'], students: 128, classTeacher: 'Dr. Robert Vance' },
    { name: 'Class 10', sections: ['A', 'B'], students: 135, classTeacher: 'Prof. Anand Joshi' },
    { name: 'Class 11', sections: ['Science', 'Commerce'], students: 104, classTeacher: 'Dr. Elizabeth Sterling' },
    { name: 'Class 12', sections: ['Science', 'Commerce'], students: 98, classTeacher: 'Sunita Rao' },
  ];

  const subjects = [
    { code: 'MTH-101', name: 'Mathematics', dept: 'Science & Math', weeklyPeriods: 6, hod: 'Prof. Anand Joshi' },
    { code: 'ENG-102', name: 'English Language & Literature', dept: 'Languages', weeklyPeriods: 5, hod: 'Sunita Rao' },
    { code: 'SCI-103', name: 'Physics & Chemistry', dept: 'Science & Math', weeklyPeriods: 6, hod: 'Maria Fernandez' },
    { code: 'SOC-104', name: 'Social Studies & History', dept: 'Humanities', weeklyPeriods: 4, hod: 'Vikramaditya Bose' },
    { code: 'CS-105', name: 'Computer Science & AI', dept: 'Technology', weeklyPeriods: 4, hod: 'Admin Council' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Academics & Curriculum</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Academic structure, classes, sections, subject departments, and syllabus coverage
          </p>
        </div>
      </div>

      {/* Classes and Sections Grid */}
      <div>
        <h3 className="text-sm font-bold text-neutral-900 mb-3">Enrolled Class Divisions (Academic Session {schoolInfo.academicYear})</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {classes.map((cls) => (
            <div key={cls.name} className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-2xs hover:shadow-xs transition-shadow">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100 gap-2">
                <span className="font-bold text-sm text-neutral-900 whitespace-nowrap">{cls.name}</span>
                <span className="text-[10px] bg-neutral-100 px-2 py-0.5 rounded font-mono font-semibold text-neutral-700 whitespace-nowrap">
                  {cls.sections.join(', ')}
                </span>
              </div>
              <div className="pt-2.5 space-y-1 text-xs">
                <div className="flex justify-between items-center text-neutral-500">
                  <span className="whitespace-nowrap">Enrolled:</span>
                  <span className="font-bold text-neutral-900 tabular-nums whitespace-nowrap">{cls.students} students</span>
                </div>
                <div className="flex justify-between items-center text-neutral-500 gap-2">
                  <span className="whitespace-nowrap">Class Teacher:</span>
                  <span className="font-medium text-neutral-800 truncate max-w-[130px]" title={cls.classTeacher}>{cls.classTeacher}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Subject Management Table */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">Academic Subjects & Curricula</h3>
            <p className="text-xs text-neutral-500">Departmental subject allocations for 2025-26</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-neutral-50 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Subject Code</th>
                <th className="py-2.5 px-3">Subject Name</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Weekly Periods</th>
                <th className="py-2.5 px-3">Head of Department</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {subjects.map((sub) => (
                <tr key={sub.code} className="hover:bg-neutral-50/80">
                  <td className="py-3 px-3 font-mono font-bold text-neutral-700">{sub.code}</td>
                  <td className="py-3 px-3 font-semibold text-neutral-900">{sub.name}</td>
                  <td className="py-3 px-3 text-neutral-600">{sub.dept}</td>
                  <td className="py-3 px-3 tabular-nums font-semibold">{sub.weeklyPeriods} periods/wk</td>
                  <td className="py-3 px-3 font-medium text-neutral-800">{sub.hod}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
