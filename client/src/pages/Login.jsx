import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const from = location.state?.from?.pathname || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(formData.email, formData.password)
    setLoading(false)

    if (result.success) {
      navigate(from, { replace: true })
    } else {
      setError(result.message)
    }
  }

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-base)',
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 420,
        background: 'var(--bg-surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '40px',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4)',
      }}>
        {/* Logo/Title */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <h1 style={{
            fontSize: 28,
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: 8,
          }}>
            Welcome Back
          </h1>
          <p style={{ color: 'var(--text-faint)', fontSize: 14 }}>
            Sign in to your account to continue
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            background: '#ef444415',
            border: '1px solid #ef4444',
            color: '#ef4444',
            padding: '12px 16px',
            borderRadius: 'var(--radius-md)',
            fontSize: 13,
            marginBottom: 20,
          }}>
            {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              color: 'var(--text-secondary)',
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 8,
            }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoFocus
              style={{
                width: '100%',
                background: 'var(--bg-base)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                fontSize: 14,
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              placeholder="you@example.com"
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: 'block',
              color: 'var(--text-secondary)',
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 8,
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                background: 'var(--bg-base)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                fontSize: 14,
                color: 'var(--text-primary)',
                outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? 'var(--border)' : 'var(--primary)',
              color: '#fff',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '12px',
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s',
              opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => !loading && (e.target.style.opacity = 0.9)}
            onMouseLeave={(e) => !loading && (e.target.style.opacity = 1)}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Links */}
        <div style={{
          marginTop: 24,
          paddingTop: 24,
          borderTop: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          fontSize: 13,
          textAlign: 'center',
        }}>
          <Link
            to="/forgot-password"
            style={{
              color: 'var(--primary)',
              textDecoration: 'none',
            }}
            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
          >
            Forgot your password?
          </Link>
          
          <div style={{ color: 'var(--text-faint)' }}>
            Don't have an account?{' '}
            <Link
              to="/register"
              style={{
                color: 'var(--primary)',
                textDecoration: 'none',
                fontWeight: 500,
              }}
              onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
              onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
