// Empty VITE_API_URL in production → same-origin requests (Amplify proxies /auth/* to EC2).
// Local dev falls back to the Node BFF when unset.
const API_URL =
  import.meta.env.VITE_API_URL ??
  (import.meta.env.DEV ? "http://localhost:3000" : "");

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
    ...options,
  });

  let body: { message?: string } | null = null;
  const text = await response.text();

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = { message: text };
    }
  }

  if (!response.ok) {
    throw new ApiError(
      response.status,
      body?.message ?? `Request failed (${response.status})`,
    );
  }

  return body as T;
}

export type UserResponse = {
  id: number;
  email: string;
  verified: boolean;
};

export type LoginResponse = UserResponse & {
  message: string;
};

export type MessageResponse = {
  message: string;
};

export function signup(email: string, password: string) {
  return request<UserResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function verifyOtp(email: string, otp: string) {
  return request<MessageResponse>("/auth/verify", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
}

export function resendCode(email: string) {
  return request<MessageResponse>("/auth/resend-code", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function login(email: string, password: string) {
  return request<LoginResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function logout() {
  return request<MessageResponse>("/auth/logout", {
    method: "POST",
  });
}

export function getMe() {
  return request<UserResponse>("/auth/me");
}
