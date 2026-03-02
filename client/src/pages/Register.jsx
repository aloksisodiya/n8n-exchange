import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    const result = await register(formData.email, formData.password, formData.displayName)
    setLoading(false)

    if (result.success) {
      navigate('/', { replace: true })
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
            Create Account
          </h1>
          <p style={{ color: 'var(--text-faint)', fontSize: 14 }}>
            Get started with your workflow automation
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

        {/* Register Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 20 }}>
            <label style={{
              display: 'block',
              color: 'var(--text-secondary)',
              fontSize: 13,
              fontWeight: 500,
              marginBottom: 8,
            }}>
              Display Name
            </label>
            <input
              type="text"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
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
              placeholder="Your name"
            />
          </div>

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

          <div style={{ marginBottom: 20 }}>
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
              placeholder="Min. 6 characters"
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
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
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
              placeholder="Re-enter password"
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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Links */}
        <div style={{
          marginTop: 24,
          paddingTop: 24,
          borderTop: '1px solid var(--border)',
          textAlign: 'center',
          fontSize: 13,
          color: 'var(--text-faint)',
        }}>
          Already have an account?{' '}
          <Link
            to="/login"
            style={{
              color: 'var(--primary)',
              textDecoration: 'none',
              fontWeight: 500,
            }}
            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
