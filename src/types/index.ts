export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  avatar_url?: string
  role: 'user' | 'admin'
  is_suspended: boolean
  created_at: string
}

export interface Job {
  id: string
  title: string
  company: string
  company_logo?: string
  location: string
  type: 'FULL-TIME' | 'INTERNSHIP' | 'REMOTE' | 'PART-TIME' | 'CONTRACT'
  category: string
  url?: string
  salary?: string
  experience_level?: string
  description: string
  requirements: string[]
  is_active: boolean
  created_at: string
}

export interface Internship {
  id: string
  title: string
  organization: string
  organization_logo?: string
  location: string
  category: string
  stipend?: string
  duration?: string
  description: string
  requirements: string[]
  is_active: boolean
  created_at: string
}

export interface Application {
  id: string
  user_id: string
  job_id?: string
  internship_id?: string
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted'
  cover_letter?: string
  created_at: string
  job?: Job
  internship?: Internship
}

export interface SavedJob {
  id: string
  user_id: string
  job_id: string
  created_at: string
  job?: Job
}

export interface Course {
  id: string
  title: string
  description: string
  category: string
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  duration_hours: number
  thumbnail_url?: string
  is_published: boolean
  created_at: string
  modules?: CourseModule[]
}

export interface CourseModule {
  id: string
  course_id: string
  title: string
  order_index: number
  video_url?: string
  content?: string
  duration_minutes?: number
}

export interface Quiz {
  id: string
  module_id: string
  title: string
  pass_percentage: number
  questions?: QuizQuestion[]
}

export interface QuizQuestion {
  id: string
  quiz_id: string
  question: string
  options: string[]
  correct_index: number
  order_index: number
}

export interface QuizAttempt {
  id: string
  user_id: string
  quiz_id: string
  score: number
  passed: boolean
  answers: number[]
  created_at: string
}

export interface Certificate {
  id: string
  user_id: string
  course_id: string
  certificate_uid: string
  issued_at: string
  is_revoked: boolean
  user?: User
  course?: Course
}

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'job' | 'internship' | 'course' | 'certificate' | 'system'
  is_read: boolean
  created_at: string
}

export interface UserProgress {
  id: string
  user_id: string
  course_id: string
  module_id?: string
  completion_percentage: number
  lessons_completed: number
  total_lessons: number
  last_accessed: string
  streak_days: number
  total_hours: number
}

export interface CVData {
  personal: {
    full_name: string
    email: string
    phone: string
    location: string
    summary: string
    linkedin?: string
    website?: string
  }
  education: {
    institution: string
    degree: string
    field?: string
    start_year: string
    end_year: string
  }[]
  experience: {
    title: string
    company: string
    location?: string
    start_date: string
    end_date: string
    is_current: boolean
    achievements: string
  }[]
  skills: string[]
  certifications: {
    name: string
    issuer: string
    year: string
  }[]
  references: {
    name: string
    title: string
    company: string
    email: string
    phone?: string
  }[]
  projects: {
    name: string
    description: string
    url?: string
    technologies: string[]
  }[]
}

export interface AdminStats {
  totalUsers: number
  totalJobs: number
  totalApplications: number
  totalCertificates: number
  activeUsers: number
  newUsersThisMonth: number
}
