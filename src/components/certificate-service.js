import { jsPDF } from 'jspdf'
import axios from 'axios'
import { toast } from 'react-hot-toast'

const API_URL = 'https://eduflix-api.onrender.com/certificates'

class CertificateService {
  async generateCertificate(courseData, userData) {
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      })

      // Configurar diseño del certificado
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(30)
      doc.text('Certificado de Finalización', 148.5, 50, { align: 'center' })

      // Logo
      const logo = await this.getImage('/logo.png')
      doc.addImage(logo, 'PNG', 128.5, 20, 40, 40)

      // Contenido del certificado
      doc.setFontSize(16)
      doc.setFont('helvetica', 'normal')
      doc.text('Este certificado se otorga a:', 148.5, 80, { align: 'center' })

      doc.setFontSize(24)
      doc.setFont('helvetica', 'bold')
      doc.text(userData.name, 148.5, 100, { align: 'center' })

      doc.setFontSize(16)
      doc.setFont('helvetica', 'normal')
      doc.text('Por haber completado exitosamente el curso:', 148.5, 120, { align: 'center' })

      doc.setFontSize(20)
      doc.setFont('helvetica', 'bold')
      doc.text(courseData.title, 148.5, 140, { align: 'center' })

      // Fecha y código
      const date = new Date().toLocaleDateString()
      const certificateId = this.generateCertificateId(courseData.id, userData.id)

      doc.setFontSize(12)
      doc.setFont('helvetica', 'normal')
      doc.text(`Fecha de emisión: ${date}`, 148.5, 160, { align: 'center' })
      doc.text(`Certificado ID: ${certificateId}`, 148.5, 170, { align: 'center' })

      // Firma digital
      doc.setFontSize(10)
      doc.text('Este certificado es válido digitalmente y puede ser verificado en eduflix.com/verify', 148.5, 180, { align: 'center' })

      // Guardar certificado
      const pdfBlob = doc.output('blob')
      const certificateData = {
        userId: userData.id,
        courseId: courseData.id,
        certificateId,
        date,
        pdf: pdfBlob
      }

      // Enviar al servidor
      const formData = new FormData()
      Object.keys(certificateData).forEach(key => {
        formData.append(key, certificateData[key])
      })

      const response = await axios.post(API_URL, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      toast.success('Certificado generado exitosamente')
      return response.data.url

    } catch (error) {
      toast.error('Error al generar el certificado')
      throw error
    }
  }

  async verifyCertificate(certificateId) {
    try {
      const response = await axios.get(`${API_URL}/verify/${certificateId}`)
      return response.data
    } catch (error) {
      toast.error('Error al verificar el certificado')
      throw error
    }
  }

  async getUserCertificates(userId) {
    try {
      const response = await axios.get(`${API_URL}/user/${userId}`)
      return response.data
    } catch (error) {
      toast.error('Error al obtener los certificados')
      throw error
    }
  }

  async downloadCertificate(certificateId) {
    try {
      const response = await axios.get(`${API_URL}/download/${certificateId}`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `certificate-${certificateId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      toast.success('Certificado descargado exitosamente')
    } catch (error) {
      toast.error('Error al descargar el certificado')
      throw error
    }
  }

  generateCertificateId(courseId, userId) {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substr(2, 5)
    return `EDU-${courseId}-${userId}-${timestamp}-${random}`.toUpperCase()
  }

  async getImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = url
    })
  }
}

export const certificateService = new CertificateService()