import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { SEED_COURSES, COURSE_PROGRESS } from '@/lib/data'
import type { Course } from '@/types'

export function useCourses() {
  const [courses, setCourses] = useState<Course[]>(SEED_COURSES)
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState<Record<string, number>>(COURSE_PROGRESS)

  useEffect(() => {
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
      if (!error && data && data.length > 0) setCourses(data)
    } catch {
      // seed fallback
    } finally {
      setLoading(false)
    }
  }

  const updateProgress = async (courseId: string, pct: number, userId?: string) => {
    setProgress(prev => ({ ...prev, [courseId]: pct }))
    if (!userId) return
    await supabase.from('user_progress').upsert({
      user_id: userId,
      course_id: courseId,
      completion_percentage: pct,
      last_accessed: new Date().toISOString(),
    })
  }

  return { courses, loading, progress, updateProgress }
}

export function useCertificates(userId?: string) {
  const [certs, setCerts] = useState([
    { id: 'cert-1', certificate_uid: 'FP-2024-WEB-001', course_id: '3', issued_at: '2024-03-15', is_revoked: false, course: { title: 'Web Development Fundamentals' } }
  ])

  const issueCertificate = async (courseId: string, courseName: string) => {
    if (!userId) return
    const uid = `FP-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
    const cert = { id: uid, certificate_uid: uid, course_id: courseId, issued_at: new Date().toISOString(), is_revoked: false, course: { title: courseName } }
    setCerts(prev => [...prev, cert])
    try {
      await supabase.from('certificates').insert({
        user_id: userId,
        course_id: courseId,
        certificate_uid: uid,
        issued_at: new Date().toISOString(),
      })
    } catch {}
    return uid
  }

  return { certs, issueCertificate }
}
