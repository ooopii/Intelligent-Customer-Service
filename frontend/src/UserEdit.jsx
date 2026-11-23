import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function UserEdit() {
  const navigate = useNavigate()
  const { userId } = useParams()

  const [user, setUser] = useState(null)
  const [role, setRole] = useState('customer')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const token = localStorage.getItem('access_token')

  // 获取用户详细信息
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setError('Session expired. Please log in again.')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(
          `http://127.0.0.1:8000/api/v1/users/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.detail || 'Failed to fetch user info')
        }

        setUser(data)
        setRole(data.role)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [userId, token])

  // 保存修改
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!token) {
      setError('Session expired. Please log in again.')
      return
    }

    setSaving(true)

    try {
      const params = new URLSearchParams()
      params.set('role', role)

      // If the password field is left blank, the original password will not be changed.
      if (password.trim() !== '') {
        params.set('password', password)
      }

      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/users/${userId}?${params.toString()}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Update failed.')
      }

      navigate('/admin/users', {
        state: { message: 'User information updated successfully.' },
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
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

  if (loading) {
    return <div style={{ padding: '30px' }}>loading user's info...</div>
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
          return to user list
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
          <h1>Edit User</h1>

          {error && <p style={{ color: 'red' }}>{error}</p>}

          {user && (
            <form onSubmit={handleSubmit}>
              <div style={fieldStyle}>
                <label>user ID</label>
                <input
                  style={inputStyle}
                  value={user.id}
                  readOnly
                />
              </div>

              <div style={fieldStyle}>
                <label>username</label>
                <input
                  style={inputStyle}
                  value={user.username}
                  readOnly
                />
                <small>The current API does not support updating the username.</small>
              </div>

              <div style={fieldStyle}>
                <label>user role</label>
                <select
                  style={inputStyle}
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  <option value="customer">customer</option>
                  <option value="customer_service">customer service</option>
                  <option value="admin">admin</option>
                </select>
              </div>

              <div style={fieldStyle}>
                <label>Creation Time</label>
                <input
                  style={inputStyle}
                  value={
                    user.created_at
                      ? new Date(user.created_at).toLocaleString()
                      : '-'
                  }
                  readOnly
                />
              </div>

              <div style={fieldStyle}>
                <label>new password (optional)</label>
                <input
                  style={inputStyle}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep the current password."
                  autoComplete="new-password"
                />
              </div>

              {message && <p style={{ color: 'green' }}>{message}</p>}

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" disabled={saving}>
                  {saving ? 'saving' : 'Save Changes'}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/admin/users')}
                  disabled={saving}
                >
                  cancel
                </button>
              </div>
            </form>
          )}

          {!user && !error && <p>This user cannot be found.</p>}
        </div>
      </div>
    </div>
  )
}

export default UserEdit
