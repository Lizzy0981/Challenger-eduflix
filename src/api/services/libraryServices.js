import jsPDF from 'jspdf'

export const generatePDF = (data, type = 'stats') => {
  const doc = new jsPDF()
  
  if (type === 'stats') {
    generateStatsReport(doc, data)
  } else if (type === 'certificate') {
    generateCertificate(doc, data)
  }
  
  return doc
}

const generateStatsReport = (doc, data) => {
  // Encabezado
  doc.setFontSize(20)
  doc.text('Reporte de Aprendizaje - EduFlix', 20, 20)
  
  // Fecha
  doc.setFontSize(12)
  doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 20, 35)
  
  // Estadísticas generales
  doc.setFontSize(16)
  doc.text('Resumen General', 20, 50)
  
  doc.setFontSize(12)
  doc.text(`Tiempo total de aprendizaje: ${formatTime(data.totalMinutes)}`, 30, 65)
  doc.text(`Cursos completados: ${data.completedCourses}`, 30, 75)
  doc.text(`Progreso general: ${Math.round(data.totalProgress)}%`, 30, 85)
  
  // Progreso por categorías
  doc.setFontSize(16)
  doc.text('Progreso por Categorías', 20, 105)
  
  data.categoriesProgress.forEach((cat, index) => {
    doc.setFontSize(12)
    doc.text(`${cat.name}: ${Math.round(cat.progress)}%`, 30, 120 + (index * 10))
  })
  
  return doc
}

const generateCertificate = (doc, { courseName, completionDate, studentName }) => {
  // Diseño del certificado
  doc.setFontSize(30)
  doc.text('Certificado de Finalización', 105, 50, { align: 'center' })
  
  doc.setFontSize(16)
  doc.text('Este certificado acredita que', 105, 80, { align: 'center' })
  
  doc.setFontSize(24)
  doc.text(studentName, 105, 100, { align: 'center' })
  
  doc.setFontSize(16)
  doc.text('ha completado exitosamente el curso', 105, 120, { align: 'center' })
  
  doc.setFontSize(20)
  doc.text(courseName, 105, 140, { align: 'center' })
  
  doc.setFontSize(14)
  doc.text(`Fecha de finalización: ${completionDate}`, 105, 170, { align: 'center' })
  
  // Añadir logo y firma (ejemplo)
  doc.addImage('/logo.png', 'PNG', 85, 200, 40, 40)
  
  return doc
}

const formatTime = (minutes) => {
  const hours = Math.floor(minutes / 60)
  return hours > 0 
    ? `${hours}h ${minutes % 60}m`
    : `${minutes}m`
}

// Servicio de recomendaciones
export const generateRecommendations = (userData, allCourses) => {
  const recommendations = {
    basedOnHistory: [],
    basedOnProgress: [],
    trending: []
  }

  // Recomendaciones basadas en historial
  const userCategories = userData.viewHistory
    .map(id => allCourses.find(course => course.id === id))
    .map(course => course?.categoria)
    .filter(Boolean)

  const mostWatchedCategory = getMostFrequent(userCategories)

  recommendations.basedOnHistory = allCourses
    .filter(course => 
      course.categoria === mostWatchedCategory &&
      !userData.viewHistory.includes(course.id)
    )
    .slice(0, 4)

  // Recomendaciones basadas en progreso
  const inProgressCourses = allCourses.filter(course => {
    const progress = localStorage.getItem(`course_progress_${course.id}`)
    return progress && progress !== '100'
  })

  recommendations.basedOnProgress = inProgressCourses
    .sort((a, b) => {
      const progressA = localStorage.getItem(`course_progress_${a.id}`)
      const progressB = localStorage.getItem(`course_progress_${b.id}`)
      return parseInt(progressB) - parseInt(progressA)
    })
    .slice(0, 4)

  // Cursos populares/trending
  recommendations.trending = allCourses
    .sort((a, b) => (b.totalRatings || 0) - (a.totalRatings || 0))
    .slice(0, 4)

  return recommendations
}

const getMostFrequent = (arr) => {
  return arr.reduce(
    (acc, val) => {
      acc[val] = (acc[val] || 0) + 1
      if (acc[val] > acc.max) {
        acc.max = acc[val]
        acc.value = val
      }
      return acc
    },
    { max: 0, value: null }
  ).value
}