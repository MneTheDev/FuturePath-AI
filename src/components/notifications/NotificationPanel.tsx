import { useState } from 'react'
import { Briefcase, FileText, Award, BookOpen, Bell } from 'lucide-react'

const INITIAL_NOTIFS = [
  { id: '1', type: 'job', title: 'New Job Alert', message: 'Network Engineer at MTN Eswatini', time: '2h ago', read: false },
  { id: '2', type: 'cv', title: 'CV Reminder', message: 'Your CV is 70% complete — finish it to stand out!', time: '1d ago', read: false },
  { id: '3', type: 'certificate', title: 'Certificate Issued', message: 'Web Development Fundamentals certificate is ready', time: '3d ago', read: true },
  { id: '4', type: 'course', title: 'New Course', message: 'Cybersecurity Essentials is now available', time: '5d ago', read: true },
]

const TypeIcon = ({ type }: { type: string }) => {
  const cls = 'w-4 h-4'
  if (type === 'job') return <Briefcase className={cls} />
  if (type === 'cv') return <FileText className={cls} />
  if (type === 'certificate') return <Award className={cls} />
  if (type === 'course') return <BookOpen className={cls} />
  return <Bell className={cls} />
}

export function NotificationPanel({ onClose }: { onClose: () => void }) {
  const [notifs, setNotifs] = useState(INITIAL_NOTIFS)
  const markAll = () => setNotifs(n => n.map(x => ({ ...x, read: true })))

  return (
    <div className="fixed inset-0 bg-black/50 z-[200] flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl w-full max-w-[480px] max-h-[85vh] overflow-y-auto p-5 animate-slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-[--outline-v] rounded-full mx-auto mb-4" />
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Notifications</h3>
          <button className="text-xs text-[--primary] font-semibold" onClick={markAll}>Mark all read</button>
        </div>
        {notifs.map(n => (
          <div key={n.id} className={`flex gap-3 py-3 border-b border-[--surf-cont] last:border-0 ${n.read ? 'opacity-55' : ''}`}>
            <div className="w-9 h-9 rounded-full bg-[--surf-cont] flex items-center justify-center text-[--primary] flex-shrink-0">
              <TypeIcon type={n.type} />
            </div>
            <div className="flex-1 min-w-0">
              <div className={`text-sm leading-snug ${n.read ? 'font-normal' : 'font-semibold'}`}>{n.message}</div>
              <div className="text-xs text-[--outline] mt-0.5">{n.time}</div>
            </div>
            {!n.read && <div className="w-2 h-2 bg-[--primary] rounded-full mt-1.5 flex-shrink-0" />}
          </div>
        ))}
        <button className="btn btn-outline btn-full mt-4" onClick={onClose}>Close</button>
      </div>
    </div>
  )
}
