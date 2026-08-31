import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { SEED_JOBS } from '@/lib/data'
import type { Job } from '@/types'
import toast from 'react-hot-toast'

export function useJobs() {
  const [jobs, setJobs] = useState<Job[]>(SEED_JOBS)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
      if (!error && data && data.length > 0) setJobs(data)
    } catch {
      // Use seed data as fallback
    } finally {
      setLoading(false)
    }
  }

  return { jobs, loading, refetch: fetchJobs }
}

export function useSavedJobs(userId?: string) {
  const [savedIds, setSavedIds] = useState<string[]>(['1', '4'])

  const toggleSave = async (jobId: string) => {
    if (!userId) return
    const isSaved = savedIds.includes(jobId)
    if (isSaved) {
      setSavedIds(prev => prev.filter(id => id !== jobId))
      await supabase.from('saved_jobs').delete().eq('user_id', userId).eq('job_id', jobId)
      toast.success('Removed from saved')
    } else {
      setSavedIds(prev => [...prev, jobId])
      await supabase.from('saved_jobs').insert({ user_id: userId, job_id: jobId })
      toast.success('Job saved! ♥')
    }
  }

  return { savedIds, toggleSave }
}

export function useApplications(userId?: string) {
  const [appliedIds, setAppliedIds] = useState<string[]>([])

  const apply = async (jobId: string) => {
    if (!userId || appliedIds.includes(jobId)) return
    setAppliedIds(prev => [...prev, jobId])
    try {
      await supabase.from('applications').insert({
        user_id: userId,
        job_id: jobId,
        status: 'pending',
      })
    } catch {
      // Still set locally even if DB fails
    }
  }

  return { appliedIds, apply }
}
