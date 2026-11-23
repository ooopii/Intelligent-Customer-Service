//Admin view session messages

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function SessionManage() {
  const navigate = useNavigate()

  const [sessions, setSessions] = useState([])
  const [messages, setMessages] = useState([])
  const [selectedSession, setSelectedSession] = useState(null)

  const [page, setPage] = useState(1)
  const pageSize = 10
  const [total, setTotal] = useState(0)

  const [loading, setLoading] = useState(false)
  const [messageLoading, setMessageLoading] = useState(false)
  const [error, setError] = useState('')

  const token = localStorage.getItem('access_token')

  // Get session list
  const fetchSessions = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/sessions/manage?page=${page}&page_size=${pageSize}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to get session list')
      }

      setSessions(Array.isArray(data) ? data : (data.data || []))
      setTotal(data.total ?? data.data?.length ?? data.length ?? 0)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!token) {
      setError('Session expired. Please log in again.')
      return
    }

    fetchSessions()
  }, [page, token])

  // view chat history for a specific session
  const handleViewMessages = async (session) => {
    setSelectedSession(session)
    setMessages([])
    setMessageLoading(true)
    setError('')

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/sessions/manage/${session.id}/messages`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to fetch chat history')
      }

      setMessages(
        Array.isArray(data) ? data : (data.messages || data.data || [])
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setMessageLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_id')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
    window.location.href = '/'
  }

  const cellStyle = {
    border: '1px solid #ddd',
    padding: '12px',
    textAlign: 'left',
  }

  const getSessionId = (session) =>
    session.id ?? session.session_id ?? '-'

  const getMessageContent = (message) =>
    message.content ?? message.message ?? message.text ?? ''

  const getMessageRole = (message) =>
    message.role ?? message.sender_role ?? message.sender ?? 'Unknown'

  const getTime = (value) => {
    if (!value) return '-'
    const date = new Date(value)
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString()
  }

  const totalPages = Math.ceil(total / pageSize)

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
          <h1>Session management</h1>
          <p>Admin：{localStorage.getItem('username')}</p>
          <p>Total Sessions:{total}</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/admin')}>
            Return to Admin Home
          </button>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <hr />

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px',
          marginTop: '20px',
          alignItems: 'start',
        }}
      >
        {/* Left-side Session List */}
        <div
          style={{
            backgroundColor: '#fff',
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '8px',
          }}
        >
          <h2>User Session List</h2>

          {loading && <p>Loading session list...</p>}

          {!loading && sessions.length === 0 && (
            <p>No sessions found.</p>
          )}

          {!loading &&
            sessions.map((session) => (
              <div
                key={getSessionId(session)}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  padding: '14px',
                  marginBottom: '12px',
                  backgroundColor:
                    selectedSession &&
                    String(getSessionId(selectedSession)) ===
                      String(getSessionId(session))
                      ? '#eef4ff'
                      : '#fff',
                }}
              >
                <p>
                  <strong>session ID：</strong>
                  {getSessionId(session)}
                </p>

                <p>
                  <strong>user ID：</strong>
                  {session.user_id ?? session.customer_id ?? '-'}
                </p>

                <p>
                  <strong>Creation Time:</strong>
                  {getTime(session.created_at)}
                </p>

                <button
                  onClick={() => handleViewMessages(session)}
                  disabled={messageLoading}
                >
                  View Chat History
                </button>
              </div>
            ))}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginTop: '20px',
              flexWrap: 'wrap',
            }}
          >
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous Page
            </button>

            <span>
              Page {page} / {Math.max(totalPages, 1)}
            </span>

            <button
              disabled={page >= totalPages || totalPages === 0}
              onClick={() => setPage((p) => p + 1)}
            >
              Next Page
            </button>
          </div>
        </div>

        {/* Right: Chat History */}
        <div
          style={{
            backgroundColor: '#fff',
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            minHeight: '300px',
          }}
        >
          <h2>Chat History</h2>

          {!selectedSession && (
            <p>Please select a conversation from the left first.</p>
          )}

          {selectedSession && (
            <>
              <p>
                Current Session ID：{getSessionId(selectedSession)}
              </p>

              {messageLoading && <p>Loading chat history...</p>}

              {!messageLoading && messages.length === 0 && (
                <p>No chat history for this session.</p>
              )}

              {!messageLoading &&
                messages.map((message, index) => (
                  <div
                    key={message.id ?? index}
                    style={{
                      padding: '12px',
                      marginBottom: '10px',
                      borderRadius: '6px',
                      backgroundColor: '#f5f7fb',
                      overflowWrap: 'anywhere',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: '10px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <strong>{getMessageRole(message)}</strong>
                      <small>{getTime(message.created_at)}</small>
                    </div>

                    <p style={{ whiteSpace: 'pre-wrap' }}>
                      {getMessageContent(message)}
                    </p>
                  </div>
                ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SessionManage
