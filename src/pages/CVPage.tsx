import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { Plus, Trash2, Eye, Download, Share2, ArrowLeft, ArrowRight, Lightbulb } from 'lucide-react'
import { generateCVPDF } from '@/lib/cvPDF'
import { useAuthStore } from '@/hooks/useAuthStore'
import { supabase } from '@/lib/supabase'
import type { CVData } from '@/types'
import { clsx } from 'clsx'
import toast from 'react-hot-toast'

const STEPS = ['Personal', 'Education', 'Experience', 'Skills']

const DEFAULT_CV: CVData = {
  personal: { full_name: 'Sibusiso Dlamini', email: 'sibusiso@email.com', phone: '+268 7612 3456', location: 'Mbabane, Eswatini', summary: '', linkedin: '', website: '' },
  education: [{ institution: 'University of Eswatini', degree: 'BSc Computer Science', field: '', start_year: '2018', end_year: '2022' }],
  experience: [],
  skills: ['JavaScript', 'React', 'Python', 'Microsoft Office'],
  certifications: [],
  references: [],
  projects: [],
}

const SUGGESTED_SKILLS = ['Communication', 'Leadership', 'Problem Solving', 'isiSwati', 'Financial Analysis', 'Customer Service', 'Project Management', 'Microsoft Excel', 'AutoCAD', 'Adobe Photoshop']

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="flex items-center mb-6">
      {STEPS.map((s, i) => (
        <div key={s} className="flex items-center flex-1">
          <div className="flex flex-col items-center flex-1">
            <div className={clsx('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 relative z-10',
              i < step ? 'bg-[--secondary] border-[--secondary] text-white'
                : i === step ? 'bg-[--primary] border-[--primary] text-white'
                : 'bg-white border-[--outline-v] text-[--on-surf-v]'
            )}>
              {i < step ? '✓' : i + 1}
            </div>
            <div className={clsx('text-[10px] font-semibold mt-1', i === step ? 'text-[--primary]' : 'text-[--on-surf-v]')}>{s}</div>
          </div>
          {i < STEPS.length - 1 && (
            <div className={clsx('h-0.5 flex-1 -mt-5 mx-1', i < step ? 'bg-[--secondary]' : 'bg-[--outline-v]')} />
          )}
        </div>
      ))}
    </div>
  )
}

function CVPreview({ cv }: { cv: CVData }) {
  return (
    <div className="border border-[--outline-v] rounded-xl p-5 bg-white text-xs leading-relaxed">
      <div className="text-xl font-bold text-[--primary]">{cv.personal.full_name || 'Your Name'}</div>
      <div className="text-[--on-surf-v] mt-0.5 mb-0.5">
        {[cv.personal.email, cv.personal.phone, cv.personal.location].filter(Boolean).join(' · ')}
      </div>
      {cv.personal.linkedin && <div className="text-[--primary] text-xs">{cv.personal.linkedin}</div>}

      {cv.personal.summary && <>
        <div className="text-[10px] font-bold uppercase tracking-wider text-[--primary] border-b-2 border-[--primary] pb-1 mt-3 mb-2">Profile</div>
        <p className="text-[--on-surf-v] leading-relaxed">{cv.personal.summary}</p>
      </>}

      {cv.education.length > 0 && <>
        <div className="text-[10px] font-bold uppercase tracking-wider text-[--primary] border-b-2 border-[--primary] pb-1 mt-3 mb-2">Education</div>
        {cv.education.map((e, i) => (
          <div key={i} className="mb-1.5">
            <div className="font-bold text-[--on-bg]">{e.degree}{e.field ? ` – ${e.field}` : ''}</div>
            <div className="text-[--on-surf-v]">{e.institution} · {e.start_year}–{e.end_year}</div>
          </div>
        ))}
      </>}

      {cv.experience.length > 0 && <>
        <div className="text-[10px] font-bold uppercase tracking-wider text-[--primary] border-b-2 border-[--primary] pb-1 mt-3 mb-2">Work Experience</div>
        {cv.experience.map((e, i) => (
          <div key={i} className="mb-2">
            <div className="font-bold text-[--on-bg]">{e.title}</div>
            <div className="text-[--on-surf-v]">{e.company} · {e.start_date} – {e.is_current ? 'Present' : e.end_date}</div>
            {e.achievements && <p className="text-[--on-surf-v] mt-0.5">{e.achievements}</p>}
          </div>
        ))}
      </>}

      {cv.skills.length > 0 && <>
        <div className="text-[10px] font-bold uppercase tracking-wider text-[--primary] border-b-2 border-[--primary] pb-1 mt-3 mb-2">Skills</div>
        <div className="flex flex-wrap gap-1">
          {cv.skills.map((s, i) => <span key={i} className="tag tag-blue text-[10px]">{s}</span>)}
        </div>
      </>}

      {cv.certifications.length > 0 && <>
        <div className="text-[10px] font-bold uppercase tracking-wider text-[--primary] border-b-2 border-[--primary] pb-1 mt-3 mb-2">Certifications</div>
        {cv.certifications.map((c, i) => (
          <div key={i} className="text-[--on-surf-v]">{c.name} – {c.issuer} ({c.year})</div>
        ))}
      </>}
    </div>
  )
}

export function CVPage() {
  const { user } = useAuthStore()
  const [step, setStep] = useState(0)
  const [preview, setPreview] = useState(false)
  const [skillInput, setSkillInput] = useState('')
  const [skills, setSkills] = useState<string[]>(DEFAULT_CV.skills)

  const { register, control, watch, getValues, formState: { errors } } = useForm<CVData>({ defaultValues: DEFAULT_CV })
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control, name: 'education' })
  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control, name: 'experience' })
  const { fields: certFields, append: appendCert, remove: removeCert } = useFieldArray({ control, name: 'certifications' })
  const { fields: projFields, append: appendProj, remove: removeProj } = useFieldArray({ control, name: 'projects' })
  const { fields: refFields, append: appendRef, remove: removeRef } = useFieldArray({ control, name: 'references' })

  const cvData = { ...getValues(), skills }

  const handleSave = async () => {
    if (!user) return
    await supabase.from('cv_data').upsert({ user_id: user.id, data: cvData })
    toast.success('CV auto-saved ✓')
  }

  const handleNext = async () => {
    await handleSave()
    if (step < STEPS.length - 1) { setStep(step + 1); toast.success('Section saved!') }
    else setPreview(true)
  }

  const addSkill = (s: string) => {
    const trimmed = s.trim()
    if (trimmed && !skills.includes(trimmed)) { setSkills(prev => [...prev, trimmed]); setSkillInput('') }
  }

  if (preview) {
    return (
      <div className="p-4 animate-fade-in">
        <button className="flex items-center gap-1.5 text-sm font-semibold text-[--primary] mb-4 border-none bg-transparent cursor-pointer font-sans"
          onClick={() => setPreview(false)}>
          <ArrowLeft size={16} /> Back to Editor
        </button>
        <h2 className="text-lg font-bold mb-1">CV Preview</h2>
        <p className="text-xs text-[--on-surf-v] mb-4">ATS-optimised · Professional template · Ready to download</p>
        <CVPreview cv={cvData} />
        <div className="flex gap-2 mt-4">
          <button className="btn btn-primary flex-1 gap-1.5"
            onClick={() => { generateCVPDF(cvData); toast.success('Downloading CV…') }}>
            <Download size={15} /> Download PDF
          </button>
          <button className="btn btn-outline flex-1 gap-1.5"
            onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Share link copied!') }}>
            <Share2 size={15} /> Share CV
          </button>
        </div>
        <button className="btn btn-outline btn-full mt-2" onClick={() => setPreview(false)}>
          ← Edit CV
        </button>
      </div>
    )
  }

  return (
    <div className="p-4 animate-fade-in">
      <h1 className="text-xl font-bold text-[--primary] mb-1">Build Your CV</h1>
      <p className="text-sm text-[--on-surf-v] mb-5">Create an ATS-friendly professional CV in minutes.</p>
      <StepIndicator step={step} />

      {/* Step 0: Personal */}
      {step === 0 && (
        <div>
          <h3 className="text-base font-bold mb-4">Personal Information</h3>
          <div className="form-group mb-4">
            <label className="label">Full Name *</label>
            <input className="input" placeholder="e.g. Sibusiso Dlamini" {...register('personal.full_name', { required: true })} />
          </div>
          <div className="form-group mb-4">
            <label className="label">Email Address *</label>
            <input className="input" type="email" {...register('personal.email', { required: true })} />
          </div>
          <div className="form-group mb-4">
            <label className="label">Phone Number</label>
            <input className="input" placeholder="+268 7xxx xxxx" {...register('personal.phone')} />
          </div>
          <div className="form-group mb-4">
            <label className="label">Location</label>
            <input className="input" placeholder="City, Eswatini" {...register('personal.location')} />
          </div>
          <div className="form-group mb-4">
            <label className="label">LinkedIn URL</label>
            <input className="input" placeholder="linkedin.com/in/yourname" {...register('personal.linkedin')} />
          </div>
          <div className="form-group mb-4">
            <label className="label">Professional Summary</label>
            <textarea className="input" style={{ minHeight: 90, resize: 'vertical' }}
              placeholder="A concise overview of your professional background, key skills, and career goals…"
              {...register('personal.summary')} />
          </div>
        </div>
      )}

      {/* Step 1: Education */}
      {step === 1 && (
        <div>
          <h3 className="text-base font-bold mb-4">Education</h3>
          {eduFields.map((field, i) => (
            <div key={field.id} className="card mb-3">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold">Entry {i + 1}</span>
                {eduFields.length > 1 && (
                  <button type="button" onClick={() => removeEdu(i)} className="text-red-500 hover:text-red-700">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="form-group mb-3">
                <label className="label">Institution *</label>
                <input className="input" placeholder="University of Eswatini" {...register(`education.${i}.institution`, { required: true })} />
              </div>
              <div className="form-group mb-3">
                <label className="label">Degree / Qualification *</label>
                <input className="input" placeholder="BSc Computer Science" {...register(`education.${i}.degree`, { required: true })} />
              </div>
              <div className="form-group mb-3">
                <label className="label">Field of Study</label>
                <input className="input" placeholder="e.g. Software Engineering" {...register(`education.${i}.field`)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="form-group">
                  <label className="label">Start Year</label>
                  <input className="input" placeholder="2018" {...register(`education.${i}.start_year`)} />
                </div>
                <div className="form-group">
                  <label className="label">End Year</label>
                  <input className="input" placeholder="2022" {...register(`education.${i}.end_year`)} />
                </div>
              </div>
            </div>
          ))}
          <button type="button" className="btn btn-outline btn-sm gap-1.5"
            onClick={() => appendEdu({ institution: '', degree: '', field: '', start_year: '', end_year: '' })}>
            <Plus size={14} /> Add Education
          </button>
        </div>
      )}

      {/* Step 2: Experience */}
      {step === 2 && (
        <div>
          <h3 className="text-base font-bold mb-1">Work Experience</h3>
          <p className="text-sm text-[--on-surf-v] mb-4">Highlight your professional milestones and achievements.</p>
          {expFields.map((field, i) => (
            <div key={field.id} className="card mb-3">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold">Role {i + 1}</span>
                <button type="button" onClick={() => removeExp(i)} className="text-red-500"><Trash2 size={14} /></button>
              </div>
              <div className="form-group mb-3">
                <label className="label">Job Title *</label>
                <input className="input" placeholder="e.g. Senior Software Engineer" {...register(`experience.${i}.title`, { required: true })} />
              </div>
              <div className="form-group mb-3">
                <label className="label">Company *</label>
                <input className="input" placeholder="e.g. SwaziTech Solutions" {...register(`experience.${i}.company`, { required: true })} />
              </div>
              <div className="form-group mb-3">
                <label className="label">Location</label>
                <input className="input" placeholder="Mbabane, Eswatini" {...register(`experience.${i}.location`)} />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="form-group">
                  <label className="label">Start Date</label>
                  <input className="input" type="month" {...register(`experience.${i}.start_date`)} />
                </div>
                <div className="form-group">
                  <label className="label">End Date</label>
                  <input className="input" type="month" {...register(`experience.${i}.end_date`)} disabled={watch(`experience.${i}.is_current`)} />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm cursor-pointer mb-3">
                <input type="checkbox" {...register(`experience.${i}.is_current`)} /> I currently work here
              </label>
              <div className="form-group">
                <label className="label">Key Achievements</label>
                <textarea className="input" style={{ minHeight: 80, resize: 'vertical' }}
                  placeholder="Describe your impact and responsibilities. Use bullet points for clarity…"
                  {...register(`experience.${i}.achievements`)} />
              </div>
            </div>
          ))}
          <button type="button" className="btn btn-outline btn-sm gap-1.5 mb-4"
            onClick={() => appendExp({ title: '', company: '', location: '', start_date: '', end_date: '', is_current: false, achievements: '' })}>
            <Plus size={14} /> Add Another Role
          </button>

          <div className="card card-green">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={16} className="text-green-700" />
              <span className="text-sm font-bold text-green-800">Expert Tip</span>
            </div>
            <p className="text-xs text-green-800 leading-relaxed">
              Focus on <strong>quantifiable results</strong>. Instead of "Managed a team," try "Led a team of 5 to increase project delivery speed by 20%."
            </p>
          </div>
        </div>
      )}

      {/* Step 3: Skills + Certifications + Projects */}
      {step === 3 && (
        <div>
          <h3 className="text-base font-bold mb-1">Skills</h3>
          <p className="text-sm text-[--on-surf-v] mb-4">Add your technical and soft skills.</p>

          <div className="flex flex-wrap gap-2 mb-3">
            {skills.map((s, i) => (
              <div key={i} className="flex items-center gap-1 bg-[--surf-cont] rounded-full px-3 py-1 text-xs font-medium text-[--primary]">
                {s}
                <button type="button" onClick={() => setSkills(prev => prev.filter((_, j) => j !== i))}
                  className="text-red-400 hover:text-red-600 ml-0.5">×</button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 mb-4">
            <input className="input flex-1" placeholder="e.g. React, Python, Excel…"
              value={skillInput} onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput) } }} />
            <button type="button" className="btn btn-primary btn-sm" onClick={() => addSkill(skillInput)}>Add</button>
          </div>

          <div className="mb-5">
            <p className="text-xs font-semibold mb-2">Suggested skills:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_SKILLS.filter(s => !skills.includes(s)).map(s => (
                <button key={s} type="button" className="chip text-[11px]" onClick={() => addSkill(s)}>+ {s}</button>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <h3 className="text-base font-bold mb-3">Certifications</h3>
          {certFields.map((field, i) => (
            <div key={field.id} className="card mb-3">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold">Cert {i + 1}</span>
                <button type="button" onClick={() => removeCert(i)} className="text-red-500"><Trash2 size={14} /></button>
              </div>
              <div className="form-group mb-3"><label className="label">Certificate Name</label>
                <input className="input" {...register(`certifications.${i}.name`)} /></div>
              <div className="form-group mb-3"><label className="label">Issuing Organisation</label>
                <input className="input" {...register(`certifications.${i}.issuer`)} /></div>
              <div className="form-group"><label className="label">Year</label>
                <input className="input" placeholder="2024" {...register(`certifications.${i}.year`)} /></div>
            </div>
          ))}
          <button type="button" className="btn btn-outline btn-sm gap-1.5 mb-5"
            onClick={() => appendCert({ name: '', issuer: '', year: '' })}>
            <Plus size={14} /> Add Certification
          </button>

          {/* Projects */}
          <h3 className="text-base font-bold mb-3">Projects</h3>
          {projFields.map((field, i) => (
            <div key={field.id} className="card mb-3">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-semibold">Project {i + 1}</span>
                <button type="button" onClick={() => removeProj(i)} className="text-red-500"><Trash2 size={14} /></button>
              </div>
              <div className="form-group mb-3"><label className="label">Project Name</label>
                <input className="input" {...register(`projects.${i}.name`)} /></div>
              <div className="form-group mb-3"><label className="label">Description</label>
                <textarea className="input" style={{ minHeight: 60, resize: 'vertical' }} {...register(`projects.${i}.description`)} /></div>
              <div className="form-group mb-3"><label className="label">Project URL</label>
                <input className="input" placeholder="https://…" {...register(`projects.${i}.url`)} /></div>
              <div className="form-group"><label className="label">Technologies (comma-separated)</label>
                <input className="input" placeholder="React, Node.js, PostgreSQL" {...register(`projects.${i}.technologies.0`)} /></div>
            </div>
          ))}
          <button type="button" className="btn btn-outline btn-sm gap-1.5 mb-4"
            onClick={() => appendProj({ name: '', description: '', url: '', technologies: [] })}>
            <Plus size={14} /> Add Project
          </button>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-6">
        {step > 0 && (
          <button type="button" className="btn btn-outline gap-1.5" onClick={() => setStep(step - 1)}>
            <ArrowLeft size={15} /> Back
          </button>
        )}
        <button type="button" className="btn btn-primary flex-1 gap-1.5" onClick={handleNext}>
          {step < STEPS.length - 1
            ? <><span>Save & Next</span><ArrowRight size={15} /></>
            : <><Eye size={15} /><span>Preview CV</span></>
          }
        </button>
      </div>
    </div>
  )
}
