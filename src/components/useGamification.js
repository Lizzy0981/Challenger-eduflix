import { useState, useEffect, createContext, useContext } from 'react'
import { gamificationService } from '../components/gamification-service'
import { useAuth } from '../components/useAuth'

const GamificationContext = createContext(null)

export function GamificationProvider({ children }) {
  const { user } = useAuth()
  const [userStats, setUserStats] = useState(null)
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (user) {
      loadUserStats()
      loadAchievements()
    }
  }, [user])

  const loadUserStats = async () => {
    try {
      const stats = await gamificationService.getUserStats(user.id)
      setUserStats(stats)
    } catch (err) {
      setError(err)
    }
  }

  const loadAchievements = async () => {
    try {
      const userAchievements = await gamificationService.getAchievements(user.id)
      setAchievements(userAchievements)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  const addPoints = async (points, action) => {
    if (!user) return

    try {
      const result = await gamificationService.addPoints(user.id, points, action)
      setUserStats(prev => ({
        ...prev,
        points: (prev?.points || 0) + points,
        level: result.newLevel || prev?.level
      }))
      return result
    } catch (err) {
      setError(err)
    }
  }

  const checkAchievements = async () => {
    if (!user) return

    try {
      const newAchievements = await gamificationService.checkAchievements(user.id)
      if (newAchievements?.length > 0) {
        setAchievements(prev => [...prev, ...newAchievements])
      }
      return newAchievements
    } catch (err) {
      setError(err)
    }
  }

  const updateStreak = async () => {
    if (!user) return

    try {
      const result = await gamificationService.updateStreak(user.id)
      setUserStats(prev => ({
        ...prev,
        currentStreak: result.currentStreak,
        maxStreak: result.maxStreak
      }))
      return result
    } catch (err) {
      setError(err)
    }
  }

  const getLevel = () => {
    if (!userStats?.points) return null
    return gamificationService.calculateLevel(userStats.points)
  }

  const getNextLevel = () => {
    if (!userStats?.points) return null
    return gamificationService.getNextLevel(userStats.points)
  }

  const value = {
    userStats,
    achievements,
    loading,
    error,
    addPoints,
    checkAchievements,
    updateStreak,
    getLevel,
    getNextLevel,
    availableAchievements: gamificationService.getAvailableAchievements()
  }

  return (
    <GamificationContext.Provider value={value}>
      {children}
    </GamificationContext.Provider>
  )
}

export function useGamification() {
  const context = useContext(GamificationContext)
  if (!context) {
    throw new Error('useGamification debe ser usado dentro de un GamificationProvider')
  }
  return context
}
