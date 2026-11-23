//用户操作入口

import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

function UserList() {
  const navigate = useNavigate()
    const location = useLocation()

  const [users, setUsers] = useState([])
  const [page, setPage] = useState(1)
  const pageSize = 10
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState(
  location.state?.message || ''
)

  const token = localStorage.getItem('access_token')
  const currentUserId = Number(localStorage.getItem('user_id'))

  // 获取当前页的用户列表
  const fetchUsers = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/users?page=${page}&page_size=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to get user list')
      }

      setUsers(data.data)
      setTotal(data.total)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) {
      setError('Login first')
      setLoading(false)
      return
    }

    fetchUsers()
  }, [page, token])

  // logout
  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_id')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
    window.location.href = '/'
  }

  // delete user
  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete user ${user.username} ？`
    )

    if (!confirmed) return

    setMessage('')
    setError('')

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/users/${user.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to delete user')
      }

      setMessage('User deleted successfully.')

      // Refetch current page after deletion.
      const refreshResponse = await fetch(
        `http://127.0.0.1:8000/api/v1/users?page=${page}&page_size=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const refreshData = await refreshResponse.json()

      if (!refreshResponse.ok) {
        throw new Error(refreshData.detail || 'Failed to refresh user list.')
      }

      // If the current page has no users and it is not page one, go to the previous page.
      if (refreshData.data.length === 0 && page > 1) {
        setPage((currentPage) => currentPage - 1)
      } else {
        setUsers(refreshData.data)
        setTotal(refreshData.total)
      }
    } catch (err) {
      setError(err.message)
    }
  }

  const getRoleName = (role) => {
    const roles = {
      admin: 'admin',
      customer_service: 'customer service',
      customer: 'customer',
    }

    return roles[role] || role
  }

  const totalPages = Math.ceil(total / pageSize)

  const cellStyle = {
    border: '1px solid #ddd',
    padding: '12px',
    textAlign: 'left',
  }

  return (
    <div
      style={{
        padding: '30px',
        fontFamily: 'Arial, sans-serif',
        backgroundColor: '#f5f7fb',
        minHeight: '100vh',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h1>User Management</h1>
          <p>Admin:{localStorage.getItem('username')}</p>
          <p>Total user:{total}</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/admin')}>
            Return to Admin Home
          </button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <hr />

      <div style={{ margin: '20px 0' }}>
        <button onClick={() => navigate('/admin/users/create')}>
          + Add User
        </button>
      </div>

      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {loading && <p>loading user list...</p>}

      {!loading && !error && (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                backgroundColor: '#fff',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#e9edf5' }}>
                  <th style={cellStyle}>ID</th>
                  <th style={cellStyle}>username</th>
                  <th style={cellStyle}>role</th>
                  <th style={cellStyle}>creation time</th>
                  <th style={cellStyle}>Actions</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td style={cellStyle}>{user.id}</td>
                    <td style={cellStyle}>{user.username}</td>
                    <td style={cellStyle}>{getRoleName(user.role)}</td>
                    <td style={cellStyle}>
                      {user.created_at
                        ? new Date(user.created_at).toLocaleString()
                        : '-'}
                    </td>
                    <td style={cellStyle}>
                      <button
                        onClick={() =>
                          navigate(`/admin/users/${user.id}/edit`)
                        }
                        style={{ marginRight: '8px' }}
                      >
                        edit
                      </button>

                      <button
                        onClick={() => handleDeleteUser(user)}
                        disabled={user.id === currentUserId}
                      >
                        delete
                      </button>
                    </td>
                  </tr>
                ))}

                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} style={cellStyle}>
                      No user data found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '20px',
            }}
          >
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous page
            </button>

            <span>
              Page {page} / {Math.max(totalPages, 1)}
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next page
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export default UserList
