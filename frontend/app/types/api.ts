export type StudentGender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";

export interface Student {
  id: string;
  userId?: string;
  name: string;
  email: string;
  parentEmail: string | null;
  studentClass: string;
  gender?: StudentGender | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentProfileInput {
  name: string;
  email: string;
  parentEmail: string | null;
  studentClass: string;
  gender: StudentGender | null;
}

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED" | "PENDING";

export interface AttendanceRecord {
  id?: string;
  studentId: string;
  studentName?: string;
  classId: string;
  attendanceDate: string;
  date?: string;
  status: AttendanceStatus;
  remark?: string;
}

export type AssessmentType = "TERM_TEST" | "MID_TERM" | "FINAL" | "CLASS_TEST" | "ASSIGNMENT" | "OTHER";
export type MarksStatus = "DRAFT" | "PUBLISHED";

export interface MarkRecord {
  id: string;
  studentId?: string;
  studentName?: string;
  parentEmail?: string;
  classId?: string;
  subject: string;
  assessmentType?: AssessmentType;
  term?: string;
  marks?: number;
  marksObtained?: number;
  totalMarks?: number;
  comments?: string;
  status?: MarksStatus;
  publishedAt?: string;
  publishedBy?: string;
  examId?: string;
  recordedBy?: string;
  recordedAt?: string;
  updatedAt?: string;
}

export interface Exam {
  id: string;
  title: string;
  description?: string;
  classId: string;
  subject: string;
  startTime: string;
  endTime: string;
  totalMarks: number;
  passingMarks: number;
  examType: string;
  status: string;
}

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  classId: string;
  subject: string;
  dueDate: string;
  maxMarks: number;
  fileUrl?: string;
  attachmentUrl?: string;
  status: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId?: string;
  submissionFileUrl?: string;
  submissionText?: string;
  submittedAt: string;
  status: string;
  marksObtained?: number;
  feedback?: string;
}

export interface FeeTransaction {
  id: string;
  studentId: string;
  feeStructureId?: string;
  amount: number;
  paidAmount: number;
  currency?: string;
  paymentMode?: string;
  transactionId?: string;
  status: string;
  receiptUrl?: string;
  paidDate?: string;
  dueDate?: string;
}

export interface FeeSummary {
  studentId: string;
  currency: string;
  totalCharged: number;
  totalPaid: number;
  outstandingBalance: number;
  pendingTransactions: number;
}

export interface Announcement {
  id: string;
  title: string;
  message?: string;
  content?: string;
  visibleTo?: string[];
  priority?: string;
  category?: string;
  attachmentUrl?: string;
  expiresAt?: string;
  createdAt?: string;
  publishedAt?: string;
}

export interface UploadResponse {
  fileUrl: string;
  fileName?: string;
}
