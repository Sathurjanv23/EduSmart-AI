import { apiRequest } from "./apiService";

export interface StudentRiskPrediction {
  student_id: string;
  derived_inputs: {
    attendance_percentage: number;
    average_marks: number;
    assignment_completion_rate: number;
    recent_grade_trend: number;
    missed_assignments: number;
  };
  prediction: {
    risk_level: "LOW" | "MEDIUM" | "HIGH";
    probabilities: Record<string, number>;
    confidence: number;
    feature_contributions: Array<{
      feature: string;
      value: number;
      contribution: number;
      direction: string;
    }>;
    model_version: string;
    disclaimer: string;
  };
}

export const predictStudentRisk = (studentId: string) => apiRequest<StudentRiskPrediction>(`/ml/students/${encodeURIComponent(studentId)}/predict`, { method: "POST" });
