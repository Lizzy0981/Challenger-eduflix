import { jsPDF } from 'jspdf'

export const generatePDF = async (data, type) => {
  const doc = new jsPDF()

  if (type === 'certificate') {
    // Generar certificado
    doc.setFontSize(30)
    doc.text('Certificado de Finalización', 105, 40, { align: 'center' })
    
    doc.setFontSize(16)
    doc.text('Este certificado es otorgado a:', 105, 70, { align: 'center' })
    
    doc.setFontSize(24)
    doc.text(data.userName, 105, 90, { align: 'center' })
    
    doc.setFontSize(16)
    doc.text('Por completar exitosamente el curso:', 105, 110, { align: 'center' })
    
    doc.setFontSize(20)
    doc.text(data.courseName, 105, 130, { align: 'center' })
    
    doc.setFontSize(14)
    doc.text(`Fecha: ${new Date(data.completionDate).toLocaleDateString()}`, 105, 150, { align: 'center' })
  }

  return doc.output('arraybuffer')
}