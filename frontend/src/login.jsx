
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import './login.css'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(
    location.state?.message || ''
  )

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!username.trim() || !password) {
      setError(' Enter username and password.')
      return
    }

    setLoading(true)

    try {
      const params = new URLSearchParams({
        username: username.trim(),
        password,
      })

      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/auth/login?${params.toString()}`,
        { method: 'POST' }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Failed. Try again.')
      }

      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('user_id', data.user_id)
      localStorage.setItem('username', data.username)
      localStorage.setItem('role', data.role)

      if (data.role === 'admin') {
        navigate('/admin')
      } else if (data.role === 'customer_service') {
        navigate('/staff')
      } else if (data.role === 'customer') {
        navigate('/chat')
      } else {
        setError('Unable to identify the user role')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <section className="auth-brand-panel">
          <div className="auth-brand-top">
            <div className="auth-brand-mark">AI</div>
            <div>
              <div className="auth-brand-name">CP5403</div>
              <div className="auth-brand-caption">
                Intelligent Customer Service
              </div>
            </div>
          </div>

          <div className="auth-brand-content">
            <div className="auth-brand-eyebrow">
              AI CUSTOMER SERVICE
            </div>
            <h1 className="auth-brand-title">
              Make every service
              <br />
              more intelligent
            </h1>
            <p className="auth-brand-description">
              Integrating LLMs with RAG，
              Provide efficient and natural intelligent dialogue experiences.
            </p>

            <div className="auth-brand-features">
              <div className="auth-brand-feature">
                <span className="auth-feature-check">✓</span>
                <span>Intelligent Question Answering and Multi-round Conversations</span>
              </div>
              <div className="auth-brand-feature">
                <span className="auth-feature-check">✓</span>
                <span>Knowledge base RAG</span>
              </div>
              <div className="auth-brand-feature">
                <span className="auth-feature-check">✓</span>
                <span>Secure account and permission management</span>
              </div>
            </div>
          </div>

          <div className="auth-brand-footer">
            Intelligent Customer Service System ·  Demonstration Interface
          </div>
        </section>

        <section className="auth-form-panel">
          <div className="auth-form-inner">
            <h2 className="auth-heading">welcome back</h2>
            <p className="auth-subtitle">
              Log in and enjoying the intelligent experience.
            </p>

            <form className="auth-form" onSubmit={handleLogin}>
              {success && (
                <p className="auth-message auth-success" role="status">
                  {success}
                </p>
              )}

              {error && (
                <p className="auth-message auth-error" role="alert">
                  {error}
                </p>
              )}

              <div className="auth-field">
                <label htmlFor="username">username</label>
                <input
                  id="username"
                  type="text"
                  placeholder="enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="password">password</label>
                <input
                  id="password"
                  type="password"
                  placeholder="enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>

              <button
                className="auth-button"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Logging in..' : 'Login your account'}
              </button>

              <div className="auth-switch">
                <span>No account?</span>
                <button
                  className="auth-link"
                  type="button"
                  onClick={() => navigate('/register')}
                >
                  register now
                </button>
              </div>
            </form>

            <div className="auth-security-note">
              Keep your account information safe and secure.
              <br />
              Demonstration interface for the intelligent customer service project.
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Login
