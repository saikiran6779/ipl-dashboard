import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { Toaster } from 'react-hot-toast'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#161b22',
          color: '#e6edf3',
          border: '1px solid #30363d',
          fontSize: '14px',
        },
        success: { iconTheme: { primary: '#22c55e', secondary: '#0d1117' } },
        error:   { iconTheme: { primary: '#ef4444', secondary: '#0d1117' } },
      }}
    />
  </React.StrictMode>
)
