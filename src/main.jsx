import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import CircularProgress from '@mui/material/CircularProgress'
import theme from './theme'
import App from './App'
import './index.css'

const VideosProvider = React.lazy(() => import('@Context/Context').then(module => ({ default: module.VideosProvider })))
const NotificationProvider = React.lazy(() => import('@components/common/NotificationSystem/NotificationSystem').then(module => ({ default: module.NotificationProvider })))

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Suspense fallback={<CircularProgress />}>
        <VideosProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </VideosProvider>
      </Suspense>
    </ThemeProvider>
  </React.StrictMode>
)
