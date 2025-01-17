import React from 'react'
import ReactDOM from 'react-dom/client'
import { VideosProvider } from './Context/Context.jsx'
import { NotificationProvider } from '@components/common/NotificationSystem'
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
        <NotificationProvider>
          <App />
        </NotificationProvider>
      </VideosProvider>
    </ThemeProvider>
  </React.StrictMode>
)
