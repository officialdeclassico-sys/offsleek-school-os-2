import React, { useState } from 'react';
import { BarChart3, Download, FileSpreadsheet, Filter } from 'lucide-react';
import { useSchoolData } from '../../data/schoolContext';

export const ReportsModule: React.FC = () => {
  const { students, staffList, feeTransactions, attendanceBatches, schoolInfo, showToast } = useSchoolData();

  const [reportType, setReportType] = useState<'attendance' | 'fees' | 'admissions' | 'staff'>('fees');

  const exportCurrentReport = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let filename = 'Report.csv';

    if (reportType === 'fees') {
      filename = `Fee_Collection_Report_${schoolInfo.academicYear.replace(/\s+/g, '_')}.csv`;
      headers = ['Receipt No', 'Student', 'Class', 'Amount', 'Fee Type', 'Payment Method', 'Date'];
      rows = feeTransactions.map((tx) => [
        tx.receiptNo,
        `"${tx.studentName}"`,
        tx.classGrade,
        tx.amount,
        tx.feeType,
        tx.paymentMethod,
        tx.paymentDate,
      ]);
    } else if (reportType === 'attendance') {
      filename = 'Attendance_Summary_Report.csv';
      headers = ['Batch ID', 'Class', 'Section', 'Date', 'Total Students', 'Present', 'Absent'];
      rows = attendanceBatches.map((b) => {
        const pres = b.records.filter((r) => r.status === 'Present').length;
        const abs = b.records.filter((r) => r.status === 'Absent').length;
        return [b.id, b.classGrade, b.section, b.date, b.records.length, pres, abs];
      });
    } else if (reportType === 'staff') {
      filename = 'Staff_Directory_Report.csv';
      headers = ['Employee ID', 'Name', 'Department', 'Designation', 'Joining Date', 'Status'];
      rows = staffList.map((st) => [
        st.employeeId,
        `"${st.name}"`,
        st.department,
        st.designation,
        st.joiningDate,
        st.status,
      ]);
    } else {
      filename = 'Student_Enrollment_Report.csv';
      headers = ['Admission No', 'Name', 'Class', 'Section', 'Guardian', 'Contact', 'Status'];
      rows = students.map((s) => [
        s.admissionNo,
        `"${s.name}"`,
        s.classGrade,
        s.section,
        `"${s.guardianName}"`,
        s.guardianPhone,
        s.status,
      ]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filename} successfully.`);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Reports & Business Analytics</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Download administrative audit tables, ledger extracts, and academic performance data
          </p>
        </div>

        <button
          onClick={exportCurrentReport}
          className="flex items-center gap-1.5 px-4 py-2 bg-black text-white hover:bg-neutral-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs self-start sm:self-auto"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Selected Report (CSV)</span>
        </button>
      </div>

      {/* Report Selector Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: 'fees', label: 'Fee Collections & Dues', count: feeTransactions.length + ' receipts' },
          { id: 'attendance', label: 'Attendance Audit', count: attendanceBatches.length + ' batches' },
          { id: 'admissions', label: 'Student Enrollment', count: students.length + ' students' },
          { id: 'staff', label: 'Staff & Faculty', count: staffList.length + ' members' },
        ].map((item) => (
          <button
            key={item.id}
            onClick={() => setReportType(item.id as any)}
            className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
              reportType === item.id
                ? 'bg-neutral-900 text-white border-neutral-900 shadow-xs'
                : 'bg-white border-neutral-200 hover:border-neutral-300 text-neutral-700'
            }`}
          >
            <span className="font-bold text-xs block">{item.label}</span>
            <span className={`text-[10px] block mt-1 ${reportType === item.id ? 'text-neutral-400' : 'text-neutral-400'}`}>
              {item.count}
            </span>
          </button>
        ))}
      </div>

      {/* Preview Card */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              Preview: {reportType.toUpperCase()} DATASET
            </h3>
            <p className="text-xs text-neutral-500">Live system records ready for spreadsheet export</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-neutral-100 rounded-lg text-neutral-600">
            CSV Format (.csv)
          </span>
        </div>

        <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 text-xs space-y-2 text-neutral-700">
          <p>
            This data extraction incorporates validated database rows for academic session <strong>{schoolInfo.academicYear}</strong>. All figures reflect verified transactions and active student enrollments.
          </p>
          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={exportCurrentReport}
              className="px-4 py-2 bg-neutral-900 text-white rounded-lg font-semibold hover:bg-neutral-800 transition-colors cursor-pointer text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Full CSV</span>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
