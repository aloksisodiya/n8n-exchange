import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext()

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Failed to parse saved user:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password })
      const { user, token } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed'
      }
    }
  }

  const register = async (email, password, displayName) => {
    try {
      const response = await authAPI.register({ email, password, displayName })
      const { user, token } = response.data
      
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)
      
      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed'
      }
    }
  }

  const logout = async () => {
    try {
      if (user?.uid) {
        await authAPI.logout({ uid: user.uid })
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
    }
  }

  const resetPassword = async (email) => {
    try {
      const response = await authAPI.forgotPassword({ email })
      return {
        success: true,
        message: response.data.message,
        resetLink: response.data.resetLink // Only for dev/testing
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send reset email'
      }
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    resetPassword,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
