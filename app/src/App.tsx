import { BrowserRouter } from 'react-router-dom'

import './App.css'
import { ToastProvider } from './components/ui/use-toast'
import AppRoutes from './routes'

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </ToastProvider>
  )
}

export default App
