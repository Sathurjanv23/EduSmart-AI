import { apiRequest } from "./apiService";

export async function getFeeStructures() {
  return apiRequest("/fee-structures", {
    method: "GET",
  });
}

export async function getDuesForStudent(studentId: string) {
  // Mocking endpoint for now as per likely backend structure
  return apiRequest(`/finance/dues/${studentId}`, {
    method: "GET",
  });
}

export async function processPayment(paymentData: any) {
  return apiRequest("/finance/pay", {
    method: "POST",
    body: JSON.stringify(paymentData),
  });
}
