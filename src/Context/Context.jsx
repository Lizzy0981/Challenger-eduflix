import { createContext, useEffect, useRef, useState } from 'react'
import { PropTypes } from 'prop-types'
import * as Yup from 'yup'
import { toast } from 'react-hot-toast'

// Servicios
import {
  getVideos,
  getCategorias,
  createVideo,
  updateVideo,
  deleteVideo,
  createCategoria,
  updateCategoria,
  deleteCategoria,
  filterVideos,
  saveCertificate,
  updateUserStats
} from '../api/dataDB'

import { 
  generatePDF, 
  generateRecommendations 
} from '../api/services/libraryServices'

export const VideosContext = createContext()

export const VideosProvider = ({ children }) => {
  // Estados base
  const ref = useRef(null)
  const [videos, setVideos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [item, setItem] = useState(null)
  const [itemCat, setItemCat] = useState(null)
  const [search, setSearch] = useState('')
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Estados de características
  const [favorites, setFavorites] = useState([])
  const [viewHistory, setViewHistory] = useState([])
  const [certificates, setCertificates] = useState([])
  const [notifications, setNotifications] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [userStats, setUserStats] = useState({
    totalMinutes: 0,
    completedCourses: 0,
    totalProgress: 0,
    categoriesProgress: []
  })

  // Cargar datos iniciales
  useEffect(() => {
    loadStoredData()
    fetchInitialData()
  }, [])

  const loadStoredData = () => {
    try {
      const storedData = {
        favorites: localStorage.getItem('eduflix_favorites'),
        history: localStorage.getItem('eduflix_history'),
        certificates: localStorage.getItem('eduflix_certificates')
      }

      if (storedData.favorites) setFavorites(JSON.parse(storedData.favorites))
      if (storedData.history) setViewHistory(JSON.parse(storedData.history))
      if (storedData.certificates) setCertificates(JSON.parse(storedData.certificates))
    } catch (error) {
      console.error('Error loading stored data:', error)
      toast.error('Error al cargar datos guardados')
    }
  }

  const fetchInitialData = async () => {
    try {
      setLoading(true)
      const [videosRes, categoriasRes] = await Promise.all([
        getVideos(),
        getCategorias()
      ])
      setVideos(videosRes.data)
      setCategorias(categoriasRes.data)
      updateRecommendations(videosRes.data)
    } catch (error) {
      console.error('Error fetching initial data:', error)
      toast.error('Error al cargar los datos iniciales')
      setError(error)
    } finally {
      setLoading(false)
    }
  }

  // Gestión de videos
  const toggleFavorite = (videoId) => {
    setFavorites(prev => {
      const isFavorite = prev.includes(videoId)
      const newFavorites = isFavorite 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
      
      localStorage.setItem('eduflix_favorites', JSON.stringify(newFavorites))
      
      toast.success(isFavorite 
        ? 'Eliminado de favoritos'
        : 'Añadido a favoritos'
      )

      return newFavorites
    })
  }

  const addToHistory = (videoId) => {
    setViewHistory(prev => {
      const newHistory = [videoId, ...prev.filter(id => id !== videoId)]
      localStorage.setItem('eduflix_history', JSON.stringify(newHistory))
      return newHistory
    })
  }

  const clearHistory = () => {
    setViewHistory([])
    localStorage.removeItem('eduflix_history')
    toast.success('Historial limpiado')
  }

  const getFavoriteVideos = () => {
    return videos.filter(video => favorites.includes(video.id))
  }

  const getHistoryVideos = () => {
    return viewHistory
      .map(id => videos.find(video => video.id === id))
      .filter(Boolean)
  }

  // Gestión de certificados
  const generateCertificate = async (videoId, userName) => {
    try {
      const video = videos.find(v => v.id === videoId)
      if (!video) throw new Error('Video no encontrado')

      const certificateData = {
        courseName: video.titulo,
        completionDate: new Date().toLocaleDateString(),
        studentName: userName
      }

      const pdf = generatePDF(certificateData, 'certificate')
      const certificateUrl = await saveCertificate(pdf)

      setCertificates(prev => {
        const newCertificates = [...prev, { 
          videoId, 
          url: certificateUrl, 
          date: new Date() 
        }]
        localStorage.setItem('eduflix_certificates', JSON.stringify(newCertificates))
        return newCertificates
      })

      addNotification({
        type: 'achievement',
        title: '¡Nuevo certificado!',
        message: `Has obtenido un certificado por completar ${video.titulo}`
      })

      return certificateUrl
    } catch (error) {
      console.error('Error generating certificate:', error)
      toast.error('Error al generar el certificado')
      return null
    }
  }

  // Sistema de notificaciones
  const addNotification = (notification) => {
    setNotifications(prev => [
      {
        id: Date.now(),
        timestamp: new Date(),
        read: false,
        ...notification
      },
      ...prev
    ])
  }

  // Gestión de estadísticas
  const updateUserStatistics = async () => {
    try {
      const stats = calculateUserStats()
      setUserStats(stats)
      await updateUserStats(stats)
      return stats
    } catch (error) {
      console.error('Error updating user stats:', error)
      toast.error('Error al actualizar estadísticas')
      return null
    }
  }

  const calculateUserStats = () => {
    const completedCourses = videos.filter(video => {
      const progress = localStorage.getItem(`course_progress_${video.id}`)
      return progress === '100'
    }).length

    const totalMinutes = videos.reduce((total, video) => {
      const progress = localStorage.getItem(`course_progress_${video.id}`)
      if (progress) {
        return total + (video.duracion * parseInt(progress) / 100)
      }
      return total
    }, 0)

    const categoriesProgress = categorias.map(categoria => {
      const categoryVideos = videos.filter(v => v.categoria === categoria.nombre)
      const completedInCategory = categoryVideos.filter(video => {
        const progress = localStorage.getItem(`course_progress_${video.id}`)
        return progress === '100'
      }).length
      
      return {
        name: categoria.nombre,
        progress: (completedInCategory / categoryVideos.length) * 100 || 0,
        color: categoria.color
      }
    })

    const totalProgress = videos.reduce((sum, video) => {
      const progress = localStorage.getItem(`course_progress_${video.id}`) || '0'
      return sum + parseInt(progress)
    }, 0) / videos.length

    return {
      completedCourses,
      totalMinutes,
      categoriesProgress,
      totalProgress
    }
  }

  // Actualizar recomendaciones
  const updateRecommendations = (currentVideos = videos) => {
    const recommendations = generateRecommendations(
      { viewHistory, favorites },
      currentVideos
    )
    setRecommendations(recommendations)
  }

  // Exportar estadísticas
  const exportStatistics = async () => {
    try {
      const stats = calculateUserStats()
      const pdf = generatePDF(stats, 'stats')
      const blob = pdf.output('blob')
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = 'eduflix-estadisticas.pdf'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast.success('Estadísticas exportadas correctamente')
    } catch (error) {
      console.error('Error exporting stats:', error)
      toast.error('Error al exportar estadísticas')
    }
  }

  // Búsqueda y filtrado
  useEffect(() => {
    const filterData = async () => {
      try {
        if (search.length === 0) {
          setData([])
          return
        }

        const res = await filterVideos(search)
        setData(res.data)
        
        if (res.data.length === 0) {
          toast.error('No se encontraron videos')
        }
      } catch (error) {
        console.error('Error filtering videos:', error)
        toast.error('Error al filtrar los videos')
      }
    }

    filterData()
  }, [search])

  // Esquemas de validación
  const initialValues1 = {
    titulo: '',
    linkVideo: '',
    linkImage: '',
    categoria: '',
    descripcion: '',
    codigoSeguridad: ''
  }

  const validationSchema1 = Yup.object({
    titulo: Yup.string().required('El titulo es obligatorio'),
    linkVideo: Yup.string()
      .url('Debe ser una URL válida')
      .required('El link del video es obligatorio'),
    linkImage: Yup.string()
      .url('Debe ser una URL válida')
      .required('El link de la imagen es obligatorio'),
    categoria: Yup.string().required('La categoria es obligatoria'),
    descripcion: Yup.string()
      .min(10, 'La descripción debe tener al menos 10 caracteres')
      .required('La descripcion es obligatoria'),
    codigoSeguridad: Yup.string().required('El codigo de seguridad es obligatorio')
  })

  const initialValues2 = {
    nombre: '',
    descripcion: '',
    color: '',
    codigoSeguridad: ''
  }

  const validationSchema2 = Yup.object({
    nombre: Yup.string().required('El nombre es obligatorio'),
    descripcion: Yup.string()
      .min(10, 'La descripción debe tener al menos 10 caracteres')
      .required('La descripcion es obligatoria'),
    color: Yup.string().required('El color es obligatorio'),
    codigoSeguridad: Yup.string().required('El codigo de seguridad es obligatorio')
  })

  // CRUD Videos
  const createUpdateVideo = async (values) => {
    try {
      setLoading(true)
      if (item === null) {
        await createVideo(values)
        const res = await getVideos()
        setVideos(res.data)
        toast.success('Video creado correctamente')
      } else {
        await updateVideo(item.id, values)
        const res = await getVideos()
        setVideos(res.data)
        toast.success('Video actualizado correctamente')
      }
    } catch (error) {
      console.error('Error creating/updating video:', error)
      toast.error('Error al procesar el video')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (e) => {
    try {
      const row = e.target.closest('tr')
      const id = row.cells[0].textContent
      await deleteVideo(id)
      const res = await getVideos()
      setVideos(res.data)
      toast.success('Video eliminado correctamente')
    } catch (error) {
      console.error('Error deleting video:', error)
      toast.error('Error al eliminar el video')
    }
  }

  // CRUD Categorías
  const createUpdateCategoria = async (values) => {
    try {
      setLoading(true)
      if (itemCat === null) {
        await createCategoria(values)
        const res = await getCategorias()
        setCategorias(res.data)
        toast.success('Categoría creada correctamente')
      } else {
        await updateCategoria(itemCat.id, values)
        const res = await getCategorias()
        setCategorias(res.data)
        toast.success('Categoría actualizada correctamente')
      }
    } catch (error) {
      console.error('Error creating/updating category:', error)
      toast.error('Error al procesar la categoría')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCategoria = async (e) => {
    try {
      const row = e.target.closest('tr')
      const id = row.cells[0].textContent
      await deleteCategoria(id)
      const res = await getCategorias()
      setCategorias(res.data)
      toast.success('Categoría eliminada correctamente')
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('Error al eliminar la categoría')
    }
  }

  // Valor del contexto
  const value = {
    // Estados base
    videos,
    categorias,
    loading,
    error,
    search,
    data,
    ref,
    
    // Estados de edición
    item,
    itemCat,
    
    // Setters
    setItem,
    setItemCat,
    setSearch,
    
    // Gestión de videos
    favorites,
    toggleFavorite,
    viewHistory,
    addToHistory,
    clearHistory,
    getFavoriteVideos,
    getHistoryVideos,
    
    // Certificados
    certificates,
    generateCertificate,
    
    // Notificaciones
    notifications,
    addNotification,
    
    // Recomendaciones
    recommendations,
    
    // Estadísticas
    userStats,
    exportStatistics,
    updateUserStatistics,
    
    // Formularios
    initialValues1,
    validationSchema1,
    initialValues2,
    validationSchema2,
    
    // CRUD
    createUpdateVideo,
    handleDelete,
    createUpdateCategoria,
    handleDeleteCategoria
  }

  return (
    <VideosContext.Provider value={value}>
      {children}
    </VideosContext.Provider>
  )
}

VideosProvider.propTypes = {
  children: PropTypes.node.isRequired
}

export default VideosProvider
