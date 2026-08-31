import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/hooks/useAuthStore'

import { AppShell } from '@/components/layout/AppShell'
import { AuthPage } from '@/pages/AuthPage'
import { HomePage } from '@/pages/HomePage'
import { JobsPage } from '@/pages/JobsPage'
import { CVPage } from '@/pages/CVPage'
import { LearnPage } from '@/pages/LearnPage'
import { AICopilotPage } from '@/pages/AICopilotPage'
import { VerifyPage } from '@/pages/VerifyPage'
import { AdminPage } from '@/pages/AdminPage'
import { InterviewPrepPage } from '@/pages/InterviewPrepPage'
import { ProfilePage } from '@/pages/ProfilePage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, session } = useAuthStore()
  // Allow access when either a full `user` record exists or an active `session` is present.
  if (!user && !session) return <Navigate to="/auth" replace />
  return <>{children}</>
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore()
  if (!user || user.role !== 'admin') return <Navigate to="/" replace />
  return <>{children}</>
}

export default function App() {
  const { setUser, setSession } = useAuthStore()
  const [booting, setBooting] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) setUser(data)
          })
      }
      setBooting(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session)
      if (!session) setUser(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (booting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[--bg]">
        <div className="text-center">
          <div className="text-4xl mb-4">🌍</div>
          <div className="text-xl font-bold text-[--primary]">FuturePath</div>
          <div className="text-sm text-[--on-surf-v] mt-1">Loading…</div>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#213145',
            color: '#eaf1ff',
            fontFamily: 'Hanken Grotesk',
            fontSize: '13px',
            fontWeight: 500,
            borderRadius: '10px',
          },
        }}
      />
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<HomePage />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="cv" element={<CVPage />} />
          <Route path="learn" element={<LearnPage />} />
          <Route path="ai" element={<AICopilotPage />} />
          <Route path="verify" element={<VerifyPage />} />
          <Route path="interview" element={<InterviewPrepPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
