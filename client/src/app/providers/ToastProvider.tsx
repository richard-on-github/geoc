import { Toaster } from 'react-hot-toast'

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          fontFamily: 'var(--font-sans)',
          maxWidth: '420px',
        },
        success: {
          iconTheme: {
            primary: 'hsl(153 63% 38%)',
            secondary: '#fff',
          },
        },
        error: {
          duration: 5000,
          iconTheme: {
            primary: 'hsl(0 84.2% 60.2%)',
            secondary: '#fff',
          },
        },
      }}
    />
  )
}
