import { useState } from 'react'
import { clsx } from 'clsx'

interface UserAvatarProps {
  avatarUrl?: string | null
  fullName?: string
  size?: number          // px
  className?: string
  onClick?: () => void
}

/**
 * Shows the user's real avatar if available, otherwise renders
 * a navy circle with their initials. Falls back gracefully on
 * broken image URLs.
 */
export function UserAvatar({ avatarUrl, fullName, size = 36, className, onClick }: UserAvatarProps) {
  const [imgError, setImgError] = useState(false)

  const initials = fullName
    ? fullName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  const showImage = avatarUrl && !imgError

  return (
    <div
      onClick={onClick}
      style={{ width: size, height: size, minWidth: size }}
      className={clsx(
        'rounded-full overflow-hidden border-2 border-[--primary-c] flex items-center justify-center flex-shrink-0',
        onClick && 'cursor-pointer hover:opacity-90 transition-opacity',
        !showImage && 'bg-[--surf-cont]',
        className
      )}
    >
      {showImage ? (
        <img
          src={avatarUrl}
          alt={fullName ?? 'Profile'}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span
          className="font-bold text-[--primary] select-none"
          style={{ fontSize: size * 0.36 }}
        >
          {initials}
        </span>
      )}
    </div>
  )
}
