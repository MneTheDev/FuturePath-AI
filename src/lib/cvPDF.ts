import jsPDF from 'jspdf'
import type { CVData } from '@/types'

export async function generateCVPDF(cv: CVData): Promise<void> {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })

  const margin = 20
  const pageW = 210
  const contentW = pageW - margin * 2
  let y = margin

  const primary = '#00355f'
  const textDark = '#0b1c30'
  const textMuted = '#42474f'

  // ── Header ──────────────────────────────────
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(primary)
  doc.text(cv.personal.full_name || 'Your Name', margin, y)
  y += 8

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(textMuted)
  const contactParts = [cv.personal.email, cv.personal.phone, cv.personal.location].filter(Boolean)
  doc.text(contactParts.join(' · '), margin, y)
  y += 4
  if (cv.personal.linkedin) {
    doc.text(cv.personal.linkedin, margin, y)
    y += 4
  }

  // divider
  doc.setDrawColor(primary)
  doc.setLineWidth(0.5)
  doc.line(margin, y, pageW - margin, y)
  y += 6

  // ── Section helper ───────────────────────────
  const section = (title: string) => {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(primary)
    doc.text(title.toUpperCase(), margin, y)
    y += 1
    doc.setLineWidth(0.3)
    doc.line(margin, y, pageW - margin, y)
    y += 5
  }

  const body = (text: string, indent = 0) => {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(textDark)
    const lines = doc.splitTextToSize(text, contentW - indent)
    doc.text(lines, margin + indent, y)
    y += lines.length * 4.5
  }

  const subtitle = (text: string) => {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9)
    doc.setTextColor(textMuted)
    doc.text(text, margin, y)
    y += 5
  }

  // ── Summary ──────────────────────────────────
  if (cv.personal.summary) {
    section('Professional Summary')
    body(cv.personal.summary)
    y += 3
  }

  // ── Education ────────────────────────────────
  if (cv.education.length > 0) {
    section('Education')
    cv.education.forEach(e => {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9.5)
      doc.setTextColor(textDark)
      doc.text(`${e.degree}${e.field ? ` – ${e.field}` : ''}`, margin, y)
      y += 5
      subtitle(`${e.institution} · ${e.start_year}–${e.end_year}`)
      y += 1
    })
    y += 2
  }

  // ── Experience ───────────────────────────────
  if (cv.experience.length > 0) {
    section('Work Experience')
    cv.experience.forEach(e => {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9.5)
      doc.setTextColor(textDark)
      doc.text(e.title, margin, y)
      y += 5
      subtitle(`${e.company}${e.location ? ` · ${e.location}` : ''} | ${e.start_date} – ${e.is_current ? 'Present' : e.end_date}`)
      if (e.achievements) {
        e.achievements.split('\n').filter(Boolean).forEach(line => {
          body(`• ${line.trim()}`, 2)
        })
      }
      y += 2
    })
  }

  // ── Skills ───────────────────────────────────
  if (cv.skills.length > 0) {
    section('Skills')
    body(cv.skills.join(' · '))
    y += 3
  }

  // ── Certifications ───────────────────────────
  if (cv.certifications.length > 0) {
    section('Certifications')
    cv.certifications.forEach(c => {
      body(`${c.name} – ${c.issuer} (${c.year})`)
    })
    y += 3
  }

  // ── Projects ─────────────────────────────────
  if (cv.projects.length > 0) {
    section('Projects')
    cv.projects.forEach(p => {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9.5)
      doc.setTextColor(textDark)
      doc.text(p.name, margin, y)
      y += 5
      if (p.technologies.length > 0) {
        subtitle(`Tech: ${p.technologies.join(', ')}`)
      }
      body(p.description)
      y += 2
    })
  }

  // ── References ───────────────────────────────
  if (cv.references.length > 0) {
    section('References')
    cv.references.forEach(r => {
      body(`${r.name} – ${r.title}, ${r.company} · ${r.email}`)
    })
  }

  doc.save(`${cv.personal.full_name.replace(/ /g, '_')}_CV.pdf`)
}
