import { useEffect, useState } from 'react'
import './Chat.css'

function Chat() {
  const [sessions, setSessions] = useState([])
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const userId = localStorage.getItem('user_id')
  const username = localStorage.getItem('username')
  const role = localStorage.getItem('role')
  const token = localStorage.getItem('access_token')

  if (!userId) {
  window.location.href = '/'
  return null
}

  // Get historical sessions
  const loadSessions = async () => {
    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/v1/sessions', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

      if (!response.ok) {
        throw new Error('Failed to fetch historical sessions')
      }

      const data = await response.json()

      setSessions(data)

      // If historical sessions exist, open the first one by default.
      if (data.length > 0) {
        setCurrentSessionId(data[0].id)
      }
    } catch (error) {
      console.error('Failed to fetch historical sessions：', error)
    }
  }

  // Get messages for a specific session
  const loadMessages = async (sessionId) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/sessions/${sessionId}/messages`,
    {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to get message')
      }

      const data = await response.json()

      setMessages(data)
    } catch (error) {
      console.error('Failed to get message：', error)
    }
  }

  // Get historical sessions on page load
  useEffect(() => {
    loadSessions()
  }, [])

  // Load messages when switching sessions
  useEffect(() => {
    if (currentSessionId !== null) {
      loadMessages(currentSessionId)
    }
  }, [currentSessionId])

  // Create a new session
  const createNewSession = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/sessions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to create session')
      }

      const data = await response.json()

      setSessions((prev) => [data, ...prev])
      setCurrentSessionId(data.id)
      setMessages([])
    } catch (error) {
      console.error('Failed to create session：', error)
    }
  }

  // switchSession
  const switchSession = (id) => {
    setCurrentSessionId(id)
  }

  // sendMessage
  const sendMessage = async () => {
    if (!message.trim() || loading || currentSessionId === null) {
      return
    }

    const userMessage = message

    setMessage('')
    setLoading(true)

    // Display the user message on the page first.
    setMessages((prev) => [
      ...prev,
      {
        role: 'user',
        content: userMessage,
      },
    ])

    try {
      const response = await fetch(
        'http://127.0.0.1:8000/api/v1/chat',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            session_id: String(currentSessionId),
            message: userMessage,
          }),
        }
      )

      if (!response.ok) {
        throw new Error('Request failed')
      }

      const data = await response.json()

      console.log('Backend response:', data)

      // Add AI reply
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.answer,
        },
      ])

      //Update the left-side session title
      setSessions((prev) =>
        prev.map((session) =>
          session.id === currentSessionId
            ? {
                ...session,
                title:
                  session.title === 'new session'
                    ? userMessage.slice(0, 20)
                    : session.title,
              }
            : session
        )
      )
    } catch (error) {
      console.error('failed to send message：', error)

      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Request failed. Verify backend service status.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="chat-page">

      {/* Left-side historical sessions */}
      <div className="chat-sidebar">

        <button
          className="new-chat-button"
          onClick={createNewSession}
        >
          + create sessions
        </button>

        <div className="history-title">
          historical sessions
        </div>

        <div className="history-list">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`history-item ${
                session.id === currentSessionId
                  ? 'active'
                  : ''
              }`}
              onClick={() => switchSession(session.id)}
            >
              {session.title}
            </div>
          ))}
        </div>

      </div>

      {/* Right-side chat area */}
      <div className="chat-main">

        <div className="chat-header">
          <h2>AI Chatbot</h2>
        </div>

        <div className="message-list">

          {messages.length === 0 && (
            <div className="welcome">
              <h2>Hi, I'm intelligent Customer Service</h2>
              <p>
                Ask me anything.
              </p>
            </div>
          )}

          {messages.map((item, index) => (
            <div
              key={index}
              className={`message ${item.role}`}
            >
              <div className="message-content">
                {item.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="message assistant">
              <div className="message-content">
                Thinking...
              </div>
            </div>
          )}

        </div>

        <div className="input-area">

          <textarea
            placeholder="Please enter your question..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows="3"
          />

          <button
            onClick={sendMessage}
            disabled={loading || !message.trim() || currentSessionId === null}
          >
            {loading ? 'sending...' : 'send'}
          </button>

        </div>

      </div>
    </div>
  )
}

export default Chat