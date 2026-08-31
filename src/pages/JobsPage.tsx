import { useState } from 'react'
import { Search, MapPin, ArrowLeft, Heart, ExternalLink } from 'lucide-react'
import { useJobs, useSavedJobs, useApplications } from '@/hooks/useJobs'
import { useAuthStore } from '@/hooks/useAuthStore'
import { useNavigate } from 'react-router-dom'
import type { Job } from '@/types'
import { clsx } from 'clsx'
import toast from 'react-hot-toast'

const FILTERS = ['All Roles', 'Full-time', 'Internship', 'Remote']
const CATEGORIES = ['All', 'Technology', 'Finance', 'Business', 'Engineering', 'Education', 'Healthcare', 'Marketing', 'Government']

function TypeBadge({ type }: { type: Job['type'] }) {
  const map = { 'FULL-TIME': 'tag-green', 'INTERNSHIP': 'tag-amber', 'REMOTE': 'tag-purple', 'PART-TIME': 'tag-blue', 'CONTRACT': 'tag-red' }
  return <span className={`tag ${map[type] ?? 'tag-blue'}`}>{type}</span>
}

function JobCard({ job, saved, onSave, onClick }: { job: Job; saved: boolean; onSave: () => void; onClick: () => void }) {
  return (
    <div className="job-card" onClick={onClick}
      style={{ background: 'white', border: '1px solid var(--outline-v)', borderRadius: 12, padding: 16, marginBottom: 12, cursor: 'pointer', transition: 'border-color 0.15s' }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--primary)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--outline-v)')}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex gap-3 items-center">
          <div className="w-11 h-11 rounded-xl overflow-hidden bg-[--surf-cont] flex-shrink-0">
            {job.company_logo
              ? <img src={job.company_logo} alt={job.company} className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-xl">{job.company[0]}</div>
            }
          </div>
          <div>
            <div className="font-bold text-sm">{job.title}</div>
            <div className="text-xs text-[--on-surf-v]">{job.company}</div>
          </div>
        </div>
        <TypeBadge type={job.type} />
      </div>
      <div className="flex items-center gap-1 text-xs text-[--on-surf-v] mb-3">
        <MapPin size={12} /> {job.location}
      </div>
      <button className="btn btn-outline btn-full btn-sm">View Details</button>
    </div>
  )
}

function JobDetail({ job, saved, onSave, applied, onApply, onBack }: {
  job: Job; saved: boolean; onSave: () => void; applied: boolean; onApply: () => void; onBack: () => void
}) {
  return (
    <div className="p-4 animate-fade-in">
      <button className="flex items-center gap-1.5 text-sm font-semibold text-[--primary] mb-4 border-none bg-transparent cursor-pointer font-sans" onClick={onBack}>
        <ArrowLeft size={16} /> Back to Jobs
      </button>
      <div className="flex gap-4 items-center mb-4">
        <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[--surf-cont] flex-shrink-0">
          {job.company_logo
            ? <img src={job.company_logo} alt={job.company} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-3xl">{job.company[0]}</div>
          }
        </div>
        <div>
          <h1 className="text-lg font-bold">{job.title}</h1>
          <div className="text-sm text-[--on-surf-v]">{job.company}</div>
          <div className="flex items-center gap-1 text-xs text-[--on-surf-v] mt-1"><MapPin size={11} /> {job.location}</div>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap mb-4">
        <TypeBadge type={job.type} />
        {job.salary && <span className="tag tag-blue">💰 {job.salary}</span>}
        <span className="tag tag-blue">📊 {job.category}</span>
        {job.experience_level && <span className="tag tag-blue">📈 {job.experience_level}</span>}
      </div>

      <div className="card mb-3">
        <h3 className="font-bold text-sm mb-2">About this role</h3>
        <p className="text-sm text-[--on-surf-v] leading-relaxed">{job.description}</p>
      </div>

      <div className="card mb-4">
        <h3 className="font-bold text-sm mb-3">Requirements</h3>
        {job.requirements.map((r, i) => (
          <div key={i} className="flex items-start gap-2 text-sm text-[--on-surf-v] py-1">
            <span className="text-[--secondary] font-bold mt-0.5">✓</span> {r}
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-3">
        <button
          className={clsx('btn btn-sm', saved ? 'btn-secondary' : 'btn-outline')}
          onClick={e => { e.stopPropagation(); onSave() }}
        >
          <Heart size={14} fill={saved ? 'currentColor' : 'none'} />
          {saved ? 'Saved' : 'Save'}
        </button>
        <button className="btn btn-primary flex-1" onClick={onApply} disabled={applied}>
          {applied ? '✓ Applied' : 'Apply Now'}
        </button>
      </div>

      {job.url && (
        <a href={job.url} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 text-xs text-[--primary] font-semibold mt-2">
          {job.company} official website <ExternalLink size={11} />
        </a>
      )}
    </div>
  )
}

function AppSentScreen({ job, onBack, onDash }: { job: Job; onBack: () => void; onDash: () => void }) {
  return (
    <div className="p-4 pt-10 text-center animate-fade-in">
      <div className="w-24 h-24 bg-[--sec-c] rounded-full flex items-center justify-center mx-auto mb-6 text-5xl text-[--secondary]">✓</div>
      <h1 className="text-2xl font-bold mb-2">Application Sent!</h1>
      <p className="text-sm text-[--on-surf-v] mb-6 leading-relaxed">
        Your application for <strong className="text-[--primary]">{job.title}</strong> at{' '}
        <strong className="text-[--primary]">{job.company}</strong> has been successfully submitted.
      </p>

      <div className="card text-left mb-5">
        <p className="text-xs font-bold tracking-widest text-[--on-surf-v] mb-4 uppercase">〜 What Happens Next?</p>
        {[
          { icon: '✓', cls: 'bg-[--secondary] text-white', title: 'Profile verification check', sub: 'Our system confirms your credentials match the job requirements.' },
          { icon: '👤', cls: 'bg-[--surf-high] text-[--on-surf-v] border-2 border-[--outline-v]', title: 'Employer review period', sub: `${job.company} typically reviews candidates within 3–5 business days.` },
          { icon: '✉️', cls: 'bg-[--surf-high] text-[--on-surf-v] border-2 border-[--outline-v]', title: 'Digital Notification', sub: 'You will receive an update via FuturePath dashboard and SMS to your registered number.' },
        ].map((s, i) => (
          <div key={i} className="flex items-start gap-3 pb-4 relative">
            {i < 2 && <div className="absolute left-4 top-8 w-0.5 h-full bg-[--outline-v]" />}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 z-10 ${s.cls}`}>{s.icon}</div>
            <div className="pt-0.5">
              <div className="text-sm font-semibold">{s.title}</div>
              <div className="text-xs text-[--on-surf-v] mt-0.5 leading-relaxed">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <button className="btn btn-primary btn-full mb-3" onClick={onDash}>Back to Dashboard</button>
      <button className="btn btn-outline btn-full" onClick={onBack}>View My Applications</button>
    </div>
  )
}

export function JobsPage() {
  const { jobs, loading } = useJobs()
  const { user } = useAuthStore()
  const { savedIds, toggleSave } = useSavedJobs(user?.id)
  const { appliedIds, apply } = useApplications(user?.id)
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All Roles')
  const [category, setCategory] = useState('All')
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [appSentFor, setAppSentFor] = useState<Job | null>(null)

  const filtered = jobs.filter(j => {
    const matchSearch = !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase())
    const matchType = filter === 'All Roles'
      || (filter === 'Full-time' && j.type === 'FULL-TIME')
      || (filter === 'Internship' && j.type === 'INTERNSHIP')
      || (filter === 'Remote' && j.type === 'REMOTE')
    const matchCat = category === 'All' || j.category === category
    return matchSearch && matchType && matchCat
  })

  if (appSentFor) {
    return (
      <AppSentScreen
        job={appSentFor}
        onBack={() => setAppSentFor(null)}
        onDash={() => { setAppSentFor(null); navigate('/') }}
      />
    )
  }

  if (selectedJob) {
    return (
      <JobDetail
        job={selectedJob}
        saved={savedIds.includes(selectedJob.id)}
        onSave={() => toggleSave(selectedJob.id)}
        applied={appliedIds.includes(selectedJob.id)}
        onApply={() => {
          if (appliedIds.includes(selectedJob.id)) { toast.error('Already applied'); return }
          apply(selectedJob.id)
          setAppSentFor(selectedJob)
        }}
        onBack={() => setSelectedJob(null)}
      />
    )
  }

  return (
    <div className="p-4 animate-fade-in">
      <h1 className="text-xl font-bold text-[--primary] mb-1">Career Opportunities</h1>
      <p className="text-sm text-[--on-surf-v] mb-4 leading-relaxed">
        From internships in Mbabane to corporate roles in Manzini, FuturePath connects you to Eswatini's top employers.
      </p>

      {/* Search */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[--outline]" />
        <input className="input pl-9" placeholder="Search job titles, companies, or keywords…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Type filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-3">
        {FILTERS.map(f => (
          <button key={f} className={clsx('chip', filter === f && 'active')} onClick={() => setFilter(f)}>{f}</button>
        ))}
      </div>

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-4">
        {CATEGORIES.map(c => (
          <button key={c} className={clsx('chip', category === c && 'active')} onClick={() => setCategory(c)}>{c}</button>
        ))}
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12 text-[--on-surf-v]">Loading opportunities…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-[--on-surf-v] font-semibold">No jobs match your search</p>
          <p className="text-sm text-[--on-surf-v] mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        filtered.map(job => (
          <JobCard
            key={job.id}
            job={job}
            saved={savedIds.includes(job.id)}
            onSave={() => toggleSave(job.id)}
            onClick={() => setSelectedJob(job)}
          />
        ))
      )}

      {/* Build CV CTA */}
      <div className="bg-[--primary] rounded-2xl p-6 text-center text-white mt-2">
        <div className="text-3xl mb-2">🚀</div>
        <h3 className="font-bold text-lg mb-1">Build Your CV</h3>
        <p className="text-xs opacity-90 mb-4">Create a professional resume that stands out to top employers in Eswatini with our smart builder.</p>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/cv')}>Start Building</button>
      </div>

      <button className="btn btn-outline btn-full mt-3" onClick={() => toast.success('Showing all opportunities')}>
        Show More Opportunities ↓
      </button>
    </div>
  )
}
