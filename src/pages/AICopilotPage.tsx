import { useState } from 'react'
import toast from 'react-hot-toast'
import { ArrowRight, CheckCircle2, Sparkles, Compass, Award, BookOpen, Briefcase, GraduationCap, Globe2 } from 'lucide-react'

const CAREER_LIBRARY = {
  'Software Engineer': {
    description: 'Design, build, and maintain software applications using modern web and cloud technologies.',
    demand: 'High demand across startups, enterprises, and government digital transformation projects.',
    skills: ['JavaScript', 'Problem Solving', 'Git', 'APIs', 'System Design'],
    growth: 'Very strong — 20%+ growth in software development roles globally.',
    path: ['Learn programming fundamentals', 'Build projects', 'Apply for junior roles', 'Advance to senior engineering'],
  },
  'Data Analyst': {
    description: 'Interpret business data and generate insights to support decision-making and reporting.',
    demand: 'Strong demand in finance, health, education, and public sector analytics teams.',
    skills: ['Excel', 'SQL', 'Data Visualization', 'Statistics', 'Business Acumen'],
    growth: 'Growing steadily as data-driven decisions become standard.',
    path: ['Learn data tools', 'Analyze sample datasets', 'Create dashboards', 'Move into analytics roles'],
  },
  'Cybersecurity Specialist': {
    description: 'Protect systems, networks, and data from digital threats while building secure environments.',
    demand: 'Very high demand across enterprises, government, and critical infrastructure.',
    skills: ['Network Security', 'Risk Assessment', 'Incident Response', 'Linux', 'Cryptography'],
    growth: 'One of the fastest-growing career paths in IT security.',
    path: ['Study security basics', 'Gain hands-on lab experience', 'Earn certifications', 'Join security teams'],
  },
  'Accountant': {
    description: 'Manage financial records, prepare reports, and ensure compliance with accounting standards.',
    demand: 'Stable demand in corporate finance, public accounting, and nonprofit organizations.',
    skills: ['Accounting Principles', 'Excel', 'Tax Compliance', 'Attention to Detail', 'Communication'],
    growth: 'Steady growth with strong local demand in business and financial services.',
    path: ['Learn accounting fundamentals', 'Practice bookkeeping', 'Earn an accounting qualification', 'Join finance teams'],
  },
}

const LEARNING_RECOMMENDATIONS = [
  { title: 'Professional Software Developer Path', source: 'FuturePath Learn', tag: 'Course' },
  { title: 'Certified Data Analyst Bootcamp', source: 'Partner Academy', tag: 'Certification' },
  { title: 'Intro to Cybersecurity Fundamentals', source: 'Online Workshop', tag: 'Resource' },
  { title: 'Accounting & Finance Basics', source: 'Essentials Track', tag: 'Course' },
]

const JOB_MATCHES = [
  { title: 'Junior Software Engineer', company: 'TechWave', type: 'FULL-TIME', location: 'Mbabane' },
  { title: 'Data Insights Analyst', company: 'SmartGov', type: 'INTERNSHIP', location: 'Manzini' },
  { title: 'Security Analyst Trainee', company: 'SecureNet', type: 'PART-TIME', location: 'Remote' },
]

const INTERNSHIP_MATCHES = [
  { title: 'IT Support Intern', company: 'Eswatini Digital', duration: '3 months' },
  { title: 'Marketing Data Intern', company: 'EduMetrics', duration: '4 months' },
  { title: 'Cyber Defense Intern', company: 'SafeOps', duration: '6 months' },
]

const SCHOLARSHIPS = [
  { title: 'FuturePath Career Grant', provider: 'FuturePath Foundation', amount: 'E6,000', deadline: 'June 30' },
  { title: 'Tech Skills Scholarship', provider: 'Digital Eswatini', amount: 'E10,000', deadline: 'July 12' },
  { title: 'Women in Data Bursary', provider: 'EduGrow', amount: 'E8,500', deadline: 'August 1' },
]

const SCENARIOS = [
  { prompt: 'What if I study accounting?', result: 'Accounting opens finance, audit, and corporate roles with stable growth. You may shift into management or entrepreneurship after 6-12 months of credential training.' },
  { prompt: 'What if I fail mathematics?', result: 'A setback in maths is recoverable. Focus on applied problem solving, seek tutoring, and choose career pathways that value practical skills and certifications.' },
  { prompt: 'What if I choose cybersecurity?', result: 'Cybersecurity is a strong path with high demand. Start with basics, build hands-on labs, and pursue certifications to stand out quickly.' },
]

type CareerKey = keyof typeof CAREER_LIBRARY

type Profile = {
  name: string
  age: string
  education: string
  qualifications: string
  goal: CareerKey
  skills: string
  interests: string
  industry: string
}

const initialProfile: Profile = {
  name: '',
  age: '',
  education: 'High School',
  qualifications: '',
  goal: 'Software Engineer',
  skills: '',
  interests: '',
  industry: 'Technology',
}

function ProgressRing({ value }: { value: number }) {
  const circumference = 2 * Math.PI * 22
  return (
    <div className="relative w-16 h-16">
      <svg width="64" height="64" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="32" cy="32" r="22" fill="transparent" stroke="#e2e8f0" strokeWidth="5" />
        <circle
          cx="32"
          cy="32"
          r="22"
          fill="transparent"
          stroke="#2563eb"
          strokeWidth="5"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - value / 100)}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-[--primary]">{value}%</div>
    </div>
  )
}

export function AICopilotPage() {
  const [profile, setProfile] = useState<Profile>(initialProfile)
  const [uploadName, setUploadName] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [analysisSteps, setAnalysisSteps] = useState<string[]>([])
  const [result, setResult] = useState<any>(null)
  const [responseText, setResponseText] = useState('')
  const [careerA, setCareerA] = useState<CareerKey>('Software Engineer')
  const [careerB, setCareerB] = useState<CareerKey>('Data Analyst')
  const [scenario, setScenario] = useState(SCENARIOS[0].prompt)
  const [scenarioResult, setScenarioResult] = useState('')

  const selectedCareer = CAREER_LIBRARY[profile.goal] || CAREER_LIBRARY['Software Engineer']
  const skillsList = profile.skills.split(',').map((s: string) => s.trim()).filter(Boolean)
  const profileMissingSkills = selectedCareer.skills.filter((skill: string) => !skillsList.some(has => has.toLowerCase() === skill.toLowerCase()))
  const profileReadiness = Math.max(25, 100 - profileMissingSkills.length * 15 - (profile.education === 'High School' && profile.goal === 'Cybersecurity Specialist' ? 10 : 0))

  const comparisonA = CAREER_LIBRARY[careerA as CareerKey]
  const comparisonB = CAREER_LIBRARY[careerB as CareerKey]

  const safeResult = result || {}
  const certifications = Array.isArray(safeResult.certifications) ? safeResult.certifications : []
  const resources = Array.isArray(safeResult.resources) ? safeResult.resources : []
  const jobs = Array.isArray(safeResult.jobs) ? safeResult.jobs : []
  const internships = Array.isArray(safeResult.internships) ? safeResult.internships : []
  const scholarships = Array.isArray(safeResult.scholarships) ? safeResult.scholarships : []
  const existingSkills = Array.isArray(safeResult.existingSkills) ? safeResult.existingSkills : []
  const missingSkills = Array.isArray(safeResult.missingSkills) ? safeResult.missingSkills : []
  const readinessValue = typeof safeResult.readiness === 'number' ? safeResult.readiness : Number(safeResult.readiness) || 0
  const roadmapData = safeResult.roadmap
  const roadmapSections = Array.isArray(roadmapData)
    ? roadmapData.map((item: any, index: number) => ({ label: `Step ${index + 1}`, tasks: [String(item)] }))
    : roadmapData && typeof roadmapData === 'object'
      ? Object.entries(roadmapData).map(([period, tasks]: any) => ({ label: period, tasks: Array.isArray(tasks) ? tasks : [String(tasks)] }))
      : []

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

  const fetchApiJson = async (url: string, options: RequestInit) => {
    const response = await fetch(url, options)
    const text = await response.text()
    if (!text) {
      throw new Error('Empty response from AI service')
    }
    let data
    try {
      data = JSON.parse(text)
    } catch (err) {
      throw new Error(`Invalid JSON response from AI service: ${text}`)
    }
    if (!response.ok) {
      throw new Error(data?.error || `AI request failed (${response.status})`)
    }
    return data
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setAnalysisSteps(['Profile analyzed'])
    setResult(null)
    setResponseText('')
    setScenarioResult('')

    await delay(200)
    setAnalysisSteps(['Profile analyzed', 'Career goal evaluated'])
    await delay(200)
    setAnalysisSteps(['Profile analyzed', 'Career goal evaluated', 'Skill gaps identified'])
    await delay(200)
    setAnalysisSteps(['Profile analyzed', 'Career goal evaluated', 'Skill gaps identified', 'Readiness assessed'])

    try {
      const data = await fetchApiJson('/api/ai-career-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'plan', profile }),
      })

      setResponseText(data.raw || '')
      setResult(data.result)
      setAnalysisSteps(['Profile analyzed', 'Career goal evaluated', 'Skill gaps identified', 'Readiness assessed', 'Opportunities matched', 'Roadmap generated'])
    } catch (error: any) {
      setResponseText('')
      setResult(null)
      setAnalysisSteps([])
      toast.error(error.message || 'AI request failed')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleScenario = async () => {
    setScenarioResult('Thinking...')
    try {
      const data = await fetchApiJson('/api/ai-career-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'scenario', profile, scenario }),
      })
      setScenarioResult(data.raw || data.result || 'No response available.')
    } catch (error: any) {
      setScenarioResult('Unable to generate scenario insight.')
      toast.error(error.message || 'AI request failed')
    }
  }

  const handleCompare = async () => {
    setIsGenerating(true)
    setAnalysisSteps(['Comparing careers'])
    setScenarioResult('')

    try {
      const data = await fetchApiJson('/api/ai-career-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'compare', profile, compareA: careerA, compareB: careerB }),
      })
      setResult((prev: any) => ({ ...prev, comparison: data.result }))
      setAnalysisSteps(['Career comparison generated'])
    } catch (error: any) {
      toast.error(error.message || 'AI request failed')
    } finally {
      setIsGenerating(false)
    }
  }

  const industryOptions = ['Technology', 'Finance', 'Government', 'Healthcare', 'Education', 'Marketing']
  const educationOptions = ['High School', 'Diploma', 'Bachelor', 'Masters']

  return (
    <div className="p-4 animate-fade-in">
      <div className="mb-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-2xl bg-[--primary] text-white flex items-center justify-center text-2xl">🤖</div>
          <div>
            <h1 className="text-xl font-bold text-[--primary]">AI Career Copilot</h1>
            <p className="text-sm text-[--on-surf-v]">An intelligent career navigation assistant for students, graduates and job seekers.</p>
          </div>
        </div>
        <div className="card p-4 bg-[--surf] border border-[--outline-v]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[--on-surf-v]">Flagship Feature</p>
              <h2 className="font-bold text-base">Career guidance with step-by-step reasoning</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-[--primary]"><Sparkles size={16} /> AI Insights</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="card">
          <h2 className="font-bold text-base mb-3">Tell the Copilot about you</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Name</label>
              <input className="input" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} placeholder="Your full name" />
            </div>
            <div>
              <label className="label">Age</label>
              <input className="input" type="number" value={profile.age} onChange={(e) => setProfile({ ...profile, age: e.target.value })} placeholder="e.g. 22" />
            </div>
            <div>
              <label className="label">Education Level</label>
              <select className="input" value={profile.education} onChange={(e) => setProfile({ ...profile, education: e.target.value })}>
                {educationOptions.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Preferred Industry</label>
              <select className="input" value={profile.industry} onChange={(e) => setProfile({ ...profile, industry: e.target.value })}>
                {industryOptions.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Current Qualifications</label>
              <input className="input" value={profile.qualifications} onChange={(e) => setProfile({ ...profile, qualifications: e.target.value })} placeholder="e.g. Diploma in IT" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Career Goal</label>
              <select className="input" value={profile.goal} onChange={(e) => setProfile({ ...profile, goal: e.target.value as CareerKey })}>
                {(Object.keys(CAREER_LIBRARY) as CareerKey[]).map(key => <option key={key} value={key}>{key}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Skills</label>
              <input className="input" value={profile.skills} onChange={(e) => setProfile({ ...profile, skills: e.target.value })} placeholder="e.g. JavaScript, Excel, teamwork" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Interests</label>
              <input className="input" value={profile.interests} onChange={(e) => setProfile({ ...profile, interests: e.target.value })} placeholder="e.g. Web development, data" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Upload CV (optional)</label>
              <input className="input" type="file" onChange={(event) => setUploadName(event.target.files?.[0]?.name || '')} />
              {uploadName && <div className="text-xs text-[--on-surf-v] mt-1">Selected: {uploadName}</div>}
            </div>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <button className="btn btn-primary btn-full" onClick={handleGenerate} disabled={isGenerating}>Generate Career Plan</button>
            <button className="btn btn-outline btn-full" onClick={() => { setProfile(initialProfile); setUploadName(''); setResult(null); setAnalysisSteps([]); setScenarioResult('') }}>Reset</button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[1fr_280px]">
          <div className="card">
            <h3 className="font-bold text-sm mb-3">AI Thinking Panel</h3>
            <div className="space-y-2">
              {['Profile analyzed', 'Career goal evaluated', 'Skill gaps identified', 'Readiness assessed', 'Opportunities matched', 'Roadmap generated'].map(step => (
                <div key={step} className="flex items-center gap-3 text-sm">
                  <span className={`w-7 h-7 rounded-full grid place-items-center ${analysisSteps.includes(step) ? 'bg-[--secondary] text-white' : 'bg-[--surf-cont] text-[--on-surf-v]'}`}>
                    {analysisSteps.includes(step) ? <CheckCircle2 size={14} /> : <span>{analysisSteps.indexOf(step) + 1 || '·'}</span>}
                  </span>
                  <span className={analysisSteps.includes(step) ? 'text-[--primary]' : 'text-[--on-surf-v]'}>{step}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card bg-[--surf] border border-[--outline-v]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[--on-surf-v]">Readiness score</p>
                <h3 className="font-bold text-base">{result ? readinessValue : '--'}</h3>
              </div>
              <ProgressRing value={readinessValue} />
            </div>
            <p className="text-xs text-[--on-surf-v]">A higher readiness score means you can move faster toward your target career.</p>
          </div>
        </div>

        {result && (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="card">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[--on-surf-v]">Career goal analysis</p>
                    <h3 className="font-bold text-base">{result.target}</h3>
                  </div>
                  <div className="rounded-xl bg-[--surf-cont] px-3 py-2 text-xs font-semibold text-[--primary]">{profile.industry}</div>
                </div>
                <p className="text-sm text-[--on-surf-v] mb-3">{result.description}</p>
                <div className="text-xs text-[--on-surf-v]">Industry demand: <span className="font-semibold text-[--primary]">{result.demand}</span></div>
              </div>
              <div className="card">
                <h3 className="font-bold text-base mb-3">Skill gap analysis</h3>
                <div className="text-sm mb-3"><strong>Existing skills:</strong> {existingSkills.length ? existingSkills.join(', ') : 'None listed'}</div>
                <div className="text-sm mb-3"><strong>Missing skills:</strong> {missingSkills.length ? missingSkills.join(', ') : 'Well aligned'}</div>
                <div className="text-xs text-[--on-surf-v]">Readiness: {readinessValue}%</div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="card bg-[--surf] border border-[--outline-v]">
                <div className="flex items-center gap-2 mb-3"><Award size={16} className="text-[--secondary]" /><h4 className="font-semibold">Certifications</h4></div>
                {certifications.length ? certifications.map((item: string) => <div key={item} className="text-sm mb-2">• {item}</div>) : <div className="text-xs text-[--on-surf-v]">No certifications suggested yet.</div>}
              </div>
              <div className="card bg-[--surf] border border-[--outline-v]">
                <div className="flex items-center gap-2 mb-3"><BookOpen size={16} className="text-[--secondary]" /><h4 className="font-semibold">Learning resources</h4></div>
                {resources.length ? resources.map((item: any) => <div key={item.title || item} className="text-sm mb-2">• <strong>{item.title || item}</strong> <span className="text-[--on-surf-v]">({item.tag || 'Resource'})</span></div>) : <div className="text-xs text-[--on-surf-v]">No resources recommended yet.</div>}
              </div>
              <div className="card bg-[--surf] border border-[--outline-v]">
                <div className="flex items-center gap-2 mb-3"><Compass size={16} className="text-[--secondary]" /><h4 className="font-semibold">Opportunities</h4></div>
                <div className="text-sm mb-2"><strong>Jobs:</strong> {jobs.length}</div>
                <div className="text-sm mb-2"><strong>Internships:</strong> {internships.length}</div>
                <div className="text-sm"><strong>Scholarships:</strong> {scholarships.length}</div>
              </div>
            </div>

            <div className="card">
              <h3 className="font-bold text-base mb-3">Opportunity matching</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {jobs.length ? jobs.map((job: any, index: number) => {
                  const title = typeof job === 'string' ? job : job.title || 'Job opening'
                  return (
                    <div key={`${title}-${index}`} className="bg-white border border-[--outline-v] rounded-xl p-3 text-sm">
                      <div className="font-semibold mb-1">{title}</div>
                      <div className="text-[--on-surf-v] text-xs mb-1">{job.company || 'Unknown company'}</div>
                      <div className="text-[--on-surf-v] text-xs">{job.location || 'Location unknown'} · {job.type || 'Type unknown'}</div>
                    </div>
                  )
                }) : <div className="text-xs text-[--on-surf-v]">No job matches available yet.</div>}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="card">
                <h3 className="font-bold text-base mb-3">Scholarship matches</h3>
                {scholarships.length ? scholarships.map((item: any, index: number) => (
                  <div key={`${item.title || 'scholarship'}-${index}`} className="mb-3">
                    <div className="font-semibold text-sm">{item.title || 'Scholarship'}</div>
                    <div className="text-xs text-[--on-surf-v]">{item.provider || 'Unknown provider'} · {item.amount || 'TBA'} · deadline {item.deadline || 'TBA'}</div>
                  </div>
                )) : <div className="text-xs text-[--on-surf-v]">No scholarships found yet.</div>}
              </div>
              <div className="card">
                <h3 className="font-bold text-base mb-3">Personalized roadmap</h3>
                {roadmapSections.length ? roadmapSections.map(section => (
                  <div key={section.label} className="mb-3">
                    <div className="text-sm font-semibold capitalize mb-1">{section.label.replace(/([A-Z])/g, ' $1')}</div>
                    {section.tasks.map((task: string, index: number) => <div key={`${section.label}-${index}`} className="text-xs text-[--on-surf-v] mb-1">• {task}</div>)}
                  </div>
                )) : <div className="text-xs text-[--on-surf-v]">No roadmap available yet.</div>}
              </div>
            </div>
          </div>
        )}

        <div className="card">
          <h2 className="font-bold text-base mb-3">Career Comparison</h2>
          <div className="grid gap-3 sm:grid-cols-3 mb-4">
            <div>
              <label className="label">Career A</label>
              <select className="input" value={careerA} onChange={(e) => setCareerA(e.target.value as CareerKey)}>
                {(Object.keys(CAREER_LIBRARY) as CareerKey[]).map(key => <option key={key} value={key}>{key}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Career B</label>
              <select className="input" value={careerB} onChange={(e) => setCareerB(e.target.value as CareerKey)}>
                {(Object.keys(CAREER_LIBRARY) as CareerKey[]).map(key => <option key={key} value={key}>{key}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button className="btn btn-primary btn-full" onClick={handleCompare}>Compare</button>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[{ key: careerA, value: comparisonA }, { key: careerB, value: comparisonB }].map((career) => (
              <div key={career.key} className="bg-white border border-[--outline-v] rounded-xl p-4">
                <div className="text-sm uppercase tracking-[0.24em] text-[--on-surf-v] mb-2">{career.key}</div>
                <div className="text-sm text-[--primary] font-semibold mb-2">Growth potential</div>
                <div className="text-xs text-[--on-surf-v] mb-2">{career.value.growth}</div>
                <div className="text-sm font-semibold mb-1">Skills required</div>
                <div className="text-xs text-[--on-surf-v] mb-2">{career.value.skills.join(', ')}</div>
                <div className="text-sm font-semibold mb-1">Learning path</div>
                <div className="text-xs text-[--on-surf-v]">{career.value.path.join(' → ')}</div>
                <div className="text-sm font-semibold mt-2 mb-1">Opportunity availability</div>
                <div className="text-xs text-[--on-surf-v]">Strong demand across local and remote roles</div>
              </div>
            ))}
          </div>
          {result?.comparison && (
            <div className="bg-[--surf] border border-[--outline-v] rounded-xl p-4 mt-4">
              <div className="text-sm uppercase tracking-[0.24em] text-[--on-surf-v] mb-2">AI comparison insight</div>
              <div className="text-sm whitespace-pre-line">{typeof result.comparison === 'string' ? result.comparison : JSON.stringify(result.comparison, null, 2)}</div>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="font-bold text-base mb-3">What If Simulator</h2>
          <div className="grid gap-3 sm:grid-cols-[1fr_160px] mb-4">
            <div>
              <label className="label">Scenario</label>
              <select className="input" value={scenario} onChange={(e) => setScenario(e.target.value)}>
                {SCENARIOS.map(item => <option key={item.prompt} value={item.prompt}>{item.prompt}</option>)}
              </select>
            </div>
            <div className="flex items-end">
              <button className="btn btn-primary btn-full" onClick={handleScenario}>Simulate</button>
            </div>
          </div>
          {scenarioResult && (
            <div className="bg-[--surf] border border-[--outline-v] rounded-xl p-4">
              <div className="text-sm text-[--on-surf-v] mb-2">Scenario result</div>
              <div className="text-sm">{scenarioResult}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
