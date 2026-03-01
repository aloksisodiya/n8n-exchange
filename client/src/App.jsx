import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { WorkflowProvider } from './context/WorkflowContext'
import Dashboard        from './pages/Dashboard'
import WorkflowBuilder  from './pages/WorkflowBuilder'
import ExecutionHistory from './pages/ExecutionHistory'

export default function App() {
  return (
    <WorkflowProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"                  element={<Dashboard />} />
          <Route path="/builder/:id"       element={<WorkflowBuilder />} />
          <Route path="/executions"        element={<ExecutionHistory />} />
          <Route path="*"                  element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </WorkflowProvider>
  )
}
