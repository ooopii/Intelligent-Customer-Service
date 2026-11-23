//Create customer UI

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

function UserCreate() {
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('customer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const token = localStorage.getItem('access_token')

  // Submit user creation request
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!username.trim() || !password) {
      setError('enter username and password')
      return
    }

    if (!token) {
      setError('Session expired. Please log in again.')
      return
    }

    setLoading(true)

    try {
      const params = new URLSearchParams({
        username: username.trim(),
        password,
        role,
      })

      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/users?${params.toString()}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'User creation failed.')
      }

      // Return to the user list after successful creation.
      navigate('/admin/users', {
        state: { message: 'User created successfully.' },
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fieldStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '18px',
  }

  const inputStyle = {
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '6px',
    fontSize: '15px',
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '30px',
        boxSizing: 'border-box',
        backgroundColor: '#f5f7fb',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <button onClick={() => navigate('/admin/users')}>
          Return to the user list.
        </button>

        <div
          style={{
            marginTop: '24px',
            padding: '28px',
            backgroundColor: '#fff',
            border: '1px solid #ddd',
            borderRadius: '10px',
          }}
        >
          <h1>create user</h1>
          <p>enter new user's information</p>

          <form onSubmit={handleSubmit}>
            <div style={fieldStyle}>
              <label htmlFor="username">username</label>
              <input
                id="username"
                style={inputStyle}
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="enter username"
                autoComplete="off"
                required
              />
            </div>

            <div style={fieldStyle}>
              <label htmlFor="password">password</label>
              <input
                id="password"
                style={inputStyle}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter the initial password."
                autoComplete="new-password"
                required
              />
            </div>

            <div style={fieldStyle}>
              <label htmlFor="role">User Role</label>
              <select
                id="role"
                style={inputStyle}
                value={role}
                onChange={(e) => setRole(e.target.value)}
              >
                <option value="customer">customer</option>
                <option value="customer_service">customer service</option>
                <option value="admin">admin</option>
              </select>
            </div>

            {error && (
              <p style={{ color: 'red' }}>{error}</p>
            )}

            <div
              style={{
                display: 'flex',
                gap: '12px',
                marginTop: '24px',
              }}
            >
              <button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Confirm Creation'}
              </button>

              <button
                type="button"
                onClick={() => navigate('/admin/users')}
                disabled={loading}
              >
                cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default UserCreate
