import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})

const sendEmail = async (to, subject, html) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error('Error sending email:', error)
    throw new Error('Error sending email')
  }
}

export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.API_URL}/auth/verify-email/${token}`
  
  const html = `
    <h1>Verifica tu correo electrónico</h1>
    <p>Haz clic en el siguiente enlace para verificar tu cuenta:</p>
    <a href="${verificationUrl}">Verificar email</a>
  `

  await sendEmail(email, 'Verifica tu cuenta de EduFlix', html)
}

export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${process.env.API_URL}/auth/reset-password/${token}`
  
  const html = `
    <h1>Restablecer contraseña</h1>
    <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace:</p>
    <a href="${resetUrl}">Restablecer contraseña</a>
    <p>Si no solicitaste esto, ignora este correo.</p>
  `

  await sendEmail(email, 'Restablecer contraseña de EduFlix', html)
}