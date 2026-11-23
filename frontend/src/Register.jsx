
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './login.css'

function Register() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')

    if (!username.trim()) {
      setError('enter username')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('The two passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const params = new URLSearchParams({
        username: username.trim(),
        password,
      })

      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/auth/register?${params.toString()}`,
        { method: 'POST' }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed. Please try again.')
      }

      navigate('/', {
        replace: true,
        state: { message: 'Registration successful. Please log in with your new account.' },
      })
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
                AI Chatbot Service
              </div>
            </div>
          </div>

          <div className="auth-brand-content">
            <div className="auth-brand-eyebrow">
              JOIN US
            </div>
            <h1 className="auth-brand-title">
              Begin your
              <br />
              intelligent service experience
            </h1>
            <p className="auth-brand-description">
              Create an account to experience the AI customer service powered by LLMs and RAG.
            </p>

            <div className="auth-brand-features">
              <div className="auth-brand-feature">
                <span className="auth-feature-check">✓</span>
                <span>Sign up easily and get started quickly.</span>
              </div>
              <div className="auth-brand-feature">
                <span className="auth-feature-check">✓</span>
                <span>Supports multi-turn natural language conversations</span>
              </div>
              <div className="auth-brand-feature">
                <span className="auth-feature-check">✓</span>
                <span>Provide intelligent answers to your questions.</span>
              </div>
            </div>
          </div>

          <div className="auth-brand-footer">
            AI Chatbot Service
          </div>
        </section>

        <section className="auth-form-panel">
          <div className="auth-form-inner">
            <h2 className="auth-heading">Create Account</h2>
            <p className="auth-subtitle">
              Fill in the information below to complete account registration.
            </p>

            <form className="auth-form" onSubmit={handleRegister}>
              {error && (
                <p className="auth-message auth-error" role="alert">
                  {error}
                </p>
              )}

              <div className="auth-field">
                <label htmlFor="register-username">username</label>
                <input
                  id="register-username"
                  type="text"
                  placeholder="enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  maxLength={50}
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="register-password">password</label>
                <input
                  id="register-password"
                  type="password"
                  placeholder="at least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              <div className="auth-field">
                <label htmlFor="confirm-password">confirm password</label>
                <input
                  id="confirm-password"
                  type="password"
                  placeholder="enter password again"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>

              <button
                className="auth-button"
                type="submit"
                disabled={loading}
              >
                {loading ? 'registering...' : 'creat account'}
              </button>

              <div className="auth-switch">
                <span>Have account already?</span>
                <button
                  className="auth-link"
                  type="button"
                  onClick={() => navigate('/')}
                >
                  Return to Login
                </button>
              </div>
            </form>

            <div className="auth-security-note">
              Registration creates a regular customer account.
              <br />
              This page is a interface for the AI chatbot project.
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Register
