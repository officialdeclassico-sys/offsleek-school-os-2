import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle,
  FileCheck,
  Save,
  Scan,
  ShieldCheck,
  Upload,
} from 'lucide-react';
import { useSchoolData, AttendanceRecord, AttendanceStatus, RegisterScanBatch, RegisterScanEntry } from '../../data/schoolContext';
import { OffsleekSelect } from '../OffsleekSelect';
import { AttendanceDocumentPreview } from '../AttendanceDocumentPreview';
import { processRegisterFile, RegisterFileKind, validateRegisterFile } from '../../utils/registerScan';
import {
  formatDateTimeIST,
  formatRelativeTime,
  getTodayDateIST,
  useRelativeTimeNow,
} from '../../utils/dateTime';

const DUPLICATE_ENTRY_REASON = 'This student appears on multiple extracted rows.';

const refreshDuplicateFlags = (entries: RegisterScanEntry[]) => {
  const counts = new Map<string, number>();
  entries.forEach((entry) => {
    if (!entry.excluded && entry.matchedStudentId) {
      counts.set(entry.matchedStudentId, (counts.get(entry.matchedStudentId) || 0) + 1);
    }
  });
  return entries.map((entry) => {
    const reasons = entry.flagReasons.filter((reason) => reason !== DUPLICATE_ENTRY_REASON);
    if (!entry.excluded && entry.matchedStudentId && (counts.get(entry.matchedStudentId) || 0) > 1) {
      reasons.push(DUPLICATE_ENTRY_REASON);
    }
    return { ...entry, flagReasons: reasons, isFlagged: reasons.length > 0 };
  });
};

export const AttendanceModule: React.FC = () => {
  const {
    students,
    attendanceBatches,
    saveAttendanceBatch,
    getAttendanceForDateAndClass,
    showToast,
    registerScanBatches,
    upsertRegisterScanBatch,
  } = useSchoolData();

  const [activeTab, setActiveTab] = useState<'manual' | 'scan' | 'history'>('manual');
  const relativeNowMs = useRelativeTimeNow();

  // Manual Register State
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateIST());
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [selectedSection, setSelectedSection] = useState('A');
  const [records, setRecords] = useState<Record<string, AttendanceStatus>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});

  // Smart Register Scan State
  const [scanFile, setScanFile] = useState<File | null>(null);
  const [scanFileKind, setScanFileKind] = useState<RegisterFileKind | null>(null);
  const [scanClass, setScanClass] = useState('Class 10');
  const [scanSection, setScanSection] = useState('A');
  const [scanDate, setScanDate] = useState(() => getTodayDateIST());
  const [isExtracting, setIsExtracting] = useState(false);
  const [scanProgress, setScanProgress] = useState('');
  const [scanError, setScanError] = useState('');
  const [scanOcrText, setScanOcrText] = useState('');
  const [scanEntries, setScanEntries] = useState<RegisterScanEntry[]>([]);
  const [isScanApproved, setIsScanApproved] = useState(false);
  const [scanBatch, setScanBatch] = useState<RegisterScanBatch | null>(null);
  const processingRef = useRef(false);
  const processingControllerRef = useRef<AbortController | null>(null);

  // Active class students
  const activeStudents = students.filter(
    (s) => s.classGrade === selectedClass && s.section === selectedSection
  );
  const batchHistoryCount =
    attendanceBatches.filter((batch) => batch.source !== 'Smart Register Scan').length + registerScanBatches.length;

  // Load existing records whenever date/class/section changes
  React.useEffect(() => {
    const existing = getAttendanceForDateAndClass(selectedDate, selectedClass, selectedSection);
    const initialMap: Record<string, AttendanceStatus> = {};
    const initialRemarks: Record<string, string> = {};

    if (existing && existing.length > 0) {
      existing.forEach((r) => {
        initialMap[r.studentId] = r.status;
        if (r.remarks) initialRemarks[r.studentId] = r.remarks;
      });
    } else {
      activeStudents.forEach((s) => {
        initialMap[s.id] = 'Present';
      });
    }

    setRecords(initialMap);
    setRemarks(initialRemarks);
  }, [selectedDate, selectedClass, selectedSection, students]);

  // Status toggle handler
  const handleToggle = (studentId: string, status: AttendanceStatus) => {
    setRecords((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status: AttendanceStatus) => {
    const updated: Record<string, AttendanceStatus> = {};
    activeStudents.forEach((s) => {
      updated[s.id] = status;
    });
    setRecords(updated);
  };

  const handleSaveManualAttendance = () => {
    const formatted: AttendanceRecord[] = activeStudents.map((s) => ({
      studentId: s.id,
      studentName: s.name,
      admissionNo: s.admissionNo,
      status: records[s.id] || 'Present',
      remarks: remarks[s.id] || '',
    }));

    saveAttendanceBatch(selectedDate, selectedClass, selectedSection, formatted);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanError('');
    setScanOcrText('');
    setScanEntries([]);
    setIsScanApproved(false);
    setScanBatch(null);
    try {
      const kind = await validateRegisterFile(file);
      setScanFile(file);
      setScanFileKind(kind);
    } catch (error) {
      setScanFile(null);
      setScanFileKind(null);
      const message = error instanceof Error ? error.message : 'Unable to read the selected file.';
      const failedBatch: RegisterScanBatch = {
        id: `SCAN-${Date.now()}`,
        filename: file.name,
        uploadedAt: new Date().toISOString(),
        date: scanDate,
        classGrade: scanClass,
        section: scanSection,
        rowsExtracted: 0,
        matchedCount: 0,
        reviewCount: 0,
        contextWarnings: [],
        contextConfirmed: false,
        processingWarnings: [],
        processingConfirmed: false,
        processingStatus: 'Failed',
        verificationStatus: 'Failed',
        error: message,
      };
      setScanBatch(failedBatch);
      upsertRegisterScanBatch(failedBatch);
      setScanError(message);
    }
    e.target.value = '';
  };

  const handleProcessUploadedFile = async () => {
    if (!scanFile || !scanFileKind || processingRef.current) return;
    processingRef.current = true;
    setIsExtracting(true);
    setScanError('');
    setScanOcrText('');
    setScanEntries([]);
    setIsScanApproved(false);
    setScanProgress('Preparing document…');
    const batch: RegisterScanBatch = {
      id: `SCAN-${Date.now()}`,
      filename: scanFile.name,
      uploadedAt: new Date().toISOString(),
      date: scanDate,
      classGrade: scanClass,
      section: scanSection,
      rowsExtracted: 0,
      matchedCount: 0,
      reviewCount: 0,
      contextWarnings: [],
      contextConfirmed: false,
      processingWarnings: [],
      processingConfirmed: false,
      processingStatus: 'Processing',
      verificationStatus: 'Pending',
    };
    setScanBatch(batch);
    upsertRegisterScanBatch(batch);
    const controller = new AbortController();
    processingControllerRef.current = controller;

    try {
      const kind = await validateRegisterFile(scanFile);
      const roster = students.filter(
        (student) => student.status === 'Active' && student.classGrade === scanClass && student.section === scanSection
      );
      const result = await processRegisterFile(scanFile, kind, roster, setScanProgress, controller.signal);
      setScanOcrText(result.extractedText);
      if (!result.extractedText.trim()) {
        throw new Error(result.pageErrors.length
          ? `No OCR text was recovered. ${result.pageErrors.join(' ')}`
          : `OCR completed on ${result.pagesProcessed} page(s), but returned no text. The document may be blank, too faint, or rotated; verify the page preview and try a clearer scan.`);
      }
      const extracted = result.entries;
      const reviewCount = extracted.filter((entry) => entry.isFlagged).length;
      const contextWarnings = [
        result.detectedDate && result.detectedDate !== scanDate
          ? `Document date ${result.detectedDate} differs from selected date ${scanDate}.`
          : '',
        result.detectedClass && result.detectedClass !== scanClass
          ? `Document class ${result.detectedClass} differs from selected class ${scanClass}.`
          : '',
        result.detectedSection && result.detectedSection !== scanSection
          ? `Document section ${result.detectedSection} differs from selected section ${scanSection}.`
          : '',
      ].filter(Boolean);
      const processingWarnings = result.pageErrors;
      const completedBatch: RegisterScanBatch = {
        ...batch,
        rowsExtracted: extracted.length,
        matchedCount: extracted.filter((entry) => entry.matchedStudentId).length,
        reviewCount,
        detectedDate: result.detectedDate || undefined,
        detectedClass: result.detectedClass || undefined,
        detectedSection: result.detectedSection || undefined,
        contextWarnings,
        contextConfirmed: contextWarnings.length === 0,
        processingWarnings,
        processingConfirmed: processingWarnings.length === 0,
        processingStatus: reviewCount || contextWarnings.length || processingWarnings.length || !extracted.length
          ? 'Needs Review'
          : 'Ready for Confirmation',
        error: extracted.length
          ? undefined
          : `OCR recognized text from ${result.pagesProcessed} page(s), but no attendance rows could be identified. Review the extracted text below.`,
      };
      setScanEntries(extracted);
      setScanBatch(completedBatch);
      upsertRegisterScanBatch(completedBatch);
      if (!extracted.length) {
        const message = `OCR recovered ${result.extractedText.length} characters from ${result.pagesProcessed} page(s), but could not identify attendance rows. Review the extracted text below.${processingWarnings.length ? ` ${processingWarnings.join(' ')}` : ''}`;
        setScanError(message);
        showToast('OCR text was recovered, but attendance rows need manual review.', 'info');
      } else {
        if (processingWarnings.length) setScanError(`Some pages need attention. ${processingWarnings.join(' ')}`);
        showToast(`Read ${extracted.length} attendance rows from ${scanFile.name}. Review the extracted records before saving.`, 'info');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        const cancelledBatch = {
          ...batch,
          processingStatus: 'Cancelled' as const,
          verificationStatus: 'Cancelled' as const,
          error: 'Processing cancelled by user.',
        };
        setScanBatch(cancelledBatch);
        upsertRegisterScanBatch(cancelledBatch);
        return;
      }
      const message = error instanceof Error ? error.message : 'Document processing failed.';
      const failedBatch = { ...batch, processingStatus: 'Failed' as const, verificationStatus: 'Failed' as const, error: message };
      setScanBatch(failedBatch);
      upsertRegisterScanBatch(failedBatch);
      setScanError(message);
      showToast(`Register scan failed: ${message}`, 'error');
    } finally {
      setIsExtracting(false);
      setScanProgress('');
      processingRef.current = false;
      processingControllerRef.current = null;
    }
  };

  // Manual correction of scanned entry
  const handleCorrectScanStatus = (entryId: string, newStatus: AttendanceStatus) => {
    setScanEntries((prev) => refreshDuplicateFlags(prev.map((entry) => {
      if (entry.id !== entryId) return entry;
      const flagReasons = entry.flagReasons.filter((reason) => reason !== 'Attendance mark is unreadable or invalid.');
      const remainingReasons = flagReasons.filter((reason) => !reason.includes('OCR attendance mark confidence is low'));
      return { ...entry, correctedStatus: newStatus, flagReasons: remainingReasons, isFlagged: remainingReasons.length > 0 };
    })));
  };

  const handleCorrectScanStudent = (entryId: string, studentId: string) => {
    const student = students.find((candidate) =>
      candidate.id === studentId && candidate.status === 'Active' &&
      candidate.classGrade === scanClass && candidate.section === scanSection
    );
    if (!student) return;
    setScanEntries((prev) => refreshDuplicateFlags(prev.map((entry) => {
      if (entry.id !== entryId) return entry;
      const flagReasons = entry.flagReasons.filter((reason) =>
        reason !== 'Student could not be matched to the selected class and section.' &&
        reason !== 'Multiple roster records match this entry.'
      );
      return {
        ...entry,
        matchedStudentId: student.id,
        matchedStudentName: student.name,
        matchMethod: 'Manual review',
        flagReasons,
        isFlagged: flagReasons.length > 0,
      };
    })));
  };

  React.useEffect(() => {
    if (!scanBatch || scanBatch.processingStatus === 'Processing' || scanBatch.processingStatus === 'Failed' || scanBatch.processingStatus === 'Cancelled' || isScanApproved) return;
    const reviewCount = scanEntries.filter((entry) => !entry.excluded && entry.isFlagged).length;
    const nextStatus: RegisterScanBatch['processingStatus'] =
      reviewCount || (scanBatch.contextWarnings.length > 0 && !scanBatch.contextConfirmed) ||
      (scanBatch.processingWarnings.length > 0 && !scanBatch.processingConfirmed) || scanEntries.length === 0
        ? 'Needs Review'
        : 'Ready for Confirmation';
    if (reviewCount === scanBatch.reviewCount && nextStatus === scanBatch.processingStatus) return;
    const updatedBatch = {
      ...scanBatch,
      reviewCount,
      matchedCount: scanEntries.filter((entry) => !entry.excluded && entry.matchedStudentId).length,
      processingStatus: nextStatus,
    };
    setScanBatch(updatedBatch);
    upsertRegisterScanBatch(updatedBatch);
  }, [scanEntries, scanBatch, isScanApproved, upsertRegisterScanBatch]);

  // Only explicitly confirmed, unambiguous, complete rows are committed.
  const handleApproveScanBatch = () => {
    if (!scanBatch || !scanEntries.length || isExtracting) return;
    if (!scanBatch.contextConfirmed) {
      showToast('Review and confirm the document date, class, and section before saving.', 'error');
      return;
    }
    if (!scanBatch.processingConfirmed) {
      showToast('Review and confirm the page-level OCR warnings before saving.', 'error');
      return;
    }
    const included = scanEntries.filter((entry) => !entry.excluded);
    if (!included.length || included.some((entry) => entry.isFlagged || !entry.matchedStudentId || !(entry.correctedStatus || entry.extractedStatus))) {
      showToast('Resolve or explicitly exclude every flagged row before saving attendance.', 'error');
      return;
    }
    const studentIds = included.map((entry) => entry.matchedStudentId);
    if (new Set(studentIds).size !== studentIds.length) {
      showToast('Each student can appear only once in a saved attendance batch.', 'error');
      return;
    }
    const existingBatch = attendanceBatches.find((batch) =>
      batch.date === scanDate && batch.classGrade === scanClass && batch.section === scanSection
    );
    if (existingBatch && !window.confirm(`Attendance already exists for ${scanClass}-${scanSection} on ${scanDate}. Replace the existing batch with these verified scan records?`)) return;
    const rosterById = new Map(students.map((student) => [student.id, student]));
    const missingRosterEntry = included.find((entry) => {
      const student = rosterById.get(entry.matchedStudentId!);
      return !student || student.status !== 'Active' || student.classGrade !== scanClass || student.section !== scanSection;
    });
    if (missingRosterEntry) {
      showToast(`The matched student for "${missingRosterEntry.scannedName}" is no longer in the selected roster. Review the match again.`, 'error');
      return;
    }
    const matchedRecords: AttendanceRecord[] = [];
    included.forEach((entry) => {
      const student = rosterById.get(entry.matchedStudentId!);
      if (!student) return;
      matchedRecords.push({
        studentId: student.id,
        studentName: student.name,
        admissionNo: student.admissionNo,
        status: entry.correctedStatus || entry.extractedStatus!,
        remarks: `Verified register scan. OCR text confidence ${entry.confidence === null ? 'unavailable' : `${entry.confidence}%`}. Original mark: ${entry.rawAttendanceMark || 'unreadable'}.`,
      });
    });
    saveAttendanceBatch(scanDate, scanClass, scanSection, matchedRecords, {
      source: 'Smart Register Scan',
      sourceBatchId: scanBatch.id,
    });
    const savedBatch: RegisterScanBatch = {
      ...scanBatch,
      matchedCount: matchedRecords.length,
      reviewCount: 0,
      processingStatus: 'Completed',
      verificationStatus: 'Saved',
    };
    setScanBatch(savedBatch);
    upsertRegisterScanBatch(savedBatch);
    setIsScanApproved(true);
    setSelectedDate(scanDate);
    setSelectedClass(scanClass);
    setSelectedSection(scanSection);
    setActiveTab('manual');
    showToast('Verified register scan saved to the Manual Register.');
  };

  // Metrics summary for active view
  const presentCount = Object.values(records).filter((s) => s === 'Present').length;
  const absentCount = Object.values(records).filter((s) => s === 'Absent').length;
  const lateCount = Object.values(records).filter((s) => s === 'Late').length;
  const excusedCount = Object.values(records).filter((s) => s === 'Excused').length;
  const attendanceRate = activeStudents.length > 0 ? Math.round((presentCount / activeStudents.length) * 100) : 0;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 tracking-tight">Attendance Management</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Daily roll call registers, smart register scans, and attendance audit trails
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="inline-flex p-1 bg-neutral-100 rounded-xl border border-neutral-200 text-xs font-semibold self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('manual')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'manual' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-black'
            }`}
          >
            Manual Register
          </button>
          <button
            onClick={() => setActiveTab('scan')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'scan' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-black'
            }`}
          >
            <Scan className="w-3.5 h-3.5" />
            <span>Smart Register Scan</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'history' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-black'
            }`}
          >
            Batch History ({batchHistoryCount})
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: MANUAL ATTENDANCE REGISTER                         */}
      {/* ========================================================= */}
      {activeTab === 'manual' && (
        <div className="space-y-6">
          
          {/* Controls & Metrics Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Class, Section, Date Selectors (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Register Configuration
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Class</label>
                  <OffsleekSelect
                    value={selectedClass}
                    onChange={(val) => setSelectedClass(val)}
                    options={['Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12']}
                    size="sm"
                    variant="subtle"
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-neutral-700 mb-1">Section</label>
                  <OffsleekSelect
                    value={selectedSection}
                    onChange={(val) => setSelectedSection(val)}
                    options={[
                      { value: 'A', label: 'Section A' },
                      { value: 'B', label: 'Section B' },
                      { value: 'Science', label: 'Section Science' },
                    ]}
                    size="sm"
                    variant="subtle"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
                <span className="text-neutral-500">
                  {activeStudents.length} students enrolled in {selectedClass}-{selectedSection}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleMarkAll('Present')}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Mark All Present
                  </button>
                  <button
                    onClick={() => handleMarkAll('Absent')}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                  >
                    Mark All Absent
                  </button>
                </div>
              </div>
            </div>

            {/* Attendance Summary KPI box (5 cols) */}
            <div className="lg:col-span-5 bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Session Attendance Summary
              </h3>

              <div className="grid grid-cols-4 gap-2 text-center py-2">
                <div className="p-2.5 bg-emerald-50 rounded-xl">
                  <span className="text-lg font-black text-emerald-700 block tabular-nums">{presentCount}</span>
                  <span className="text-[10px] font-semibold text-emerald-800 uppercase">Present</span>
                </div>
                <div className="p-2.5 bg-rose-50 rounded-xl">
                  <span className="text-lg font-black text-rose-700 block tabular-nums">{absentCount}</span>
                  <span className="text-[10px] font-semibold text-rose-800 uppercase">Absent</span>
                </div>
                <div className="p-2.5 bg-amber-50 rounded-xl">
                  <span className="text-lg font-black text-amber-700 block tabular-nums">{lateCount}</span>
                  <span className="text-[10px] font-semibold text-amber-800 uppercase">Late</span>
                </div>
                <div className="p-2.5 bg-blue-50 rounded-xl">
                  <span className="text-lg font-black text-blue-700 block tabular-nums">{excusedCount}</span>
                  <span className="text-[10px] font-semibold text-blue-800 uppercase">Excused</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                <div className="text-xs">
                  <span className="text-neutral-500">Attendance Rate:</span>
                  <strong className="text-neutral-900 ml-1.5">{attendanceRate}%</strong>
                </div>

                <button
                  onClick={handleSaveManualAttendance}
                  className="px-4 py-2 bg-black text-white hover:bg-neutral-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Official Attendance</span>
                </button>
              </div>
            </div>

          </div>

          {/* Roster Table */}
          <div className="bg-white border border-neutral-200/90 rounded-2xl shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-neutral-50/70 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Roll No</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Admission No</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 font-sans">
                  {activeStudents.length > 0 ? (
                    activeStudents.map((st, idx) => {
                      const currentStatus = records[st.id] || 'Present';
                      return (
                        <tr key={st.id} className="hover:bg-neutral-50/80 transition-colors">
                          <td className="py-3 px-4 font-mono font-bold text-neutral-700">#{idx + 1}</td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-neutral-900 block">{st.name}</span>
                            <span className="text-[10px] text-neutral-400">{st.guardianPhone}</span>
                          </td>
                          <td className="py-3 px-4 font-mono text-neutral-600">{st.admissionNo}</td>
                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex items-center gap-1 bg-neutral-100 p-1 rounded-xl">
                              {(['Present', 'Absent', 'Late', 'Excused'] as AttendanceStatus[]).map((type) => {
                                const isSelected = currentStatus === type;
                                const style = {
                                  Present: isSelected ? 'bg-emerald-600 text-white shadow-xs' : 'text-neutral-600 hover:text-emerald-700',
                                  Absent: isSelected ? 'bg-rose-600 text-white shadow-xs' : 'text-neutral-600 hover:text-rose-700',
                                  Late: isSelected ? 'bg-amber-600 text-white shadow-xs' : 'text-neutral-600 hover:text-amber-700',
                                  Excused: isSelected ? 'bg-blue-600 text-white shadow-xs' : 'text-neutral-600 hover:text-blue-700',
                                }[type];

                                return (
                                  <button
                                    key={type}
                                    type="button"
                                    onClick={() => handleToggle(st.id, type)}
                                    className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all cursor-pointer ${style}`}
                                  >
                                    {type}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <input
                              type="text"
                              value={remarks[st.id] || ''}
                              onChange={(e) => setRemarks({ ...remarks, [st.id]: e.target.value })}
                              placeholder="Optional note (e.g. sick leave note)"
                              className="w-full px-2.5 py-1 text-xs border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900 bg-transparent"
                            />
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-xs text-neutral-400">
                        No students enrolled in {selectedClass} Section {selectedSection}.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: SMART REGISTER SCAN (OCR EXTRACTION WORKFLOW)      */}
      {/* ========================================================= */}
      {activeTab === 'scan' && (
        <div className="space-y-6">
          
          <div className="p-4 bg-neutral-100/90 border border-neutral-200/90 rounded-2xl flex items-start gap-3">
            <Scan className="w-5 h-5 text-neutral-700 shrink-0 mt-0.5" />
            <div className="text-xs text-neutral-600 space-y-1">
              <strong className="text-neutral-900 block font-bold">
                Smart Register Scan
              </strong>
              <p className="leading-relaxed">
                Documents are processed locally in your browser. The OCR worker, WebAssembly runtime, and English language model load from jsDelivr; uploaded register contents are not sent to an OCR service.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Upload & Preview Column (4 cols) */}
            <div className="lg:col-span-4 bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
              <h3 className="text-sm font-bold text-neutral-900">Upload Register Sheet</h3>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">Class</label>
                  <OffsleekSelect
                    value={scanClass}
                    onChange={(val) => setScanClass(val)}
                    options={['Class 10', 'Class 8', 'Class 6']}
                    size="sm"
                    variant="subtle"
                    disabled={isExtracting || scanEntries.length > 0}
                    aria-label="Scan class"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-neutral-600 font-semibold mb-1">Section</label>
                  <OffsleekSelect
                    value={scanSection}
                    onChange={(val) => setScanSection(val)}
                    options={[
                      { value: 'A', label: 'Section A' },
                      { value: 'B', label: 'Section B' },
                    ]}
                    size="sm"
                    variant="subtle"
                    disabled={isExtracting || scanEntries.length > 0}
                    aria-label="Scan section"
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-600 font-semibold mb-1 text-xs">Date of Register</label>
                <input
                  type="date"
                  value={scanDate}
                  onChange={(e) => setScanDate(e.target.value)}
                  disabled={isExtracting || scanEntries.length > 0}
                  className="w-full p-2 bg-neutral-50 border border-neutral-200 rounded-lg text-xs"
                />
              </div>

              {/* Upload Dropzone */}
              <div className="border-2 border-dashed border-neutral-300 rounded-2xl p-6 text-center hover:border-neutral-900 transition-colors cursor-pointer relative bg-neutral-50/50">
                <input
                  type="file"
                  accept="application/pdf,image/png,image/jpeg,image/webp,image/bmp,.pdf,.png,.jpg,.jpeg,.webp,.bmp"
                  onChange={handleFileUpload}
                  disabled={isExtracting}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                <span className="text-xs font-bold text-neutral-800 block">
                  {scanFile ? scanFile.name : 'Choose or drop attendance sheet'}
                </span>
                <span className="text-[11px] text-neutral-400 block mt-0.5">
                  PDF, PNG, JPG, WebP, or BMP · max 25 MB
                </span>
              </div>

              {scanFile && scanFileKind && (
                <div className="space-y-3">
                  <div className="text-[10px] text-neutral-400">{(scanFile.size / 1024).toFixed(0)} KB</div>
                  <AttendanceDocumentPreview file={scanFile} kind={scanFileKind} />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleProcessUploadedFile}
                      disabled={isExtracting}
                      className="min-w-0 flex-1 px-4 py-2 bg-black text-white hover:bg-neutral-800 disabled:opacity-50 rounded-xl text-xs font-semibold"
                    >
                      {isExtracting ? scanProgress || 'Processing document…' : 'Process Uploaded Register'}
                    </button>
                    {isExtracting && (
                      <button
                        type="button"
                        onClick={() => processingControllerRef.current?.abort()}
                        className="rounded-xl border border-neutral-300 px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-100"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              )}
              {scanError && <p role="alert" className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{scanError}</p>}
              {scanOcrText && scanEntries.length === 0 && (
                <details className="rounded-lg border border-neutral-200 bg-white p-3">
                  <summary className="cursor-pointer text-xs font-semibold text-neutral-800">Review extracted OCR text</summary>
                  <pre className="mt-2 max-h-80 overflow-auto whitespace-pre-wrap break-words text-[11px] leading-relaxed text-neutral-700">{scanOcrText}</pre>
                </details>
              )}
            </div>

            {/* Verification & Extraction Table (8 cols) */}
            <div className="lg:col-span-8 bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">Extracted Attendance Verification</h3>
                  <p className="text-xs text-neutral-500">Audit optical recognition results against roster</p>
                </div>
                {isExtracting && (
                  <span className="text-xs text-amber-600 font-semibold animate-pulse" role="status">
                    {scanProgress || 'Processing document…'}
                  </span>
                )}
              </div>

              {scanEntries.length === 0 ? (
                <div className="py-16 text-center text-xs text-neutral-400 space-y-2">
                  <FileCheck className="w-8 h-8 text-neutral-300 mx-auto" />
                  <p>{scanOcrText ? 'OCR text was recovered, but no rows were confidently identified. Review the extracted text and recheck the selected class and section.' : 'Upload a register and process it to extract rows from its contents.'}</p>
                  {scanBatch?.processingWarnings.map((warning) => <p key={warning} className="text-amber-800">{warning}</p>)}
                </div>
              ) : (
                <div className="space-y-4">
                  {scanBatch?.processingWarnings.length ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                      <p className="font-semibold">Some PDF pages could not be processed. Review before saving:</p>
                      <ul className="my-1 list-inside list-disc">{scanBatch.processingWarnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
                      {!scanBatch.processingConfirmed && (
                        <button
                          type="button"
                          onClick={() => {
                            const confirmedBatch = { ...scanBatch, processingConfirmed: true };
                            setScanBatch(confirmedBatch);
                            upsertRegisterScanBatch(confirmedBatch);
                          }}
                          className="mt-1 font-semibold underline"
                        >
                          Confirm the successfully processed pages
                        </button>
                      )}
                    </div>
                  ) : null}
                  {scanBatch && (scanBatch.detectedDate || scanBatch.detectedClass || scanBatch.detectedSection) && (
                    <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-xs">
                      <span className="font-semibold text-neutral-800">Detected document context: </span>
                      <span className="text-neutral-600">
                        {scanBatch.detectedDate || 'Date not detected'} · {scanBatch.detectedClass || 'Class not detected'} · Section {scanBatch.detectedSection || 'not detected'}
                      </span>
                    </div>
                  )}
                  {scanBatch?.contextWarnings.length ? (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                      <p className="font-semibold">Verify the register context before committing:</p>
                      <ul className="my-1 list-inside list-disc">{scanBatch.contextWarnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>
                      {!scanBatch.contextConfirmed && (
                        <button
                          type="button"
                          onClick={() => {
                            const confirmedBatch = { ...scanBatch, contextConfirmed: true, verificationStatus: 'Verified' as const };
                            setScanBatch(confirmedBatch);
                            upsertRegisterScanBatch(confirmedBatch);
                          }}
                          className="mt-1 font-semibold underline"
                        >
                          Confirm selected date, class, and section
                        </button>
                      )}
                    </div>
                  ) : null}
                  <div className="overflow-x-auto border border-neutral-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-neutral-50 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                          <th className="py-2.5 px-3">Extracted Entry</th>
                          <th className="py-2.5 px-3">Official Student</th>
                          <th className="py-2.5 px-3">Extraction / Match</th>
                          <th className="py-2.5 px-3">Extracted Mark / Confirmed Status</th>
                          <th className="py-2.5 px-3">Review</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {scanEntries.map((entry) => (
                          <tr key={entry.id} className={`${entry.isFlagged ? 'bg-amber-50/40' : ''} ${entry.excluded ? 'opacity-50' : ''}`}>
                            <td className="py-2.5 px-3 font-medium text-neutral-900">
                              <span className="block">{entry.scannedName}</span>
                              <span className="block text-[10px] text-neutral-500">Page {entry.pageNumber}</span>
                              {entry.rollNumber && <span className="text-[10px] text-neutral-500">Roll {entry.rollNumber}</span>}
                              {entry.admissionNumber && <span className="block text-[10px] text-neutral-500">ID {entry.admissionNumber}</span>}
                              <span className="block text-[10px] text-neutral-500">Original mark: {entry.rawAttendanceMark || 'not read'}</span>
                            </td>
                            <td className="py-2.5 px-3">
                              <OffsleekSelect
                                value={entry.matchedStudentId || ''}
                                onChange={(value) => handleCorrectScanStudent(entry.id, value)}
                                options={students
                                  .filter((student) => student.status === 'Active' && student.classGrade === scanClass && student.section === scanSection)
                                  .map((student) => ({ value: student.id, label: `${student.name} · ${student.admissionNo}` }))}
                                placeholder="Select roster student"
                                aria-label={`Match ${entry.scannedName} to official student`}
                                size="sm"
                                className="w-56"
                              />
                            </td>
                            <td className="py-2.5 px-3 tabular-nums font-mono whitespace-nowrap">
                              <span className="block">Text {entry.confidence === null ? 'confidence unavailable' : `${entry.confidence}%`}</span>
                              <span className="text-[10px] text-neutral-500">Mark {entry.markConfidence === null ? 'not read' : `${entry.markConfidence}%`}</span>
                              <span className="block text-[10px] text-neutral-500">Match {entry.matchMethod || 'unresolved'}</span>
                            </td>
                            <td className="py-2.5 px-3">
                              <OffsleekSelect
                                value={entry.correctedStatus || entry.extractedStatus || ''}
                                onChange={(val) => handleCorrectScanStatus(entry.id, val as AttendanceStatus)}
                                options={[
                                  { value: 'Present', label: 'Present' },
                                  { value: 'Absent', label: 'Absent' },
                                  { value: 'Late', label: 'Late' },
                                  { value: 'Excused', label: 'Excused' },
                                ]}
                                size="sm"
                                variant="subtle"
                                placeholder="Confirm status"
                                aria-label={`Confirm attendance status for ${entry.scannedName}`}
                                className="w-36"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-[11px]">
                              {entry.excluded ? <span className="font-semibold text-neutral-600">Excluded from save</span> : entry.isFlagged ? (
                                <div className="space-y-1">
                                  <span className="text-amber-800 font-semibold flex items-center gap-1">
                                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                    <span>{entry.flagReasons.join(' ')}</span>
                                  </span>
                                  {entry.flagReasons.some((reason) => reason.includes('confidence is low') || reason.includes('confidence is unavailable')) && (
                                    <button
                                      type="button"
                                      onClick={() => setScanEntries((prev) => refreshDuplicateFlags(prev.map((item) => item.id === entry.id
                                        ? { ...item, flagReasons: item.flagReasons.filter((reason) => !reason.includes('confidence is low') && !reason.includes('confidence is unavailable')), isFlagged: item.flagReasons.some((reason) => !reason.includes('confidence is low') && !reason.includes('confidence is unavailable')) }
                                        : item
                                      )))}
                                      className="text-neutral-700 underline"
                                    >
                                      Confirm extracted text manually
                                    </button>
                                  )}
                                </div>
                              ) : <span className="text-emerald-700 font-medium flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-600" />Reviewed</span>}
                              {!entry.excluded && (
                                <button
                                  type="button"
                                  onClick={() => setScanEntries((prev) => refreshDuplicateFlags(prev.map((item) => item.id === entry.id
                                    ? { ...item, excluded: true, flagReasons: [], isFlagged: false }
                                    : item
                                  )))}
                                  className="mt-1 block text-neutral-500 underline"
                                >
                                  Exclude row
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Authorized Approval Safeguard */}
                  <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-neutral-600">
                      <strong>Audit Safeguard:</strong> Unapproved batches do not alter official student records.
                    </div>

                    <button
                      onClick={handleApproveScanBatch}
                      disabled={isScanApproved || isExtracting || !scanBatch?.contextConfirmed || !scanBatch?.processingConfirmed || !scanEntries.length || scanEntries.filter((entry) => !entry.excluded).length === 0 || scanEntries.some((entry) => !entry.excluded && (entry.isFlagged || !entry.matchedStudentId || !(entry.correctedStatus || entry.extractedStatus)))}
                      className="px-5 py-2 bg-black text-white hover:bg-neutral-800 disabled:opacity-50 font-semibold text-xs rounded-xl transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>{isScanApproved ? 'Batch Approved & Saved' : 'Confirm and Save Attendance'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: BATCH HISTORY & AUDIT LOG                          */}
      {/* ========================================================= */}
      {activeTab === 'history' && (
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <h3 className="text-sm font-bold text-neutral-900">Official Register Submission History</h3>
            <span className="text-xs text-neutral-400">{batchHistoryCount} recorded batches</span>
          </div>

          {registerScanBatches.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wide text-neutral-500">Smart Register Scan Processing</h4>
              <div className="divide-y divide-neutral-100 rounded-xl border border-neutral-200 px-3">
                {registerScanBatches.map((batch) => (
                  <div key={batch.id} className="py-3 flex items-start justify-between gap-4 text-xs">
                    <div className="min-w-0">
                      <span className="block truncate font-bold text-neutral-900">{batch.filename}</span>
                      <span className="text-[11px] text-neutral-500">
                        {batch.classGrade}-{batch.section} · Attendance date {batch.date} · Uploaded {formatRelativeTime(batch.uploadedAt, relativeNowMs)} ({formatDateTimeIST(batch.uploadedAt)} IST)
                      </span>
                      <span className="mt-1 block text-[11px] text-neutral-500">
                        {batch.rowsExtracted} rows extracted · {batch.matchedCount} matched · {batch.reviewCount} needing review
                      </span>
                      {(batch.detectedDate || batch.detectedClass || batch.detectedSection) && (
                        <span className="mt-1 block text-[11px] text-neutral-500">
                          Detected: {batch.detectedDate || 'date unavailable'} · {batch.detectedClass || 'class unavailable'} · Section {batch.detectedSection || 'unavailable'}
                        </span>
                      )}
                      {batch.contextWarnings.map((warning) => <span key={warning} className="mt-1 block text-[11px] text-amber-800">{warning}</span>)}
                      {batch.processingWarnings.map((warning) => <span key={warning} className="mt-1 block text-[11px] text-amber-800">{warning}</span>)}
                      {batch.error && <span className="mt-1 block text-[11px] text-rose-700">{batch.error}</span>}
                    </div>
                    <div className="shrink-0 text-right">
                      <span className={`block font-bold ${batch.processingStatus === 'Failed' ? 'text-rose-700' : batch.processingStatus === 'Completed' ? 'text-emerald-700' : batch.processingStatus === 'Cancelled' ? 'text-neutral-500' : 'text-neutral-800'}`}>
                        {batch.processingStatus}
                      </span>
                      <span className="text-[10px] text-neutral-500">{batch.verificationStatus} · {batch.id}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {attendanceBatches.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wide text-neutral-500">Saved Attendance Batches</h4>
              <div className="divide-y divide-neutral-100">
                {attendanceBatches.map((batch) => {
                const present = batch.records.filter((r) => r.status === 'Present').length;
                return (
                  <div key={batch.id} className="py-3 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-neutral-900 block">
                        {batch.classGrade} - Section {batch.section} · {batch.source || 'Manual Register'}
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        Date: {batch.date} · Taken by {batch.takenBy} at {batch.takenAt}
                        {batch.createdAt ? ` · ${formatRelativeTime(batch.createdAt, relativeNowMs)}` : ''}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-emerald-700 block">
                        {present} / {batch.records.length} Present
                      </span>
                      <span className="text-[10px] text-neutral-400">Batch ID: {batch.id}</span>
                    </div>
                  </div>
                );
                })}
              </div>
            </div>
          )}

          {attendanceBatches.length === 0 && registerScanBatches.length === 0 && (
            <div className="py-12 text-center text-xs text-neutral-400">
              No saved batches yet. Save attendance from Manual Register or Smart Register Scan to see entries here.
            </div>
          )}
        </div>
      )}

    </div>
  );
};
