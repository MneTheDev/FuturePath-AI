import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/hooks/useAuthStore'
import { useCourses } from '@/hooks/useCourses'
import { useJobs } from '@/hooks/useJobs'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { ArrowRight, ShieldCheck } from 'lucide-react'

export function HomePage() {
  const { user } = useAuthStore()
  const { courses, progress } = useCourses()
  const { jobs } = useJobs()
  const navigate = useNavigate()

  const firstName = user?.full_name?.split(' ')[0] || 'Sibusiso'
  const inProgress = courses.find(c => (progress[c.id] ?? 0) > 0 && (progress[c.id] ?? 0) < 100) || courses[0]
  const courseProgress = inProgress ? (progress[inProgress.id] ?? 0) : 0
  const completedCount = courses.filter(c => (progress[c.id] ?? 0) === 100).length
  const circumference = 2 * Math.PI * 22

  return (
    <div className="p-4 animate-fade-in">
      {/* Greeting */}
      <div className="flex items-center gap-3 mb-5">
        <UserAvatar
          avatarUrl={user?.avatar_url}
          fullName={user?.full_name}
          size={48}
          onClick={() => navigate('/profile')}
        />
        <div>
          <h1 className="text-xl font-bold text-[--primary]">Welcome back, {firstName} 👋</h1>
          <p className="text-sm text-[--on-surf-v]">Your career roadmap is looking bright.</p>
        </div>
      </div>

      {/* Active course card */}
      {inProgress && (
        <div className="card mb-3">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 pr-3">
              <span className="tag tag-green mb-2 inline-block">In Progress</span>
              <h2 className="font-bold text-base">{inProgress.title}</h2>
              <p className="text-xs text-[--on-surf-v]">Professional Certification Track</p>
            </div>
            {/* Progress ring */}
            <div className="relative w-13 h-13 flex-shrink-0" style={{ width: 52, height: 52 }}>
              <svg width="52" height="52" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="26" cy="26" r="22" fill="transparent" stroke="var(--surf-high)" strokeWidth="5" />
                <circle cx="26" cy="26" r="22" fill="transparent" stroke="var(--secondary)" strokeWidth="5"
                  strokeDasharray={circumference} strokeDashoffset={circumference * (1 - courseProgress / 100)}
                  style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-[--secondary]">
                {courseProgress}%
              </div>
            </div>
          </div>
          <p className="text-xs text-[--on-surf-v] mb-1">Course Completion · {courseProgress}% complete</p>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${courseProgress}%` }} />
          </div>
          <div className="flex gap-2 mt-3">
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/learn')}>Resume Module 4</button>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/learn')}>View Syllabus</button>
          </div>
        </div>
      )}

      {/* Build CV CTA */}
      <div className="card card-primary cursor-pointer mb-3" onClick={() => navigate('/cv')}>
        <div className="text-2xl mb-1.5">✏️</div>
        <h2 className="font-bold text-lg mb-1">Build CV</h2>
        <p className="text-sm opacity-90 mb-3">Update your professional profile with our AI-powered CV builder.</p>
        <div className="flex items-center gap-1.5 font-bold text-sm">Get Started <ArrowRight size={15} /></div>
      </div>

      <div className="card cursor-pointer mb-3" onClick={() => navigate('/ai')}>
        <div className="text-2xl mb-1.5">🤖</div>
        <h2 className="font-bold text-lg mb-1">AI Career Copilot</h2>
        <p className="text-sm opacity-90 mb-3">Discover career pathways, skill gaps, opportunities, and a personalized roadmap.</p>
        <div className="flex items-center gap-1.5 font-bold text-sm">Explore now <ArrowRight size={15} /></div>
      </div>

      {/* Verification status */}
      <div className="card card-amber mb-5">
        <div className="flex items-center gap-2 mb-1">
          <ShieldCheck size={16} className="text-amber-700" />
          <span className="text-xs font-bold text-amber-800 tracking-wide uppercase">Verification Status</span>
        </div>
        <p className="text-sm text-amber-900">Your qualifications are 80% verified by FuturePath Eswatini.</p>
      </div>

      {/* Recommended jobs */}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-base font-bold text-[--primary]">Recommended Jobs in Eswatini</h2>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/jobs')}>View all ↗</button>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 mb-5">
        {jobs.slice(0, 3).map(job => (
          <div key={job.id}
            className="flex-shrink-0 w-52 bg-white border border-[--outline-v] rounded-xl p-3.5 cursor-pointer hover:border-[--primary] transition-colors"
            onClick={() => navigate('/jobs')}
          >
            <div className="flex justify-between items-start mb-2.5">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-[--surf-cont]">
                {job.company_logo && <img src={job.company_logo} alt={job.company} className="w-full h-full object-cover" />}
              </div>
              {job.id === '1' && <span className="tag tag-green text-[10px]">New</span>}
            </div>
            <div className="text-sm font-bold">{job.title}</div>
            <div className="text-xs text-[--on-surf-v] mb-2">{job.company} · {job.location.split(',')[0]}</div>
            <div className="flex gap-1 flex-wrap">
              <span className={`tag text-[10px] ${job.type === 'FULL-TIME' ? 'tag-blue' : job.type === 'INTERNSHIP' ? 'tag-amber' : 'tag-purple'}`}>
                {job.type}
              </span>
            </div>
            <button className="btn btn-outline btn-full btn-sm mt-2.5 text-[11px]">View Details</button>
          </div>
        ))}
      </div>

      {/* Career path timeline */}
      <h2 className="text-base font-bold text-[--primary] mb-3">Your Path to Senior Level</h2>
      <div className="mb-5">
        {[
          { dot: 'done', label: 'Degree Verified', sub: 'Confirmed by UNESWA Registry' },
          { dot: 'active', label: 'Current: Digital Marketing Certificate', sub: '75% complete · Expected end of month' },
          { dot: 'future', label: 'Next: Management Foundations', sub: 'Unlocks after current course' },
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-3 pb-4 relative">
            {i < 2 && <div className="absolute left-[17px] top-9 w-0.5 h-full bg-[--outline-v]" />}
            <div className={`w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm z-10
              ${item.dot === 'done' ? 'bg-[--secondary] text-white'
                : item.dot === 'active' ? 'bg-[--primary] text-white'
                : 'bg-[--surf-high] text-[--on-surf-v] border-2 border-[--outline-v]'}`}>
              {item.dot === 'done' ? '✓' : i + 1}
            </div>
            <div className="pt-1">
              <div className={`text-sm font-semibold ${item.dot === 'future' ? 'text-[--on-surf-v]' : 'text-[--on-bg]'}`}>{item.label}</div>
              <div className="text-xs text-[--on-surf-v] mt-0.5">{item.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Mock Interview CTA */}
      <button className="btn btn-primary btn-full mb-5" onClick={() => navigate('/interview')}>
        🎙️ Start Mock Interview
      </button>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {[
          { num: '2', label: 'Saved Jobs' },
          { num: '0', label: 'Applications' },
          { num: String(completedCount), label: 'Courses Done' },
          { num: '1', label: 'Certificates' },
        ].map(({ num, label }) => (
          <div key={label} className="bg-white border border-[--outline-v] rounded-xl p-3.5 text-center">
            <div className="text-3xl font-bold text-[--primary]">{num}</div>
            <div className="text-xs text-[--on-surf-v] mt-0.5">{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
