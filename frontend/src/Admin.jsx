
import { useNavigate } from 'react-router-dom'

function Admin() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_id')
    localStorage.removeItem('username')
    localStorage.removeItem('role')
    window.location.href = '/'
  }

  const cardStyle = {
    padding: '24px',
    border: '1px solid #ddd',
    borderRadius: '10px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    textAlign: 'left',
    minWidth: '220px',
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '30px',
        }}
      >
        <div>
          <h1>Admin Backend</h1>
          <p>welcome，{localStorage.getItem('username')}</p>
        </div>

        <button onClick={handleLogout}>log out</button>
      </div>

      <h2>Feature Management</h2>
      <p>Please select the feature you need to use.</p>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          marginTop: '24px',
        }}
      >
        <button
          style={cardStyle}
          onClick={() => navigate('/admin/users')}
        >
          <h3>User Management</h3>
          <p>View, create, edit and delete users。</p>
          <span>Go to User Management →</span>
        </button>

        <button
          style={cardStyle}
          onClick={() => navigate('/admin/sessions')}
        >
          <h3>Session Management</h3>
          <p>View customer sessions and related chat history.</p>
          <span>Go to session Management →</span>
        </button>
      </div>
    </div>
  )
}

export default Admin
