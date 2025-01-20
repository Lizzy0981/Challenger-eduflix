import jwt from 'jsonwebtoken'
import User from '../models/User'
import { sendVerificationEmail, sendPasswordResetEmail } from '../utils/emailService'
import { createError } from '../middleware/errorHandler'

export const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      throw createError(400, 'El email ya está registrado')
    }

    // Crear nuevo usuario
    const user = new User({
      email,
      password,
      name
    })

    // Generar token de verificación
    const verificationToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    // Guardar usuario y enviar email de verificación
    await user.save()
    await sendVerificationEmail(user.email, verificationToken)

    res.status(201).json({
      message: 'Usuario registrado exitosamente. Por favor verifica tu email',
      userId: user._id
    })
  } catch (error) {
    next(error)
  }
}

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    // Buscar usuario y verificar contraseña
    const user = await User.findOne({ email })
    if (!user || !(await user.comparePassword(password))) {
      throw createError(401, 'Credenciales inválidas')
    }

    if (!user.isVerified) {
      throw createError(403, 'Por favor verifica tu email antes de iniciar sesión')
    }

    // Generar token de acceso
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    // Generar token de refresco
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: '30d' }
    )

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      token,
      refreshToken
    })
  } catch (error) {
    next(error)
  }
}

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    
    const user = await User.findById(decoded.userId)
    if (!user) {
      throw createError(404, 'Usuario no encontrado')
    }

    user.isVerified = true
    await user.save()

    res.status(200).json({
      message: 'Email verificado exitosamente'
    })
  } catch (error) {
    next(error)
  }
}

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body
    const user = await User.findOne({ email })
    
    if (!user) {
      throw createError(404, 'Usuario no encontrado')
    }

    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )

    await sendPasswordResetEmail(email, resetToken)

    res.status(200).json({
      message: 'Instrucciones para restablecer contraseña enviadas al email'
    })
  } catch (error) {
    next(error)
  }
}

export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params
    const { password } = req.body

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.userId)

    if (!user) {
      throw createError(404, 'Usuario no encontrado')
    }

    user.password = password
    await user.save()

    res.status(200).json({
      message: 'Contraseña actualizada exitosamente'
    })
  } catch (error) {
    next(error)
  }
}

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      throw createError(401, 'Token de refresco no proporcionado')
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
    const user = await User.findById(decoded.userId)

    if (!user) {
      throw createError(404, 'Usuario no encontrado')
    }

    const newToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(200).json({ token: newToken })
  } catch (error) {
    next(error)
  }
}

export const logout = async (req, res, next) => {
  try {
    // Aquí podrías invalidar el token en una lista negra si lo deseas
    res.status(200).json({ message: 'Sesión cerrada exitosamente' })
  } catch (error) {
    next(error)
  }
}

export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password')
      .populate('favorites')
      .populate('watchHistory.video')

    if (!user) {
      throw createError(404, 'Usuario no encontrado')
    }

    res.status(200).json({ user })
  } catch (error) {
    next(error)
  }
}

export const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar } = req.body
    const user = await User.findById(req.user.userId)

    if (!user) {
      throw createError(404, 'Usuario no encontrado')
    }

    if (name) user.name = name
    if (avatar) user.avatar = avatar

    await user.save()
    res.status(200).json({
      message: 'Perfil actualizado exitosamente',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      }
    })
  } catch (error) {
    next(error)
  }
}

export default {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  refreshToken,
  logout,
  getProfile,
  updateProfile
}