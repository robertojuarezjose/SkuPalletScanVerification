import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {  RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material'
import { ToastContainer } from 'react-toastify';
import './index.css'

import { StoreContext, store } from './lib/stores/store.ts'
import { router } from './app/router/Routes.tsx'

const queryClient = new QueryClient()
const theme = createTheme({
  palette: {
    background: {
      default: '#e3e7e9', // subtle body background for contrast with Paper
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <StoreContext.Provider value={store}>
        <QueryClientProvider client={queryClient}>
          
            
              <ToastContainer position='bottom-right' hideProgressBar theme='colored'></ToastContainer>
              <RouterProvider router={router} />
            
            
        </QueryClientProvider>
      </StoreContext.Provider>
    </ThemeProvider>
  </StrictMode>,
)
