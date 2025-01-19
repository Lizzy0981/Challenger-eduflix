import { 
  Box, 
  Typography, 
  IconButton, 
  Grid,
  Container,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material'
import { styled } from '@mui/material/styles'
import { colorWhite, colorPrimary } from '../../UI/variablesStyle'
import { Link } from 'react-router-dom'
import TwitterIcon from '@mui/icons-material/Twitter'
import LinkedInIcon from '@mui/icons-material/LinkedIn'
import GitHubIcon from '@mui/icons-material/GitHub'
import FacebookIcon from '@mui/icons-material/Facebook'
import { animations } from '../UI/animations'

const FooterBox = styled(Box)(({ theme }) => ({
  background: 'rgba(0, 0, 0, 0.9)',
  color: colorWhite,
  padding: '4rem 0 2rem 0',
  marginTop: 'auto',
  ${animations.fadeIn}
}))

const FooterContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem'
}))

const FooterGrid = styled(Grid)(({ theme }) => ({
  marginBottom: '2rem'
}))

const FooterLogo = styled('img')(({ theme }) => ({
  height: '40px',
  marginBottom: '1rem'
}))

const FooterTitle = styled(Typography)(({ theme }) => ({
  color: colorPrimary,
  fontWeight: 'bold',
  marginBottom: '1rem'
}))

const FooterLink = styled(Link)(({ theme }) => ({
  color: colorWhite,
  textDecoration: 'none',
  transition: 'color 0.3s ease',
  '&:hover': {
    color: colorPrimary
  }
}))

const SocialIcons = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: '1rem',
  marginTop: '1rem'
}))

const SocialIconButton = styled(IconButton)(({ theme }) => ({
  color: colorWhite,
  transition: 'all 0.3s ease',
  '&:hover': {
    color: colorPrimary,
    transform: 'translateY(-3px)'
  }
}))

const Copyright = styled(Typography)(({ theme }) => ({
  textAlign: 'center',
  opacity: 0.7,
  marginTop: '2rem'
}))

function Footer() {
  const year = new Date().getFullYear()

  const footerSections = {
    learn: {
      title: 'Aprendizaje',
      items: [
        { text: 'Cursos', path: '/videos' },
        { text: 'Categorías', path: '/categorias' },
        { text: 'Biblioteca', path: '/biblioteca' },
        { text: 'Instructores', path: '/instructores' }
      ]
    },
    about: {
      title: 'Acerca de',
      items: [
        { text: 'Nosotros', path: '/about' },
        { text: 'Blog', path: '/blog' },
        { text: 'Carreras', path: '/careers' },
        { text: 'Contacto', path: '/contact' }
      ]
    },
    legal: {
      title: 'Legal',
      items: [
        { text: 'Términos', path: '/terms' },
        { text: 'Privacidad', path: '/privacy' },
        { text: 'Cookies', path: '/cookies' },
        { text: 'Licencias', path: '/licenses' }
      ]
    }
  }

  const socialLinks = [
    { icon: <TwitterIcon />, url: 'https://twitter.com/eduflix' },
    { icon: <LinkedInIcon />, url: 'https://linkedin.com/company/eduflix' },
    { icon: <GitHubIcon />, url: 'https://github.com/eduflix' },
    { icon: <FacebookIcon />, url: 'https://facebook.com/eduflix' }
  ]

  return (
    <FooterBox component="footer">
      <FooterContainer maxWidth="lg">
        <FooterGrid container spacing={4}>
          <Grid item xs={12} md={4}>
            <FooterLogo src="/logo.png" alt="EduFlix" />
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
              Transformando el aprendizaje digital a través de contenido educativo de calidad.
            </Typography>
            <SocialIcons>
              {socialLinks.map((social, index) => (
                <SocialIconButton
                  key={index}
                  component="a"
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.icon}
                </SocialIconButton>
              ))}
            </SocialIcons>
          </Grid>

          {Object.entries(footerSections).map(([key, section]) => (
            <Grid item xs={12} sm={6} md={2} key={key}>
              <FooterTitle variant="h6">
                {section.title}
              </FooterTitle>
              <List>
                {section.items.map((item, index) => (
                  <ListItem key={index} sx={{ p: 0, mb: 1 }}>
                    <ListItemText>
                      <FooterLink to={item.path}>
                        {item.text}
                      </FooterLink>
                    </ListItemText>
                  </ListItem>
                ))}
              </List>
            </Grid>
          ))}
        </FooterGrid>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)' }} />

        <Copyright variant="body2">
          © {year} EduFlix. Todos los derechos reservados.
        </Copyright>
      </FooterContainer>
    </FooterBox>
  )
}

export default Footer