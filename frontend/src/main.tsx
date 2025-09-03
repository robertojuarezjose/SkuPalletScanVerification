import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material'
import { Toaster } from 'react-hot-toast'
import './index.css'
import App from './app/layout/App.tsx'
import { StoreContext, store } from './lib/stores/store.ts'

const queryClient = new QueryClient()
const theme = createTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <StoreContext.Provider value={store}>
            <App />
          </StoreContext.Provider>
        </BrowserRouter>
      </QueryClientProvider>
      <Toaster position="top-right" />
    </ThemeProvider>
  </StrictMode>,
)
