import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { TeamLogosProvider } from './context/TeamsContext'
import { Toaster } from 'react-hot-toast'
import AuthOverlay from './components/AuthOverlay'
import './index.css'

function ThemedToaster() {
  const isDark = document.documentElement.getAttribute('data-theme') !== 'light'
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: 'var(--bg-elevated)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border-input)',
          fontSize: '14px',
          boxShadow: 'var(--shadow-card)',
        },
        success: { iconTheme: { primary: '#22c55e', secondary: 'var(--bg-subtle)' } },
        error:   { iconTheme: { primary: '#ef4444', secondary: 'var(--bg-subtle)' } },
      }}
    />
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <TeamLogosProvider>
          <App />
          <AuthOverlay />
          <ThemedToaster />
        </TeamLogosProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
)
