import { useRef, useState } from 'react'
import { Camera, Trash2, LogOut, User, Mail, Phone, MapPin, Shield, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/hooks/useAuthStore'
import { useProfile } from '@/hooks/useProfile'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

export function ProfilePage() {
  const { user, signOut } = useAuthStore()
  const { uploading, uploadAvatar, removeAvatar } = useProfile()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const [confirmSignOut, setConfirmSignOut] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    // Reset input so the same file can be re-selected after removal
    e.target.value = ''
    await uploadAvatar(file)
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  if (!user) return null

  return (
    <div className="p-4 animate-fade-in">
      <h1 className="text-xl font-bold text-[--primary] mb-1">My Profile</h1>
      <p className="text-sm text-[--on-surf-v] mb-6">Manage your account details and profile picture.</p>

      {/* ── Avatar section ─────────────────────────────── */}
      <div className="card mb-4 flex flex-col items-center py-6">
        <div className="relative mb-4">
          <UserAvatar
            avatarUrl={user.avatar_url}
            fullName={user.full_name}
            size={96}
          />

          {/* Upload button overlay */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 w-8 h-8 bg-[--primary] rounded-full flex items-center justify-center border-2 border-white shadow-md hover:bg-[--primary-c] transition-colors disabled:opacity-60"
            title="Change profile picture"
          >
            {uploading
              ? <Loader2 size={14} className="text-white animate-spin" />
              : <Camera size={14} className="text-white" />
            }
          </button>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="text-center mb-4">
          <div className="font-bold text-base text-[--on-bg]">{user.full_name}</div>
          <div className="text-sm text-[--on-surf-v]">{user.email}</div>
          <span className={`tag mt-2 inline-block ${user.role === 'admin' ? 'tag-purple' : 'tag-blue'}`}>
            {user.role === 'admin' ? '⚙️ Admin' : '👤 Member'}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 w-full max-w-xs">
          <button
            className="btn btn-primary btn-sm flex-1 gap-1.5"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            <Camera size={13} />
            {uploading ? 'Uploading…' : user.avatar_url ? 'Change Photo' : 'Add Photo'}
          </button>
          {user.avatar_url && (
            <button
              className="btn btn-outline btn-sm gap-1.5"
              onClick={removeAvatar}
              disabled={uploading}
              title="Remove profile picture"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>

        <p className="text-[10px] text-[--outline] mt-3 text-center">
          JPG, PNG, WebP or GIF · Max 5 MB
        </p>
      </div>

      {/* ── Account details ────────────────────────────── */}
      <div className="card mb-4">
        <h3 className="font-bold text-sm text-[--primary] mb-3">Account Details</h3>
        {[
          { Icon: User,   label: 'Full Name',  value: user.full_name },
          { Icon: Mail,   label: 'Email',      value: user.email },
          { Icon: Phone,  label: 'Phone',      value: user.phone ?? 'Not set' },
          { Icon: Shield, label: 'Role',       value: user.role === 'admin' ? 'Administrator' : 'Member' },
        ].map(({ Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 py-2.5 border-b border-[--surf-cont] last:border-0">
            <div className="w-8 h-8 rounded-lg bg-[--surf-low] flex items-center justify-center flex-shrink-0">
              <Icon size={15} className="text-[--primary]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-[--outline] font-medium">{label}</div>
              <div className="text-sm font-semibold text-[--on-bg] truncate">{value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Member since ───────────────────────────────── */}
      <div className="card card-green mb-5">
        <div className="flex items-center gap-2">
          <span className="text-xl">🗓️</span>
          <div>
            <div className="text-xs font-bold text-green-800">Member Since</div>
            <div className="text-sm text-green-900">
              {new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Sign out ───────────────────────────────────── */}
      {!confirmSignOut ? (
        <button
          className="btn btn-outline btn-full gap-2 text-red-600 border-red-200 hover:bg-red-50"
          onClick={() => setConfirmSignOut(true)}
        >
          <LogOut size={15} /> Sign Out
        </button>
      ) : (
        <div className="card" style={{ borderColor: '#fee2e2', background: '#fff5f5' }}>
          <p className="text-sm font-semibold text-red-700 mb-3 text-center">Are you sure you want to sign out?</p>
          <div className="flex gap-2">
            <button className="btn flex-1" style={{ background: '#dc2626', color: '#fff' }} onClick={handleSignOut}>
              Yes, Sign Out
            </button>
            <button className="btn btn-outline flex-1" onClick={() => setConfirmSignOut(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
