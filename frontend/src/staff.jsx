
import { useEffect, useState } from 'react'

function Staff() {
  const [sessions, setSessions] = useState([])
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const [total, setTotal] = useState(0)

  const [selectedSession, setSelectedSession] = useState(null)
  const [messages, setMessages] = useState([])

  const [loadingSessions, setLoadingSessions] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [error, setError] = useState('')

  const token = localStorage.getItem('access_token')
  const totalPages = Math.ceil(total / pageSize)

  // Get all customer conversations
  useEffect(() => {
    const fetchSessions = async () => {
      setLoadingSessions(true)
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
          throw new Error(data.detail || 'Failed to get conversations')
        }

        setSessions(data.data)
        setTotal(data.total)
      } catch (error) {
        setError(error.message)
      } finally {
        setLoadingSessions(false)
      }
    }

    if (token) {
      fetchSessions()
    } else {
      setError('Login first')
    }
  }, [page, pageSize, token])

  // Load chat history on session click
  const handleSelectSession = async (session) => {
    setSelectedSession(session)
    setMessages([])
    setLoadingMessages(true)
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

      setMessages(data.messages)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoadingMessages(false)
    }
  }

  // Logout
  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_id')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
    window.location.href = '/'
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div>
          <h1 style={{ margin: 0 }}>staff workspace</h1>
          <p>welcome，{localStorage.getItem('username')}</p>
        </div>

        <button onClick={handleLogout}>logout</button>
      </header>

      {error && <p style={styles.error}>{error}</p>}

      <div style={styles.layout}>
        {/* left：sessions list */}
        <section style={styles.sidebar}>
          <h2>Customer Sessions</h2>
          <p>Total Sessions:{total}</p>

          {loadingSessions && <p>Loading session</p>}

          {!loadingSessions &&
            sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => handleSelectSession(session)}
                style={{
                  ...styles.sessionItem,
                  backgroundColor:
                    selectedSession?.id === session.id
                      ? '#e6f0ff'
                      : '#ffffff',
                }}
              >
                <strong>{session.title || `session ${session.id}`}</strong>
                <span>session ID：{session.id}</span>
                <span>customer ID：{session.user_id}</span>
                <span>
                  {session.created_at
                    ? new Date(session.created_at).toLocaleString()
                    : ''}
                </span>
              </button>
            ))}

          {!loadingSessions && sessions.length === 0 && (
            <p>No customer sessions found.</p>
          )}

          <div style={styles.pagination}>
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous Page
            </button>

            <span>
              {page} / {Math.max(totalPages, 1)}
            </span>

            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next Page
            </button>
          </div>
        </section>

        {/* right：chat history */}
        <section style={styles.chatPanel}>
          {selectedSession ? (
            <>
              <h2>
                {selectedSession.title || `session ${selectedSession.id}`}
              </h2>
              <p>customer ID：{selectedSession.user_id}</p>
              <hr />

              {loadingMessages && <p>loading chat history...</p>}

              {!loadingMessages && messages.length === 0 && (
                <p>This session has no chat history for now.</p>
              )}

              {!loadingMessages &&
                messages.map((message) => (
                  <div key={message.id} style={styles.message}>
                    <strong>
                      {message.role === 'user'
                        ? 'customer'
                        : message.role === 'assistant'
                          ? 'AI assistant'
                          : message.role}
                    </strong>

                    <p style={{ whiteSpace: 'pre-wrap' }}>
                      {message.content}
                    </p>

                    <small>
                      {message.created_at
                        ? new Date(message.created_at).toLocaleString()
                        : ''}
                    </small>
                  </div>
                ))}
            </>
          ) : (
            <div style={styles.empty}>
              <h2>select a customer session.</h2>
              <p>After selecting a session on the left, you can view the full chat history.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

const styles = {
  page: {
    padding: '24px',
    fontFamily: 'Arial, sans-serif',
    color: '#222',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '24px',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: '320px minmax(0, 1fr)',
    gap: '20px',
    alignItems: 'start',
  },
  sidebar: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '16px',
  },
  sessionItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    width: '100%',
    padding: '12px',
    marginBottom: '8px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    textAlign: 'left',
    cursor: 'pointer',
    color: '#222',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '8px',
    marginTop: '16px',
  },
  chatPanel: {
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '20px',
    minHeight: '500px',
    overflowWrap: 'anywhere',
  },
  message: {
    border: '1px solid #eee',
    borderRadius: '8px',
    padding: '12px',
    margin: '12px 0',
    backgroundColor: '#fafafa',
  },
  empty: {
    textAlign: 'center',
    padding: '100px 20px',
    color: '#666',
  },
  error: {
    color: '#c62828',
    marginBottom: '16px',
  },
}

export default Staff