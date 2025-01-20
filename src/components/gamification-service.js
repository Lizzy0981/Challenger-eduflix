import axios from 'axios'
import { toast } from 'react-hot-toast'

const API_URL = 'https://eduflix-api.onrender.com/gamification'

const ACHIEVEMENTS = {
  COURSE_COMPLETE: {
    id: 'course_complete',
    name: 'Completador de Cursos',
    description: 'Completa tu primer curso',
    points: 100,
    icon: '🎓'
  },
  FIRST_REVIEW: {
    id: 'first_review',
    name: 'Crítico Inicial',
    description: 'Escribe tu primera reseña',
    points: 50,
    icon: '✍️'
  },
  STREAK_WEEK: {
    id: 'streak_week',
    name: 'Constancia Semanal',
    description: 'Estudia 7 días seguidos',
    points: 200,
    icon: '🔥'
  },
  SOCIAL_BUTTERFLY: {
    id: 'social_butterfly',
    name: 'Mariposa Social',
    description: 'Comparte 5 cursos con otros',
    points: 150,
    icon: '🦋'
  },
  KNOWLEDGE_SEEKER: {
    id: 'knowledge_seeker',
    name: 'Buscador del Conocimiento',
    description: 'Completa cursos en 3 categorías diferentes',
    points: 300,
    icon: '📚'
  }
}

const LEVELS = [
  { level: 1, name: 'Principiante', pointsNeeded: 0 },
  { level: 2, name: 'Estudiante', pointsNeeded: 500 },
  { level: 3, name: 'Aprendiz', pointsNeeded: 1000 },
  { level: 4, name: 'Experto', pointsNeeded: 2000 },
  { level: 5, name: 'Maestro', pointsNeeded: 5000 }
]

class GamificationService {
  async addPoints(userId, points, action) {
    try {
      const response = await axios.post(`${API_URL}/points`, {
        userId,
        points,
        action
      })
      
      if (response.data.levelUp) {
        toast.success(`¡Felicidades! Has alcanzado el nivel ${response.data.newLevel}`)
      }
      
      return response.data
    } catch (error) {
      console.error('Error al añadir puntos:', error)
    }
  }

  async checkAchievements(userId) {
    try {
      const response = await axios.get(`${API_URL}/achievements/check/${userId}`)
      const newAchievements = response.data.newAchievements
      
      if (newAchievements.length > 0) {
        newAchievements.forEach(achievement => {
          toast.success(`¡Nuevo logro desbloqueado: ${achievement.name}!`, {
            icon: achievement.icon
          })
        })
      }
      
      return newAchievements
    } catch (error) {
      console.error('Error al verificar logros:', error)
    }
  }

  async getUserStats(userId) {
    try {
      const response = await axios.get(`${API_URL}/stats/${userId}`)
      return response.data
    } catch (error) {
      console.error('Error al obtener estadísticas:', error)
      throw error
    }
  }

  async updateStreak(userId) {
    try {
      const response = await axios.post(`${API_URL}/streak/${userId}`)
      
      if (response.data.achievementUnlocked) {
        toast.success('¡Felicidades! Has mantenido tu racha de estudio')
      }
      
      return response.data
    } catch (error) {
      console.error('Error al actualizar racha:', error)
    }
  }

  async getLeaderboard() {
    try {
      const response = await axios.get(`${API_URL}/leaderboard`)
      return response.data
    } catch (error) {
      console.error('Error al obtener tabla de clasificación:', error)
      throw error
    }
  }

  calculateLevel(points) {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (points >= LEVELS[i].pointsNeeded) {
        return LEVELS[i]
      }
    }
    return LEVELS[0]
  }

  getNextLevel(points) {
    const currentLevel = this.calculateLevel(points)
    const nextLevelIndex = LEVELS.findIndex(level => level.level === currentLevel.level) + 1
    
    if (nextLevelIndex < LEVELS.length) {
      const nextLevel = LEVELS[nextLevelIndex]
      const pointsNeeded = nextLevel.pointsNeeded - points
      return {
        nextLevel,
        pointsNeeded
      }
    }
    
    return null
  }

  async getAchievements(userId) {
    try {
      const response = await axios.get(`${API_URL}/achievements/${userId}`)
      return response.data
    } catch (error) {
      console.error('Error al obtener logros:', error)
      throw error
    }
  }

  getAvailableAchievements() {
    return Object.values(ACHIEVEMENTS)
  }
}

export const gamificationService = new GamificationService()