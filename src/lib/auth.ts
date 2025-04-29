import type { User, UserRole } from '@/types';

// --- Mock Database ---
// In a real app, passwords would be hashed and stored securely.
const mockUsers: User[] = [
  { id: 'student1', name: 'Alice Smith', email: 'alice@example.com', role: 'student' },
  { id: 'student2', name: 'Bob Johnson', email: 'bob@example.com', role: 'student' },
   { id: 'student3', name: 'Charlie Brown', email: 'charlie@example.com', role: 'student' },
  { id: 'faculty1', name: 'Dr. Carol White', email: 'carol@example.com', role: 'faculty' },
];
const mockPasswords: Record<string, string> = {
  'alice@example.com': 'password123',
  'bob@example.com': 'password123',
  'charlie@example.com': 'password123',
  'carol@example.com': 'password123',
};

const SESSION_STORAGE_KEY = 'faceattend_user';

// --- Mock Auth Functions ---

export async function login(email: string, password?: string): Promise<User | null> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const user = mockUsers.find(u => u.email === email);

  // In a real app, compare hashed passwords
  if (user && password && mockPasswords[email] === password) {
    // Simulate successful login: Store user data in session storage
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    return user;
  }

  if (user && !password) {
    // Allow login without password for demo purposes if user exists
     sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
     return user;
  }


  return null; // Login failed
}

export async function signup(name: string, email: string, password?: string, role: UserRole = 'student'): Promise<User | null> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));

  // Check if user already exists
  if (mockUsers.find(u => u.email === email)) {
    throw new Error('User with this email already exists.');
  }

  const newUser: User = {
    id: `${role}${mockUsers.filter(u => u.role === role).length + 1}`, // Simple ID generation
    name,
    email,
    role,
  };

  mockUsers.push(newUser);
  if (password) {
    mockPasswords[email] = password; // Store mock password
  }


  // Simulate successful signup and login
  sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newUser));
  return newUser;
}

export function getCurrentUser(): User | null {
  const userData = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (userData) {
    try {
      return JSON.parse(userData) as User;
    } catch (error) {
      console.error("Error parsing user data from session storage:", error);
      sessionStorage.removeItem(SESSION_STORAGE_KEY); // Clear invalid data
      return null;
    }
  }
  return null;
}

export function logout() {
  sessionStorage.removeItem(SESSION_STORAGE_KEY);
}

// Mock function to get user by ID (replace with actual DB query)
export async function getUserById(userId: string): Promise<User | undefined> {
  await new Promise(resolve => setTimeout(resolve, 100)); // Simulate delay
  return mockUsers.find(u => u.id === userId);
}

// Function to get the list of mock users (used by faculty/students page)
export async function getMockUsers(): Promise<User[]> {
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate delay
    return [...mockUsers]; // Return a copy to prevent direct modification
}
