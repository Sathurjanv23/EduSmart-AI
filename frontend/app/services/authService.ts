const API_BASE = "http://localhost:8080/api/auth";

// helper function
async function parseJsonSafely(response: Response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

// LOGIN
export async function loginUser(loginData: {
  email: string;
  password: string;
}) {
  const response = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: loginData.email.toLowerCase().trim(),
      password: loginData.password.trim(),
    }),
  });

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
}

// SIGNUP
export async function signupUser(signupData: {
  name: string;
  email: string;
  password: string;
  role: string;
}) {
  const response = await fetch(`${API_BASE}/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: signupData.name.trim(),
      email: signupData.email.toLowerCase().trim(),
      password: signupData.password.trim(),
      role: signupData.role.toUpperCase().trim(),
    }),
  });

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(data.message || "Signup failed");
  }

  return data;
}

// FORGOT PASSWORD
export async function forgotPassword(email: string) {
  const response = await fetch(`${API_BASE}/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email.toLowerCase().trim(),
    }),
  });

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(data.message || "Forgot password failed");
  }

  return data;
}

// RESET PASSWORD
export async function resetPassword(resetData: {
  token: string;
  newPassword: string;
}) {
  const response = await fetch(`${API_BASE}/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token: resetData.token.trim(),
      newPassword: resetData.newPassword.trim(),
    }),
  });

  const data = await parseJsonSafely(response);

  if (!response.ok) {
    throw new Error(data.message || "Reset password failed");
  }

  return data;
}