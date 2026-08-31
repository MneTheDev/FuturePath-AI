import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from './useAuthStore'
import { mockAuth } from '@/lib/mockAuth'
import toast from 'react-hot-toast'

export function useProfile() {
  const { user, setUser, useMockAuth } = useAuthStore()
  const [uploading, setUploading] = useState(false)

  /**
   * Upload a profile picture.
   * - Real mode  → uploads to Supabase Storage bucket "avatars", updates profiles row
   * - Mock mode  → converts to a data-URL and persists to localStorage
   */
  const uploadAvatar = async (file: File): Promise<string | null> => {
    if (!user) return null

    // Validate file type and size (max 5 MB)
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(file.type)) {
      toast.error('Please upload a JPG, PNG, WebP, or GIF image')
      return null
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be smaller than 5 MB')
      return null
    }

    setUploading(true)

    try {
      // ── Mock mode ──────────────────────────────────────────────────────────
      if (useMockAuth) {
        const dataUrl = await fileToDataUrl(file)
        const updatedUser = { ...user, avatar_url: dataUrl }
        setUser(updatedUser as any)

        // Persist into the mock session so it survives a page refresh
        const session = mockAuth.getSession()
        if (session) {
          session.user = { ...session.user, avatar_url: dataUrl } as any
          mockAuth.setSession(session)
        }

        // Also update the user in the mock users list
        const users = mockAuth.getUsers()
        const idx = users.findIndex(u => u.id === user.id)
        if (idx !== -1) {
          ;(users[idx] as any).avatar_url = dataUrl
          mockAuth.saveUsers(users)
        }

        toast.success('Profile picture updated!')
        return dataUrl
      }

      // ── Real Supabase mode ─────────────────────────────────────────────────
      const ext = file.name.split('.').pop() ?? 'jpg'
      const path = `${user.id}/avatar.${ext}`

      // Upload to the "avatars" storage bucket (create it in Supabase if needed)
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type })

      if (uploadError) throw uploadError

      // Get the public URL
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      const publicUrl = urlData.publicUrl

      // Add cache-buster so the browser actually fetches the new image
      const avatarUrl = `${publicUrl}?t=${Date.now()}`

      // Update the profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: avatarUrl })
        .eq('id', user.id)

      if (updateError) throw updateError

      // Reflect the change in local state immediately
      setUser({ ...user, avatar_url: avatarUrl })
      toast.success('Profile picture updated!')
      return avatarUrl
    } catch (err: any) {
      console.error('Avatar upload error:', err)
      toast.error(err.message || 'Upload failed. Please try again.')
      return null
    } finally {
      setUploading(false)
    }
  }

  /** Remove profile picture (set to null) */
  const removeAvatar = async () => {
    if (!user) return
    setUploading(true)
    try {
      if (useMockAuth) {
        const updatedUser = { ...user, avatar_url: undefined }
        setUser(updatedUser as any)
        const session = mockAuth.getSession()
        if (session) {
          delete (session.user as any).avatar_url
          mockAuth.setSession(session)
        }
        toast.success('Profile picture removed')
      } else {
        await supabase.from('profiles').update({ avatar_url: null }).eq('id', user.id)
        setUser({ ...user, avatar_url: undefined })
        toast.success('Profile picture removed')
      }
    } catch (err: any) {
      toast.error(err.message || 'Could not remove picture')
    } finally {
      setUploading(false)
    }
  }

  return { uploading, uploadAvatar, removeAvatar }
}

// ── Helpers ────────────────────────────────────────────────────────────────

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
