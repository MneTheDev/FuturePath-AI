import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/hooks/useAuthStore'
import { Job } from '@/types'
import { Plus, Edit2, Trash2, ArrowLeft, Users, Briefcase, GraduationCap, Award, BarChart3, MessageCircle, Globe2, ShieldCheck, Zap } from 'lucide-react'
import { SEED_JOBS, SEED_COURSES } from '@/lib/data'
import toast from 'react-hot-toast'

type Section = 'dashboard' | 'jobs' | 'courses' | 'users' | 'certificates' | 'scholarships' | 'analytics' | 'notifications'

const StatCard = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string | number; color: string }) => (
  <div className="bg-white border border-[--outline-v] rounded-xl p-4">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>{icon}</div>
    <div className="text-2xl font-bold text-[--primary]">{value}</div>
    <div className="text-xs text-[--on-surf-v] mt-0.5">{label}</div>
  </div>
)

type JobForm = {
  title: string
  company: string
  location: string
  type: Job['type']
  category: string
  salary: string
  description: string
  requirements: string
}

type JobFormKey = keyof JobForm

function JobsAdmin() {
  const [jobs, setJobs] = useState<Job[]>(SEED_JOBS)
  const [editing, setEditing] = useState<Job | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<JobForm>({ title: '', company: '', location: '', type: 'FULL-TIME', category: 'Technology', salary: '', description: '', requirements: '' })

  const set = <K extends JobFormKey>(k: K, v: JobForm[K]) => setForm(p => ({ ...p, [k]: v }))

  const save = () => {
    if (!form.title || !form.company) { toast.error('Title and company are required'); return }
    if (editing) {
      setJobs(j => j.map(x => x.id === editing.id ? { ...x, ...form, requirements: form.requirements.split('\n').filter(Boolean) } as Job : x))
      toast.success('Job updated!')
    } else {
      setJobs(j => [...j, { ...form, id: Date.now().toString(), is_active: true, created_at: new Date().toISOString(), requirements: form.requirements.split('\n').filter(Boolean) } as any])
      toast.success('Job added!')
    }
    setShowForm(false); setEditing(null); setForm({ title: '', company: '', location: '', type: 'FULL-TIME', category: 'Technology', salary: '', description: '', requirements: '' })
  }

  const del = (id: string) => { if (confirm('Delete this job?')) { setJobs(j => j.filter(x => x.id !== id)); toast.success('Job deleted') } }

  const startEdit = (job: any) => {
    setForm({ title: job.title, company: job.company, location: job.location, type: job.type, category: job.category, salary: job.salary ?? '', description: job.description, requirements: job.requirements.join('\n') })
    setEditing(job); setShowForm(true)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-base">Manage Jobs ({jobs.length})</h2>
        <button className="btn btn-primary btn-sm gap-1.5" onClick={() => { setShowForm(true); setEditing(null) }}><Plus size={14} /> Add Job</button>
      </div>

      {showForm && (
        <div className="card mb-4">
          <h3 className="font-bold text-sm mb-3">{editing ? 'Edit Job' : 'Add New Job'}</h3>
          {([['title', 'Job Title *', 'e.g. Software Developer'], ['company', 'Company *', 'e.g. MTN Eswatini'], ['location', 'Location', 'e.g. Mbabane'], ['salary', 'Salary', 'e.g. E12,000/mo']] as [JobFormKey, string, string][]).map(([k, l, p]) => (
            <div key={k} className="form-group mb-3">
              <label className="label">{l}</label>
              <input className="input" placeholder={p} value={(form as any)[k]} onChange={e => set(k, e.target.value)} />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className="label">Type</label>
              <select className="input" value={form.type} onChange={e => set('type', e.target.value as Job['type'])}>
                {['FULL-TIME', 'INTERNSHIP', 'REMOTE', 'PART-TIME', 'CONTRACT'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div><label className="label">Category</label>
              <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                {['Technology', 'Finance', 'Business', 'Engineering', 'Education', 'Healthcare', 'Marketing', 'Government'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group mb-3">
            <label className="label">Description</label>
            <textarea className="input" style={{ minHeight: 72, resize: 'vertical' }} value={form.description} onChange={e => set('description', e.target.value)} />
          </div>
          <div className="form-group mb-3">
            <label className="label">Requirements (one per line)</label>
            <textarea className="input" style={{ minHeight: 72, resize: 'vertical' }} placeholder="BSc Computer Science&#10;3+ years experience" value={form.requirements} onChange={e => set('requirements', e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary flex-1" onClick={save}>{editing ? 'Update Job' : 'Add Job'}</button>
            <button className="btn btn-outline" onClick={() => { setShowForm(false); setEditing(null) }}>Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-0">
        {jobs.map(job => (
          <div key={job.id} className="card mb-2 flex justify-between items-start">
            <div className="flex-1 min-w-0 pr-3">
              <div className="font-semibold text-sm">{job.title}</div>
              <div className="text-xs text-[--on-surf-v]">{job.company} · {job.location}</div>
              <div className="flex gap-1.5 mt-1.5">
                <span className="tag tag-blue text-[10px]">{job.type}</span>
                <span className="tag tag-green text-[10px]">{job.category}</span>
              </div>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-[--surf-low] text-[--primary] hover:bg-[--surf-cont]" onClick={() => startEdit(job)}><Edit2 size={14} /></button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100" onClick={() => del(job.id)}><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function CoursesAdmin() {
  const [courses, setCourses] = useState(SEED_COURSES)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', category: 'Business', level: 'Beginner', description: '', duration_hours: '' })

  const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const save = () => {
    if (!form.title) { toast.error('Title is required'); return }
    setCourses(c => [...c, { ...form, id: Date.now().toString(), thumbnail_url: '', is_published: true, created_at: new Date().toISOString(), duration_hours: Number(form.duration_hours) } as any])
    toast.success('Course added!'); setShowForm(false); setForm({ title: '', category: 'Business', level: 'Beginner', description: '', duration_hours: '' })
  }

  const del = (id: string) => { if (confirm('Delete this course?')) { setCourses(c => c.filter(x => x.id !== id)); toast.success('Course deleted') } }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-base">Manage Courses ({courses.length})</h2>
        <button className="btn btn-primary btn-sm gap-1.5" onClick={() => setShowForm(!showForm)}><Plus size={14} /> Add Course</button>
      </div>
      {showForm && (
        <div className="card mb-4">
          <h3 className="font-bold text-sm mb-3">Add New Course</h3>
          <div className="form-group mb-3"><label className="label">Title *</label><input className="input" value={form.title} onChange={e => set('title', e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div><label className="label">Category</label>
              <select className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                {['Technology', 'Business', 'Finance', 'Practical Skills', 'Arts & Creativity'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="label">Level</label>
              <select className="input" value={form.level} onChange={e => set('level', e.target.value)}>
                {['Beginner', 'Intermediate', 'Advanced'].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group mb-3"><label className="label">Description</label><textarea className="input" style={{ minHeight: 60, resize: 'vertical' }} value={form.description} onChange={e => set('description', e.target.value)} /></div>
          <div className="form-group mb-3"><label className="label">Duration (hours)</label><input className="input" type="number" value={form.duration_hours} onChange={e => set('duration_hours', e.target.value)} /></div>
          <div className="flex gap-2">
            <button className="btn btn-primary flex-1" onClick={save}>Add Course</button>
            <button className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}
      <div className="space-y-0">
        {courses.map(c => (
          <div key={c.id} className="card mb-2 flex justify-between items-start">
            <div className="flex-1 min-w-0 pr-3">
              <div className="font-semibold text-sm">{c.title}</div>
              <div className="text-xs text-[--on-surf-v]">{c.category} · {c.level} · {c.duration_hours}h</div>
              <span className={`tag text-[10px] mt-1.5 inline-block ${c.is_published ? 'tag-green' : 'tag-amber'}`}>{c.is_published ? 'Published' : 'Draft'}</span>
            </div>
            <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-50 text-red-500 hover:bg-red-100 flex-shrink-0" onClick={() => del(c.id)}><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
    </div>
  )
}

function UsersAdmin() {
  const [users] = useState([
    { id: '1', full_name: 'Sibusiso Dlamini', email: 'sibusiso@email.com', role: 'user', is_suspended: false, created_at: '2024-01-15' },
    { id: '2', full_name: 'Nompumelelo Nkosi', email: 'nompumelelo@email.com', role: 'user', is_suspended: false, created_at: '2024-02-03' },
    { id: '3', full_name: 'Themba Dlamini', email: 'themba@futurepath.sz', role: 'admin', is_suspended: false, created_at: '2024-01-01' },
  ])
  return (
    <div>
      <h2 className="font-bold text-base mb-4">Manage Users ({users.length})</h2>
      {users.map(u => (
        <div key={u.id} className="card mb-2 flex justify-between items-start">
          <div>
            <div className="font-semibold text-sm">{u.full_name}</div>
            <div className="text-xs text-[--on-surf-v]">{u.email}</div>
            <div className="flex gap-1.5 mt-1.5">
              <span className={`tag text-[10px] ${u.role === 'admin' ? 'tag-purple' : 'tag-blue'}`}>{u.role}</span>
              <span className="text-xs text-[--on-surf-v]">Joined {u.created_at}</span>
            </div>
          </div>
          <div className="flex gap-1.5">
            <button className="btn btn-outline btn-sm text-[11px]" onClick={() => toast.success('User suspended')}>Suspend</button>
            <button className="btn btn-sm text-[11px]" style={{ background: '#fee2e2', color: '#991b1b' }} onClick={() => toast.error('Cannot delete admin users')}>Delete</button>
          </div>
        </div>
      ))}
    </div>
  )
}

function CertsAdmin() {
  const certs = [{ id: 'c1', certificate_uid: 'FP-2024-WEB-001', user: { full_name: 'Sibusiso Dlamini' }, course: { title: 'Web Development Fundamentals' }, issued_at: '2024-03-15', is_revoked: false }]
  return (
    <div>
      <h2 className="font-bold text-base mb-4">Manage Certificates ({certs.length})</h2>
      {certs.map(cert => (
        <div key={cert.id} className="card mb-2 flex justify-between items-start">
          <div>
            <div className="font-semibold text-sm">{cert.user.full_name}</div>
            <div className="text-xs text-[--on-surf-v]">{cert.course.title}</div>
            <div className="text-xs text-[--on-surf-v]">ID: {cert.certificate_uid} · {cert.issued_at}</div>
            <span className={`tag text-[10px] mt-1.5 inline-block ${cert.is_revoked ? 'tag-red' : 'tag-green'}`}>{cert.is_revoked ? 'Revoked' : 'Valid'}</span>
          </div>
          <button className="btn btn-sm text-[11px]" style={{ background: '#fee2e2', color: '#991b1b', flexShrink: 0 }} onClick={() => toast.success('Certificate revoked')}>Revoke</button>
        </div>
      ))}
    </div>
  )
}

function ScholarshipsAdmin() {
  const [scholarships, setScholarships] = useState([
    { id: 's1', title: 'FuturePath Grant', provider: 'FuturePath Foundation', amount: 'E6,000', deadline: 'June 30' },
    { id: 's2', title: 'Digital Skills Scholarship', provider: 'Digital Eswatini', amount: 'E10,000', deadline: 'July 12' },
  ])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', provider: '', amount: '', deadline: '' })

  const save = () => {
    if (!form.title || !form.provider) { toast.error('Title and provider are required'); return }
    setScholarships(prev => [...prev, { ...form, id: Date.now().toString() }])
    toast.success('Scholarship added')
    setForm({ title: '', provider: '', amount: '', deadline: '' })
    setShowForm(false)
  }

  const remove = (id: string) => {
    setScholarships(prev => prev.filter(item => item.id !== id))
    toast.success('Scholarship removed')
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-base">Manage Scholarships ({scholarships.length})</h2>
        <button className="btn btn-primary btn-sm gap-1.5" onClick={() => setShowForm(!showForm)}><Plus size={14} /> Add</button>
      </div>
      {showForm && (
        <div className="card mb-4">
          <h3 className="font-bold text-sm mb-3">Create Scholarship</h3>
          {['title', 'provider', 'amount', 'deadline'].map((field) => (
            <div key={field} className="form-group mb-3">
              <label className="label">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <input className="input" value={(form as any)[field]} onChange={e => setForm(prev => ({ ...prev, [field]: e.target.value }))} />
            </div>
          ))}
          <div className="flex gap-2">
            <button className="btn btn-primary flex-1" onClick={save}>Save</button>
            <button className="btn btn-outline flex-1" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}
      <div className="space-y-2">
        {scholarships.map(item => (
          <div key={item.id} className="card flex justify-between items-start">
            <div>
              <div className="font-semibold text-sm">{item.title}</div>
              <div className="text-xs text-[--on-surf-v]">{item.provider} · {item.amount} · Deadline {item.deadline}</div>
            </div>
            <button className="btn btn-sm text-[11px]" style={{ background: '#fee2e2', color: '#991b1b' }} onClick={() => remove(item.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  )
}

function AnalyticsAdmin() {
  return (
    <div>
      <h2 className="font-bold text-base mb-4">AI Analytics</h2>
      <div className="grid grid-cols-2 gap-3 mb-5">
        <StatCard icon={<BarChart3 size={20} />} label="AI Conversations" value={312} color="bg-violet-50 text-violet-700" />
        <StatCard icon={<Award size={20} />} label="Most Requested Career" value="Software Engineer" color="bg-sky-50 text-sky-700" />
        <StatCard icon={<Zap size={20} />} label="Top Skill" value="Data Analysis" color="bg-emerald-50 text-emerald-700" />
        <StatCard icon={<Briefcase size={20} />} label="Popular Opportunity" value="Data Analyst Internship" color="bg-amber-50 text-amber-700" />
      </div>
      <div className="card">
        <h3 className="font-bold text-sm mb-3">Engagement Metrics</h3>
        <div className="text-sm mb-2">Average session length: 9m 24s</div>
        <div className="text-sm mb-2">Career comparison requests: 84</div>
        <div className="text-sm">What-if scenario views: 53</div>
      </div>
    </div>
  )
}

function NotificationsAdmin() {
  const [message, setMessage] = useState('')
  const [target, setTarget] = useState('All users')

  const send = () => {
    if (!message.trim()) { toast.error('Enter a message'); return }
    toast.success(`Announcement sent to ${target}`)
    setMessage('')
  }

  return (
    <div>
      <h2 className="font-bold text-base mb-4">Announcements & Alerts</h2>
      <div className="card mb-4">
        <label className="label">Target audience</label>
        <select className="input mb-3" value={target} onChange={e => setTarget(e.target.value)}>
          {['All users', 'Active users', 'Selected users'].map(opt => <option key={opt}>{opt}</option>)}
        </select>
        <label className="label">Message</label>
        <textarea className="input" style={{ minHeight: 100, resize: 'vertical' }} value={message} onChange={e => setMessage(e.target.value)} />
        <button className="btn btn-primary btn-full mt-3" onClick={send}>Send Announcement</button>
      </div>
      <div className="card">
        <h3 className="font-bold text-sm mb-3">Recent notifications</h3>
        {[
          { title: 'New course available', when: '1h ago' },
          { title: 'System maintenance scheduled', when: 'Yesterday' },
          { title: 'Scholarship deadline updated', when: '2d ago' },
        ].map((item, index) => (
          <div key={index} className="py-3 border-b border-[--surf-cont] last:border-0">
            <div className="font-semibold text-sm">{item.title}</div>
            <div className="text-xs text-[--on-surf-v]">{item.when}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AdminPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [section, setSection] = useState<Section>('dashboard')

  const sideNav = [
    { key: 'dashboard', label: 'Dashboard', icon: <span>📊</span> },
    { key: 'jobs', label: 'Jobs', icon: <Briefcase size={16} /> },
    { key: 'courses', label: 'Courses', icon: <GraduationCap size={16} /> },
    { key: 'scholarships', label: 'Scholarships', icon: <Globe2 size={16} /> },
    { key: 'users', label: 'Users', icon: <Users size={16} /> },
    { key: 'certificates', label: 'Certificates', icon: <Award size={16} /> },
    { key: 'analytics', label: 'Analytics', icon: <BarChart3 size={16} /> },
    { key: 'notifications', label: 'Notifications', icon: <MessageCircle size={16} /> },
  ]

  return (
    <div className="min-h-screen bg-[--bg]" style={{ maxWidth: 480, margin: '0 auto' }}>
      <div className="bg-[--primary] text-white px-4 py-4 flex justify-between items-center">
        <div>
          <div className="font-bold text-lg">Admin Panel</div>
          <div className="text-xs opacity-75">FuturePath Eswatini</div>
        </div>
        <button className="flex items-center gap-1.5 text-xs font-semibold bg-white/20 px-3 py-1.5 rounded-full" onClick={() => navigate('/')}>
          <ArrowLeft size={13} /> Back to App
        </button>
      </div>

      {/* Side nav as horizontal tabs */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar px-4 py-3 bg-white border-b border-[--outline-v]">
        {sideNav.map(n => (
          <button key={n.key} onClick={() => setSection(n.key as Section)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap border-none cursor-pointer font-sans transition-colors
              ${section === n.key ? 'bg-[--primary] text-white' : 'bg-[--surf-cont] text-[--on-surf-v]'}`}>
            {n.icon} {n.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {section === 'dashboard' && (
          <div className="animate-fade-in">
            <h2 className="font-bold text-base mb-4">Overview</h2>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <StatCard icon={<Users size={20} />} label="Total Users" value={127} color="bg-blue-50 text-blue-700" />
              <StatCard icon={<Briefcase size={20} />} label="Active Jobs" value={8} color="bg-green-50 text-green-700" />
              <StatCard icon={<GraduationCap size={20} />} label="Courses" value={6} color="bg-purple-50 text-purple-700" />
              <StatCard icon={<Award size={20} />} label="Certificates" value={43} color="bg-amber-50 text-amber-700" />
              <StatCard icon={<Globe2 size={20} />} label="Scholarships" value={5} color="bg-sky-50 text-sky-700" />
              <StatCard icon={<BarChart3 size={20} />} label="AI Sessions" value={312} color="bg-violet-50 text-violet-700" />
              <StatCard icon={<ShieldCheck size={20} />} label="Verifications" value={18} color="bg-emerald-50 text-emerald-700" />
              <StatCard icon={<MessageCircle size={20} />} label="Active Users" value={74} color="bg-amber-50 text-amber-700" />
            </div>
            <div className="card mb-4">
              <h3 className="font-bold text-sm mb-3">Recent Activity</h3>
              {[
                { text: 'New application: Network Engineer at MTN', time: '5 min ago', icon: '💼' },
                { text: 'Certificate issued: Web Dev Fundamentals', time: '1h ago', icon: '🏅' },
                { text: 'New user registration: Nompumelelo Nkosi', time: '2h ago', icon: '👤' },
                { text: 'Job posted: Data Analyst Intern at UNICEF', time: '1d ago', icon: '📋' },
              ].map((a, i) => (
                <div key={i} className="flex items-start gap-3 py-2.5 border-b border-[--surf-cont] last:border-0">
                  <span className="text-lg">{a.icon}</span>
                  <div className="flex-1">
                    <div className="text-sm">{a.text}</div>
                    <div className="text-xs text-[--on-surf-v]">{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="card">
                <h3 className="font-bold text-sm mb-3">Top AI Insights</h3>
                <div className="text-sm mb-2">Most requested career: Software Engineer</div>
                <div className="text-sm mb-2">Top skill: Data Analysis</div>
                <div className="text-sm mb-2">Engagement trend: +18% this week</div>
                <div className="text-sm">Most viewed opportunity: Data Analyst Internship</div>
              </div>
              <div className="card">
                <h3 className="font-bold text-sm mb-3">Report Actions</h3>
                <button className="btn btn-primary btn-sm btn-full mb-2">Export CSV</button>
                <button className="btn btn-outline btn-sm btn-full">Generate PDF</button>
              </div>
            </div>
          </div>
        )}
        {section === 'jobs' && <JobsAdmin />}
        {section === 'courses' && <CoursesAdmin />}
        {section === 'scholarships' && <ScholarshipsAdmin />}
        {section === 'users' && <UsersAdmin />}
        {section === 'certificates' && <CertsAdmin />}
        {section === 'analytics' && <AnalyticsAdmin />}
        {section === 'notifications' && <NotificationsAdmin />}
      </div>
    </div>
  )
}
