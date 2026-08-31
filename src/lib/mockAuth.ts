/**
 * Mock authentication for local development and demos
 * Uses localStorage instead of Supabase
 */

interface MockUser {
  id: string
  email: string
  full_name: string
  phone?: string
  role: 'user' | 'admin'
  is_suspended: boolean
  created_at: string
}

interface MockSession {
  user: MockUser
  access_token: string
}

const MOCK_STORAGE_KEY = 'futurepath-mock-auth'
const MOCK_USERS_KEY = 'futurepath-mock-users'

// Pre-populate some demo users for easier testing
const DEMO_USERS: MockUser[] = [
  {
    id: 'demo-user-1',
    email: 'demo@example.com',
    full_name: 'Demo User',
    phone: '+268 76123456',
    role: 'user',
    is_suspended: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'admin-user-1',
    email: 'admin@example.com',
    full_name: 'Admin User',
    phone: '+268 76654321',
    role: 'admin',
    is_suspended: false,
    created_at: new Date().toISOString(),
  },
]

export const mockAuth = {
  // Check if mock auth should be used (when Supabase fails)
  isUsingMock: () => {
    return localStorage.getItem('use-mock-auth') === 'true'
  },

  // Enable mock auth mode
  enableMock: () => {
    localStorage.setItem('use-mock-auth', 'true')
  },

  // Disable mock auth mode
  disableMock: () => {
    localStorage.removeItem('use-mock-auth')
  },

  // Get current session from localStorage
  getSession: (): MockSession | null => {
    const session = localStorage.getItem(MOCK_STORAGE_KEY)
    return session ? JSON.parse(session) : null
  },

  // Set session to localStorage
  setSession: (session: MockSession | null) => {
    if (session) {
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(session))
    } else {
      localStorage.removeItem(MOCK_STORAGE_KEY)
    }
  },

  // Get all registered users
  getUsers: (): MockUser[] => {
    const users = localStorage.getItem(MOCK_USERS_KEY)
    return users ? JSON.parse(users) : DEMO_USERS
  },

  // Save users to localStorage
  saveUsers: (users: MockUser[]) => {
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users))
  },

  // Sign up (create new user)
  signUp: (email: string, password: string, fullName: string, phone: string) => {
    const users = mockAuth.getUsers()
    if (users.some(u => u.email === email)) {
      throw new Error('Email already registered')
    }

    const newUser: MockUser = {
      id: `user-${Date.now()}`,
      email,
      full_name: fullName,
      phone,
      role: 'user',
      is_suspended: false,
      created_at: new Date().toISOString(),
    }

    users.push(newUser)
    mockAuth.saveUsers(users)

    // Auto sign in after signup
    const session: MockSession = {
      user: newUser,
      access_token: `mock-token-${Date.now()}`,
    }
    mockAuth.setSession(session)

    return { user: newUser, session }
  },

  // Sign in (find user by email)
  signIn: (email: string, password: string) => {
    const users = mockAuth.getUsers()
    const user = users.find(u => u.email === email)

    if (!user) {
      throw new Error('User not found')
    }

    if (user.is_suspended) {
      throw new Error('Account is suspended')
    }

    const session: MockSession = {
      user,
      access_token: `mock-token-${Date.now()}`,
    }
    mockAuth.setSession(session)

    return { user, session }
  },

  // Sign out
  signOut: () => {
    mockAuth.setSession(null)
  },

  // Get current user
  getCurrentUser: (): MockUser | null => {
    const session = mockAuth.getSession()
    return session?.user ?? null
  },

  // Check if a session is valid
  isSessionValid: (session: MockSession | null): boolean => {
    return session !== null && session.user !== null && !session.user.is_suspended
  },
}
