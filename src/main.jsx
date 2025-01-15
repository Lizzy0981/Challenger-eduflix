import React from 'react'
import ReactDOM from 'react-dom/client'
import { VideosProvider } from './Context/Context.jsx'
import { NotificationSystem } from './components/NotificationSystem.jsx'  // Corregida la ruta
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import theme from './theme'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <VideosProvider>
        <NotificationSystem>
          <App />
        </NotificationSystem>
      </VideosProvider>
    </ThemeProvider>
  </React.StrictMode>
)
