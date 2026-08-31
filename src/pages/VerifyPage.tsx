import { useState } from 'react'
import { Download, Share2, Search, CheckCircle, XCircle } from 'lucide-react'
import { useCertificates } from '@/hooks/useCourses'
import { useCourses } from '@/hooks/useCourses'
import { useAuthStore } from '@/hooks/useAuthStore'
import { generateCertificatePDF } from '@/lib/certPDF'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'

// Static QR-like grid for visual representation
function QRGrid() {
  const pattern = [1,1,0,0,1,0,1,1,1,0,1,0,0,1,0,1,0,1,0,1,1,0,1,0,1,1,0,0,1,0,0,1,0,0,1,1,0,1,1,0,1,0,0,1,0,1,0,1,0,1,1,0,1,0,1,1,1,1,0,0,1,0,0,1]
  return (
    <div className="inline-block bg-white/15 rounded-lg p-2.5">
      <div className="text-[9px] text-white/70 text-center mb-1.5">QR Code</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 8px)', gap: 1 }}>
        {pattern.map((v, i) => (
          <div key={i} style={{ width: 8, height: 8, background: v ? 'rgba(255,255,255,0.9)' : 'transparent', borderRadius: 1 }} />
        ))}
      </div>
    </div>
  )
}

function CertCard({ cert, onDownload, onShare }: { cert: any; onDownload: () => void; onShare: () => void }) {
  return (
    <div className="bg-[--primary] text-white rounded-2xl p-6 text-center mb-3">
      <div className="text-3xl mb-2">🏅</div>
      <div className="text-[11px] font-bold tracking-widest opacity-75 mb-1">FUTUREPATH ESWATINI</div>
      <div className="text-[10px] opacity-60 mb-3">CERTIFICATE OF COMPLETION</div>
      <div className="font-serif text-xl font-semibold mb-1">{cert.course?.title ?? 'Course Certificate'}</div>
      <div className="text-xs opacity-75 mb-4">Issued: {cert.issued_at?.slice(0, 10)} · ID: {cert.certificate_uid}</div>

      <div className="flex justify-center mb-4">
        <QRGrid />
      </div>

      <div className="flex gap-2 justify-center">
        <button
          className="btn btn-sm gap-1.5"
          style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}
          onClick={onDownload}
        >
          <Download size={13} /> Download PDF
        </button>
        <button
          className="btn btn-sm gap-1.5"
          style={{ background: 'rgba(255,255,255,0.18)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)' }}
          onClick={onShare}
        >
          <Share2 size={13} /> Share
        </button>
      </div>
    </div>
  )
}

export function VerifyPage() {
  const { user } = useAuthStore()
  const { certs } = useCertificates(user?.id)
  const { courses, progress } = useCourses()
  const [verifyId, setVerifyId] = useState('')
  const [verifyResult, setVerifyResult] = useState<{ found: boolean; cert?: any } | null>(null)
  const [verifying, setVerifying] = useState(false)

  const handleVerify = async () => {
    if (!verifyId.trim()) { toast.error('Please enter a certificate ID'); return }
    setVerifying(true)
    // Check local certs first, then DB
    const local = certs.find(c => c.certificate_uid === verifyId.trim())
    if (local) { setVerifyResult({ found: true, cert: local }); setVerifying(false); return }
    try {
      const { data } = await supabase
        .from('certificates')
        .select('*, course:courses(title)')
        .eq('certificate_uid', verifyId.trim())
        .eq('is_revoked', false)
        .single()
      setVerifyResult(data ? { found: true, cert: data } : { found: false })
    } catch {
      setVerifyResult({ found: false })
    }
    setVerifying(false)
  }

  const handleDownload = (cert: any) => {
    generateCertificatePDF({
      userName: user?.full_name ?? 'Graduate',
      courseName: cert.course?.title ?? 'Course',
      issuedAt: cert.issued_at,
      certUID: cert.certificate_uid,
    })
    toast.success('Certificate downloading…')
  }

  const handleShare = (cert: any) => {
    const url = `${window.location.origin}/verify?id=${cert.certificate_uid}`
    navigator.clipboard.writeText(url)
    toast.success('Share link copied!')
  }

  const inProgress = courses.filter(c => (progress[c.id] ?? 0) > 0 && (progress[c.id] ?? 0) < 100)

  return (
    <div className="p-4 animate-fade-in">
      <h1 className="text-xl font-bold text-[--primary] mb-1">Certificates & Verify</h1>
      <p className="text-sm text-[--on-surf-v] mb-5">Your earned credentials and the public verification portal.</p>

      {certs.filter(c => !c.is_revoked).length === 0 && (
        <div className="card text-center py-8 mb-4">
          <div className="text-4xl mb-3">🎓</div>
          <p className="font-semibold text-[--on-surf-v]">No certificates yet</p>
          <p className="text-sm text-[--on-surf-v] mt-1">Complete a course to earn your first certificate!</p>
        </div>
      )}

      {certs.filter(c => !c.is_revoked).map(cert => (
        <CertCard
          key={cert.id}
          cert={cert}
          onDownload={() => handleDownload(cert)}
          onShare={() => handleShare(cert)}
        />
      ))}

      {/* Verify portal */}
      <div className="card mt-2">
        <h3 className="font-bold text-sm mb-1.5">Verify a Certificate</h3>
        <p className="text-xs text-[--on-surf-v] mb-3">
          Enter a certificate ID to verify its authenticity. Try: <strong className="text-[--primary]">FP-2024-WEB-001</strong>
        </p>
        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="e.g. FP-2024-WEB-001"
            value={verifyId}
            onChange={e => { setVerifyId(e.target.value); setVerifyResult(null) }}
            onKeyDown={e => e.key === 'Enter' && handleVerify()}
          />
          <button className="btn btn-primary btn-sm gap-1.5" onClick={handleVerify} disabled={verifying}>
            <Search size={13} /> {verifying ? '…' : 'Verify'}
          </button>
        </div>

        {verifyResult && (
          <div className={`mt-3 p-3 rounded-xl text-sm font-medium flex items-start gap-2 ${verifyResult.found ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {verifyResult.found
              ? <><CheckCircle size={16} className="flex-shrink-0 mt-0.5" /><div><strong>✓ Valid Certificate</strong><br />{verifyResult.cert?.course?.title} · Issued {verifyResult.cert?.issued_at?.slice(0, 10)}</div></>
              : <><XCircle size={16} className="flex-shrink-0 mt-0.5" /><div><strong>✗ Certificate not found</strong><br />This ID doesn't match any issued certificate.</div></>
            }
          </div>
        )}
      </div>

      {/* In-progress courses */}
      {inProgress.length > 0 && (
        <div className="card card-amber mt-3">
          <h3 className="font-bold text-sm mb-3">📚 In-Progress Courses</h3>
          {inProgress.map(c => (
            <div key={c.id} className="mb-3">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-semibold">{c.title}</span>
                <span className="text-xs text-amber-700 font-semibold">{progress[c.id]}%</span>
              </div>
              <div className="progress-bar" style={{ height: 4, margin: 0 }}>
                <div style={{ height: '100%', width: `${progress[c.id]}%`, background: '#d97706', borderRadius: 4, transition: 'width 0.5s' }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
