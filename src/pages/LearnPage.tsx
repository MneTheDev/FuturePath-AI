import { useState } from 'react'
import { ArrowLeft, Play, Pause, BookOpen, Award, Lock, CheckCircle, Download } from 'lucide-react'
import { useCourses, useCertificates } from '@/hooks/useCourses'
import { useAuthStore } from '@/hooks/useAuthStore'
import { QUIZ_QUESTIONS } from '@/lib/data'
import type { Course, QuizQuestion } from '@/types'
import { clsx } from 'clsx'
import toast from 'react-hot-toast'

const CATS = ['All', 'Technology', 'Business', 'Finance', 'Practical Skills']

const MODULES = [
  { num: 1, name: 'Career Foundations', status: 'done' as const },
  { num: 2, name: 'Communication Skills', status: 'done' as const },
  { num: 3, name: 'Introduction to the Field', status: 'active' as const },
  { num: 4, name: 'Advanced Concepts', status: 'locked' as const },
  { num: 5, name: 'Final Assessment', status: 'locked' as const },
]

// ── Course list ─────────────────────────────────────────────
function CourseCard({ course, pct, onClick }: { course: Course; pct: number; onClick: () => void }) {
  return (
    <div className="card p-0 overflow-hidden cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <div className="relative">
        <img src={course.thumbnail_url} alt={course.title} className="w-full h-36 object-cover" />
        {pct === 100 && (
          <div className="absolute top-2 right-2">
            <span className="tag tag-green text-[10px]">✓ Done</span>
          </div>
        )}
        {pct > 0 && pct < 100 && (
          <div className="absolute top-2 right-2">
            <span className="tag tag-amber text-[10px]">{pct}%</span>
          </div>
        )}
      </div>
      <div className="p-3.5">
        <h3 className="font-bold text-sm mb-1">{course.title}</h3>
        <p className="text-xs text-[--on-surf-v] mb-2">{course.category} · {course.level} · {course.duration_hours}h</p>
        {pct > 0 && (
          <div className="progress-bar" style={{ height: 4, margin: '4px 0 0' }}>
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        )}
      </div>
    </div>
  )
}

// ── Course detail ───────────────────────────────────────────
function CourseDetail({ course, pct, onBack, onModule, onQuiz, cert }: {
  course: Course; pct: number; onBack: () => void; onModule: () => void; onQuiz: () => void; cert: any
}) {
  return (
    <div className="p-4 animate-fade-in">
      <button className="flex items-center gap-1.5 text-sm font-semibold text-[--primary] mb-3 border-none bg-transparent cursor-pointer font-sans" onClick={onBack}>
        <ArrowLeft size={16} /> Back to Courses
      </button>
      <p className="text-xs text-[--on-surf-v] mb-1">Courses › {course.title}</p>
      <h1 className="text-lg font-bold text-[--primary] mb-4">Module 3: Introduction to the Field</h1>

      {/* Video */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-4 cursor-pointer group" onClick={onModule}>
        <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center text-[--primary] shadow-lg">
            <Play size={24} fill="currentColor" />
          </div>
        </div>
        <div className="absolute bottom-2.5 left-3 right-3 text-white text-xs opacity-90">12:45 / 24:00</div>
      </div>

      {/* Summary card */}
      <div className="card mb-3">
        <h3 className="font-bold text-sm mb-2">Module Summary</h3>
        <p className="text-sm text-[--on-surf-v] leading-relaxed mb-3">{course.description} We bridge theoretical concepts with practical local applications in Eswatini.</p>
        <div className="flex gap-2">
          <button className="btn btn-primary btn-sm gap-1.5" onClick={onQuiz}><BookOpen size={13} /> Take Quiz</button>
          <button className="btn btn-outline btn-sm gap-1.5" onClick={() => toast.success('Resources downloaded!')}><Download size={13} /> Download Resources</button>
        </div>
      </div>

      {/* Progress */}
      <div className="card mb-3">
        <h3 className="font-bold text-sm mb-3">Course Progress</h3>
        {MODULES.map(m => (
          <div key={m.num} className="flex items-center gap-3 py-2.5 border-b border-[--surf-cont] last:border-0">
            <div className={clsx('w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0',
              m.status === 'done' ? 'bg-[--sec-c] text-[--secondary]'
                : m.status === 'active' ? 'bg-[--primary] text-white'
                : 'bg-[--surf-high] text-[--on-surf-v]'
            )}>
              {m.status === 'done' ? <CheckCircle size={16} /> : m.status === 'locked' ? <Lock size={14} /> : m.num}
            </div>
            <div>
              <div className={clsx('text-[11px] font-semibold', m.status === 'locked' ? 'text-[--on-surf-v]' : 'text-[--secondary]')}>
                {m.status === 'active' ? `Module ${m.num} (Current)` : `Module ${m.num}`}
              </div>
              <div className={clsx('text-sm font-semibold', m.status === 'locked' && 'text-[--on-surf-v]')}>{m.name}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Cert banner */}
      {cert ? (
        <div className="bg-[--primary] text-white rounded-2xl p-5 text-center">
          <div className="text-2xl mb-1.5">🏅</div>
          <div className="text-xs font-bold tracking-wider opacity-75 mb-1">CERTIFICATE EARNED</div>
          <div className="font-bold text-base mb-1">{cert.course?.title}</div>
          <div className="text-xs opacity-75 mb-3">Issued: {cert.issued_at.slice(0, 10)} · ID: {cert.certificate_uid}</div>
          <button className="btn btn-sm" style={{ background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}
            onClick={() => toast.success('Certificate downloaded!')}>
            <Download size={13} /> Download PDF
          </button>
        </div>
      ) : (
        <div className="card card-amber">
          <div className="flex items-center gap-2 mb-1.5"><Award size={16} className="text-amber-700" /><span className="text-sm font-bold text-amber-800">Unlock Certification</span></div>
          <p className="text-xs text-amber-900">Complete all modules to earn your verified FuturePath Eswatini Professional Certificate.</p>
        </div>
      )}
    </div>
  )
}

// ── Module player ───────────────────────────────────────────
function ModulePlayer({ course, onBack, onQuiz }: { course: Course; onBack: () => void; onQuiz: () => void }) {
  const [playing, setPlaying] = useState(false)
  return (
    <div className="p-4 animate-fade-in">
      <button className="flex items-center gap-1.5 text-sm font-semibold text-[--primary] mb-3 border-none bg-transparent cursor-pointer font-sans" onClick={onBack}>
        <ArrowLeft size={16} /> Back to Course
      </button>
      <p className="text-xs text-[--on-surf-v] mb-1">Courses › {course.title}</p>
      <h1 className="text-lg font-bold text-[--primary] mb-4">Module 3: Introduction to Project Management</h1>

      {/* Video player */}
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-4 cursor-pointer bg-[#0f172a]"
        onClick={() => setPlaying(!playing)}>
        <img src={course.thumbnail_url} alt="" className="w-full h-full object-cover"
          style={{ opacity: playing ? 0.5 : 0.7 }} />
        {playing && (
          <div className="absolute top-3 left-3">
            <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">● PLAYING</span>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center text-[--primary] shadow-lg">
            {playing ? <Pause size={22} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60">
          <div className="h-1 bg-white/30 rounded-full mb-1.5">
            <div className="h-full bg-[--sec-c] rounded-full transition-all duration-500" style={{ width: playing ? '53%' : '0%' }} />
          </div>
          <div className="text-xs text-white/85">12:45 / 24:00</div>
        </div>
      </div>

      <div className="card">
        <h3 className="font-bold text-sm mb-2">Module Summary</h3>
        <p className="text-sm text-[--on-surf-v] leading-relaxed mb-3">
          In this module, we explore the core pillars of professional project management within the Eswatini corporate landscape.
          You will learn how to define project scopes, identify key stakeholders, and manage resources efficiently to meet organisational goals.
          We bridge theoretical PMBOK concepts with practical local applications.
        </p>
        <div className="flex gap-2">
          <button className="btn btn-primary btn-sm gap-1.5" onClick={onQuiz}><BookOpen size={13} /> Take Quiz</button>
          <button className="btn btn-outline btn-sm gap-1.5" onClick={() => toast.success('Resources downloaded!')}><Download size={13} /> Download Resources</button>
        </div>
      </div>
    </div>
  )
}

// ── Quiz engine ─────────────────────────────────────────────
function QuizEngine({ course, onBack }: { course: Course; onBack: () => void }) {
  const [cur, setCur] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  const q: QuizQuestion = QUIZ_QUESTIONS[cur]

  const pick = (i: number) => {
    if (answered) return
    setSelected(i)
    setAnswered(true)
    if (i === q.correct_index) setScore(s => s + 1)
  }

  const next = () => {
    if (cur < QUIZ_QUESTIONS.length - 1) { setCur(c => c + 1); setSelected(null); setAnswered(false) }
    else setDone(true)
  }

  const restart = () => { setCur(0); setSelected(null); setAnswered(false); setScore(0); setDone(false) }

  if (done) {
    const pct = Math.round((score / QUIZ_QUESTIONS.length) * 100)
    const pass = pct >= 60
    return (
      <div className="p-4 text-center animate-fade-in">
        <button className="flex items-center gap-1.5 text-sm font-semibold text-[--primary] mb-6 border-none bg-transparent cursor-pointer font-sans" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Course
        </button>
        <div className="text-5xl mb-3">{pass ? '🏆' : '💪'}</div>
        <h2 className={clsx('text-2xl font-bold mb-1', pass ? 'text-[--secondary]' : 'text-red-600')}>{pass ? 'Quiz Passed!' : 'Keep Practising'}</h2>
        <div className="text-5xl font-extrabold text-[--primary] my-3">{pct}%</div>
        <p className="text-sm text-[--on-surf-v] mb-6">
          {score} of {QUIZ_QUESTIONS.length} correct · {pass ? 'You may proceed to the next module.' : 'You need 60% to pass. Review the material and try again.'}
        </p>
        <button className="btn btn-primary btn-full mb-2" onClick={restart}>Retake Quiz</button>
        <button className="btn btn-outline btn-full mb-2" onClick={onBack}>Back to Course</button>
        {pass && <button className="btn btn-secondary btn-full" onClick={() => toast.success('Complete all modules to claim your certificate!')}>🏅 Claim Certificate</button>}
      </div>
    )
  }

  return (
    <div className="p-4 animate-fade-in">
      <button className="flex items-center gap-1.5 text-sm font-semibold text-[--primary] mb-3 border-none bg-transparent cursor-pointer font-sans" onClick={onBack}>
        <ArrowLeft size={16} /> Back to Course
      </button>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold">Module Quiz</h2>
        <span className="text-sm text-[--on-surf-v]">{cur + 1} / {QUIZ_QUESTIONS.length}</span>
      </div>
      <div className="progress-bar mb-4">
        <div className="progress-fill" style={{ width: `${((cur + 1) / QUIZ_QUESTIONS.length) * 100}%` }} />
      </div>
      <div className="bg-[--surf-low] rounded-xl p-4 mb-5 text-base font-bold text-[--primary] leading-snug">{q.question}</div>
      {q.options.map((opt, i) => (
        <button key={i} className={clsx('quiz-option',
          selected === i && 'selected',
          answered && i === q.correct_index && 'correct',
          answered && selected === i && i !== q.correct_index && 'wrong'
        )} onClick={() => pick(i)}>
          <span className="font-bold mr-2">{String.fromCharCode(65 + i)}.</span>{opt}
        </button>
      ))}
      {answered && (
        <button className="btn btn-primary btn-full mt-3" onClick={next}>
          {cur < QUIZ_QUESTIONS.length - 1 ? 'Next Question →' : 'See Results'}
        </button>
      )}
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────
export function LearnPage() {
  const { courses, progress } = useCourses()
  const { user } = useAuthStore()
  const { certs } = useCertificates(user?.id)

  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('All')
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [showModule, setShowModule] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)

  const filtered = courses.filter(c =>
    (!search || c.title.toLowerCase().includes(search.toLowerCase())) &&
    (cat === 'All' || c.category === cat)
  )

  const cert = selectedCourse ? certs.find(c => c.course_id === selectedCourse.id) : null

  if (showQuiz && selectedCourse) return <QuizEngine course={selectedCourse} onBack={() => setShowQuiz(false)} />
  if (showModule && selectedCourse) return <ModulePlayer course={selectedCourse} onBack={() => setShowModule(false)} onQuiz={() => { setShowModule(false); setShowQuiz(true) }} />
  if (selectedCourse) return (
    <CourseDetail
      course={selectedCourse}
      pct={progress[selectedCourse.id] ?? 0}
      onBack={() => setSelectedCourse(null)}
      onModule={() => setShowModule(true)}
      onQuiz={() => setShowQuiz(true)}
      cert={cert}
    />
  )

  return (
    <div className="p-4 animate-fade-in">
      <h1 className="text-xl font-bold text-[--primary] mb-1">Learning Academy</h1>
      <p className="text-sm text-[--on-surf-v] mb-4">Build career-ready skills with Eswatini-focused courses.</p>

      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[--outline] text-base">🔍</span>
        <input className="input pl-9" placeholder="Search courses…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-5">
        {CATS.map(c => (
          <button key={c} className={clsx('chip', cat === c && 'active')} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📚</div>
          <p className="text-[--on-surf-v] font-semibold">No courses match your search</p>
        </div>
      ) : (
        <div className="space-y-0">
          {filtered.map(course => (
            <CourseCard key={course.id} course={course} pct={progress[course.id] ?? 0} onClick={() => setSelectedCourse(course)} />
          ))}
        </div>
      )}
    </div>
  )
}
