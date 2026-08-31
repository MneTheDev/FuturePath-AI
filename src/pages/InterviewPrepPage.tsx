import { useState } from 'react'
import { ArrowLeft, Mic, MicOff, Video, VideoOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { IMAGES } from '@/lib/images'
import { INTERVIEW_QUESTIONS } from '@/lib/data'
import toast from 'react-hot-toast'

const PREP_TOPICS = [
  { label: '✅ Data Privacy Standards', done: true, sub: 'Data Protection Act requirements' },
  { label: '✅ Lateral Banking Protocols', done: true, sub: '' },
  { label: '☐ ICT Governance Framework', done: false, sub: 'COBIT basics for regional enterprises' },
  { label: '☐ System Arch Design', done: false, sub: 'Scalability for regional markets' },
]

const ESWATINI_QA = [
  { q: 'Tell me about yourself?', a: '' },
  { q: 'Why do you want to work at MTN?', a: 'Swazi Context: Emphasise your alignment with MTN\'s mission of digital inclusion in the Kingdom. Mention their local fintech (MoMo) and SME growth.' },
  { q: 'What is your expected salary?', a: '' },
  { q: 'How do you handle workplace conflict?', a: '' },
]

function PrepHomePage({ onStart }: { onStart: () => void }) {
  const [openQ, setOpenQ] = useState<number | null>(1)
  return (
    <div className="p-4 animate-fade-in">
      <h1 className="text-2xl font-extrabold text-[--primary] mb-1">Master Your Interview</h1>
      <p className="text-sm text-[--on-surf-v] mb-4">Tailored prep guides and AI tools to land your role at Eswatini's top employers.</p>

      {/* Search */}
      <div className="relative mb-4">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[--outline]">🔍</span>
        <input className="input pl-9" placeholder="Search specific roles (e.g. Software Engineer)…" />
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-5">
        {['General', 'Technical', 'Behavioural', 'Finance', 'Government'].map((f, i) => (
          <button key={f} className={`chip ${i === 0 ? 'active' : ''}`}>{f}</button>
        ))}
      </div>

      {/* Practice with AI */}
      <div className="card mb-4" style={{ border: '1.5px solid var(--primary)' }}>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-base text-[--primary]">Practice with AI</h3>
          <span className="tag tag-green text-[10px]">NEW</span>
        </div>
        <p className="text-sm text-[--on-surf-v] mb-4 leading-relaxed">
          Simulate real interview scenarios with our AI interviewer. Get instant feedback on tone, confidence, and answer structure.
        </p>
        <div className="relative rounded-xl overflow-hidden mb-3">
          <img src={IMAGES.interviewPrepHero} alt="Interview Practice" className="w-full h-40 object-cover" />
          <div className="absolute bottom-2 left-2 bg-[--primary]/80 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">● Live Feedback Enabled</div>
        </div>
        <button className="btn btn-primary btn-full gap-2" onClick={onStart}>
          🎙️ Start Mock Session →
        </button>
      </div>

      {/* Technical readiness */}
      <div className="card mb-4">
        <h3 className="font-bold text-sm mb-3">Technical Readiness</h3>
        {PREP_TOPICS.map((t, i) => (
          <div key={i} className="flex items-start gap-3 mb-2.5">
            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 text-xs
              ${t.done ? 'bg-[--secondary] border-[--secondary] text-white' : 'border-[--outline-v]'}`}>
              {t.done && '✓'}
            </div>
            <div>
              <div className="text-sm font-medium">{t.label}</div>
              {t.sub && <div className="text-xs text-[--on-surf-v]">{t.sub}</div>}
            </div>
          </div>
        ))}
        <button className="btn btn-outline btn-full btn-sm mt-2" onClick={() => toast.success('Cheat sheet downloaded!')}>Download Cheat Sheet</button>
      </div>

      {/* Eswatini Corporate Q&A */}
      <div className="card mb-4">
        <h3 className="font-bold text-sm mb-3">Eswatini Corporate Q&A</h3>
        {ESWATINI_QA.map((item, i) => (
          <div key={i} className="border-b border-[--surf-cont] last:border-0">
            <button
              className="w-full flex justify-between items-center py-3 text-left text-sm font-semibold bg-transparent border-none cursor-pointer font-sans text-[--on-bg]"
              onClick={() => setOpenQ(openQ === i ? null : i)}
            >
              {item.q} <span className="text-[--on-surf-v]">{openQ === i ? '▲' : '▼'}</span>
            </button>
            {openQ === i && item.a && (
              <div className="pb-3">
                <div className="bg-[--surf-low] rounded-xl p-3 text-sm text-[--on-surf-v] leading-relaxed border border-[--outline-v]">
                  💡 {item.a}
                  {i === 1 && (
                    <blockquote className="mt-2 pl-3 border-l-2 border-[--secondary] text-xs italic">
                      "I'm inspired by how MTN has transformed financial accessibility for Swazis. My goal is to leverage my skills to expand this digital ecosystem further…"
                    </blockquote>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Local Etiquette */}
      <div className="card mb-4">
        <h3 className="font-bold text-sm mb-3">Local Etiquette & Culture</h3>
        {[
          { icon: '👔', title: 'Dress Code', desc: 'Conservative is best. Men: Suit/Tie. Women: modest professional attire. Traditional attire is fine, but confirm with HR.' },
          { icon: '🤝', title: 'Greetings', desc: "A firm handshake (right hand) is standard. Traditional Swazi etiquette: A slight bow is respectful, but not always expected." },
          { icon: '⏰', title: 'Punctuality', desc: 'Arrive 10–15 minutes early. Some firms allow Traditional Eswatini time allowance, but being on time is always a sign of respect.' },
          { icon: '🏛️', title: 'Social Hierarchy', desc: 'Respect seniority and always address your elder panel members with extra courtesy. Proper courtesy is culturally significant in Eswatini.' },
        ].map((e, i) => (
          <div key={i} className="flex items-start gap-3 mb-3 last:mb-0">
            <div className="w-10 h-10 rounded-xl bg-[--surf-cont] flex items-center justify-center text-xl flex-shrink-0">{e.icon}</div>
            <div>
              <div className="text-sm font-bold">{e.title}</div>
              <div className="text-xs text-[--on-surf-v] leading-relaxed">{e.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function InterviewSession({ onEnd }: { onEnd: () => void }) {
  const [qIdx, setQIdx] = useState(0)
  const [micOn, setMicOn] = useState(true)
  const [camOn, setCamOn] = useState(true)
  const q = INTERVIEW_QUESTIONS[qIdx]

  const next = () => {
    if (qIdx < INTERVIEW_QUESTIONS.length - 1) setQIdx(i => i + 1)
    else { toast.success('Interview complete! Great job! 🎉'); setTimeout(onEnd, 1000) }
  }

  return (
    <div className="min-h-screen bg-[--bg]">
      {/* Header */}
      <div className="bg-white border-b border-[--outline-v] px-4 py-3 flex justify-between items-center sticky top-0 z-10">
        <button className="flex items-center gap-1.5 text-sm font-semibold text-[--primary] border-none bg-transparent cursor-pointer font-sans" onClick={onEnd}>
          <ArrowLeft size={16} /> Interview Prep
        </button>
        <span className="text-sm text-[--on-surf-v] font-medium">Question {qIdx + 1} of {INTERVIEW_QUESTIONS.length}</span>
      </div>

      <div className="p-4">
        {/* Video feed */}
        <div className="relative rounded-2xl overflow-hidden mb-4" style={{ aspectRatio: '4/3', background: '#0f172a' }}>
          <img src={IMAGES.interviewer} alt="Interviewer" className="w-full h-full object-cover" style={{ opacity: 0.92 }} />

          {/* Recording badge */}
          <div className="absolute top-3 left-3">
            <span className="bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> RECORDING
            </span>
          </div>

          {/* Self-view PiP */}
          <div className="absolute bottom-3 right-3 w-24 h-18 rounded-xl overflow-hidden border-2 border-white/30"
            style={{ width: 88, height: 66 }}>
            <img src={IMAGES.interviewee} alt="You" className="w-full h-full object-cover" />
            <div className="absolute bottom-1.5 right-1.5 text-[9px] font-bold text-[--sec-c]">● YOU</div>
          </div>
        </div>

        {/* Question card */}
        <div className="card mb-3">
          <div className="flex items-center gap-2 mb-3">
            <span className="tag tag-blue text-xs">Question {qIdx + 1} of {INTERVIEW_QUESTIONS.length}</span>
            <span className="text-xs text-[--on-surf-v]">Topic: {q.topic}</span>
          </div>
          <p className="text-lg font-bold text-[--primary] leading-snug">{q.question}</p>
        </div>

        {/* Live feedback */}
        <div className="card mb-4" style={{ background: 'var(--surf-low)', border: 'none' }}>
          <div className="text-xs font-bold tracking-widest text-[--on-surf-v] mb-3 uppercase">〜 Live Feedback</div>
          <div className="flex items-start gap-3 p-2.5 bg-white rounded-xl mb-2">
            <div className="w-9 h-9 rounded-lg bg-[--sec-c] flex items-center justify-center text-lg flex-shrink-0">✓</div>
            <div>
              <div className="text-sm font-semibold">Great Tone</div>
              <div className="text-xs text-[--on-surf-v]">You sound confident and clear.</div>
            </div>
          </div>
          <div className="flex items-start gap-3 p-2.5 bg-white rounded-xl mb-2">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-lg flex-shrink-0">⏱</div>
            <div>
              <div className="text-sm font-semibold">Pacing Tip</div>
              <div className="text-xs text-[--on-surf-v]">Try to pause for 1 second after a point.</div>
            </div>
          </div>
          <div className="flex justify-between bg-white rounded-xl px-3 py-2 text-xs font-semibold">
            <span>AUDIO LEVELS</span>
            <span className="text-[--secondary]">Optimal</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <button className={`btn btn-sm w-11 p-2.5 text-lg ${micOn ? 'btn-outline' : 'btn-primary'}`} onClick={() => setMicOn(!micOn)} title="Toggle mic">
            {micOn ? <Mic size={18} /> : <MicOff size={18} />}
          </button>
          <button className={`btn btn-sm w-11 p-2.5 text-lg ${camOn ? 'btn-outline' : 'btn-primary'}`} onClick={() => setCamOn(!camOn)} title="Toggle camera">
            {camOn ? <Video size={18} /> : <VideoOff size={18} />}
          </button>
          <button className="btn btn-outline btn-sm flex-1" onClick={next}>Skip Question</button>
          <button className="btn btn-sm flex-1" style={{ background: '#dc2626', color: '#fff' }} onClick={onEnd}>End Session</button>
        </div>
      </div>
    </div>
  )
}

export function InterviewPrepPage() {
  const [started, setStarted] = useState(false)
  const navigate = useNavigate()

  return started
    ? <InterviewSession onEnd={() => { setStarted(false); navigate('/') }} />
    : <PrepHomePage onStart={() => setStarted(true)} />
}
