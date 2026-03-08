// Mock Authentication Service — Replace with Amazon Cognito SDK
// All auth calls are isolated here for easy swap to:
//   import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';

export type UserRole = "citizen" | "official";

export interface AuthUser {
  id: string;
  name: string;
  mobile: string;
  ward: string;
  role: UserRole;
  email?: string;
}

export interface SignUpPayload {
  name: string;
  mobile: string;
  ward: string;
  role: UserRole;
  password: string;
}

export interface SignInPayload {
  mobile: string;
  password: string;
  rememberMe: boolean;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
  token?: string;
}

const STORAGE_KEY = "civic_trust_auth";

// --- Mock user store (replace with Cognito User Pool) ---
const mockUsers: Map<string, { user: AuthUser; password: string }> = new Map();

// Seed a demo user
mockUsers.set("9876543210", {
  user: {
    id: "demo-citizen-001",
    name: "Demo Citizen",
    mobile: "9876543210",
    ward: "Kothrud (Ward 9)",
    role: "citizen",
  },
  password: "demo1234",
});
mockUsers.set("9876543211", {
  user: {
    id: "demo-official-001",
    name: "Ward Officer",
    mobile: "9876543211",
    ward: "Shivajinagar (Ward 15)",
    role: "official",
  },
  password: "official1234",
});

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// --- Cognito-ready auth functions ---

export async function signUp(payload: SignUpPayload): Promise<AuthResult> {
  // TODO: Replace with cognitoUserPool.signUp(payload.mobile, payload.password, attributeList, null, callback)
  await delay(600);

  if (mockUsers.has(payload.mobile)) {
    return { success: false, error: "Mobile number already registered" };
  }

  const user: AuthUser = {
    id: `usr-${Date.now()}`,
    name: payload.name,
    mobile: payload.mobile,
    ward: payload.ward,
    role: payload.role,
  };

  mockUsers.set(payload.mobile, { user, password: payload.password });
  const token = btoa(JSON.stringify({ id: user.id, ts: Date.now() }));
  persistSession(user, token);

  return { success: true, user, token };
}

export async function signIn(payload: SignInPayload): Promise<AuthResult> {
  // TODO: Replace with CognitoUser.authenticateUser(authenticationDetails, callbacks)
  await delay(500);

  const record = mockUsers.get(payload.mobile);
  if (!record || record.password !== payload.password) {
    return { success: false, error: "Invalid mobile number or password" };
  }

  const token = btoa(JSON.stringify({ id: record.user.id, ts: Date.now() }));
  if (payload.rememberMe) {
    persistSession(record.user, token);
  } else {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ user: record.user, token }));
  }

  return { success: true, user: record.user, token };
}

export async function signOut(): Promise<void> {
  // TODO: Replace with cognitoUser.signOut()
  localStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
}

export async function resetPassword(mobile: string): Promise<{ success: boolean; error?: string }> {
  // TODO: Replace with cognitoUser.forgotPassword(callbacks)
  await delay(400);
  if (!mockUsers.has(mobile)) {
    return { success: false, error: "Mobile number not found" };
  }
  return { success: true };
}

export function getPersistedSession(): { user: AuthUser; token: string } | null {
  const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function persistSession(user: AuthUser, token: string) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
}
