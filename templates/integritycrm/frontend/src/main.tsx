import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeWrapper } from './ThemeWrapper'
import './index.css'
import { AppRoutes } from './routes/AppRoutes'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeWrapper>
        <AppRoutes />
      </ThemeWrapper>
    </BrowserRouter>
  </React.StrictMode>,
)
