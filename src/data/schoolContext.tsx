import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentTimeIST, getCurrentYearIST, getTodayDateIST } from '../utils/dateTime';

// ==========================================
// TYPED DATA MODELS
// ==========================================

export interface Student {
  id: string;
  admissionNo: string;
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  classGrade: string;
  section: string;
  academicYear: string;
  guardianName: string;
  guardianRelation: string;
  guardianPhone: string;
  guardianEmail: string;
  address: string;
  admissionDate: string;
  status: 'Active' | 'Inactive' | 'Transferred';
  feesTotal: number;
  feesPaid: number;
  attendanceRate: number;
}

export interface AdmissionApplication {
  id: string;
  applicantName: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  appliedClass: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  applicationDate: string;
  status: 'New' | 'Under Review' | 'Approved' | 'Rejected' | 'Enrolled';
  notes: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused';

export interface AttendanceRecord {
  studentId: string;
  studentName: string;
  admissionNo: string;
  status: AttendanceStatus;
  remarks?: string;
}

export interface AttendanceBatch {
  id: string;
  date: string;
  classGrade: string;
  section: string;
  takenBy: string;
  takenAt: string;
  createdAt?: string;
  records: AttendanceRecord[];
  source?: 'Manual Register' | 'Smart Register Scan';
  sourceBatchId?: string;
}

export interface RegisterScanBatch {
  id: string;
  filename: string;
  uploadedAt: string;
  date: string;
  classGrade: string;
  section: string;
  rowsExtracted: number;
  matchedCount: number;
  reviewCount: number;
  detectedDate?: string;
  detectedClass?: string;
  detectedSection?: string;
  contextWarnings: string[];
  contextConfirmed: boolean;
  processingWarnings: string[];
  processingConfirmed: boolean;
  processingStatus: 'Processing' | 'Needs Review' | 'Ready for Confirmation' | 'Completed' | 'Failed' | 'Cancelled';
  verificationStatus: 'Pending' | 'Verified' | 'Saved' | 'Failed' | 'Cancelled';
  error?: string;
}

export interface RegisterScanEntry {
  id: string;
  rollNumber: string | null;
  admissionNumber: string | null;
  scannedName: string;
  matchedStudentId: string | null;
  matchedStudentName: string | null;
  confidence: number | null;
  markConfidence: number | null;
  pageNumber: number;
  matchMethod: 'Admission number' | 'Exact name' | 'Manual review' | null;
  rawAttendanceMark: string;
  extractedStatus: AttendanceStatus | null;
  correctedStatus?: AttendanceStatus;
  isFlagged: boolean;
  flagReasons: string[];
  excluded?: boolean;
}

export interface FeeTransaction {
  id: string;
  receiptNo: string;
  studentId: string;
  studentName: string;
  classGrade: string;
  amount: number;
  feeType: 'Tuition Fee' | 'Transport Fee' | 'Examination Fee' | 'Annual Development' | 'Library Fee';
  paymentDate: string;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Online / UPI' | 'Cheque';
  status: 'Paid' | 'Partial' | 'Pending';
  remarks?: string;
}

export interface StaffMember {
  id: string;
  employeeId: string;
  name: string;
  gender: 'Male' | 'Female';
  designation: string;
  department: string;
  email: string;
  phone: string;
  joiningDate: string;
  status: 'Active' | 'On Leave' | 'Resigned';
  qualification: string;
}

export interface StaffLeaveRequest {
  id: string;
  staffId: string;
  staffName: string;
  leaveType: 'Sick Leave' | 'Casual Leave' | 'Paid Leave' | 'Maternity Leave';
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedDate: string;
}

export interface Exam {
  id: string;
  title: string;
  academicYear: string;
  classGrade: string;
  term: 'Term 1' | 'Term 2' | 'Unit Test';
  startDate: string;
  endDate: string;
  status: 'Draft' | 'Published';
  subjects: { name: string; maxMarks: number; passingMarks: number }[];
}

export interface StudentExamMark {
  examId: string;
  studentId: string;
  subject: string;
  marksObtained: number;
  maxMarks: number;
  grade: string;
  remarks?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  audience: 'All School' | 'High School' | 'Primary School' | 'Staff Only' | 'Parents Only';
  priority: 'Normal' | 'Important' | 'Urgent';
  publishedAt: string;
  author: string;
  status: 'Published' | 'Archived';
  category: 'Holiday' | 'Academic' | 'Meeting' | 'General';
}

export interface DocumentRequest {
  id: string;
  requestNo: string;
  studentId: string;
  studentName: string;
  classGrade: string;
  documentType: 'Transfer Certificate' | 'Bonafide Certificate' | 'Study Certificate' | 'Duplicate ID Card';
  requestDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Issued' | 'Rejected';
  issuedDate?: string;
  remarks?: string;
}

export interface TransportRoute {
  id: string;
  routeNumber: string;
  routeName: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  capacity: number;
  assignedStudentsCount: number;
  stops: string[];
}

export interface LibraryBook {
  id: string;
  accessionNo: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
}

export interface BookBorrowRecord {
  id: string;
  bookId: string;
  bookTitle: string;
  studentId: string;
  studentName: string;
  classGrade: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'Borrowed' | 'Returned' | 'Overdue';
}

export interface RecentActivity {
  id: string;
  type: 'admission' | 'fee' | 'attendance' | 'announcement' | 'exam' | 'document';
  title: string;
  description: string;
  timestamp: string;
  color: 'emerald' | 'purple' | 'blue' | 'rose' | 'amber';
}

export interface UpcomingEvent {
  id: string;
  day: string;
  month: string;
  title: string;
  time: string;
  color: 'blue' | 'emerald' | 'amber' | 'rose';
}

export interface SchoolInfo {
  name: string;
  motto: string;
  code: string;
  academicYear: string;
  currency: string;
  currencySymbol: string;
  address: string;
  phone: string;
  email: string;
  principalName: string;
}

// ==========================================
// CONTEXT INTERFACE
// ==========================================

interface SchoolContextType {
  schoolInfo: SchoolInfo;
  updateSchoolInfo: (info: Partial<SchoolInfo>) => void;
  academicYears: string[];
  selectedAcademicYear: string;
  setSelectedAcademicYear: (year: string) => void;

  // Students
  students: Student[];
  addStudent: (student: Omit<Student, 'id' | 'admissionNo' | 'feesPaid' | 'attendanceRate'>) => Student;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;

  // Admissions
  admissions: AdmissionApplication[];
  addAdmission: (app: Omit<AdmissionApplication, 'id' | 'applicationDate' | 'status'>) => AdmissionApplication;
  updateAdmissionStatus: (id: string, status: AdmissionApplication['status']) => void;
  convertAdmissionToStudent: (admissionId: string) => Student | null;

  // Attendance
  attendanceBatches: AttendanceBatch[];
  saveAttendanceBatch: (
    date: string,
    classGrade: string,
    section: string,
    records: AttendanceRecord[],
    source?: Pick<AttendanceBatch, 'source' | 'sourceBatchId'>
  ) => void;
  getAttendanceForDateAndClass: (date: string, classGrade: string, section: string) => AttendanceRecord[];
  registerScanBatches: RegisterScanBatch[];
  upsertRegisterScanBatch: (batch: RegisterScanBatch) => void;

  // Fees & Payments
  feeTransactions: FeeTransaction[];
  recordFeePayment: (payment: Omit<FeeTransaction, 'id' | 'receiptNo' | 'paymentDate' | 'status'>) => FeeTransaction;

  // Staff
  staffList: StaffMember[];
  addStaff: (member: Omit<StaffMember, 'id' | 'employeeId'>) => StaffMember;
  updateStaff: (id: string, updates: Partial<StaffMember>) => void;
  leaveRequests: StaffLeaveRequest[];
  submitLeaveRequest: (req: Omit<StaffLeaveRequest, 'id' | 'appliedDate' | 'status'>) => void;
  updateLeaveStatus: (id: string, status: StaffLeaveRequest['status']) => void;

  // Exams
  exams: Exam[];
  examMarks: StudentExamMark[];
  addExam: (exam: Omit<Exam, 'id'>) => Exam;
  updateExamStatus: (id: string, status: Exam['status']) => void;
  saveStudentMarks: (examId: string, studentId: string, subject: string, marks: number, maxMarks: number) => void;

  // Announcements
  announcements: Announcement[];
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'publishedAt' | 'status'>) => Announcement;
  archiveAnnouncement: (id: string) => void;

  // Documents
  documentRequests: DocumentRequest[];
  addDocumentRequest: (req: Omit<DocumentRequest, 'id' | 'requestNo' | 'requestDate' | 'status'>) => DocumentRequest;
  updateDocumentStatus: (id: string, status: DocumentRequest['status'], remarks?: string) => void;

  // Transport
  transportRoutes: TransportRoute[];
  addTransportRoute: (route: Omit<TransportRoute, 'id' | 'assignedStudentsCount'>) => void;

  // Library
  libraryBooks: LibraryBook[];
  borrowRecords: BookBorrowRecord[];
  addLibraryBook: (book: Omit<LibraryBook, 'id' | 'availableCopies'>) => void;
  borrowBook: (bookId: string, studentId: string, dueDate: string) => boolean;
  returnBook: (borrowRecordId: string) => void;

  // Dashboard feeds
  recentActivities: RecentActivity[];
  upcomingEvents: UpcomingEvent[];

  // Global search trigger
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Toast / System notification feedback
  toastMessage: { text: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

// ==========================================
// INITIAL SYNTHETIC SAMPLE DATA
// Exact numbers matching reference dashboard:
// Total Students: 1,248
// Total Staff: 86
// Today's Attendance: 92% (1,150 / 1,248 present)
// Fees Collected: ₹18,45,000 (78% of ₹23,65,000)
// ==========================================

const INITIAL_SCHOOL_INFO: SchoolInfo = {
  name: 'RIVERDALE INTERNATIONAL SCHOOL',
  motto: 'DISCIPLINE TODAY. A BRIGHTER TOMORROW.',
  code: 'RIS-2026',
  academicYear: '2025 – 2026',
  currency: 'INR',
  currencySymbol: '₹',
  address: 'Heritage Valley Campus, Sector 4, Riverdale',
  phone: '+91 (080) 4920-8800',
  email: 'info@riverdale.edu',
  principalName: 'Dr. Elizabeth Sterling',
};

const INITIAL_STUDENTS: Student[] = [
  {
    id: 'STU-1001',
    admissionNo: 'RIS-2024-001',
    name: 'Aarav Sharma',
    gender: 'Male',
    dob: '2012-05-14',
    classGrade: 'Class 6',
    section: 'A',
    academicYear: '2025 – 2026',
    guardianName: 'Rajesh Sharma',
    guardianRelation: 'Father',
    guardianPhone: '+91 98765 43210',
    guardianEmail: 'rajesh.sharma@example.com',
    address: '42 Orchid Gardens, Riverdale',
    admissionDate: '2024-04-10',
    status: 'Active',
    feesTotal: 85000,
    feesPaid: 85000,
    attendanceRate: 96,
  },
  {
    id: 'STU-1002',
    admissionNo: 'RIS-2023-084',
    name: 'Priya Mehta',
    gender: 'Female',
    dob: '2010-08-22',
    classGrade: 'Class 8',
    section: 'B',
    academicYear: '2025 – 2026',
    guardianName: 'Anil Mehta',
    guardianRelation: 'Father',
    guardianPhone: '+91 98450 11223',
    guardianEmail: 'anil.mehta@example.com',
    address: '15 Maple Avenue, Riverdale',
    admissionDate: '2023-06-12',
    status: 'Active',
    feesTotal: 92000,
    feesPaid: 92000,
    attendanceRate: 94,
  },
  {
    id: 'STU-1003',
    admissionNo: 'RIS-2022-120',
    name: 'Rohan Gupta',
    gender: 'Male',
    dob: '2008-11-05',
    classGrade: 'Class 10',
    section: 'A',
    academicYear: '2025 – 2026',
    guardianName: 'Sunita Gupta',
    guardianRelation: 'Mother',
    guardianPhone: '+91 98111 22334',
    guardianEmail: 'sunita.gupta@example.com',
    address: '77 Cedar Crest, Riverdale',
    admissionDate: '2022-04-05',
    status: 'Active',
    feesTotal: 105000,
    feesPaid: 75000,
    attendanceRate: 91,
  },
  {
    id: 'STU-1004',
    admissionNo: 'RIS-2025-012',
    name: 'Ananya Verma',
    gender: 'Female',
    dob: '2011-03-18',
    classGrade: 'Class 7',
    section: 'A',
    academicYear: '2025 – 2026',
    guardianName: 'Vikram Verma',
    guardianRelation: 'Father',
    guardianPhone: '+91 97234 56789',
    guardianEmail: 'vikram.verma@example.com',
    address: '102 Greenwoods Villa, Riverdale',
    admissionDate: '2025-04-02',
    status: 'Active',
    feesTotal: 88000,
    feesPaid: 50000,
    attendanceRate: 93,
  },
  {
    id: 'STU-1005',
    admissionNo: 'RIS-2021-045',
    name: 'Kabir Das',
    gender: 'Male',
    dob: '2007-09-30',
    classGrade: 'Class 11',
    section: 'Science',
    academicYear: '2025 – 2026',
    guardianName: 'Manoj Das',
    guardianRelation: 'Father',
    guardianPhone: '+91 99001 88776',
    guardianEmail: 'manoj.das@example.com',
    address: '8 Riverside Boulevard, Riverdale',
    admissionDate: '2021-06-15',
    status: 'Active',
    feesTotal: 120000,
    feesPaid: 120000,
    attendanceRate: 88,
  },
  {
    id: 'STU-1006',
    admissionNo: 'RIS-2023-149',
    name: 'Zara Khan',
    gender: 'Female',
    dob: '2009-12-14',
    classGrade: 'Class 9',
    section: 'A',
    academicYear: '2025 – 2026',
    guardianName: 'Tariq Khan',
    guardianRelation: 'Father',
    guardianPhone: '+91 96543 21098',
    guardianEmail: 'tariq.khan@example.com',
    address: '29 Rosewood Enclave, Riverdale',
    admissionDate: '2023-04-18',
    status: 'Active',
    feesTotal: 96000,
    feesPaid: 66000,
    attendanceRate: 95,
  },
];

const INITIAL_ADMISSIONS: AdmissionApplication[] = [
  {
    id: 'APP-2026-001',
    applicantName: 'Devansh Kulkarni',
    gender: 'Male',
    dob: '2013-02-19',
    appliedClass: 'Class 6',
    guardianName: 'Prashant Kulkarni',
    guardianPhone: '+91 98220 44556',
    guardianEmail: 'prashant.k@example.com',
    applicationDate: '2026-10-10',
    status: 'Approved',
    notes: 'Entrance test cleared with 92% score. Recommended for Section A.',
  },
  {
    id: 'APP-2026-002',
    applicantName: 'Meera Iyer',
    gender: 'Female',
    dob: '2011-07-08',
    appliedClass: 'Class 8',
    guardianName: 'Suresh Iyer',
    guardianPhone: '+91 98451 99001',
    guardianEmail: 'suresh.iyer@example.com',
    applicationDate: '2026-10-11',
    status: 'Under Review',
    notes: 'Transfer from Delhi Public School. Previous report cards attached.',
  },
  {
    id: 'APP-2026-003',
    applicantName: 'Tanya Fernandez',
    gender: 'Female',
    dob: '2014-11-25',
    appliedClass: 'Class 5',
    guardianName: 'David Fernandez',
    guardianPhone: '+91 97333 12456',
    guardianEmail: 'david.f@example.com',
    applicationDate: '2026-10-12',
    status: 'New',
    notes: 'Application form submitted online.',
  },
  {
    id: 'APP-2026-004',
    applicantName: 'Aditya Nair',
    gender: 'Male',
    dob: '2010-09-14',
    appliedClass: 'Class 9',
    guardianName: 'Ramesh Nair',
    guardianPhone: '+91 98888 77665',
    guardianEmail: 'ramesh.nair@example.com',
    applicationDate: '2026-10-08',
    status: 'Approved',
    notes: 'Sports quota applicant (State Badminton medalist).',
  },
];

const INITIAL_FEES: FeeTransaction[] = [
  {
    id: 'FEE-901',
    receiptNo: 'REC-2026-0901',
    studentId: 'STU-1002',
    studentName: 'Priya Mehta',
    classGrade: 'Class 8',
    amount: 12000,
    feeType: 'Tuition Fee',
    paymentDate: '2026-10-13',
    paymentMethod: 'Online / UPI',
    status: 'Paid',
    remarks: 'Term 2 second installment',
  },
  {
    id: 'FEE-902',
    receiptNo: 'REC-2026-0902',
    studentId: 'STU-1001',
    studentName: 'Aarav Sharma',
    classGrade: 'Class 6',
    amount: 25000,
    feeType: 'Tuition Fee',
    paymentDate: '2026-10-12',
    paymentMethod: 'Bank Transfer',
    status: 'Paid',
    remarks: 'Full term fee clearance',
  },
  {
    id: 'FEE-903',
    receiptNo: 'REC-2026-0903',
    studentId: 'STU-1005',
    studentName: 'Kabir Das',
    classGrade: 'Class 11',
    amount: 18000,
    feeType: 'Transport Fee',
    paymentDate: '2026-10-10',
    paymentMethod: 'Cheque',
    status: 'Paid',
    remarks: 'Route 3 annual bus fee',
  },
];

const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'STF-101',
    employeeId: 'EMP-0101',
    name: 'Dr. Elizabeth Sterling',
    gender: 'Female',
    designation: 'Principal',
    department: 'Administration',
    email: 'principal@riverdale.edu',
    phone: '+91 98000 11100',
    joiningDate: '2018-06-01',
    status: 'Active',
    qualification: 'Ph.D. Educational Leadership, M.Sc. Physics',
  },
  {
    id: 'STF-102',
    employeeId: 'EMP-0102',
    name: 'Prof. Anand Joshi',
    gender: 'Male',
    designation: 'Senior Faculty - Mathematics',
    department: 'Academics',
    email: 'anand.joshi@riverdale.edu',
    phone: '+91 98450 22334',
    joiningDate: '2019-07-15',
    status: 'Active',
    qualification: 'M.Sc. Mathematics, B.Ed.',
  },
  {
    id: 'STF-103',
    employeeId: 'EMP-0103',
    name: 'Sunita Rao',
    gender: 'Female',
    designation: 'Head of English',
    department: 'Academics',
    email: 'sunita.rao@riverdale.edu',
    phone: '+91 98112 33445',
    joiningDate: '2020-04-01',
    status: 'Active',
    qualification: 'M.A. English Literature, B.Ed.',
  },
  {
    id: 'STF-104',
    employeeId: 'EMP-0104',
    name: 'Vikramaditya Bose',
    gender: 'Male',
    designation: 'Bursar & Finance Officer',
    department: 'Accounts',
    email: 'finance@riverdale.edu',
    phone: '+91 99002 44556',
    joiningDate: '2019-01-10',
    status: 'Active',
    qualification: 'CPA, M.Com.',
  },
  {
    id: 'STF-105',
    employeeId: 'EMP-0105',
    name: 'Maria Fernandez',
    gender: 'Female',
    designation: 'Senior Science Teacher',
    department: 'Academics',
    email: 'maria.f@riverdale.edu',
    phone: '+91 97400 55667',
    joiningDate: '2021-08-20',
    status: 'On Leave',
    qualification: 'M.Sc. Chemistry',
  },
];

const INITIAL_LEAVES: StaffLeaveRequest[] = [
  {
    id: 'LV-301',
    staffId: 'STF-105',
    staffName: 'Maria Fernandez',
    leaveType: 'Casual Leave',
    startDate: '2026-10-13',
    endDate: '2026-10-14',
    days: 2,
    reason: 'Family emergency',
    status: 'Approved',
    appliedDate: '2026-10-12',
  },
];

const INITIAL_LOAD_MS = Date.now();

const INITIAL_ACTIVITIES: RecentActivity[] = [
  {
    id: 'ACT-1',
    type: 'admission',
    title: 'New student admission',
    description: 'Aarav Sharma (Class 6)',
    timestamp: new Date(INITIAL_LOAD_MS - 2 * 3600_000).toISOString(),
    color: 'emerald',
  },
  {
    id: 'ACT-2',
    type: 'fee',
    title: 'Fee payment received',
    description: '₹12,000 from Priya Mehta (Class 8)',
    timestamp: new Date(INITIAL_LOAD_MS - 3 * 3600_000).toISOString(),
    color: 'purple',
  },
  {
    id: 'ACT-3',
    type: 'attendance',
    title: 'Attendance marked',
    description: 'Class 10 - 42/45 present',
    timestamp: new Date(INITIAL_LOAD_MS - 4 * 3600_000).toISOString(),
    color: 'blue',
  },
  {
    id: 'ACT-4',
    type: 'announcement',
    title: 'New notice published',
    description: 'Parent-Teacher Meeting on 20 Oct',
    timestamp: new Date(INITIAL_LOAD_MS - 5 * 3600_000).toISOString(),
    color: 'rose',
  },
];

const INITIAL_EVENTS: UpcomingEvent[] = [
  {
    id: 'EV-1',
    day: '15',
    month: 'OCT',
    title: 'Unit Test – Class 6 to 8',
    time: '9:00 AM – 12:00 PM',
    color: 'blue',
  },
  {
    id: 'EV-2',
    day: '18',
    month: 'OCT',
    title: 'Parent-Teacher Meeting',
    time: '9:00 AM – 1:00 PM',
    color: 'emerald',
  },
  {
    id: 'EV-3',
    day: '20',
    month: 'OCT',
    title: 'School Annual Day (Rehearsal)',
    time: '10:00 AM – 4:00 PM',
    color: 'amber',
  },
  {
    id: 'EV-4',
    day: '25',
    month: 'OCT',
    title: 'Half Yearly Exam Starts',
    time: '9:00 AM',
    color: 'rose',
  },
];

const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ANN-1',
    title: 'School Holiday',
    content: 'School will remain closed on 18th October 2026 on account of regional holiday.',
    audience: 'All School',
    priority: 'Important',
    publishedAt: new Date(INITIAL_LOAD_MS - 2 * 3600_000).toISOString(),
    author: 'Principal Office',
    status: 'Published',
    category: 'Holiday',
  },
  {
    id: 'ANN-2',
    title: 'Exam Timetable',
    content: 'Half yearly exam timetable is now available on student and parent dashboards.',
    audience: 'High School',
    priority: 'Normal',
    publishedAt: new Date(INITIAL_LOAD_MS - 5 * 3600_000).toISOString(),
    author: 'Academic Council',
    status: 'Published',
    category: 'Academic',
  },
  {
    id: 'ANN-3',
    title: 'Parent-Teacher Meeting',
    content: 'PTM scheduled on 20th October 2026. Slots allocated per roll number.',
    audience: 'Parents Only',
    priority: 'Important',
    publishedAt: new Date(INITIAL_LOAD_MS - 24 * 3600_000).toISOString(),
    author: 'Dean of Students',
    status: 'Published',
    category: 'Meeting',
  },
];

const INITIAL_DOCUMENTS: DocumentRequest[] = [
  {
    id: 'DOC-101',
    requestNo: 'REQ-2026-0042',
    studentId: 'STU-1003',
    studentName: 'Rohan Gupta',
    classGrade: 'Class 10-A',
    documentType: 'Bonafide Certificate',
    requestDate: '2026-10-12',
    reason: 'Passport renewal application at regional passport office',
    status: 'Approved',
    remarks: 'Approved by Vice Principal',
  },
  {
    id: 'DOC-102',
    requestNo: 'REQ-2026-0043',
    studentId: 'STU-1006',
    studentName: 'Zara Khan',
    classGrade: 'Class 9-A',
    documentType: 'Study Certificate',
    requestDate: '2026-10-11',
    reason: 'Visa verification for academic exchange program',
    status: 'Pending',
  },
];

const INITIAL_TRANSPORT: TransportRoute[] = [
  {
    id: 'TR-1',
    routeNumber: 'Route 1',
    routeName: 'Greenwood & Orchid Gardens',
    vehicleNumber: 'KA-04-E-1822',
    driverName: 'Sukhdev Singh',
    driverPhone: '+91 98450 77123',
    capacity: 45,
    assignedStudentsCount: 38,
    stops: ['Orchid Gardens Gate 1', 'Rosewood Enclave', 'Valley Crossing', 'School Gate'],
  },
  {
    id: 'TR-2',
    routeNumber: 'Route 2',
    routeName: 'Maple Avenue & Cedar Crest',
    vehicleNumber: 'KA-04-E-1823',
    driverName: 'Mohan Ram',
    driverPhone: '+91 98450 88234',
    capacity: 45,
    assignedStudentsCount: 42,
    stops: ['Maple Circle', 'Cedar Crest Park', 'Riverside Blvd', 'School Gate'],
  },
];

const INITIAL_LIBRARY_BOOKS: LibraryBook[] = [
  {
    id: 'BK-1',
    accessionNo: 'LIB-4012',
    title: 'A Brief History of Time',
    author: 'Stephen Hawking',
    isbn: '978-0553380163',
    category: 'Science / Physics',
    totalCopies: 6,
    availableCopies: 4,
  },
  {
    id: 'BK-2',
    accessionNo: 'LIB-4013',
    title: 'To Kill a Mockingbird',
    author: 'Harper Lee',
    isbn: '978-0060935467',
    category: 'Literature / Fiction',
    totalCopies: 10,
    availableCopies: 7,
  },
  {
    id: 'BK-3',
    accessionNo: 'LIB-4014',
    title: 'Concepts of Physics (Vol 1)',
    author: 'H.C. Verma',
    isbn: '978-8177091878',
    category: 'Academics / Reference',
    totalCopies: 15,
    availableCopies: 11,
  },
];

const INITIAL_BORROWS: BookBorrowRecord[] = [
  {
    id: 'BR-201',
    bookId: 'BK-1',
    bookTitle: 'A Brief History of Time',
    studentId: 'STU-1001',
    studentName: 'Aarav Sharma',
    classGrade: 'Class 6-A',
    borrowDate: '2026-10-05',
    dueDate: '2026-10-19',
    status: 'Borrowed',
  },
];

const INITIAL_EXAMS: Exam[] = [
  {
    id: 'EX-1',
    title: 'Unit Test 2 (2025-26)',
    academicYear: '2025 – 2026',
    classGrade: 'Class 10',
    term: 'Unit Test',
    startDate: '2026-10-15',
    endDate: '2026-10-22',
    status: 'Published',
    subjects: [
      { name: 'Mathematics', maxMarks: 50, passingMarks: 18 },
      { name: 'Science', maxMarks: 50, passingMarks: 18 },
      { name: 'English', maxMarks: 50, passingMarks: 18 },
      { name: 'Social Studies', maxMarks: 50, passingMarks: 18 },
    ],
  },
];

// ==========================================
// PROVIDER IMPLEMENTATION
// ==========================================

export const SchoolDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schoolInfo, setSchoolInfo] = useState<SchoolInfo>(INITIAL_SCHOOL_INFO);
  const [academicYears] = useState<string[]>(['2025 – 2026', '2024 – 2025', '2026 – 2027']);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>('2025 – 2026');

  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [admissions, setAdmissions] = useState<AdmissionApplication[]>(INITIAL_ADMISSIONS);
  const [attendanceBatches, setAttendanceBatches] = useState<AttendanceBatch[]>([]);
  const [registerScanBatches, setRegisterScanBatches] = useState<RegisterScanBatch[]>([]);
  const [feeTransactions, setFeeTransactions] = useState<FeeTransaction[]>(INITIAL_FEES);
  const [staffList, setStaffList] = useState<StaffMember[]>(INITIAL_STAFF);
  const [leaveRequests, setLeaveRequests] = useState<StaffLeaveRequest[]>(INITIAL_LEAVES);
  const [exams, setExams] = useState<Exam[]>(INITIAL_EXAMS);
  const [examMarks, setExamMarks] = useState<StudentExamMark[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [documentRequests, setDocumentRequests] = useState<DocumentRequest[]>(INITIAL_DOCUMENTS);
  const [transportRoutes, setTransportRoutes] = useState<TransportRoute[]>(INITIAL_TRANSPORT);
  const [libraryBooks, setLibraryBooks] = useState<LibraryBook[]>(INITIAL_LIBRARY_BOOKS);
  const [borrowRecords, setBorrowRecords] = useState<BookBorrowRecord[]>(INITIAL_BORROWS);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(INITIAL_ACTIVITIES);
  const [upcomingEvents] = useState<UpcomingEvent[]>(INITIAL_EVENTS);

  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const updateSchoolInfo = (info: Partial<SchoolInfo>) => {
    setSchoolInfo((prev) => ({ ...prev, ...info }));
    showToast('School configuration updated successfully.');
  };

  // Add Student
  const addStudent = (studentData: Omit<Student, 'id' | 'admissionNo' | 'feesPaid' | 'attendanceRate'>): Student => {
    const nextNum = students.length + 1007;
    const admissionNo = `RIS-${getCurrentYearIST()}-${String(students.length + 1).padStart(3, '0')}`;
    const newStudent: Student = {
      ...studentData,
      id: `STU-${nextNum}`,
      admissionNo,
      feesPaid: 0,
      attendanceRate: 100,
    };

    setStudents((prev) => [newStudent, ...prev]);

    // Push to activity log
    const newActivity: RecentActivity = {
      id: `ACT-${Date.now()}`,
      type: 'admission',
      title: 'New student enrolled',
      description: `${newStudent.name} (${newStudent.classGrade}-${newStudent.section})`,
      timestamp: new Date().toISOString(),
      color: 'emerald',
    };
    setRecentActivities((prev) => [newActivity, ...prev.slice(0, 9)]);

    showToast(`Student ${newStudent.name} admitted successfully with ID ${newStudent.admissionNo}`);
    return newStudent;
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    const existing = students.find((s) => s.id === id);
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    if (existing) {
      const updatedName = updates.name || existing.name;
      const updatedGrade = updates.classGrade || existing.classGrade;
      const newActivity: RecentActivity = {
        id: `ACT-${Date.now()}`,
        type: 'admission',
        title: 'Student record updated',
        description: `${updatedName} (${updatedGrade})`,
        timestamp: new Date().toISOString(),
        color: 'emerald',
      };
      setRecentActivities((prev) => [newActivity, ...prev.slice(0, 9)]);
    }
    showToast('Student record updated.');
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    showToast('Student removed from directory.');
  };

  // Admissions
  const addAdmission = (appData: Omit<AdmissionApplication, 'id' | 'applicationDate' | 'status'>): AdmissionApplication => {
    const newApp: AdmissionApplication = {
      ...appData,
      id: `APP-${getCurrentYearIST()}-${String(admissions.length + 1).padStart(3, '0')}`,
      applicationDate: getTodayDateIST(),
      status: 'New',
    };
    setAdmissions((prev) => [newApp, ...prev]);

    const newActivity: RecentActivity = {
      id: `ACT-${Date.now()}`,
      type: 'admission',
      title: 'Admission application received',
      description: `${newApp.applicantName} (${newApp.appliedClass})`,
      timestamp: new Date().toISOString(),
      color: 'emerald',
    };
    setRecentActivities((prev) => [newActivity, ...prev.slice(0, 9)]);

    showToast(`Application received for ${newApp.applicantName}`);
    return newApp;
  };

  const updateAdmissionStatus = (id: string, status: AdmissionApplication['status']) => {
    const app = admissions.find((a) => a.id === id);
    setAdmissions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );
    if (app && status !== 'Enrolled') {
      const newActivity: RecentActivity = {
        id: `ACT-${Date.now()}`,
        type: 'admission',
        title: `Application ${status.toLowerCase()}`,
        description: `${app.applicantName} (${app.appliedClass})`,
        timestamp: new Date().toISOString(),
        color: 'emerald',
      };
      setRecentActivities((prev) => [newActivity, ...prev.slice(0, 9)]);
    }
    showToast(`Application status updated to ${status}`);
  };

  // Convert Approved Admission to Enrolled Student without duplicates
  const convertAdmissionToStudent = (admissionId: string): Student | null => {
    const app = admissions.find((a) => a.id === admissionId);
    if (!app) return null;

    // Check if already enrolled
    if (app.status === 'Enrolled') {
      showToast('Applicant is already enrolled as a student.', 'info');
      return null;
    }

    // Create student
    const newStudent = addStudent({
      name: app.applicantName,
      gender: app.gender,
      dob: app.dob,
      classGrade: app.appliedClass,
      section: 'A',
      academicYear: schoolInfo.academicYear,
      guardianName: app.guardianName,
      guardianRelation: 'Guardian',
      guardianPhone: app.guardianPhone,
      guardianEmail: app.guardianEmail,
      address: 'Campus Residential Zone, Riverdale',
      admissionDate: getTodayDateIST(),
      status: 'Active',
      feesTotal: 85000,
    });

    // Mark admission as Enrolled
    updateAdmissionStatus(admissionId, 'Enrolled');
    showToast(`Converted ${app.applicantName} to enrolled student ${newStudent.admissionNo}!`);
    return newStudent;
  };

  // Attendance
  const saveAttendanceBatch = (
    date: string,
    classGrade: string,
    section: string,
    records: AttendanceRecord[],
    source?: Pick<AttendanceBatch, 'source' | 'sourceBatchId'>
  ) => {
    const nowIso = new Date().toISOString();
    const newBatch: AttendanceBatch = {
      id: `ATT-${Date.now()}`,
      date,
      classGrade,
      section,
      takenBy: 'Administrator',
      takenAt: `${getCurrentTimeIST()} IST`,
      createdAt: nowIso,
      records,
      ...source,
    };

    // Filter out previous batch for same date + class + section to avoid duplicates
    setAttendanceBatches((prev) => [
      newBatch,
      ...prev.filter(
        (b) => !(b.date === date && b.classGrade === classGrade && b.section === section)
      ),
    ]);

    const presentCount = records.filter((r) => r.status === 'Present').length;

    // Add activity
    const newActivity: RecentActivity = {
      id: `ACT-${Date.now()}`,
      type: 'attendance',
      title: 'Attendance marked',
      description: `${classGrade}-${section} - ${presentCount}/${records.length} present`,
      timestamp: nowIso,
      color: 'blue',
    };
    setRecentActivities((prev) => [newActivity, ...prev.slice(0, 9)]);

    showToast(`Attendance recorded for ${classGrade} Section ${section} (${presentCount}/${records.length} present).`);
  };

  const getAttendanceForDateAndClass = (date: string, classGrade: string, section: string) => {
    const batch = attendanceBatches.find(
      (b) => b.date === date && b.classGrade === classGrade && b.section === section
    );
    if (batch) return batch.records;

    // Default mock records from students list
    const classStudents = students.filter(
      (s) => s.classGrade === classGrade && s.section === section
    );
    return classStudents.map((s) => ({
      studentId: s.id,
      studentName: s.name,
      admissionNo: s.admissionNo,
      status: 'Present' as AttendanceStatus,
    }));
  };

  const upsertRegisterScanBatch = (batch: RegisterScanBatch) => {
    setRegisterScanBatches((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === batch.id);
      if (existingIndex === -1) return [batch, ...prev];
      return prev.map((item) => (item.id === batch.id ? batch : item));
    });
  };

  // Fees
  const recordFeePayment = (
    paymentData: Omit<FeeTransaction, 'id' | 'receiptNo' | 'paymentDate' | 'status'>
  ): FeeTransaction => {
    const receiptNo = `REC-${getCurrentYearIST()}-${String(feeTransactions.length + 904).padStart(4, '0')}`;
    const newPayment: FeeTransaction = {
      ...paymentData,
      id: `FEE-${Date.now()}`,
      receiptNo,
      paymentDate: getTodayDateIST(),
      status: 'Paid',
    };

    setFeeTransactions((prev) => [newPayment, ...prev]);

    // Update student's fee paid
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === paymentData.studentId) {
          return { ...s, feesPaid: s.feesPaid + paymentData.amount };
        }
        return s;
      })
    );

    // Add activity
    const newActivity: RecentActivity = {
      id: `ACT-${Date.now()}`,
      type: 'fee',
      title: 'Fee payment received',
      description: `${schoolInfo.currencySymbol}${paymentData.amount.toLocaleString()} from ${paymentData.studentName} (${paymentData.classGrade})`,
      timestamp: new Date().toISOString(),
      color: 'purple',
    };
    setRecentActivities((prev) => [newActivity, ...prev.slice(0, 9)]);

    showToast(`Payment of ${schoolInfo.currencySymbol}${paymentData.amount.toLocaleString()} recorded. Receipt: ${receiptNo}`);
    return newPayment;
  };

  // Staff
  const addStaff = (memberData: Omit<StaffMember, 'id' | 'employeeId'>): StaffMember => {
    const nextNum = staffList.length + 106;
    const newStaff: StaffMember = {
      ...memberData,
      id: `STF-${nextNum}`,
      employeeId: `EMP-${String(nextNum).padStart(4, '0')}`,
    };
    setStaffList((prev) => [newStaff, ...prev]);
    showToast(`Staff member ${newStaff.name} added.`);
    return newStaff;
  };

  const updateStaff = (id: string, updates: Partial<StaffMember>) => {
    setStaffList((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
    showToast('Staff profile updated.');
  };

  const submitLeaveRequest = (req: Omit<StaffLeaveRequest, 'id' | 'appliedDate' | 'status'>) => {
    const newLeave: StaffLeaveRequest = {
      ...req,
      id: `LV-${Date.now()}`,
      appliedDate: getTodayDateIST(),
      status: 'Pending',
    };
    setLeaveRequests((prev) => [newLeave, ...prev]);
    showToast('Leave application submitted for review.');
  };

  const updateLeaveStatus = (id: string, status: StaffLeaveRequest['status']) => {
    setLeaveRequests((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status } : l))
    );
    showToast(`Leave request ${status}.`);
  };

  // Exams
  const addExam = (examData: Omit<Exam, 'id'>): Exam => {
    const newExam: Exam = {
      ...examData,
      id: `EX-${Date.now()}`,
    };
    setExams((prev) => [newExam, ...prev]);

    const newActivity: RecentActivity = {
      id: `ACT-${Date.now()}`,
      type: 'exam',
      title: 'Examination scheduled',
      description: `${newExam.title} (${newExam.classGrade})`,
      timestamp: new Date().toISOString(),
      color: 'amber',
    };
    setRecentActivities((prev) => [newActivity, ...prev.slice(0, 9)]);

    showToast(`Examination schedule created: ${newExam.title}`);
    return newExam;
  };

  const updateExamStatus = (id: string, status: Exam['status']) => {
    const exam = exams.find((e) => e.id === id);
    setExams((prev) =>
      prev.map((e) => (e.id === id ? { ...e, status } : e))
    );
    if (exam) {
      const newActivity: RecentActivity = {
        id: `ACT-${Date.now()}`,
        type: 'exam',
        title: `Exam ${status.toLowerCase()}`,
        description: `${exam.title} (${exam.classGrade})`,
        timestamp: new Date().toISOString(),
        color: 'amber',
      };
      setRecentActivities((prev) => [newActivity, ...prev.slice(0, 9)]);
    }
    showToast(`Exam marked as ${status}.`);
  };

  const saveStudentMarks = (
    examId: string,
    studentId: string,
    subject: string,
    marks: number,
    maxMarks: number
  ) => {
    const percent = (marks / maxMarks) * 100;
    let grade = 'F';
    if (percent >= 90) grade = 'A+';
    else if (percent >= 80) grade = 'A';
    else if (percent >= 70) grade = 'B+';
    else if (percent >= 60) grade = 'B';
    else if (percent >= 50) grade = 'C';
    else if (percent >= 35) grade = 'D';

    const newMark: StudentExamMark = {
      examId,
      studentId,
      subject,
      marksObtained: marks,
      maxMarks,
      grade,
    };

    setExamMarks((prev) => [
      newMark,
      ...prev.filter(
        (m) => !(m.examId === examId && m.studentId === studentId && m.subject === subject)
      ),
    ]);

    const student = students.find((s) => s.id === studentId);
    const newActivity: RecentActivity = {
      id: `ACT-${Date.now()}`,
      type: 'exam',
      title: 'Exam marks updated',
      description: `${student ? student.name : studentId} - ${subject} (${marks}/${maxMarks})`,
      timestamp: new Date().toISOString(),
      color: 'amber',
    };
    setRecentActivities((prev) => [newActivity, ...prev.slice(0, 9)]);

    showToast(`Marks recorded for ${subject} (${marks}/${maxMarks} - Grade ${grade}).`);
  };

  // Announcements
  const addAnnouncement = (data: Omit<Announcement, 'id' | 'publishedAt' | 'status'>): Announcement => {
    const nowIso = new Date().toISOString();
    const newAnn: Announcement = {
      ...data,
      id: `ANN-${Date.now()}`,
      publishedAt: nowIso,
      status: 'Published',
    };
    setAnnouncements((prev) => [newAnn, ...prev]);

    // Activity
    const newActivity: RecentActivity = {
      id: `ACT-${Date.now()}`,
      type: 'announcement',
      title: 'New notice published',
      description: newAnn.title,
      timestamp: nowIso,
      color: 'rose',
    };
    setRecentActivities((prev) => [newActivity, ...prev.slice(0, 9)]);

    showToast(`Announcement "${newAnn.title}" published to ${newAnn.audience}.`);
    return newAnn;
  };

  const archiveAnnouncement = (id: string) => {
    setAnnouncements((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'Archived' } : a))
    );
    showToast('Announcement archived.');
  };

  // Documents
  const addDocumentRequest = (
    data: Omit<DocumentRequest, 'id' | 'requestNo' | 'requestDate' | 'status'>
  ): DocumentRequest => {
    const requestNo = `REQ-${getCurrentYearIST()}-${String(documentRequests.length + 44).padStart(4, '0')}`;
    const newReq: DocumentRequest = {
      ...data,
      id: `DOC-${Date.now()}`,
      requestNo,
      requestDate: getTodayDateIST(),
      status: 'Pending',
    };
    setDocumentRequests((prev) => [newReq, ...prev]);

    const newActivity: RecentActivity = {
      id: `ACT-${Date.now()}`,
      type: 'document',
      title: 'Document request created',
      description: `${newReq.documentType} for ${newReq.studentName}`,
      timestamp: new Date().toISOString(),
      color: 'blue',
    };
    setRecentActivities((prev) => [newActivity, ...prev.slice(0, 9)]);

    showToast(`Certificate request ${requestNo} generated for ${newReq.studentName}.`);
    return newReq;
  };

  const updateDocumentStatus = (id: string, status: DocumentRequest['status'], remarks?: string) => {
    const docReq = documentRequests.find((d) => d.id === id);
    setDocumentRequests((prev) =>
      prev.map((d) =>
        d.id === id
          ? {
              ...d,
              status,
              remarks: remarks || d.remarks,
              issuedDate: status === 'Issued' ? getTodayDateIST() : d.issuedDate,
            }
          : d
      )
    );
    if (docReq) {
      const newActivity: RecentActivity = {
        id: `ACT-${Date.now()}`,
        type: 'document',
        title: `Document ${status.toLowerCase()}`,
        description: `${docReq.documentType} for ${docReq.studentName}`,
        timestamp: new Date().toISOString(),
        color: 'blue',
      };
      setRecentActivities((prev) => [newActivity, ...prev.slice(0, 9)]);
    }
    showToast(`Document request status changed to ${status}.`);
  };

  // Transport
  const addTransportRoute = (routeData: Omit<TransportRoute, 'id' | 'assignedStudentsCount'>) => {
    const newRoute: TransportRoute = {
      ...routeData,
      id: `TR-${Date.now()}`,
      assignedStudentsCount: 0,
    };
    setTransportRoutes((prev) => [...prev, newRoute]);
    showToast(`Transport Route ${newRoute.routeNumber} configured.`);
  };

  // Library
  const addLibraryBook = (bookData: Omit<LibraryBook, 'id' | 'availableCopies'>) => {
    const newBook: LibraryBook = {
      ...bookData,
      id: `BK-${Date.now()}`,
      availableCopies: bookData.totalCopies,
    };
    setLibraryBooks((prev) => [...prev, newBook]);
    showToast(`Book "${newBook.title}" accessioned into library catalog.`);
  };

  const borrowBook = (bookId: string, studentId: string, dueDate: string): boolean => {
    const book = libraryBooks.find((b) => b.id === bookId);
    const student = students.find((s) => s.id === studentId);
    if (!book || !student || book.availableCopies <= 0) {
      showToast('Book is currently unavailable for borrowing.', 'error');
      return false;
    }

    const newRecord: BookBorrowRecord = {
      id: `BR-${Date.now()}`,
      bookId,
      bookTitle: book.title,
      studentId,
      studentName: student.name,
      classGrade: `${student.classGrade}-${student.section}`,
      borrowDate: getTodayDateIST(),
      dueDate,
      status: 'Borrowed',
    };

    setBorrowRecords((prev) => [newRecord, ...prev]);
    setLibraryBooks((prev) =>
      prev.map((b) => (b.id === bookId ? { ...b, availableCopies: b.availableCopies - 1 } : b))
    );
    showToast(`"${book.title}" issued to ${student.name}. Due on ${dueDate}.`);
    return true;
  };

  const returnBook = (borrowRecordId: string) => {
    const record = borrowRecords.find((r) => r.id === borrowRecordId);
    if (!record) return;

    setBorrowRecords((prev) =>
      prev.map((r) =>
        r.id === borrowRecordId
          ? { ...r, status: 'Returned', returnDate: getTodayDateIST() }
          : r
      )
    );

    setLibraryBooks((prev) =>
      prev.map((b) => (b.id === record.bookId ? { ...b, availableCopies: b.availableCopies + 1 } : b))
    );
    showToast(`"${record.bookTitle}" marked as returned.`);
  };

  return (
    <SchoolContext.Provider
      value={{
        schoolInfo,
        updateSchoolInfo,
        academicYears,
        selectedAcademicYear,
        setSelectedAcademicYear,
        students,
        addStudent,
        updateStudent,
        deleteStudent,
        admissions,
        addAdmission,
        updateAdmissionStatus,
        convertAdmissionToStudent,
        attendanceBatches,
        saveAttendanceBatch,
        getAttendanceForDateAndClass,
        registerScanBatches,
        upsertRegisterScanBatch,
        feeTransactions,
        recordFeePayment,
        staffList,
        addStaff,
        updateStaff,
        leaveRequests,
        submitLeaveRequest,
        updateLeaveStatus,
        exams,
        examMarks,
        addExam,
        updateExamStatus,
        saveStudentMarks,
        announcements,
        addAnnouncement,
        archiveAnnouncement,
        documentRequests,
        addDocumentRequest,
        updateDocumentStatus,
        transportRoutes,
        addTransportRoute,
        libraryBooks,
        borrowRecords,
        addLibraryBook,
        borrowBook,
        returnBook,
        recentActivities,
        upcomingEvents,
        searchQuery,
        setSearchQuery,
        toastMessage,
        showToast,
      }}
    >
      {children}
      {/* Global Toast Feedback Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 bg-neutral-900 text-white rounded-xl shadow-2xl border border-neutral-700 text-xs font-medium animate-in fade-in slide-in-from-bottom-3 duration-200"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              toastMessage.type === 'error'
                ? 'bg-rose-500'
                : toastMessage.type === 'info'
                ? 'bg-blue-400'
                : 'bg-emerald-400'
            }`}
          />
          <span>{toastMessage.text}</span>
        </div>
      )}
    </SchoolContext.Provider>
  );
};

export const useSchoolData = (): SchoolContextType => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchoolData must be used within a SchoolDataProvider');
  }
  return context;
};
