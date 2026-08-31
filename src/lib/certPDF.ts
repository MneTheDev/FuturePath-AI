import jsPDF from 'jspdf'
import QRCode from 'qrcode'

interface CertData {
  userName: string
  courseName: string
  issuedAt: string
  certUID: string
}

export async function generateCertificatePDF(cert: CertData): Promise<void> {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const W = 297
  const H = 210

  // Background
  doc.setFillColor(0, 53, 95)
  doc.rect(0, 0, W, H, 'F')

  // Inner white rectangle
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(12, 12, W - 24, H - 24, 5, 5, 'F')

  // Gold top border stripe
  doc.setFillColor(255, 185, 95)
  doc.rect(12, 12, W - 24, 6, 'F')

  // Logo area
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(0, 53, 95)
  doc.text('FUTUREPATH ESWATINI', W / 2, 35, { align: 'center' })

  // Title
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(100, 100, 100)
  doc.text('CERTIFICATE OF COMPLETION', W / 2, 43, { align: 'center' })

  // Decorative line
  doc.setDrawColor(0, 108, 73)
  doc.setLineWidth(0.8)
  doc.line(60, 47, W - 60, 47)

  // Presented to
  doc.setFontSize(11)
  doc.setTextColor(80, 80, 80)
  doc.text('This is to certify that', W / 2, 60, { align: 'center' })

  // Name
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(28)
  doc.setTextColor(0, 53, 95)
  doc.text(cert.userName, W / 2, 78, { align: 'center' })

  // Underline
  doc.setDrawColor(255, 185, 95)
  doc.setLineWidth(1.5)
  const nameW = doc.getTextWidth(cert.userName)
  doc.line(W / 2 - nameW / 2, 81, W / 2 + nameW / 2, 81)

  // Has successfully completed
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.setTextColor(80, 80, 80)
  doc.text('has successfully completed the course', W / 2, 93, { align: 'center' })

  // Course name
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(18)
  doc.setTextColor(0, 108, 73)
  doc.text(cert.courseName, W / 2, 106, { align: 'center' })

  // Date
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(80, 80, 80)
  const dateFormatted = new Date(cert.issuedAt).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  })
  doc.text(`Issued: ${dateFormatted}`, W / 2, 118, { align: 'center' })

  // Divider
  doc.setDrawColor(200, 200, 200)
  doc.setLineWidth(0.3)
  doc.line(60, 124, W - 60, 124)

  // Signature line
  doc.setFontSize(9)
  doc.setTextColor(100, 100, 100)
  doc.text('FuturePath Eswatini', 90, 145, { align: 'center' })
  doc.line(55, 137, 125, 137)
  doc.text('Director of Learning', 90, 150, { align: 'center' })

  // Certificate ID
  doc.setFontSize(8)
  doc.setTextColor(120, 120, 120)
  doc.text(`Certificate ID: ${cert.certUID}`, W / 2, 160, { align: 'center' })

  // QR Code
  try {
    const verifyUrl = `${window.location.origin}/verify?id=${cert.certUID}`
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, { width: 80, margin: 1 })
    doc.addImage(qrDataUrl, 'PNG', W - 65, 125, 35, 35)
    doc.setFontSize(7)
    doc.setTextColor(120, 120, 120)
    doc.text('Scan to verify', W - 47.5, 163, { align: 'center' })
  } catch {}

  doc.save(`${cert.courseName.replace(/ /g, '_')}_Certificate_${cert.certUID}.pdf`)
}
