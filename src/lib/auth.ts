// MongoDB-backed authentication client. Password validation and hashing happen on the server.
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  role?: string;
}

type AuthStateCallback = (user: User | null) => void;
const listeners = new Set<AuthStateCallback>();
const AUTH_USER_STORAGE_KEY = 'mongo_expense_companion_user';
const AUTH_TOKEN_STORAGE_KEY = 'mongo_expense_companion_token';

function storageAvailable(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function getStoredUser(): User | null {
  if (!storageAvailable()) return null;
  try {
    const raw = localStorage.getItem(AUTH_USER_STORAGE_KEY);
    return raw ? JSON.parse(raw) as User : null;
  } catch { return null; }
}

let currentUser: User | null = getStoredUser();

function notifyListeners() {
  listeners.forEach((callback) => {
    try { callback(currentUser); }
    catch (error) { console.error('Auth listener error:', error); }
  });
}

function saveUser(user: User) {
  currentUser = user;
  if (storageAvailable()) localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
  notifyListeners();
}

export function getAuthToken(): string | null {
  return storageAvailable() ? localStorage.getItem(AUTH_TOKEN_STORAGE_KEY) : null;
}

export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function postAuth(endpoint: string, body: Record<string, string>): Promise<{ user: User; token: string }> {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.success || !data.user?.uid || !data.token) {
    throw new Error(data.error || 'Authentication request failed.');
  }
  if (storageAvailable()) localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, data.token);
  return { user: data.user as User, token: data.token as string };
}

export const auth = { get currentUser() { return currentUser; } };

export function onAuthStateChanged(_authObj: unknown, callback: AuthStateCallback): () => void {
  listeners.add(callback);
  callback(currentUser);
  return () => listeners.delete(callback);
}

export async function signInWithEmailAndPassword(_authObj: unknown, email: string, password: string): Promise<{ user: User }> {
  if (!email.trim() || !password) throw new Error('Email and password are required.');
  const result = await postAuth('/api/auth/login', { email: email.trim().toLowerCase(), password });
  saveUser(result.user);
  return { user: result.user };
}

export async function createUserWithEmailAndPassword(_authObj: unknown, email: string, password: string): Promise<{ user: User }> {
  if (!email.trim() || !password) throw new Error('Email and password are required.');
  if (password.length < 8) throw new Error('Password must be at least 8 characters.');
  const cleanEmail = email.trim().toLowerCase();
  const result = await postAuth('/api/auth/register', {
    email: cleanEmail,
    password,
    displayName: cleanEmail.split('@')[0],
  });
  saveUser(result.user);
  return { user: result.user };
}

export async function signOut(_authObj?: unknown): Promise<void> {
  currentUser = null;
  if (storageAvailable()) {
    localStorage.removeItem(AUTH_USER_STORAGE_KEY);
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  }
  notifyListeners();
}

export async function resetPassword(_email: string, _newPassword: string): Promise<{ success: boolean; message: string }> {
  throw new Error('Password reset is temporarily unavailable until email ownership verification is configured.');
}
export async function sendPasswordResetEmail(_authObj: unknown, _email: string): Promise<void> {
  throw new Error('Password reset is not configured yet.');
}
export async function sendEmailVerification(_user: unknown): Promise<void> {
  throw new Error('Email verification is not configured yet.');
}
export function getFriendlyAuthErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Authentication failed. Please try again.';
}
