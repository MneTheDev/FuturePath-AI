/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

const looksLikePlaceholder = (val: string) =>
  !val || val.includes('your-project') || val.includes('anon-key') || val.includes('your-anon')

if (looksLikePlaceholder(supabaseUrl) || looksLikePlaceholder(supabaseAnonKey)) {
  // Clear, actionable warning for developers when env vars are not configured
  // This commonly causes network errors like "Failed to fetch" in the browser.
  // See .env.example for the required variables.
  // (Do not throw — allow app to boot so the console message is visible.)
  // eslint-disable-next-line no-console
  console.warn(
    'Supabase environment variables missing or using placeholders. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in a .env file (see .env.example). Authentication requests will fail with "Failed to fetch".'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

export default supabase

// ── Supabase Storage setup note ────────────────────────────────────────────
// Run this in your Supabase SQL editor once to create the avatars bucket:
//
//   INSERT INTO storage.buckets (id, name, public)
//   VALUES ('avatars', 'avatars', true)
//   ON CONFLICT DO NOTHING;
//
//   CREATE POLICY "Avatar images are publicly accessible"
//   ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
//
//   CREATE POLICY "Users can upload their own avatar"
//   ON storage.objects FOR INSERT
//   WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
//
//   CREATE POLICY "Users can update their own avatar"
//   ON storage.objects FOR UPDATE
//   USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
//
//   CREATE POLICY "Users can delete their own avatar"
//   ON storage.objects FOR DELETE
//   USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
