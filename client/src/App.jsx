import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { WorkflowProvider } from './context/WorkflowContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard        from './pages/Dashboard'
import WorkflowBuilder  from './pages/WorkflowBuilder'
import ExecutionHistory from './pages/ExecutionHistory'

export default function App() {
  return (
    <AuthProvider>
      <WorkflowProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login"    element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/builder/:id" element={<ProtectedRoute><WorkflowBuilder /></ProtectedRoute>} />
            <Route path="/executions" element={<ProtectedRoute><ExecutionHistory /></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </WorkflowProvider>
    </AuthProvider>
  )
}
