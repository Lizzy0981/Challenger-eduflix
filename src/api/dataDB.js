import axios from 'axios'

const dataDB = axios.create({
  baseURL: 'https://eduflix-api.onrender.com'
})

// Endpoints originales
export const getVideos = () => dataDB.get('/videos')
export const createVideo = (video) => dataDB.post('/videos', video)
export const updateVideo = (id, video) => dataDB.put(`/videos/${id}/`, video)
export const deleteVideo = (id) => dataDB.delete(`/videos/${id}`)
export const getVideo = (id) => dataDB.get(`/videos/${id}`)
export const filterVideos = (search) => dataDB.get(`/videos?q=${search}`)

export const getCategorias = () => dataDB.get('/categorias')
export const getCategoria = (id) => dataDB.get(`/categorias/${id}`)
export const createCategoria = (categoria) => dataDB.post('/categorias', categoria)
export const updateCategoria = (id, categoria) => dataDB.put(`/categorias/${id}`, categoria)
export const deleteCategoria = (id) => dataDB.delete(`/categorias/${id}`)

// Nuevos endpoints
export const saveCertificate = async (pdfData) => {
  const formData = new FormData()
  formData.append('file', pdfData)
  const response = await dataDB.post('/certificates', formData)
  return response.data.url
}

export const updateUserStats = async (stats) => {
  return dataDB.post('/user-stats', stats)
}

export const getUserProgress = async (userId) => {
  return dataDB.get(`/progress/${userId}`)
}

export const updateProgress = async (videoId, progress) => {
  return dataDB.post('/progress', { videoId, progress })
}

export const getRecommendations = async (userId) => {
  return dataDB.get(`/recommendations/${userId}`)
}

// Interceptores
dataDB.interceptors.request.use(
  (config) => {
    // Aquí podrías agregar token de autenticación si es necesario
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

dataDB.interceptors.response.use(
  (response) => response,
  (error) => {
    // Manejar errores comunes
    if (error.response) {
      switch (error.response.status) {
        case 401:
          // Manejar error de autenticación
          break
        case 403:
          // Manejar error de autorización
          break
        case 404:
          // Manejar error de recurso no encontrado
          break
        default:
          // Manejar otros errores
          break
      }
    }
    return Promise.reject(error)
  }
)

export default dataDB